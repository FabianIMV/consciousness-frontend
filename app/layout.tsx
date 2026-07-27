/**
 * Pass-through root layout.
 *
 * `<html>` and `<body>` are rendered by `app/[lang]/layout.tsx`, which knows the
 * locale and can set the `lang` attribute. Routes outside that segment — the
 * root 404 — render their own document shell.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
