import mongoose, { Document, Schema } from 'mongoose';
import { SubraceSchema, ISubrace } from './SubraceMOdel'; // <-- UTILIZADO AQUI
import { FeatureSchema, IFeature } from './FeatureModel'; // <-- UTILIZADO AQUI

interface IAbilityBonus {
  ability_score: string;
  bonus: number;
}

interface IChoice {
  desc: string;
  choose: number;
  type: string;
  from: any;
}

export interface IRace extends Document {
  index: string;
  name: string;
  speed: number;
  ability_bonuses: IAbilityBonus[];
  alignment: string;
  age: string;
  size: string;
  size_description: string;
  starting_proficiencies: string[];
  starting_proficiency_options?: IChoice;
  languages: string[];
  language_desc: string;
  traits: IFeature[];
  subraces: ISubrace[];
}

const AbilityBonusSchema = new Schema<IAbilityBonus>({
  ability_score: { type: String, required: true },
  bonus: { type: Number, required: true },
}, { _id: false });

const ChoiceSchema = new Schema<IChoice>({
    desc: { type: String },
    choose: { type: Number },
    type: { type: String },
    from: { type: Schema.Types.Mixed },
}, { _id: false });

export const RaceSchema = new Schema<IRace>({
  index: { type: String, required: true },
  name: { type: String, required: true },
  speed: { type: Number, required: true },
  ability_bonuses: [AbilityBonusSchema],
  alignment: { type: String, required: true },
  age: { type: String, required: true },
  size: { type: String, required: true },
  size_description: { type: String, required: true },
  starting_proficiencies: [String],
  starting_proficiency_options: ChoiceSchema,
  languages: [String],
  language_desc: { type: String },
  traits: [FeatureSchema],     // <-- FeatureSchema é usado aqui
  subraces: [SubraceSchema], // <-- SubraceSchema é usado aqui
});