import express from 'express';
import authRoutes from './auth/auth.routes.js';
import leadsRoutes from './leads/leads.routes.js';
import visitRoutes from './visit/visit.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/leads', leadsRoutes);
router.use('/visit', visitRoutes);

export default router;
