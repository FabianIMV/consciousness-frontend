/**
 * Emits a schema.org graph. `<` is escaped so a stray `</script>` inside any
 * WordPress-derived string cannot close the tag early.
 */
export default function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
