import mongoose, { Document, Schema, model } from 'mongoose';
import { IUser } from './UserModel';
import { ICampaign } from './CampaignModel';

// Importamos as "plantas" (Schemas e Interfaces) que definimos nos outros arquivos
import { ClassSchema, IClass } from './ClassModel';
import { RaceSchema, IRace } from './RaceModel';
import { BackgroundSchema, IBackground } from './BackgroundModel';

// --- Interface Principal do Personagem (Auto-Contida) ---
export interface ICharacter extends Document {
  userId: IUser['_id'];
  campaignId: ICampaign['_id'];
  name: string;
  
  // Dados Embutidos (usando as interfaces importadas)
  race: IRace;
  background: IBackground;
  classes: IClass[]; // Suporta multiclasse
  
  // Estado Atual
  level: number;
  xp: number;
  alignment: string;
  stats: {
    armorClass: number;
    speed: number;
    hitPoints: { max: number; current: number; temporary: number };
    hitDice: { total: string; available: number };
  };
  abilityScores: {
    strength: number; dexterity: number; constitution: number;
    intelligence: number; wisdom: number; charisma: number;
  };
  proficiencies: {
    proficiencyBonus: number;
    savingThrows: string[];
    skills: string[];
  };
  personality: {
    traits: string; ideals: string; bonds: string; flaws: string;
  };
  equipment: {
    inventory: { itemName: string; quantity: number }[];
    currency: { cp: number; sp: number; gp: number; ep: number; pp: number };
  };
  spellcasting?: any;
}

// --- Schema Principal do Mongoose ---
const CharacterSchema = new Schema<ICharacter>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
  name: { type: String, required: true, trim: true },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  alignment: { type: String },
  
  // --- ESTRUTURAS EMBUTIDAS USANDO OS SCHEMAS IMPORTADOS ---
  race: { type: RaceSchema, required: true },
  background: { type: BackgroundSchema, required: true },
  classes: [ClassSchema],
  
  stats: {
    armorClass: { type: Number, default: 10 },
    speed: { type: Number, required: true },
    hitPoints: { max: {type: Number, default: 10}, current: {type: Number, default: 10}, temporary: {type: Number, default: 0} },
    hitDice: { total: {type: String, default: "1d8"}, available: {type: Number, default: 1} },
  },
  abilityScores: {
    strength: {type: Number, default: 10}, dexterity: {type: Number, default: 10}, constitution: {type: Number, default: 10},
    intelligence: {type: Number, default: 10}, wisdom: {type: Number, default: 10}, charisma: {type: Number, default: 10},
  },
  proficiencies: {
    proficiencyBonus: {type: Number, default: 2},
    savingThrows: [String],
    skills: [String],
  },
  personality: {
    traits: {type: String, default: ""}, ideals: {type: String, default: ""}, bonds: {type: String, default: ""}, flaws: {type: String, default: ""},
  },
  equipment: {
    inventory: [{ itemName: String, quantity: Number }],
    currency: { cp: {type: Number, default: 0}, sp: {type: Number, default: 0}, gp: {type: Number, default: 0}, ep: {type: Number, default: 0}, pp: {type: Number, default: 0} },
  },
  spellcasting: { type: Schema.Types.Mixed },
}, {
  timestamps: true,
});

// APENAS AQUI nós criamos um modelo, que resultará na coleção 'characters'.
const CharacterModel = model<ICharacter>('Character', CharacterSchema);

export default CharacterModel;