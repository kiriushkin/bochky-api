import leadsService from './leads.service.js';
import utilsService from '../../utils/utils.service.js';
import { logger } from '../../logger.js';

class LeadsControllers {
  sendLead = async (req, res) => {
    if (!req.body.name || !req.body.phone)
      return res.status(400).send('You must provide data.');

    try {
      let result = await leadsService.sendLead(req.body);

      if (result.status === 401) {
        await utilsService.refreshTokens(result.refreshToken);
        result = await leadsService.sendLead(req.body);

        if (result.status === 401) {
          logger.error('Server cannot authorize.');
          return res.status(500).send('Server cannot authorize.');
        }
      }

      if (result.status !== 'ok') return res.status(500).send(result);

      res.send(result);
    } catch (error) {
      console.error(error);

      res.status(500).send(error);
    }
  };
}

export default new LeadsControllers();
