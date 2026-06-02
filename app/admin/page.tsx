import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminView } from "@/components/admin-view";
import { ConfigurationNotice } from "@/components/configuration-notice";
import { SiteHeader } from "@/components/site-header";
import { canUseDevAdminPanel, getDevAdminAccessCode } from "@/lib/dev-admin";
import { getDevAdminData } from "@/lib/dev-admin-data";
import { hasSupabaseServerConfig } from "@/lib/env";
import { getAdminData, isAdminUser } from "@/lib/repository";
import { getCurrentUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = (await searchParams) ?? {};
  const hasSupabaseConfig = hasSupabaseServerConfig();
  const devAdminCode = getDevAdminAccessCode();

  if (!hasSupabaseConfig) {
    const canUseDevAdmin = canUseDevAdminPanel({
      hasSupabaseConfig,
      nodeEnv: process.env.NODE_ENV,
      providedCode: params.dev_admin,
      expectedCode: devAdminCode,
    });

    if (canUseDevAdmin) {
      return <AdminView data={getDevAdminData()} mode="dev" />;
    }

    return (
      <div className="page-shell">
        <SiteHeader />
        <main className="section">
          <div className="container stack">
            <ConfigurationNotice />
            {process.env.NODE_ENV !== "production" ? (
              <div className="panel stack">
                <span className="eyebrow">Acceso temporal local</span>
                <h1 style={{ fontSize: "2.2rem" }}>Panel admin sin Supabase</h1>
                <p>
                  Mientras conectas Supabase, puedes abrir una vista admin con datos de ejemplo y acciones desactivadas.
                  Es solo para desarrollo local y se apaga automáticamente en producción.
                </p>
                <Link className="button ink" href={`/admin?dev_admin=${encodeURIComponent(devAdminCode)}`}>
                  Entrar al admin temporal
                </Link>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    );
  }

  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/admin");

  const isAdmin = await isAdminUser(user.id);
  if (!isAdmin) {
    return (
      <div className="page-shell">
        <SiteHeader />
        <main className="section">
          <div className="container panel stack">
            <span className="eyebrow">Área admin protegida</span>
            <h1 style={{ fontSize: "3rem" }}>Solo acceso fundador.</h1>
            <p>Tu cuenta está autenticada, pero no tiene el rol de admin.</p>
          </div>
        </main>
      </div>
    );
  }

  const data = await getAdminData();
  return <AdminView data={data} />;
}
