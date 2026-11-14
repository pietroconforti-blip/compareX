export type MobileIntegrationStatus = "research" | "not_configured" | "sandbox" | "live";
export type MobileProviderCapability = "catalogue" | "eligibility_check" | "application_submission" | "identity_verification" | "contract_activation" | "payment" | "status_webhook";
export type MobileProviderRegistration = { slug: string; name: string; integrationStatus: MobileIntegrationStatus; capabilities: MobileProviderCapability[]; note: string };

// These are integration prospects, not live connections. Never mark sandbox/live
// until the provider has supplied credentials and approved end-to-end testing.
export const mobileProviderRegistry: MobileProviderRegistration[] = [
  { slug: "spusu", name: "spusu", integrationStatus: "not_configured", capabilities: ["catalogue"], note: "Public offer information is listed; no application API credentials or partner authorisation are configured." },
  { slug: "yesss", name: "yesss!", integrationStatus: "not_configured", capabilities: ["catalogue"], note: "Public offer information is listed; no application API credentials or partner authorisation are configured." },
];

export function getMobileProvider(slug: string) {
  return mobileProviderRegistry.find(provider => provider.slug === slug) ?? null;
}
