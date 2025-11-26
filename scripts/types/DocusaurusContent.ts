/**
 * Docusaurus Content Type Definitions
 * 
 * Type definitions for Docusaurus content structure.
 */

/**
 * Front matter for Docusaurus documents
 */
export interface FrontMatter {
  /** Document ID */
  id?: string;
  
  /** Document title */
  title: string;
  
  /** Sidebar label (overrides title in sidebar) */
  sidebar_label?: string;
  
  /** Sidebar position */
  sidebar_position?: number;
  
  /** Document description */
  description?: string;
  
  /** Keywords for SEO */
  keywords?: string[];
  
  /** Tags */
  tags?: string[];
  
  /** Custom slug */
  slug?: string;
  
  /** Hide title */
  hide_title?: boolean;
  
  /** Hide table of contents */
  hide_table_of_contents?: boolean;
  
  /** Custom edit URL */
  custom_edit_url?: string;
  
  /** Last update information */
  last_update?: LastUpdate;
  
  /** Additional custom fields */
  [key: string]: any;
}

/**
 * Last update information
 */
export interface LastUpdate {
  /** Last update date */
  date?: Date | string;
  
  /** Author of last update */
  author?: string;
}

/**
 * Docusaurus document content
 */
export interface DocusaurusContent {
  /** Front matter */
  frontMatter: FrontMatter;
  
  /** Document content (markdown) */
  content: string;
  
  /** Document slug/path */
  slug: string;
  
  /** File path relative to docs directory */
  filePath: string;
}

/**
 * Sidebar item configuration
 */
export interface SidebarItem {
  /** Item type */
  type: 'doc' | 'category' | 'link' | 'ref' | 'html';
  
  /** Document ID (for type: doc) */
  id?: string;
  
  /** Label */
  label?: string;
  
  /** Link href (for type: link) */
  href?: string;
  
  /** Child items (for type: category) */
  items?: SidebarItem[];
  
  /** Collapsed by default (for type: category) */
  collapsed?: boolean;
  
  /** Collapsible (for type: category) */
  collapsible?: boolean;
  
  /** Custom props */
  customProps?: Record<string, any>;
}

/**
 * Sidebar configuration
 */
export interface SidebarConfig {
  [sidebarId: string]: SidebarItem[];
}

/**
 * Docusaurus site configuration
 */
export interface SiteConfig {
  /** Site title */
  title: string;
  
  /** Site tagline */
  tagline: string;
  
  /** Site URL */
  url: string;
  
  /** Base URL */
  baseUrl: string;
  
  /** Organization name (for GitHub Pages) */
  organizationName: string;
  
  /** Project name (for GitHub Pages) */
  projectName: string;
  
  /** Favicon path */
  favicon?: string;
  
  /** Internationalization config */
  i18n?: I18nConfig;
  
  /** Theme configuration */
  themeConfig?: ThemeConfig;
}

/**
 * Internationalization configuration
 */
export interface I18nConfig {
  /** Default locale */
  defaultLocale: string;
  
  /** Available locales */
  locales: string[];
  
  /** Locale configurations */
  localeConfigs?: Record<string, LocaleConfig>;
}

/**
 * Locale configuration
 */
export interface LocaleConfig {
  /** Locale label */
  label: string;
  
  /** Text direction */
  direction?: 'ltr' | 'rtl';
  
  /** HTML lang attribute */
  htmlLang?: string;
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  /** Navbar configuration */
  navbar?: NavbarConfig;
  
  /** Footer configuration */
  footer?: FooterConfig;
  
  /** Color mode configuration */
  colorMode?: ColorModeConfig;
  
  /** Additional theme options */
  [key: string]: any;
}

/**
 * Navbar configuration
 */
export interface NavbarConfig {
  /** Navbar title */
  title?: string;
  
  /** Logo configuration */
  logo?: LogoConfig;
  
  /** Navbar items */
  items?: NavbarItem[];
}

/**
 * Logo configuration
 */
export interface LogoConfig {
  /** Alt text */
  alt: string;
  
  /** Logo source path */
  src: string;
  
  /** Logo for dark mode */
  srcDark?: string;
}

/**
 * Navbar item
 */
export interface NavbarItem {
  /** Item type */
  type?: string;
  
  /** Label */
  label?: string;
  
  /** Link */
  to?: string;
  
  /** External link */
  href?: string;
  
  /** Position */
  position?: 'left' | 'right';
}

/**
 * Footer configuration
 */
export interface FooterConfig {
  /** Footer style */
  style?: 'dark' | 'light';
  
  /** Footer links */
  links?: FooterLinkGroup[];
  
  /** Copyright text */
  copyright?: string;
}

/**
 * Footer link group
 */
export interface FooterLinkGroup {
  /** Group title */
  title: string;
  
  /** Links in the group */
  items: FooterLink[];
}

/**
 * Footer link
 */
export interface FooterLink {
  /** Link label */
  label: string;
  
  /** Internal link */
  to?: string;
  
  /** External link */
  href?: string;
}

/**
 * Color mode configuration
 */
export interface ColorModeConfig {
  /** Default color mode */
  defaultMode?: 'light' | 'dark';
  
  /** Disable switch */
  disableSwitch?: boolean;
  
  /** Respect prefers color scheme */
  respectPrefersColorScheme?: boolean;
}

