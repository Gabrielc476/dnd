import mongoose, { Document, Schema, model } from 'mongoose';
import { ICampaign } from './CampaignModel';

// Interface para a instância de uma criatura dentro de um encontro
interface ICreatureInstance {
  monsterId: mongoose.Schema.Types.ObjectId; // Referência ao modelo 'Monster'
  currentHP: number;
  initiative?: number;
  conditions: string[];
  // REMOVIDO: Campo de posição (x, y), pois não haverá mapa
}

// Schema para o subdocumento de criatura
const CreatureInstanceSchema = new Schema<ICreatureInstance>({
  monsterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Monster',
    required: true,
  },
  currentHP: {
    type: Number,
    required: true,
  },
  initiative: Number,
  conditions: [String],
}, { _id: false });

// Interface principal do Encounter
export interface IEncounter extends Document {
  name: string;
  description: string;
  campaignId: ICampaign['_id'];
  // REMOVIDO: URL do mapa
  creatures: ICreatureInstance[];
  status: 'Não Iniciado' | 'Em Andamento' | 'Finalizado';
  notes?: string;
}

// Schema principal do Encounter
const EncounterSchema = new Schema<IEncounter>({
  name: {
    type: String,
    required: [true, 'O nome do encontro é obrigatório.'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true,
  },
  creatures: [CreatureInstanceSchema],
  status: {
    type: String,
    enum: ['Não Iniciado', 'Em Andamento', 'Finalizado'],
    default: 'Não Iniciado',
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

// Cria e exporta o modelo
const EncounterModel = model<IEncounter>('Encounter', EncounterSchema);

export default EncounterModel;