import Link from "next/link";
import { CreditCard, Download, FileCheck2, Plus, ShieldAlert } from "lucide-react";

import {
  approveCandidateMatch,
  askForEvidence,
  refreshCandidateQueue,
  setEvidenceStatus,
  setMatchStatus,
  setOfferAvailability,
  setOfferStatus,
  setProfileStatus,
} from "@/app/actions";
import { StatusBadge } from "@/components/status-badge";
import { businessTypeLabels, evidenceKindLabels, labelForStatus } from "@/lib/labels";
import { capacityUnitLabels, formatCapacityLabel, offerAvailabilityLabels } from "@/lib/offer-availability";
import type {
  AdminData,
  CapacityUnit,
  EvidenceStatus,
  MatchCandidate,
  MatchStatus,
  OfferAvailabilityStatus,
  OfferStatus,
  ProfileStatus,
} from "@/lib/types";

const profileStatuses: ProfileStatus[] = ["pending_review", "active", "needs_evidence", "rejected"];
const offerStatuses: OfferStatus[] = ["unverified", "pending", "verified", "rejected"];
const offerAvailabilityStatuses: OfferAvailabilityStatus[] = [
  "active",
  "partial",
  "reserved",
  "in_agreement",
  "exhausted",
  "cooldown",
  "paused",
  "archived",
  "suspended",
];
const capacityUnits = Object.keys(capacityUnitLabels) as CapacityUnit[];
const evidenceStatuses: EvidenceStatus[] = ["pending", "verified", "rejected", "needs_more"];
const matchStatuses: MatchStatus[] = [
  "suggested",
  "needs_evidence",
  "approved",
  "introduced",
  "completed",
  "rejected",
];

function profileName(data: AdminData, id: string) {
  return data.profileLookup[id]?.businessName ?? "Perfil desconocido";
}

function offerTitle(data: AdminData, id: string) {
  return data.offers.find((offer) => offer.id === id)?.title ?? "Oferta desconocida";
}

function needTitle(data: AdminData, id: string) {
  return data.needs.find((need) => need.id === id)?.title ?? "Necesidad desconocida";
}

function verificationActionLabel(action: AdminData["verificationReviews"][number]["recommendedAction"]) {
  if (action === "can_verify") return "Lista para verificar";
  if (action === "request_evidence") return "Pedir evidencia";
  if (action === "reject_or_request_fix") return "Corregir o rechazar";
  return "Revisar perfil";
}

function CandidateForm({
  candidate,
  data,
  readOnly,
}: {
  candidate: MatchCandidate;
  data: AdminData;
  readOnly: boolean;
}) {
  return (
    <form className="item stack" action={approveCandidateMatch}>
      <input type="hidden" name="offererProfileId" value={candidate.offererProfileId} />
      <input type="hidden" name="neederProfileId" value={candidate.neederProfileId} />
      <input type="hidden" name="offerId" value={candidate.offerId} />
      <input type="hidden" name="needId" value={candidate.needId} />
      <input type="hidden" name="score" value={candidate.score} />
      <input type="hidden" name="status" value={candidate.status} />
      <input type="hidden" name="blockingReasons" value={candidate.blockingReasons.join("|")} />
      <input type="hidden" name="overlapTags" value={candidate.overlapTags.join("|")} />
      <input type="hidden" name="tagOverlap" value={candidate.scoreBreakdown.tagOverlap} />
      <input type="hidden" name="sameCity" value={candidate.scoreBreakdown.sameCity} />
      <input type="hidden" name="verifiedOffer" value={candidate.scoreBreakdown.verifiedOffer} />
      <input type="hidden" name="complementaryTypes" value={candidate.scoreBreakdown.complementaryTypes} />
      <input type="hidden" name="fitScore" value={candidate.automation.fitScore} />
      <input type="hidden" name="trustScore" value={candidate.automation.trustScore} />
      <input type="hidden" name="urgencyScore" value={candidate.automation.urgencyScore} />
      <input type="hidden" name="riskPenalty" value={candidate.automation.riskPenalty} />
      <input type="hidden" name="riskLevel" value={candidate.automation.riskLevel} />
      <input type="hidden" name="nextAction" value={candidate.automation.nextAction} />
      <input type="hidden" name="automationReason" value={candidate.automation.reason} />
      <div className="split">
        <div>
          <h3>
            {profileName(data, candidate.offererProfileId)} → {profileName(data, candidate.neederProfileId)}
          </h3>
          <p>
            <strong>Oferta:</strong> {offerTitle(data, candidate.offerId)}
          </p>
          <p>
            <strong>Necesidad:</strong> {needTitle(data, candidate.needId)}
          </p>
        </div>
        <div className="score" style={{ width: 78, borderWidth: 7, fontSize: "1.4rem" }}>
          {candidate.score}
        </div>
      </div>
      <div className="badge-row">
        {candidate.overlapTags.map((tag) => (
          <span className="badge" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      {candidate.blockingReasons.length ? (
        <div className="danger-note">{candidate.blockingReasons.join(", ")}</div>
      ) : null}
      <div className={candidate.automation.riskLevel === "low" ? "notice" : "danger-note"}>
        {candidate.automation.reason}. Fit {candidate.automation.fitScore}/100 · confianza{" "}
        {candidate.automation.trustScore}/100 · urgencia {candidate.automation.urgencyScore}/20 · riesgo{" "}
        {candidate.automation.riskLevel}.
        {candidate.automation.capacityLabel ? <> Capacidad: {candidate.automation.capacityLabel}.</> : null}
      </div>
      <div className="field">
        <label htmlFor={`candidate-notes-${candidate.offerId}-${candidate.needId}`}>Nota admin</label>
        <input
          id={`candidate-notes-${candidate.offerId}-${candidate.needId}`}
          name="adminNotes"
          placeholder="Por qué merece la pena guardar este match"
          disabled={readOnly}
        />
      </div>
      <button className="button" type="submit" disabled={readOnly}>
        <Plus size={17} aria-hidden="true" />
        {readOnly ? "Solo lectura" : "Guardar candidato"}
      </button>
    </form>
  );
}

export function AdminView({ data, mode = "live" }: { data: AdminData; mode?: "live" | "dev" }) {
  const pendingProfiles = data.profiles.filter((profile) => profile.status === "pending_review");
  const evidenceQueue = data.evidenceItems.filter((item) => item.status === "pending" || item.status === "needs_more");
  const workbench = data.matchWorkbench;
  const ledger = data.creditLedger;
  const readOnly = mode === "dev";

  return (
    <div className="stack-lg">
      {readOnly ? (
        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="container">
            <div className="notice">
              <strong>Modo admin temporal local.</strong> Datos de ejemplo, solo lectura. Este acceso existe solo para
              trabajar sin Supabase y se debe borrar cuando conectes Supabase.
            </div>
          </div>
        </section>
      ) : null}
      <section className="page-head">
        <div className="container split">
          <div>
            <span className="eyebrow">Panel fundador</span>
            <h1 className="admin-title">Revisa personas, verifica afirmaciones y aprueba presentaciones.</h1>
            <p className="lead">
              El panel fundador ve todas las solicitudes y matches candidatos. Los miembros solo ven oportunidades
              después de la aprobación del fundador.
            </p>
          </div>
          <div className="action-row">
            {readOnly ? (
              <button className="button secondary" type="button" disabled>
                <Download size={17} aria-hidden="true" />
                Export desactivado
              </button>
            ) : (
              <>
                <Link className="button secondary" href="/api/admin/export?format=csv">
                  <Download size={17} aria-hidden="true" />
                  CSV
                </Link>
                <Link className="button ink" href="/api/admin/export?format=json">
                  <Download size={17} aria-hidden="true" />
                  JSON
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container admin-grid">
          <aside className="stack">
            <div className="panel stack">
              <h2>Cola</h2>
              <div className="grid-2">
                <div className="item green">
                  <strong>{pendingProfiles.length}</strong>
                  <p>Nuevos usuarios pendientes de revisión</p>
                </div>
                <div className="item blue">
                  <strong>{evidenceQueue.length}</strong>
                  <p>Evidencias por revisar</p>
                </div>
              </div>
            </div>

            <div className="panel stack">
              <div className="split">
                <div>
                  <span className="eyebrow">Beta gratis</span>
                  <h2>Créditos internos</h2>
                </div>
                <CreditCard color="#1e4f78" aria-hidden="true" />
              </div>
              <p>
                No visibles para miembros. Sirven para medir capacidad mensual, justicia percibida y cuándo una cuota
                futura tendría valor real.
              </p>
              <div className="grid-2">
                <div className="item blue">
                  <strong>{ledger.summary.monthlyCreditsIssued}</strong>
                  <p>Créditos internos emitidos en {ledger.month}</p>
                </div>
                <div className="item green">
                  <strong>{ledger.summary.availableThisMonth}</strong>
                  <p>Disponibles este mes</p>
                </div>
                <div className="item clay">
                  <strong>{ledger.summary.usedThisMonth}</strong>
                  <p>Usados en solicitudes de intro</p>
                </div>
                <div className="item">
                  <strong>{ledger.summary.blockedAccounts}</strong>
                  <p>Cuentas sin créditos por revisión o evidencia</p>
                </div>
              </div>
              <div className="stack">
                {ledger.accounts.map((account) => (
                  <div className="item" key={account.profileId}>
                    <div className="split">
                      <div>
                        <h3>{account.businessName}</h3>
                        <p className="small">
                          {account.city} · {account.planLabel}
                        </p>
                      </div>
                      <StatusBadge status={account.profileStatus} />
                    </div>
                    <p className="small">
                      <strong>{account.usedThisMonth}</strong> usado ·{" "}
                      <strong>{account.availableThisMonth}</strong> disponible · límite rollover{" "}
                      <strong>{account.rolloverCap}</strong>
                    </p>
                    <div className={account.monthlyGrant === 0 ? "danger-note" : "notice"}>
                      {account.status}. {account.note}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel stack">
              <div className="split">
                <div>
                  <span className="eyebrow">Automatización</span>
                  <h2>Motor de verificación</h2>
                </div>
                <ShieldAlert color="#1e4f78" aria-hidden="true" />
              </div>
              <p>
                Revisa evidencias y claims antes del juicio fundador. El sistema prioriza, pero nunca marca una oferta
                como verificada por sí solo.
              </p>
              <div className="grid-2">
                <div className="item green">
                  <strong>{data.verificationReviews.filter((review) => review.recommendedAction === "can_verify").length}</strong>
                  <p>Ofertas listas para decisión manual</p>
                </div>
                <div className="item clay">
                  <strong>
                    {data.verificationReviews.filter((review) => review.recommendedAction !== "can_verify").length}
                  </strong>
                  <p>Necesitan evidencia, perfil o corrección</p>
                </div>
              </div>
              {data.verificationReviews.slice(0, 6).map((review) => (
                <div className="item" key={review.offerId}>
                  <div className="split">
                    <div>
                      <h3>{offerTitle(data, review.offerId)}</h3>
                      <p className="small">
                        {profileName(data, review.profileId)} · {verificationActionLabel(review.recommendedAction)}
                      </p>
                    </div>
                    <div className="score" style={{ width: 62, borderWidth: 6, fontSize: "1rem" }}>
                      {review.score}
                    </div>
                  </div>
                  {review.missingEvidence.length ? (
                    <div className="danger-note">{review.missingEvidence.join(", ")}</div>
                  ) : (
                    <div className="notice">{review.adminSummary}</div>
                  )}
                </div>
              ))}
            </div>

            <div className="panel stack">
              <div>
                <span className="eyebrow">Matching operativo</span>
                <h2>Cola priorizada</h2>
                <p>
                  Pensada para revisar 100 perfiles sin perderse: oculta pares ya guardados, sube los matches listos y
                  separa bloqueos de evidencia.
                </p>
              </div>
              <form action={refreshCandidateQueue}>
                <button className="button ink" type="submit" disabled={readOnly}>
                  <Plus size={17} aria-hidden="true" />
                  {readOnly ? "Regenerar candidatos desactivado" : "Regenerar candidatos"}
                </button>
              </form>
              <div className="grid-2">
                <div className="item green">
                  <strong>{workbench.readyNow.length}</strong>
                  <p>Listos para guardar o aprobar</p>
                </div>
                <div className="item clay">
                  <strong>{workbench.needsEvidence.length}</strong>
                  <p>Bloqueados por evidencia o perfil</p>
                </div>
                <div className="item blue">
                  <strong>{workbench.highSignalSameCity.length}</strong>
                  <p>Alta señal en la misma ciudad</p>
                </div>
                <div className="item">
                  <strong>{workbench.existingPairsSkipped}</strong>
                  <p>Pares ya guardados y ocultados</p>
                </div>
              </div>
              {workbench.topBlockers.length ? (
                <div className="item clay">
                  <h3>Bloqueos principales</h3>
                  {workbench.topBlockers.map((blocker) => (
                    <p className="small" key={blocker.reason}>
                      <strong>{blocker.count}</strong> · {blocker.reason}
                    </p>
                  ))}
                </div>
              ) : null}
              {workbench.cityBuckets.length ? (
                <div className="item blue">
                  <h3>Rutas de ciudad con más señal</h3>
                  {workbench.cityBuckets.map((bucket) => (
                    <p className="small" key={bucket.label}>
                      <strong>{bucket.count}</strong> · {bucket.label}
                    </p>
                  ))}
                </div>
              ) : null}
              <div className="notice">
                Orden recomendado: revisa primero evidencias pendientes, guarda los 20 mejores candidatos, aprueba solo
                los que tengan una oferta verificada y después pide o facilita la presentación.
              </div>
              {workbench.reviewQueue.slice(0, 20).map((candidate) => (
                <CandidateForm
                  candidate={candidate}
                  data={data}
                  readOnly={readOnly}
                  key={`${candidate.offerId}-${candidate.needId}`}
                />
              ))}
              {!workbench.reviewQueue.length ? (
                <p>Aún no hay solape nuevo. Más ofertas y necesidades revisadas ayudarán.</p>
              ) : null}
            </div>
          </aside>

          <div className="stack-lg">
            <div className="panel stack">
              <div className="split">
                <h2>Revisar usuarios</h2>
                <StatusBadge status="pending_review" />
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Perfil</th>
                      <th>Estado</th>
                      <th>Confianza</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.profiles.map((profile) => (
                      <tr key={profile.id}>
                        <td>
                          <strong>{profile.businessName}</strong>
                          <p className="small">
                            {profile.fullName} · {profile.email} · {profile.city} ·{" "}
                            {businessTypeLabels[profile.businessType]}
                          </p>
                        </td>
                        <td>
                          <StatusBadge status={profile.status} />
                        </td>
                        <td>{profile.trustScore}</td>
                        <td>
                          <form className="admin-actions" action={setProfileStatus}>
                            <input type="hidden" name="profileId" value={profile.id} />
                            <select
                              name="status"
                              defaultValue={profile.status}
                              aria-label={`Cambiar estado de ${profile.businessName}`}
                              disabled={readOnly}
                            >
                              {profileStatuses.map((status) => (
                                <option value={status} key={status}>
                                  {labelForStatus(status)}
                                </option>
                              ))}
                            </select>
                            <button className="button secondary" type="submit" disabled={readOnly}>
                              {readOnly ? "Solo lectura" : "Actualizar"}
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="panel stack">
              <div className="split">
                <h2>Verificar ofertas</h2>
                <FileCheck2 color="#1e4f78" aria-hidden="true" />
              </div>
              {data.offers.map((offer) => {
                const evidence = data.evidenceItems.filter((item) => item.offerId === offer.id);
                return (
                  <div className="item" key={offer.id}>
                    <div className="split">
                      <div>
                        <h3>{offer.title}</h3>
                        <p>
                          {profileName(data, offer.profileId)} · {offer.description}
                        </p>
                      </div>
                      <div className="stack" style={{ justifyItems: "end" }}>
                        <StatusBadge status={offer.status} />
                        <StatusBadge status={offer.availabilityStatus ?? "active"} />
                      </div>
                    </div>
                    <div className="badge-row">
                      {offer.tags.map((tag) => (
                        <span className="badge" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="notice">
                      <strong>Capacidad:</strong> {formatCapacityLabel(offer)}
                      {offer.restrictions ? <> · {offer.restrictions}</> : null}
                      {offer.availableUntil ? <> · revisar antes de {offer.availableUntil}</> : null}
                    </div>
                    {evidence.length ? (
                      <div className="stack">
                        {evidence.map((item) => (
                          <div className="evidence-row" key={item.id}>
                            <div className="split">
                              <p className="small">
                                <strong>{evidenceKindLabels[item.kind]}:</strong>{" "}
                                {item.url || item.storagePath || item.label}
                              </p>
                              <StatusBadge status={item.status} />
                            </div>
                            <form className="admin-actions" action={setEvidenceStatus}>
                              <input type="hidden" name="evidenceId" value={item.id} />
                              <select
                                name="status"
                                defaultValue={item.status}
                                aria-label={`Cambiar estado de evidencia para ${item.label}`}
                                disabled={readOnly}
                              >
                                {evidenceStatuses.map((status) => (
                                  <option value={status} key={status}>
                                    {labelForStatus(status)}
                                  </option>
                                ))}
                              </select>
                              <input
                                name="adminNotes"
                                placeholder="Nota de evidencia"
                                defaultValue={item.adminNotes ?? ""}
                                disabled={readOnly}
                              />
                              <button className="button secondary" type="submit" disabled={readOnly}>
                                {readOnly ? "Solo lectura" : "Guardar evidencia"}
                              </button>
                            </form>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="danger-note">
                        <ShieldAlert size={17} aria-hidden="true" /> Sin evidencia adjunta todavía.
                      </div>
                    )}
                    <form className="admin-actions" action={setOfferStatus}>
                      <input type="hidden" name="offerId" value={offer.id} />
                      <select
                        name="status"
                        defaultValue={offer.status}
                        aria-label={`Cambiar estado de ${offer.title}`}
                        disabled={readOnly}
                      >
                        {offerStatuses.map((status) => (
                          <option value={status} key={status}>
                            {labelForStatus(status)}
                          </option>
                        ))}
                      </select>
                      <input
                        name="adminNotes"
                        placeholder="Nota admin"
                        defaultValue={offer.adminNotes ?? ""}
                        disabled={readOnly}
                      />
                      <button className="button secondary" type="submit" disabled={readOnly}>
                        {readOnly ? "Solo lectura" : "Guardar"}
                      </button>
                    </form>
                    <form className="admin-actions" action={setOfferAvailability}>
                      <input type="hidden" name="offerId" value={offer.id} />
                      <select
                        name="availabilityStatus"
                        defaultValue={offer.availabilityStatus ?? "active"}
                        aria-label={`Cambiar disponibilidad de ${offer.title}`}
                        disabled={readOnly}
                      >
                        {offerAvailabilityStatuses.map((status) => (
                          <option value={status} key={status}>
                            {offerAvailabilityLabels[status]}
                          </option>
                        ))}
                      </select>
                      <input
                        name="capacityTotal"
                        type="number"
                        min="0"
                        placeholder="Capacidad"
                        defaultValue={offer.capacityTotal ?? ""}
                        disabled={readOnly}
                      />
                      <input
                        name="capacityUsed"
                        type="number"
                        min="0"
                        placeholder="Usado"
                        defaultValue={offer.capacityUsed ?? 0}
                        disabled={readOnly}
                      />
                      <select
                        name="capacityUnit"
                        defaultValue={offer.capacityUnit ?? "other"}
                        aria-label={`Unidad de capacidad de ${offer.title}`}
                        disabled={readOnly}
                      >
                        {capacityUnits.map((unit) => (
                          <option value={unit} key={unit}>
                            {capacityUnitLabels[unit]}
                          </option>
                        ))}
                      </select>
                      <input
                        name="availableUntil"
                        type="date"
                        defaultValue={offer.availableUntil ?? ""}
                        aria-label={`Disponible hasta ${offer.title}`}
                        disabled={readOnly}
                      />
                      <input
                        name="restrictions"
                        placeholder="Restricciones"
                        defaultValue={offer.restrictions ?? ""}
                        disabled={readOnly}
                      />
                      <button className="button secondary" type="submit" disabled={readOnly}>
                        {readOnly ? "Solo lectura" : "Guardar capacidad"}
                      </button>
                    </form>
                    <form className="admin-actions" action={askForEvidence}>
                      <input type="hidden" name="offerId" value={offer.id} />
                      <input name="adminNotes" placeholder="¿Qué evidencia falta?" disabled={readOnly} />
                      <button className="button clay" type="submit" disabled={readOnly}>
                        {readOnly ? "Solo lectura" : "Pedir evidencia"}
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>

            <div className="panel stack">
              <h2>Matches manuales</h2>
              {data.matches.map((match) => (
                <div className="item" key={match.id}>
                  <div className="split">
                    <div>
                      <h3>
                        {profileName(data, match.offererProfileId)} → {profileName(data, match.neederProfileId)}
                      </h3>
                      <p>
                        {offerTitle(data, match.offerId)} encaja con {needTitle(data, match.needId)} · Puntuación{" "}
                        {match.score}
                      </p>
                    </div>
                    <StatusBadge status={match.status} />
                  </div>
                  {match.blockingReasons.length ? <div className="danger-note">{match.blockingReasons.join(", ")}</div> : null}
                  <form className="admin-actions" action={setMatchStatus}>
                    <input type="hidden" name="matchId" value={match.id} />
                    <select
                      name="status"
                      defaultValue={match.status}
                      aria-label="Cambiar estado del match"
                      disabled={readOnly}
                    >
                      {matchStatuses.map((status) => (
                        <option value={status} key={status}>
                          {labelForStatus(status)}
                        </option>
                      ))}
                    </select>
                    <input
                      name="adminNotes"
                      placeholder="Nota admin"
                      defaultValue={match.adminNotes ?? ""}
                      disabled={readOnly}
                    />
                    <button className="button secondary" type="submit" disabled={readOnly}>
                      {readOnly ? "Solo lectura" : "Actualizar match"}
                    </button>
                  </form>
                </div>
              ))}
              {!data.matches.length ? <p>Aún no hay matches guardados. Guarda un candidato desde la lista sugerida.</p> : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
