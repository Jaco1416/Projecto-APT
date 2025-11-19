import React from 'react'
import img from "../../../../public/assets/pastelera.png";
import Image from 'next/image';
function AcercaDe() {
    return (
        <section className="flex flex-col md:flex-row items-center justify-center gap-10 px-8 py-16 bg-white">
            <div className="max-w-6xl w-full flex flex-col md:flex-row items-center justify-between">
                {/* Texto */}
                <div className="flex-1 text-gray-700 md:pr-8 text-center md:text-left max-w-lg">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#C72C2F] mb-8 text-center md:text-left">
                        Acerca de nuestro negocio
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Origen</h4>
                            <p className="text-sm md:text-base leading-relaxed">
                                Nuestro negocio nació desde la pasión por la repostería y pastelería,
                                empezando por pedidos pequeños realizados por necesidad.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Visión</h4>
                            <p className="text-sm md:text-base leading-relaxed">
                                Nuestra visión es poder extender nuestro rango de clientela, integrando más comunas
                                dentro de nuestro alcance, además de implementar nuevas recetas con el tiempo.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Misión</h4>
                            <p className="text-sm md:text-base leading-relaxed">
                                Nuestra misión es que todos nuestros vecinos puedan disfrutar nuestros productos
                                de manera cómoda y rápida.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Imagen */}
                <div className="flex-1 flex justify-center md:justify-end">
                    <Image
                        src={img}
                        alt="Decorando torta"
                        className="rounded-lg shadow-md w-full max-w-[550px] h-100 object-cover"
                    />
                </div>
            </div>
        </section>
    )
}

export default AcercaDe