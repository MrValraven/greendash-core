import { Router } from 'express';
import authenticationController from './modules/authentication/authenticationController';
import { validateBodyData } from './middlewares/validationMiddleware';
import {
    registerSchema,
    loginSchema,
} from './modules/authentication/authentication.schemas';

const router = Router();

router.post(
    '/auth/register',
    validateBodyData(registerSchema),
    authenticationController.registerUserAccount
);

router.post(
    '/auth/login',
    validateBodyData(loginSchema),
    authenticationController.loginUserAccount
);

router.get('/auth/logout', (req, res) => {
    res.send('About page');
});

export default router;
