import authService from './auth.service.js';

class AuthControllers {
  getNewTokens = async (req, res) => {
    if (!req.body.code) return res.status(400).send('You must provide a code.');

    try {
      const result = await authService.getNewTokens(req.body.code);

      if (!result) return res.status(500).send('Something went wrong.');

      res.send('Tokens have been revoked.');
    } catch (error) {
      console.error(error);
    }
  };
}

export default new AuthControllers();
