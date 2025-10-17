import mongoose, { Document, Schema, model, Types } from 'mongoose';

// --- Subdocumentos para Estrutura ---

// Interface genérica para qualquer tipo de escolha que o jogador possa fazer.
// Reutilizável para proficiências, idiomas, equipamentos, traços, etc.
interface IChoice {
  desc?: string;
  choose: number;
  type: string;
  from: any; // A estrutura 'from' é muito aninhada e variável, 'any' é prático aqui
}

// Interface para um item de equipamento inicial
interface IStartingEquipment {
  equipment: Types.ObjectId; // Ref para um futuro modelo 'Equipment'
  quantity: number;
}

// Interface para a Característica (Feature) do Antecedente
interface IBackgroundFeature {
  name: string;
  desc: string[];
}

// --- Interface Principal do Background ---

export interface IBackground extends Document {
  index: string;
  name: string;
  starting_proficiencies: Types.ObjectId[]; // Ref para 'Proficiency'
  language_options: IChoice;
  starting_equipment: IStartingEquipment[];
  starting_equipment_options: IChoice[];
  feature: IBackgroundFeature;
  personality_traits: IChoice;
  ideals: IChoice;
  bonds: IChoice;
  flaws: IChoice;
}

// --- Schemas do Mongoose ---

const ChoiceSchema = new Schema<IChoice>({
  desc: { type: String },
  choose: { type: Number, required: true },
  type: { type: String, required: true },
  from: { type: Schema.Types.Mixed, required: true },
}, { _id: false });

const StartingEquipmentSchema = new Schema<IStartingEquipment>({
  equipment: { type: Schema.Types.ObjectId, ref: 'Equipment', required: true },
  quantity: { type: Number, required: true },
}, { _id: false });

const BackgroundFeatureSchema = new Schema<IBackgroundFeature>({
  name: { type: String, required: true },
  desc: { type: [String], required: true },
}, { _id: false });

const BackgroundSchema = new Schema<IBackground>({
  index: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  starting_proficiencies: [{ type: Schema.Types.ObjectId, ref: 'Proficiency' }],
  language_options: { type: ChoiceSchema, required: true },
  starting_equipment: [StartingEquipmentSchema],
  starting_equipment_options: [ChoiceSchema],
  feature: { type: BackgroundFeatureSchema, required: true },
  personality_traits: { type: ChoiceSchema, required: true },
  ideals: { type: ChoiceSchema, required: true },
  bonds: { type: ChoiceSchema, required: true },
  flaws: { type: ChoiceSchema, required: true },
});

const BackgroundModel = model<IBackground>('Background', BackgroundSchema);

export default BackgroundModel;