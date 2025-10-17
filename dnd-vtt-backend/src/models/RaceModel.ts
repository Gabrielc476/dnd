import mongoose, { Document, Schema, model, Types } from 'mongoose';

// Interface para bônus de habilidade
interface IAbilityBonus {
  ability_score: Types.ObjectId; // Ref para um futuro modelo 'AbilityScore'
  bonus: number;
}

// Interface para opções de escolha (proficiências, idiomas, etc.)
interface IChoice {
  desc: string;
  choose: number;
  type: string;
  from: any; // A estrutura 'from' é muito aninhada e variável
}

// Interface principal para a Raça
export interface IRace extends Document {
  index: string;
  name: string;
  speed: number;
  ability_bonuses: IAbilityBonus[];
  alignment: string;
  age: string;
  size: string;
  size_description: string;
  starting_proficiencies: Types.ObjectId[]; // Ref para um futuro modelo 'Proficiency'
  starting_proficiency_options?: IChoice;
  languages: Types.ObjectId[]; // Ref para um futuro modelo 'Language'
  language_desc: string;
  traits: Types.ObjectId[]; // Ref para um futuro modelo 'Trait'
  subraces: Types.ObjectId[]; // Ref para o modelo 'Subrace'
}

// --- Schemas do Mongoose ---

const AbilityBonusSchema = new Schema<IAbilityBonus>({
  ability_score: { type: Schema.Types.ObjectId, ref: 'AbilityScore', required: true },
  bonus: { type: Number, required: true },
}, { _id: false });

const ChoiceSchema = new Schema<IChoice>({
    desc: { type: String },
    choose: { type: Number },
    type: { type: String },
    from: { type: Schema.Types.Mixed },
}, { _id: false });

const RaceSchema = new Schema<IRace>({
  index: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  speed: { type: Number, required: true },
  ability_bonuses: [AbilityBonusSchema],
  alignment: { type: String, required: true },
  age: { type: String, required: true },
  size: { type: String, required: true },
  size_description: { type: String, required: true },
  starting_proficiencies: [{ type: Schema.Types.ObjectId, ref: 'Proficiency' }],
  starting_proficiency_options: ChoiceSchema,
  languages: [{ type: Schema.Types.ObjectId, ref: 'Language' }],
  language_desc: { type: String },
  traits: [{ type: Schema.Types.ObjectId, ref: 'Trait' }],
  subraces: [{ type: Schema.Types.ObjectId, ref: 'Subrace' }],
});

const RaceModel = model<IRace>('Race', RaceSchema);

export default RaceModel;