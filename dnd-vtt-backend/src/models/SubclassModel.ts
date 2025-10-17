import mongoose, { Document, Schema, model, Types } from 'mongoose';

export interface ISubclass extends Document {
  index: string;
  name: string;
  subclass_flavor: string;
  class: Types.ObjectId; // Referência à classe pai
  desc: string[];
  features: Types.ObjectId[]; // Referências às características da subclasse
}

const SubclassSchema = new Schema<ISubclass>({
  index: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  subclass_flavor: { type: String, required: true },
  class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  desc: { type: [String] },
  features: [{ type: Schema.Types.ObjectId, ref: 'Feature' }],
});

const SubclassModel = model<ISubclass>('Subclass', SubclassSchema);

export default SubclassModel;