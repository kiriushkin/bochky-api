import axios from 'axios';
import db from '../../db.js';
import { DataError, DatabaseError } from 'node-json-db';

const { TELEGRAM_BOT_URL, TELEGRAM_CHAT_ID, TELEGRAM_MESSAGE_THREAD } =
  process.env;
class VisitService {
  sendVisit = async ({ text }) => {
    try {
      await axios.post(
        `${TELEGRAM_BOT_URL}/sendMessage`,
        {},
        {
          params: {
            chat_id: TELEGRAM_CHAT_ID,
            message_thread_id: TELEGRAM_MESSAGE_THREAD,
            text,
            parse_mode: 'HTML',
          },
        }
      );

      return { status: 'ok' };
    } catch (error) {
      console.error(error.message);

      if (error instanceof DataError || error instanceof DatabaseError)
        return { status: 'DB Error', error: error };

      if (error.response) {
        if (error.response.data?.status === 401) {
          return {
            status: 401,
            refreshToken: await db.getData('/auth/refresh_token'),
          };
        }

        return { status: 'Axios Error', error: error.response.data };
      }

      return { status: 'Unkown Error', error: error };
    }
  };
}

export default new VisitService();
