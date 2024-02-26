import axios from 'axios';
import db from '../db.js';

const { AMO_API_DOMAIN, AMO_SECRET, AMO_ID, AMO_REDIRECT_URI } = process.env;

class UtilsService {
  refreshTokens = async (refreshToken) => {
    try {
      const { data } = await axios.post(
        `${AMO_API_DOMAIN}/oauth2/access_token`,
        {
          client_id: AMO_ID,
          client_secret: AMO_SECRET,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          redirect_uri: AMO_REDIRECT_URI,
        }
      );

      await db.push('/auth/access_token', data.access_token);
      await db.push('/auth/refresh_token', data.refresh_token);
      return true;
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

export default new UtilsService();
