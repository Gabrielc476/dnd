import mongoose, { Document, Schema } from 'mongoose';

// Interface
export interface IFeature extends Document {
  index: string;
  name: string;
  level: number; // Nível em que a característica foi adquirida
  desc: string[];
}

// Schema (Planta)
export const FeatureSchema = new Schema<IFeature>({
  index: { type: String, required: true },
  name: { type: String, required: true },
  level: { type: Number, required: true },
  desc: { type: [String], required: true },
}, { _id: false }); // _id: false é importante para subdocumentos