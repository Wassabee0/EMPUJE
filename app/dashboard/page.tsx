import Link from "next/link";
import { redirect } from "next/navigation";

import { ConfigurationNotice } from "@/components/configuration-notice";
import { DashboardView } from "@/components/dashboard-view";
import { SiteHeader } from "@/components/site-header";
import { hasSupabaseServerConfig } from "@/lib/env";
import { getDashboardData } from "@/lib/repository";
import { getCurrentUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!hasSupabaseServerConfig()) {
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
  if (!user) redirect("/auth?next=/dashboard");

  const data = await getDashboardData(user.id);
  if (!data) {
    return (
      <div className="page-shell">
        <SiteHeader />
        <main className="section">
          <div className="container panel stack">
            <span className="eyebrow">Falta el perfil</span>
            <h1 style={{ fontSize: "3rem" }}>Completa primero el onboarding.</h1>
            <p>Tu cuenta existe, pero Empuje todavía no tiene tu perfil de solicitud beta.</p>
            <Link className="button clay" href="/onboarding">
              Continuar onboarding
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <SiteHeader />
      <DashboardView data={data} />
    </div>
  );
}
