import { ClipboardCheck, UploadCloud } from "lucide-react";

import { submitOnboarding } from "@/app/actions";
import { EvidenceGuidance } from "@/components/evidence-guidance";
import { listContributionTemplates } from "@/lib/contribution-templates";
import { capacityUnitLabels } from "@/lib/offer-availability";

const contributionTemplates = listContributionTemplates();
const capacityUnits = Object.entries(capacityUnitLabels);

export function OnboardingForm() {
  return (
    <form className="form panel" action={submitOnboarding}>
      <div className="section-head" style={{ marginBottom: 0 }}>
        <span className="eyebrow">Onboarding de beta</span>
        <h2>Da suficiente detalle para que una persona revise tu cuenta.</h2>
        <p>
          Empuje solo funciona si las ofertas son concretas y verificables. Una oferta fuerte y una necesidad clara son
          mejores que un perfil largo y vago.
        </p>
      </div>

      <div className="form-grid">
        <div className="field">
          <label htmlFor="fullName">Tu nombre</label>
          <input id="fullName" name="fullName" required />
        </div>
        <div className="field">
          <label htmlFor="businessName">Negocio o proyecto</label>
          <input id="businessName" name="businessName" required />
        </div>
        <div className="field">
          <label htmlFor="city">Ciudad</label>
          <input id="city" name="city" placeholder="Madrid, Valencia, Barcelona..." required />
        </div>
        <div className="field">
          <label htmlFor="businessType">Tipo</label>
          <select id="businessType" name="businessType" defaultValue="local" required>
            <option value="local">Negocio local o espacio físico</option>
            <option value="brand">Marca de producto</option>
            <option value="service">Autónomo/a o servicio</option>
            <option value="community">Comunidad o medio</option>
            <option value="other">Otro</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="stage">Etapa</label>
          <select id="stage" name="stage" defaultValue="first_sales" required>
            <option value="idea">Idea o pre-lanzamiento</option>
            <option value="first_sales">Primeras ventas</option>
            <option value="running">Funcionando</option>
            <option value="growing">Creciendo</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="contributionTemplateId">Tipo de aportación</label>
          <select id="contributionTemplateId" name="contributionTemplateId" defaultValue="space_quiet_hours">
            {contributionTemplates.map((template) => (
              <option value={template.id} key={template.id}>
                {template.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid-2">
        <div className="item green">
          <ClipboardCheck size={24} color="#0d5c4d" aria-hidden="true" />
          <h3>Qué puedes ofrecer</h3>
          <div className="field">
            <label htmlFor="offerTitle">Título de la oferta</label>
            <input id="offerTitle" name="offerTitle" placeholder="Un espacio, habilidad, audiencia, stock, proveedores..." required />
          </div>
          <div className="field">
            <label htmlFor="offerDescription">Detalles de la oferta</label>
            <textarea
              id="offerDescription"
              name="offerDescription"
              placeholder="Sé concreto: frecuencia, límites, ubicación, valor y qué haría esto seguro para ti."
              required
            />
          </div>
          <div className="field">
            <label htmlFor="offerTags">Etiquetas de la oferta</label>
            <input id="offerTags" name="offerTags" placeholder="espacio, contenido, audiencia, finanzas" required />
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="capacityTotal">Capacidad inicial</label>
              <input id="capacityTotal" name="capacityTotal" type="number" min="1" max="9999" placeholder="2" />
            </div>
            <div className="field">
              <label htmlFor="capacityUnit">Unidad</label>
              <select id="capacityUnit" name="capacityUnit" defaultValue="slots_per_month">
                {capacityUnits.map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="availableFrom">Disponible desde</label>
              <input id="availableFrom" name="availableFrom" type="date" />
            </div>
            <div className="field">
              <label htmlFor="availableUntil">Disponible hasta</label>
              <input id="availableUntil" name="availableUntil" type="date" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="restrictions">Restricciones</label>
            <textarea
              id="restrictions"
              name="restrictions"
              placeholder="Días, ciudad, límites, aforo, caducidad, entregas, sectores que no encajan..."
            />
          </div>
          <EvidenceGuidance />
        </div>

        <div className="item blue">
          <ClipboardCheck size={24} color="#1e4f78" aria-hidden="true" />
          <h3>Qué necesitas</h3>
          <div className="field">
            <label htmlFor="needTitle">Título de la necesidad</label>
            <input id="needTitle" name="needTitle" placeholder="¿Qué desbloquearía el siguiente paso?" required />
          </div>
          <div className="field">
            <label htmlFor="needDescription">Detalles de la necesidad</label>
            <textarea
              id="needDescription"
              name="needDescription"
              placeholder="Explica qué tipo de presentación o colaboración te ayudaría de verdad."
              required
            />
          </div>
          <div className="field">
            <label htmlFor="needTags">Etiquetas de la necesidad</label>
            <input id="needTags" name="needTags" placeholder="espacio, fotos, proveedores, clientes piloto" required />
          </div>
        </div>
      </div>

      <div className="item">
        <UploadCloud size={24} color="#c95e44" aria-hidden="true" />
        <h3>Evidencia</h3>
        <p className="small">
          Los enlaces y archivos son privados para revisión. Sirven para comprobar que tu oferta es real antes de que
          Empuje te presente a alguien. Necesitas aportar al menos un enlace o archivo.
        </p>
        <div className="field">
          <label htmlFor="evidenceLinks">Enlaces de evidencia</label>
          <textarea
            id="evidenceLinks"
            name="evidenceLinks"
            placeholder="Web, Instagram, Google Business, portfolio, fotos, referencias públicas..."
          />
        </div>
        <div className="field">
          <label htmlFor="evidenceFiles">Archivos de evidencia</label>
          <input id="evidenceFiles" name="evidenceFiles" type="file" multiple />
        </div>
      </div>

      <label className="checkbox-row">
        <input type="checkbox" name="consentAccepted" required />
        <span>
          Acepto que Empuje guarde esta solicitud de beta, evidencias y notas de revisión para que el fundador pueda
          revisar manualmente mi cuenta y posibles matches.
        </span>
      </label>

      <button className="button clay" type="submit">
        Enviar perfil beta
      </button>
    </form>
  );
}
