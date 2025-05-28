import { Router } from 'express';
import {
  vote,
  getVotingVotes,
  getAllVotes,
  getUserVotes
} from '../controllers/VoteController';
import { verifyAuthToken } from '../middleware/AuthMiddleware';

const router = Router();

router.post('/', vote);
router.get('/voting/:voting_id', getVotingVotes);
router.get('/user/:userId', getUserVotes);

router.get('/', getAllVotes);

export default router;