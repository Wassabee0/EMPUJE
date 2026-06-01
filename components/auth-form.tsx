"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Mail, UserPlus } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type AuthMode = "signin" | "signup" | "magic";

type AuthFormProps = {
  initialMode: AuthMode;
  nextPath: string;
};

function betaSignupEnabled() {
  const mode = process.env.NEXT_PUBLIC_BETA_ACCESS_MODE;
  if (mode) return mode === "open_signup";
  return process.env.NODE_ENV !== "production";
}

export function AuthForm({ initialMode, nextPath }: AuthFormProps) {
  const router = useRouter();
  const signupEnabled = betaSignupEnabled();
  const [mode, setMode] = useState<AuthMode>(
    !signupEnabled && initialMode === "signup" ? "signin" : initialMode,
  );
  const effectiveMode = !signupEnabled && mode === "signup" ? "signin" : mode;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  );

  const title = useMemo(() => {
    if (effectiveMode === "signup") return "Crea tu cuenta beta";
    if (effectiveMode === "magic") return "Recibe un enlace mágico";
    return "Entra en Empuje";
  }, [effectiveMode]);

  async function handleGoogleSignIn() {
    setMessage("");

    if (!configured) {
      setMessage("Supabase todavía no está configurado. Añade las variables de .env.example.");
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) throw error;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se ha podido iniciar sesión con Google.");
      setBusy(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!configured) {
      setMessage("Supabase todavía no está configurado. Añade las variables de .env.example.");
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

    try {
      if (effectiveMode === "magic") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: redirectTo, shouldCreateUser: signupEnabled },
        });
        if (error) throw error;
        setMessage("Revisa tu email. El enlace te traerá de vuelta a Empuje.");
        return;
      }

      if (effectiveMode === "signup") {
        if (!signupEnabled) {
          setMessage("La beta de producción es por invitación. Entra con el email invitado.");
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo },
        });
        if (error) throw error;
        if (data.session) {
          router.push("/onboarding");
        } else {
          setMessage("Cuenta creada. Confirma tu email y después continúa el onboarding.");
        }
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push(nextPath);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se ha podido autenticar la cuenta.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-panel stack-lg">
      <div>
        <span className="eyebrow">Cuenta privada de beta</span>
        <h1 style={{ fontSize: "2.4rem" }}>{title}</h1>
        <p className="lead" style={{ fontSize: "1rem" }}>
          Solicita acceso, añade evidencias y consulta oportunidades revisadas desde tu cuenta. Los visitantes públicos
          no ven el grafo de miembros.
        </p>
      </div>

      <div className="tabs" role="tablist" aria-label="Modo de autenticación">
        <button className={`tab ${mode === "signin" ? "active" : ""}`} type="button" onClick={() => setMode("signin")}>
          Entrar
        </button>
        {signupEnabled ? (
          <button
            className={`tab ${mode === "signup" ? "active" : ""}`}
            type="button"
            onClick={() => setMode("signup")}
          >
            Crear cuenta
          </button>
        ) : null}
        <button className={`tab ${mode === "magic" ? "active" : ""}`} type="button" onClick={() => setMode("magic")}>
          Enlace mágico
        </button>
      </div>

      {!configured ? (
        <div className="notice">
          Faltan las claves de Supabase, así que la autenticación real está desactivada en local. Añade valores en{" "}
          <code>.env.local</code> usando <code>.env.example</code>.
        </div>
      ) : null}

      <button className="button full secondary" disabled={busy || !configured} type="button" onClick={handleGoogleSignIn}>
        Continuar con Google
      </button>

      <form className="form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        {effectiveMode !== "magic" ? (
          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={8}
              autoComplete={effectiveMode === "signup" ? "new-password" : "current-password"}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
        ) : null}
        <button className="button full" disabled={busy || !configured} type="submit">
          {effectiveMode === "signup" ? <UserPlus size={17} aria-hidden="true" /> : null}
          {effectiveMode === "magic" ? <Mail size={17} aria-hidden="true" /> : null}
          {effectiveMode === "signin" ? <KeyRound size={17} aria-hidden="true" /> : null}
          {busy
            ? "Procesando..."
            : effectiveMode === "signup"
              ? "Crear cuenta"
              : effectiveMode === "magic"
                ? "Enviar enlace"
                : "Entrar"}
        </button>
      </form>

      {message ? <div className="notice">{message}</div> : null}
    </div>
  );
}
