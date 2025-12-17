# 🤖 GUÍA COMPLETA DE DESARROLLO - Consciousness Networks Frontend

> **Para Claude Code/Copilot**: Este archivo contiene el workflow completo, mapa de archivos, y guías específicas para modificar cada elemento del blog. Léelo completamente antes de hacer cambios.

---

## 📋 ÍNDICE RÁPIDO

1. [Contexto del Proyecto](#contexto-del-proyecto)
2. [Arquitectura y Stack](#arquitectura-y-stack)
3. [Mapa Completo de Archivos](#mapa-completo-de-archivos)
4. [Workflow Seguro (5 Pasos)](#workflow-seguro-5-pasos)
5. [Guía por Tipo de Cambio](#guía-por-tipo-de-cambio)
6. [Árbol de Decisión](#árbol-de-decisión)
7. [Patrones y Convenciones](#patrones-y-convenciones)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 CONTEXTO DEL PROYECTO

### Descripción
Blog de investigación sobre conciencia cuántica y AI. Frontend en Next.js 14 (App Router) que consume contenido de WordPress headless via REST API.

### Entorno de Trabajo
- **Carpeta de trabajo**: `/Users/fabianmunoz/Downloads/consciouness-blog`
- **Repo GitHub**: `https://github.com/FabianIMV/consciousness-frontend/`
- **Rama principal**: `main`
- **Deploy automático**: Vercel (cada merge a `main` despliega automáticamente)
- **Producción**: `consciousnessnetworks.com`
- **WordPress (Backend)**: `wp.consciousnessnetworks.com`

### ⚠️ REGLA CRÍTICA
**NUNCA hacer push directo a `main`**. Siempre usar ramas y Pull Requests para evitar romper producción.

---

## 🏗️ ARQUITECTURA Y STACK

### Stack Tecnológico
```
Next.js 14 (App Router)
├── React 18
├── TypeScript 5
├── Tailwind CSS 3
├── Server Components (default)
└── Client Components ('use client' cuando sea necesario)
```

### Flujo de Deploy
```
Local Dev          GitHub            Vercel            Producción
──────────        ──────────        ──────────        ────────────
npm run dev  →  git push rama  →  Auto Preview  →  Review OK?
                                                           ↓
                      PR merged  ←  Merge to main  ←  Create PR
                          ↓
                   Vercel Deploy (2-3 min)
                          ↓
              consciousnessnetworks.com
```

### Arquitectura de Carpetas
```
consciouness-blog/
├── app/                      ← PÁGINAS Y RUTAS (Next.js 14 App Router)
│   ├── page.tsx             ← Homepage (/)
│   ├── layout.tsx           ← Layout raíz (envuelve todas las páginas)
│   ├── globals.css          ← Estilos globales
│   ├── icon.svg             ← Favicon del sitio
│   ├── sitemap.ts           ← Generador de sitemap XML
│   ├── [slug]/              ← Rutas dinámicas para posts de blog
│   │   └── page.tsx         ← Template de artículos individuales
│   ├── about/               ← Página About
│   │   └── page.tsx
│   ├── papers/              ← Página Papers
│   │   ├── page.tsx
│   │   └── metadata.ts      ← Metadata SEO específica
│   ├── contact/             ← Página Contact
│   │   └── page.tsx
│   └── api/                 ← API Routes
│       └── contact/
│           └── route.ts     ← Endpoint para formulario de contacto
│
├── components/               ← COMPONENTES REUTILIZABLES
│   ├── Navigation.tsx       ← Header/Navbar (Client Component)
│   ├── Footer.tsx           ← Footer del sitio
│   ├── HeroSection.tsx      ← Hero de homepage
│   ├── ArticleCard.tsx      ← Card para artículos del blog
│   ├── GradientButton.tsx   ← Botón con gradiente
│   ├── BackgroundGradient.tsx ← Fondo con gradiente animado
│   ├── ContactForm.tsx      ← Formulario de contacto
│   └── EXAMPLE_USAGE.tsx    ← Ejemplos de uso de componentes
│
├── styles/                   ← ESTILOS Y DISEÑO
│   ├── tokens.css           ← Variables CSS (colores, espaciado, etc.)
│   └── typography.css       ← Estilos tipográficos
│
├── lib/                      ← FUNCIONES AUXILIARES
│   └── wordpress.ts         ← Funciones para fetch de WordPress API
│
├── public/                   ← ASSETS ESTÁTICOS
│   ├── images/              ← Imágenes del sitio
│   └── og-image.jpg         ← Open Graph image para redes sociales
│
├── *.md                      ← DOCUMENTACIÓN
│   ├── README.md
│   ├── WORKFLOW-SEGURO.md   ← Este archivo
│   ├── DEPLOYMENT-GUIDE.md
│   └── ...
│
├── approach-*                ← IGNORAR (solo documentación de análisis)
│
└── CONFIG FILES              ← CONFIGURACIÓN
    ├── package.json         ← Dependencies y scripts
    ├── next.config.js       ← Configuración de Next.js
    ├── tailwind.config.ts   ← Configuración de Tailwind
    ├── tsconfig.json        ← Configuración de TypeScript
    └── postcss.config.js    ← Configuración de PostCSS
```

---

## 🗺️ MAPA COMPLETO DE ARCHIVOS

### 📄 Archivos de Páginas (`app/`)

| Archivo | Ruta URL | Descripción | Tipo |
|---------|----------|-------------|------|
| `app/page.tsx` | `/` | Homepage principal con hero y artículos destacados | Server Component |
| `app/layout.tsx` | - | Layout raíz, define metadata SEO global y estructura HTML | Server Component |
| `app/globals.css` | - | Estilos globales, importa Tailwind y tokens CSS | CSS |
| `app/[slug]/page.tsx` | `/nombre-post` | Template dinámico para posts individuales del blog | Server Component |
| `app/about/page.tsx` | `/about` | Página About | Server Component |
| `app/papers/page.tsx` | `/papers` | Página Papers/Publicaciones | Server Component |
| `app/contact/page.tsx` | `/contact` | Página de contacto con formulario | Server Component |
| `app/api/contact/route.ts` | `/api/contact` | API endpoint para enviar emails de contacto | API Route |
| `app/sitemap.ts` | `/sitemap.xml` | Genera sitemap XML dinámico para SEO | Server Function |

### 🧩 Componentes (`components/`)

| Archivo | Uso | Tipo | Props Principales |
|---------|-----|------|-------------------|
| `Navigation.tsx` | Header/navbar en todas las páginas | Client | - |
| `Footer.tsx` | Footer en todas las páginas | Server | - |
| `HeroSection.tsx` | Hero section de la homepage | Server | `title`, `subtitle`, `ctaText` |
| `ArticleCard.tsx` | Card para mostrar artículos | Server | `title`, `excerpt`, `slug`, `image` |
| `GradientButton.tsx` | Botón con gradiente cósmico | Server/Client | `children`, `onClick`, `href` |
| `BackgroundGradient.tsx` | Fondo con gradiente animado | Client | - |
| `ContactForm.tsx` | Formulario de contacto | Client | - |

### 🎨 Estilos (`styles/`)

| Archivo | Contenido | Cuándo Editar |
|---------|-----------|---------------|
| `tokens.css` | Variables CSS: colores (primary, secondary, accent), espaciado, borders, shadows | Cambiar colores, espaciado, o estilos del design system |
| `typography.css` | Estilos tipográficos: fuentes, tamaños, line-heights, pesos | Cambiar tipografía del sitio |

### ⚙️ Configuración

| Archivo | Propósito | Cuándo Editar |
|---------|-----------|---------------|
| `next.config.js` | Config de Next.js: imágenes remotas, rewrites, redirects | Agregar nuevos dominios de imágenes, configurar rewrites/redirects |
| `tailwind.config.ts` | Config de Tailwind: colores, fuentes, breakpoints | Extender Tailwind con colores o utilidades custom |
| `package.json` | Dependencies y scripts npm | Agregar/actualizar paquetes |
| `tsconfig.json` | Config de TypeScript | Raramente (solo para cambios de compilación TS) |

---

## 🔄 WORKFLOW SEGURO (5 PASOS)

### Paso 1: Crear Rama Nueva (SIEMPRE)

```bash
# Asegúrate de estar en main actualizado
git checkout main
git pull origin main

# Crea una rama descriptiva
git checkout -b tipo/descripcion-corta

# Ejemplos:
git checkout -b mejora/hero-homepage
git checkout -b fix/navegacion-mobile
git checkout -b feature/dark-mode
git checkout -b actualiza/footer-links
```

**Convención de nombres de rama**:
- `feature/` - Nueva funcionalidad
- `fix/` - Corrección de bugs
- `mejora/` - Mejora de algo existente
- `actualiza/` - Actualización de contenido/estilos

### Paso 2: Hacer Cambios y Probar Localmente

```bash
# Si es primera vez o cambió package.json
npm install

# Inicia servidor de desarrollo
npm run dev

# Abre http://localhost:3000 en navegador
# Verifica tus cambios en tiempo real (hot reload)
```

**Tips para desarrollo local**:
- El servidor recarga automáticamente al guardar archivos
- Errores aparecen en terminal y en overlay del navegador
- Usa DevTools (F12) para debug de estilos y comportamiento

### Paso 3: Verificar Build

```bash
# Asegúrate de que compila sin errores
npm run build

# Si hay errores:
# - Lee el mensaje de error completo
# - Corrige el problema
# - Vuelve a correr npm run build
# - No continúes hasta que el build esté verde
```

**Errores comunes en build**:
- Importaciones incorrectas o archivos no encontrados
- Componentes sin `export default`
- Errores de TypeScript (tipos incorrectos)
- Imágenes o assets faltantes
- Variables de entorno no definidas

### Paso 4: Commit

```bash
# Ver archivos modificados
git status

# Agregar archivos al staging
git add .

# Commit con mensaje descriptivo
git commit -m "Tipo: Descripción clara de los cambios"

# Ejemplos de buenos mensajes:
git commit -m "Mejora: Actualiza diseño del hero con mejor contraste"
git commit -m "Fix: Corrige navegación mobile en tablets"
git commit -m "Feature: Agrega modo oscuro a todas las páginas"
git commit -m "Actualiza: Cambia colores del footer"
```

### Paso 5: Push y Pull Request

```bash
# Push a TU RAMA (NO a main)
git push -u origin nombre-de-tu-rama

# Ejemplo:
git push -u origin mejora/hero-homepage
```

**En GitHub**:
1. Ve a `https://github.com/FabianIMV/consciousness-frontend/`
2. Verás botón amarillo "Compare & pull request" → clic
3. Título descriptivo del PR
4. Descripción: qué cambió y por qué
5. Revisa el diff (vista de cambios)
6. Crea el Pull Request
7. **Revisa TODO otra vez**
8. Si estás seguro → "Merge Pull Request"
9. Vercel despliega automáticamente (2-3 min)
10. Verifica en `consciousnessnetworks.com`

---

## 🎯 GUÍA POR TIPO DE CAMBIO

### 📝 Cambiar Contenido de una Página

**Ejemplos**: Cambiar texto del hero, actualizar About, editar Papers, etc.

**Archivos a editar**:
- Homepage: `app/page.tsx`
- About: `app/about/page.tsx`
- Papers: `app/papers/page.tsx`
- Contact: `app/contact/page.tsx`

**Workflow**:
```bash
# 1. Crear rama
git checkout -b actualiza/texto-hero

# 2. Editar archivo
# Abre el archivo correspondiente y modifica el texto/contenido

# 3. Verificar
npm run dev
# Revisa en http://localhost:3000

# 4. Build y commit
npm run build
git add .
git commit -m "Actualiza: Mejora texto del hero en homepage"
git push -u origin actualiza/texto-hero

# 5. PR en GitHub
```

**Ejemplo práctico**:
```tsx
// app/page.tsx
// ANTES:
<h1>Welcome to Consciousness Networks</h1>

// DESPUÉS:
<h1>Exploring Quantum Consciousness</h1>
```

---

### 🎨 Cambiar Estilos/Diseño

**Qué puedes cambiar**:
- Colores
- Espaciado
- Tipografía
- Sombras
- Borders
- Animaciones

#### Opción A: Cambiar Variables Globales (Recomendado)

**Archivo**: `styles/tokens.css`

**Ejemplos**:

```css
/* Cambiar color primario */
--color-primary-600: #6366f1; /* Cambia este valor */

/* Cambiar espaciado */
--spacing-xl: 4rem; /* Ajusta según necesites */

/* Cambiar sombras */
--shadow-glow: 0 0 30px rgba(99, 102, 241, 0.5);
```

**Workflow**:
```bash
git checkout -b mejora/colores-primarios
# Edita styles/tokens.css
npm run dev  # Verifica cambios
npm run build
git add styles/tokens.css
git commit -m "Mejora: Actualiza colores primarios del design system"
git push -u origin mejora/colores-primarios
```

#### Opción B: Cambiar Estilos de un Componente Específico

**Archivo**: El componente específico (ej. `components/Navigation.tsx`)

**Ejemplo**:
```tsx
// components/Navigation.tsx
// ANTES:
<nav className="h-20 flex items-center">

// DESPUÉS:
<nav className="h-24 flex items-center"> {/* Altura aumentada */}
```

**Workflow**:
```bash
git checkout -b mejora/altura-navbar
# Edita components/Navigation.tsx
npm run dev
npm run build
git add components/Navigation.tsx
git commit -m "Mejora: Aumenta altura del navbar"
git push -u origin mejora/altura-navbar
```

#### Opción C: Cambiar Tipografía

**Archivo**: `styles/typography.css`

**Ejemplo**:
```css
/* Cambiar tamaño de headings */
h1 {
  font-size: 3.5rem; /* Ajusta este valor */
  line-height: 1.1;
}

/* Cambiar fuente del body */
body {
  font-family: 'Inter', sans-serif; /* Cambia la fuente */
}
```

---

### 🧩 Modificar un Componente Existente

**Ejemplos**: Cambiar Navigation, Footer, ArticleCard, etc.

**Archivos**: `components/[NombreComponente].tsx`

**Workflow**:
```bash
git checkout -b mejora/footer-links
# Edita components/Footer.tsx
npm run dev  # Verifica en localhost:3000
npm run build
git add components/Footer.tsx
git commit -m "Mejora: Actualiza links del footer"
git push -u origin mejora/footer-links
```

**Ejemplo práctico**:
```tsx
// components/Footer.tsx
// Agregar un nuevo link

// ANTES:
<Link href="/about">About</Link>
<Link href="/papers">Papers</Link>

// DESPUÉS:
<Link href="/about">About</Link>
<Link href="/papers">Papers</Link>
<Link href="/faq">FAQ</Link> {/* Nuevo link */}
```

---

### ➕ Agregar un Nuevo Componente

**Cuándo**: Quieres crear un componente reutilizable nuevo.

**Workflow**:
```bash
git checkout -b feature/newsletter-form

# 1. Crear archivo del componente
# Crea: components/NewsletterForm.tsx

# 2. Escribe el componente
# Ver ejemplo abajo

# 3. Importa y usa en la página deseada
# Ej: En app/page.tsx: import NewsletterForm from '@/components/NewsletterForm'

npm run dev
npm run build
git add .
git commit -m "Feature: Agrega componente NewsletterForm"
git push -u origin feature/newsletter-form
```

**Template de componente**:
```tsx
// components/NewsletterForm.tsx
'use client'; // Solo si usa hooks o interactividad

import React from 'react';

export default function NewsletterForm() {
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">Subscribe to Newsletter</h3>
      <input
        type="email"
        placeholder="Your email"
        className="w-full px-4 py-2 border rounded-lg mb-4"
      />
      <button className="w-full px-4 py-2 bg-gradient-cosmic text-white rounded-lg">
        Subscribe
      </button>
    </div>
  );
}
```

---

### 📱 Agregar una Nueva Página

**Cuándo**: Quieres crear una página completamente nueva (ej. `/faq`, `/team`, etc.)

**Workflow**:
```bash
git checkout -b feature/pagina-faq

# 1. Crear carpeta y archivo
mkdir app/faq
# Crea: app/faq/page.tsx

# 2. Escribe el componente de la página
# Ver template abajo

# 3. Agrega link en Navigation.tsx
# components/Navigation.tsx → agrega { href: '/faq', label: 'FAQ' }

npm run dev  # Verifica en localhost:3000/faq
npm run build
git add .
git commit -m "Feature: Agrega página FAQ"
git push -u origin feature/pagina-faq
```

**Template de página**:
```tsx
// app/faq/page.tsx
import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently Asked Questions about Consciousness Networks',
};

export default function FAQPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-black mb-8 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h1>

          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">¿Qué es Consciousness Networks?</h2>
              <p className="text-gray-600">
                Somos una plataforma de investigación...
              </p>
            </div>

            {/* Más FAQs aquí */}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
```

---

### 🔗 Cambiar Links de Navegación

**Archivo**: `components/Navigation.tsx`

**Ejemplo - Agregar nuevo link**:
```tsx
// components/Navigation.tsx
// Busca el array de links (línea ~42):

// ANTES:
{ href: '/', label: 'Research', active: true },
{ href: '/papers', label: 'Papers' },
{ href: '/about', label: 'About' },
{ href: '/contact', label: 'Contact' },

// DESPUÉS (con nuevo link):
{ href: '/', label: 'Research', active: true },
{ href: '/papers', label: 'Papers' },
{ href: '/faq', label: 'FAQ' }, // Nuevo
{ href: '/about', label: 'About' },
{ href: '/contact', label: 'Contact' },
```

**Workflow**:
```bash
git checkout -b actualiza/nav-links
# Edita components/Navigation.tsx
npm run dev
npm run build
git add components/Navigation.tsx
git commit -m "Actualiza: Agrega link FAQ a navegación"
git push -u origin actualiza/nav-links
```

---

### 🖼️ Agregar/Cambiar Imágenes

**Carpeta**: `public/images/` (o directamente en `public/`)

**Workflow**:
```bash
git checkout -b actualiza/imagen-hero

# 1. Agrega la imagen a public/
# Ej: public/images/new-hero.jpg

# 2. Usa la imagen en tu componente
# <Image src="/images/new-hero.jpg" alt="Hero" width={1200} height={600} />

npm run dev  # Verifica que se vea
npm run build
git add .
git commit -m "Actualiza: Nueva imagen de hero"
git push -u origin actualiza/imagen-hero
```

**Ejemplo con Next.js Image**:
```tsx
import Image from 'next/image';

<Image
  src="/images/hero-background.jpg"
  alt="Quantum consciousness visualization"
  width={1920}
  height={1080}
  className="rounded-lg"
  priority // Para imágenes above the fold
/>
```

---

### ⚙️ Modificar SEO/Metadata

**Dónde**:
- **Global**: `app/layout.tsx` (metadata que aplica a todas las páginas)
- **Por página**: En cada `page.tsx` (ej. `app/about/page.tsx`)

**Ejemplo - Cambiar metadata global**:
```tsx
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    default: 'Consciousness Networks | Quantum Research', // Cambiar aquí
    template: '%s | Consciousness Networks'
  },
  description: 'Tu nueva descripción aquí...', // Cambiar aquí
  // ...
};
```

**Ejemplo - Metadata de página específica**:
```tsx
// app/about/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn more about our quantum consciousness research',
  openGraph: {
    title: 'About Consciousness Networks',
    description: 'Our story and mission',
    images: ['/og-about.jpg'],
  },
};

export default function AboutPage() {
  // ...
}
```

**Workflow**:
```bash
git checkout -b mejora/seo-metadata
# Edita app/layout.tsx o el page.tsx específico
npm run dev
npm run build  # Importante: verifica que compile
git add .
git commit -m "Mejora: Actualiza metadata SEO"
git push -u origin mejora/seo-metadata
```

---

### 📡 Modificar Fetching de WordPress

**Archivo**: `lib/wordpress.ts`

**Cuándo editar**: Si necesitas cambiar cómo se obtienen posts, agregar nuevos endpoints, cambiar cache, etc.

**Ejemplo - Cambiar cantidad de posts**:
```typescript
// lib/wordpress.ts

// ANTES:
const response = await fetch(`${API_URL}/posts?per_page=10`);

// DESPUÉS:
const response = await fetch(`${API_URL}/posts?per_page=20`);
```

**Workflow**:
```bash
git checkout -b mejora/fetch-mas-posts
# Edita lib/wordpress.ts
npm run dev  # Verifica que funcione
npm run build
git add lib/wordpress.ts
git commit -m "Mejora: Aumenta cantidad de posts a 20"
git push -u origin mejora/fetch-mas-posts
```

---

### 🎨 Cambiar Tailwind Config

**Archivo**: `tailwind.config.ts`

**Cuándo editar**: Para agregar colores custom, fuentes, breakpoints, o plugins de Tailwind.

**Ejemplo - Agregar color custom**:
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        'custom-purple': '#9333ea', // Nuevo color
      },
    },
  },
};
```

**Uso después**:
```tsx
<div className="bg-custom-purple text-white">
  Contenido
</div>
```

---

## 🌳 ÁRBOL DE DECISIÓN

### ¿Qué archivo debo editar?

```
¿Qué quieres cambiar?
│
├─ 🎨 DISEÑO/ESTILOS
│   │
│   ├─ Colores, espaciado, sombras → styles/tokens.css
│   ├─ Tipografía (fuentes, tamaños) → styles/typography.css
│   ├─ Estilos de un componente específico → components/[Componente].tsx
│   └─ Configuración de Tailwind → tailwind.config.ts
│
├─ 📝 CONTENIDO DE PÁGINA
│   │
│   ├─ Homepage → app/page.tsx
│   ├─ About → app/about/page.tsx
│   ├─ Papers → app/papers/page.tsx
│   ├─ Contact → app/contact/page.tsx
│   └─ Post individual → app/[slug]/page.tsx
│
├─ 🧩 COMPONENTE
│   │
│   ├─ Header/Navbar → components/Navigation.tsx
│   ├─ Footer → components/Footer.tsx
│   ├─ Hero → components/HeroSection.tsx
│   ├─ Cards de artículos → components/ArticleCard.tsx
│   ├─ Formulario contacto → components/ContactForm.tsx
│   └─ Nuevo componente → Crear components/NuevoComponente.tsx
│
├─ 🔗 NAVEGACIÓN
│   │
│   └─ Links del navbar → components/Navigation.tsx (línea ~42)
│
├─ 📱 NUEVA PÁGINA
│   │
│   ├─ 1. Crear carpeta: app/nombre-pagina/
│   ├─ 2. Crear archivo: app/nombre-pagina/page.tsx
│   └─ 3. Agregar link: components/Navigation.tsx
│
├─ 🖼️ IMÁGENES
│   │
│   ├─ Agregar imagen → public/images/nombre.jpg
│   └─ Usar imagen → <Image src="/images/nombre.jpg" ... />
│
├─ 🔍 SEO/METADATA
│   │
│   ├─ Global (todas las páginas) → app/layout.tsx
│   └─ Por página → Cada page.tsx (export const metadata)
│
├─ 📡 WORDPRESS API
│   │
│   └─ Fetch de posts → lib/wordpress.ts
│
└─ ⚙️ CONFIGURACIÓN
    │
    ├─ Next.js (imágenes, rewrites) → next.config.js
    ├─ Tailwind → tailwind.config.ts
    ├─ TypeScript → tsconfig.json
    └─ Packages → package.json
```

---

## 📐 PATRONES Y CONVENCIONES

### Estructura de Componentes

```tsx
// 1. Imports
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

// 2. Types/Interfaces (si TypeScript)
interface ComponentProps {
  title: string;
  children: React.ReactNode;
}

// 3. Componente
export default function ComponentName({ title, children }: ComponentProps) {
  // 4. Hooks (si es Client Component)
  const [state, setState] = React.useState();

  // 5. Funciones auxiliares
  const handleClick = () => {
    // ...
  };

  // 6. Render
  return (
    <div className="...">
      {children}
    </div>
  );
}
```

### Server vs Client Components

**Server Component (default)**:
```tsx
// app/page.tsx o components/Footer.tsx
// NO tiene 'use client'
// Puede hacer fetch directamente
// No puede usar hooks (useState, useEffect)

export default function ServerComponent() {
  // Puede ser async
  return <div>Content</div>;
}
```

**Client Component**:
```tsx
// components/Navigation.tsx
'use client'; // Necesario si usa hooks o event handlers

import { useState } from 'react';

export default function ClientComponent() {
  const [state, setState] = useState(false);

  return (
    <button onClick={() => setState(true)}>
      Click me
    </button>
  );
}
```

**Cuándo usar cada uno**:
- **Server Component**: Por defecto. Para contenido estático, fetch de datos.
- **Client Component**: Si necesitas interactividad (onClick, useState, useEffect, etc.)

### Convenciones de Nombres

**Archivos**:
- Componentes: `PascalCase.tsx` (ej. `Navigation.tsx`)
- Páginas: `page.tsx` (Next.js 14 App Router)
- Utilidades: `camelCase.ts` (ej. `wordpress.ts`)
- Estilos: `kebab-case.css` (ej. `tokens.css`)

**Variables y Funciones**:
- Variables: `camelCase` (ej. `const userName = 'Fabian'`)
- Funciones: `camelCase` (ej. `function fetchPosts() {}`)
- Componentes: `PascalCase` (ej. `function Navigation() {}`)
- Constantes: `UPPER_SNAKE_CASE` (ej. `const API_URL = '...'`)

### Clases de Tailwind

**Orden recomendado**:
```tsx
<div className="
  layout (flex, grid, block)
  position (relative, absolute)
  size (w-, h-)
  spacing (m-, p-)
  typography (text-, font-)
  colors (bg-, text-)
  borders (border, rounded)
  effects (shadow-, opacity-)
  interactions (hover:, focus:)
  responsive (sm:, md:, lg:)
">
```

**Ejemplo**:
```tsx
<button className="
  flex items-center gap-2
  px-4 py-2
  text-sm font-semibold
  bg-gradient-cosmic text-white
  rounded-lg
  hover:shadow-glow
  transition-all duration-300
">
  Subscribe
</button>
```

### Importaciones

**Orden de imports**:
```tsx
// 1. React y Next.js
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';

// 2. Componentes externos
import ExternalComponent from 'external-package';

// 3. Componentes internos
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

// 4. Utilidades y funciones
import { fetchPosts } from '@/lib/wordpress';

// 5. Tipos
import type { Post } from '@/types';

// 6. Estilos (si aplica)
import './styles.css';
```

### Estructura de Páginas

```tsx
// app/nombre-pagina/page.tsx
import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

// 1. Metadata SEO
export const metadata: Metadata = {
  title: 'Título de la Página',
  description: 'Descripción para SEO',
};

// 2. Página (Server Component por defecto)
export default function NombrePage() {
  return (
    <>
      <Navigation />

      <main className="min-h-screen bg-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Contenido aquí */}
        </div>
      </main>

      <Footer />
    </>
  );
}
```

---

## 🚨 REGLAS DE ORO

### ❌ NUNCA Hagas Esto

```bash
# ❌ Push directo a main
git push origin main

# ❌ Trabajar en main
git checkout main
# ... hacer cambios ...
git push

# ❌ Deploy sin build local
git push  # sin haber corrido npm run build

# ❌ Commit sin mensaje descriptivo
git commit -m "fix"
git commit -m "cambios"

# ❌ Agregar node_modules, .env, o .next
git add node_modules/  # NUNCA
git add .env.local     # NUNCA
git add .next/         # NUNCA
```

### ✅ SIEMPRE Haz Esto

```bash
# ✅ Crea rama para cada cambio
git checkout -b feature/nueva-cosa

# ✅ Prueba localmente
npm run dev

# ✅ Verifica build
npm run build

# ✅ Mensaje de commit descriptivo
git commit -m "Feature: Agrega formulario de newsletter"

# ✅ Push a tu rama
git push -u origin feature/nueva-cosa

# ✅ Revisa PR antes de merge
```

### 📋 Checklist Antes de Merge

Antes de hacer merge a `main`, verifica:

- [ ] ✅ Corriste `npm run dev` y probaste localmente
- [ ] ✅ Corriste `npm run build` sin errores
- [ ] ✅ Revisaste visualmente los cambios en navegador
- [ ] ✅ Probaste en móvil (o DevTools responsive mode)
- [ ] ✅ Commit tiene mensaje descriptivo
- [ ] ✅ Revisaste el diff en GitHub
- [ ] ✅ No hay conflictos de merge
- [ ] ✅ No estás commiteando `node_modules/`, `.env`, o `.next/`
- [ ] ✅ Estás 100% seguro de los cambios

---

## 🆘 TROUBLESHOOTING

### Build Falla

**Error**: `npm run build` muestra errores

**Solución**:
```bash
# 1. Lee el error completo
npm run build

# 2. Errores comunes:

# - Import no encontrado
# Verifica que el path sea correcto: '@/components/...'

# - Export default faltante
# Agrega 'export default' al componente

# - Error de TypeScript
# Verifica los tipos: las props, interfaces, etc.

# - Imagen no encontrada
# Verifica que la imagen existe en public/

# 3. Corrige el error y vuelve a intentar
npm run build
```

### Dev Server No Inicia

**Error**: `npm run dev` no funciona

**Solución**:
```bash
# Reinstala dependencias
rm -rf node_modules package-lock.json .next
npm install
npm run dev
```

### Conflictos de Git

**Error**: Git muestra conflictos al hacer merge

**Solución**:
```bash
# 1. Actualiza main
git checkout main
git pull origin main

# 2. Vuelve a tu rama
git checkout tu-rama

# 3. Merge main en tu rama
git merge main

# 4. Abre VSCode, verás los conflictos marcados
# Resuelve cada conflicto eligiendo qué código mantener

# 5. Cuando termines
git add .
git commit -m "Resuelve conflictos con main"
git push
```

### Cambios No Aparecen en Producción

**Problema**: Hiciste merge pero el sitio no cambió

**Solución**:
```bash
# 1. Verifica que el merge fue a main
# Ve a GitHub y confirma que el PR se mergeó a 'main'

# 2. Verifica el deploy en Vercel
# Ve a https://vercel.com/dashboard
# Busca el proyecto y revisa el último deploy
# Debería decir "Production" y estar "Ready"

# 3. Espera 2-3 minutos
# A veces tarda un poco

# 4. Fuerza refresh en navegador
# Ctrl+Shift+R (Windows/Linux)
# Cmd+Shift+R (Mac)

# 5. Si aún no aparece, verifica errores en Vercel logs
```

### Estilos No Se Aplican

**Problema**: Cambiaste CSS pero no se ve el cambio

**Solución**:
```bash
# 1. Verifica que guardaste el archivo

# 2. Si es tokens.css o globals.css:
# Reinicia el dev server
# Ctrl+C para detenerlo
npm run dev

# 3. Limpia cache del navegador
# Ctrl+Shift+R (force refresh)

# 4. Verifica que el className sea correcto
# Si es Tailwind: usa clases de Tailwind
# Si es CSS custom: usa las clases definidas en tu CSS
```

### Error: "Can't resolve '@/components/...'"

**Problema**: Import no funciona

**Solución**:
```bash
# 1. Verifica que el archivo existe
ls components/NombreComponente.tsx

# 2. Verifica la extensión (.tsx o .ts)

# 3. Verifica el export default
# El componente debe tener: export default function NombreComponente() {}

# 4. Si creaste un componente nuevo, reinicia dev server
# Ctrl+C
npm run dev
```

---

## 🚀 COMANDOS RÁPIDOS

```bash
# Crear rama y cambiar a ella
git checkout -b nombre-rama

# Ver estado de Git
git status

# Ver qué rama estás usando
git branch

# Volver a main
git checkout main

# Actualizar desde remoto
git pull origin main

# Ver diferencias antes de commit
git diff

# Ver historial de commits
git log --oneline

# Descartar cambios no guardados de un archivo
git checkout -- archivo.tsx

# Eliminar rama local (después de merge)
git branch -d nombre-rama

# Dev server
npm run dev

# Build para verificar que compila
npm run build

# Linter
npm run lint
```

---

## 🎓 PARA CLAUDE CODE/COPILOT

### Instrucciones Específicas para AI

**Cuando el usuario pida hacer un cambio**:

1. **Identifica el tipo de cambio** usando el árbol de decisión
2. **Lee el archivo correspondiente** antes de sugerir cambios
3. **Propón los cambios específicos** con código exacto
4. **Sigue el workflow de 5 pasos**:
   - Crear rama
   - Hacer cambios
   - Verificar con `npm run dev` y `npm run build`
   - Commit
   - Push y PR
5. **Usa las convenciones del proyecto**: nombres, estructura, Tailwind, etc.
6. **Si no estás seguro**, pregunta antes de hacer cambios

**Contexto importante**:
- Este es un proyecto Next.js 14 con App Router
- Usa Server Components por defecto (solo Client Components cuando sea necesario)
- Tailwind CSS para estilos
- WordPress headless como backend (fetch desde `lib/wordpress.ts`)
- Deploy automático en Vercel al hacer merge a `main`

**Nunca hagas**:
- Push directo a main
- Cambios sin verificar build (`npm run build`)
- Modificar archivos de configuración sin razón clara
- Crear componentes nuevos si ya existe uno similar

**Siempre pregunta**:
- Si hay múltiples formas de hacer algo
- Si el cambio afecta múltiples archivos
- Si no estás seguro de la intención del usuario

---

## 📞 RECURSOS

- **Repo GitHub**: https://github.com/FabianIMV/consciousness-frontend/
- **Producción**: https://consciousnessnetworks.com
- **WordPress Backend**: https://wp.consciousnessnetworks.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS Docs**: https://tailwindcss.com/docs

---

**Última actualización**: 2025-12-17

**¿Listo para hacer cambios seguros?** Sigue este workflow y tu código llegará a producción sin problemas. 🚀
