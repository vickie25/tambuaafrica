import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SUPABASE_STORAGE_BUCKET } from "@/lib/supabase-config";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Activity, ShieldAlert, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AdminHealth = () => {
  const { user, role, isAdmin } = useAuth();
  const [latency, setLatency] = useState<number | null>(null);
  const [dbConn, setDbConn] = useState<'checking' | 'ok' | 'fail'>('checking');
  const [storageConn, setStorageConn] = useState<'checking' | 'ok' | 'fail'>('checking');
  const [tablesOk, setTablesOk] = useState<'checking' | 'ok' | 'fail'>( 'checking');
  const [bucketExists, setBucketExists] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  const performCheck = async () => {
    setChecking(true);
    const start = Date.now();
    try {
      // 1. Check DB Latency & Connection
      const { error: dbError } = await supabase.from('profiles').select('id').limit(1);
      setLatency(Date.now() - start);
      setDbConn(dbError ? 'fail' : 'ok');

      // 2. Check Admin Tables
      const checkTables = async () => {
        const { error: sErr } = await supabase.from('safaris').select('id').limit(1);
        const { error: dErr } = await supabase.from('destinations').select('id').limit(1);
        const { error: bErr } = await supabase.from('blogs').select('id').limit(1);
        const { error: iErr } = await supabase.from('inquiry_submissions').select('id').limit(1);
        return !sErr && !dErr && !bErr && !iErr;
      };
      const tablesExist = await checkTables();
      setTablesOk(tablesExist ? 'ok' : 'fail');

      // 3. Check Storage Permissions
      const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
      const hasBucket = !storageError && Array.isArray(buckets) && buckets.some((bucket) => bucket.name === SUPABASE_STORAGE_BUCKET);
      setBucketExists(hasBucket);
      setStorageConn(storageError || !hasBucket ? 'fail' : 'ok');
    } catch (err) {
      setDbConn('fail');
      setTablesOk('fail');
      setStorageConn('fail');
      setBucketExists(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    performCheck();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Status</CardTitle>
            {dbConn === 'ok' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dbConn === 'ok' ? "Online" : dbConn === 'checking' ? "Checking..." : "Offline"}</div>
            <p className="text-xs text-muted-foreground mt-1">Supabase Real-time API</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latency (Ping)</CardTitle>
            <Activity className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${latency && latency > 800 ? "text-red-500" : "text-white"}`}>
              {latency ? `${latency}ms` : "---"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {latency && latency > 800 ? "High latency detected" : "Connection stable"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upload Permission</CardTitle>
            {storageConn === 'ok' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <ShieldAlert className="h-4 w-4 text-red-500" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storageConn === 'ok' ? "Granted" : "Blocked"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Supabase Storage RLS Check
              {bucketExists === false ? ` — missing bucket '${SUPABASE_STORAGE_BUCKET}'` : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Table Sync</CardTitle>
            {tablesOk === 'ok' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <ShieldAlert className="h-4 w-4 text-red-500" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tablesOk === 'ok' ? "Healthy" : tablesOk === 'checking' ? "Checking..." : "Missing Tables"}</div>
            <p className="text-xs text-muted-foreground mt-1">Safaris, Destinations, Blogs, Inquiries</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-accent/20 bg-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>System Performance Diagnostic</CardTitle>
          <CardDescription>If the latency is above 1000ms, the admin panel will feel unresponsive regardless of code optimizations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {latency && latency > 1000 ? (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <WifiOff className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-500">Severe Network Lag</h4>
                <p className="text-sm text-red-400">Your connection to the database is very slow. This causes the "tiring" experience you're feeling. Please try using a more stable network if possible.</p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-500">Network Optimal</h4>
                <p className="text-sm text-green-400">Your connection is stable. Any perceived lag might be due to a long-running development server.</p>
              </div>
            </div>
          )}

          {!isAdmin && (
             <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
             <ShieldAlert className="h-5 w-5 text-red-500 mt-0.5" />
             <div>
               <h4 className="font-semibold text-red-500">Database Permissions Blocked</h4>
               <p className="text-sm text-red-400">You do not have administrative roles in the database. <strong>Uploads will fail!</strong> Please run the SQL snippet provided in the instructions.</p>
             </div>
           </div>
          )}

          {tablesOk === 'fail' && (
             <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
             <ShieldAlert className="h-5 w-5 text-red-500 mt-0.5" />
             <div>
               <h4 className="font-semibold text-red-500">Missing Database Tables</h4>
               <p className="text-sm text-red-400">The Admin tables (Safaris, Destinations, Blogs, or Inquiries) were not found in Supabase. <strong>Changes cannot be saved!</strong> Please run the `full_initialize.sql` script in your Supabase SQL Editor.</p>
             </div>
           </div>
          )}

          <Button 
            onClick={performCheck} 
            disabled={checking}
            variant="outline"
            className="w-full sm:w-auto"
          >
            {checking ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Activity className="mr-2 h-4 w-4" />}
            Run Diagnostic Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
