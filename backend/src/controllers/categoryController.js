const ServiceCategory = require('../models/ServiceCategory');
const { getNextSequenceValue } = require('../models/Counter');
const ApiResponse = require('../utils/apiResponse');

// GET /api/v1/categories
async function getCategories(req, res, next) {
  try {
    const activeOnly = req.query.activeOnly !== 'false';
    const filter = activeOnly ? { active: true } : {};
    const categories = await ServiceCategory.find(filter).sort({ id: 1 });

    const dtos = categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      iconName: c.iconName,
      description: c.description,
      active: c.active,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    }));

    return res.status(200).json(ApiResponse.ok(dtos));
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/categories (ADMIN)
async function createCategory(req, res, next) {
  try {
    let { name, slug, iconName, description, active } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json(ApiResponse.error('Category name is required'));
    }

    if (!slug || !slug.trim()) {
      slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const existing = await ServiceCategory.findOne({ slug });
    if (existing) {
      return res.status(400).json(ApiResponse.error('A category with this name already exists.'));
    }

    const id = await getNextSequenceValue('service_categories');
    const cat = await ServiceCategory.create({
      id,
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      iconName: iconName || 'Wrench',
      description: description || '',
      active: active !== undefined ? Boolean(active) : true
    });

    return res.status(200).json(ApiResponse.ok({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      iconName: cat.iconName,
      description: cat.description,
      active: cat.active
    }, 'Category created successfully.'));
  } catch (err) {
    next(err);
  }
}

// PUT /api/v1/categories/:id (ADMIN)
async function updateCategory(req, res, next) {
  try {
    const catId = Number(req.params.id);
    const { name, slug, iconName, description, active } = req.body;

    const cat = await ServiceCategory.findOne({ id: catId });
    if (!cat) {
      return res.status(404).json(ApiResponse.error('Category not found'));
    }

    if (name) cat.name = name.trim();
    if (slug) cat.slug = slug.trim().toLowerCase();
    if (iconName !== undefined) cat.iconName = iconName;
    if (description !== undefined) cat.description = description;
    if (active !== undefined) cat.active = Boolean(active);

    await cat.save();

    return res.status(200).json(ApiResponse.ok({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      iconName: cat.iconName,
      description: cat.description,
      active: cat.active
    }, 'Category updated successfully.'));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCategories,
  createCategory,
  updateCategory
};

