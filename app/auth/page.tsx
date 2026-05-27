import { AuthForm } from "@/components/auth-form";
import { SiteHeader } from "@/components/site-header";
import { safeRedirectPath } from "@/lib/redirects";

type AuthPageProps = {
  searchParams: Promise<{
    mode?: string;
    next?: string;
  }>;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;
  const mode = params.mode === "signup" || params.mode === "magic" ? params.mode : "signin";
  const nextPath = safeRedirectPath(params.next);

  return (
    <div className="page-shell">
      <SiteHeader />
      <main className="auth-wrap">
        <AuthForm initialMode={mode} nextPath={nextPath} />
      </main>
    </div>
  );
}
