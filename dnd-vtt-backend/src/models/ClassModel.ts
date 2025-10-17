import mongoose, { Document, Schema, model, Types } from 'mongoose';

// Interface para opções de escolha (proficiências, equipamentos)
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
  proficiencies: Types.ObjectId[];
  saving_throws: Types.ObjectId[];
  starting_equipment: any[];
  starting_equipment_options: IChoice[];
  subclasses: Types.ObjectId[];
  levels: Types.ObjectId[];
}

const ChoiceSchema = new Schema({
    desc: { type: String },
    choose: { type: Number },
    type: { type: String },
    from: { type: Schema.Types.Mixed },
}, { _id: false });

const ClassSchema = new Schema<IClass>({
  index: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  hit_die: { type: Number, required: true },
  proficiency_choices: [ChoiceSchema],
  proficiencies: [{ type: Schema.Types.ObjectId, ref: 'Proficiency' }],
  saving_throws: [{ type: Schema.Types.ObjectId, ref: 'AbilityScore' }],
  // A CORREÇÃO ESTÁ AQUI: A definição de array é feita com colchetes.
  starting_equipment: [Schema.Types.Mixed],
  starting_equipment_options: [ChoiceSchema],
  subclasses: [{ type: Schema.Types.ObjectId, ref: 'Subclass' }],
  levels: [{ type: Schema.Types.ObjectId, ref: 'ClassLevel' }],
});

const ClassModel = model<IClass>('Class', ClassSchema);

export default ClassModel;