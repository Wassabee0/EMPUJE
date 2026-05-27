import type { BusinessType, CapacityUnit, ContributionCategory } from "./types";

export type ContributionTemplate = {
  id: string;
  category: ContributionCategory;
  label: string;
  description: string;
  businessTypes: BusinessType[];
  defaultTags: string[];
  requiredEvidence: string[];
  capacityPrompt: string;
  capacityUnit: CapacityUnit;
  riskFlags: string[];
};

export const contributionTemplates: ContributionTemplate[] = [
  {
    id: "space_quiet_hours",
    category: "physical_space_assets",
    label: "Espacio en horas tranquilas",
    description: "Un local, sala, escaparate, mesa o zona que puede usarse en franjas concretas.",
    businessTypes: ["local", "community", "other"],
    defaultTags: ["espacio", "pop-up", "local", "evento"],
    requiredEvidence: [
      "Fotos actuales del espacio o escaparate",
      "Condiciones del espacio: días, aforo, límites y ubicación",
      "Prueba publica del local: Google Business, web, Instagram o licencia visible",
    ],
    capacityPrompt: "Indica cuantas sesiones o slots reales puedes aceptar al mes y en que dias/franjas.",
    capacityUnit: "slots_per_month",
    riskFlags: ["physical_access"],
  },
  {
    id: "audience_local_channel",
    category: "audience_channels",
    label: "Canal o audiencia local",
    description: "Newsletter, comunidad, medio, grupo o cuenta con alcance real y segmentado.",
    businessTypes: ["community", "local", "brand", "other"],
    defaultTags: ["audiencia", "difusion", "comunidad", "visibilidad"],
    requiredEvidence: [
      "Capturas recientes de alcance, aperturas, visitas o audiencia real",
      "Enlace publico al canal, newsletter, comunidad o medio",
      "Ejemplo de publicacion, colaboracion o activacion anterior",
    ],
    capacityPrompt: "Define cuantas menciones, piezas o activaciones podrias revisar al mes sin quemar tu audiencia.",
    capacityUnit: "spots",
    riskFlags: ["audience_claim"],
  },
  {
    id: "product_stock_samples",
    category: "product_stock",
    label: "Producto, stock o muestras",
    description: "Unidades, muestras, stock lento o producto para validar en una colaboracion acotada.",
    businessTypes: ["brand", "local", "other"],
    defaultTags: ["producto", "stock", "muestras", "piloto"],
    requiredEvidence: [
      "Fotos de stock, lote disponible, etiquetado o ficha de producto",
      "Condiciones de entrega, caducidad si aplica y limites por colaboracion",
      "Prueba de que puedes entregar las unidades comprometidas",
    ],
    capacityPrompt: "Indica unidades reales disponibles, lote aproximado, caducidad si aplica y limite por match.",
    capacityUnit: "units",
    riskFlags: ["regulated_product"],
  },
  {
    id: "professional_service_pack",
    category: "professional_services",
    label: "Servicio profesional acotado",
    description: "Una revision, sesion, pack o entregable limitado con alcance claro.",
    businessTypes: ["service", "other"],
    defaultTags: ["servicio", "portfolio", "asesoria", "ejecucion"],
    requiredEvidence: [
      "Portfolio, web profesional o ejemplos de trabajos anteriores",
      "Alcance exacto del servicio, entregables y limites de revision",
      "Referencia publica, testimonio o perfil profesional verificable",
    ],
    capacityPrompt: "Define horas o proyectos maximos al mes y que queda fuera del alcance.",
    capacityUnit: "projects_per_month",
    riskFlags: ["professional_claim"],
  },
  {
    id: "pilot_customer_validation",
    category: "validation_first_customers",
    label: "Validacion o primer cliente",
    description: "Prueba piloto, feedback cualificado, testimonio o compra pequena para validar demanda.",
    businessTypes: ["local", "brand", "service", "community", "other"],
    defaultTags: ["validacion", "piloto", "cliente", "feedback"],
    requiredEvidence: [
      "Contexto del negocio o comunidad que hara la prueba",
      "Criterios de feedback, plazo y limite de compromiso",
      "Prueba de que existe una necesidad real o audiencia compatible",
    ],
    capacityPrompt: "Indica cuantas pruebas o pilotos puedes hacer al mes y que feedback prometes entregar.",
    capacityUnit: "slots_per_month",
    riskFlags: ["quality_subjective"],
  },
  {
    id: "event_experience_slot",
    category: "events_experiences",
    label: "Evento o experiencia pequena",
    description: "Cata, taller, demostracion, encuentro o experiencia local con aforo limitado.",
    businessTypes: ["local", "brand", "community", "service", "other"],
    defaultTags: ["evento", "experiencia", "taller", "aforo"],
    requiredEvidence: [
      "Condiciones del espacio: dias, aforo, limites y ubicacion",
      "Plan basico de seguridad, horarios y responsabilidades",
      "Fotos, enlace publico o experiencia previa relacionada",
    ],
    capacityPrompt: "Indica aforo, numero de sesiones posibles y restricciones logisticas.",
    capacityUnit: "slots_per_month",
    riskFlags: ["physical_access", "event_safety"],
  },
  {
    id: "operations_distribution_help",
    category: "operations_distribution",
    label: "Operacion, logistica o distribucion",
    description: "Ayuda con reparto, proveedor, fabricacion corta, operaciones o venta en canal concreto.",
    businessTypes: ["local", "brand", "service", "other"],
    defaultTags: ["logistica", "proveedor", "distribucion", "operaciones"],
    requiredEvidence: [
      "Zona de cobertura, capacidad real y condiciones de entrega",
      "Prueba de actividad, seguro o proveedor cuando aplique",
      "Limites de volumen, fechas y responsabilidades",
    ],
    capacityPrompt: "Define volumen maximo, rutas, zonas o tiradas pequenas que puedes asumir.",
    capacityUnit: "units",
    riskFlags: ["delivery_risk"],
  },
  {
    id: "relationship_intro",
    category: "relationship_capital",
    label: "Introduccion relacional verificable",
    description: "Acceso real a una persona, entidad, proveedor o comunidad, sin prometer resultados.",
    businessTypes: ["community", "service", "local", "other"],
    defaultTags: ["contactos", "introduccion", "proveedor", "relacion"],
    requiredEvidence: [
      "Contexto de la relacion y por que la presentacion seria apropiada",
      "Limites claros: no se promete cierre, inversion ni venta",
      "Prueba indirecta o nota privada suficiente para revision del fundador",
    ],
    capacityPrompt: "Indica cuantas introducciones podrias hacer sin abusar de la relacion.",
    capacityUnit: "introductions",
    riskFlags: ["relationship_sensitivity"],
  },
  {
    id: "specific_knowledge_session",
    category: "specific_knowledge",
    label: "Conocimiento especifico",
    description: "Experiencia concreta sobre ciudad, vertical, proveedor, canal, normativa o operativa.",
    businessTypes: ["service", "community", "local", "brand", "other"],
    defaultTags: ["conocimiento", "mentoria", "sector", "decision"],
    requiredEvidence: [
      "Contexto de experiencia: proyecto, sector, anos o casos relacionados",
      "Limites de la sesion y decisiones que puede desbloquear",
      "Referencia publica, perfil profesional o ejemplo anonimo",
    ],
    capacityPrompt: "Indica horas disponibles al mes y temas en los que si puedes aportar criterio.",
    capacityUnit: "hours_per_month",
    riskFlags: ["advice_scope"],
  },
  {
    id: "execution_time_block",
    category: "time_execution",
    label: "Tiempo y ejecucion concreta",
    description: "Horas para hacer una tarea acotada: contenido, llamadas, investigacion, montaje o soporte.",
    businessTypes: ["service", "community", "other", "brand", "local"],
    defaultTags: ["tiempo", "ejecucion", "tareas", "soporte"],
    requiredEvidence: [
      "Ejemplo de tarea parecida o experiencia relacionada",
      "Alcance, horas maximas, plazo y resultado esperado",
      "Limites claros para que no se convierta en trabajo infinito",
    ],
    capacityPrompt: "Indica horas reales disponibles al mes y tipo de tareas que aceptarias.",
    capacityUnit: "hours_per_month",
    riskFlags: ["scope_creep"],
  },
  {
    id: "seed_feedback_pack",
    category: "seed_contribution",
    label: "Aportacion semilla",
    description: "Para proyectos muy iniciales: feedback, prueba, referencia, demanda futura o microtarea.",
    businessTypes: ["other", "brand", "service", "community", "local"],
    defaultTags: ["semilla", "feedback", "validacion", "microtarea"],
    requiredEvidence: [
      "Explicacion honesta de la fase actual y que si puedes aportar",
      "Ejemplo, enlace, prototipo o prueba minima de que el proyecto existe",
      "Limites concretos: feedback, testimonio, microtarea, referencia o prueba piloto",
    ],
    capacityPrompt: "Indica cuantas pruebas, feedbacks o microtareas puedes sostener este mes.",
    capacityUnit: "slots_per_month",
    riskFlags: ["early_stage"],
  },
];

const templateLookup = new Map(contributionTemplates.map((template) => [template.id, template]));

export function listContributionTemplates() {
  return contributionTemplates;
}

export function getContributionTemplate(id: string | null | undefined) {
  if (!id) return null;
  return templateLookup.get(id) ?? null;
}

export function templatesForBusinessType(businessType: BusinessType) {
  return contributionTemplates.filter((template) => template.businessTypes.includes(businessType));
}

export function contributionCategoryForTemplate(id: string | null | undefined) {
  return getContributionTemplate(id)?.category ?? null;
}
