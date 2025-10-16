// src/app.ts
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import campaignRoutes from './routes/campaignRoutes'; // <-- 1. IMPORTE AQUI

const app: Express = express();

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('API do D&D VTT está rodando com TypeScript!');
});

// Rotas
app.use('/api/users', userRoutes);
app.use('/api/campaigns', campaignRoutes); // <-- 2. ADICIONE AQUI

export default app;