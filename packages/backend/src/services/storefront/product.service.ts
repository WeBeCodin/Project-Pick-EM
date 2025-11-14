import { prisma } from '../../database';
import { logger } from '../../utils/logger';
import { AppError } from '../../utils/errors';
import { Product, ProductImage, Category } from '@prisma/client';

export interface CreateProductDto {
  sku: string;
  name: string;
  description?: string;
  categoryId: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
  inStock?: boolean;
  brand?: string;
  manufacturer?: string;
  model?: string;
  caliber?: string;
  specifications?: Record<string, any>;
  metaTitle?: string;
  metaDescription?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface ProductWithImages extends Product {
  images: ProductImage[];
  category: Category;
}

export interface ProductListFilters {
  categoryId?: string;
  brand?: string;
  inStock?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export interface PaginationOptions {
  page?: number;
  perPage?: number;
  sortBy?: 'name' | 'price' | 'createdAt' | 'sortOrder';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Product Service
 * Handles all product-related business logic for the JustArms storefront
 */
class ProductService {
  /**
   * Get all products with filtering and pagination
   */
  async getProducts(
    filters: ProductListFilters = {},
    options: PaginationOptions = {}
  ): Promise<{ products: ProductWithImages[]; total: number; page: number; perPage: number }> {
    try {
      const {
        categoryId,
        brand,
        inStock,
        isFeatured,
        isActive = true,
        minPrice,
        maxPrice,
        search,
      } = filters;

      const {
        page = 1,
        perPage = 20,
        sortBy = 'sortOrder',
        sortOrder = 'asc',
      } = options;

      const skip = (page - 1) * perPage;

      // Build where clause
      const where: any = {
        isActive,
      };

      if (categoryId) where.categoryId = categoryId;
      if (brand) where.brand = { contains: brand, mode: 'insensitive' };
      if (typeof inStock === 'boolean') where.inStock = inStock;
      if (typeof isFeatured === 'boolean') where.isFeatured = isFeatured;
      
      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined) where.price.gte = minPrice;
        if (maxPrice !== undefined) where.price.lte = maxPrice;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } },
          { manufacturer: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: perPage,
          orderBy: { [sortBy]: sortOrder },
          include: {
            images: {
              orderBy: [
                { isPrimary: 'desc' },
                { sortOrder: 'asc' },
              ],
            },
            category: true,
          },
        }),
        prisma.product.count({ where }),
      ]);

      logger.info(`Retrieved ${products.length} products`, { filters, options });

      return {
        products,
        total,
        page,
        perPage,
      };
    } catch (error) {
      logger.error('Error fetching products:', error);
      throw new AppError('Failed to fetch products', 500);
    }
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: string): Promise<ProductWithImages | null> {
    try {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          images: {
            orderBy: [
              { isPrimary: 'desc' },
              { sortOrder: 'asc' },
            ],
          },
          category: true,
        },
      });

      return product;
    } catch (error) {
      logger.error('Error fetching product:', error);
      throw new AppError('Failed to fetch product', 500);
    }
  }

  /**
   * Get a single product by SKU
   */
  async getProductBySku(sku: string): Promise<ProductWithImages | null> {
    try {
      const product = await prisma.product.findUnique({
        where: { sku },
        include: {
          images: {
            orderBy: [
              { isPrimary: 'desc' },
              { sortOrder: 'asc' },
            ],
          },
          category: true,
        },
      });

      return product;
    } catch (error) {
      logger.error('Error fetching product by SKU:', error);
      throw new AppError('Failed to fetch product', 500);
    }
  }

  /**
   * Create a new product
   */
  async createProduct(data: CreateProductDto): Promise<ProductWithImages> {
    try {
      logger.info('Creating product', { sku: data.sku });

      // Verify category exists
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new AppError('Category not found', 404);
      }

      // Check if SKU already exists
      const existingProduct = await prisma.product.findUnique({
        where: { sku: data.sku },
      });

      if (existingProduct) {
        throw new AppError('Product with this SKU already exists', 400);
      }

      // Generate slug from name
      const slug = this.generateSlug(data.name, data.sku);

      const product = await prisma.product.create({
        data: {
          sku: data.sku,
          name: data.name,
          slug,
          description: data.description,
          categoryId: data.categoryId,
          price: data.price,
          compareAtPrice: data.compareAtPrice,
          stockQuantity: data.stockQuantity ?? 0,
          lowStockThreshold: data.lowStockThreshold ?? 5,
          inStock: data.inStock ?? (data.stockQuantity ?? 0) > 0,
          brand: data.brand,
          manufacturer: data.manufacturer,
          model: data.model,
          caliber: data.caliber,
          specifications: data.specifications || {},
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          isActive: data.isActive ?? true,
          isFeatured: data.isFeatured ?? false,
        },
        include: {
          images: true,
          category: true,
        },
      });

      logger.info('Product created', { id: product.id, sku: product.sku });

      return product;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error creating product:', error);
      throw new AppError('Failed to create product', 500);
    }
  }

  /**
   * Update a product
   */
  async updateProduct(id: string, data: UpdateProductDto): Promise<ProductWithImages> {
    try {
      logger.info('Updating product', { id });

      // Verify product exists
      const existingProduct = await prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        throw new AppError('Product not found', 404);
      }

      // If updating SKU, check uniqueness
      if (data.sku && data.sku !== existingProduct.sku) {
        const skuExists = await prisma.product.findUnique({
          where: { sku: data.sku },
        });

        if (skuExists) {
          throw new AppError('Product with this SKU already exists', 400);
        }
      }

      // If updating category, verify it exists
      if (data.categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: data.categoryId },
        });

        if (!category) {
          throw new AppError('Category not found', 404);
        }
      }

      // Update slug if name changes
      let slug = existingProduct.slug;
      if (data.name && data.name !== existingProduct.name) {
        slug = this.generateSlug(data.name, data.sku || existingProduct.sku);
      }

      // Update inStock based on stockQuantity if provided
      const updateData: any = { ...data, slug };
      if (data.stockQuantity !== undefined) {
        updateData.inStock = data.stockQuantity > 0;
      }

      const product = await prisma.product.update({
        where: { id },
        data: updateData,
        include: {
          images: {
            orderBy: [
              { isPrimary: 'desc' },
              { sortOrder: 'asc' },
            ],
          },
          category: true,
        },
      });

      logger.info('Product updated', { id: product.id });

      return product;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error updating product:', error);
      throw new AppError('Failed to update product', 500);
    }
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<void> {
    try {
      logger.info('Deleting product', { id });

      const product = await prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        throw new AppError('Product not found', 404);
      }

      await prisma.product.delete({
        where: { id },
      });

      logger.info('Product deleted', { id });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error deleting product:', error);
      throw new AppError('Failed to delete product', 500);
    }
  }

  /**
   * Generate a URL-friendly slug from product name and SKU
   */
  private generateSlug(name: string, sku: string): string {
    const nameSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    const skuSlug = sku
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    
    return `${nameSlug}-${skuSlug}`;
  }

  /**
   * Generate CDN image key using consistent naming convention
   * Format: {category-slug}-{sku}-{variant}-{view}.{ext}
   * Example: firearm-ar15-1002356-black-main.jpg
   */
  generateImageKey(
    categorySlug: string,
    sku: string,
    variant: string = 'standard',
    view: string = 'main',
    extension: string = 'jpg'
  ): string {
    const cleanSku = sku.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const cleanVariant = variant.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const cleanView = view.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    return `${categorySlug}-${cleanSku}-${cleanVariant}-${cleanView}.${extension}`;
  }
}

export const productService = new ProductService();
