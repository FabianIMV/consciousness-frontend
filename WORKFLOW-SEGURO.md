# 🛡️ Workflow Seguro - Consciousness Networks Frontend

Guía para trabajar en el blog sin romper producción cuando usas CI/CD pipelines.

---

## 📁 Dónde Trabajar

**Trabaja directamente en la carpeta `consciouness-blog`** - esta es tu carpeta principal del proyecto.

### Estructura del Proyecto

```
consciouness-blog/
├── app/          ← Páginas y rutas (Next.js 14 App Router)
├── components/   ← Componentes React reutilizables
├── styles/       ← CSS, Tailwind, tokens de diseño
├── public/       ← Imágenes, archivos estáticos
├── lib/          ← Funciones auxiliares y utilidades
├── approach-*    ← IGNORAR (solo documentación)
└── *.md          ← Documentación del proyecto
```

**Carpetas importantes:**
- `app/` - Aquí están todas las páginas (home, blog, papers, contact, etc.)
- `components/` - Componentes reutilizables del UI
- `styles/` - Estilos globales y configuración de Tailwind
- `public/` - Imágenes y assets estáticos

**Carpetas que puedes ignorar:**
- `approach-1-wpcli/`, `approach-2-timber/`, `approach-3-headless/` - Solo documentación

---

## 🔄 Workflow Seguro (5 Pasos)

### 1️⃣ Crear Rama Nueva (SIEMPRE)

```bash
# Asegúrate de estar en main actualizado
git checkout main
git pull origin main

# Crea una rama para tu cambio
git checkout -b nombre-descriptivo

# Ejemplos de nombres de rama:
git checkout -b mejora-diseño-home
git checkout -b fix-navegacion-mobile
git checkout -b feature-dark-mode
git checkout -b actualiza-footer
```

### 2️⃣ Trabajar y Probar Localmente

```bash
# Instala dependencias (solo la primera vez o si cambia package.json)
npm install

# Inicia el servidor de desarrollo
npm run dev

# Abre http://localhost:3000 en tu navegador
# Haz tus cambios y verifica que todo funcione
```

**Archivos comunes a editar:**
- `app/page.tsx` - Página de inicio
- `app/blog/page.tsx` - Página del blog
- `components/Header.tsx` - Navegación
- `styles/globals.css` - Estilos globales
- `tailwind.config.ts` - Configuración de Tailwind

### 3️⃣ Verificar que Compile sin Errores

```bash
# Prueba que el build funcione correctamente
npm run build

# Si hay errores, corrígelos antes de continuar
# Si todo está bien, continúa al siguiente paso
```

### 4️⃣ Hacer Commit de tus Cambios

```bash
# Ver qué archivos cambiaste
git status

# Agregar los archivos al staging
git add .

# Hacer commit con un mensaje descriptivo
git commit -m "Descripción clara de los cambios"

# Ejemplos de buenos mensajes:
git commit -m "Mejora diseño del hero section en homepage"
git commit -m "Fix navegación mobile en tablets"
git commit -m "Agrega modo oscuro a todas las páginas"
```

### 5️⃣ Push y Pull Request

```bash
# Push a TU RAMA (NO a main directamente)
git push -u origin nombre-de-tu-rama

# Ejemplo:
git push -u origin mejora-diseño-home
```

**Luego en GitHub:**
1. Ve a https://github.com/FabianIMV/consciousness-frontend/
2. Verás un botón amarillo "Compare & pull request" - haz clic
3. Revisa los cambios en la vista de diferencias
4. Escribe una descripción de lo que cambiaste
5. Crea el Pull Request
6. **Revisa todo una vez más**
7. Cuando estés 100% seguro, haz "Merge Pull Request"
8. Vercel desplegará automáticamente a producción

---

## 🚨 Reglas de Oro (NO ROMPER PRODUCCIÓN)

### ❌ NUNCA Hagas Esto

```bash
# ❌ NO hagas push directo a main sin revisar
git push origin main

# ❌ NO trabajes directamente en la rama main
git checkout main
# ... hacer cambios ...
git push

# ❌ NO hagas deploy sin probar localmente
git push  # sin haber corrido npm run dev

# ❌ NO hagas commit sin mensaje descriptivo
git commit -m "cambios"
git commit -m "fix"
```

### ✅ SIEMPRE Haz Esto

```bash
# ✅ Crea una rama nueva para cada cambio
git checkout -b mi-nueva-feature

# ✅ Prueba localmente SIEMPRE
npm run dev

# ✅ Verifica que compile sin errores
npm run build

# ✅ Usa mensajes de commit descriptivos
git commit -m "Agrega formulario de contacto con validación"

# ✅ Push a tu rama, no a main
git push -u origin mi-nueva-feature

# ✅ Revisa el Pull Request antes de hacer merge
```

---

## 📋 Checklist Antes de Hacer Merge

Antes de hacer merge de tu Pull Request a main, verifica:

- [ ] ✅ Corriste `npm run dev` y probaste localmente
- [ ] ✅ Corriste `npm run build` sin errores
- [ ] ✅ Revisaste visualmente los cambios en el navegador
- [ ] ✅ Probaste en móvil (o con DevTools modo responsive)
- [ ] ✅ El commit tiene un mensaje descriptivo
- [ ] ✅ Revisaste el diff en GitHub antes de hacer merge
- [ ] ✅ No hay conflictos de merge
- [ ] ✅ Estás 100% seguro de los cambios

---

## 🎯 Ejemplo Práctico Completo

Digamos que quieres mejorar el diseño del footer:

```bash
# Paso 1: Preparar el entorno
git checkout main
git pull origin main
git checkout -b mejora-footer

# Paso 2: Hacer cambios
# Edita app/components/Footer.tsx (o el archivo que necesites)
code app/components/Footer.tsx

# Paso 3: Probar localmente
npm run dev
# Abre http://localhost:3000 y verifica el footer

# Paso 4: Verificar que compile
npm run build
# Si hay errores, corrígelos y vuelve a intentar

# Paso 5: Commit
git add .
git commit -m "Actualiza diseño del footer con mejor espaciado y colores"

# Paso 6: Push a tu rama
git push -u origin mejora-footer

# Paso 7: En GitHub
# - Crea Pull Request
# - Revisa los cambios
# - Haz merge cuando estés seguro

# Paso 8: Vercel despliega automáticamente
# - Espera 2-3 minutos
# - Verifica en consciousnessnetworks.com
```

---

## 🆘 Troubleshooting

### Si algo se rompe en producción

```bash
# Opción 1: Revertir el último commit
git revert HEAD
git push origin main

# Opción 2: Volver a un commit anterior específico
git log  # encuentra el hash del commit bueno
git revert HASH_DEL_COMMIT
git push origin main

# Opción 3: En GitHub
# Ve al Pull Request que causó el problema
# Haz clic en "Revert"
```

### Si npm run dev no funciona

```bash
# Reinstala dependencias
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Si el build falla

```bash
# Revisa los errores en la terminal
npm run build

# Errores comunes:
# - Importaciones incorrectas
# - Componentes sin export default
# - Errores de TypeScript
# - Variables de entorno faltantes
```

### Si Git muestra conflictos

```bash
# Actualiza tu rama con los cambios de main
git checkout main
git pull origin main
git checkout tu-rama
git merge main

# Resuelve los conflictos en VSCode
# Luego:
git add .
git commit -m "Resuelve conflictos con main"
git push
```

---

## 🚀 Comandos Más Usados

```bash
# Ver estado actual
git status

# Ver qué rama estás usando
git branch

# Cambiar de rama
git checkout nombre-rama

# Crear y cambiar a nueva rama
git checkout -b nueva-rama

# Ver historial de commits
git log --oneline

# Ver diferencias antes de commit
git diff

# Descartar cambios no guardados
git checkout -- archivo.tsx

# Actualizar desde remoto
git pull origin main

# Ver ramas remotas
git branch -r

# Eliminar rama local (después de merge)
git branch -d nombre-rama
```

---

## 📊 Arquitectura del Deploy

```
Tu Editor                GitHub                 Vercel                 Producción
─────────              ─────────              ─────────              ─────────────

VSCode                   Repo                  Build                consciousnessnetworks.com
  │                       │                     │                           │
  ├─ Editas código        │                     │                           │
  ├─ npm run dev          │                     │                           │
  ├─ git commit           │                     │                           │
  └─ git push         ────┼─► PR created        │                           │
                          │                     │                           │
                          ├─► Review PR         │                           │
                          │                     │                           │
                          ├─► Merge to main ────┼─► Auto build              │
                          │                     ├─► Run tests               │
                          │                     ├─► Deploy                  │
                          │                     └─► Live ──────────────────►│
                          │                                                 │
                          │                      (2-3 minutos)               │
```

---

## ✨ Tips Pro

1. **Nombres de rama descriptivos**: Usa prefijos como `feature/`, `fix/`, `mejora/`
   ```bash
   git checkout -b feature/modo-oscuro
   git checkout -b fix/error-formulario
   git checkout -b mejora/performance-imagenes
   ```

2. **Commits pequeños y frecuentes**: Es mejor hacer muchos commits pequeños que uno gigante

3. **Usa .gitignore**: Ya está configurado, pero asegúrate de no commitear:
   - `node_modules/`
   - `.env.local`
   - `.next/`

4. **Preview de Vercel**: Cada push a una rama crea un preview URL automático para probar

5. **Aprovecha el Hot Reload**: Con `npm run dev`, los cambios se ven instantáneamente

---

## 📞 Recursos

- **Repo GitHub**: https://github.com/FabianIMV/consciousness-frontend/
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vercel Dashboard**: https://vercel.com/dashboard

---

**¿Listo para hacer cambios seguros?** Sigue este workflow y nunca romperás producción. 🛡️
