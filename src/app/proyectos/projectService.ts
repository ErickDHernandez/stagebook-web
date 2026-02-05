import { supabase } from '@/src/lib/supabase';
import { PersonajeProyecto } from '@/src/interfaces';

// Función para subir el PDF del guion al Storage
export const uploadProjectScript = async (file: File, projectId: string) => {
    if (file.size > 10 * 1024 * 1024) {
    throw new Error("El archivo es demasiado grande (máximo 10MB)");
  }
  const filePath = `${projectId}/script_${Date.now()}.pdf`;
  const { error } = await supabase.storage
    .from('project_scripts')
    .upload(filePath, file);

  if (error) throw error;

  const { data } = supabase.storage.from('project_scripts').getPublicUrl(filePath);
  return data.publicUrl;
};

// Función principal para crear todo el proyecto
export const createFullProject = async (formData: any, userId: string) => {
  // 1. Insertar el proyecto base
  const { data: project, error: pError } = await supabase
    .from('projects')
    .insert([{
      title: formData.titulo.toUpperCase(),
      description: formData.descripcion,
      founder_id: userId,
      start_date: formData.fecha,
      theme_color: formData.color
    }])
    .select().single();

  if (pError) throw pError;

  // 2. Manejar el archivo del guion si existe
  if (formData.archivo) {
    const scriptUrl = await uploadProjectScript(formData.archivo, project.id);
    await supabase.from('projects').update({ script_url: scriptUrl }).eq('id', project.id);
  }

  // 3. Insertar los personajes e invitaciones
  if (formData.personajes.length > 0) {
    const personajesParaInsertar = formData.personajes.map((p: PersonajeProyecto) => ({
      project_id: project.id,
      character_name: p.nombre,
      description: p.descripcion,
      image_ref_url: p.fotoRef,
      video_ref_url: p.videoRef,
      assigned_profile_id: p.perfilUrl || null
    }));

    const { error: charError } = await supabase
      .from('project_characters')
      .insert(personajesParaInsertar);

    if (charError) throw charError;
  }

  return project;
};