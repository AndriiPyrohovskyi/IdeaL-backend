import { Router } from 'express';
import {
  createVoting,
  getAllVotings,
  getVotings,
  getVotingById,
  deleteVoting,
  closeVoting
} from '../controllers/VotingController';

const router = Router();

router.get('/public', getVotings);
router.get('/:id', getVotingById);
router.post('/', createVoting);

router.get('/', getAllVotings);

router.delete('/:id', deleteVoting);
router.put('/:id/close', closeVoting);

export default router;