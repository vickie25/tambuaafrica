import { lazy, Suspense, useEffect, useState } from "react";

const AIAgentChat = lazy(() =>
  import("@/components/chat/AIAgentChat").then((m) => ({ default: m.AIAgentChat })),
);

/** Loads Ashley chat after idle so the home page avoids 5+ data hooks on first paint. */
export default function LazyAIAgentChat() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const run = () => setReady(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(run, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const t = window.setTimeout(run, 2500);
    return () => window.clearTimeout(t);
  }, []);

  if (!ready) return null;

  return (
    <Suspense fallback={null}>
      <AIAgentChat />
    </Suspense>
  );
}
