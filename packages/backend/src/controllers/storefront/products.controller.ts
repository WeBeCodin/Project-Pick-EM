import { Request, Response, NextFunction } from 'express';
import { productService } from '../../services/storefront/product.service';
import { logger } from '../../utils/logger';

/**
 * Products Controller
 * Handles HTTP requests for product operations
 */
export class ProductsController {
  /**
   * GET /api/v1/products
   * Get all products with filtering and pagination
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        categoryId,
        brand,
        inStock,
        isFeatured,
        isActive,
        minPrice,
        maxPrice,
        search,
        page = '1',
        perPage = '20',
        sortBy = 'sortOrder',
        sortOrder = 'asc',
      } = req.query;

      const filters = {
        categoryId: categoryId as string,
        brand: brand as string,
        inStock: inStock === 'true' ? true : inStock === 'false' ? false : undefined,
        isFeatured: isFeatured === 'true' ? true : isFeatured === 'false' ? false : undefined,
        isActive: isActive === 'false' ? false : true,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        search: search as string,
      };

      const options = {
        page: parseInt(page as string, 10),
        perPage: parseInt(perPage as string, 10),
        sortBy: sortBy as any,
        sortOrder: sortOrder as any,
      };

      const result = await productService.getProducts(filters, options);

      res.status(200).json({
        success: true,
        data: result.products,
        pagination: {
          page: result.page,
          perPage: result.perPage,
          total: result.total,
          totalPages: Math.ceil(result.total / result.perPage),
        },
      });
    } catch (error: any) {
      logger.error('Failed to fetch products', error);
      next(error);
    }
  }

  /**
   * GET /api/v1/products/:id
   * Get a single product by ID
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const product = await productService.getProductById(id);

      if (!product) {
        res.status(404).json({
          success: false,
          error: 'Product not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      logger.error('Failed to fetch product', error);
      next(error);
    }
  }

  /**
   * GET /api/v1/products/sku/:sku
   * Get a single product by SKU
   */
  async getBySku(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sku } = req.params;

      const product = await productService.getProductBySku(sku);

      if (!product) {
        res.status(404).json({
          success: false,
          error: 'Product not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      logger.error('Failed to fetch product by SKU', error);
      next(error);
    }
  }

  /**
   * POST /api/v1/products
   * Create a new product (Admin only)
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body;

      // Validate required fields
      if (!data.sku || !data.name || !data.categoryId || data.price === undefined) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: sku, name, categoryId, price',
        });
        return;
      }

      const product = await productService.createProduct(data);

      res.status(201).json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      logger.error('Failed to create product', error);
      next(error);
    }
  }

  /**
   * PUT /api/v1/products/:id
   * Update a product (Admin only)
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;

      const product = await productService.updateProduct(id, data);

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      logger.error('Failed to update product', error);
      next(error);
    }
  }

  /**
   * DELETE /api/v1/products/:id
   * Delete a product (Admin only)
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      await productService.deleteProduct(id);

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error: any) {
      logger.error('Failed to delete product', error);
      next(error);
    }
  }
}

export const productsController = new ProductsController();
