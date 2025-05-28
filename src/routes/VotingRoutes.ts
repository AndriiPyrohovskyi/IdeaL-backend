import { Router } from 'express';
import {
  createVoting,
  getAllVotings,
  getVotings,
  getUserVotings,
  getVotingById,
  deleteVoting,
  closeVoting
} from '../controllers/VotingController';
import { verifyAuthToken } from '../middleware/AuthMiddleware';

const router = Router();

router.get('/public', getVotings);
router.get('/user/:userId', getUserVotings);
router.get('/:id', getVotingById);
router.post('/', createVoting);

router.get('/', getAllVotings);

router.delete('/:id', deleteVoting);
router.put('/:id/close', closeVoting);

export default router;