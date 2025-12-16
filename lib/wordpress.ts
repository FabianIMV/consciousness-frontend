/**
 * WordPress REST API Client
 * Fetches content from consciousnessnetworks.com WordPress backend
 * Uses IP direct access to bypass WordPress Multisite subdomain routing
 */

const WP_API_URL = 'http://wp.consciousnessnetworks.com/wp-json/wp/v2';

export interface WordPressPost {
  id: number;
  date: string;
  modified: string;
  slug: string;
  status: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  author: number;
  featured_media: number;
  _embedded?: {
    author?: Array<{
      name: string;
      avatar_urls: { [key: string]: string };
    }>;
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text: string;
    }>;
  };
}

export interface WordPressPage {
  id: number;
  date: string;
  slug: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  featured_media: number;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text: string;
      media_details?: {
        sizes?: {
          medium?: { source_url: string };
          large?: { source_url: string };
        };
      };
    }>;
  };
}

/**
 * Fetch all pages from WordPress (with featured images)
 */
export async function getPages(): Promise<WordPressPage[]> {
  try {
    const res = await fetch(`${WP_API_URL}/pages?per_page=100&_embed`, {
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch pages: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching pages:', error);
    return [];
  }
}

/**
 * Fetch a single page by slug
 */
export async function getPageBySlug(slug: string): Promise<WordPressPage | null> {
  try {
    const res = await fetch(`${WP_API_URL}/pages?slug=${slug}&_embed`, {
      next: { revalidate: 60 }
    });

    if (!res.ok) {
      return null;
    }

    const pages = await res.json();
    return pages[0] || null;
  } catch (error) {
    console.error('Error fetching page:', error);
    return null;
  }
}

/**
 * Fetch all posts (for blog)
 */
export async function getPosts(): Promise<WordPressPost[]> {
  try {
    const res = await fetch(`${WP_API_URL}/posts?_embed&per_page=100`, {
      next: { revalidate: 60 }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch posts: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

/**
 * Fetch a single post by slug
 */
export async function getPostBySlug(slug: string): Promise<WordPressPost | null> {
  try {
    const res = await fetch(`${WP_API_URL}/posts?slug=${slug}&_embed`, {
      next: { revalidate: 60 }
    });

    if (!res.ok) {
      return null;
    }

    const posts = await res.json();
    return posts[0] || null;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

/**
 * Fetch site information
 */
export async function getSiteInfo() {
  try {
    const res = await fetch('https://consciousnessnetworks.com/wp-json', {
      next: { revalidate: 3600 } // Revalidate every hour
    });

    if (!res.ok) {
      throw new Error('Failed to fetch site info');
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching site info:', error);
    return null;
  }
}

/**
 * Strip HTML tags from content (for excerpts)
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ');
}

/**
 * Truncate text to a specific length
 */
export function truncate(text: string, length: number = 150): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

/**
 * Get featured image URL from WordPress page/post
 * Falls back to first image in content if no featured image set
 */
export function getFeaturedImage(page: WordPressPage | WordPressPost): string | null {
  // Try featured media first
  if (page._embedded?.['wp:featuredmedia']?.[0]) {
    const media = page._embedded['wp:featuredmedia'][0];
    return (media as any).media_details?.sizes?.medium?.source_url
      || (media as any).media_details?.sizes?.large?.source_url
      || media.source_url;
  }

  // Fallback: Extract first image from content HTML
  if (page.content?.rendered) {
    const imgMatch = page.content.rendered.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1];
    }
  }

  return null;
}
