import { Router } from 'express';
import { categoriesController } from '../../controllers/storefront/categories.controller';

const router = Router();

/**
 * Categories Routes
 * /api/v1/categories
 */

// Public routes
router.get('/', categoriesController.getAll.bind(categoriesController));
router.get('/slug/:slug', categoriesController.getBySlug.bind(categoriesController));
router.get('/:id', categoriesController.getById.bind(categoriesController));

// Admin routes (TODO: Add authentication middleware)
router.post('/', categoriesController.create.bind(categoriesController));
router.put('/:id', categoriesController.update.bind(categoriesController));
router.delete('/:id', categoriesController.delete.bind(categoriesController));

export default router;
