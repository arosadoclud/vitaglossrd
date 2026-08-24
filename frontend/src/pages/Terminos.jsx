import { useSEO } from '../hooks/useSEO'

export default function Terminos() {
  useSEO({
    title: 'Términos de Uso',
    description: 'Términos y condiciones de uso del sitio VitaGloss RD. Proceso de compra, envíos, garantías y política de devoluciones.',
    canonical: 'https://www.vitaglossrd.com/terminos',
  })

  return (
    <div className="min-h-screen bg-white pt-28 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-black text-primary mb-2">Términos de Uso</h1>
        <p className="text-gray-400 text-sm mb-10">Última actualización: agosto 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-600 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">1. Aceptación</h2>
            <p>
              Al acceder y utilizar el sitio web de VitaGloss RD, aceptas los presentes términos de uso en su totalidad. Si no estás de acuerdo con alguno de estos términos, te pedimos que no utilices el sitio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">2. Sobre VitaGloss RD</h2>
            <p>
              VitaGloss RD es un distribuidor independiente de productos Amway en República Dominicana. No somos Amway Corporation. Los precios y disponibilidad pueden variar sin previo aviso.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">3. Proceso de compra</h2>
            <p>
              Las compras iniciadas desde los botones “Comprar en MyShop” se completan en el sitio oficial de Amway y quedan sujetas a sus precios, disponibilidad, términos y proceso de confirmación. VitaGloss RD ofrece orientación independiente antes y después de la compra, pero no procesa el pago de esos pedidos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">4. Precios y pagos</h2>
            <p>
              El precio mostrado inicialmente en MyShop corresponde al producto y no incluye necesariamente impuestos, gastos de entrega u otros cargos aplicables. Amway calcula y muestra el total final —producto, impuestos, entrega y cualquier cargo adicional— durante el checkout, antes de que el cliente confirme el pago. Los precios internos visibles en áreas privadas de VitaGloss RD no constituyen una oferta pública y pueden cambiar sin previo aviso.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">5. Envíos y entregas</h2>
            <p>
              Los gastos de entrega no están incluidos en el precio inicial del producto. Para los pedidos completados en MyShop, el cliente debe elegir una de las opciones que Amway muestre durante el checkout. Los costos, plazos, disponibilidad territorial y cualquier opción de retiro son determinados y confirmados en ese proceso. VitaGloss RD no promete una modalidad ni una tarifa de entrega que no aparezca en el checkout oficial.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">6. Garantía y devoluciones</h2>
            <p>
              Ofrecemos garantía de satisfacción de 30 días. Si el producto llega dañado o no corresponde con el pedido, lo reemplazamos sin costo adicional. Las devoluciones por cambio de opinión están sujetas a que el producto esté sin abrir y en perfectas condiciones.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">7. Propiedad intelectual</h2>
            <p>
              El contenido del sitio (textos, imágenes, diseño) es propiedad de VitaGloss RD salvo donde se indique lo contrario. Las marcas Amway, Nutrilite™ y Glister™ son propiedad de Amway Corporation y se usan en calidad de distribuidor autorizado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">8. Limitación de responsabilidad</h2>
            <p>
              VitaGloss RD no será responsable por daños indirectos, incidentales o consecuentes derivados del uso del sitio o los productos. La responsabilidad máxima no excederá el valor del pedido realizado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">9. Legislación aplicable</h2>
            <p>
              Estos términos se rigen por las leyes de la República Dominicana. Cualquier disputa se resolverá en los tribunales competentes del país.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">10. Contacto</h2>
            <p>
              Para cualquier consulta sobre estos términos, contáctanos por WhatsApp al <strong>(849) 276-3532</strong>.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
