import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import './src/services/firebase';
import userRoutes from './src/routes/UserRoutes';
import authRoutes from './src/routes/AuthRoutes';
import votingRoutes from './src/routes/VotingRoutes';
import voteRoutes from './src/routes/VoteRoutes';
import { verifyAuthToken } from './src/middleware/AuthMiddleware';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Server is running!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', verifyAuthToken, userRoutes);
app.use('/api/votings', verifyAuthToken, votingRoutes);
app.use('/api/votes', verifyAuthToken, voteRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});