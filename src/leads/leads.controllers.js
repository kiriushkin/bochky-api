import leadsService from './leads.service.js';
import utilsService from '../utils/utils.service.js';

class LeadsControllers {
  sendLead = async (req, res) => {
    if (!req.body.name || !req.body.phone)
      return res.status(400).send('You must provide data.');

    try {
      let result = await leadsService.sendLead(req.body);

      if (result.status === 401) {
        await utilsService.refreshTokens(result.refreshToken);
        result = await leadsService.sendLead(req.body);

        if (result.status === 401)
          return res.status(500).send('Server cannot authorize.');
      }

      if (result.status === 500)
        return res.status(500).send('Something went wrong.');

      res.send(result);
    } catch (error) {
      console.error(error);
    }
  };
}

export default new LeadsControllers();
