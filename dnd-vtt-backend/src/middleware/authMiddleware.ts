// src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UserModel from '../models/UserModel';

// Interface para estender o objeto Request do Express e adicionar a propriedade 'user'
interface AuthenticatedRequest extends Request {
  user?: any; // Usamos 'any' por simplicidade, mas o ideal é a interface do usuário
}

const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  let token;

  // 1. Verificar se o cabeçalho de autorização existe e começa com "Bearer"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Extrair o token do cabeçalho (Bearer TOKEN)
      token = req.headers.authorization.split(' ')[1];

      // 3. Verificar e decodificar o token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

      // 4. Buscar o usuário no banco de dados pelo ID do token
      // O '-passwordHash' remove o hash da senha do resultado da busca
      req.user = await UserModel.findById(decoded.id).select('-passwordHash');

      if (!req.user) {
        res.status(401).json({ message: 'Não autorizado, usuário não encontrado.' });
        return;
      }
      
      // 5. Chamar a próxima função (o controller da rota)
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Não autorizado, token inválido.' });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Não autorizado, token não encontrado.' });
  }
};

export { protect };