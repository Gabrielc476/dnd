import mongoose, { Document, Schema } from 'mongoose';
import { FeatureSchema, IFeature } from './FeatureModel'; // <-- UTILIZADO AQUI

export interface IClassLevel extends Document {
  level: number;
  prof_bonus: number;
  features: IFeature[];
  class_specific?: any;
}

// Exporta a "planta" de um Nível de Classe
export const ClassLevelSchema = new Schema<IClassLevel>({
  level: { type: Number, required: true },
  prof_bonus: { type: Number, required: true },
  features: [FeatureSchema], // <-- FeatureSchema é usado aqui
  class_specific: { type: Schema.Types.Mixed },
}, { _id: false });