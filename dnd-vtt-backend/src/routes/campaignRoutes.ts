import { Router } from 'express';
import {
  createCampaign,
  getCampaignsForUser,
  getCampaignById,
  updateCampaignDetails,
  deleteCampaign,
  joinCampaign,
} from '../controllers/campaignController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// --- Rotas Protegidas ---
// O middleware 'protect' será executado antes de qualquer função de controller,
// garantindo que apenas usuários autenticados possam prosseguir.

// Rotas para /api/campaigns
router.route('/')
  .post(protect, createCampaign)     // Criar uma nova campanha
  .get(protect, getCampaignsForUser);    // Listar as campanhas do usuário logado

// Rota para /api/campaigns/join
router.route('/join')
  .post(protect, joinCampaign);      // Entrar em uma campanha com código de convite

// Rotas para /api/campaigns/:id
router.route('/:id')
  .get(protect, getCampaignById)        // Buscar uma campanha específica
  .put(protect, updateCampaignDetails)  // Atualizar os detalhes de uma campanha
  .delete(protect, deleteCampaign);    // Deletar uma campanha

export default router;