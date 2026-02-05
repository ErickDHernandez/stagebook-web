"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CloudArrowUpIcon, 
  DocumentTextIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  PaintBrushIcon,
  UserPlusIcon,
  CalendarDaysIcon,
  PlusIcon,
  XMarkIcon, UserIcon, LinkIcon, ArrowPathIcon
} from '@heroicons/react/24/outline';
import { supabase } from '@/src/lib/supabase';
import { createFullProject } from '../projectService';
import StatusPopup from '@/src/components/StatusPop';

export default function NuevoProyectoPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [skipScript, setSkipScript] = useState(false);
  const [showCharModal, setShowCharModal] = useState(false);
  const [newChar, setNewChar] = useState({ nombre: '', descripcion: '', fotoRef: '', videoRef: '',perfilUrl: '', userName:'', fotoPerfilReal: '' });
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    archivo: null as File | null,
    personajes: [] as any[],
    equipo: [] as any[],
    fecha: '',
    color: '#dc2626'
  });
  const [editingIndex, setEditingIndex] = useState<number | null > (null);
  const [buscando, setBuscando] = useState(false);
  const [resultadosBusqueda, setResultadosBusqueda] = useState<any[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [status, setStatus] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
}>({ show: false, message: "", type: "success" });

  // EFECTO: Si se sube un archivo, bloqueamos y desmarcamos el "skip"
  useEffect(() => {
    if (formData.archivo) {
      setSkipScript(false);
    }
  }, [formData.archivo]);

  const steps = [
    { id: 0, name: 'Guion', icon: DocumentTextIcon },
    { id: 1, name: 'Concepto', icon: PaintBrushIcon },
    { id: 2, name: 'Reparto', icon: UserPlusIcon },
    { id: 3, name: 'Producción', icon: CalendarDaysIcon },
  ];

  // Bloqueo lógico del primer paso
  const isLocked = step === 0 && !formData.archivo && !skipScript;

  const handleNext = () => !isLocked && setStep((p) => Math.min(p + 1, 3));
  const handleBack = () => setStep((p) => Math.max(p - 1, 0));

  const buscarArtistas = async (query: string) => {
  setNewChar({ ...newChar, userName: query });
  
  if (query.length < 3) {
    setResultadosBusqueda([]);
    return;
  }

  setBuscando(true);
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, email')
      .ilike('username', `%${query}%`)
      .limit(5);

    if (error) throw error;
    setResultadosBusqueda(data || []);
  } catch (err) {
    console.error("Error buscando artistas:", err);
  } finally {
    setBuscando(false);
  }
};

// Función para abrir el modal en modo edición
const prepararEdicion = (index: number) => {
  setEditingIndex(index);
  setNewChar(formData.personajes[index]);
  setShowCharModal(true);
};

const agregarPersonaje = () => {
  if (!newChar.nombre) return;

  if (editingIndex !== null) {
    // Modo Edición: Reemplazamos el personaje en el índice correspondiente
    const personajesActualizados = [...formData.personajes];
    personajesActualizados[editingIndex] = newChar;
    setFormData({ ...formData, personajes: personajesActualizados });
  } else {
    // Modo Creación: Añadimos uno nuevo
    setFormData({
      ...formData,
      personajes: [...formData.personajes, newChar]
    });
  }

  // Limpiar y cerrar
  setNewChar({ nombre: '', descripcion: '', fotoRef: '', videoRef: '', perfilUrl: '', userName: '', fotoPerfilReal: '' });
  setEditingIndex(null);
  setShowCharModal(false);
};

  // Modifica la función de cerrar el modal para limpiar el índice
  const cerrarModal = () => {
    setShowCharModal(false);
    setEditingIndex(null);
    setNewChar({ nombre: '', descripcion: '', fotoRef: '', videoRef: '', perfilUrl: '', userName: '', fotoPerfilReal: '' });
  };

  const eliminarPersonaje = (index: number) => {
    setFormData({
      ...formData,
      personajes: formData.personajes.filter((_, i) => i !== index)
    });
  };

const lanzarProyecto = async () => {
  setBuscando(true);
  setShowConfirmModal(false); 
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Sesión expirada");

    await createFullProject(formData, user.id);

    // Mostramos éxito antes de irnos
    setStatus({ 
      show: true, 
      message: "PROYECTO LANZADO CON ÉXITO", 
      type: "success" 
    });

    // Esperamos un segundo para que el usuario vea el mensaje y redirigimos
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);

  } catch (err: any) {
    setStatus({ 
      show: true, 
      message: err.message || "ERROR AL LANZAR PROYECTO", 
      type: "error" 
    });
    setBuscando(false);

    // Ocultar el error automáticamente tras 3 segundos
    setTimeout(() => setStatus(prev => ({ ...prev, show: false })), 3000);
  }
};
  return (
    <div className="flex h-screen bg-black text-[#F9F6EE] overflow-hidden">
      
      {/* LADO IZQUIERDO: FORMULARIO */}
      <div className="w-full lg:w-3/5 p-8 md:p-16 flex flex-col overflow-y-auto border-r border-zinc-900">
        
        {/* Navegación de Pasos */}
        <nav className="flex items-center gap-4 mb-12">
          {steps.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                ${step >= s.id ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-zinc-800 text-zinc-500'}`}>
                {step > s.id ? <CheckCircleIcon className="w-5 h-5" /> : s.id + 1}
              </div>
              <span className={`text-[8px] uppercase tracking-widest font-mono hidden sm:inline ${step === s.id ? 'text-white' : 'text-zinc-600'}`}>
                {s.name}
              </span>
              {s.id < 3 && <div className="w-8 h-px bg-zinc-800 mx-2" />}
            </div>
          ))}
        </nav>

        <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
          
          {/* PASO 0: CARGA DE GUION */}
          {step === 0 && (
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold uppercase tracking-tighter">Cargar <span className="text-red-600">Libreto</span></h2>
                <p className="text-zinc-500 text-xs font-mono uppercase italic">El archivo PDF servirá para la lectura digital en el ensayo.</p>
              </div>

              <div className="space-y-6">
                <label className="relative border-2 border-dashed border-zinc-800 rounded-3xl p-16 flex flex-col items-center justify-center gap-4 hover:border-red-600 transition-all cursor-pointer bg-zinc-900/20 group">
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,.doc,.docx" // Restricción visual en el selector de archivos
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      // 1. Validar extensión/tipo de archivo
                      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                      if (!allowedTypes.includes(file.type)) {
                        setStatus({ show: true, message: "SOLO PDF O WORD PERMITIDO", type: "error" });
                        return;
                      }

                      // 2. Validar tamaño (10MB = 10 * 1024 * 1024 bytes)
                      if (file.size > 10 * 1024 * 1024) {
                        setStatus({ show: true, message: "EL ARCHIVO EXCEDE LOS 10MB", type: "error" });
                        return;
                      }

                      setFormData({...formData, archivo: file});
                    }} 
                  />
                  <CloudArrowUpIcon className={`w-12 h-12 ${formData.archivo ? 'text-green-500' : 'text-zinc-600 group-hover:text-red-600'}`} />
                  <div className="text-center">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-widest">
                      {formData.archivo ? formData.archivo.name : 'Subir archivo del guion'}
                    </p>
                  </div>
                  {formData.archivo && (
                    <button 
                      onClick={(e) => { e.preventDefault(); setFormData({...formData, archivo: null}); }}
                      className="text-[8px] text-red-600 uppercase underline mt-2 hover:text-white"
                    >
                      Quitar archivo
                    </button>
                  )}
                </label>

                <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all
                  ${formData.archivo ? 'bg-zinc-900/10 border-zinc-900 opacity-30 cursor-not-allowed' : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'}`}>
                  <input 
                    type="checkbox" 
                    id="skip"
                    disabled={!!formData.archivo}
                    checked={skipScript}
                    onChange={(e) => setSkipScript(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 bg-black text-red-600 focus:ring-red-600 disabled:opacity-0"
                  />
                  <label htmlFor="skip" className={`text-[10px] font-mono uppercase tracking-wider cursor-pointer ${formData.archivo ? 'text-zinc-700' : 'text-zinc-400'}`}>
                    Continuar sin guion {formData.archivo && "(Desactiva el guion para marcar)"}
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* PASO 1: CONCEPTO */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold uppercase tracking-tighter">Define la <span className="text-red-600">Visión</span></h2>
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="NOMBRE DEL PROYECTO"
                  value={formData.titulo}
                  className="w-full bg-transparent border-b border-zinc-800 p-4 text-2xl font-bold uppercase outline-none focus:border-red-600 transition-all"
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                />
                <textarea 
                  placeholder="BREVE DESCRIPCIÓN ARTÍSTICA..."
                  value={formData.descripcion}
                  className="w-full bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl text-sm font-mono h-32 focus:border-red-600 outline-none transition-all"
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                />
              </div>
            </div>
          )}

        {/* PASO 2: REPARTO DINÁMICO */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold uppercase tracking-tighter">Construye el <span className="text-red-600">Reparto</span></h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.personajes.map((p, i) => (
                <div key={i} className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-2xl flex items-center justify-between group">
                  <div className="flex items-center gap-4">

                   <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700 shadow-xl">
                      {p.fotoRef && p.fotoRef.trim() !== "" ? (
                        <img 
                          src={p.fotoRef} 
                          className="w-full h-full object-cover" 
                          alt={`Referencia ${p.nombre}`}
                          onError={(e) => {
                            // Si la URL es inválida, mostramos tu logo de respaldo
                            (e.target as HTMLImageElement).src = '/avatar-placeholder.jpg';
                            (e.target as HTMLImageElement).className = "w-12 h-12 rounded-full object-cover border border-zinc-800";
                          }}
                        />
                      ) : (
                        <img 
                          src="/avatar-placeholder.jpg" 
                          className="w-12 h-12 rounded-full object-cover border border-zinc-800" 
                          alt="Default" 
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#F9F6EE]">{p.nombre}</p>
                      <p className="text-[8px] font-mono text-zinc-500 uppercase">{p.descripcion || 'Sin descripción'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => prepararEdicion(i)} 
                      className="p-2 text-zinc-500 hover:text-white transition-all"
                    >
                      <PaintBrushIcon className="w-4 h-4" />
                    </button>
                  <button 
                    onClick={() => eliminarPersonaje(i)} 
                    className="opacity-0 group-hover:opacity-100 p-2 text-zinc-500 hover:text-red-600 transition-all"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
                </div>
              ))}

              <button 
                onClick={() => setShowCharModal(true)}
                className="flex items-center gap-4 p-5 w-full border-2 border-dashed border-zinc-800 rounded-2xl hover:border-red-600 transition-all text-zinc-500 hover:text-red-600 group"
              >
                <PlusIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-mono uppercase tracking-widest font-bold">Añadir Personaje</span>
              </button>
            </div>
          </div>
        )}

          {/* PASO 3: PRODUCCIÓN */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold uppercase tracking-tighter">Datos de <span className="text-red-600">Producción</span></h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Fecha de Inicio / Estreno</label>
                  <input 
                    type="date" 
                    value={formData.fecha}
                    onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-white outline-none focus:border-red-600 transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Color Representativo</label>
                  <div className="flex gap-4 items-center bg-zinc-900 border border-zinc-800 p-2 rounded-xl">
                    <input 
                      type="color" 
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      className="w-12 h-12 bg-transparent border-none cursor-pointer" 
                    />
                    <span className="text-[10px] font-mono uppercase text-zinc-400">{formData.color}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* NAVEGACIÓN INFERIOR */}
        <div className="mt-12 pt-8 border-t border-zinc-900 flex justify-between items-center">
          <button 
            onClick={handleBack}
            className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${step === 0 ? 'opacity-0 pointer-events-none' : 'text-zinc-500 hover:text-white'}`}
          >
            <ChevronLeftIcon className="w-4 h-4" /> Atrás
          </button>
                        
              <button 
                onClick={() => {
                  if (step === 3) {
                    setShowConfirmModal(true); 
                  } else {
                    handleNext();
                  }
                }}
                disabled={isLocked || buscando}
                className={`flex items-center gap-2 px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all
                  ${isLocked || buscando 
                    ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800' 
                    : 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:scale-105 active:scale-95'}`}
              >
                {buscando ? (
                  <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Subiendo...</>
                ) : step === 3 ? (
                  <>Crear Proyecto <CheckCircleIcon className="w-4 h-4" /></>
                ) : (
                  <>Siguiente <ChevronRightIcon className="w-4 h-4" /></>
                )}
              </button>
        </div>
      </div>

{/* MODAL DE PERSONAJE */}
      {showCharModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-3xl p-8 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold uppercase tracking-tighter">Nuevo <span className="text-red-600">Personaje</span></h3>
              <button onClick={() => setShowCharModal(false)}><XMarkIcon className="w-6 h-6 text-zinc-500" /></button>
            </div>

            <div className="space-y-4">
              <input 
                placeholder="NOMBRE DEL PERSONAJE"
                className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-sm font-bold uppercase focus:border-red-600 outline-none transition-all"
                value={newChar.nombre}
                onChange={(e) => setNewChar({...newChar, nombre: e.target.value.toUpperCase()})}
              />
              <textarea 
                placeholder="NOTAS SOBRE EL PERFIL (EDAD, PERSONALIDAD...)"
                className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-xs font-mono h-24 focus:border-red-600 outline-none"
                value={newChar.descripcion}
                onChange={(e) => setNewChar({...newChar, descripcion: e.target.value})}
              />
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input 
                  placeholder="URL FOTO DE REFERENCIA (GOOGLE)"
                  className="w-full bg-zinc-900 border border-zinc-800 p-4 pl-12 rounded-xl text-[10px] font-mono focus:border-red-600 outline-none"
                  value={newChar.fotoRef}
                  onChange={(e) => setNewChar({...newChar, fotoRef: e.target.value})}
                />
              </div>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input 
                  placeholder="URL VIDEO DE REFERENCIA (YOUTUBE/TIKTOK)"
                  className="w-full bg-zinc-900 border border-zinc-800 p-4 pl-12 rounded-xl text-[10px] font-mono focus:border-red-600 outline-none"
                  value={newChar.videoRef}
                  onChange={(e) => setNewChar({...newChar, videoRef: e.target.value})}
                />
              </div>
              <div className="relative"> 
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  placeholder='INVITAR UN ARTISTA AL PROYECTO'
                  className='w-full bg-zinc-900 border border-zinc-800 p-4 pl-12 rounded-xl text-[10px] font-mono focus:border-red-600 outline-none'
                  value={newChar.userName}
                  onChange={(e) => buscarArtistas(e.target.value)}
                />

                {/* LISTA DE RESULTADOS */}
                {resultadosBusqueda.length > 0 && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden z-50 shadow-2xl">
                    {resultadosBusqueda.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setNewChar({ 
                            ...newChar, 
                            userName: user.username, 
                            perfilUrl: user.id,
                            fotoPerfilReal: user.avatar_url || ''
                          });
                          setResultadosBusqueda([]);
                        }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-zinc-900 transition-colors border-b border-zinc-900 last:border-0"
                      >
                      <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700 flex items-center justify-center">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} className="w-full h-full object-cover" alt={user.username} />
                        ) : (
                          <img src="/avatar-placeholder.jpg" className="w-8 h-8 rounded-full object-cover border border-zinc-800" alt="StageBook Default" /> 
                        )}
                      </div>
                        <span className="text-[10px] font-bold uppercase">@{user.username}</span>
                        {buscando && <ArrowPathIcon className="w-3 h-3 animate-spin ml-auto text-zinc-700" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={agregarPersonaje}
              className="w-full bg-red-600 text-white p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-all"
            >
              Confirmar Personaje
            </button>
          </div>
        </div>
      )}
{/* LADO DERECHO: VISTA PREVIA / RESUMEN */}
<div className="hidden lg:flex lg:w-2/5 bg-[#050505] p-12 flex-col justify-between overflow-y-auto">
  <div className="space-y-12">
    <div className="flex items-center gap-3">
      <span className="text-[8px] font-mono uppercase tracking-[0.5em] text-zinc-600">Resumen del Proyecto</span>
      <div className="flex-1 h-px bg-zinc-900" />
    </div>

    <div className="space-y-6 animate-in fade-in duration-700">
      <div 
        className="w-16 h-1 rounded-full transition-all duration-500" 
        style={{ backgroundColor: formData.color }}
      />
      <h3 className="text-4xl font-bold uppercase tracking-tighter leading-none break-words text-[#F9F6EE]">
        {formData.titulo || 'Sin Título'}
      </h3>
      <p className="text-sm text-zinc-500 font-mono italic leading-relaxed">
        {formData.descripcion || 'Esperando visión del director...'}
      </p>

{/* LISTA DINÁMICA DE REPARTO EN EL RESUMEN */}
<div className="pt-8 space-y-4">
  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
    <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Reparto Detectado</p>
    <span className="text-[10px] font-bold text-red-600">{formData.personajes.length}</span>
  </div>
  
  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
    {formData.personajes.length > 0 ? (
      formData.personajes.map((p, i) => (
        <div key={i} className="flex items-center gap-3 animate-in slide-in-from-right-2 duration-300" style={{ transitionDelay: `${i * 50}ms` }}>

          {/* CONTENEDOR DEL AVATAR */}
          <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex-shrink-0 overflow-hidden flex items-center justify-center">
            {p.perfilUrl && p.fotoPerfilReal ? ( 
              /* 1. Prioridad: Foto del artista de StageBook */
              <img src={p.fotoPerfilReal} alt={p.userName} className="w-full h-full object-cover" />
            )  : (
              /* 3. Respaldo: Tu logo personalizado */
              <img src="/avatar-placeholder.jpg" className="w-8 h-8 object-cover" alt="Default" />
            )}
          </div>

          <div className="flex flex-col">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#F9F6EE] leading-tight">
              {p.nombre}
            </p>
            {/* PRIORIDAD: Si hay userName, mostramos la invitación */}
            {p.userName ? (
              <p className="text-[8px] font-mono text-red-600 uppercase mt-0.5">
                Invitado: @{p.userName}
              </p>
            ) : (
              <p className="text-[8px] font-mono text-zinc-500 uppercase mt-0.5">
                {p.descripcion || 'Sin descripción'}
              </p>
            )}
          </div>
        </div>
      ))
    ) : (
      <p className="text-[9px] font-mono text-zinc-800 uppercase italic">No hay personajes asignados aún.</p>
    )}
  </div>
</div>

      {/* Otros detalles rápidos */}
      <div className="grid grid-cols-2 gap-4 pt-4">
         <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-2xl">
            <p className="text-[8px] font-mono text-zinc-600 uppercase mb-1">Guion</p>
            <p className="text-[10px] font-bold uppercase truncate text-zinc-400">
              {formData.archivo ? formData.archivo.name : (skipScript ? 'Manual' : 'Pendiente')}
            </p>
         </div>
         <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-2xl">
            <p className="text-[8px] font-mono text-zinc-600 uppercase mb-1">Fecha</p>
            <p className="text-[10px] font-bold uppercase text-zinc-400">{formData.fecha || 'TBD'}</p>
         </div>
      </div>
    </div>
  </div>

  {/* Footer del Resumen */}
  <div className="mt-8 bg-zinc-900/20 p-6 rounded-3xl border border-zinc-800 flex items-center gap-4">
    <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-bold text-xs">DIR</div>
    <div>
      <p className="text-[8px] font-mono text-zinc-500 uppercase">Estado</p>
      <p className="text-[10px] font-bold uppercase tracking-widest text-green-500 italic">Configurando producción...</p>
    </div>
  </div>
</div>
<StatusPopup 
  show={status.show} 
  message={status.message} 
  type={status.type} 
  onClose={() => setStatus(prev => ({ ...prev, show: false }))}
/>
{showConfirmModal && (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
    <div className="bg-zinc-950 border border-zinc-800 w-full max-w-sm rounded-3xl p-8 space-y-6 text-center shadow-2xl">
      <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto">
        <CloudArrowUpIcon className="w-8 h-8 text-red-600" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-bold uppercase tracking-tighter">¿Lanzar Proyecto?</h3>
        <p className="text-zinc-500 text-[10px] font-mono uppercase">
          Se creará la producción "{formData.titulo}" y se enviarán las invitaciones a los artistas.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <button 
          onClick={() => {
            setShowConfirmModal(false);
            lanzarProyecto(); // Llama a tu función de Supabase
          }}
          className="w-full bg-red-600 text-white p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-all"
        >
          Sí, confirmar estreno
        </button>
        <button 
          onClick={() => setShowConfirmModal(false)}
          className="w-full bg-transparent text-zinc-500 p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:text-white transition-all"
        >
          Revisar detalles
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}