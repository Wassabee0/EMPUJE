type CanUseDevAdminPanelInput = {
  hasSupabaseConfig: boolean;
  nodeEnv?: string;
  providedCode?: string | string[];
  expectedCode?: string;
};

export const defaultDevAdminCode = "local";

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export function getDevAdminAccessCode() {
  return process.env.DEV_ADMIN_ACCESS_CODE?.trim() || defaultDevAdminCode;
}

export function canUseDevAdminPanel({
  hasSupabaseConfig,
  nodeEnv,
  providedCode,
  expectedCode,
}: CanUseDevAdminPanelInput) {
  if (hasSupabaseConfig || nodeEnv === "production") return false;

  const expected = (expectedCode ?? defaultDevAdminCode).trim();
  if (!expected) return false;

  return firstValue(providedCode)?.trim() === expected;
}
