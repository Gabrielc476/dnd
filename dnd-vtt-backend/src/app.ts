import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import campaignRoutes from './routes/campaignRoutes';
import npcRoutes from './routes/npcRoutes';
import encounterRoutes from './routes/encounterRoutes'; // <-- 1. IMPORTE AQUI

const app: Express = express();

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('API do D&D VTT está rodando com TypeScript!');
});

// Rotas
app.use('/api/users', userRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/npcs', npcRoutes);
app.use('/api/encounters', encounterRoutes); // <-- 2. ADICIONE AQUI

export default app;