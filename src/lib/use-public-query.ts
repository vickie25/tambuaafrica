import { useLocation } from "react-router-dom";
import {
  getSiteSnapshot,
  hasSiteSnapshot,
  isLiveDataPath,
  LIVE_QUERY_OPTIONS,
  STATIC_QUERY_OPTIONS,
} from "@/lib/site-snapshot";

/** Pick static vs live React Query behavior based on route and build snapshot. */
export function usePublicQueryMode() {
  const { pathname } = useLocation();
  const live = isLiveDataPath(pathname);
  const snapshot = getSiteSnapshot();
  const useStatic = !live && hasSiteSnapshot();

  return {
    live,
    useStatic,
    snapshot,
    queryOptions: useStatic ? STATIC_QUERY_OPTIONS : LIVE_QUERY_OPTIONS,
  };
}
