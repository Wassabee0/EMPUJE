import { redirect } from "next/navigation";

import { ConfigurationNotice } from "@/components/configuration-notice";
import { OnboardingForm } from "@/components/onboarding-form";
import { SiteHeader } from "@/components/site-header";
import { hasSupabaseServerConfig } from "@/lib/env";
import { getCurrentUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type OnboardingPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function canUseDevOnboardingPreview(params: Record<string, string | string[] | undefined>) {
  const value = Array.isArray(params.dev_preview) ? params.dev_preview[0] : params.dev_preview;
  return process.env.NODE_ENV !== "production" && value === "local";
}

function OnboardingContent() {
  return (
    <div className="page-shell">
      <SiteHeader />
      <main>
        <section className="page-head">
          <div className="container">
            <span className="eyebrow">Configuración de cuenta</span>
            <h1 style={{ fontSize: "3rem" }}>Tu perfil de Empuje empieza pendiente de revisión.</h1>
            <p className="lead">
              Al enviarlo, entrarás en un panel con tu estado, evidencias de oferta y oportunidades privadas cuando se
              aprueben.
            </p>
          </div>
        </section>
        <section className="section">
          <div className="container">
            <OnboardingForm />
          </div>
        </section>
      </main>
    </div>
  );
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = (await searchParams) ?? {};

  if (!hasSupabaseServerConfig()) {
    if (canUseDevOnboardingPreview(params)) {
      return <OnboardingContent />;
    }

    return (
      <div className="page-shell">
        <SiteHeader />
        <main className="section">
          <div className="container">
            <ConfigurationNotice />
          </div>
        </main>
      </div>
    );
  }

  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/onboarding");

  return <OnboardingContent />;
}
