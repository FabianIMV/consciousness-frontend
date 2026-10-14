/**
 * UI copy, translated at author time rather than at request time.
 *
 * Every label here used to be sent to an LLM on each render, which meant a page
 * could not be built without an API key, cost a network round trip per string,
 * and produced different wording on every deploy. Chrome text is a fixed, small
 * set — it belongs in source.
 */

import type { Locale } from '@/lib/site';

/** Shape of a translation set, inferred from the English source of truth. */
export type Dictionary = typeof en;

// No `as const` here: literal types would make every Spanish string a mismatch.
const en = {
  nav: {
    research: 'Research',
    papers: 'Papers',
    about: 'About',
    contact: 'Contact',
    primary: 'Primary navigation',
    skipToContent: 'Skip to content',
    switchLanguage: 'Español',
  },
  home: {
    title: 'The architecture of consciousness',
    subtitle:
      'Reviews and critical readings of primary research at the intersection of quantum mechanics, neuroscience, and artificial intelligence.',
    latest: 'Latest',
    archive: 'Archive',
    count: (n: number) => (n === 1 ? '1 article' : `${n} articles`),
    empty: 'No articles have been published yet.',
  },
  article: {
    number: (n: number) => `No. ${n}`,
    published: 'Published',
    updated: 'Updated',
    readingTime: (minutes: number) => `${minutes} min read`,
    minutes: (minutes: number) => `${minutes} min`,
    pagerLabel: 'More articles',
    previous: 'Previous',
    next: 'Next',
  },
  papers: {
    title: 'Reading list',
    subtitle:
      'Foundational and recent work on quantum mechanics, neuroscience, and consciousness science, annotated for researchers.',
    unavailable: 'The reading list is temporarily unavailable. Please try again shortly.',
  },
  about: {
    title: 'About',
    subtitle:
      'An independent research initiative at the intersection of quantum mechanics, neuroscience, and artificial intelligence.',
    unavailable: 'This page is temporarily unavailable. Please try again shortly.',
  },
  contact: {
    title: 'Contact',
    subtitle:
      'Questions about the research, an interest in collaborating, or a paper that belongs on the reading list.',
    directHeading: 'Write directly',
    collaborationHeading: 'Research collaboration',
    collaborationText:
      'Working on empirical or theoretical consciousness research? We welcome exchanges with other researchers and institutions.',
    papersHeading: 'Paper submissions',
    papersText:
      'Know a paper that belongs in the reading list? Send it over and we will review it for inclusion.',
    privacy:
      'Your contact details are used only to answer your message and are never shared with third parties.',
    form: {
      name: 'Name',
      email: 'Email',
      topic: 'Topic',
      topicPlaceholder: 'Select a topic',
      topics: {
        collaboration: 'Research collaboration',
        quantum: 'Quantum physics and consciousness',
        ai: 'AI and consciousness',
        paper: 'Paper recommendation',
        general: 'General enquiry',
      },
      message: 'Message',
      submit: 'Send message',
      sending: 'Sending',
      success: 'Message received. We will be in touch.',
      error: 'The message could not be sent. Please try again, or write to',
    },
  },
  notFound: {
    label: 'Error 404',
    title: 'Page not found',
    text: 'The page you are looking for does not exist or has been moved.',
    cta: 'All research',
    papersCta: 'The reading list',
  },
  footer: {
    rights: 'All rights reserved.',
    description:
      'An independent journal of research on consciousness, quantum mechanics, and artificial intelligence.',
    navLabel: 'Footer',
  },
};

const es: Dictionary = {
  nav: {
    research: 'Investigación',
    papers: 'Artículos',
    about: 'Acerca de',
    contact: 'Contacto',
    primary: 'Navegación principal',
    skipToContent: 'Ir al contenido',
    switchLanguage: 'English',
  },
  home: {
    title: 'La arquitectura de la consciencia',
    subtitle:
      'Reseñas y lecturas críticas de investigación primaria en la intersección de la mecánica cuántica, la neurociencia y la inteligencia artificial.',
    latest: 'Lo último',
    archive: 'Archivo',
    count: (n: number) => (n === 1 ? '1 artículo' : `${n} artículos`),
    empty: 'Todavía no se ha publicado ningún artículo.',
  },
  article: {
    number: (n: number) => `N.º ${n}`,
    published: 'Publicado',
    updated: 'Actualizado',
    readingTime: (minutes: number) => `${minutes} min de lectura`,
    minutes: (minutes: number) => `${minutes} min`,
    pagerLabel: 'Más artículos',
    previous: 'Anterior',
    next: 'Siguiente',
  },
  papers: {
    title: 'Lista de lectura',
    subtitle:
      'Trabajos fundacionales y recientes sobre mecánica cuántica, neurociencia y ciencia de la consciencia, comentados para investigadores.',
    unavailable: 'La lista de lectura no está disponible en este momento. Vuelve a intentarlo en unos minutos.',
  },
  about: {
    title: 'Acerca de',
    subtitle:
      'Una iniciativa de investigación independiente en la intersección de la mecánica cuántica, la neurociencia y la inteligencia artificial.',
    unavailable: 'Esta página no está disponible en este momento. Vuelve a intentarlo en unos minutos.',
  },
  contact: {
    title: 'Contacto',
    subtitle:
      'Preguntas sobre la investigación, interés en colaborar o un artículo que debería estar en la lista de lectura.',
    directHeading: 'Escribe directamente',
    collaborationHeading: 'Colaboración en investigación',
    collaborationText:
      '¿Trabajas en investigación empírica o teórica sobre la consciencia? Nos interesa el intercambio con otros investigadores e instituciones.',
    papersHeading: 'Propuestas de artículos',
    papersText:
      '¿Conoces un artículo que debería estar en la lista de lectura? Envíanoslo y lo revisaremos para incluirlo.',
    privacy:
      'Tus datos de contacto se usan únicamente para responder tu mensaje y nunca se comparten con terceros.',
    form: {
      name: 'Nombre',
      email: 'Correo electrónico',
      topic: 'Tema',
      topicPlaceholder: 'Selecciona un tema',
      topics: {
        collaboration: 'Colaboración en investigación',
        quantum: 'Física cuántica y consciencia',
        ai: 'IA y consciencia',
        paper: 'Recomendación de artículo',
        general: 'Consulta general',
      },
      message: 'Mensaje',
      submit: 'Enviar mensaje',
      sending: 'Enviando',
      success: 'Mensaje recibido. Te responderemos pronto.',
      error: 'No se pudo enviar el mensaje. Inténtalo de nuevo o escribe a',
    },
  },
  notFound: {
    label: 'Error 404',
    title: 'Página no encontrada',
    text: 'La página que buscas no existe o ha sido movida.',
    cta: 'Toda la investigación',
    papersCta: 'La lista de lectura',
  },
  footer: {
    rights: 'Todos los derechos reservados.',
    description:
      'Una revista independiente de investigación sobre consciencia, mecánica cuántica e inteligencia artificial.',
    navLabel: 'Pie de página',
  },
};

const dictionaries: Record<Locale, Dictionary> = { en, es };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}
