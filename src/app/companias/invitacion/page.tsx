"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/src/lib/supabase';
import { CheckBadgeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function ConfirmarInvitacionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'validando' | 'exito' | 'error'>('validando');
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) procesarAceptacion();
  }, [token]);

async function procesarAceptacion() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Debes iniciar sesión para aceptar");

    // 1. Obtener invitación válida
    const { data: invite, error: fetchError } = await supabase
      .from('company_invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pendiente')
      .single();

    if (fetchError || !invite) throw new Error("Invitación inválida");

    // 2. Verificar si ya pertenece a la compañía
    const { data: existingMember } = await supabase
      .from('company_members')
      .select('id')
      .eq('company_id', invite.company_id)
      .eq('profile_id', user.id)
      .maybeSingle();

    if (!existingMember) {
      const { error: joinError } = await supabase
        .from('company_members')
        .insert({
          company_id: invite.company_id,
          profile_id: user.id,
          role: invite.role,
          is_active: true,
          joined_at: new Date().toISOString()
        });

      // Si falla por duplicado, no romper flujo
      if (joinError && joinError.code !== '23505') {
        throw joinError;
      }
    }

    // 3. Marcar invitación como aceptada (INVALIDA TOKEN)
    await supabase
      .from('company_invitations')
      .update({
        status: 'aceptada',
        accepted_at: new Date().toISOString()
      })
      .eq('token', token);

    setStatus('exito');
    setTimeout(() => router.push('/dashboard'), 2500);

  } catch (err) {
    console.error(err);
    setStatus('error');
  }
}

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 text-[#F9F6EE] font-mono">
      <div className="max-w-md w-full text-center space-y-8">
        <h1 className="text-4xl font-bold uppercase italic tracking-tighter">Stage<span className="text-red-600">Book</span></h1>
        
        {status === 'validando' && (
          <div className="flex flex-col items-center gap-4 animate-pulse">
            <ArrowPathIcon className="w-12 h-12 text-zinc-700 animate-spin" />
            <p className="text-[10px] uppercase tracking-widest">Validando credenciales de acceso...</p>
          </div>
        )}

        {status === 'exito' && (
          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
            <CheckBadgeIcon className="w-16 h-16 text-green-500 mx-auto" />
            <p className="text-sm uppercase font-bold">¡Bienvenido a bordo!</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Tu historial artístico ha sido actualizado. Redirigiendo al camerino...</p>
          </div>
        )}

        {status === 'error' && (
          <p className="text-red-600 text-[10px] uppercase">Error: El token de acceso es inválido o ya ha sido utilizado.</p>
        )}
      </div>
    </div>
  );
}