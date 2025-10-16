// src/models/NPCModel.ts

import mongoose, { Document, Schema, model } from 'mongoose';
import { ICampaign } from './CampaignModel';

// Interface para Ações, Reações, etc. (Subdocumento)
interface IAction {
  name: string;
  description: string;
}

// Interface para o documento NPC
export interface INPC extends Document {
  name: string;
  campaignId: ICampaign['_id'];
  avatarUrl?: string;
  description?: string;
  race?: string;
  alignment?: string;
  
  // Informações de Roleplay
  roleplaying: {
    personalityTraits?: string;
    ideals?: string;
    bonds?: string;
    flaws?: string;
  };
  
  // Bloco de Estatísticas de Combate
  stats: {
    armorClass: number;
    maxHitPoints: number;
    speed: string;
    abilityScores: {
      strength: number;
      dexterity: number;
      constitution: number;
      intelligence: number;
      wisdom: number;
      charisma: number;
    };
  };
  
  // Ações de Combate
  actions: IAction[];
  reactions?: IAction[];
  legendaryActions?: IAction[];

  // Notas privadas para o GM
  gmNotes?: string;
}

// Schema para Ações (reutilizável)
const ActionSchema = new Schema<IAction>({
  name: { type: String, required: true },
  description: { type: String, required: true },
}, { _id: false });

// Schema principal do NPC
const NPCSchema = new Schema<INPC>({
  name: {
    type: String,
    required: [true, 'O nome do NPC é obrigatório.'],
    trim: true,
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true,
  },
  avatarUrl: {
    type: String,
    default: '/default-npc-avatar.png',
  },
  description: { type: String, default: '' },
  race: { type: String, default: '' },
  alignment: { type: String, default: '' },
  
  roleplaying: {
    personalityTraits: { type: String, default: '' },
    ideals: { type: String, default: '' },
    bonds: { type: String, default: '' },
    flaws: { type: String, default: '' },
  },

  stats: {
    armorClass: { type: Number, required: true, default: 10 },
    maxHitPoints: { type: Number, required: true, default: 10 },
    speed: { type: String, required: true, default: '9m' },
    abilityScores: {
      strength: { type: Number, default: 10 },
      dexterity: { type: Number, default: 10 },
      constitution: { type: Number, default: 10 },
      intelligence: { type: Number, default: 10 },
      wisdom: { type: Number, default: 10 },
      charisma: { type: Number, default: 10 },
    },
  },
  
  actions: [ActionSchema],
  reactions: [ActionSchema],
  legendaryActions: [ActionSchema],

  gmNotes: {
    type: String,
    select: false, // Notas do mestre não devem ser retornadas em queries padrão
  },
}, {
  timestamps: true,
});

const NPCModel = model<INPC>('NPC', NPCSchema);

export default NPCModel;