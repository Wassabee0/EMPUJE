type SecurityEventName =
  | "signup_spike_external"
  | "onboarding_submit"
  | "onboarding_rejected"
  | "upload_quota_rejected"
  | "admin_export";

type SecurityEventInput = {
  userId?: string | null;
  action?: string;
  metadata?: Record<string, unknown>;
};

const sensitiveMetadataKey = /(email|password|secret|token|url|link|path|hash)/i;

function sanitizeMetadata(metadata: Record<string, unknown> = {}) {
  return Object.fromEntries(
    Object.entries(metadata).filter(([key, value]) => {
      if (sensitiveMetadataKey.test(key)) return false;
      return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
    }),
  );
}

export function buildSecurityEvent(event: SecurityEventName, input: SecurityEventInput = {}) {
  return {
    source: "empuje",
    event,
    at: new Date().toISOString(),
    userId: input.userId ?? null,
    action: input.action ?? null,
    metadata: sanitizeMetadata(input.metadata),
  };
}

export function logSecurityEvent(event: SecurityEventName, input: SecurityEventInput = {}) {
  console.info(JSON.stringify(buildSecurityEvent(event, input)));
}
