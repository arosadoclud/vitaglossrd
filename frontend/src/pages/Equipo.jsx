import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSEO } from '../hooks/useSEO'
import LoginModal from '../components/LoginModal'

const WA_TEAM = 'https://wa.me/18492763532?text=Hola!%20Quiero%20recibir%20informaci%C3%B3n%20sobre%20la%20oportunidad%20Amway%20y%20el%20equipo%20VitaGloss%20RD'

const steps = [
  ['01', 'Conversación inicial', 'Conocemos tus objetivos y respondemos tus preguntas con transparencia.'],
  ['02', 'Información oficial', 'Revisas cómo funciona la oportunidad Amway, sus responsabilidades y el modelo de venta directa.'],
  ['03', 'Decisión informada', 'Tú decides si comenzar. No existe obligación de unirte ni de comprar materiales opcionales.'],
  ['04', 'Acompañamiento', 'Si comienzas, recibes orientación para conocer productos, atender clientes y desarrollar habilidades.'],
]

const support = [
  ['Fundamentos de producto', 'Aprende a consultar y comunicar información oficial para orientar responsablemente a los clientes.'],
  ['Servicio al cliente', 'Organiza conversaciones, seguimiento y atención posventa con hábitos profesionales.'],
  ['Herramientas digitales', 'Aprende a utilizar recursos aprobados, MyShop y canales sociales de manera ordenada.'],
  ['Comunidad', 'Comparte experiencias y dudas con otros Empresarios Independientes de Amway.'],
]

const faqs = [
  ['¿Es un empleo?', 'No. Es una oportunidad de negocio independiente de venta directa ofrecida por Amway. No existe salario ni relación laboral.'],
  ['¿Los ingresos están garantizados?', 'No. Los resultados varían y dependen de las ventas a clientes, la experiencia, el esfuerzo, los gastos y otros factores.'],
  ['¿Necesito experiencia previa?', 'No es obligatorio tener experiencia, pero sí disposición para aprender sobre productos, servicio al cliente y prácticas responsables de negocio.'],
  ['¿Debo mantener inventario?', 'Puedes solicitar información oficial sobre las opciones disponibles antes de tomar una decisión. No presentamos la compra de inventario o materiales opcionales como condición para recibir orientación.'],
  ['¿Qué apoyo ofrece VitaGloss RD?', 'Compartimos orientación básica y experiencia práctica. Amway ofrece el contrato, el plan, los productos y recursos oficiales; cualquier apoyo adicional se presenta de forma separada y opcional.'],
]

function ArrowIcon() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-5-5l5 5-5 5" /></svg>
}

export default function Equipo() {
  const [openFaq, setOpenFaq] = useState(0)
  const [loginOpen, setLoginOpen] = useState(false)

  useSEO({
    title: 'Conoce la oportunidad Amway con VitaGloss RD',
    description: 'Información clara sobre la oportunidad de negocio independiente Amway, la venta directa y el acompañamiento de VitaGloss RD en República Dominicana.',
    canonical: 'https://www.vitaglossrd.com/equipo',
  })

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-[#07192f] pt-32 sm:pt-40 pb-20 sm:pb-28 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(46,196,182,.22),transparent_35%)]" />
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 text-center">
          <p className="text-secondary text-xs sm:text-sm font-bold uppercase tracking-[.22em] mb-6">Oportunidad de negocio independiente</p>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-[-.045em] leading-[1.03] max-w-5xl mx-auto mb-7">Construye habilidades. Atiende clientes. <span className="text-secondary">Crece a tu ritmo.</span></h1>
          <p className="text-white/65 text-lg sm:text-xl leading-relaxed max-w-3xl mx-auto mb-10">Conoce la oportunidad de venta directa ofrecida por Amway y cómo VitaGloss RD puede acompañarte mientras desarrollas tu propio negocio independiente.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={WA_TEAM} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 bg-secondary hover:bg-[#22b5a8] text-[#07192f] font-extrabold px-8 py-4 rounded-xl transition-colors">Solicitar información <ArrowIcon /></a>
            <a href="#como-funciona" className="inline-flex items-center justify-center border border-white/25 hover:border-white/50 text-white font-bold px-8 py-4 rounded-xl transition-colors">Ver cómo funciona</a>
          </div>
          <p className="mt-7 text-white/40 text-sm">Los ingresos no están garantizados. Los resultados dependen de múltiples factores y del esfuerzo continuo.</p>
        </div>
      </section>

      <section className="py-16 sm:py-20 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 grid md:grid-cols-3 gap-8">
          {[
            ['Venta directa', 'Los ingresos se generan mediante la venta de productos a clientes y las ventas realizadas por los equipos que se desarrollan.'],
            ['Negocio independiente', 'Tú organizas tu actividad, asumes responsabilidades y decides cuánto tiempo dedicar.'],
            ['Expectativas realistas', 'No presentamos plazos, niveles de ingreso o resultados como garantizados.'],
          ].map(([title, text]) => <div key={title} className="border-l-2 border-secondary pl-5"><h2 className="font-black text-primary text-xl mb-2">{title}</h2><p className="text-gray-500 text-sm leading-relaxed">{text}</p></div>)}
        </div>
      </section>

      <section id="como-funciona" className="py-20 sm:py-28 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-2xl mb-12"><p className="text-secondary text-xs font-bold uppercase tracking-[.2em] mb-3">Proceso transparente</p><h2 className="text-3xl sm:text-5xl font-black tracking-tight text-primary mb-4">Antes de comenzar, entiende cada paso.</h2><p className="text-gray-500 leading-relaxed">La primera conversación es informativa. Queremos que puedas decidir con claridad y hacer todas tus preguntas.</p></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map(([number, title, text]) => <div key={number} className="bg-white border border-gray-100 rounded-[24px] p-6 sm:p-7"><span className="text-secondary font-black text-sm tracking-widest">{number}</span><h3 className="font-black text-primary text-xl mt-7 mb-3">{title}</h3><p className="text-gray-500 text-sm leading-relaxed">{text}</p></div>)}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-[.8fr_1.2fr] gap-12 lg:gap-20 items-start">
          <div className="lg:sticky lg:top-28"><p className="text-secondary text-xs font-bold uppercase tracking-[.2em] mb-3">Acompañamiento</p><h2 className="text-3xl sm:text-5xl font-black tracking-tight text-primary mb-5">No tienes que aprender todo en un día.</h2><p className="text-gray-500 leading-relaxed mb-7">El enfoque es avanzar desde los fundamentos, practicar y mejorar continuamente. El apoyo complementa los recursos oficiales de Amway y no garantiza resultados.</p><Link to="/contacto" className="inline-flex items-center gap-2 text-primary font-extrabold hover:text-secondary transition-colors">Conocer al equipo <ArrowIcon /></Link></div>
          <div className="grid sm:grid-cols-2 gap-5">{support.map(([title, text], index) => <div key={title} className="rounded-[24px] border border-gray-100 p-7 bg-[#f8fafc]"><span className="w-10 h-10 rounded-full bg-secondary/15 text-secondary flex items-center justify-center font-black text-sm">{String(index + 1).padStart(2, '0')}</span><h3 className="font-black text-primary text-xl mt-7 mb-3">{title}</h3><p className="text-gray-500 text-sm leading-relaxed">{text}</p></div>)}</div>
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-primary text-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div><p className="text-secondary text-xs font-bold uppercase tracking-[.2em] mb-4">Una mirada realista</p><h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-5">Un negocio requiere clientes, aprendizaje y constancia.</h2><p className="text-white/60 text-lg leading-relaxed">No prometemos una transformación rápida. Presentamos una oportunidad para aprender habilidades, servir a clientes y desarrollar una actividad de venta directa con esfuerzo continuo.</p></div>
          <div className="rounded-[28px] bg-white/[.06] border border-white/10 p-7 sm:p-9 space-y-5">
            {['No es un empleo ni ofrece salario.', 'No hay ingresos garantizados.', 'Las decisiones de tiempo y gastos son tuyas.', 'La capacitación adicional se presenta como opcional.', 'Puedes solicitar información antes de decidir.'].map(item => <div key={item} className="flex items-start gap-3"><svg className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12l4 4L19 6" /></svg><p className="text-white/75">{item}</p></div>)}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-[#f8fafc]">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-10"><p className="text-secondary text-xs font-bold uppercase tracking-[.2em] mb-3">Preguntas frecuentes</p><h2 className="text-3xl sm:text-5xl font-black tracking-tight text-primary">Decide con información.</h2></div>
          <div className="space-y-3">{faqs.map(([question, answer], index) => <div key={question} className="bg-white border border-gray-100 rounded-2xl overflow-hidden"><button type="button" onClick={() => setOpenFaq(openFaq === index ? -1 : index)} className="w-full px-6 py-5 flex items-center justify-between gap-5 text-left"><span className="font-extrabold text-primary">{question}</span><span className="text-secondary text-2xl font-light" aria-hidden="true">{openFaq === index ? '−' : '+'}</span></button>{openFaq === index && <p className="px-6 pb-6 text-gray-500 text-sm leading-relaxed">{answer}</p>}</div>)}</div>
        </div>
      </section>

      <section className="py-20 sm:py-24 text-center">
        <div className="max-w-3xl mx-auto px-5 sm:px-8"><h2 className="text-3xl sm:text-5xl font-black tracking-tight text-primary mb-5">¿Quieres hacer tus preguntas?</h2><p className="text-gray-500 text-lg leading-relaxed mb-9">Solicita una conversación informativa, sin compromiso y a tu ritmo.</p><a href={WA_TEAM} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 bg-primary hover:bg-[#102d58] text-white font-extrabold px-8 py-4 rounded-xl transition-colors">Solicitar información <ArrowIcon /></a><p className="mt-6 text-gray-400 text-xs">Empresario Independiente de Amway. Los resultados individuales varían.</p><button type="button" onClick={() => setLoginOpen(true)} className="mt-8 text-sm font-semibold text-gray-400 hover:text-primary transition-colors">Acceso privado para administración y equipo</button></div>
      </section>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  )
}
