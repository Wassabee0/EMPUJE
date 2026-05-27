import { AlertTriangle } from "lucide-react";

import { getMissingSupabaseKeys } from "@/lib/env";

export function ConfigurationNotice() {
  const missing = getMissingSupabaseKeys();

  if (!missing.length) return null;

  return (
    <div className="notice" role="status">
      <strong>
        <AlertTriangle size={17} aria-hidden="true" /> Supabase todavía no está conectado.
      </strong>
      <p>
        Añade <code>{missing.join(", ")}</code> para activar cuentas reales, escrituras en base de datos y subida de
        evidencias. El esquema y los pasos están en <code>README.md</code>.
      </p>
    </div>
  );
}
