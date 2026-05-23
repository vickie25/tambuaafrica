import { PASSWORD_RULES } from "@/lib/password-policy";
import { cn } from "@/lib/utils";

type PasswordRequirementsProps = {
  password: string;
  className?: string;
};

const PasswordRequirements = ({ password, className }: PasswordRequirementsProps) => (
  <ul className={cn("text-xs space-y-1 text-muted-foreground", className)} aria-live="polite">
    {PASSWORD_RULES.map((rule) => {
      const ok = rule.test(password);
      return (
        <li key={rule.id} className={cn("flex items-center gap-2", ok && "text-green-700 dark:text-green-400")}>
          <span aria-hidden>{ok ? "✓" : "○"}</span>
          {rule.label}
        </li>
      );
    })}
  </ul>
);

export default PasswordRequirements;
