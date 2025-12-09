// Regex patterns
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const HAS_LOWERCASE = /[a-z]/;
const HAS_UPPERCASE = /[A-Z]/;
const HAS_NUMBER = /[0-9]/;
const HAS_SPECIAL = /[!@#$%^&*(),.?":{}|<>]/;

export type PasswordStrength = "weak" | "medium" | "strong" | null;

export interface PasswordValidation {
  strength: PasswordStrength;
  score: number;
  hasMinLength: boolean;
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export function validatePassword(password: string): PasswordValidation {
  if (!password) {
    return {
      strength: null,
      score: 0,
      hasMinLength: false,
      hasLowercase: false,
      hasUppercase: false,
      hasNumber: false,
      hasSpecial: false,
    };
  }

  const hasMinLength = password.length >= 8;
  const hasLowercase = HAS_LOWERCASE.test(password);
  const hasUppercase = HAS_UPPERCASE.test(password);
  const hasNumber = HAS_NUMBER.test(password);
  const hasSpecial = HAS_SPECIAL.test(password);

  let score = 0;
  if (hasMinLength) score++;
  if (password.length >= 12) score++;
  if (hasLowercase) score++;
  if (hasUppercase) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;

  let strength: PasswordStrength;
  if (score <= 2) strength = "weak";
  else if (score <= 4) strength = "medium";
  else strength = "strong";

  return {
    strength,
    score,
    hasMinLength,
    hasLowercase,
    hasUppercase,
    hasNumber,
    hasSpecial,
  };
}

export function isPasswordValid(password: string): boolean {
  const { strength } = validatePassword(password);
  return strength === "medium" || strength === "strong";
}

export function isEmailValid(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function doPasswordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword && password.length > 0;
}
