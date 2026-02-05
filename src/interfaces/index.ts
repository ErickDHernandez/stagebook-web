// src/interfaces/index.ts
//Este archivo contiene el MODELO DE DOMINIO. define la estructura de los objetos que exinten en tu base de datos o logica de negocio. Al consultar un proyecto o ensayo TypeScript sabra que campos tiene
// 1. TIPOS DE APOYO (UNIONES DE LITERALES)

export type ProjectStatus = 'Activo' | 'Finalizado' | 'Borrador' | 'En Pausa';
export type ProjectColor = 'blue' | 'red' | 'green' | 'purple' | 'amber' | 'pink';
export type ReferenceType = 'youtube' | 'web';

// 2. INTERFACES SECUNDARIAS
export interface Reference {
    type: ReferenceType;
    url: string;
}

export interface CharacterDetail {
    name: string;
    references: Reference[]; 
    traits: string[];  
}

export interface DialogueLine {
    characterName: string; 
    line: string;       
}

// 3. INTERFAZ PRINCIPAL
export interface ProjectData {
    id: string;
    title: string;
    description?: string; 
    scriptUrl: string;
    role: string; 
    characters: CharacterDetail[]; 
    createBy: string;
    createdAt: string | Date;
    releaseStartDate?: string | Date;
    releaseEndDate?: string | Date;
    selectedDays?: number[]; 
    status: ProjectStatus; 
    color: ProjectColor; 
}

// 4. INTERFACES DE SEGUIMIENTO Y PRODUCCIÓN

export interface RehearsalProgress {
    rehearsalId: string; 
    projectId: string;    
    lineIndex: number; 
    accuracy: number; 
    totalLines: number; 
    timestamp: string | Date; 
}

export interface ProductionNeed {
    id: string;
    projectId: string;
    projectTitle: string;
    text: string;
    createdAt: string | Date;
    isUrgent: boolean; 
}
//invitaciones y compañias
export interface CompaniaHistorial {
  nombre: string;
  rol: string;
  estado: 'Actual' | 'Pasada';
}

export interface ProfileState {
  id: string;
  username: string;
  bio: string;
  avatar: string;
  habilidades: string[];
  idiomas: string[];
  formacion: string[];
  companias: CompaniaHistorial[]; 
}
export interface InvitadoTemporal {
  id: string;
  username: string;
  email: string;
  role: 'Actor' | 'Técnico' | 'Asistente de Dirección';
  avatar_url?: string;
}
// Tipo para los personajes que vienen del formulario
export interface PersonajeProyecto {
  nombre: string;
  descripcion: string;
  fotoRef: string;
  fotoPerfilReal: string;
  videoRef: string;
  perfilUrl: string;
  userName: string;
}