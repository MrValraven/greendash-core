import { Router } from 'express';
import authenticationController from './modules/authentication/authentication.controller';
import { validateBodyData } from './middlewares/validationMiddleware';
import { verifyToken } from './middlewares/authMiddleware';
import {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  resetPasswordRequestSchema,
  editUserSchema,
} from './modules/authentication/authentication.schemas';

const router = Router();

const BASE_PATH = '/api/v1/auth';

// Authentication routes
router.post(
  `${BASE_PATH}/users/login`,
  validateBodyData(loginSchema),
  authenticationController.loginUserAccount,
);
router.post(`${BASE_PATH}/users/logout`, verifyToken, authenticationController.logoutUserAccount);
router.get(`${BASE_PATH}/tokens/refresh`, authenticationController.refreshAccessToken);

// User routes
router.post(
  `${BASE_PATH}/users/register`,
  validateBodyData(registerSchema),
  authenticationController.registerUserAccount,
);
router.put(
  `${BASE_PATH}/users`,
  verifyToken,
  validateBodyData(editUserSchema),
  authenticationController.editUserAccount,
);

// Password management
router.post(
  `${BASE_PATH}/users/password/reset-request`,
  validateBodyData(resetPasswordRequestSchema),
  authenticationController.requestPasswordReset,
);
router.post(
  `${BASE_PATH}/users/password/reset`,
  validateBodyData(resetPasswordSchema),
  authenticationController.resetPassword,
);

// Email verification
router.get(`${BASE_PATH}/users/email/verify`, authenticationController.verifyEmail);

export default router;
