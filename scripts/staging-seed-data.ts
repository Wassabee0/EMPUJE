import type {
  BusinessStage,
  BusinessType,
  CapacityUnit,
  ContributionCategory,
  EvidenceStatus,
  IntroRequestStatus,
  MatchStatus,
  OfferAvailabilityStatus,
  OfferStatus,
  ProfileStatus,
} from "../lib/types";

export const STAGING_SEED_PROJECT_REF = "ifphiqzvslsxnqkatton";
export const STAGING_SEED_TAG = "empuje_staging_admin_panel_seed";
export const STAGING_SEED_EMAIL_DOMAIN = "empuje-staging.test";

export type StagingSeedEvidence = {
  label: string;
  kind: "link" | "note";
  url?: string;
  status: EvidenceStatus;
  adminNotes?: string;
};

export type StagingSeedAccount = {
  seedKey: string;
  email: string;
  password: string;
  profile: {
    fullName: string;
    businessName: string;
    city: string;
    businessType: BusinessType;
    stage: BusinessStage;
    status: ProfileStatus;
    trustScore: number;
    adminSummary: string;
  };
  offer: {
    title: string;
    description: string;
    tags: string[];
    status: OfferStatus;
    contributionTemplateId: string;
    contributionCategory: ContributionCategory;
    availabilityStatus: OfferAvailabilityStatus;
    capacityTotal: number;
    capacityUsed: number;
    capacityUnit: CapacityUnit;
    restrictions: string;
    adminNotes: string;
  };
  need: {
    title: string;
    description: string;
    tags: string[];
  };
  evidenceItems: StagingSeedEvidence[];
};

export type StagingSeedMatch = {
  seedKey: string;
  offererSeedKey: string;
  neederSeedKey: string;
  status: MatchStatus;
  score: number;
  blockingReasons: string[];
  adminNotes: string;
  introRequest?: {
    requesterSeedKey: string;
    status: IntroRequestStatus;
    message: string;
  };
};

export type StagingSeedDataset = {
  accounts: StagingSeedAccount[];
  matches: StagingSeedMatch[];
};

function email(index: number) {
  return `seed-${String(index).padStart(3, "0")}@${STAGING_SEED_EMAIL_DOMAIN}`;
}

function password(index: number) {
  return `EmpujeSeed-${String(index).padStart(3, "0")}!2026`;
}

function account(
  index: number,
  seedKey: string,
  profile: StagingSeedAccount["profile"],
  offer: StagingSeedAccount["offer"],
  need: StagingSeedAccount["need"],
  evidenceItems: StagingSeedEvidence[],
): StagingSeedAccount {
  return {
    seedKey,
    email: email(index),
    password: password(index),
    profile,
    offer,
    need,
    evidenceItems,
  };
}

const accounts: StagingSeedAccount[] = [
  account(
    1,
    "pan-barrio",
    {
      fullName: "Alba Martin",
      businessName: "Pan Barrio Lavapies",
      city: "Madrid",
      businessType: "local",
      stage: "running",
      status: "active",
      trustScore: 78,
      adminSummary: "Local con fotos, horarios y oferta verificable para primeras colaboraciones.",
    },
    {
      title: "Tardes tranquilas para pop-up o cata",
      description: "Huecos de martes a jueves para marcas pequenas de alimentacion.",
      tags: ["madrid", "pop-up", "alimentacion", "obrador"],
      status: "verified",
      contributionTemplateId: "space_quiet_hours",
      contributionCategory: "physical_space_assets",
      availabilityStatus: "partial",
      capacityTotal: 3,
      capacityUsed: 1,
      capacityUnit: "slots_per_month",
      restrictions: "Aforo pequeno y solo tardes entre semana.",
      adminNotes: "Fotos del local y presencia web revisadas.",
    },
    {
      title: "Fotos limpias para nuevos desayunos",
      description: "Necesita contenido real sin una produccion cara.",
      tags: ["foto", "producto", "contenido", "catalogo"],
    },
    [{ label: "Web y fotos del local", kind: "link", url: "https://example.com/pan-barrio", status: "verified" }],
  ),
  account(
    2,
    "foto-producto",
    {
      fullName: "Bruno Ruiz",
      businessName: "Luz Producto",
      city: "Madrid",
      businessType: "service",
      stage: "first_sales",
      status: "active",
      trustScore: 72,
      adminSummary: "Portfolio sencillo, buen candidato para casos visibles con locales.",
    },
    {
      title: "Pack basico de foto de producto",
      description: "Ocho fotos editadas para catalogo, web o redes.",
      tags: ["foto", "producto", "contenido", "catalogo"],
      status: "verified",
      contributionTemplateId: "professional_service_pack",
      contributionCategory: "professional_services",
      availabilityStatus: "active",
      capacityTotal: 2,
      capacityUsed: 0,
      capacityUnit: "projects_per_month",
      restrictions: "Sin video ni direccion creativa avanzada.",
      adminNotes: "Portfolio y factura anonima revisados.",
    },
    {
      title: "Espacio fisico para primer caso visible",
      description: "Busca escaparate local para hacer una historia de caso.",
      tags: ["pop-up", "madrid", "alimentacion", "primer-caso"],
    },
    [{ label: "Portfolio publico", kind: "link", url: "https://example.com/luz-producto", status: "verified" }],
  ),
  account(
    3,
    "arcilla-botanica",
    {
      fullName: "Clara Serra",
      businessName: "Arcilla Botanica",
      city: "Valencia",
      businessType: "brand",
      stage: "first_sales",
      status: "needs_evidence",
      trustScore: 36,
      adminSummary: "Buena oferta potencial, falta stock y etiquetado.",
    },
    {
      title: "Muestras de cosmetica natural",
      description: "Quiere probar conversion en tiendas y eventos pequenos.",
      tags: ["cosmetica", "muestras", "valencia", "producto"],
      status: "pending",
      contributionTemplateId: "product_stock_samples",
      contributionCategory: "product_stock",
      availabilityStatus: "active",
      capacityTotal: 40,
      capacityUsed: 0,
      capacityUnit: "units",
      restrictions: "Falta confirmar lote, etiquetado y condiciones de entrega.",
      adminNotes: "Pedir fotos del stock y registro basico.",
    },
    {
      title: "Difusion local antes de comprar anuncios",
      description: "Busca audiencia pequena en Valencia para validar respuesta.",
      tags: ["difusion", "valencia", "comunidad", "newsletter"],
    },
    [{ label: "Declaracion de stock", kind: "note", status: "needs_more", adminNotes: "Pedir evidencia externa." }],
  ),
  account(
    4,
    "barrio-vivo",
    {
      fullName: "Diego Soler",
      businessName: "Barrio Vivo",
      city: "Valencia",
      businessType: "community",
      stage: "running",
      status: "pending_review",
      trustScore: 25,
      adminSummary: "Newsletter local con audiencia posible, metricas aun sin revisar.",
    },
    {
      title: "Difusion en newsletter local",
      description: "Seccion corta para proyectos de barrio con oferta comprobable.",
      tags: ["difusion", "valencia", "comunidad", "newsletter"],
      status: "unverified",
      contributionTemplateId: "audience_local_channel",
      contributionCategory: "audience_channels",
      availabilityStatus: "paused",
      capacityTotal: 2,
      capacityUsed: 0,
      capacityUnit: "spots",
      restrictions: "Pausada hasta revisar metricas reales.",
      adminNotes: "Pedir captura de lista y ultimos envios.",
    },
    {
      title: "Muestras o experiencias para contenido local",
      description: "Busca marcas pequenas con algo verificable que contar.",
      tags: ["cosmetica", "muestras", "producto", "evento"],
    },
    [{ label: "Captura pendiente de newsletter", kind: "note", status: "pending" }],
  ),
  account(
    5,
    "cowork-sevilla",
    {
      fullName: "Lucia Ortega",
      businessName: "Mesa Sur Cowork",
      city: "Sevilla",
      businessType: "local",
      stage: "running",
      status: "active",
      trustScore: 70,
      adminSummary: "Espacio real con calendario y capacidad clara.",
    },
    {
      title: "Sala pequena para taller o demo",
      description: "Sala de reunion para talleres de baja escala.",
      tags: ["espacio", "sevilla", "taller", "evento"],
      status: "verified",
      contributionTemplateId: "space_quiet_hours",
      contributionCategory: "physical_space_assets",
      availabilityStatus: "active",
      capacityTotal: 4,
      capacityUsed: 1,
      capacityUnit: "slots_per_month",
      restrictions: "Maximo 12 personas y horario de manana.",
      adminNotes: "Contrato y fotos revisados.",
    },
    {
      title: "Revision legal simple para acuerdos",
      description: "Quiere preparar terminos basicos para colaboraciones.",
      tags: ["legal", "contratos", "autonomos", "sevilla"],
    },
    [{ label: "Calendario de sala", kind: "link", url: "https://example.com/mesa-sur", status: "verified" }],
  ),
  account(
    6,
    "legal-autonomos",
    {
      fullName: "Nerea Campos",
      businessName: "Legal Claro",
      city: "Sevilla",
      businessType: "service",
      stage: "running",
      status: "active",
      trustScore: 80,
      adminSummary: "Servicio profesional claro y buen encaje con locales.",
    },
    {
      title: "Revision express de acuerdo entre autonomos",
      description: "Plantilla y revision de riesgos para una colaboracion sencilla.",
      tags: ["legal", "contratos", "autonomos", "sevilla"],
      status: "verified",
      contributionTemplateId: "professional_service_pack",
      contributionCategory: "professional_services",
      availabilityStatus: "partial",
      capacityTotal: 3,
      capacityUsed: 1,
      capacityUnit: "projects_per_month",
      restrictions: "No incluye pleitos, fiscalidad compleja ni sociedades.",
      adminNotes: "Colegiacion y web revisadas.",
    },
    {
      title: "Sala para taller legal pequeno",
      description: "Busca espacio para probar una charla de contratos utiles.",
      tags: ["espacio", "sevilla", "taller", "evento"],
    },
    [{ label: "Ficha profesional", kind: "link", url: "https://example.com/legal-claro", status: "verified" }],
  ),
  account(
    7,
    "moda-circular",
    {
      fullName: "Irene Vidal",
      businessName: "Ropa Segunda Vida",
      city: "Barcelona",
      businessType: "brand",
      stage: "first_sales",
      status: "pending_review",
      trustScore: 24,
      adminSummary: "Stock interesante, falta revisar fotos y procedencia.",
    },
    {
      title: "Stock seleccionado para escaparate local",
      description: "Lote pequeno de prendas para validar venta en tienda amiga.",
      tags: ["moda", "stock", "barcelona", "escaparate"],
      status: "pending",
      contributionTemplateId: "product_stock_samples",
      contributionCategory: "product_stock",
      availabilityStatus: "active",
      capacityTotal: 30,
      capacityUsed: 0,
      capacityUnit: "units",
      restrictions: "Solo deposito temporal con inventario simple.",
      adminNotes: "Pedir fotos de lote y condiciones de devolucion.",
    },
    {
      title: "Fotografia de catalogo para primer lote",
      description: "Necesita fotos consistentes antes de publicar.",
      tags: ["foto", "producto", "catalogo", "barcelona"],
    },
    [{ label: "Inventario preliminar", kind: "note", status: "pending" }],
  ),
  account(
    8,
    "estudio-norte",
    {
      fullName: "Pau Navarro",
      businessName: "Estudio Norte",
      city: "Barcelona",
      businessType: "service",
      stage: "running",
      status: "active",
      trustScore: 74,
      adminSummary: "Buen servicio para marcas que necesitan ordenar presencia digital.",
    },
    {
      title: "Mini sprint de marca y web",
      description: "Revision de identidad, landing simple y catalogo basico.",
      tags: ["branding", "web", "barcelona", "catalogo"],
      status: "verified",
      contributionTemplateId: "professional_service_pack",
      contributionCategory: "professional_services",
      availabilityStatus: "active",
      capacityTotal: 2,
      capacityUsed: 0,
      capacityUnit: "projects_per_month",
      restrictions: "Solo proyecto pequeno, sin ecommerce completo.",
      adminNotes: "Casos reales revisados.",
    },
    {
      title: "Marca de moda para caso de estudio",
      description: "Busca un proyecto pequeno con producto real.",
      tags: ["moda", "stock", "escaparate", "barcelona"],
    },
    [{ label: "Casos de estudio", kind: "link", url: "https://example.com/estudio-norte", status: "verified" }],
  ),
  account(
    9,
    "cafe-bilbao",
    {
      fullName: "Maite Etxeberria",
      businessName: "Cafe Ria",
      city: "Bilbao",
      businessType: "local",
      stage: "running",
      status: "needs_evidence",
      trustScore: 39,
      adminSummary: "Local plausible, falta verificar disponibilidad y permisos.",
    },
    {
      title: "Mesa de manana para micro pop-up",
      description: "Un rincon visible para probar producto sin montar evento grande.",
      tags: ["bilbao", "pop-up", "cafe", "evento"],
      status: "pending",
      contributionTemplateId: "space_quiet_hours",
      contributionCategory: "physical_space_assets",
      availabilityStatus: "partial",
      capacityTotal: 2,
      capacityUsed: 0,
      capacityUnit: "slots_per_month",
      restrictions: "Solo lunes y martes, sin cocina adicional.",
      adminNotes: "Pedir fotos actuales y permiso del responsable.",
    },
    {
      title: "Contenido de producto para redes",
      description: "Necesita fotos simples y alguna pieza de redes.",
      tags: ["contenido", "redes", "foto", "producto"],
    },
    [{ label: "Foto de fachada pendiente", kind: "note", status: "needs_more" }],
  ),
  account(
    10,
    "agenda-bilbao",
    {
      fullName: "Jon Arana",
      businessName: "Agenda Bilbao",
      city: "Bilbao",
      businessType: "community",
      stage: "idea",
      status: "pending_review",
      trustScore: 20,
      adminSummary: "Comunidad muy inicial; util para probar rechazo o pedir evidencia.",
    },
    {
      title: "Agenda local para difusion puntual",
      description: "Publicacion breve sobre proyectos que puedan demostrar algo real.",
      tags: ["bilbao", "difusion", "comunidad", "evento"],
      status: "unverified",
      contributionTemplateId: "audience_local_channel",
      contributionCategory: "audience_channels",
      availabilityStatus: "active",
      capacityTotal: 4,
      capacityUsed: 0,
      capacityUnit: "spots",
      restrictions: "Audiencia todavia pequena y sin metricas fiables.",
      adminNotes: "Revisar antes de aprobar cualquier intro.",
    },
    {
      title: "Espacio pequeno para agenda de barrio",
      description: "Busca casos reales para construir comunidad.",
      tags: ["pop-up", "bilbao", "cafe", "evento"],
    },
    [{ label: "Post piloto", kind: "link", url: "https://example.com/agenda-bilbao", status: "pending" }],
  ),
  account(
    11,
    "regalos-malaga",
    {
      fullName: "Sofia Reina",
      businessName: "Caja Sur Regalos",
      city: "Malaga",
      businessType: "brand",
      stage: "growing",
      status: "active",
      trustScore: 82,
      adminSummary: "Marca con stock y necesidad operacional clara.",
    },
    {
      title: "Lotes de regalo para acciones locales",
      description: "Pequenos packs para colaboraciones con tiendas y eventos.",
      tags: ["producto", "regalos", "malaga", "muestras"],
      status: "verified",
      contributionTemplateId: "product_stock_samples",
      contributionCategory: "product_stock",
      availabilityStatus: "active",
      capacityTotal: 24,
      capacityUsed: 4,
      capacityUnit: "units",
      restrictions: "Solo dentro de Malaga y con recogida coordinada.",
      adminNotes: "Stock y fotos revisados.",
    },
    {
      title: "Ayuda con envios y operaciones",
      description: "Necesita ordenar envios y control de stock este mes.",
      tags: ["logistica", "envios", "operaciones", "stock"],
    },
    [{ label: "Catalogo de packs", kind: "link", url: "https://example.com/caja-sur", status: "verified" }],
  ),
  account(
    12,
    "logistica-malaga",
    {
      fullName: "Ramon Gil",
      businessName: "Ruta Corta",
      city: "Malaga",
      businessType: "service",
      stage: "running",
      status: "active",
      trustScore: 76,
      adminSummary: "Servicio operacional concreto, facil de emparejar con marcas.",
    },
    {
      title: "Diagnostico de envios para tienda pequena",
      description: "Una sesion para ordenar embalaje, transportista y coste real.",
      tags: ["logistica", "envios", "operaciones", "malaga"],
      status: "verified",
      contributionTemplateId: "professional_service_pack",
      contributionCategory: "operations_distribution",
      availabilityStatus: "partial",
      capacityTotal: 3,
      capacityUsed: 1,
      capacityUnit: "projects_per_month",
      restrictions: "Solo diagnostico, no gestion continua.",
      adminNotes: "Experiencia y web revisadas.",
    },
    {
      title: "Producto real para probar proceso",
      description: "Busca marca con stock para demostrar mejora operativa.",
      tags: ["producto", "regalos", "muestras", "stock"],
    },
    [{ label: "Caso logistico", kind: "link", url: "https://example.com/ruta-corta", status: "verified" }],
  ),
  account(
    13,
    "mentoria-zaragoza",
    {
      fullName: "Eva Gracia",
      businessName: "Ventas Peque",
      city: "Zaragoza",
      businessType: "service",
      stage: "first_sales",
      status: "pending_review",
      trustScore: 27,
      adminSummary: "Mentoria prometedora, falta comprobar casos reales.",
    },
    {
      title: "Sesion de ventas para primer caso",
      description: "Ayuda a preparar primera llamada, oferta y seguimiento.",
      tags: ["mentoria", "ventas", "zaragoza", "formacion"],
      status: "pending",
      contributionTemplateId: "specific_knowledge_session",
      contributionCategory: "specific_knowledge",
      availabilityStatus: "active",
      capacityTotal: 4,
      capacityUsed: 0,
      capacityUnit: "hours_per_month",
      restrictions: "Solo una sesion, sin consultoria continua.",
      adminNotes: "Pedir testimonio o caso documentado.",
    },
    {
      title: "Difusion local para taller piloto",
      description: "Quiere probar una sesion con audiencia pequena.",
      tags: ["difusion", "comunidad", "newsletter", "zaragoza"],
    },
    [{ label: "Caso explicado por escrito", kind: "note", status: "pending" }],
  ),
  account(
    14,
    "newsletter-zaragoza",
    {
      fullName: "Mario Pina",
      businessName: "Zgz Circular",
      city: "Zaragoza",
      businessType: "community",
      stage: "running",
      status: "active",
      trustScore: 64,
      adminSummary: "Canal local util, metricas basicas revisadas.",
    },
    {
      title: "Mencion en newsletter de proyectos locales",
      description: "Una mencion breve con enlace y contexto de barrio.",
      tags: ["difusion", "comunidad", "newsletter", "zaragoza"],
      status: "verified",
      contributionTemplateId: "audience_local_channel",
      contributionCategory: "audience_channels",
      availabilityStatus: "active",
      capacityTotal: 3,
      capacityUsed: 1,
      capacityUnit: "spots",
      restrictions: "Solo proyectos con oferta verificable.",
      adminNotes: "Metricas de apertura revisadas.",
    },
    {
      title: "Mentoria de ventas para miembros",
      description: "Busca contenido practico para su comunidad.",
      tags: ["mentoria", "ventas", "formacion", "primer-caso"],
    },
    [{ label: "Metricas anonimas", kind: "link", url: "https://example.com/zgz-circular", status: "verified" }],
  ),
  account(
    15,
    "maker-alicante",
    {
      fullName: "Ariadna Bosch",
      businessName: "Prototipo Claro",
      city: "Alicante",
      businessType: "brand",
      stage: "idea",
      status: "pending_review",
      trustScore: 22,
      adminSummary: "Idea temprana, buena para revisar si el admin diferencia fases.",
    },
    {
      title: "Prototipo fisico de producto simple",
      description: "Puede crear una maqueta sencilla para validar uso.",
      tags: ["prototipo", "producto", "alicante", "diseno"],
      status: "pending",
      contributionTemplateId: "prototype_or_test_asset",
      contributionCategory: "validation_first_customers",
      availabilityStatus: "active",
      capacityTotal: 2,
      capacityUsed: 0,
      capacityUnit: "projects_per_month",
      restrictions: "No incluye fabricacion final ni certificaciones.",
      adminNotes: "Pedir fotos de trabajos anteriores.",
    },
    {
      title: "Primer cliente para validar prototipo",
      description: "Necesita prueba pequena con feedback honesto.",
      tags: ["validacion", "primer-cliente", "alicante", "evento"],
    },
    [{ label: "Boceto de prototipo", kind: "note", status: "pending" }],
  ),
  account(
    16,
    "eventos-alicante",
    {
      fullName: "Carmen Rios",
      businessName: "Mercado Mini",
      city: "Alicante",
      businessType: "local",
      stage: "running",
      status: "active",
      trustScore: 69,
      adminSummary: "Evento pequeno con capacidad y fechas claras.",
    },
    {
      title: "Mesa piloto en evento local",
      description: "Un puesto pequeno para validar producto con publico real.",
      tags: ["evento", "alicante", "validacion", "primer-cliente"],
      status: "verified",
      contributionTemplateId: "event_booth_or_demo",
      contributionCategory: "events_experiences",
      availabilityStatus: "reserved",
      capacityTotal: 5,
      capacityUsed: 5,
      capacityUnit: "spots",
      restrictions: "Reservado este mes, revisar siguiente fecha.",
      adminNotes: "Evento revisado, sin capacidad actual.",
    },
    {
      title: "Producto prototipo para feria",
      description: "Busca makers con algo fisico que probar.",
      tags: ["prototipo", "producto", "diseno", "stock"],
    },
    [{ label: "Pagina del evento", kind: "link", url: "https://example.com/mercado-mini", status: "verified" }],
  ),
  account(
    17,
    "catering-granada",
    {
      fullName: "Hector Molina",
      businessName: "Picoteo Sur",
      city: "Granada",
      businessType: "brand",
      stage: "first_sales",
      status: "rejected",
      trustScore: 5,
      adminSummary: "Caso rechazado para probar filtros y riesgo.",
    },
    {
      title: "Catering frio para eventos pequenos",
      description: "Oferta rechazada hasta aclarar permisos y manipulacion.",
      tags: ["alimentacion", "granada", "evento", "muestras"],
      status: "rejected",
      contributionTemplateId: "product_stock_samples",
      contributionCategory: "product_stock",
      availabilityStatus: "suspended",
      capacityTotal: 12,
      capacityUsed: 0,
      capacityUnit: "units",
      restrictions: "No usar para intros hasta resolver permisos.",
      adminNotes: "Falta documentacion sanitaria.",
    },
    {
      title: "Ayuda legal para registro alimentario",
      description: "Necesita entender que permisos aplicar.",
      tags: ["legal", "contratos", "registro", "alimentacion"],
    },
    [{ label: "Documento insuficiente", kind: "note", status: "rejected", adminNotes: "No valida la oferta." }],
  ),
  account(
    18,
    "procesos-granada",
    {
      fullName: "Olivia Torres",
      businessName: "Orden Simple",
      city: "Granada",
      businessType: "service",
      stage: "running",
      status: "pending_review",
      trustScore: 29,
      adminSummary: "Servicio operativo posible, falta comprobar un caso.",
    },
    {
      title: "Mapa rapido de procesos y stock",
      description: "Sesion para detectar cuellos de botella en negocio pequeno.",
      tags: ["operaciones", "procesos", "granada", "stock"],
      status: "pending",
      contributionTemplateId: "professional_service_pack",
      contributionCategory: "operations_distribution",
      availabilityStatus: "active",
      capacityTotal: 2,
      capacityUsed: 0,
      capacityUnit: "projects_per_month",
      restrictions: "Solo diagnostico inicial.",
      adminNotes: "Pedir caso o referencia.",
    },
    {
      title: "Producto alimentario para test operacional",
      description: "Busca un negocio con producto real para documentar mejora.",
      tags: ["alimentacion", "granada", "evento", "muestras"],
    },
    [{ label: "Resumen de caso anterior", kind: "note", status: "pending" }],
  ),
  account(
    19,
    "tienda-coruna",
    {
      fullName: "Noa Castro",
      businessName: "Tienda Bruma",
      city: "A Coruna",
      businessType: "local",
      stage: "running",
      status: "needs_evidence",
      trustScore: 34,
      adminSummary: "Buen escaparate posible, falta confirmar condiciones.",
    },
    {
      title: "Escaparate compartido para marca pequena",
      description: "Una balda visible durante dos semanas.",
      tags: ["escaparate", "a-coruna", "moda", "stock"],
      status: "pending",
      contributionTemplateId: "retail_shelf_or_window",
      contributionCategory: "physical_space_assets",
      availabilityStatus: "partial",
      capacityTotal: 2,
      capacityUsed: 1,
      capacityUnit: "spots",
      restrictions: "Solo productos no perecederos.",
      adminNotes: "Pedir fotos y condiciones de deposito.",
    },
    {
      title: "Marca y catalogo para tienda online",
      description: "Necesita ordenar catalogo y presencia digital.",
      tags: ["branding", "web", "catalogo", "contenido"],
    },
    [{ label: "Fotos de escaparate pendientes", kind: "note", status: "needs_more" }],
  ),
  account(
    20,
    "web-coruna",
    {
      fullName: "Adrian Lago",
      businessName: "Costa Web",
      city: "A Coruna",
      businessType: "service",
      stage: "first_sales",
      status: "pending_review",
      trustScore: 26,
      adminSummary: "Servicio util pero todavia con poca evidencia.",
    },
    {
      title: "Landing y catalogo simple",
      description: "Pagina ligera para negocio con producto real.",
      tags: ["branding", "web", "catalogo", "contenido"],
      status: "pending",
      contributionTemplateId: "professional_service_pack",
      contributionCategory: "professional_services",
      availabilityStatus: "active",
      capacityTotal: 2,
      capacityUsed: 0,
      capacityUnit: "projects_per_month",
      restrictions: "No incluye integraciones ni ecommerce avanzado.",
      adminNotes: "Pedir enlaces a trabajos anteriores.",
    },
    {
      title: "Escaparate para proyecto de moda",
      description: "Busca un caso local con producto y stock real.",
      tags: ["escaparate", "a-coruna", "moda", "stock"],
    },
    [{ label: "Landing propia", kind: "link", url: "https://example.com/costa-web", status: "pending" }],
  ),
];

const matches: StagingSeedMatch[] = [
  {
    seedKey: "match-foto-pan",
    offererSeedKey: "foto-producto",
    neederSeedKey: "pan-barrio",
    status: "approved",
    score: 95,
    blockingReasons: [],
    adminNotes: "Buen primer caso: oferta verificada y necesidad concreta.",
    introRequest: {
      requesterSeedKey: "pan-barrio",
      status: "requested",
      message: "Quiero revisar una intro para preparar fotos del nuevo brunch.",
    },
  },
  {
    seedKey: "match-pan-foto",
    offererSeedKey: "pan-barrio",
    neederSeedKey: "foto-producto",
    status: "introduced",
    score: 90,
    blockingReasons: [],
    adminNotes: "Intro simulada para probar estado introducido.",
    introRequest: {
      requesterSeedKey: "foto-producto",
      status: "introduced",
      message: "Me interesa usar el local como caso visible.",
    },
  },
  {
    seedKey: "match-newsletter-cosmetica",
    offererSeedKey: "barrio-vivo",
    neederSeedKey: "arcilla-botanica",
    status: "needs_evidence",
    score: 82,
    blockingReasons: ["La evidencia de la oferta debe verificarse antes de una presentacion"],
    adminNotes: "Buen encaje, pero ambos lados necesitan mas evidencia.",
  },
  {
    seedKey: "match-legal-cowork",
    offererSeedKey: "legal-autonomos",
    neederSeedKey: "cowork-sevilla",
    status: "approved",
    score: 88,
    blockingReasons: [],
    adminNotes: "Util para probar cola de decision manual.",
    introRequest: {
      requesterSeedKey: "cowork-sevilla",
      status: "approved",
      message: "Queremos preparar contratos basicos para talleres.",
    },
  },
  {
    seedKey: "match-logistica-regalos",
    offererSeedKey: "logistica-malaga",
    neederSeedKey: "regalos-malaga",
    status: "completed",
    score: 91,
    blockingReasons: [],
    adminNotes: "Caso completado simulado para creditos internos.",
    introRequest: {
      requesterSeedKey: "regalos-malaga",
      status: "introduced",
      message: "Necesitamos ordenar envios para el siguiente lote.",
    },
  },
  {
    seedKey: "match-web-tienda",
    offererSeedKey: "web-coruna",
    neederSeedKey: "tienda-coruna",
    status: "suggested",
    score: 77,
    blockingReasons: ["El perfil que ofrece esta pendiente de revision del fundador"],
    adminNotes: "Sirve para revisar candidato no listo.",
  },
];

export function buildStagingSeedDataset(): StagingSeedDataset {
  return {
    accounts: accounts.map((item) => ({
      ...item,
      profile: { ...item.profile },
      offer: { ...item.offer, tags: [...item.offer.tags] },
      need: { ...item.need, tags: [...item.need.tags] },
      evidenceItems: item.evidenceItems.map((evidence) => ({ ...evidence })),
    })),
    matches: matches.map((match) => ({
      ...match,
      blockingReasons: [...match.blockingReasons],
      introRequest: match.introRequest ? { ...match.introRequest } : undefined,
    })),
  };
}

export function findSeedCleanupEmails(emails: string[]) {
  return emails.filter((item) => item.toLowerCase().endsWith(`@${STAGING_SEED_EMAIL_DOMAIN}`));
}
