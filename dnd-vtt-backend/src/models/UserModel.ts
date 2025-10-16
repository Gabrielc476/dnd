import mongoose, { Document, Schema, model } from 'mongoose';

// A interface define a estrutura de um documento de usuário para o TypeScript
export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string; // Armazenaremos o hash da senha, nunca a senha em texto plano
  profile: {
    avatarUrl?: string; // Opcional, podemos definir um padrão
    bio?: string;
  };
  // Arrays para armazenar os IDs das campanhas e personagens associados ao usuário
  campaignsAsGM: mongoose.Schema.Types.ObjectId[];
  campaignsAsPlayer: mongoose.Schema.Types.ObjectId[];
  characters: mongoose.Schema.Types.ObjectId[];
}

// O Schema do Mongoose define a estrutura e as regras de validação para a coleção no MongoDB
const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, 'O nome de usuário é obrigatório.'],
    unique: true, // Garante que não haja dois usuários com o mesmo nome
    trim: true, // Remove espaços em branco do início e do fim
    minlength: [3, 'O nome de usuário deve ter no mínimo 3 caracteres.'],
    maxlength: [30, 'O nome de usuário deve ter no máximo 30 caracteres.'],
  },
  email: {
    type: String,
    required: [true, 'O e-mail é obrigatório.'],
    unique: true,
    trim: true,
    lowercase: true, // Armazena o e-mail sempre em minúsculas para consistência
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Por favor, insira um e-mail válido.'],
  },
  passwordHash: {
    type: String,
    required: [true, 'A senha é obrigatória.'],
    select: false, // Impede que o hash da senha seja retornado em queries por padrão, para segurança
  },
  profile: {
    avatarUrl: {
      type: String,
      default: '/default-avatar.png', // Um caminho para um avatar padrão
    },
    bio: {
      type: String,
      maxlength: [250, 'A biografia não pode exceder 250 caracteres.'],
      default: '',
    },
  },
  // Relacionamentos com outras coleções
  campaignsAsGM: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign', // Faz referência ao futuro modelo 'Campaign'
  }],
  campaignsAsPlayer: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
  }],
  characters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character', // Faz referência ao futuro modelo 'Character'
  }],
}, {
  // Opções do Schema: Adiciona automaticamente os campos createdAt e updatedAt
  timestamps: true,
});

// Cria e exporta o modelo do Mongoose para que possamos usá-lo em outras partes do código
const UserModel = model<IUser>('User', UserSchema);

export default UserModel;