import mongoose, { Document, Schema, model, Types } from 'mongoose';

// Reutilizando as interfaces do modelo de Raça para consistência
interface IAbilityBonus {
  ability_score: Types.ObjectId;
  bonus: number;
}

// Interface principal para a Sub-raça
export interface ISubrace extends Document {
  index: string;
  name: string;
  race: Types.ObjectId; // Referência à raça pai
  desc: string;
  ability_bonuses: IAbilityBonus[];
  starting_proficiencies: Types.ObjectId[];
  languages: Types.ObjectId[];
  racial_traits: Types.ObjectId[];
}

// --- Schemas do Mongoose ---

const AbilityBonusSchema = new Schema<IAbilityBonus>({
  ability_score: { type: Schema.Types.ObjectId, ref: 'AbilityScore', required: true },
  bonus: { type: Number, required: true },
}, { _id: false });


const SubraceSchema = new Schema<ISubrace>({
  index: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  race: { type: Schema.Types.ObjectId, ref: 'Race', required: true },
  desc: { type: String, required: true },
  ability_bonuses: [AbilityBonusSchema],
  starting_proficiencies: [{ type: Schema.Types.ObjectId, ref: 'Proficiency' }],
  languages: [{ type: Schema.Types.ObjectId, ref: 'Language' }],
  racial_traits: [{ type: Schema.Types.ObjectId, ref: 'Trait' }],
});

const SubraceModel = model<ISubrace>('Subrace', SubraceSchema);

export default SubraceModel;