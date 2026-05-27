import { Helmet } from "react-helmet-async";

/** Inject JSON-LD via its own Helmet instance (never nest inside another Helmet). */
const JsonLd = ({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) => {
  const blocks = Array.isArray(data) ? data : [data];
  return (
    <Helmet>
      {blocks.map((block, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(block)}
        </script>
      ))}
    </Helmet>
  );
};

export default JsonLd;