import Link from "next/link";
import {
  Activity,
  BadgeCheck,
  BarChart3,
  CreditCard,
  Download,
  FileCheck2,
  Handshake,
  ListChecks,
  Plus,
  RefreshCw,
  Users,
} from "lucide-react";

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
import { businessTypeLabels, evidenceKindLabels, labelForStatus, stageLabels } from "@/lib/labels";
import { capacityUnitLabels, formatCapacityLabel, offerAvailabilityLabels } from "@/lib/offer-availability";
import type {
  AdminData,
  AdminProfile,
  CapacityUnit,
  EvidenceItemRecord,
  EvidenceStatus,
  MatchCandidate,
  MatchRecord,
  MatchStatus,
  OfferAvailabilityStatus,
  OfferRecord,
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

function evidenceForOffer(data: AdminData, offerId: string) {
  return data.evidenceItems.filter((item) => item.offerId === offerId);
}

function verificationActionLabel(action: AdminData["verificationReviews"][number]["recommendedAction"]) {
  if (action === "can_verify") return "Lista para verificar";
  if (action === "request_evidence") return "Pedir evidencia";
  if (action === "reject_or_request_fix") return "Corregir o rechazar";
  return "Revisar perfil";
}

function AdminNavItem({
  href,
  icon,
  label,
  count,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  count?: number;
}) {
  return (
    <a className="admin-nav-item" href={href}>
      {icon}
      <span>{label}</span>
      {typeof count === "number" ? <strong>{count}</strong> : null}
    </a>
  );
}

function MetricCard({ label, value, tone = "default" }: { label: string; value: number | string; tone?: string }) {
  return (
    <div className={`admin-metric ${tone}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function AdminColumn({
  title,
  count,
  tone,
  children,
}: {
  title: string;
  count: number;
  tone?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`admin-column ${tone ?? ""}`}>
      <header className="admin-column-head">
        <h2>{title}</h2>
        <span>{count}</span>
      </header>
      <div className="admin-column-list">{children}</div>
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="admin-empty">{text}</div>;
}

function ProfileTaskCard({ profile, readOnly }: { profile: AdminProfile; readOnly: boolean }) {
  return (
    <article className="admin-task-card">
      <div className="admin-card-head">
        <div>
          <h3>{profile.businessName}</h3>
          <p>{profile.city} · {businessTypeLabels[profile.businessType]}</p>
        </div>
        <StatusBadge status={profile.status} />
      </div>
      <div className="admin-card-meta">
        <span>{profile.fullName}</span>
        <span>{stageLabels[profile.stage]}</span>
        <span>{profile.trustScore}/100</span>
      </div>
      <form className="admin-inline-form" action={setProfileStatus}>
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
        <button className="admin-icon-button" type="submit" disabled={readOnly} title="Actualizar usuario">
          <BadgeCheck size={16} aria-hidden="true" />
        </button>
      </form>
    </article>
  );
}

function EvidenceTaskCard({
  data,
  offer,
  evidenceItems,
  readOnly,
}: {
  data: AdminData;
  offer: OfferRecord;
  evidenceItems: EvidenceItemRecord[];
  readOnly: boolean;
}) {
  const pendingEvidence = evidenceItems.filter((item) => item.status === "pending" || item.status === "needs_more");

  return (
    <article className="admin-task-card">
      <div className="admin-card-head">
        <div>
          <h3>{offer.title}</h3>
          <p>{profileName(data, offer.profileId)}</p>
        </div>
        <StatusBadge status={offer.status} />
      </div>
      <div className="admin-tag-row">
        {offer.tags.slice(0, 4).map((tag) => (
          <span className="badge" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <div className="admin-card-note">{formatCapacityLabel(offer)}</div>
      {pendingEvidence.length ? (
        pendingEvidence.slice(0, 2).map((item) => (
          <form className="admin-inline-form" action={setEvidenceStatus} key={item.id}>
            <input type="hidden" name="evidenceId" value={item.id} />
            <span className="admin-evidence-label">
              {evidenceKindLabels[item.kind]} · {item.label}
            </span>
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
            <input name="adminNotes" placeholder="Nota" defaultValue={item.adminNotes ?? ""} disabled={readOnly} />
            <button className="admin-icon-button" type="submit" disabled={readOnly} title="Guardar evidencia">
              <FileCheck2 size={16} aria-hidden="true" />
            </button>
          </form>
        ))
      ) : (
        <div className="admin-card-note">Sin evidencia pendiente</div>
      )}
      <form className="admin-inline-form" action={setOfferStatus}>
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
        <input name="adminNotes" placeholder="Nota oferta" defaultValue={offer.adminNotes ?? ""} disabled={readOnly} />
        <button className="admin-icon-button" type="submit" disabled={readOnly} title="Guardar oferta">
          <BadgeCheck size={16} aria-hidden="true" />
        </button>
      </form>
    </article>
  );
}

function CandidateTaskCard({
  candidate,
  data,
  readOnly,
}: {
  candidate: MatchCandidate;
  data: AdminData;
  readOnly: boolean;
}) {
  return (
    <form className="admin-task-card" action={approveCandidateMatch}>
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
      <div className="admin-card-head">
        <div>
          <h3>
            {profileName(data, candidate.offererProfileId)} → {profileName(data, candidate.neederProfileId)}
          </h3>
          <p>{candidate.automation.reason}</p>
        </div>
        <span className="admin-score">{candidate.score}</span>
      </div>
      <div className="admin-card-meta">
        <span>Fit {candidate.automation.fitScore}</span>
        <span>Trust {candidate.automation.trustScore}</span>
        <span>{candidate.automation.riskLevel}</span>
      </div>
      <p className="admin-card-line">{offerTitle(data, candidate.offerId)}</p>
      <p className="admin-card-line">{needTitle(data, candidate.needId)}</p>
      {candidate.blockingReasons.length ? (
        <div className="admin-warning">{candidate.blockingReasons.join(", ")}</div>
      ) : null}
      <div className="admin-tag-row">
        {candidate.overlapTags.slice(0, 5).map((tag) => (
          <span className="badge" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <div className="admin-inline-form">
        <input name="adminNotes" placeholder="Nota para guardar" disabled={readOnly} />
        <button className="admin-compact-button" type="submit" disabled={readOnly}>
          <Plus size={15} aria-hidden="true" />
          Guardar
        </button>
      </div>
    </form>
  );
}

function MatchTaskCard({
  match,
  data,
  readOnly,
}: {
  match: MatchRecord;
  data: AdminData;
  readOnly: boolean;
}) {
  return (
    <article className="admin-task-card">
      <div className="admin-card-head">
        <div>
          <h3>
            {profileName(data, match.offererProfileId)} → {profileName(data, match.neederProfileId)}
          </h3>
          <p>{offerTitle(data, match.offerId)}</p>
        </div>
        <StatusBadge status={match.status} />
      </div>
      <div className="admin-card-meta">
        <span>{needTitle(data, match.needId)}</span>
        <span>{match.score}/100</span>
      </div>
      {match.blockingReasons.length ? <div className="admin-warning">{match.blockingReasons.join(", ")}</div> : null}
      <form className="admin-inline-form" action={setMatchStatus}>
        <input type="hidden" name="matchId" value={match.id} />
        <select name="status" defaultValue={match.status} aria-label="Cambiar estado del match" disabled={readOnly}>
          {matchStatuses.map((status) => (
            <option value={status} key={status}>
              {labelForStatus(status)}
            </option>
          ))}
        </select>
        <input name="adminNotes" placeholder="Nota" defaultValue={match.adminNotes ?? ""} disabled={readOnly} />
        <button className="admin-icon-button" type="submit" disabled={readOnly} title="Actualizar match">
          <Handshake size={16} aria-hidden="true" />
        </button>
      </form>
    </article>
  );
}

function OfferTableRow({
  data,
  offer,
  readOnly,
}: {
  data: AdminData;
  offer: OfferRecord;
  readOnly: boolean;
}) {
  return (
    <tr>
      <td>
        <strong>{offer.title}</strong>
        <p className="small">{profileName(data, offer.profileId)}</p>
      </td>
      <td>
        <StatusBadge status={offer.status} />
      </td>
      <td>
        <StatusBadge status={offer.availabilityStatus ?? "active"} />
      </td>
      <td>{formatCapacityLabel(offer)}</td>
      <td>
        <form className="admin-row-form" action={setOfferAvailability}>
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
            placeholder="Total"
            defaultValue={offer.capacityTotal ?? ""}
            disabled={readOnly}
          />
          <input
            name="capacityUsed"
            type="number"
            min="0"
            placeholder="Uso"
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
          <input name="restrictions" placeholder="Restricciones" defaultValue={offer.restrictions ?? ""} disabled={readOnly} />
          <button className="admin-icon-button" type="submit" disabled={readOnly} title="Guardar capacidad">
            <BadgeCheck size={16} aria-hidden="true" />
          </button>
        </form>
      </td>
    </tr>
  );
}

export function AdminView({ data, mode = "live" }: { data: AdminData; mode?: "live" | "dev" }) {
  const readOnly = mode === "dev";
  const pendingProfiles = data.profiles.filter((profile) => profile.status === "pending_review");
  const evidenceQueue = data.evidenceItems.filter((item) => item.status === "pending" || item.status === "needs_more");
  const offersWithEvidenceWork = data.offers.filter((offer) => {
    const evidence = evidenceForOffer(data, offer.id);
    return offer.status !== "verified" || evidence.some((item) => item.status === "pending" || item.status === "needs_more");
  });
  const readyReviews = data.verificationReviews.filter((review) => review.recommendedAction === "can_verify");
  const blockedReviews = data.verificationReviews.filter((review) => review.recommendedAction !== "can_verify");
  const readyCandidates = data.matchWorkbench.readyNow;
  const blockedCandidates = data.matchWorkbench.needsEvidence;
  const openMatches = data.matches.filter((match) => !["completed", "rejected"].includes(match.status));
  const completedMatches = data.matches.filter((match) => match.status === "completed");

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span>E</span>
          <div>
            <strong>Empuje</strong>
            <small>Founder ops</small>
          </div>
        </div>
        <nav className="admin-side-nav" aria-label="Admin navigation">
          <AdminNavItem href="#radar" icon={<Activity size={17} aria-hidden="true" />} label="Radar" count={pendingProfiles.length + evidenceQueue.length} />
          <AdminNavItem href="#usuarios" icon={<Users size={17} aria-hidden="true" />} label="Usuarios" count={data.profiles.length} />
          <AdminNavItem href="#evidencias" icon={<FileCheck2 size={17} aria-hidden="true" />} label="Evidencias" count={evidenceQueue.length} />
          <AdminNavItem href="#matches" icon={<Handshake size={17} aria-hidden="true" />} label="Matches" count={readyCandidates.length + openMatches.length} />
          <AdminNavItem href="#creditos" icon={<CreditCard size={17} aria-hidden="true" />} label="Créditos" count={data.creditLedger.summary.availableThisMonth} />
        </nav>
        <div className="admin-sidebar-block">
          <p className="admin-sidebar-label">Estado beta</p>
          <div className="admin-mini-stat">
            <span>Activos</span>
            <strong>{data.profiles.filter((profile) => profile.status === "active").length}</strong>
          </div>
          <div className="admin-mini-stat">
            <span>Bloqueados</span>
            <strong>{blockedReviews.length + blockedCandidates.length}</strong>
          </div>
          <div className="admin-mini-stat">
            <span>Intros</span>
            <strong>{data.introRequests.length}</strong>
          </div>
        </div>
        {readOnly ? <div className="admin-readonly">Modo local solo lectura</div> : null}
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="eyebrow">Panel fundador</span>
            <h1>Operaciones de beta</h1>
          </div>
          <div className="admin-top-actions">
            <form action={refreshCandidateQueue}>
              <button className="admin-compact-button" type="submit" disabled={readOnly}>
                <RefreshCw size={15} aria-hidden="true" />
                Candidatos
              </button>
            </form>
            {readOnly ? (
              <button className="admin-compact-button muted" type="button" disabled>
                <Download size={15} aria-hidden="true" />
                Export
              </button>
            ) : (
              <>
                <Link className="admin-compact-button muted" href="/api/admin/export?format=csv">
                  <Download size={15} aria-hidden="true" />
                  CSV
                </Link>
                <Link className="admin-compact-button muted" href="/api/admin/export?format=json">
                  <Download size={15} aria-hidden="true" />
                  JSON
                </Link>
              </>
            )}
          </div>
        </header>

        <nav className="admin-tabs" aria-label="Admin views">
          <a href="#radar">Radar</a>
          <a href="#usuarios">Usuarios</a>
          <a href="#evidencias">Evidencias</a>
          <a href="#matches">Matches</a>
          <a href="#creditos">Créditos</a>
        </nav>

        <div className="admin-content">
          <section className="admin-view-section" id="radar">
            <div className="admin-metrics">
              <MetricCard label="Usuarios" value={data.profiles.length} />
              <MetricCard label="Pendientes" value={pendingProfiles.length} tone="warn" />
              <MetricCard label="Evidencias" value={evidenceQueue.length} tone="blue" />
              <MetricCard label="Candidatos listos" value={readyCandidates.length} tone="green" />
              <MetricCard label="Matches abiertos" value={openMatches.length} />
            </div>

            <div className="admin-board">
              <AdminColumn title="Usuarios pendientes" count={pendingProfiles.length} tone="warn">
                {pendingProfiles.length ? (
                  pendingProfiles.map((profile) => (
                    <ProfileTaskCard profile={profile} readOnly={readOnly} key={profile.id} />
                  ))
                ) : (
                  <EmptyState text="Sin usuarios pendientes" />
                )}
              </AdminColumn>

              <AdminColumn title="Evidencia" count={offersWithEvidenceWork.length} tone="blue">
                {offersWithEvidenceWork.length ? (
                  offersWithEvidenceWork.slice(0, 24).map((offer) => (
                    <EvidenceTaskCard
                      data={data}
                      offer={offer}
                      evidenceItems={evidenceForOffer(data, offer.id)}
                      readOnly={readOnly}
                      key={offer.id}
                    />
                  ))
                ) : (
                  <EmptyState text="Sin evidencias pendientes" />
                )}
              </AdminColumn>

              <AdminColumn title="Matches listos" count={readyCandidates.length} tone="green">
                {readyCandidates.length ? (
                  readyCandidates.slice(0, 20).map((candidate) => (
                    <CandidateTaskCard
                      candidate={candidate}
                      data={data}
                      readOnly={readOnly}
                      key={`${candidate.offerId}-${candidate.needId}`}
                    />
                  ))
                ) : (
                  <EmptyState text="Sin candidatos listos" />
                )}
              </AdminColumn>

              <AdminColumn title="Bloqueados" count={blockedCandidates.length + blockedReviews.length} tone="danger">
                {blockedCandidates.slice(0, 12).map((candidate) => (
                  <CandidateTaskCard
                    candidate={candidate}
                    data={data}
                    readOnly={readOnly}
                    key={`${candidate.offerId}-${candidate.needId}`}
                  />
                ))}
                {blockedReviews.slice(0, 8).map((review) => (
                  <article className="admin-task-card" key={review.offerId}>
                    <div className="admin-card-head">
                      <div>
                        <h3>{offerTitle(data, review.offerId)}</h3>
                        <p>{profileName(data, review.profileId)} · {verificationActionLabel(review.recommendedAction)}</p>
                      </div>
                      <span className="admin-score">{review.score}</span>
                    </div>
                    <div className="admin-warning">
                      {review.missingEvidence.length ? review.missingEvidence.join(", ") : review.adminSummary}
                    </div>
                  </article>
                ))}
                {!blockedCandidates.length && !blockedReviews.length ? <EmptyState text="Sin bloqueos" /> : null}
              </AdminColumn>
            </div>
          </section>

          <section className="admin-view-section" id="usuarios">
            <div className="admin-section-head">
              <div>
                <h2>Usuarios</h2>
                <p>{data.profiles.length} perfiles de beta</p>
              </div>
              <ListChecks size={20} aria-hidden="true" />
            </div>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Perfil</th>
                    <th>Ciudad</th>
                    <th>Tipo</th>
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
                        <p className="small">{profile.fullName} · {profile.email}</p>
                      </td>
                      <td>{profile.city}</td>
                      <td>{businessTypeLabels[profile.businessType]}</td>
                      <td>
                        <StatusBadge status={profile.status} />
                      </td>
                      <td>{profile.trustScore}</td>
                      <td>
                        <form className="admin-row-form" action={setProfileStatus}>
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
                          <button className="admin-icon-button" type="submit" disabled={readOnly} title="Actualizar usuario">
                            <BadgeCheck size={16} aria-hidden="true" />
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="admin-view-section" id="evidencias">
            <div className="admin-section-head">
              <div>
                <h2>Evidencias y ofertas</h2>
                <p>{offersWithEvidenceWork.length} ofertas con trabajo de revisión</p>
              </div>
              <FileCheck2 size={20} aria-hidden="true" />
            </div>
            <div className="admin-split-grid">
              <div className="admin-card-list">
                {offersWithEvidenceWork.map((offer) => (
                  <EvidenceTaskCard
                    data={data}
                    offer={offer}
                    evidenceItems={evidenceForOffer(data, offer.id)}
                    readOnly={readOnly}
                    key={offer.id}
                  />
                ))}
              </div>
              <div className="admin-table-scroll compact">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Oferta</th>
                      <th>Estado</th>
                      <th>Disponibilidad</th>
                      <th>Capacidad</th>
                      <th>Operación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.offers.map((offer) => (
                      <OfferTableRow data={data} offer={offer} readOnly={readOnly} key={offer.id} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="admin-view-section" id="matches">
            <div className="admin-section-head">
              <div>
                <h2>Matches</h2>
                <p>{data.matchWorkbench.totalCandidates} candidatos · {data.matches.length} guardados</p>
              </div>
              <Handshake size={20} aria-hidden="true" />
            </div>
            <div className="admin-board shorter">
              <AdminColumn title="Listos" count={readyCandidates.length} tone="green">
                {readyCandidates.slice(0, 20).map((candidate) => (
                  <CandidateTaskCard
                    candidate={candidate}
                    data={data}
                    readOnly={readOnly}
                    key={`${candidate.offerId}-${candidate.needId}`}
                  />
                ))}
                {!readyCandidates.length ? <EmptyState text="Sin candidatos listos" /> : null}
              </AdminColumn>
              <AdminColumn title="Necesitan evidencia" count={blockedCandidates.length} tone="warn">
                {blockedCandidates.slice(0, 20).map((candidate) => (
                  <CandidateTaskCard
                    candidate={candidate}
                    data={data}
                    readOnly={readOnly}
                    key={`${candidate.offerId}-${candidate.needId}`}
                  />
                ))}
                {!blockedCandidates.length ? <EmptyState text="Sin candidatos bloqueados" /> : null}
              </AdminColumn>
              <AdminColumn title="Guardados" count={openMatches.length}>
                {openMatches.map((match) => (
                  <MatchTaskCard match={match} data={data} readOnly={readOnly} key={match.id} />
                ))}
                {!openMatches.length ? <EmptyState text="Sin matches abiertos" /> : null}
              </AdminColumn>
              <AdminColumn title="Cerrados" count={completedMatches.length}>
                {completedMatches.map((match) => (
                  <MatchTaskCard match={match} data={data} readOnly={readOnly} key={match.id} />
                ))}
                {!completedMatches.length ? <EmptyState text="Sin matches cerrados" /> : null}
              </AdminColumn>
            </div>
          </section>

          <section className="admin-view-section" id="creditos">
            <div className="admin-section-head">
              <div>
                <h2>Créditos internos</h2>
                <p>{data.creditLedger.month}</p>
              </div>
              <CreditCard size={20} aria-hidden="true" />
            </div>
            <div className="admin-metrics">
              <MetricCard label="Emitidos" value={data.creditLedger.summary.monthlyCreditsIssued} />
              <MetricCard label="Disponibles" value={data.creditLedger.summary.availableThisMonth} tone="green" />
              <MetricCard label="Usados" value={data.creditLedger.summary.usedThisMonth} tone="blue" />
              <MetricCard label="Bloqueados" value={data.creditLedger.summary.blockedAccounts} tone="warn" />
            </div>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Cuenta</th>
                    <th>Estado</th>
                    <th>Plan</th>
                    <th>Usado</th>
                    <th>Disponible</th>
                    <th>Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {data.creditLedger.accounts.map((account) => (
                    <tr key={account.profileId}>
                      <td>
                        <strong>{account.businessName}</strong>
                        <p className="small">{account.city}</p>
                      </td>
                      <td>
                        <StatusBadge status={account.profileStatus} />
                      </td>
                      <td>{account.planLabel}</td>
                      <td>{account.usedThisMonth}</td>
                      <td>{account.availableThisMonth}</td>
                      <td>{account.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="admin-view-section slim">
            <div className="admin-section-head">
              <div>
                <h2>Señales operativas</h2>
                <p>{data.matchWorkbench.existingPairsSkipped} pares ya guardados</p>
              </div>
              <BarChart3 size={20} aria-hidden="true" />
            </div>
            <div className="admin-signal-grid">
              <div>
                <h3>Bloqueos</h3>
                {data.matchWorkbench.topBlockers.length ? (
                  data.matchWorkbench.topBlockers.map((blocker) => (
                    <p className="small" key={blocker.reason}>
                      <strong>{blocker.count}</strong> · {blocker.reason}
                    </p>
                  ))
                ) : (
                  <p className="small">Sin bloqueos destacados</p>
                )}
              </div>
              <div>
                <h3>Ciudades</h3>
                {data.matchWorkbench.cityBuckets.length ? (
                  data.matchWorkbench.cityBuckets.map((bucket) => (
                    <p className="small" key={bucket.label}>
                      <strong>{bucket.count}</strong> · {bucket.label}
                    </p>
                  ))
                ) : (
                  <p className="small">Sin rutas destacadas</p>
                )}
              </div>
              <div>
                <h3>Inventario</h3>
                <p className="small">
                  <strong>{data.offers.length}</strong> ofertas · <strong>{data.needs.length}</strong> necesidades ·{" "}
                  <strong>{data.evidenceItems.length}</strong> evidencias
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
