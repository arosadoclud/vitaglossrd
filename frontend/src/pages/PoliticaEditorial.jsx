import { Link } from 'react-router-dom'
import { useSEO } from '../hooks/useSEO'

export default function PoliticaEditorial() {
  useSEO({
    title: 'Política editorial y transparencia',
    description: 'Conoce cómo VitaGloss RD investiga, revisa, corrige y divulga los intereses comerciales de su contenido de salud y bienestar.',
    canonical: 'https://www.vitaglossrd.com/politica-editorial',
  })

  return (
    <main className="min-h-screen bg-white pt-28 pb-20 px-4">
      <article className="max-w-3xl mx-auto">
        <p className="text-secondary text-xs font-bold uppercase tracking-[0.18em] mb-3">Transparencia</p>
        <h1 className="text-3xl sm:text-4xl font-black text-primary mb-2">Política editorial</h1>
        <p className="text-gray-400 text-sm mb-10">Última actualización: agosto de 2026</p>

        <div className="space-y-9 text-gray-600 leading-relaxed">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-900">
            <strong>Relación comercial:</strong> Andy Rosado es Empresario Independiente de Amway. VitaGloss RD puede recibir compensación por productos adquiridos mediante sus canales. Una recomendación comercial no sustituye una evaluación profesional.
          </div>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">Propósito y alcance</h2>
            <p>Publicamos contenido educativo, en español y adaptado a República Dominicana, sobre nutrición, suplementos, salud bucal y bienestar. Buscamos explicar decisiones cotidianas con claridad, incluir límites y riesgos, y diferenciar la información editorial de la promoción de productos.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">Autoría y límites profesionales</h2>
            <p>Los artículos identifican a su autor y su fecha de actualización. Andy Rosado escribe desde su experiencia comercial como Empresario Independiente de Amway; no se presenta como médico, odontólogo ni nutricionista. Un artículo no tiene revisión clínica a menos que se nombre expresamente al profesional revisor y se indiquen sus credenciales.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">Proceso antes de publicar</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Definimos la pregunta concreta que necesita resolver el lector dominicano.</li>
              <li>Consultamos fuentes institucionales y documentos primarios aplicables; las afirmaciones importantes deben poder rastrearse.</li>
              <li>Separamos hechos, experiencia personal y mensajes comerciales.</li>
              <li>Revisamos título, enlaces, imagen, legibilidad, advertencias y posibles afirmaciones absolutas.</li>
              <li>Ejecutamos controles automáticos de estructura, metadatos, imágenes y enlaces internos.</li>
            </ol>
            <p className="mt-3">Podemos usar herramientas de inteligencia artificial para borradores, organización, imágenes editoriales o control de calidad. La decisión de publicar y la responsabilidad final son humanas. No publicamos texto automatizado sin revisión.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">Salud, evidencia y seguridad</h2>
            <p>El contenido es informativo y no constituye diagnóstico, prescripción ni tratamiento. Priorizamos organismos de salud, reguladores, guías clínicas y literatura científica. Las fichas del fabricante se usan para describir un producto, no como única prueba de eficacia. Ante síntomas, embarazo, condiciones médicas o uso de medicamentos, consulta a un profesional de salud.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">Actualizaciones y correcciones</h2>
            <p>El archivo histórico está en revisión progresiva para mejorar fuentes y precisión. Cuando un dato cambie o detectemos un error material, actualizaremos el artículo y su fecha. Puedes reportar errores por WhatsApp al <strong>(849) 276-3532</strong> o mediante el <Link to="/contacto" className="text-primary font-semibold hover:underline">formulario de contacto</Link>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">Publicidad y monetización</h2>
            <p>La publicidad, si se incorpora, será identificable y no alterará nuestras conclusiones editoriales. Cumplir controles técnicos o seguir buenas prácticas no garantiza aceptación en Google AdSense; la plataforma evalúa cada sitio de forma independiente.</p>
          </section>
        </div>
      </article>
    </main>
  )
}
