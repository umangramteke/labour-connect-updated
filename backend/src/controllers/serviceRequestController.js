const ServiceRequest = require('../models/ServiceRequest');
const CustomerProfile = require('../models/CustomerProfile');
const ProviderProfile = require('../models/ProviderProfile');
const ServiceCategory = require('../models/ServiceCategory');
const User = require('../models/User');
const { getNextSequenceValue } = require('../models/Counter');
const { createPageResponse } = require('../utils/pagination');
const ApiResponse = require('../utils/apiResponse');
const { logEvent } = require('../utils/auditLogger');

// Helper: map ServiceRequest to DTO
async function mapRequestToDto(req, customer, provider, category) {
  if (!customer) customer = await CustomerProfile.findOne({ id: req.customerId });
  const customerUser = customer ? await User.findOne({ id: customer.userId }) : null;

  if (!provider) provider = await ProviderProfile.findOne({ id: req.providerId });
  const providerUser = provider ? await User.findOne({ id: provider.userId }) : null;

  if (!category) category = await ServiceCategory.findOne({ id: req.categoryId });

  return {
    id: req.id,
    customerId: req.customerId,
    customerUserId: customer ? customer.userId : null,
    customerName: customerUser ? customerUser.fullName : '',
    customerPhone: customerUser ? customerUser.phoneNumber : '',
    customerAddress: customer ? customer.address : '',
    providerId: req.providerId,
    providerUserId: provider ? provider.userId : null,
    providerBusinessName: provider ? provider.businessName : '',
    providerPhone: providerUser ? providerUser.phoneNumber : '',
    providerVerificationStatus: provider ? provider.verificationStatus : 'PENDING',
    categoryId: req.categoryId,
    categoryName: category ? category.name : '',
    title: req.title,
    description: req.description,
    serviceAddress: req.serviceAddress,
    city: req.city,
    latitude: req.latitude,
    longitude: req.longitude,
    scheduledAt: req.scheduledAt,
    estimatedCost: req.estimatedCost,
    finalCost: req.finalCost,
    status: req.status,
    rejectionReason: req.rejectionReason,
    cancellationReason: req.cancellationReason,
    createdAt: req.createdAt
  };
}

// State transition validation
function validateStateTransition(from, to) {
  switch (from) {
    case 'REQUESTED':
      return to === 'ACCEPTED' || to === 'REJECTED';
    case 'ACCEPTED':
      return to === 'ON_THE_WAY' || to === 'CANCELLED';
    case 'ON_THE_WAY':
      return to === 'SERVICE_STARTED';
    case 'SERVICE_STARTED':
      return to === 'COMPLETED';
    default:
      return false;
  }
}

// POST /api/v1/requests
async function createRequest(req, res, next) {
  try {
    const customer = await CustomerProfile.findOne({ userId: req.user.id });
    if (!customer) {
      return res.status(400).json(ApiResponse.error('Customer profile required before submitting requests.'));
    }

    const { providerId, categoryId, title, description, serviceAddress, city, latitude, longitude, scheduledAt, estimatedCost } = req.body;

    if (!providerId || !categoryId || !title || !description || !serviceAddress || !city) {
      return res.status(400).json(ApiResponse.error('Missing required request fields'));
    }

    let provider = await ProviderProfile.findOne({ id: Number(providerId) });
    if (!provider) {
      provider = await ProviderProfile.findOne({ userId: Number(providerId) });
    }
    if (!provider) {
      return res.status(404).json(ApiResponse.error('Provider not found with id: ' + providerId));
    }

    if (!provider.available) {
      return res.status(400).json(ApiResponse.error('This service provider is currently marked as unavailable.'));
    }

    const category = await ServiceCategory.findOne({ id: Number(categoryId) });
    if (!category) {
      return res.status(404).json(ApiResponse.error('Category not found with id: ' + categoryId));
    }

    const id = await getNextSequenceValue('service_requests');
    const serviceRequest = await ServiceRequest.create({
      id,
      customerId: customer.id,
      providerId: provider.id,
      categoryId: category.id,
      title: title.trim(),
      description: description.trim(),
      serviceAddress: serviceAddress.trim(),
      city: city.trim(),
      latitude: latitude != null ? Number(latitude) : null,
      longitude: longitude != null ? Number(longitude) : null,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      estimatedCost: estimatedCost != null ? Number(estimatedCost) : provider.baseRate,
      status: 'REQUESTED'
    });

    await logEvent(req.user, 'CREATE_SERVICE_REQUEST', 'ServiceRequest', serviceRequest.id, `Service request created: ${serviceRequest.title}`, req);

    const dto = await mapRequestToDto(serviceRequest, customer, provider, category);
    return res.status(200).json(ApiResponse.ok(dto, 'Service request booked successfully.'));
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/requests/my-requests
async function getCustomerRequests(req, res, next) {
  try {
    const customer = await CustomerProfile.findOne({ userId: req.user.id });
    if (!customer) {
      return res.status(404).json(ApiResponse.error('Customer profile not found.'));
    }

    const { status, categoryId, query } = req.query;
    const page = parseInt(req.query.page, 10) || 0;
    const size = parseInt(req.query.size, 10) || 10;

    const filter = { customerId: customer.id };
    if (status && status.trim() && status.trim().toUpperCase() !== 'ALL') {
      filter.status = status.trim().toUpperCase();
    }
    if (categoryId && !isNaN(categoryId)) {
      filter.categoryId = Number(categoryId);
    }

    let requests = await ServiceRequest.find(filter).sort({ createdAt: -1 });

    if (query && query.trim()) {
      const qLower = query.trim().toLowerCase();
      const provIds = requests.map((r) => r.providerId);
      const provs = await ProviderProfile.find({ id: { $in: provIds } });
      const provMap = new Map(provs.map((p) => [p.id, p]));

      requests = requests.filter((r) => {
        const p = provMap.get(r.providerId);
        const titleMatch = r.title && r.title.toLowerCase().includes(qLower);
        const descMatch = r.description && r.description.toLowerCase().includes(qLower);
        const cityMatch = r.city && r.city.toLowerCase().includes(qLower);
        const provMatch = p && p.businessName && p.businessName.toLowerCase().includes(qLower);
        return titleMatch || descMatch || cityMatch || provMatch;
      });
    }

    const totalElements = requests.length;
    const paginated = requests.slice(page * size, (page + 1) * size);

    const dtos = await Promise.all(paginated.map((r) => mapRequestToDto(r, customer, null, null)));
    const pageResponse = createPageResponse(dtos, totalElements, page, size);

    return res.status(200).json(ApiResponse.ok(pageResponse));
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/requests/provider-requests
async function getProviderRequests(req, res, next) {
  try {
    const provider = await ProviderProfile.findOne({ userId: req.user.id });
    if (!provider) {
      return res.status(404).json(ApiResponse.error('Provider profile not found.'));
    }

    const { status, categoryId, query } = req.query;
    const page = parseInt(req.query.page, 10) || 0;
    const size = parseInt(req.query.size, 10) || 10;

    const filter = { providerId: provider.id };
    if (status && status.trim() && status.trim().toUpperCase() !== 'ALL') {
      filter.status = status.trim().toUpperCase();
    }
    if (categoryId && !isNaN(categoryId)) {
      filter.categoryId = Number(categoryId);
    }

    let requests = await ServiceRequest.find(filter).sort({ createdAt: -1 });

    if (query && query.trim()) {
      const qLower = query.trim().toLowerCase();
      const custIds = requests.map((r) => r.customerId);
      const custs = await CustomerProfile.find({ id: { $in: custIds } });
      const custUserIds = custs.map((c) => c.userId);
      const users = await User.find({ id: { $in: custUserIds } });
      const userMap = new Map(users.map((u) => [u.id, u]));
      const custMap = new Map(custs.map((c) => [c.id, c]));

      requests = requests.filter((r) => {
        const c = custMap.get(r.customerId);
        const u = c ? userMap.get(c.userId) : null;
        const titleMatch = r.title && r.title.toLowerCase().includes(qLower);
        const descMatch = r.description && r.description.toLowerCase().includes(qLower);
        const cityMatch = r.city && r.city.toLowerCase().includes(qLower);
        const custMatch = u && u.fullName && u.fullName.toLowerCase().includes(qLower);
        return titleMatch || descMatch || cityMatch || custMatch;
      });
    }

    const totalElements = requests.length;
    const paginated = requests.slice(page * size, (page + 1) * size);

    const dtos = await Promise.all(paginated.map((r) => mapRequestToDto(r, null, provider, null)));
    const pageResponse = createPageResponse(dtos, totalElements, page, size);

    return res.status(200).json(ApiResponse.ok(pageResponse));
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/requests/:id
async function getRequestById(req, res, next) {
  try {
    const requestId = Number(req.params.id);
    const serviceRequest = await ServiceRequest.findOne({ id: requestId });
    if (!serviceRequest) {
      return res.status(404).json(ApiResponse.error('Service request not found: ' + requestId));
    }

    const customer = await CustomerProfile.findOne({ id: serviceRequest.customerId });
    const provider = await ProviderProfile.findOne({ id: serviceRequest.providerId });

    const isCustomer = customer && customer.userId === req.user.id;
    const isProvider = provider && provider.userId === req.user.id;
    const isAdmin = req.user.roles.includes('ROLE_ADMIN');

    if (!isCustomer && !isProvider && !isAdmin) {
      return res.status(403).json(ApiResponse.error('Unauthorized: You do not have access to this service request.'));
    }

    const dto = await mapRequestToDto(serviceRequest, customer, provider, null);
    return res.status(200).json(ApiResponse.ok(dto));
  } catch (err) {
    next(err);
  }
}

// PUT /api/v1/requests/:id/status
async function updateStatus(req, res, next) {
  try {
    const requestId = Number(req.params.id);
    const serviceRequest = await ServiceRequest.findOne({ id: requestId });
    if (!serviceRequest) {
      return res.status(404).json(ApiResponse.error('Service request not found: ' + requestId));
    }

    const provider = await ProviderProfile.findOne({ id: serviceRequest.providerId });
    if (!provider || provider.userId !== req.user.id) {
      return res.status(403).json(ApiResponse.error('Unauthorized: You are not the assigned provider for this request.'));
    }

    const currentStatus = serviceRequest.status;
    const nextStatus = (req.body.status || '').toUpperCase();

    if (!validateStateTransition(currentStatus, nextStatus)) {
      return res.status(400).json(ApiResponse.error(`Illegal status transition from '${currentStatus}' to '${nextStatus}'.`));
    }

    serviceRequest.status = nextStatus;
    if (nextStatus === 'REJECTED' && req.body.reason) {
      serviceRequest.rejectionReason = req.body.reason;
    }
    if (nextStatus === 'COMPLETED' && req.body.finalCost != null) {
      serviceRequest.finalCost = Number(req.body.finalCost);
    }

    await serviceRequest.save();
    await logEvent(req.user, 'UPDATE_SERVICE_STATUS', 'ServiceRequest', serviceRequest.id, `Status changed to ${nextStatus}`, req);

    const dto = await mapRequestToDto(serviceRequest, null, provider, null);
    return res.status(200).json(ApiResponse.ok(dto, 'Service request status updated.'));
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/requests/:id/cancel
async function cancelRequest(req, res, next) {
  try {
    const requestId = Number(req.params.id);
    const serviceRequest = await ServiceRequest.findOne({ id: requestId });
    if (!serviceRequest) {
      return res.status(404).json(ApiResponse.error('Service request not found: ' + requestId));
    }

    const customer = await CustomerProfile.findOne({ id: serviceRequest.customerId });
    if (!customer || customer.userId !== req.user.id) {
      return res.status(403).json(ApiResponse.error('Unauthorized: You can only cancel your own service requests.'));
    }

    if (serviceRequest.status !== 'REQUESTED' && serviceRequest.status !== 'ACCEPTED') {
      return res.status(400).json(ApiResponse.error(`Request cannot be cancelled once work is in progress (Current status: ${serviceRequest.status}).`));
    }

    const reason = req.query.reason || req.body.reason || 'Cancelled by customer';
    serviceRequest.status = 'CANCELLED';
    serviceRequest.cancellationReason = reason;

    await serviceRequest.save();
    await logEvent(req.user, 'CANCEL_SERVICE_REQUEST', 'ServiceRequest', serviceRequest.id, 'Request cancelled by customer', req);

    const dto = await mapRequestToDto(serviceRequest, customer, null, null);
    return res.status(200).json(ApiResponse.ok(dto, 'Service request cancelled.'));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createRequest,
  getCustomerRequests,
  getProviderRequests,
  getRequestById,
  updateStatus,
  cancelRequest
};

