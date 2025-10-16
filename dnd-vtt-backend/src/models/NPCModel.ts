import mongoose, { Document, Schema, model, Types } from 'mongoose';
import { ICampaign } from './CampaignModel';

// --- Subdocumentos para Estrutura ---

// Para Habilidades Especiais, Ações, Ações Lendárias, etc.
interface IAbility {
  name: string;
  desc: string;
}

// Para Proficiências (Perícias e Testes de Resistência)
interface IProficiency {
  name: string; // Ex: "Perception" ou "Saving Throw: DEX"
  value: number;
}

// --- Interface Principal do NPC ---

export interface INPC extends Document {
  name: string;
  campaignId: ICampaign['_id'];
  
  // Informações Básicas (como na API)
  size: string;
  type: string;
  subtype?: string;
  alignment: string;
  
  // Estatísticas de Combate
  armor_class: number;
  hit_points: number;
  hit_dice: string;
  speed: Record<string, string>; // Ex: { walk: '9m', fly: '18m' }
  
  // Valores de Habilidade
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  
  // Proficiências e Resistências
  proficiencies: IProficiency[];
  damage_vulnerabilities: string[];
  damage_resistances: string[];
  damage_immunities: string[];
  condition_immunities: string[];
  
  // Sentidos e Idiomas
  senses: Record<string, string>; // Ex: { darkvision: '36m', passive_perception: '10' }
  languages: string;
  challenge_rating: number;
  xp: number;

  // Habilidades e Ações (como na API)
  special_abilities: IAbility[];
  actions: IAbility[];
  legendary_actions?: IAbility[];

  // Informações de Roleplay e Aparência
  avatarUrl?: string;
  description?: string;
  gmNotes?: string;
}

// --- Schemas do Mongoose ---

const AbilitySchema = new Schema<IAbility>({
  name: { type: String, required: true },
  desc: { type: String, required: true },
}, { _id: false });

const ProficiencySchema = new Schema<IProficiency>({
    name: { type: String, required: true },
    value: { type: Number, required: true },
}, { _id: false });


const NPCSchema = new Schema<INPC>({
  name: { type: String, required: true, trim: true },
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
  
  size: { type: String, required: true, default: 'Medium' },
  type: { type: String, required: true, default: 'humanoid' },
  subtype: { type: String, default: '' },
  alignment: { type: String, required: true, default: 'neutral' },
  
  armor_class: { type: Number, required: true, default: 10 },
  hit_points: { type: Number, required: true, default: 10 },
  hit_dice: { type: String, required: true, default: '1d8' },
  speed: { type: Map, of: String, default: { walk: '9m' } },
  
  strength: { type: Number, default: 10 },
  dexterity: { type: Number, default: 10 },
  constitution: { type: Number, default: 10 },
  intelligence: { type: Number, default: 10 },
  wisdom: { type: Number, default: 10 },
  charisma: { type: Number, default: 10 },

  proficiencies: [ProficiencySchema],
  damage_vulnerabilities: [String],
  damage_resistances: [String],
  damage_immunities: [String],
  condition_immunities: [String],

  senses: { type: Map, of: String, default: { passive_perception: '10' } },
  languages: { type: String, default: 'Common' },
  challenge_rating: { type: Number, required: true, default: 0 },
  xp: { type: Number, required: true, default: 10 },

  special_abilities: [AbilitySchema],
  actions: [AbilitySchema],
  legendary_actions: [AbilitySchema],

  avatarUrl: { type: String, default: '/default-npc-avatar.png' },
  description: { type: String, default: '' },
  gmNotes: { type: String, select: false },

}, {
  timestamps: true,
});

const NPCModel = model<INPC>('NPC', NPCSchema);

export default NPCModel;