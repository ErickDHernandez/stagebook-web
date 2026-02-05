"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/src/lib/supabase';
import { 
  TicketIcon, 
  CalendarIcon, 
  AdjustmentsHorizontalIcon, 
  ArrowLeftOnRectangleIcon, 
  FolderPlusIcon
} from '@heroicons/react/24/outline';

export default function Sidebar() {
  const [isHovered, setIsHovered] = useState(false);
  const [userData, setUserData] = useState({ username: 'Artista', avatar: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserData({
            username: profile.username || 'Sin nombre',
            avatar: profile.avatar_url || ''
          });
        }
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const menuItems = [
    { name: 'Cartelera', icon: TicketIcon, href: '/dashboard' },
    { name: 'Agenda', icon: CalendarIcon, href: '/calendar' },
    { name: 'Proyectos', icon: FolderPlusIcon, href: '/projects'},
    { name: 'Ajustes', icon: AdjustmentsHorizontalIcon, href: '/settings' },
  ];

  return (
    <aside 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed left-0 top-0 h-screen bg-black border-r border-zinc-900 z-50 transition-all duration-300 ease-in-out overflow-hidden
        ${isHovered ? 'w-64 shadow-[20px_0_50px_rgba(0,0,0,0.5)]' : 'w-20'}`}
    >
      <div className="flex flex-col h-full py-8">
        
        {/*PERFIL*/}
        <Link 
          href="/perfil"
          className="px-5 mb-10 flex items-center gap-4 group/avatar cursor-pointer hover:bg-zinc-900/50 py-2 transition-colors"
        >
          <div className="min-w-[40px] w-10 h-10 rounded-full border-2 border-red-600 overflow-hidden relative bg-zinc-800 shrink-0">
            {userData.avatar ? (
              <img src={userData.avatar} alt="Perfil" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-zinc-500 uppercase">
                {userData.username.substring(0,2)}
              </div>
            )}
          </div>
          <div className={`transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-[10px] font-mono font-bold text-[#F9F6EE] uppercase leading-none truncate w-32">
              @{userData.username}
            </p>
            <p className="text-[8px] text-red-600 font-mono uppercase mt-1 tracking-tighter group-hover/avatar:underline">
              Camerino activo
            </p>
          </div>
        </Link>

        {/* MENÚ DE NAVEGACIÓN*/}
        <nav className="flex-1 flex flex-col gap-4 px-4">
          {menuItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-900 transition-colors text-zinc-500 hover:text-red-600"
            >
              <item.icon className="w-6 h-6 min-w-[24px]" />
              <span className={`transition-opacity duration-300 font-mono text-xs uppercase tracking-widest whitespace-nowrap
                ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                {item.name}
              </span>
            </Link>
          ))}
        </nav>

        {/* LOGOUT */}
        <div className="px-4 border-t border-zinc-900 pt-6">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 p-3 w-full text-zinc-600 hover:text-red-600 transition-colors"
          >
            <ArrowLeftOnRectangleIcon className="w-6 h-6 min-w-[24px]" />
            <span className={`transition-opacity duration-300 font-mono text-[10px] uppercase tracking-widest
                ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              Cerrar Sesión
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}