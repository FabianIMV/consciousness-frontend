/**
 * Hardcoded posts data
 * Used as fallback when WordPress is unavailable
 */

export interface HardcodedPost {
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
    }>;
  };
}

export const HARDCODED_POSTS: HardcodedPost[] = [
  {
    id: 1,
    date: '2026-01-15T10:30:00',
    slug: 'the-soul-crisis',
    title: {
      rendered: 'The Soul Crisis: Consciousness in the Age of AI'
    },
    content: {
      rendered: '<p>As artificial intelligence continues to advance at an unprecedented pace, humanity faces a critical juncture in understanding consciousness itself. This essay explores the philosophical and scientific implications of creating conscious entities.</p><p>The intersection of quantum mechanics, neuroscience, and computational theory reveals patterns that suggest consciousness may be more fundamental than we previously believed.</p>'
    },
    featured_media: 1,
    _embedded: {
      'wp:featuredmedia': [
        {
          source_url: '/wp-content/uploads/2026/01/soul-crisis-featured.jpg',
          alt_text: 'The Soul Crisis: Consciousness in the Age of AI'
        }
      ]
    }
  },
  {
    id: 2,
    date: '2026-01-10T14:20:00',
    slug: 'mit-tfus-breakthrough',
    title: {
      rendered: 'MIT tFUS Consciousness Research: January 2026 Breakthrough'
    },
    content: {
      rendered: '<p>Researchers at MIT have achieved a significant breakthrough in understanding how the brain processes consciousness at the quantum level. The Technology for Ultrasonic Stimulation (tFUS) has revealed new patterns in neural activity.</p><p>This research opens new doors for understanding the nature of subjective experience and the biological basis of consciousness.</p>'
    },
    featured_media: 2,
    _embedded: {
      'wp:featuredmedia': [
        {
          source_url: '/wp-content/uploads/2026/01/mit-tfus-featured.jpg',
          alt_text: 'MIT tFUS Consciousness Research'
        }
      ]
    }
  },
  {
    id: 3,
    date: '2025-12-20T09:15:00',
    slug: 'quantum-consciousness-framework',
    title: {
      rendered: 'Quantum Consciousness Framework: A New Theoretical Model'
    },
    content: {
      rendered: '<p>A revolutionary framework combining quantum mechanics with neuroscience offers fresh perspectives on how consciousness emerges from quantum processes in the brain.</p><p>This model suggests that consciousness is not just a byproduct of classical neural computation, but involves quantum effects at the cellular level.</p>'
    },
    featured_media: 3,
    _embedded: {
      'wp:featuredmedia': [
        {
          source_url: '/wp-content/uploads/2025/12/quantum-framework-featured.jpg',
          alt_text: 'Quantum Consciousness Framework'
        }
      ]
    }
  },
  {
    id: 4,
    date: '2025-12-10T11:45:00',
    slug: 'morphic-resonance-study',
    title: {
      rendered: 'Morphic Resonance and Consciousness: New Experimental Evidence'
    },
    content: {
      rendered: '<p>Recent experiments provide compelling evidence for morphic resonance, a hypothesis suggesting that memory is inherent in nature and that organisms are influenced by the morphic fields of previous organisms of their kind.</p><p>These findings have profound implications for understanding collective consciousness and evolutionary patterns.</p>'
    },
    featured_media: 4,
    _embedded: {
      'wp:featuredmedia': [
        {
          source_url: '/wp-content/uploads/2025/12/morphic-featured.jpg',
          alt_text: 'Morphic Resonance Study'
        }
      ]
    }
  },
  {
    id: 5,
    date: '2025-11-28T16:30:00',
    slug: 'zero-point-field-theory',
    title: {
      rendered: 'Zero-Point Field (ZPF) Theory: Consciousness and Quantum Vacuum'
    },
    content: {
      rendered: '<p>The Zero-Point Field (ZPF) represents one of the most intriguing concepts in quantum physics, suggesting a fundamental field of energy permeating all of space. Could consciousness be connected to this universal field?</p><p>Exploring the relationship between ZPF and consciousness opens new avenues for understanding reality itself.</p>'
    },
    featured_media: 5,
    _embedded: {
      'wp:featuredmedia': [
        {
          source_url: '/wp-content/uploads/2025/11/zpf-featured.jpg',
          alt_text: 'Zero-Point Field Theory'
        }
      ]
    }
  }
];
