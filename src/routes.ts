import { Router } from 'express';
import authenticationController from './modules/authentication/authenticationController';
import { validateBodyData } from './middlewares/validationMiddleware';
import { verifyToken } from './middlewares/authMiddleware';
import { registerSchema, loginSchema } from './modules/authentication/authentication.schemas';

const router = Router();

router.post(
  '/auth/register',
  validateBodyData(registerSchema),
  authenticationController.registerUserAccount,
);

router.post(
  '/auth/login',
  validateBodyData(loginSchema),
  authenticationController.loginUserAccount,
);

router.get('/auth/refresh', authenticationController.refreshAccessToken);

router.get('/auth/logout', verifyToken, authenticationController.logoutUserAccount);

export default router;
