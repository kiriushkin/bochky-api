import express from 'express';
import authRoutes from './auth/auth.routes.js';
import leadsRoutes from './leads/leads.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/leads', leadsRoutes);

export default router;
