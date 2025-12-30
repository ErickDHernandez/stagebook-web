"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Cursor from '@/src/components/Cursor'; 
import Typewriter from '@/src/components/Typewriter';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Estados de enfoque
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Estados de error y animación
  const [error, setError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [buttonText, setButtonText] = useState("CREAR MI CAMERINO");

  const handleRegister = () => {
    if (!name || !email || !password) {
      setError(true);
      setIsShaking(true);
      setButtonText("LIBRETO INCOMPLETO");
      
      setTimeout(() => {
        setIsShaking(false);
        setButtonText("CREAR MI CAMERINO");
      }, 200);
      return;
    }
    console.log("Registrando nuevo artista...");
  };

  return (
    <main className="min-h-screen  flex flex-col items-center justify-center px-6 py-12">
      
      {/* Header */}
      <div className="flex flex-col items-center mb-10">
        <div className="relative w-16 h-16 mb-4 opacity-80">
          <Image src="/logo.png" alt="Logo" fill className="object-contain" />
        </div>
        <h1 className="text-3xl font-mono font-bold tracking-tighter ">
          NUEVA <span className="text-red-600">OBRA</span>
        </h1>
        <div className="h-6">
          <Typewriter text="Escribe tus primeras líneas..." speed={70} className="text-zinc-500 text-sm italic" />
        </div>
      </div>

<div className="w-full max-w-md space-y-8">
        
        {/* Campo Nombre */}
        <div className={`relative group ${isShaking && !name ? '[animation:shake_0.15s_ease-in-out_infinite]'  : ''}`}>
          <label className={`text-[10px] uppercase tracking-widest mb-2 block ml-2 transition-colors
            ${error && !name ? 'text-red-500' : 'text-zinc-500'}`}>
            Nombre del Artista / Director
          </label>
          <div className={`flex items-center border-b-2 transition-colors duration-300 py-3 px-2 
            ${error && !name ? 'border-red-600' : nameFocused ? 'border-[#F9F6EE]' : 'border-zinc-800'}`}>
            <input
              type="text"
              className="bg-transparent flex-1 text-[#F9F6EE] font-mono outline-none placeholder:text-zinc-500/30"
              onFocus={() => { setNameFocused(true); setError(false); }}
              onBlur={() => setNameFocused(false)}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre artístico..."
            />
            <Cursor isAnimating={nameFocused} colorClass={error && !name ? "bg-red-600" : "bg-[#F9F6EE]"} />
          </div>
        </div>

        {/* Campo Email */}
        <div className={`relative group ${isShaking && !email ? '[animation:shake_0.15s_ease-in-out_infinite]'  : ''}`}>
          <label className={`text-[10px] uppercase tracking-widest mb-2 block ml-2 transition-colors
            ${error && !email ? 'text-red-500' : 'text-zinc-500'}`}>
            Correo Electrónico
          </label>
          <div className={`flex items-center border-b-2 transition-colors duration-300 py-3 px-2 
            ${error && !email ? 'border-red-600' : emailFocused ? 'border-purple-600' : 'border-zinc-800'}`}>
            <input
              type="email"
              className="bg-transparent flex-1 text-[#F9F6EE] font-mono outline-none placeholder:text-zinc-500/30"
              onFocus={() => { setEmailFocused(true); setError(false); }}
              onBlur={() => setEmailFocused(false)}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@ejemplo.com"
            />
            <Cursor isAnimating={emailFocused} colorClass={error && !email ? "bg-red-600" : "bg-purple-600"} />
          </div>
        </div>

        {/* Campo Password */}
        <div className={`relative group ${isShaking && !password ? '[animation:shake_0.15s_ease-in-out_infinite]'  : ''}`}>
          <label className={`text-[10px] uppercase tracking-widest mb-2 block ml-2 transition-colors
            ${error && !password ? 'text-red-500' : 'text-zinc-500'}`}>
            Contraseña
          </label>
          <div className={`flex items-center border-b-2 transition-colors duration-300 py-3 px-2 
            ${error && !password ? 'border-red-600' : passwordFocused ? 'border-red-600' : 'border-zinc-800'}`}>
            <input
              type="password"
              className="bg-transparent flex-1 text-[#F9F6EE] font-mono outline-none placeholder:text-zinc-500/30"
              onFocus={() => { setPasswordFocused(true); setError(false); }}
              onBlur={() => setPasswordFocused(false)}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
            />
            <Cursor isAnimating={passwordFocused} colorClass="bg-red-600" />
          </div>
        </div>

        {/* Botón Principal Dinámico */}
        <button 
          onClick={handleRegister}
          className={`w-full font-mono py-4 rounded-full transition-all duration-300 font-bold active:scale-95 uppercase tracking-widest text-sm border-2
            ${error ? 'bg-red-700 border-red-700 text-white animate-shake' : 'bg-[#F9F6EE] border-red-600 text-black hover:bg-red-600 hover:text-white'}`}
        >
          {buttonText}
        </button>

        {/* Alternativa Google para Registro */}
        <div className="space-y-4">
        <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="flex-shrink mx-4 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">O también</span>
            <div className="flex-grow border-t border-zinc-800"></div>
        </div>

        <button className="w-full border border-zinc-800 text-zinc-400 font-mono py-4 rounded-full transition-all duration-300 flex items-center justify-center gap-3 hover:border-purple-600 hover:text-[#F9F6EE] hover:bg-purple-900/10 active:scale-95">
            {/* Icono de Google (puedes usar el de Heroicons o una imagen) */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
            </svg>
            <span className="text-sm uppercase tracking-widest">Unirse con Google</span>
        </button>
        </div>

        <div className="text-center">
          <Link href="/login" className="text-zinc-500 text-xs font-mono uppercase tracking-widest hover:text-red-600 transition-colors">
            ¿Ya eres parte del elenco? Inicia sesión
          </Link>
        </div>
      </div>
    </main>
  );
}