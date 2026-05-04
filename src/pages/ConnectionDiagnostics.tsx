import { Helmet } from "react-helmet-async";
import { ConnectionStatus } from "@/components/ui/connection-status";
import { SITE_NAME } from "@/lib/seo";

export const ConnectionDiagnostics = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background p-4 pt-24">
      <Helmet>
        <title>{`Connection diagnostics | ${SITE_NAME}`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <ConnectionStatus />
    </div>
  );
};

export default ConnectionDiagnostics;
