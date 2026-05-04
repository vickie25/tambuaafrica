import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SUPABASE_STORAGE_BUCKET } from "@/lib/supabase-config";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, XCircle, Activity, ShieldAlert, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AdminHealth = () => {
  const { isAdmin } = useAuth();
  const [latency, setLatency] = useState<number | null>(null);
  const [dbConn, setDbConn] = useState<"checking" | "ok" | "fail">("checking");
  const [storageConn, setStorageConn] = useState<"checking" | "ok" | "fail">("checking");
  const [tablesOk, setTablesOk] = useState<"checking" | "ok" | "fail">("checking");
  const [bucketExists, setBucketExists] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  const performCheck = async () => {
    setChecking(true);
    const start = Date.now();
    try {
      const { error: dbError } = await supabase.from("profiles").select("id").limit(1);
      setLatency(Date.now() - start);
      setDbConn(dbError ? "fail" : "ok");

      const checkTables = async () => {
        const { error: sErr } = await supabase.from("safaris").select("id").limit(1);
        const { error: dErr } = await supabase.from("destinations").select("id").limit(1);
        const { error: bErr } = await supabase.from("blogs").select("id").limit(1);
        const { error: iErr } = await supabase.from("inquiry_submissions").select("id").limit(1);
        return !sErr && !dErr && !bErr && !iErr;
      };
      const tablesExist = await checkTables();
      setTablesOk(tablesExist ? "ok" : "fail");

      const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
      const hasBucket =
        !storageError && Array.isArray(buckets) && buckets.some((bucket) => bucket.name === SUPABASE_STORAGE_BUCKET);
      setBucketExists(hasBucket);
      setStorageConn(storageError || !hasBucket ? "fail" : "ok");
    } catch {
      setDbConn("fail");
      setTablesOk("fail");
      setStorageConn("fail");
      setBucketExists(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    performCheck();
  }, []);

  const latencySlow = latency !== null && latency > 800;
  const latencyBad = latency !== null && latency > 1000;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            {dbConn === "checking" ? (
              <Activity className="h-4 w-4 text-muted-foreground" />
            ) : dbConn === "ok" ? (
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            ) : (
              <XCircle className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">
              {dbConn === "ok" ? "Reachable" : dbConn === "checking" ? "..." : "Problem"}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Simple read on profiles</p>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Round trip</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-xl font-semibold tabular-nums ${latencyBad ? "text-destructive" : latencySlow ? "text-amber-700 dark:text-amber-500" : "text-foreground"}`}
            >
              {latency !== null ? `${latency} ms` : "..."}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {latencyBad ? "Feels sluggish; try another network." : latencySlow ? "A bit slow but usable." : "Rough ping to Supabase"}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            {storageConn === "ok" ? (
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            ) : (
              <ShieldAlert className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">{storageConn === "ok" ? "OK" : storageConn === "checking" ? "..." : "Issue"}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Buckets and name{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">{SUPABASE_STORAGE_BUCKET}</code>
              {bucketExists === false ? " (bucket not found)" : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Core tables</CardTitle>
            {tablesOk === "ok" ? (
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            ) : (
              <ShieldAlert className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">
              {tablesOk === "ok" ? "Found" : tablesOk === "checking" ? "..." : "Missing"}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Safaris, destinations, blogs, enquiries</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Notes</CardTitle>
          <CardDescription>Nothing here fixes servers for you; it is only a quick sanity check from this browser.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {latencyBad ? (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/25 bg-destructive/5 p-4">
              <WifiOff className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Slow link</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Over about a second per round trip, saves and uploads feel sticky. Try cable or another hotspot if you
                  are on Wi-Fi.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-medium text-foreground">Link looks fine</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  If the UI still lags, it is often local dev (hot reload) or a heavy page, not Supabase itself.
                </p>
              </div>
            </div>
          )}

          {!isAdmin && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/25 bg-destructive/5 p-4">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Role</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  This account is not marked admin in the app. Uploads and some writes may be blocked until your profile
                  role matches what RLS expects.
                </p>
              </div>
            </div>
          )}

          {tablesOk === "fail" && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/25 bg-destructive/5 p-4">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Tables</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  One or more of safaris, destinations, blogs, inquiry_submissions did not respond. Run your Supabase
                  setup SQL (for example full_initialize.sql) if this is a new project.
                </p>
              </div>
            </div>
          )}

          <Button onClick={performCheck} disabled={checking} variant="outline" size="sm" className="w-full sm:w-auto">
            {checking ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Activity className="mr-2 h-4 w-4" />}
            Run check again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
