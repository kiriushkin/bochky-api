import express from 'express';
import visitControllers from './visit.controllers.js';

const router = express.Router();

router.post('/', visitControllers.sendVisit);

export default router;
