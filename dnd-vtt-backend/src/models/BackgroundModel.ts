import mongoose, { Document, Schema } from 'mongoose';

interface IChoice {
  desc?: string;
  choose: number;
  type: string;
  from: any;
}

interface IStartingEquipment {
  equipment: string;
  quantity: number;
}

interface IBackgroundFeature {
  name: string;
  desc: string[];
}

export interface IBackground extends Document {
  index: string;
  name: string;
  starting_proficiencies: string[];
  language_options: IChoice;
  starting_equipment: IStartingEquipment[];
  starting_equipment_options: IChoice[];
  feature: IBackgroundFeature;
  personality_traits: IChoice;
  ideals: IChoice;
  bonds: IChoice;
  flaws: IChoice;
}

const ChoiceSchema = new Schema<IChoice>({
  desc: { type: String },
  choose: { type: Number, required: true },
  type: { type: String, required: true },
  from: { type: Schema.Types.Mixed, required: true },
}, { _id: false });

const StartingEquipmentSchema = new Schema<IStartingEquipment>({
  equipment: { type: String, required: true },
  quantity: { type: Number, required: true },
}, { _id: false });

const BackgroundFeatureSchema = new Schema<IBackgroundFeature>({
  name: { type: String, required: true },
  desc: { type: [String], required: true },
}, { _id: false });

export const BackgroundSchema = new Schema<IBackground>({
  index: { type: String, required: true },
  name: { type: String, required: true },
  starting_proficiencies: [String],
  language_options: { type: ChoiceSchema, required: true },
  starting_equipment: [StartingEquipmentSchema],
  starting_equipment_options: [ChoiceSchema],
  feature: { type: BackgroundFeatureSchema, required: true },
  personality_traits: { type: ChoiceSchema, required: true },
  ideals: { type: ChoiceSchema, required: true },
  bonds: { type: ChoiceSchema, required: true },
  flaws: { type: ChoiceSchema, required: true },
});