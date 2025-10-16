import { Request, Response } from 'express';
import { Types } from 'mongoose';
import EncounterModel from '../models/EncounterModel';
import CampaignModel from '../models/CampaignModel';
import NPCModel from '../models/NPCModel';

/**
 * @desc    Criar um novo encontro para uma campanha
 * @route   POST /api/encounters
 * @access  Privado (Apenas o Mestre)
 */
const createEncounter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { campaignId, name, description, creatures } = req.body;
    const userId = req.user!.id;

    if (!campaignId || !name) {
      res.status(400).json({ message: 'O ID da campanha e o nome do encontro são obrigatórios.' });
      return;
    }

    const campaign = await CampaignModel.findById(campaignId);
    if (!campaign) {
      res.status(404).json({ message: 'Campanha não encontrada.' });
      return;
    }
    if (campaign.gameMaster.toString() !== userId) {
      res.status(403).json({ message: 'Acesso negado. Apenas o mestre da campanha pode criar encontros.' });
      return;
    }

    if (creatures && creatures.length > 0) {
        for (const creature of creatures) {
            // A CORREÇÃO ESTÁ AQUI: Adicionamos .lean() ao final da query
            const npc = await NPCModel.findById(creature.monsterId).lean();

            if (!npc) {
                res.status(400).json({ message: `NPC com ID ${creature.monsterId} não foi encontrado.` });
                return;
            }
            
            // Agora o TypeScript sabe que 'npc' é um objeto simples e a verificação funciona
            if (npc.campaignId.toString() !== campaignId) {
                res.status(400).json({ message: `NPC com ID ${creature.monsterId} não pertence a esta campanha.` });
                return;
            }

            if (creature.currentHP === undefined) {
                creature.currentHP = npc.hit_points;
            }
        }
    }
    
    const newEncounter = await EncounterModel.create({
      name,
      description,
      campaignId,
      creatures,
      status: 'Não Iniciado',
    });

    campaign.encounters.push(newEncounter._id as Types.ObjectId);
    await campaign.save();

    res.status(201).json(newEncounter);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar o encontro.', error });
  }
};

/**
 * @desc    Buscar todos os encontros de uma campanha
 * @route   GET /api/encounters/campaign/:campaignId
 * @access  Privado (Mestre e Jogadores)
 */
const getEncountersForCampaign = async (req: Request, res: Response): Promise<void> => {
  try {
    const { campaignId } = req.params;
    const userId = req.user!.id;

    const campaign = await CampaignModel.findById(campaignId);
    if (!campaign) {
      res.status(404).json({ message: 'Campanha não encontrada.' });
      return;
    }

    const isMember = campaign.players.some(p => p.toString() === userId) || campaign.gameMaster.toString() === userId;
    if (!isMember) {
      res.status(403).json({ message: 'Acesso negado a esta campanha.' });
      return;
    }

    const encounters = await EncounterModel.find({ campaignId: campaignId });
    res.status(200).json(encounters);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar encontros.', error });
  }
};

/**
 * @desc    Buscar um encontro específico pelo seu ID
 * @route   GET /api/encounters/:encounterId
 * @access  Privado (Mestre e Jogadores)
 */
const getEncounterById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { encounterId } = req.params;
        const userId = req.user!.id;

        const encounter = await EncounterModel.findById(encounterId).populate({
            path: 'creatures.monsterId',
            model: 'NPC' // 'NPC' deve ser o nome que você usou em model('NPC', NPCSchema)
        });

        if (!encounter) {
            res.status(404).json({ message: 'Encontro não encontrado.' });
            return;
        }

        const campaign = await CampaignModel.findById(encounter.campaignId);
        const isMember = campaign?.players.some(p => p.toString() === userId) || campaign?.gameMaster.toString() === userId;

        if (!isMember) {
            res.status(403).json({ message: 'Acesso negado a este encontro.' });
            return;
        }

        res.status(200).json(encounter);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar o encontro.', error });
    }
};

/**
 * @desc    Atualizar um encontro (ex: adicionar/remover criaturas, mudar status)
 * @route   PUT /api/encounters/:encounterId
 * @access  Privado (Apenas o Mestre)
 */
const updateEncounter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { encounterId } = req.params;
    const userId = req.user!.id;

    const encounter = await EncounterModel.findById(encounterId);
    if (!encounter) {
      res.status(404).json({ message: 'Encontro não encontrado.' });
      return;
    }

    const campaign = await CampaignModel.findById(encounter.campaignId);
    if (!campaign || campaign.gameMaster.toString() !== userId) {
      res.status(403).json({ message: 'Acesso negado. Apenas o mestre pode editar este encontro.' });
      return;
    }
    
    if (req.body.creatures) {
        for (const creature of req.body.creatures) {
            if (!creature.monsterId || !(await NPCModel.findById(creature.monsterId))) {
                 res.status(400).json({ message: `NPC com ID ${creature.monsterId} é inválido.` });
                return;
            }
        }
    }

    const updatedEncounter = await EncounterModel.findByIdAndUpdate(encounterId, req.body, {
      new: true,
      runValidators: true,
    }).populate({ path: 'creatures.monsterId', model: 'NPC' });

    res.status(200).json(updatedEncounter);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar o encontro.', error });
  }
};

/**
 * @desc    Deletar um encontro
 * @route   DELETE /api/encounters/:encounterId
 * @access  Privado (Apenas o Mestre)
 */
const deleteEncounter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { encounterId } = req.params;
    const userId = req.user!.id;

    const encounter = await EncounterModel.findById(encounterId);
    if (!encounter) {
      res.status(404).json({ message: 'Encontro não encontrado.' });
      return;
    }

    const campaign = await CampaignModel.findById(encounter.campaignId);
    if (!campaign || campaign.gameMaster.toString() !== userId) {
      res.status(403).json({ message: 'Acesso negado. Apenas o mestre pode deletar este encontro.' });
      return;
    }

    await EncounterModel.findByIdAndDelete(encounterId);

    await CampaignModel.findByIdAndUpdate(encounter.campaignId, {
      $pull: { encounters: encounterId },
    });

    res.status(200).json({ message: 'Encontro deletado com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar o encontro.', error });
  }
};

export {
  createEncounter,
  getEncountersForCampaign,
  getEncounterById,
  updateEncounter,
  deleteEncounter,
};