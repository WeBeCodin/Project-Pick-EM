import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../../services/storefront/category.service';
import { logger } from '../../utils/logger';

/**
 * Categories Controller
 * Handles HTTP requests for category operations
 */
export class CategoriesController {
  /**
   * GET /api/v1/categories
   * Get all categories
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { includeInactive } = req.query;
      const onlyActive = includeInactive !== 'true';

      const categories = await categoryService.getCategories(onlyActive);

      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error: any) {
      logger.error('Failed to fetch categories', error);
      next(error);
    }
  }

  /**
   * GET /api/v1/categories/:id
   * Get a single category by ID
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const category = await categoryService.getCategoryById(id);

      if (!category) {
        res.status(404).json({
          success: false,
          error: 'Category not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error: any) {
      logger.error('Failed to fetch category', error);
      next(error);
    }
  }

  /**
   * GET /api/v1/categories/slug/:slug
   * Get a single category by slug
   */
  async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;

      const category = await categoryService.getCategoryBySlug(slug);

      if (!category) {
        res.status(404).json({
          success: false,
          error: 'Category not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error: any) {
      logger.error('Failed to fetch category by slug', error);
      next(error);
    }
  }

  /**
   * POST /api/v1/categories
   * Create a new category (Admin only)
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body;

      // Validate required fields
      if (!data.name) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: name',
        });
        return;
      }

      const category = await categoryService.createCategory(data);

      res.status(201).json({
        success: true,
        data: category,
      });
    } catch (error: any) {
      logger.error('Failed to create category', error);
      next(error);
    }
  }

  /**
   * PUT /api/v1/categories/:id
   * Update a category (Admin only)
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;

      const category = await categoryService.updateCategory(id, data);

      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error: any) {
      logger.error('Failed to update category', error);
      next(error);
    }
  }

  /**
   * DELETE /api/v1/categories/:id
   * Delete a category (Admin only)
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      await categoryService.deleteCategory(id);

      res.status(200).json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error: any) {
      logger.error('Failed to delete category', error);
      next(error);
    }
  }
}

export const categoriesController = new CategoriesController();
