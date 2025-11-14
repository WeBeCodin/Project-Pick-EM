import { Router } from 'express';
import { productsController } from '../../controllers/storefront/products.controller';

const router = Router();

/**
 * Products Routes
 * /api/v1/products
 */

// Public routes
router.get('/', productsController.getAll.bind(productsController));
router.get('/sku/:sku', productsController.getBySku.bind(productsController));
router.get('/:id', productsController.getById.bind(productsController));

// Admin routes (TODO: Add authentication middleware)
router.post('/', productsController.create.bind(productsController));
router.put('/:id', productsController.update.bind(productsController));
router.delete('/:id', productsController.delete.bind(productsController));

export default router;
