import { Router } from 'express';
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  banUser,
  getCurrentUser
} from '../controllers/UserController';

const router = Router();

router.get('/me', getCurrentUser);
router.post('/', createUser);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/ban', banUser);

export default router;