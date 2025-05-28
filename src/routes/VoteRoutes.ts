import { Router } from 'express';
import {
  vote,
  getVotingVotes,
  getAllVotes
} from '../controllers/VoteController';

const router = Router();

router.post('/', vote);

router.get('/voting/:voting_id', getVotingVotes);
router.get('/', getAllVotes); 

export default router;