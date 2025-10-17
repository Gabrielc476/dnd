import mongoose, { Document, Schema, model, Types } from 'mongoose';

export interface IClassLevel extends Document {
  level: number;
  prof_bonus: number;
  features: Types.ObjectId[]; // Características ganhas neste nível
  class: Types.ObjectId;      // A qual classe este nível pertence
  subclass?: Types.ObjectId;  // Opcional: a qual subclasse este nível pertence
  class_specific?: any;       // Para dados específicos como "action_surges" ou spell slots
}

const ClassLevelSchema = new Schema<IClassLevel>({
  level: { type: Number, required: true },
  prof_bonus: { type: Number, required: true },
  features: [{ type: Schema.Types.ObjectId, ref: 'Feature' }],
  class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  subclass: { type: Schema.Types.ObjectId, ref: 'Subclass' },
  class_specific: { type: Schema.Types.Mixed },
});

// Índice composto para garantir que cada classe/subclasse tenha apenas uma entrada por nível
ClassLevelSchema.index({ class: 1, subclass: 1, level: 1 }, { unique: true });

const ClassLevelModel = model<IClassLevel>('ClassLevel', ClassLevelSchema);

export default ClassLevelModel;