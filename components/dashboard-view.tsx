import { Send } from "lucide-react";

import { requestIntro } from "@/app/actions";
import { StatusBadge } from "@/components/status-badge";
import { buildEvidenceGuidance } from "@/lib/evidence-guidance";
import { businessTypeLabels, stageLabels } from "@/lib/labels";
import { formatCapacityLabel } from "@/lib/offer-availability";
import type { DashboardData } from "@/lib/types";

function peerName(data: DashboardData, matchProfileId: string) {
  return data.profileLookup[matchProfileId]?.businessName ?? "Miembro privado";
}

export function DashboardView({ data }: { data: DashboardData }) {
  const { profile, offers, needs, evidenceItems, matches, introRequests } = data;

  return (
    <div className="stack-lg">
      <section className="page-head">
        <div className="container split">
          <div>
            <span className="eyebrow">Panel de miembro</span>
            <h1 style={{ fontSize: "3.2rem" }}>{profile.businessName}</h1>
            <p className="lead">
              Tus oportunidades son privadas. Solo verás matches aprobados para tu cuenta.
            </p>
          </div>
          <div className="score" aria-label={`Puntuación de confianza ${profile.trustScore}`}>
            {profile.trustScore}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container dashboard-grid">
          <aside className="stack">
            <div className="panel stack">
              <div className="split">
                <h2>Estado de revisión</h2>
                <StatusBadge status={profile.status} />
              </div>
              <p>
                Las cuentas pendientes o con falta de evidencia pueden añadir información, pero las presentaciones se
                bloquean hasta que el fundador revise la oferta relevante.
              </p>
              <div className="badge-row">
                <span className="badge">{profile.city}</span>
                <span className="badge">{businessTypeLabels[profile.businessType]}</span>
                <span className="badge">{stageLabels[profile.stage]}</span>
              </div>
            </div>

            <div className="panel stack">
              <h2>Evidencia</h2>
              {evidenceItems.length ? (
                evidenceItems.map((item) => (
                  <div className="item" key={item.id}>
                    <div className="split">
                      <strong>{item.label}</strong>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="small">{item.kind === "file" ? item.storagePath : item.url}</p>
                    {item.adminNotes ? <p className="small">Nota admin: {item.adminNotes}</p> : null}
                  </div>
                ))
              ) : (
                <p>Aún no has enviado evidencia. Añádela durante el onboarding o cuando el fundador la pida.</p>
              )}
            </div>
          </aside>

          <div className="stack">
            <div className="grid-2">
              <div className="panel stack">
                <h2>Qué ofrezco</h2>
                {offers.map((offer) => (
                  <div className="item green" key={offer.id}>
                    <div className="split">
                      <h3>{offer.title}</h3>
                      <div className="stack" style={{ justifyItems: "end" }}>
                        <StatusBadge status={offer.status} />
                        <StatusBadge status={offer.availabilityStatus ?? "active"} />
                      </div>
                    </div>
                    <p>{offer.description}</p>
                    <p className="small">
                      Capacidad declarada: {formatCapacityLabel(offer)}
                      {offer.restrictions ? ` · ${offer.restrictions}` : ""}
                    </p>
                    <div className="badge-row">
                      {offer.tags.map((tag) => (
                        <span className="badge" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    {offer.adminNotes ? <p className="small">Nota admin: {offer.adminNotes}</p> : null}
                    {offer.status !== "verified" ? (
                      <div className="notice stack">
                        <strong>Qué falta para verificar</strong>
                        <ul className="compact-list">
                          {[
                            ...buildEvidenceGuidance({
                              businessType: profile.businessType,
                              contributionTemplateId: offer.contributionTemplateId,
                              offerTitle: offer.title,
                              offerDescription: offer.description,
                              offerTags: offer.tags,
                            }).requiredEvidence,
                            ...buildEvidenceGuidance({
                              businessType: profile.businessType,
                              contributionTemplateId: offer.contributionTemplateId,
                              offerTitle: offer.title,
                              offerDescription: offer.description,
                              offerTags: offer.tags,
                            }).specificEvidence,
                          ]
                            .slice(0, 4)
                            .map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="panel stack">
                <h2>Qué necesito</h2>
                {needs.map((need) => (
                  <div className="item blue" key={need.id}>
                    <h3>{need.title}</h3>
                    <p>{need.description}</p>
                    <div className="badge-row">
                      {need.tags.map((tag) => (
                        <span className="badge" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel stack">
              <div className="split">
                <div>
                  <h2>Oportunidades privadas</h2>
                  <p>Solo aparecen matches aprobados por el fundador. No se muestra demo data como si fuera real.</p>
                </div>
                <StatusBadge status={matches.length ? "approved" : "pending"} />
              </div>
              {matches.length ? (
                matches.map((match) => {
                  const otherId = match.offererProfileId === profile.id ? match.neederProfileId : match.offererProfileId;
                  const alreadyRequested = introRequests.some((intro) => intro.matchId === match.id);
                  return (
                    <div className="item" key={match.id}>
                      <div className="split">
                        <div>
                          <h3>{peerName(data, otherId)}</h3>
                          <p>
                            Puntuación {match.score}. Estado: <StatusBadge status={match.status} />
                          </p>
                        </div>
                        <span className="badge">Match privado</span>
                      </div>
                      {match.blockingReasons.length ? (
                        <div className="danger-note">{match.blockingReasons.join(", ")}</div>
                      ) : null}
                      <form className="form" action={requestIntro}>
                        <input type="hidden" name="matchId" value={match.id} />
                        <div className="field">
                          <label htmlFor={`message-${match.id}`}>Nota para pedir presentación</label>
                          <textarea
                            id={`message-${match.id}`}
                            name="message"
                            defaultValue="Parece relevante. Revisad si tiene sentido hacer una presentación."
                          />
                        </div>
                        <button className="button" type="submit" disabled={alreadyRequested}>
                          <Send size={17} aria-hidden="true" />
                          {alreadyRequested ? "Presentación solicitada" : "Pedir presentación"}
                        </button>
                      </form>
                    </div>
                  );
                })
              ) : (
                <div className="notice">
                  Aún no hay matches aprobados. Es normal mientras tu cuenta y tus evidencias están pendientes de
                  revisión.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
