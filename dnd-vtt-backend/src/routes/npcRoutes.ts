import { Router } from 'express';
import {
  createNpc,
  getNpcsForCampaign,
  getNpcById,
  updateNpc,
  deleteNpc,
} from '../controllers/npcController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// O middleware .use(protect) é aplicado a todas as rotas definidas neste arquivo.
// Isso garante que nenhum usuário não autenticado possa acessar os endpoints de NPC.
router.use(protect);

// Rota para criar um novo NPC.
// A qual campanha ele pertence será definida no corpo da requisição.
// POST /api/npcs
router.post('/', createNpc);

// Rota para buscar todos os NPCs de uma campanha específica.
// GET /api/npcs/campaign/60c72b2f9b1d8c001f8e4a3b
router.get('/campaign/:campaignId', getNpcsForCampaign);

// Rotas para interagir com um NPC específico pelo seu próprio ID.
// GET, PUT, DELETE /api/npcs/60c72b2f9b1d8c001f8e4a3c
router.route('/:npcId')
  .get(getNpcById)
  .put(updateNpc)
  .delete(deleteNpc);

export default router;