import mongoose, { Document, Schema, Types } from 'mongoose';
import { ClassLevelSchema, IClassLevel } from './ClassLevelModel'; // <-- UTILIZADO AQUI

export interface ISubclass extends Document {
  index: string;
  name: string;
  subclass_flavor: string;
  desc: string[];
  subclass_levels: IClassLevel[];
}

// Exporta a "planta" de uma Subclasse
export const SubclassSchema = new Schema<ISubclass>({
  index: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  subclass_flavor: { type: String, required: true },
  desc: { type: [String] },
  subclass_levels: [ClassLevelSchema], // <-- ClassLevelSchema é usado aqui
}, { _id: false });