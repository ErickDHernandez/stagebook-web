"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/src/lib/supabase';
import { 
  BuildingOfficeIcon, ArrowLeftIcon, ArrowPathIcon,
  MagnifyingGlassIcon, XMarkIcon, PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { InvitadoTemporal } from '@/src/interfaces';
import ErrorModal from '@/src/components/ErrorModal';

export default function NuevaCompaniaPage() {
  const router = useRouter();
  
  // 1. Estados de la Compañía y UI
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [companyImage, setCompanyImage] = useState<File | null>(null);
  const [companyImagePreview, setCompanyImagePreview] = useState<string | null>(null);

  // 2. Estados del Buscador de Miembros
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [role, setRole] = useState<'Actor' | 'Técnico' | 'Asistente de Dirección'>('Actor');

  // 3. Lista local (Antes de enviar a Supabase)
  const [invitacionesPendientes, setInvitacionesPendientes] = useState<InvitadoTemporal[]>([]);




  // 4. Manejo de errores
  const [errorModal, setErrorModal] = useState<{
    title: string;
    message: string;
  } | null>(null);


  // Función para buscar usuarios en la DB
  const buscarUsuarios = async (val: string) => {
    setSearch(val);
    if (val.length < 3) return setResults([]);
    const { data } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, email')
      .ilike('username', `%${val}%`)
      .limit(5);
    setResults(data || []);
  };

  // Agregar a la lista de "pre-producción"
  const agregarAListaTemporal = () => {
    if (!selectedUser) return;
    if (!selectedUser.email) return alert("El usuario no tiene email público.");
    
    const yaInvitado = invitacionesPendientes.some(
      inv => inv.email === selectedUser.email
    );

    if (yaInvitado) {
      alert("Este usuario ya está en la lista");
      return;
    }

    const nuevo = {
      id: selectedUser.id,
      username: selectedUser.username,
      email: selectedUser.email,
      role: role,
      avatar_url: selectedUser.avatar_url
    };

    setInvitacionesPendientes([...invitacionesPendientes, nuevo]);
    setSelectedUser(null);
    setSearch('');
    setResults([]);
  };
async function uploadCompanyImage(
  file: File,
  companyId: string
): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const filePath = `${companyId}/logo.${fileExt}`;

  const { error } = await supabase.storage
    .from('company_images')
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (error) {
    console.error('Error subiendo imagen:', error);
    return null;
  }

  const { data } = supabase.storage
    .from('company_images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

async function fundarYReclutar() {
  const nombreMayusculas = nombre.trim().toUpperCase();
  setLoading(true);

  if (!nombreMayusculas || nombreMayusculas.length < 3) {
    setErrorModal({
      title: 'Nombre inválido',
      message: 'El nombre de la compañía es obligatorio.'
    });
    setLoading(false);
    return;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Sesión no activa");

    // 1. Crear la compañía
    const { data: company, error: cError } = await supabase
      .from('companies')
      .insert([{ name: nombreMayusculas, founder_id: user.id }])
      .select()
      .single();

      // 2 Subir imagen si existe
let imageUrl: string | null = null;

if (companyImage) {
  imageUrl = await uploadCompanyImage(companyImage, company.id);

  if (imageUrl) {
    await supabase
      .from('companies')
      .update({ image_url: imageUrl })
      .eq('id', company.id);
  }
}


      if (cError) {
        throw new Error(JSON.stringify({
          code: cError.code,
          message: cError.message,
          details: cError.details
        }));
      }


    // 2. Director
    const { error: mError } = await supabase
      .from('company_members')
      .insert([{
        company_id: company.id,
        profile_id: user.id,
        role: 'Director',
        is_active: true,
        joined_at: new Date().toISOString()
      }]);

    if (mError) throw mError;

    // 3. Invitaciones
    for (const inv of invitacionesPendientes) {
      const { data: invite, error: iError } = await supabase
        .from('company_invitations')
        .insert([{
          company_id: company.id,
          inviter_id: user.id,
          email: inv.email,
          role: inv.role
        }])
        .select()
        .single();

      if (iError) throw iError;

      const inviteLink = `${window.location.origin}/invitacion/confirmar?token=${invite.token}`;
      console.log('Link de invitación:', inviteLink);
    }

    router.push('/dashboard');

} catch (err: any) {
  let parsedError: any = null;

  try {
    parsedError = JSON.parse(err.message);
  } catch {
    parsedError = { message: err.message };
  }

  console.error('ERROR REAL:', parsedError);

  if (parsedError.code === '23505') {
    setErrorModal({
      title: 'Compañía duplicada',
      message: 'Ya fundaste una compañía con ese nombre. Prueba otro nombre artístico.'
    });
  } else {
    setErrorModal({
      title: 'Error inesperado',
      message: parsedError.message || 'Algo salió mal.'
    });
  }
}

}


  return (
    <div className="min-h-screen bg-black text-[#F9F6EE] p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-10">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all uppercase text-[10px] font-mono tracking-widest">
          <ArrowLeftIcon className="w-4 h-4" /> Volver
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* COLUMNA IZQUIERDA: CONFIGURACIÓN */}
          <div className="space-y-8">
            <section className="space-y-4">
              <h1 className="text-4xl font-bold uppercase tracking-tighter italic">Fundar <span className="text-red-600">Compañía</span></h1>
              <input 
                type="text"
                placeholder="NOMBRE DE LA COMPAÑÍA..."
                className="w-full bg-transparent border-b border-zinc-800 py-4 text-2xl font-bold uppercase outline-none focus:border-red-600 transition-all"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
              <section className="space-y-2">
  <p className="text-[10px] font-mono uppercase text-zinc-500">
    Imagen de la compañía
  </p>

  <input
    type="file"
    accept="image/*"
    onChange={(e) => {
      if (e.target.files?.[0]) {
        setCompanyImage(e.target.files[0]);
      }
    }}
    className="block w-full text-xs text-zinc-400
               file:mr-4 file:py-2 file:px-4
               file:rounded-full file:border-0
               file:text-xs file:font-bold
               file:bg-zinc-900 file:text-white
               hover:file:bg-red-600 transition-all"
  />

  {companyImage && (
    <p className="text-[9px] text-zinc-500 italic">
      {companyImage.name}
    </p>
  )}
</section>

            </section>

            <section className="bg-zinc-900/20 p-6 rounded-3xl border border-zinc-900 space-y-4">
              <p className="text-[10px] font-mono uppercase text-zinc-500">Buscar Artistas</p>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input 
                  type="text"
                  placeholder="USERNAME..."
                  className="w-full bg-black border border-zinc-800 p-4 pl-12 rounded-xl text-xs outline-none focus:border-red-600 transition-all"
                  value={search}
                  onChange={(e) => buscarUsuarios(e.target.value)}
                />
                {results.length > 0 && !selectedUser && (
                  <div className="absolute top-full left-0 w-full bg-zinc-950 border border-zinc-800 mt-2 rounded-xl overflow-hidden z-50">
                   {results.map(u => (
                      <button
                        key={u.id}
                        onClick={() => setSelectedUser(u)}
                        className="w-full p-4 text-left hover:bg-zinc-900 flex items-center gap-3 border-b border-zinc-900 last:border-0"
                      >
                        <img
                          src={u.avatar_url || '/avatar-placeholder.jpg'}
                          alt={u.username}
                          className="w-8 h-8 rounded-full object-cover border border-zinc-800"
                        />
                        <span className="text-xs font-bold uppercase">@{u.username}</span>
                      </button>
                    ))}

                  </div>
                )}
              </div>

              {selectedUser && (
                <div className="p-4 bg-zinc-900 rounded-xl space-y-4 animate-in fade-in">
                  <p className="text-[10px] font-bold uppercase">Asignar Rol a @{selectedUser.username}</p>
                  <select 
                    className="w-full bg-black border border-zinc-800 p-3 rounded-lg text-xs outline-none"
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                  >
                    <option value="Actor">Actor</option>
                    <option value="Técnico">Técnico</option>
                    <option value="Asistente de Dirección">Asistente de Dirección</option>
                  </select>
                  <button onClick={agregarAListaTemporal} className="w-full py-3 bg-white text-black text-[10px] font-bold uppercase rounded-lg hover:bg-red-600 hover:text-white transition-all">
                    Añadir al Ensamble
                  </button>
                </div>
              )}
            </section>
          </div>

          {/* COLUMNA DERECHA: REVISIÓN Y ENVÍO */}
          <div className="flex flex-col h-full bg-zinc-900/10 border border-zinc-900 rounded-[2.5rem] p-8">
            <div className="flex-1 space-y-6">
              <h3 className="text-[10px] font-mono uppercase text-zinc-500 tracking-[0.3em]">Elenco Seleccionado</h3>
              <div className="space-y-3">
                {invitacionesPendientes.map((inv, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-zinc-950 rounded-2xl border border-zinc-900">
                    
                    <div className="flex items-center gap-3">
                      <img
                        src={inv.avatar_url || '/avatar-placeholder.jpg'}
                        alt={inv.username}
                        className="w-10 h-10 rounded-full object-cover border border-zinc-800"
                      />
                      <div>
                        <p className="text-[10px] font-bold uppercase">@{inv.username}</p>
                        <p className="text-[8px] font-mono text-zinc-600 uppercase italic">
                          {inv.role}
                        </p>
                      </div>
                    </div>

                    <button onClick={() => setInvitacionesPendientes(prev => prev.filter((_, i) => i !== idx))}>
                      <XMarkIcon className="w-4 h-4 text-zinc-800 hover:text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={fundarYReclutar}
              disabled={loading}
              className="mt-8 w-full py-6 bg-red-600 text-white text-xs font-bold uppercase rounded-3xl hover:bg-red-700 transition-all flex items-center justify-center gap-4 shadow-2xl disabled:opacity-30"
            >
              {loading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <PaperAirplaneIcon className="w-5 h-5" />}
              <span>{loading ? 'Fundando...' : `Fundar ${nombre || 'Compañía'}`}</span>
            </button>
          </div>
        </div>
          {errorModal && (
            <ErrorModal
              title={errorModal.title}
              message={errorModal.message}
              onClose={() => setErrorModal(null)}
            />
          )}
      </div>
    </div>
    
  );
}