import express from 'express';
import authRoutes from './v1/auth/auth.routes.js';
import leadsRoutes from './v1/leads/leads.routes.js';
import visitRoutes from './v1/visit/visit.routes.js';

import v2leadsRoutes from './v2/leads/leads.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/leads', leadsRoutes);
router.use('/visit', visitRoutes);

router.use('/v2/leads', v2leadsRoutes);

export default router;
