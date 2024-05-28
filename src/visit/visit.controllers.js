import visitService from './visit.service.js';
import utilsService from '../utils/utils.service.js';

class VisitControllers {
  sendVisit = async (req, res) => {
    if (!req.body.text) return res.status(400).send('You must provide data.');

    try {
      let result = await visitService.sendVisit(req.body);

      if (result.status === 401) {
        await utilsService.refreshTokens(result.refreshToken);
        result = await visitService.sendVisit(req.body);

        if (result.status === 401)
          return res.status(500).send('Server cannot authorize.');
      }

      if (result.status !== 'ok') return res.status(500).send(result);

      res.send(result);
    } catch (error) {
      console.error(error);

      res.status(500).send(error);
    }
  };
}

export default new VisitControllers();
