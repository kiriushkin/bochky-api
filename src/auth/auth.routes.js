import express from 'express';
import authControllers from './auth.controllers.js';

const router = express.Router();

router.post('/get-new-tokens', authControllers.getNewTokens);

export default router;
