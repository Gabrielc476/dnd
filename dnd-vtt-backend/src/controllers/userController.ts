import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/UserModel';

/**
 * @desc    Registrar um novo usuário
 * @route   POST /api/users/register
 * @access  Public
 */
const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
    return;
  }

  try {
    const userExists = await UserModel.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: 'Usuário já cadastrado com este e-mail.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await UserModel.create({
      username,
      email,
      passwordHash,
    });

    if (user) {
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET as string,
        { expiresIn: '30d' }
      );

      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token,
      });
    } else {
      res.status(400).json({ message: 'Dados de usuário inválidos.' });
    }
  } catch (error) {
    if (error instanceof Error) {
        res.status(500).json({ message: `Erro no servidor: ${error.message}` });
    } else {
        res.status(500).json({ message: 'Ocorreu um erro desconhecido.' });
    }
  }
};

/**
 * @desc    Autenticar (login) um usuário
 * @route   POST /api/users/login
 * @access  Public
 */
const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Por favor, forneça e-mail e senha.' });
    return;
  }

  try {
    const user = await UserModel.findOne({ email }).select('+passwordHash');

    if (!user) {
        res.status(401).json({ message: 'Credenciais inválidas.' });
        return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (user && isMatch) {
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET as string,
        { expiresIn: '30d' }
      );

      res.status(200).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token,
      });
    } else {
      res.status(401).json({ message: 'Credenciais inválidas.' });
    }
  } catch (error) {
    if (error instanceof Error) {
        res.status(500).json({ message: `Erro no servidor: ${error.message}` });
    } else {
        res.status(500).json({ message: 'Ocorreu um erro desconhecido.' });
    }
  }
};


// Futuramente, uma função protegida ficaria assim:
/*
const getUserProfile = async (req: Request, res: Response): Promise<void> => {
    // req.user existe e está corretamente tipado graças ao middleware e ao express.d.ts
    const user = {
        _id: req.user!._id,
        username: req.user!.username,
        email: req.user!.email,
    };
    res.status(200).json(user);
};
*/

export { registerUser, loginUser };