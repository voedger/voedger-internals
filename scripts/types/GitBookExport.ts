/**
 * GitBook Export Type Definitions
 * 
 * Type definitions for GitBook exported content structure.
 */

/**
 * Represents a page in GitBook export
 */
export interface Page {
  /** Unique identifier for the page */
  id: string;
  
  /** Page title */
  title: string;
  
  /** Page content in markdown format */
  content: string;
  
  /** Relative path to the page file */
  path: string;
  
  /** Parent page ID (if nested) */
  parentId?: string;
  
  /** Order/position in the navigation */
  order: number;
  
  /** Page metadata */
  metadata?: PageMetadata;
}

/**
 * Page metadata
 */
export interface PageMetadata {
  /** Page description */
  description?: string;
  
  /** Page keywords */
  keywords?: string[];
  
  /** Last modified date */
  lastModified?: Date;
  
  /** Author information */
  author?: string;
}

/**
 * Represents an asset (image, file, etc.) in GitBook export
 */
export interface Asset {
  /** Asset filename */
  name: string;
  
  /** Relative path to the asset */
  path: string;
  
  /** Asset type (image, file, etc.) */
  type: 'image' | 'file' | 'other';
  
  /** MIME type */
  mimeType?: string;
  
  /** File size in bytes */
  size?: number;
}

/**
 * Navigation tree structure
 */
export interface NavigationTree {
  /** Root navigation items */
  items: NavigationItem[];
}

/**
 * Navigation item (can be a page or category)
 */
export interface NavigationItem {
  /** Item type */
  type: 'page' | 'category' | 'link';
  
  /** Item ID (page ID for pages) */
  id: string;
  
  /** Display label */
  label: string;
  
  /** URL or path */
  url?: string;
  
  /** Child items (for categories) */
  children?: NavigationItem[];
  
  /** Order/position */
  order: number;
}

/**
 * Complete GitBook export structure
 */
export interface GitBookExport {
  /** All pages in the export */
  pages: Page[];
  
  /** All assets in the export */
  assets: Asset[];
  
  /** Navigation structure */
  structure: NavigationTree;
  
  /** Export metadata */
  metadata: ExportMetadata;
}

/**
 * Export metadata
 */
export interface ExportMetadata {
  /** Export date */
  exportDate: Date;
  
  /** GitBook version */
  version: string;
  
  /** Space/book name */
  spaceName: string;
  
  /** Space/book ID */
  spaceId: string;
}

/**
 * Migration configuration
 */
export interface MigrationConfig {
  /** Source directory path */
  sourcePath: string;
  
  /** Output directory path */
  outputPath: string;
  
  /** Whether to validate links */
  validateLinks: boolean;
  
  /** Whether to optimize images */
  optimizeImages: boolean;
  
  /** Custom transformations */
  transformations?: ContentTransformation[];
}

/**
 * Content transformation function
 */
export type ContentTransformation = (content: string, page: Page) => string;

