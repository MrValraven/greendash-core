import { Router } from 'express';
import { BASE_CORE_API_PATH } from './constants/app.constants';
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
import aiController from './modules/ai/ai.controller';

const router = Router();

// Authentication routes
router.post(
  `${BASE_CORE_API_PATH}/users/login`,
  validateBodyData(loginSchema),
  authenticationController.loginUserAccount,
);
router.get(
  `${BASE_CORE_API_PATH}/users/logout`,
  verifyToken,
  authenticationController.logoutUserAccount,
);
router.get(`${BASE_CORE_API_PATH}/tokens/refresh`, authenticationController.refreshAccessToken);

// User routes
router.get(
  `${BASE_CORE_API_PATH}/users/me`,
  verifyToken,
  authenticationController.getCurrentUserData,
);
router.post(
  `${BASE_CORE_API_PATH}/users/register`,
  validateBodyData(registerSchema),
  authenticationController.registerUserAccount,
);
router.put(
  `${BASE_CORE_API_PATH}/users`,
  verifyToken,
  validateBodyData(editUserSchema),
  authenticationController.editUserAccount,
);

// Password management
router.post(
  `${BASE_CORE_API_PATH}/users/password/reset-request`,
  validateBodyData(resetPasswordRequestSchema),
  authenticationController.requestPasswordReset,
);
router.post(
  `${BASE_CORE_API_PATH}/users/password/reset`,
  validateBodyData(resetPasswordSchema),
  authenticationController.resetPassword,
);

// Email verification
router.get(`${BASE_CORE_API_PATH}/users/email/verify`, authenticationController.verifyEmail);

// Email verification
router.post(`${BASE_CORE_API_PATH}/ai/build`, aiController.buildAiResponse);

export default router;
