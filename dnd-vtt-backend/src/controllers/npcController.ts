import { Request, Response } from 'express';
import { Types } from 'mongoose';
import NPCModel from '../models/NPCModel';
import CampaignModel from '../models/CampaignModel';

/**
 * @desc    Criar um novo NPC para uma campanha
 * @route   POST /api/npcs
 * @access  Privado (Apenas o Mestre)
 */
const createNpc = async (req: Request, res: Response): Promise<void> => {
  try {
    // AJUSTE: campaignId agora vem do corpo da requisição
    const { campaignId, ...npcData } = req.body;
    const userId = req.user!.id;

    if (!campaignId) {
      res.status(400).json({ message: 'O ID da campanha é obrigatório no corpo da requisição.' });
      return;
    }

    const campaign = await CampaignModel.findById(campaignId);
    if (!campaign) {
      res.status(404).json({ message: 'Campanha não encontrada.' });
      return;
    }
    if (campaign.gameMaster.toString() !== userId) {
      res.status(403).json({ message: 'Acesso negado. Apenas o mestre pode criar NPCs.' });
      return;
    }

    const npc = await NPCModel.create({
      ...npcData,
      campaignId: campaignId,
    });

    campaign.npcs.push(npc._id as Types.ObjectId);
    await campaign.save();

    res.status(201).json(npc);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar o NPC.', error });
  }
};

/**
 * @desc    Buscar todos os NPCs de uma campanha específica
 * @route   GET /api/npcs/campaign/:campaignId
 * @access  Privado (Mestre e Jogadores da campanha)
 */
const getNpcsForCampaign = async (req: Request, res: Response): Promise<void> => {
  try {
    const { campaignId } = req.params;
    const userId = req.user!.id;

    const campaign = await CampaignModel.findById(campaignId);
    if (!campaign) {
      res.status(404).json({ message: 'Campanha não encontrada.' });
      return;
    }
    const isPlayer = campaign.players.some(p => p.toString() === userId);
    const isGameMaster = campaign.gameMaster.toString() === userId;
    if (!isPlayer && !isGameMaster) {
      res.status(403).json({ message: 'Acesso negado a esta campanha.' });
      return;
    }

    const npcs = await NPCModel.find({ campaignId: campaignId });

    res.status(200).json(npcs);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar os NPCs.', error });
  }
};

/**
 * @desc    Buscar um NPC específico pelo seu ID
 * @route   GET /api/npcs/:npcId
 * @access  Privado (Mestre da campanha do NPC)
 */
const getNpcById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { npcId } = req.params;
        const userId = req.user!.id;
        
        const npc = await NPCModel.findById(npcId).select('+gmNotes');

        if (!npc) {
            res.status(404).json({ message: 'NPC não encontrado.' });
            return;
        }

        const campaign = await CampaignModel.findById(npc.campaignId);
        const isGameMaster = campaign?.gameMaster.toString() === userId;

        if (isGameMaster) {
            // Se for o mestre, retorna o NPC completo com as notas
            res.status(200).json(npc);
        } else {
            // Se não for o mestre, remove as notas antes de enviar
            const npcObject = npc.toObject();
            delete npcObject.gmNotes;
            res.status(200).json(npcObject);
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar o NPC.', error });
    }
};

/**
 * @desc    Atualizar um NPC
 * @route   PUT /api/npcs/:npcId
 * @access  Privado (Apenas o Mestre)
 */
const updateNpc = async (req: Request, res: Response): Promise<void> => {
  try {
    const { npcId } = req.params;
    const userId = req.user!.id;

    const npc = await NPCModel.findById(npcId);
    if (!npc) {
      res.status(404).json({ message: 'NPC não encontrado.' });
      return;
    }

    const campaign = await CampaignModel.findById(npc.campaignId);
    if (!campaign || campaign.gameMaster.toString() !== userId) {
      res.status(403).json({ message: 'Acesso negado. Apenas o mestre pode editar este NPC.' });
      return;
    }

    const updatedNpc = await NPCModel.findByIdAndUpdate(npcId, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedNpc);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar o NPC.', error });
  }
};

/**
 * @desc    Deletar um NPC
 * @route   DELETE /api/npcs/:npcId
 * @access  Privado (Apenas o Mestre)
 */
const deleteNpc = async (req: Request, res: Response): Promise<void> => {
  try {
    const { npcId } = req.params;
    const userId = req.user!.id;

    const npc = await NPCModel.findById(npcId);
    if (!npc) {
      res.status(404).json({ message: 'NPC não encontrado.' });
      return;
    }
    
    const campaign = await CampaignModel.findById(npc.campaignId);
    if (!campaign || campaign.gameMaster.toString() !== userId) {
      res.status(403).json({ message: 'Acesso negado. Apenas o mestre pode deletar este NPC.' });
      return;
    }

    await NPCModel.findByIdAndDelete(npcId);

    await CampaignModel.findByIdAndUpdate(npc.campaignId, {
      $pull: { npcs: npcId },
    });

    res.status(200).json({ message: 'NPC deletado com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar o NPC.', error });
  }
};

export {
  createNpc,
  getNpcsForCampaign,
  getNpcById,
  updateNpc,
  deleteNpc,
};