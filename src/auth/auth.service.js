import axios from 'axios';
import db from '../db.js';

const { AMO_SECRET, AMO_ID, AMO_REDIRECT_URI } = process.env;

class AuthService {
  getNewTokens = async (code) => {
    try {
      const { data } = await axios.post(
        'https://bochky.amocrm.ru/oauth2/access_token',
        {
          client_id: AMO_ID,
          client_secret: AMO_SECRET,
          grant_type: 'authorization_code',
          code,
          redirect_uri: AMO_REDIRECT_URI,
        }
      );

      await db.push('/auth/access_token', data.access_token);
      await db.push('/auth/refresh_token', data.refresh_token);
      return true;
    } catch (error) {
      console.error(error);
    }
  };
}

export default new AuthService();
