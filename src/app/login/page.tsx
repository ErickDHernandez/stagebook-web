"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Cursor from '@/src/components/Cursor'; 
import Typewriter from '@/src/components/Typewriter';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [buttonText, setButtonText] = useState("ENTRAR A ESCENA");

  const handleLogin = () => {
    if (!email || !password) {
      setError(true);
      setIsShaking(true);
      setButtonText("ERROR EN EL LIBRETO");
      
      // Reset de animación y texto
      setTimeout(() => {
        setIsShaking(false);
        setButtonText("ENTRAR A ESCENA");
      }, 200);
      return;
    }
    console.log("Entrando a escena...");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      
      {/* Sección Logo/Header */}
      <div className="flex flex-col items-center mb-12">
        <div className="relative w-20 h-20 mb-4">
          <Image src="/logo.png" alt="Logo" fill className="object-contain" priority />
        </div>
        <h1 className="text-4xl font-mono font-bold tracking-tighter ">
          STAGE<span className="text-red-600">BOOK</span>
        </h1>
        <div className="h-6">
          <Typewriter text="Bienvenido, artista" speed={80} className="text-zinc-500 text-sm italic" />
        </div>
      </div>

      {/* Formulario */}
      <div className="w-full max-w-md space-y-6">
        
        {/* Campo de Email: Cursor morado -> rojo si hay error */}
        <div className={`relative group mt-8 ${isShaking ? '[animation:shake_0.15s_ease-in-out_infinite]' : ''}`}>
          <label className={`text-[10px] uppercase tracking-widest mb-2 block ml-2 
            ${error && !email ? 'text-red-500' : 'text-zinc-500'}`}>
            Identificación (Email)
          </label>
          
          <div className={`flex items-center border-b-2 transition-colors duration-300 py-3 px-2 
            ${error && !email ? 'border-red-600' : emailFocused ? 'border-purple-600' : 'border-zinc-800'}`}>
            
            <input
              type="email"
              value={email}
              className="bg-transparent flex-1 font-mono outline-none placeholder:text-zinc-700"
              onFocus={() => { setEmailFocused(true); setError(false); }}
              onBlur={() => setEmailFocused(false)}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Escribe tu correo..."
            />
            
            <Cursor 
              isAnimating={emailFocused} 
              colorClass={error && !email ? "bg-red-600" : "bg-purple-600"} 
            />
          </div>
          
          {error && !email && (
            <span className="text-[10px] text-red-500 mt-1 ml-2 font-mono italic animate-in fade-in duration-500">
              Este campo es obligatorio para la función
            </span>
          )}
        </div>

        {/* Campo de Password: Cursor Morado -> Rojo si hay error */}
        <div className={`relative group mt-8 ${isShaking ? '[animation:shake_0.15s_ease-in-out_infinite]' : ''}`}>
          <label className={`text-[10px] uppercase tracking-widest mb-2 block ml-2
            ${error && !password ? 'text-red-500' : 'text-zinc-500'}`}>
            Clave de acceso
          </label>
          <div className={`flex items-center border-b-2 transition-colors duration-300 py-3 px-2 
            ${error && !password ? 'border-red-600' : passwordFocused ? 'border-purple-600' : 'border-zinc-800'}`}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              placeholder="••••••••"
              className="bg-transparent flex-1 font-mono outline-none placeholder:text-zinc-700 tracking-widest"
              onFocus={() => { setPasswordFocused(true); setError(false); }}
              onBlur={() => setPasswordFocused(false)}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-zinc-500 hover:text-purple-400 transition-colors mx-2"
            >
              {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>

            <Cursor 
              isAnimating={passwordFocused} 
              colorClass={error && !password ? "bg-red-600" : "bg-purple-600"} 
            />
          </div>
          {error && !password && (
            <span className="text-[10px] text-red-500 mt-1 ml-2 font-mono italic animate-in fade-in duration-500">
              La clave es necesaria para abrir el telón
            </span>
          )}
        </div>

        {/* Botón de Entrada */}
        <button 
          onClick={handleLogin}
          className={`w-full font-mono py-4 rounded-full transition-all duration-300 shadow-lg active:scale-95 uppercase tracking-widest text-sm
            ${error ? 'bg-red-700 shadow-red-900/20' : 'bg-[#7C3AED] shadow-purple-900/20'} 
            text-[#F9F6EE] font-bold mt-4`}
        >
          {buttonText}
        </button>

        {/* Alternativa Google */}
        <button className="w-full border border-zinc-800 text-zinc-400 font-mono py-4 rounded-full hover:bg-purple-500 hover:text-white transition-colors flex items-center justify-center gap-3">
          <span>Continuar con Google</span>
        </button>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">
          ¿No tienes cuenta? <Link href="/register" className="text-red-600 hover:underline">Regístrate</Link>
        </p>
      </div>
    </main>
  );
}