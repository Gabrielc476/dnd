import mongoose, { Document, Schema } from 'mongoose';
import { FeatureSchema, IFeature } from './FeatureModel'; // <-- UTILIZADO AQUI

interface IAbilityBonus {
  ability_score: string;
  bonus: number;
}

export interface ISubrace extends Document {
  index: string;
  name: string;
  desc: string;
  ability_bonuses: IAbilityBonus[];
  racial_traits: IFeature[];
}

const AbilityBonusSchema = new Schema<IAbilityBonus>({
  ability_score: { type: String, required: true },
  bonus: { type: Number, required: true },
}, { _id: false });

export const SubraceSchema = new Schema<ISubrace>({
  index: { type: String, required: true },
  name: { type: String, required: true },
  desc: { type: String, required: true },
  ability_bonuses: [AbilityBonusSchema],
  racial_traits: [FeatureSchema], // <-- FeatureSchema é usado aqui
}, { _id: false });