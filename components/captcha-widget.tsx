"use client";

import { useEffect, useRef, useState } from "react";

type CaptchaProvider = "turnstile" | "hcaptcha";

type CaptchaConfig = {
  provider: CaptchaProvider;
  siteKey: string;
};

type CaptchaApi = {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
      theme?: "light";
    },
  ) => string;
  remove?: (widgetId: string) => void;
  reset?: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: CaptchaApi;
    hcaptcha?: CaptchaApi;
  }
}

type CaptchaWidgetProps = {
  config: CaptchaConfig | null;
  resetSignal: number;
  onVerify: (token: string) => void;
  onExpire: () => void;
};

const scriptSources: Record<CaptchaProvider, string> = {
  turnstile: "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",
  hcaptcha: "https://js.hcaptcha.com/1/api.js?render=explicit",
};

function scriptId(provider: CaptchaProvider) {
  return `empuje-${provider}-captcha`;
}

function loadCaptchaScript(provider: CaptchaProvider) {
  const existing = document.getElementById(scriptId(provider));
  if (existing) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = scriptId(provider);
    script.src = scriptSources[provider];
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se ha podido cargar la verificación antiabuso."));
    document.head.appendChild(script);
  });
}

export function getAuthCaptchaConfig(): CaptchaConfig | null {
  const provider = process.env.NEXT_PUBLIC_AUTH_CAPTCHA_PROVIDER;
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const hcaptchaSiteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

  if (provider === "turnstile" && turnstileSiteKey) return { provider, siteKey: turnstileSiteKey };
  if (provider === "hcaptcha" && hcaptchaSiteKey) return { provider, siteKey: hcaptchaSiteKey };
  if (!provider && turnstileSiteKey) return { provider: "turnstile", siteKey: turnstileSiteKey };
  if (!provider && hcaptchaSiteKey) return { provider: "hcaptcha", siteKey: hcaptchaSiteKey };

  return null;
}

export function CaptchaWidget({ config, resetSignal, onVerify, onExpire }: CaptchaWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!config || !containerRef.current) return;

    let disposed = false;
    let widgetId: string | null = null;
    const container = containerRef.current;

    setLoadError("");

    loadCaptchaScript(config.provider)
      .then(() => {
        if (disposed) return;

        const api = window[config.provider];
        if (!api) {
          setLoadError("No se ha podido inicializar la verificación antiabuso.");
          return;
        }

        container.innerHTML = "";
        widgetId = api.render(container, {
          sitekey: config.siteKey,
          callback: onVerify,
          "expired-callback": onExpire,
          "error-callback": onExpire,
          theme: "light",
        });
      })
      .catch((error: unknown) => {
        setLoadError(error instanceof Error ? error.message : "No se ha podido cargar la verificación antiabuso.");
      });

    return () => {
      disposed = true;
      const api = window[config.provider];
      if (api && widgetId) {
        if (api.remove) api.remove(widgetId);
        else if (api.reset) api.reset(widgetId);
      }
      container.innerHTML = "";
    };
  }, [config, onExpire, onVerify, resetSignal]);

  if (!config) return null;

  return (
    <div className="captcha-slot">
      <div ref={containerRef} />
      {loadError ? <div className="danger-note">{loadError}</div> : null}
    </div>
  );
}
