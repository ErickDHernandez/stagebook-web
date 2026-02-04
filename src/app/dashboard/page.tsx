"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import Link from 'next/link';
import Typewriter from '@/src/components/Typewriter';
import { 
  CalendarIcon, 
  BeakerIcon, 
  PlusIcon, 
  UserGroupIcon, 
  TicketIcon,
  BuildingOfficeIcon,
  BellIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const [showNotifications, setShowNotifications] = useState(false); 
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myCompanies, setMyCompanies] = useState<any[]>([]);

  useEffect(() => {
    fetchInvitations();
    fetchMyCompanies();
  }, []);

async function fetchMyCompanies() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase
    .from('company_members')
    .select(`
      role,
      companies ( id, name )
    `)
    .eq('profile_id', user.id)
    .eq('is_active', true);

  if (!error) setMyCompanies(data || []);
}

  async function fetchInvitations() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('company_invitations')
        .select(`
          id,
          role,
          token,
          company_id,
          companies ( id, name )
        `)
        .eq('email', user.email)
        .eq('status', 'pendiente');

      if (!error) setInvitations(data || []);
    } catch (err) {
      console.error("Error al cargar notificaciones:", err);
    } finally {
      setLoading(false);
    }
  }

 async function aceptarInvitacion(invite: any) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Unirse a la compañía (Insertar miembro)
    const { error: joinError } = await supabase
      .from('company_members')
      .insert([{
        company_id: invite.companies.id, 
        profile_id: user.id,
        role: invite.role,
        is_active: true,
        joined_at: new Date().toISOString()
      }]);

    if (joinError) throw joinError;

    // 2. Marcar invitación como aceptada
    const { error: updateError } = await supabase
      .from('company_invitations')
      .update({ status: 'aceptada' })
      .eq('id', invite.id);

    if (updateError) throw updateError;

    // 3. Actualizar UI y Recargar compañías
    setInvitations(prev => prev.filter(i => i.id !== invite.id));
    fetchMyCompanies(); // Esto hará que aparezca debajo de Producciones Totales
    
    alert("¡Te has unido a la compañía!");
  } catch (err) {
    console.error("Error al aceptar:", err);
    alert("No se pudo procesar la aceptación.");
  }
}

  const activeProjects = [
    { id: '1', title: 'Hamlet: El Retorno', characters: 12, status: 'Ensayo' },
    { id: '2', title: 'Bodas de Sangre', characters: 8, status: 'Lectura' },
    { id: '3', title: 'Esperando a Godot', characters: 4, status: 'Montaje' },
  ];

  const upcomingEvents = [
    { id: '101', type: 'Ensayo General', project: 'Hamlet', time: '18:00 hrs', date: 'Hoy' },
    { id: '102', type: 'Prueba de Vestuario', project: 'Bodas de Sangre', time: '10:00 hrs', date: 'Mañana' },
  ];

  return (
    <main className="min-h-screen bg-black text-[#F9F6EE] flex flex-col md:flex-row relative">
      <div className="flex-1 p-8 md:p-16 max-w-7xl mx-auto w-full">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16 relative">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-mono uppercase tracking-[0.5em] text-zinc-500 italic">Temporada 2026</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tighter uppercase leading-none">
              Tu <span className="text-red-600">Cartelera</span>
            </h1>
            <Typewriter text="Gestiona tus obras y repartos desde el camerino." speed={40} className="text-zinc-500 text-xs font-mono mt-2" />
            
            <div className="flex flex-wrap gap-3">
              <Link href="/proyectos/nuevo" className="bg-[#F9F6EE] text-black px-5 py-3 rounded-full hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 group shadow-xl">
                <PlusIcon className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Nuevo Proyecto</span>
              </Link>
              <Link href="/companias/nueva" className="bg-zinc-900 text-[#F9F6EE] px-5 py-3 rounded-full hover:bg-zinc-800 transition-all flex items-center gap-2 group border border-zinc-800 shadow-xl">
                <BuildingOfficeIcon className="w-4 h-4 text-red-600" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Crear Compañía</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-6 self-end md:self-start">
            {/* COMPONENTE DE NOTIFICACIONES */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-full text-zinc-400 hover:text-red-600 hover:border-red-600 transition-all relative group"
              >
                <BellIcon className="w-6 h-6" />
                {invitations.length > 0 && (
                  <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-black animate-bounce"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-4 w-80 bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl z-[100] animate-in fade-in slide-in-from-top-2">
                  <div className="p-6 border-b border-zinc-900 flex justify-between items-center">
                    <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-white">Notificaciones</h3>
                    <button onClick={() => setShowNotifications(false)}>
                      <XMarkIcon className="w-4 h-4 text-zinc-500 hover:text-white transition-colors" />
                    </button>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto p-2">
                    {invitations.length > 0 ? (
                      invitations.map((inv) => {
                        const infoCompania = inv.companies || inv.company;
                        const nombreMostrar = infoCompania?.name || "Compañía en proceso";

                        return (
                          <div key={inv.id} className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-2xl mb-2 space-y-3 animate-in fade-in duration-300">
                            <p className="text-[11px] text-zinc-300 leading-relaxed uppercase">
                              Invitación: <span className="text-white font-bold">{nombreMostrar}</span> como <span className="text-red-600 font-bold">{inv.role}</span>
                            </p>
                            
                            <div className="flex gap-2">
                              <button 
                                onClick={() => aceptarInvitacion(inv)}
                                className="flex-1 py-2 bg-white text-black text-[9px] font-bold uppercase rounded-lg hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                              >
                                <CheckIcon className="w-3 h-3" /> Aceptar
                              </button>
                              <button 
                                onClick={() => setInvitations(prev => prev.filter(i => i.id !== inv.id))}
                                className="px-3 py-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 transition-all"
                              >
                                <XMarkIcon className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-10 text-center text-zinc-600 text-[10px] font-mono uppercase italic tracking-widest">
                        Sin avisos pendientes
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* SECCIÓN: MIS SELLOS / COMPAÑÍAS ACTIVAS */}
<div className="mt-8 space-y-4">
  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
    <h5 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em] font-bold flex items-center gap-2">
      <BuildingOfficeIcon className="w-3 h-3 text-red-600" /> Mis Compañías
    </h5>
    <span className="text-[8px] font-mono text-zinc-700 uppercase">Activas: {myCompanies.length}</span>
  </div>

  <div className="grid grid-cols-1 gap-2">
    {myCompanies.length > 0 ? (
      myCompanies.map((item, idx) => (
        <div 
          key={idx} 
          className="group relative overflow-hidden bg-zinc-950 border border-zinc-900 p-4 rounded-xl hover:border-red-600/40 transition-all duration-500"
        >
          {/* Efecto de fondo sutil */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 blur-[40px] rounded-full -mr-10 -mt-10 group-hover:bg-red-600/10 transition-all"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:scale-110 transition-transform">
                <span className="text-sm font-bold text-red-600">
                  {item.companies?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-tight text-[#F9F6EE]">
                  {item.companies?.name}
                </h4>
                <p className="text-[9px] font-mono text-zinc-500 uppercase mt-0.5 italic">
                  {item.role}
                </p>
              </div>
            </div>
            
            {/* Distintivo Visual Único (Status Dot con Glow) */}
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[7px] font-mono text-zinc-600 uppercase tracking-widest">Online</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                </span>
              </div>
            </div>
          </div>
        </div>
      ))
    ) : (
          <div className="py-6 border-2 border-dashed border-zinc-900 rounded-2xl flex flex-col items-center justify-center">
            <p className="text-[9px] font-mono text-zinc-700 uppercase italic">Sin membresías activas</p>
          </div>
        )}
      </div>
    </div>
          </div>
        </header>

        {/* GRID DE CONTENIDO PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* COLUMNA IZQUIERDA: PROYECTOS */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-600 border-b border-zinc-900 pb-4 flex items-center gap-2 italic">
              <BeakerIcon className="w-4 h-4" /> Producciones Activas
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeProjects.map((project) => (
                <div key={project.id} className="group relative bg-zinc-900/20 border border-zinc-800 p-8 rounded-3xl hover:border-red-600 transition-all duration-500 overflow-hidden shadow-lg">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                    <TicketIcon className="w-12 h-12 -rotate-12 text-red-600" />
                  </div>
                  <p className="text-[10px] font-mono text-red-600 mb-2 font-bold uppercase">{project.status}</p>
                  <h3 className="text-2xl font-bold uppercase tracking-tight mb-4">{project.title}</h3>
                  <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-mono">
                    <span className="flex items-center gap-1"><UserGroupIcon className="w-3 h-3" /> {project.characters} Actores</span>
                    <span className="px-2 py-1 bg-zinc-800 rounded text-zinc-400 hover:text-[#F9F6EE] transition-colors cursor-pointer">Ver Libreto</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMNA DERECHA: AGENDA Y STATS */}
          <div className="space-y-8">
            <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-600 border-b border-zinc-900 pb-4 flex items-center gap-2 italic">
              <CalendarIcon className="w-4 h-4" /> Próximas Citas
            </h2>
    
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="bg-zinc-900/40 border-l-2 border-red-600 p-5 rounded-r-2xl space-y-2 group hover:bg-zinc-900/60 transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{event.date}</span>
                    <span className="text-[10px] font-mono text-red-600 font-bold">{event.time}</span>
                  </div>
                  <h4 className="font-bold text-sm uppercase">{event.type}</h4>
                  <p className="text-zinc-500 text-[10px] font-mono italic">Obra: {event.project}</p>
                </div>
              ))}
            </div>

            {/* ESTADÍSTICA DE RENDIMIENTO */}
            <div className="bg-gradient-to-br from-red-900/20 to-black border border-red-900/30 p-8 rounded-3xl mt-8 shadow-2xl">
              <h5 className="text-[10px] font-mono text-red-500 uppercase mb-4 tracking-widest font-bold">Eficiencia de Ensayos</h5>
              <p className="text-4xl font-bold tracking-tighter italic">84%</p>
              <div className="w-full bg-zinc-800 h-1 mt-4 rounded-full overflow-hidden">
                <div className="bg-red-600 h-full w-[84%] animate-in slide-in-from-left duration-1000"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}