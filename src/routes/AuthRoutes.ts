import { Router } from 'express';
import { 
  register, 
  login,
  loginByUsername,
  loginWithCustomToken,
  verifyToken, 
  deleteAccount,
  createTestToken
} from '../controllers/AuthController';
import { verifyAuthToken } from '../middleware/AuthMiddleware';

const router = Router();
router.post('/register', register);
router.post('/login', login);                       
router.post('/login-username', loginByUsername);    
router.post('/login-custom', loginWithCustomToken); 
router.post('/verify', verifyToken);
router.post('/test-token', createTestToken);
router.delete('/delete/:uid', verifyAuthToken, deleteAccount);

export default router;