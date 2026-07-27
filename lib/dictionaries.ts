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
    primary: 'Primary',
    skipToContent: 'Skip to content',
    switchLanguage: 'Leer en español',
  },
  home: {
    eyebrow: 'Independent research journal',
    title: 'The architecture of consciousness',
    subtitle:
      'Reviews and critical readings of primary research at the intersection of quantum mechanics, neuroscience, and artificial intelligence.',
    latest: 'Latest',
    archive: 'Archive',
    readArticle: 'Read the article',
    readMore: 'Read more',
    empty: 'No articles have been published yet.',
    sidebarSections: 'Sections',
    sidebarAbout: 'About this journal',
    sidebarAboutText:
      'An independent initiative documenting consciousness research, with every claim traced to a primary source.',
    sidebarAboutCta: 'Read more about the project',
    sidebarReading: 'Reading list',
    sidebarReadingText: 'Foundational papers, annotated and kept current.',
    sidebarReadingCta: 'Open the reading list',
  },
  article: {
    back: 'Back to all research',
    published: 'Published',
    updated: 'Updated',
    readingTime: (minutes: number) => `${minutes} min read`,
    moreTitle: 'Continue reading',
    moreText: 'Further reviews and critical readings from the archive.',
    moreCta: 'View all articles',
  },
  papers: {
    eyebrow: 'Reading list',
    title: 'Essential papers',
    subtitle:
      'Foundational and recent work on quantum mechanics, neuroscience, and consciousness science, annotated for researchers.',
    unavailable: 'The reading list is temporarily unavailable. Please try again shortly.',
  },
  about: {
    eyebrow: 'The project',
    title: 'About',
    subtitle:
      'An independent research initiative at the intersection of quantum mechanics, neuroscience, and artificial intelligence.',
    unavailable: 'This page is temporarily unavailable. Please try again shortly.',
  },
  contact: {
    eyebrow: 'Contact',
    title: 'Get in touch',
    subtitle:
      'Questions about consciousness research, quantum cognition, or an interest in collaborating — write to us.',
    sectionTitle: 'Research and collaboration',
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
      namePlaceholder: 'Your name',
      email: 'Email',
      emailPlaceholder: 'you@example.com',
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
      messagePlaceholder: 'How can we help?',
      submit: 'Send message',
      sending: 'Sending',
      success: 'Message received. We will be in touch.',
      error: 'The message could not be sent. Please try again, or write to',
      required: 'Please complete every field.',
    },
  },
  notFound: {
    eyebrow: 'Error 404',
    title: 'Page not found',
    text: 'The page you are looking for does not exist or has been moved.',
    cta: 'Back to all research',
    papersCta: 'Browse the reading list',
  },
  footer: {
    rights: 'All rights reserved.',
    description:
      'Independent research on consciousness, quantum mechanics, and artificial intelligence.',
    sections: 'Sections',
    contactHeading: 'Contact',
  },
};

const es: Dictionary = {
  nav: {
    research: 'Investigación',
    papers: 'Artículos',
    about: 'Acerca de',
    contact: 'Contacto',
    primary: 'Principal',
    skipToContent: 'Ir al contenido',
    switchLanguage: 'Read in English',
  },
  home: {
    eyebrow: 'Revista de investigación independiente',
    title: 'La arquitectura de la consciencia',
    subtitle:
      'Reseñas y lecturas críticas de investigación primaria en la intersección de la mecánica cuántica, la neurociencia y la inteligencia artificial.',
    latest: 'Último',
    archive: 'Archivo',
    readArticle: 'Leer el artículo',
    readMore: 'Leer más',
    empty: 'Todavía no se ha publicado ningún artículo.',
    sidebarSections: 'Secciones',
    sidebarAbout: 'Sobre esta revista',
    sidebarAboutText:
      'Una iniciativa independiente que documenta la investigación sobre la consciencia, con cada afirmación referida a una fuente primaria.',
    sidebarAboutCta: 'Conocer el proyecto',
    sidebarReading: 'Lista de lectura',
    sidebarReadingText: 'Artículos fundacionales, comentados y actualizados.',
    sidebarReadingCta: 'Abrir la lista de lectura',
  },
  article: {
    back: 'Volver a la investigación',
    published: 'Publicado',
    updated: 'Actualizado',
    readingTime: (minutes: number) => `${minutes} min de lectura`,
    moreTitle: 'Seguir leyendo',
    moreText: 'Más reseñas y lecturas críticas del archivo.',
    moreCta: 'Ver todos los artículos',
  },
  papers: {
    eyebrow: 'Lista de lectura',
    title: 'Artículos esenciales',
    subtitle:
      'Trabajos fundacionales y recientes sobre mecánica cuántica, neurociencia y ciencia de la consciencia, comentados para investigadores.',
    unavailable: 'La lista de lectura no está disponible en este momento. Vuelve a intentarlo en unos minutos.',
  },
  about: {
    eyebrow: 'El proyecto',
    title: 'Acerca de',
    subtitle:
      'Una iniciativa de investigación independiente en la intersección de la mecánica cuántica, la neurociencia y la inteligencia artificial.',
    unavailable: 'Esta página no está disponible en este momento. Vuelve a intentarlo en unos minutos.',
  },
  contact: {
    eyebrow: 'Contacto',
    title: 'Escríbenos',
    subtitle:
      'Preguntas sobre investigación en consciencia, cognición cuántica o interés en colaborar: escríbenos.',
    sectionTitle: 'Investigación y colaboración',
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
      namePlaceholder: 'Tu nombre',
      email: 'Correo electrónico',
      emailPlaceholder: 'tu@ejemplo.com',
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
      messagePlaceholder: '¿En qué podemos ayudarte?',
      submit: 'Enviar mensaje',
      sending: 'Enviando',
      success: 'Mensaje recibido. Te responderemos pronto.',
      error: 'No se pudo enviar el mensaje. Inténtalo de nuevo o escribe a',
      required: 'Completa todos los campos.',
    },
  },
  notFound: {
    eyebrow: 'Error 404',
    title: 'Página no encontrada',
    text: 'La página que buscas no existe o ha sido movida.',
    cta: 'Volver a la investigación',
    papersCta: 'Ver la lista de lectura',
  },
  footer: {
    rights: 'Todos los derechos reservados.',
    description:
      'Investigación independiente sobre consciencia, mecánica cuántica e inteligencia artificial.',
    sections: 'Secciones',
    contactHeading: 'Contacto',
  },
};

const dictionaries: Record<Locale, Dictionary> = { en, es };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}
