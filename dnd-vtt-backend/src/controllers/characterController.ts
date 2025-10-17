import { Request, Response } from 'express';
import CharacterModel from '../models/CharacterModel'; //
import CampaignModel from '../models/CampaignModel'; //
import UserModel from '../models/UserModel'; //

// Importa os modelos que servirão como "plantas" para a criação
import RaceModel from '../models/RaceModel'; //
import BackgroundModel from '../models/BackgroundModel'; //
import ClassModel from '../models/ClassModel'; //
import SubraceModel from '../models/SubraceModel'; //

import { Types } from 'mongoose';

/**
 * @desc    Criar um novo personagem para uma campanha
 * @route   POST /api/characters
 * @access  Privado (Apenas o dono da campanha ou jogador)
 */
const createCharacter = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      campaignId,
      name,
      raceIndex,
      subraceIndex,
      classIndex,
      backgroundIndex,
      abilityScores,
      personality,
    } = req.body;

    const userId = req.user!.id;

    // 1. Validar se o usuário pode criar um personagem nesta campanha
    const campaign = await CampaignModel.findById(campaignId); //
    if (!campaign) {
      res.status(404).json({ message: 'Campanha não encontrada.' });
      return;
    }
    const isPlayer = campaign.players.some(p => p.toString() === userId); //
    const isGameMaster = campaign.gameMaster.toString() === userId; //
    if (!isPlayer && !isGameMaster) {
      res.status(403).json({ message: 'Acesso negado. Você não faz parte desta campanha.' });
      return;
    }

    // 2. Buscar as "plantas" das regras no banco de dados (usando .lean() para objetos simples)
    const raceData = await RaceModel.findOne({ index: raceIndex }).lean(); //
    const backgroundData = await BackgroundModel.findOne({ index: backgroundIndex }).lean(); //
    const classData = await ClassModel.findOne({ index: classIndex }).lean(); //

    if (!raceData || !backgroundData || !classData) {
        res.status(400).json({ message: 'Raça, classe ou antecedente inválido.' });
        return;
    }

    let subraceData: any = null;
    if (subraceIndex) {
        subraceData = await SubraceModel.findOne({ index: subraceIndex }).lean(); //
    }

    // 3. Lógica de Criação (Exemplo simplificado)
    const conMod = Math.floor((abilityScores.constitution - 10) / 2);
    const initialHP = classData.hit_die + conMod;

    const raceTraits = raceData.traits.map((t: any) => ({name: t.name, desc: t.desc, level_acquired: 1, source: `Raça: ${raceData.name}`})); // Adiciona source
    if (subraceData && subraceData.racial_traits) {
      subraceData.racial_traits.forEach((t: any) => raceTraits.push({name: t.name, desc: t.desc, level_acquired: 1, source: `Sub-Raça: ${subraceData.name}`}));
    }

    // Acessa class_levels que agora está embutido em ClassModel
    const level1Data = classData.class_levels.find((level: any) => level.level === 1);
    const level1Features = level1Data?.features.map((f: any) => ({...f, source: `Classe: ${classData.name} 1`})) || [];

    // 4. Criar o novo documento de personagem com os dados embutidos
    const newCharacter = await CharacterModel.create({ //
      userId,
      campaignId,
      name,
      level: 1,
      xp: 0,
      alignment: "True Neutral", // Placeholder

      race: { // Embutindo dados da Raça/Subraça
        name: raceData.name,
        subrace: subraceData?.name,
        ability_bonuses: subraceData ? [...raceData.ability_bonuses, ...subraceData.ability_bonuses] : raceData.ability_bonuses,
        traits: raceTraits, // Array de objetos com name e desc
      },

      background: { // Embutindo dados do Antecedente
        name: backgroundData.name,
        feature: backgroundData.feature, // Objeto com name e desc
        proficiencies: backgroundData.starting_proficiencies, // Array de strings
      },

      classes: [{ // Embutindo dados da Classe
        className: classData.name,
        classLevel: 1,
        hit_die: classData.hit_die,
        features: level1Features, // Array de objetos com name, desc, level
        subclass: null, // Subclasse geralmente escolhida depois
      }],

      stats: {
        armorClass: 10 + Math.floor((abilityScores.dexterity - 10) / 2),
        speed: raceData.speed,
        hitPoints: { max: initialHP, current: initialHP, temporary: 0 },
        hitDice: { total: `1d${classData.hit_die}`, available: 1 },
      },

      abilityScores: abilityScores,

      proficiencies: {
        proficiencyBonus: 2,
        savingThrows: classData.saving_throws, // Array de strings
        skills: [], // Frontend enviaria as perícias escolhidas
      },

      personality: personality,

      equipment: {
        inventory: [], // Lógica de equipamento inicial é complexa
        currency: { cp: 0, sp: 0, gp: 0, ep: 0, pp: 0 },
      },
    });

    // 5. Adicionar a referência do personagem à campanha e ao usuário
    await CampaignModel.findByIdAndUpdate(campaignId, { //
      $push: { characters: newCharacter._id as Types.ObjectId }
    });
    await UserModel.findByIdAndUpdate(userId, { //
      $push: { characters: newCharacter._id as Types.ObjectId }
    });

    res.status(201).json(newCharacter);
  } catch (error) {
    console.error("Erro detalhado:", error); // Log mais detalhado
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    res.status(500).json({ message: 'Erro ao criar o personagem.', error: errorMessage });
  }
};


/**
 * @desc    Buscar todos os personagens de uma campanha
 * @route   GET /api/characters/campaign/:campaignId
 * @access  Privado (Mestre e Jogadores)
 */
const getCharactersForCampaign = async (req: Request, res: Response): Promise<void> => {
  try {
    const { campaignId } = req.params;
    const userId = req.user!.id;

    const campaign = await CampaignModel.findById(campaignId); //
    if (!campaign) {
      res.status(404).json({ message: 'Campanha não encontrada.' });
      return;
    }

    const isMember = campaign.players.some(p => p.toString() === userId) || campaign.gameMaster.toString() === userId; //
    if (!isMember) {
      res.status(403).json({ message: 'Acesso negado a esta campanha.' });
      return;
    }

    const characters = await CharacterModel.find({ campaignId: campaignId }); //
    res.status(200).json(characters);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar personagens.', error });
  }
};

/**
 * @desc    Buscar um personagem específico pelo seu ID
 * @route   GET /api/characters/:characterId
 * @access  Privado (Mestre e Jogadores)
 */
const getCharacterById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { characterId } = req.params;
    const userId = req.user!.id;

    const character = await CharacterModel.findById(characterId); //
    if (!character) {
      res.status(404).json({ message: 'Personagem não encontrado.' });
      return;
    }

    // Verifica se o usuário pertence à campanha do personagem
    const campaign = await CampaignModel.findById(character.campaignId); //
    const isMember = campaign?.players.some(p => p.toString() === userId) || campaign?.gameMaster.toString() === userId; //

    if (!isMember) {
      res.status(403).json({ message: 'Acesso negado a este personagem.' });
      return;
    }

    res.status(200).json(character);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar personagem.', error });
  }
};

/**
 * @desc    Atualizar um personagem (genérico)
 * @route   PUT /api/characters/:characterId
 * @access  Privado (Dono do personagem ou Mestre)
 */
const updateCharacter = async (req: Request, res: Response): Promise<void> => {
    try {
        const { characterId } = req.params;
        const userId = req.user!.id;

        const character = await CharacterModel.findById(characterId); //
        if (!character) {
            res.status(404).json({ message: 'Personagem não encontrado.' });
            return;
        }

        // Verifica se o usuário é o dono ou o mestre da campanha
        const campaign = await CampaignModel.findById(character.campaignId); //
        const isOwner = character.userId.toString() === userId; //
        const isGameMaster = campaign?.gameMaster.toString() === userId; //

        if (!isOwner && !isGameMaster) {
            res.status(403).json({ message: 'Acesso negado. Você não pode editar este personagem.' });
            return;
        }

        // Atualiza o personagem com os dados enviados no corpo da requisição
        // $set garante que apenas os campos enviados sejam atualizados
        const updatedCharacter = await CharacterModel.findByIdAndUpdate( //
            characterId,
            { $set: req.body },
            { new: true, runValidators: true } // Retorna o documento atualizado e roda validações
        );

        res.status(200).json(updatedCharacter);

    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar o personagem.', error });
    }
};


/**
 * @desc    Deletar um personagem
 * @route   DELETE /api/characters/:characterId
 * @access  Privado (Dono do personagem ou Mestre)
 */
const deleteCharacter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { characterId } = req.params;
    const userId = req.user!.id;

    const character = await CharacterModel.findById(characterId); //
    if (!character) {
      res.status(404).json({ message: 'Personagem não encontrado.' });
      return;
    }

    // Verifica permissão (dono ou mestre)
    const campaign = await CampaignModel.findById(character.campaignId); //
    const isOwner = character.userId.toString() === userId; //
    const isGameMaster = campaign?.gameMaster.toString() === userId; //

    if (!isOwner && !isGameMaster) {
      res.status(403).json({ message: 'Acesso negado. Você não pode deletar este personagem.' });
      return;
    }

    // Deleta o personagem
    await CharacterModel.findByIdAndDelete(characterId); //

    // Remove referências (usando $pull)
    if (campaign) {
      await CampaignModel.findByIdAndUpdate(campaign._id, { //
        $pull: { characters: characterId as any },
      });
    }

    await UserModel.findByIdAndUpdate(character.userId, { //
      $pull: { characters: characterId as any },
    });

    res.status(200).json({ message: 'Personagem deletado com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar o personagem.', error });
  }
};

export {
  createCharacter,
  getCharactersForCampaign,
  getCharacterById,
  updateCharacter, // Função de update agora exportada
  deleteCharacter,
};