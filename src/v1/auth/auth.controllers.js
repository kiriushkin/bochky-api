import authService from './auth.service.js';

class AuthControllers {
  getNewTokens = async (req, res) => {
    if (!req.body.code) return res.status(400).send('You must provide a code.');

    try {
      const result = await authService.getNewTokens(req.body.code);

      if (result.status !== 'ok') return res.status(500).send(result);

      res.send('Tokens have been revoked.');
    } catch (error) {
      console.error(error);

      return res.status(500).send(error);
    }
  };
}

export default new AuthControllers();
