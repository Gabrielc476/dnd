import mongoose, { Document, Schema, model, Types } from 'mongoose';

export interface IFeature extends Document {
  index: string; // Ex: "extra-attack-3"
  name: string;  // Ex: "Extra Attack (3)"
  level: number;
  class: Types.ObjectId; // Referência ao modelo 'Class'
  desc: string[];
}

const FeatureSchema = new Schema<IFeature>({
  index: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  level: { type: Number, required: true },
  class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  desc: { type: [String], required: true },
});

const FeatureModel = model<IFeature>('Feature', FeatureSchema);

export default FeatureModel;