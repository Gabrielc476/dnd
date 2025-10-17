import mongoose, { Document, Schema } from 'mongoose';
import { SubclassSchema, ISubclass } from './SubclassModel'; // <-- UTILIZADO AQUI
import { ClassLevelSchema, IClassLevel } from './ClassLevelModel'; // <-- UTILIZADO AQUI

interface IChoice {
  desc: string;
  choose: number;
  type: string;
  from: any;
}

export interface IClass extends Document {
  index: string;
  name: string;
  hit_die: number;
  proficiency_choices: IChoice[];
  proficiencies: string[];
  saving_throws: string[];
  starting_equipment_options: IChoice[];
  class_levels: IClassLevel[];
  subclasses: ISubclass[];
}

const ChoiceSchema = new Schema({
    desc: { type: String },
    choose: { type: Number },
    type: { type: String },
    from: { type: Schema.Types.Mixed },
}, { _id: false });

// Exporta a "planta" de uma Classe
export const ClassSchema = new Schema<IClass>({
  index: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  hit_die: { type: Number, required: true },
  proficiency_choices: [ChoiceSchema],
  proficiencies: [String],
  saving_throws: [String],
  starting_equipment_options: [ChoiceSchema],
  class_levels: [ClassLevelSchema], // <-- ClassLevelSchema é usado aqui
  subclasses: [SubclassSchema],     // <-- SubclassSchema é usado aqui
});