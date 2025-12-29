import Link from "next/link";
import Image from "next/image";
import Typewriter from "@/src/components/Typewriter";
import ScrollingTypewriter from "@/src/components/ScrollingTypewriter";

export default function WelcomePage() {
  return (
    // min-h-screen y flex-col permiten que el nav se quede arriba y el main use el resto
    <div className="min-h-screen flex flex-col transition-colors">

<nav className="relative w-full p-6">
  {/* FIRMA */}
  <div className="flex top-4 left-8 flex items-center gap-1 z-50">
    <div className="relative w-12 h-12">
      <Image
        src="/logo.png"
        alt="StageBook Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
      <span className="text-[9px] font-mono uppercase tracking-[0.2em] opacity-80 whitespace-nowrap">
        Una aplicación de <span className="text-[10px] text-purple-600 font-bold">Yo´s company</span>
      </span>
  </div>

  {/* ACCIONES*/}
  <div className="flex justify-end items-center gap-4 max-w-7xl mx-auto w-full">
    <Link href="/login" className="text-sm font-mono hover:text-red-600 transition-colors text-purple-600">
      Entrar
    </Link>
    <Link 
      href="/register" 
      className="text-sm font-mono bg-[#F9F6EE] text-black px-6 py-2 rounded-full font-bold hover:bg-zinc-200 transition-all shadow-md"
    >
      Registro
    </Link>
  </div>
</nav>

      {/* BLOQUE 2: TÍTULO CENTRAL (STAGEBOOK) */}
      <div className="flex flex-col items-center mt-4">
        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter">
          STAGE<span className="text-[#FF0000]">BOOK</span>
        </h1>
      <div className="text-xs font-mono uppercase tracking-[0.3em] mt-2 text-zinc-500">
        <Typewriter 
          text="ARTISTIC PLANNER & PORTFOLIO" 
          speed={150} 
          className="text-zinc-500"
        />
      </div>
      </div>

      {/* BLOQUE 3: TEXTO A LA IZQUIERDA (CONTENIDO) */}
      <main className="flex-grow flex items-end pb-20 px-10">
        <div className="max-w-2xl text-left"> {/* text-left alinea a la izquierda */}
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2  leading-tight">
            Control total en el <br />
            <span className="text-[#FF0000]">escenario</span>
        {/* Decoración vertical roja */}
        <div className="mt-2 h-1 w-32 bg-purple-600 rounded-full animate-pulse"></div>
          </h2>
                  
        <div className="mb-10 max-w-lg font-mono">
          <ScrollingTypewriter />
          <p className="text-zinc-500 text-sm mt-0.5">
            Evoluciona tus proyectos a la era digital del teatro.
          </p>
        </div>

          <div className="flex gap-4">
            <Link 
              href="/dashboard" 
              className="px-8 py-4 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all shadow-lg">
              ¡EXPLÓRALA!
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}