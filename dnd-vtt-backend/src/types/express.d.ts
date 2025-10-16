import { IUser } from '../models/UserModel';

// Sobrescreve a declaração de tipos do Express globalmente
declare global {
  namespace Express {
    interface Request {
      user?: IUser; // Agora 'user' é uma propriedade conhecida e tipada do objeto Request
    }
  }
}