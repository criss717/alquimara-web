import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Nuestra Esencia
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Conoce a las mentes y manos que con pasión y sabiduría dan vida a Alquimara.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start">        
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center flex flex-col items-center transform hover:scale-105 transition-transform duration-300 ease-in-out h-[450px]">
            <div className="relative w-40 h-40">
              <Image
                src="/fotoCris.jpg"
                alt="Foto de Cristian Guzman"
                fill
                className="rounded-full object-cover border-4 border-violet-200 shadow-md"
              />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-800">Cristian Guzman</h2>
            <h3 className="mt-2 text-lg font-semibold text-purple-700">Diseñador y Desarrollador</h3>
            <p className="mt-4 text-gray-600 text-base">
              Cristian es el arquitecto digital de Alquimara. Con su pasión por el código limpio y el diseño intuitivo, ha dado forma a nuestra plataforma, asegurando que tu experiencia sea tan fluida y hermosa como nuestros jabones.
            </p>
          </div>
         
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center flex flex-col items-center transform hover:scale-105 transition-transform duration-300 ease-in-out h-[450px]">
            <div className="relative w-40 h-40">
              <Image
                src="/fotoXio.jpg"
                alt="Foto de Xiomara Mazo"
                fill
                className="rounded-full object-cover border-4 border-violet-200 shadow-md"
              />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-800">Xiomara Mazo</h2>
            <h3 className="mt-2 text-lg font-semibold text-purple-700">Astróloga y Maestra Jabonera</h3>
            <p className="mt-4 text-gray-600 text-base">
              Xiomara es el alma de Alquimara. Como astróloga psicológica, infunde sabiduría y propósito en cada creación. Sus manos, expertas en una técnica artesanal de Colombia, transforman ingredientes naturales en jabones que nutren el cuerpo y el espíritu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
