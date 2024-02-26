import axios from 'axios';
import db from '../db.js';
import { DataError, DatabaseError } from 'node-json-db';

const { AMO_API_DOMAIN, AMO_SECRET, AMO_ID, AMO_REDIRECT_URI } = process.env;

class AuthService {
  getNewTokens = async (code) => {
    try {
      const { data } = await axios.post(
        `${AMO_API_DOMAIN}/oauth2/access_token`,
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
      return { status: 'ok' };
    } catch (error) {
      console.error(error);

      if (error instanceof DataError || error instanceof DatabaseError)
        return { status: 'DB Error', error };

      if (error.response)
        return { status: 'Axios Error', error: error.response.data };

      return { status: 'Unkown Error', error: error };
    }
  };
}

export default new AuthService();
