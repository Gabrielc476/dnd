import { Router } from 'express';
import {
  createEncounter,
  getEncountersForCampaign,
  getEncounterById,
  updateEncounter,
  deleteEncounter,
} from '../controllers/encounterController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Aplica o middleware de proteção a todas as rotas de encontros.
// Nenhuma ação relacionada a encontros pode ser feita sem estar logado.
router.use(protect);

// Rota para criar um novo encontro.
// O ID da campanha será enviado no corpo da requisição.
// POST /api/encounters
router.post('/', createEncounter);

// Rota para buscar todos os encontros de uma campanha específica.
// GET /api/encounters/campaign/60c72b2f9b1d8c001f8e4a3b
router.get('/campaign/:campaignId', getEncountersForCampaign);

// Agrupa as rotas que operam sobre um encontro específico pelo seu ID.
// GET, PUT, DELETE /api/encounters/60c72b2f9b1d8c001f8e4a3c
router.route('/:encounterId')
  .get(getEncounterById)
  .put(updateEncounter)
  .delete(deleteEncounter);

export default router;