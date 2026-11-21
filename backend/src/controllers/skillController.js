const Skill = require('../models/Skill');
const ApiResponse = require('../utils/apiResponse');

// GET /api/v1/skills
async function getSkills(req, res, next) {
  try {
    const { category } = req.query;
    const filter = category && category.trim() ? { category: category.trim() } : {};
    const skills = await Skill.find(filter).sort({ id: 1 });

    const result = skills.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      description: s.description
    }));

    return res.status(200).json(ApiResponse.ok(result));
  } catch (err) {
    next(err);
  }
}

module.exports = { getSkills };

