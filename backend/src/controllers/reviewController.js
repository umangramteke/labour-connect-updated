const Review = require('../models/Review');
const User = require('../models/User');
const Job = require('../models/Job');
const ServiceRequest = require('../models/ServiceRequest');
const { getNextSequenceValue } = require('../models/Counter');
const { createPageResponse } = require('../utils/pagination');
const ApiResponse = require('../utils/apiResponse');
const { logEvent } = require('../utils/auditLogger');

// Helper: map Review to DTO
async function mapReviewToDto(r, reviewer, reviewee, job, serviceRequest) {
  if (!reviewer) reviewer = await User.findOne({ id: r.reviewerId });
  if (!reviewee) reviewee = await User.findOne({ id: r.revieweeId });
  if (r.jobId && !job) job = await Job.findOne({ id: r.jobId });
  if (r.serviceRequestId && !serviceRequest) serviceRequest = await ServiceRequest.findOne({ id: r.serviceRequestId });

  return {
    id: r.id,
    reviewerId: r.reviewerId,
    reviewerName: reviewer ? reviewer.fullName : '',
    revieweeId: r.revieweeId,
    revieweeName: reviewee ? reviewee.fullName : '',
    jobId: r.jobId || null,
    jobTitle: job ? job.title : null,
    serviceRequestId: r.serviceRequestId || null,
    serviceTitle: serviceRequest ? serviceRequest.title : null,
    rating: r.rating,
    reviewText: r.reviewText || '',
    createdAt: r.createdAt
  };
}

// POST /api/v1/reviews
async function createReview(req, res, next) {
  try {
    const reviewerUserId = req.user.id;
    const { revieweeId, jobId, serviceRequestId, rating, reviewText } = req.body;

    if (!revieweeId || rating == null) {
      return res.status(400).json(ApiResponse.error('Reviewee ID and rating are required.'));
    }

    if (reviewerUserId === Number(revieweeId)) {
      return res.status(400).json(ApiResponse.error('Self-reviews are not permitted.'));
    }

    const reviewee = await User.findOne({ id: Number(revieweeId) });
    if (!reviewee) {
      return res.status(404).json(ApiResponse.error('Reviewee user not found'));
    }

    let jobObj = null;
    let srObj = null;

    if (jobId) {
      jobObj = await Job.findOne({ id: Number(jobId) });
      if (!jobObj) {
        return res.status(404).json(ApiResponse.error('Job not found: ' + jobId));
      }

      const existing = await Review.findOne({ reviewerId: reviewerUserId, jobId: jobObj.id });
      if (existing) {
        return res.status(400).json(ApiResponse.error('You have already submitted a review for this employment engagement.'));
      }
    } else if (serviceRequestId) {
      srObj = await ServiceRequest.findOne({ id: Number(serviceRequestId) });
      if (!srObj) {
        return res.status(404).json(ApiResponse.error('Service request not found: ' + serviceRequestId));
      }

      if (srObj.status !== 'COMPLETED') {
        return res.status(400).json(ApiResponse.error('Reviews can only be submitted for completed service requests.'));
      }

      const existing = await Review.findOne({ reviewerId: reviewerUserId, serviceRequestId: srObj.id });
      if (existing) {
        return res.status(400).json(ApiResponse.error('You have already submitted a review for this service transaction.'));
      }
    } else {
      return res.status(400).json(ApiResponse.error('Review must be associated with either an eligible Job or Service Request.'));
    }

    const id = await getNextSequenceValue('reviews');
    const review = await Review.create({
      id,
      reviewerId: reviewerUserId,
      revieweeId: reviewee.id,
      jobId: jobObj ? jobObj.id : null,
      serviceRequestId: srObj ? srObj.id : null,
      rating: Number(rating),
      reviewText: reviewText || ''
    });

    await logEvent(req.user, 'CREATE_REVIEW', 'Review', review.id, `Review submitted for user ${reviewee.email}`, req);

    const dto = await mapReviewToDto(review, req.user, reviewee, jobObj, srObj);
    return res.status(200).json(ApiResponse.ok(dto, 'Review submitted successfully.'));
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/reviews/user/:userId
async function getReviewsForUser(req, res, next) {
  try {
    const targetUserId = Number(req.params.userId);
    const page = parseInt(req.query.page, 10) || 0;
    const size = parseInt(req.query.size, 10) || 10;

    const totalElements = await Review.countDocuments({ revieweeId: targetUserId });
    const reviews = await Review.find({ revieweeId: targetUserId })
      .sort({ createdAt: -1 })
      .skip(page * size)
      .limit(size);

    const reviewerIds = [...new Set(reviews.map((r) => r.reviewerId))];
    const reviewers = await User.find({ id: { $in: reviewerIds } });
    const reviewerMap = new Map(reviewers.map((u) => [u.id, u]));

    const targetUser = await User.findOne({ id: targetUserId });

    const dtos = await Promise.all(
      reviews.map((r) => mapReviewToDto(r, reviewerMap.get(r.reviewerId), targetUser, null, null))
    );

    const pageResponse = createPageResponse(dtos, totalElements, page, size);
    return res.status(200).json(ApiResponse.ok(pageResponse));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createReview,
  getReviewsForUser,
  mapReviewToDto
};

