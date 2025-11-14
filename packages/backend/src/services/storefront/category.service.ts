import { prisma } from '../../database';
import { logger } from '../../utils/logger';
import { AppError } from '../../utils/errors';
import { Category } from '@prisma/client';

export interface CreateCategoryDto {
  name: string;
  description?: string;
  imageUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

export interface CategoryWithProductCount extends Category {
  _count: {
    products: number;
  };
}

/**
 * Category Service
 * Handles category management for the JustArms storefront
 */
class CategoryService {
  /**
   * Get all categories with product counts
   */
  async getCategories(
    onlyActive: boolean = true
  ): Promise<CategoryWithProductCount[]> {
    try {
      const categories = await prisma.category.findMany({
        where: onlyActive ? { isActive: true } : undefined,
        orderBy: [
          { sortOrder: 'asc' },
          { name: 'asc' },
        ],
        include: {
          _count: {
            select: { products: true },
          },
        },
      });

      logger.info(`Retrieved ${categories.length} categories`);

      return categories;
    } catch (error) {
      logger.error('Error fetching categories:', error);
      throw new AppError('Failed to fetch categories', 500);
    }
  }

  /**
   * Get a single category by ID
   */
  async getCategoryById(id: string): Promise<CategoryWithProductCount | null> {
    try {
      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          _count: {
            select: { products: true },
          },
        },
      });

      return category;
    } catch (error) {
      logger.error('Error fetching category:', error);
      throw new AppError('Failed to fetch category', 500);
    }
  }

  /**
   * Get a single category by slug
   */
  async getCategoryBySlug(slug: string): Promise<CategoryWithProductCount | null> {
    try {
      const category = await prisma.category.findUnique({
        where: { slug },
        include: {
          _count: {
            select: { products: true },
          },
        },
      });

      return category;
    } catch (error) {
      logger.error('Error fetching category by slug:', error);
      throw new AppError('Failed to fetch category', 500);
    }
  }

  /**
   * Create a new category
   */
  async createCategory(data: CreateCategoryDto): Promise<Category> {
    try {
      logger.info('Creating category', { name: data.name });

      // Generate slug from name
      const slug = this.generateSlug(data.name);

      // Check if slug already exists
      const existingCategory = await prisma.category.findUnique({
        where: { slug },
      });

      if (existingCategory) {
        throw new AppError('Category with this name already exists', 400);
      }

      const category = await prisma.category.create({
        data: {
          name: data.name,
          slug,
          description: data.description,
          imageUrl: data.imageUrl,
          sortOrder: data.sortOrder ?? 0,
          isActive: data.isActive ?? true,
        },
      });

      logger.info('Category created', { id: category.id, slug: category.slug });

      return category;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error creating category:', error);
      throw new AppError('Failed to create category', 500);
    }
  }

  /**
   * Update a category
   */
  async updateCategory(id: string, data: UpdateCategoryDto): Promise<Category> {
    try {
      logger.info('Updating category', { id });

      // Verify category exists
      const existingCategory = await prisma.category.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        throw new AppError('Category not found', 404);
      }

      // Update slug if name changes
      let slug = existingCategory.slug;
      if (data.name && data.name !== existingCategory.name) {
        slug = this.generateSlug(data.name);

        // Check if new slug conflicts
        const slugExists = await prisma.category.findFirst({
          where: {
            slug,
            id: { not: id },
          },
        });

        if (slugExists) {
          throw new AppError('Category with this name already exists', 400);
        }
      }

      const category = await prisma.category.update({
        where: { id },
        data: {
          ...data,
          slug,
        },
      });

      logger.info('Category updated', { id: category.id });

      return category;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error updating category:', error);
      throw new AppError('Failed to update category', 500);
    }
  }

  /**
   * Delete a category
   */
  async deleteCategory(id: string): Promise<void> {
    try {
      logger.info('Deleting category', { id });

      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          _count: {
            select: { products: true },
          },
        },
      });

      if (!category) {
        throw new AppError('Category not found', 404);
      }

      // Prevent deletion if category has products
      if (category._count.products > 0) {
        throw new AppError(
          `Cannot delete category with ${category._count.products} products. Please reassign or delete products first.`,
          400
        );
      }

      await prisma.category.delete({
        where: { id },
      });

      logger.info('Category deleted', { id });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error deleting category:', error);
      throw new AppError('Failed to delete category', 500);
    }
  }

  /**
   * Generate a URL-friendly slug from category name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}

export const categoryService = new CategoryService();
