"use client";

import { useEffect, useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";

import { buildEvidenceGuidance } from "@/lib/evidence-guidance";
import type { BusinessType } from "@/lib/types";

type FormState = {
  businessType: BusinessType;
  contributionTemplateId: string;
  offerTitle: string;
  offerDescription: string;
  offerTags: string;
};

function readValue(id: string) {
  const element = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
  return element?.value ?? "";
}

export function EvidenceGuidance() {
  const [formState, setFormState] = useState<FormState>({
    businessType: "local",
    contributionTemplateId: "",
    offerTitle: "",
    offerDescription: "",
    offerTags: "",
  });

  useEffect(() => {
    const ids = ["businessType", "contributionTemplateId", "offerTitle", "offerDescription", "offerTags"];
    const update = () => {
      setFormState({
        businessType: (readValue("businessType") || "local") as BusinessType,
        contributionTemplateId: readValue("contributionTemplateId"),
        offerTitle: readValue("offerTitle"),
        offerDescription: readValue("offerDescription"),
        offerTags: readValue("offerTags"),
      });
    };

    update();
    ids.forEach((id) => {
      document.getElementById(id)?.addEventListener("input", update);
      document.getElementById(id)?.addEventListener("change", update);
    });

    return () => {
      ids.forEach((id) => {
        document.getElementById(id)?.removeEventListener("input", update);
        document.getElementById(id)?.removeEventListener("change", update);
      });
    };
  }, []);

  const guidance = useMemo(() => buildEvidenceGuidance(formState), [formState]);

  return (
    <div className={guidance.readiness === "ready_to_prepare" ? "notice stack" : "danger-note stack"}>
      <div className="split">
        <strong>Para verificar esta oferta</strong>
        <ShieldCheck size={18} aria-hidden="true" />
      </div>
      <p className="small">{guidance.summary}</p>
      {guidance.template ? <p className="small">Plantilla: {guidance.template.label}</p> : null}
      <p className="small">
        <strong>Capacidad:</strong> {guidance.capacityPrompt}
      </p>
      <ul className="compact-list">
        {[...guidance.requiredEvidence, ...guidance.specificEvidence].slice(0, 5).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {guidance.warnings.length ? (
        <div>
          {guidance.warnings.map((warning) => (
            <p className="small" key={warning}>
              <strong>Falta:</strong> {warning}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
