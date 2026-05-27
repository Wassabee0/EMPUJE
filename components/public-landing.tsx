import Link from "next/link";
import { ArrowRight, BadgeCheck, FileSearch, Handshake, LockKeyhole, MapPin, ShieldCheck } from "lucide-react";

import { ConfigurationNotice } from "@/components/configuration-notice";
import { SiteHeader } from "@/components/site-header";

const examples = [
  {
    city: "Madrid",
    kind: "Espacio infrautilizado",
    title: "Una panadería tiene tardes tranquilas y una mesa grande libre.",
    offer: "Espacio real, paso de barrio y café para una sesión pequeña.",
    need: "Fotos de producto y contenido local para vender más entre semana.",
    benefit: "Convertir horas muertas en contenido y clientes de barrio.",
  },
  {
    city: "Valencia",
    kind: "Pop-up sin alquiler grande",
    title: "Una marca pequeña de cosmética necesita probar producto en persona.",
    offer: "Muestras, comunidad y contenido para el negocio anfitrión.",
    need: "Un espacio local verificado durante una tarde.",
    benefit: "Probar una colaboración sin comprar anuncios.",
  },
  {
    city: "Barcelona",
    kind: "Números claros",
    title: "Un asesor de operaciones puede revisar márgenes de tiendas jóvenes.",
    offer: "Una revisión concreta con números claros.",
    need: "Pruebas, testimonios y referencias de negocios locales.",
    benefit: "Cambiar intuición por decisiones con margen real.",
  },
  {
    city: "Sevilla",
    kind: "Primeros clientes",
    title: "Un estudio de diseño quiere casos reales, no otro portfolio inventado.",
    offer: "Identidad visual rápida para una campaña local.",
    need: "Un negocio con escaparate, urgencia y permiso para publicar el antes/después.",
    benefit: "Conseguir prueba social útil sin regalar trabajo a cualquiera.",
  },
  {
    city: "Málaga",
    kind: "Audiencia local",
    title: "Una newsletter de barrio tiene lectores, pero necesita historias buenas.",
    offer: "Distribución a una audiencia local ya segmentada.",
    need: "Negocios con acciones reales que merezcan ser contadas.",
    benefit: "Visibilidad con contexto, no posts sueltos que mueren en redes.",
  },
  {
    city: "Bilbao",
    kind: "Stock parado",
    title: "Una tienda tiene stock de temporada y quiere moverlo sin liquidarlo mal.",
    offer: "Producto para una acción cruzada o pack local.",
    need: "Otro negocio con comunidad compatible y una idea de activación.",
    benefit: "Crear ventas o leads sin quemar precio desde el primer día.",
  },
  {
    city: "Zaragoza",
    kind: "Proveedor fiable",
    title: "Un taller puede producir tiradas pequeñas, pero necesita pedidos repetibles.",
    offer: "Fabricación corta, flexible y revisada por una persona real.",
    need: "Marcas con demanda inicial que no pueden pedir miles de unidades.",
    benefit: "Reducir riesgo antes de comprometer caja en producción.",
  },
  {
    city: "A Coruña",
    kind: "Confianza profesional",
    title: "Una gestoría quiere ayudar a autónomos nuevos sin vender una auditoría enorme.",
    offer: "Revisión de alta, facturación y primeros errores comunes.",
    need: "Casos reales, reputación local y relaciones a largo plazo.",
    benefit: "Evitar errores caros en una fase donde cada euro cuenta.",
  },
  {
    city: "Granada",
    kind: "Comunidad",
    title: "Una escuela creativa tiene alumnos con talento y proyectos sin cliente real.",
    offer: "Contenido, foto, vídeo o prototipos con supervisión.",
    need: "Negocios pequeños con encargos acotados y feedback honesto.",
    benefit: "Conectar formación con trabajo real sin abrir un marketplace caótico.",
  },
];

export function PublicLanding() {
  return (
    <div className="page-shell">
      <SiteHeader />

      <main>
        <section className="hero">
          <div className="hero-inner">
            <span className="eyebrow">Beta privada para oportunidades revisadas en España</span>
            <h1>Emprender no debería depender de conocer ya a alguien.</h1>
            <p className="lead">
              Empuje conecta pequeños negocios, autónomos y marcas emergentes en España alrededor de algo concreto que
              pueden ofrecer y algo concreto que necesitan. La página pública solo enseña ejemplos. Las oportunidades
              reales se mantienen privadas hasta que la cuenta ha sido revisada.
            </p>
            <div className="hero-actions">
              <Link className="button clay" href="/auth?mode=signup&next=/onboarding">
                Solicitar acceso beta <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link className="button secondary" href="/auth?next=/dashboard">
                Ya tengo cuenta
              </Link>
            </div>
            <div className="hero-proof" aria-label="Principios de la beta">
              <div className="proof-item">
                <strong>Privado</strong>
                <p>Los miembros solo ven oportunidades aprobadas y relevantes para su cuenta.</p>
              </div>
              <div className="proof-item">
                <strong>Revisado</strong>
                <p>Las afirmaciones no se dan por buenas hasta comprobar evidencias.</p>
              </div>
              <div className="proof-item">
                <strong>Manual primero</strong>
                <p>El fundador puede aprobar, ajustar o rechazar cada match.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section tight">
          <div className="container">
            <ConfigurationNotice />
          </div>
        </section>

        <section className="section" id="how">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Cómo funciona</span>
              <h2>Menos teatro de networking. Más intercambios concretos y revisados.</h2>
              <p>
                Empuje no es un directorio público ni un tablón de trueque sin control. Es un sistema para crear
                confianza inicial: quién eres, qué puedes ofrecer de verdad, qué necesitas y qué evidencia respalda cada
                afirmación.
              </p>
            </div>
            <div className="grid-3">
              <article className="item">
                <FileSearch size={24} color="#1e4f78" aria-hidden="true" />
                <h3>1. Solicita acceso con datos concretos</h3>
                <p>Cuenta tu negocio, ciudad, una oferta útil, una necesidad concreta y enlaces o archivos de prueba.</p>
              </article>
              <article className="item green">
                <ShieldCheck size={24} color="#0d5c4d" aria-hidden="true" />
                <h3>2. El fundador revisa las afirmaciones</h3>
                <p>Las ofertas empiezan pendientes. Espacio, audiencia, experiencia, stock o acceso deben verificarse.</p>
              </article>
              <article className="item clay">
                <Handshake size={24} color="#c95e44" aria-hidden="true" />
                <h3>3. Los matches siguen siendo privados</h3>
                <p>Los matches aprobados aparecen en cada cuenta. Admin puede ajustar puntuación e introducciones.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="section" id="examples">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Ejemplos públicos</span>
              <h2>Estos son ejemplos del tipo de oportunidad, no listados reales.</h2>
              <p>
                Un visitante de Reddit puede entender el concepto sin ver datos de miembros. Las ofertas, necesidades y
                matches reales son privados dentro de cada cuenta tras la revisión.
              </p>
              <span className="badge">No son casos reales</span>
            </div>
            <div className="grid-3">
              {examples.map((example) => (
                <article className="item" key={example.title}>
                  <div className="badge-row">
                    <span className="badge">
                      <MapPin size={14} aria-hidden="true" /> {example.city}
                    </span>
                    <span className="badge">{example.kind}</span>
                  </div>
                  <h3>{example.title}</h3>
                  <p>
                    <strong>Podría ofrecer:</strong> {example.offer}
                  </p>
                  <p>
                    <strong>Podría necesitar:</strong> {example.need}
                  </p>
                  <p>
                    <strong>Beneficio probable:</strong> {example.benefit}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="trust">
          <div className="container">
            <div className="grid-2">
              <div className="section-head">
                <span className="eyebrow">Modelo de confianza</span>
                <h2>Si alguien dice que tiene un local, audiencia, contactos o experiencia, Empuje pide pruebas.</h2>
                <p>
                  La verificación va por oferta, no solo por cuenta. Un miembro puede ser real y aun así tener una
                  afirmación sin verificar. Los matches muestran bloqueos hasta que la evidencia es suficiente.
                </p>
              </div>
              <div className="stack">
                <div className="item blue">
                  <BadgeCheck size={22} color="#1e4f78" aria-hidden="true" />
                  <h3>Evidencia antes de presentar a nadie</h3>
                  <p>Enlaces, archivos, fotos, perfiles públicos, páginas de negocio, referencias o notas manuales.</p>
                </div>
                <div className="item">
                  <LockKeyhole size={22} color="#0d5c4d" aria-hidden="true" />
                  <h3>Grafo de oportunidades privado</h3>
                  <p>Los miembros no navegan por todo. Ven oportunidades aprobadas que encajan con su cuenta.</p>
                </div>
                <div className="danger-note">
                  Ninguna afirmación se trata como cierta hasta revisarla. Ese es el producto, no letra pequeña.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="money">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Ángulo monetizable</span>
              <h2>Empuje no monetiza estar listado. Monetiza confianza, coordinación y acceso.</h2>
              <p>
                La beta es gratis mientras se valida la liquidez. Después, el valor está en círculos curados,
                introducciones revisadas y montaje de colaboraciones para negocios que no tienen tiempo de perseguir
                contactos.
              </p>
            </div>
            <div className="grid-3">
              <article className="item green">
                <h3>Membresía local</h3>
                <p>Cuota mensual pequeña cuando haya oportunidades reales y revisadas en una ciudad o vertical.</p>
              </article>
              <article className="item clay">
                <h3>Montaje asistido de colaboraciones</h3>
                <p>Ayuda pagada para preparar un pop-up, piloto, lanzamiento o pequeño círculo de proveedores.</p>
              </article>
              <article className="item blue">
                <h3>Círculos patrocinados</h3>
                <p>Coworkings, gestorías, asociaciones, escuelas e instituciones locales pueden patrocinar cohortes.</p>
              </article>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container split">
          <p>Empuje beta. Solo ejemplos públicos. Las oportunidades reales son privadas y revisadas.</p>
          <Link href="/auth?mode=signup&next=/onboarding">Solicitar acceso beta</Link>
        </div>
      </footer>
    </div>
  );
}
