import mongoose, { Document, Schema, model, Types } from 'mongoose';
import { IUser } from './UserModel'; // Importando a interface para tipagem

// Interface TypeScript para o documento da Campanha
export interface ICampaign extends Document {
  name: string;
  description: string;
  coverImageUrl?: string;
  gameSystem: string;
  // CORREÇÃO DEFINITIVA: Usando Types.ObjectId para clareza e compatibilidade.
  // Isso informa ao TypeScript que o campo pode ser um ID ou um documento IUser completo.
  gameMaster: Types.ObjectId | IUser;
  players: (Types.ObjectId | IUser)[];
  characters: Types.ObjectId[];
  encounters: Types.ObjectId[];
  npcs: Types.ObjectId[];
  status: 'Recrutando' | 'Em Andamento' | 'Pausada' | 'Finalizada';
  nextSessionDate?: Date;
  inviteCode: string;
}

// O Schema do Mongoose que define a estrutura no MongoDB
const CampaignSchema = new Schema<ICampaign>({
  name: {
    type: String,
    required: [true, 'O nome da campanha é obrigatório.'],
    trim: true,
    maxlength: [100, 'O nome da campanha não pode exceder 100 caracteres.'],
  },
  description: {
    type: String,
    required: [true, 'A descrição é obrigatória.'],
    maxlength: [1000, 'A descrição não pode exceder 1000 caracteres.'],
  },
  coverImageUrl: {
    type: String,
    default: '/default-campaign-cover.png',
  },
  gameSystem: {
    type: String,
    default: 'D&D 5e',
  },
  gameMaster: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  characters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character',
  }],
  encounters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Encounter',
  }],
  npcs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NPC',
  }],
  status: {
    type: String,
    enum: ['Recrutando', 'Em Andamento', 'Pausada', 'Finalizada'],
    default: 'Recrutando',
  },
  nextSessionDate: {
    type: Date,
  },
  inviteCode: {
    type: String,
    unique: true,
  },
}, {
  timestamps: true,
});

const CampaignModel = model<ICampaign>('Campaign', CampaignSchema);

export default CampaignModel;