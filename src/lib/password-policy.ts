/** Strong password rules for signup, reset, and profile updates. */

export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_HINT =
  "Use at least 8 characters with uppercase, lowercase, a number, and a symbol (e.g. !@#$).";

type Rule = { id: string; label: string; test: (p: string) => boolean };

export const PASSWORD_RULES: Rule[] = [
  { id: "length", label: `At least ${PASSWORD_MIN_LENGTH} characters`, test: (p) => p.length >= PASSWORD_MIN_LENGTH },
  { id: "lower", label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { id: "upper", label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { id: "number", label: "One number", test: (p) => /[0-9]/.test(p) },
  { id: "symbol", label: "One symbol (!@#$…)", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export function validatePassword(password: string): { valid: boolean; message: string } {
  for (const rule of PASSWORD_RULES) {
    if (!rule.test(password)) {
      return { valid: false, message: rule.label };
    }
  }
  return { valid: true, message: "" };
}
