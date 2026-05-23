import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { Separator } from "@/components/ui/separator";

type AuthGoogleSectionProps = {
  redirectPath?: string;
  label?: string;
  dividerPosition?: "above" | "below";
};

/** Google sign in/up block shown at the top of auth cards. */
const AuthGoogleSection = ({
  redirectPath = "/dashboard",
  label = "Continue with Google",
  dividerPosition = "below",
}: AuthGoogleSectionProps) => (
  <div className="space-y-4">
    <GoogleSignInButton redirectPath={redirectPath} label={label} />
    <div className="relative py-1">
      <Separator />
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {dividerPosition === "below" ? "or use email" : "or"}
      </span>
    </div>
  </div>
);

export default AuthGoogleSection;
