import express from 'express';
import leadsControllers from './leads.controllers.js';

const router = express.Router();

router.post('/', leadsControllers.sendLead);

export default router;
