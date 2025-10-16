import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/userController';

// Cria uma nova instância do roteador do Express
const router = Router();

// Define as rotas e associa cada uma à sua função de controller correspondente

// @route   POST /api/users/register
// @desc    Registra um novo usuário
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/users/login
// @desc    Autentica (login) um usuário e retorna um token
// @access  Public
router.post('/login', loginUser);

// Exporta o roteador para ser usado no arquivo principal do app
export default router;