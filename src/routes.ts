import { Router } from 'express';
import authenticationController from './modules/authentication/authenticationController';

const router = Router();

router.post('/auth/register', authenticationController.registerUserAccount);

router.post('/auth/login', authenticationController.loginUserAccount);

router.get('/auth/logout', (req, res) => {
    res.send('About page');
});

export default router;