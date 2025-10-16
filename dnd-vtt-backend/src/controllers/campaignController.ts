import { Request, Response } from 'express';
import CampaignModel from '../models/CampaignModel';
import UserModel, { IUser } from '../models/UserModel';
import NPCModel, { INPC } from '../models/NPCModel';
import EncounterModel, { IEncounter } from '../models/EncounterModel';

const generateInviteCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const createCampaign = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    const gameMasterId = req.user!.id; 

    if (!name || !description) {
      res.status(400).json({ message: 'Nome e descrição são obrigatórios.' });
      return;
    }

    const newCampaign = await CampaignModel.create({
      name,
      description,
      gameMaster: gameMasterId,
      inviteCode: generateInviteCode(),
    });

    await UserModel.findByIdAndUpdate(gameMasterId, {
      $addToSet: { campaignsAsGM: newCampaign._id },
    });

    res.status(201).json(newCampaign);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar a campanha.', error });
  }
};

const getCampaignsForUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const campaigns = await CampaignModel.find({
      $or: [{ gameMaster: userId }, { players: userId }],
    }).populate('gameMaster', 'username');

    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar as campanhas.', error });
  }
};

const getCampaignById = async (req: Request, res: Response): Promise<void> => {
  try {
    const campaignId = req.params.id;
    const userId = req.user!.id;

    // A query com .populate()
    const campaign = await CampaignModel.findById(campaignId)
      .populate<{ gameMaster: IUser; players: IUser[] }>('gameMaster', 'username email')
      .populate<{ players: IUser[] }>('players', 'username email')
      .populate('npcs')
      .populate('encounters');

    if (!campaign) {
      res.status(404).json({ message: 'Campanha não encontrada.' });
      return;
    }

    // CORREÇÃO: Com a interface do modelo correta, o TypeScript agora entende os tipos.
    // Nenhuma asserção de tipo como '(as IUser)' é mais necessária.
    const isPlayer = campaign.players.some(player => player._id.toString() === userId);
    const isGameMaster = campaign.gameMaster._id.toString() === userId;

    if (!isPlayer && !isGameMaster) {
      res.status(403).json({ message: 'Acesso negado a esta campanha.' });
      return;
    }

    res.status(200).json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar a campanha.', error });
  }
};

const updateCampaignDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const campaignId = req.params.id;
    const userId = req.user!.id;

    const campaign = await CampaignModel.findById(campaignId);

    if (!campaign) {
      res.status(404).json({ message: 'Campanha não encontrada.' });
      return;
    }

    if (campaign.gameMaster.toString() !== userId) {
      res.status(403).json({ message: 'Acesso negado. Apenas o mestre pode editar.' });
      return;
    }
    
    const { name, description, coverImageUrl, status, nextSessionDate } = req.body;
    const updateData = { name, description, coverImageUrl, status, nextSessionDate };

    const updatedCampaign = await CampaignModel.findByIdAndUpdate(campaignId, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedCampaign);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar a campanha.', error });
  }
};

const deleteCampaign = async (req: Request, res: Response): Promise<void> => {
    try {
        const campaignId = req.params.id;
        const userId = req.user!.id;

        const campaign = await CampaignModel.findById(campaignId);

        if (!campaign) {
            res.status(404).json({ message: 'Campanha não encontrada.' });
            return;
        }

        if (campaign.gameMaster.toString() !== userId) {
            res.status(403).json({ message: 'Acesso negado. Apenas o mestre pode deletar a campanha.' });
            return;
        }

        await NPCModel.deleteMany({ campaignId: campaignId });
        await EncounterModel.deleteMany({ campaignId: campaignId });

        await UserModel.updateMany(
            { _id: { $in: campaign.players } },
            { $pull: { campaignsAsPlayer: campaignId } }
        );

        await UserModel.findByIdAndUpdate(userId, { $pull: { campaignsAsGM: campaignId } });

        await CampaignModel.findByIdAndDelete(campaignId);

        res.status(200).json({ message: 'Campanha e todos os dados associados foram deletados com sucesso.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar a campanha.', error });
    }
};

const joinCampaign = async (req: Request, res: Response): Promise<void> => {
  try {
    const { inviteCode } = req.body;
    const userId = req.user!.id;

    if (!inviteCode) {
      res.status(400).json({ message: 'Código de convite é obrigatório.' });
      return;
    }

    const campaign = await CampaignModel.findOne({ inviteCode });

    if (!campaign) {
      res.status(404).json({ message: 'Campanha não encontrada com este código.' });
      return;
    }

    if (campaign.gameMaster.toString() === userId || campaign.players.some(p => p.toString() === userId)) {
        res.status(400).json({ message: 'Você já faz parte desta campanha.' });
        return;
    }

    campaign.players.push(userId as any);
    await campaign.save();

    await UserModel.findByIdAndUpdate(userId, {
        $addToSet: { campaignsAsPlayer: campaign._id }
    });

    res.status(200).json({ message: 'Você entrou na campanha com sucesso!', campaign });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao entrar na campanha.', error });
  }
};


export {
  createCampaign,
  getCampaignsForUser,
  getCampaignById,
  updateCampaignDetails,
  deleteCampaign,
  joinCampaign,
};