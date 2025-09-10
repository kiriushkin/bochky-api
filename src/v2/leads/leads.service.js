import axios from 'axios';
import db from '../../db.js';
import { DataError, DatabaseError } from 'node-json-db';
import { logger } from '../../logger.js';

const {
  LOGS,
  AMO_API_DOMAIN,
  AMO_PIPELINE_ID,
  AMO_STATUS_ID,
  AMO_PHONE_FIELD_ID,
  V2_AMO_CONTACTS_DATE_FIELD_ID,
  AMO_SOURCE_FIELD_ID,
  AMO_LANDING_VALUE_ID,
  V2_AMO_LAND_SOURCE_FIELD_ID,
  V2_AMO_COMPLECT_FIELD_ID,
  V2_AMO_LOCATION_FIELD_ID,
  V2_AMO_EXPO_FIELD_ID,
  V2_AMO_FEEDBACK_TYPE_FIELD_ID,
  V2_AMO_CAMPAIGN_FIELD_ID,
  V2_AMO_TERM_FIELD_ID,
  V2_AMO_UTM_CONTENT_FIELD_ID,
  TELEGRAM_BOT_URL,
  TELEGRAM_CHAT_ID,
  TELEGRAM_MESSAGE_THREAD,
} = process.env;
class LeadsService {
  sendLead = async ({ telegram_message, ...props }) => {
    try {
      // await this.sendCRM(props);

      await this.sendTelegram(telegram_message);

      logger.info('Success', props);

      return { status: 'ok' };
    } catch (error) {
      logger.error(error.message, { meta: error });
      if (Boolean(LOGS)) {
        if (error.response) {
          console.log(error.response.data);
          console.log(error.response.data['validation-errors'][0].errors);
          console.log(error.response.status);
          // console.log(error.response.headers);
        }
      }

      if (error instanceof DataError || error instanceof DatabaseError) {
        logger.error('DB Error', { meta: error });
        return { status: 'DB Error', error: error };
      }

      if (error.response) {
        if (error.response.data?.status === 401) {
          return {
            status: 401,
            refreshToken: await db.getData('/auth/refresh_token'),
          };
        }

        return { status: 'Axios Error', error: error.response.data };
      }

      logger.error('Unknown Error', { meta: error });
      return { status: 'Unkown Error', error: error };
    }
  };

  sendCRM = async ({
    name,
    phone,
    source,
    expo,
    complect,
    location,
    feedback_type,
    utm_campaign,
    utm_term,
    utm_source,
    utm_content,
  }) => {
    logger.info('Getting token');
    const token = await db.getData('/auth/access_token');

    const { data: contactsData } = await axios.get(
      `${AMO_API_DOMAIN}/api/v4/contacts`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          query: phone,
        },
      }
    );

    let contactId;

    if (contactsData) contactId = contactsData._embedded.contacts[0].id;
    else {
      logger.info('Creating contact');
      const { data } = await axios.post(
        `${AMO_API_DOMAIN}/api/v4/contacts`,
        [
          {
            name,
            custom_fields_values: [
              {
                field_id: +AMO_PHONE_FIELD_ID,
                values: [
                  {
                    value: phone,
                  },
                ],
              },
              {
                field_id: +V2_AMO_CONTACTS_DATE_FIELD_ID,
                values: [
                  {
                    value: new Date().toISOString().split('.')[0] + 'Z',
                  },
                ],
              },
            ],
          },
        ],
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      contactId = data._embedded.contacts[0].id;
    }

    const leadData = [
      {
        status_id: +AMO_STATUS_ID,
        pipeline_id: +AMO_PIPELINE_ID,
        custom_fields_values: [
          // Lead Source
          {
            field_id: +AMO_SOURCE_FIELD_ID,
            values: [
              {
                enum_id: +AMO_LANDING_VALUE_ID,
              },
            ],
          },
          // Land Source
          {
            field_id: +V2_AMO_LAND_SOURCE_FIELD_ID,
            values: [
              {
                value: source,
              },
            ],
          },
          // Chosen Expo
          {
            field_id: +V2_AMO_EXPO_FIELD_ID,
            values: [
              {
                value: expo,
              },
            ],
          },
        ],
        _embedded: {
          contacts: [
            {
              id: contactId,
            },
          ],
        },
      },
    ];

    // Feedback type
    if (feedback_type) {
      leadData[0].custom_fields_values.push({
        field_id: +V2_AMO_FEEDBACK_TYPE_FIELD_ID,
        values: [
          {
            value: feedback_type,
          },
        ],
      });
    }

    // Complectation
    if (complect) {
      leadData[0].custom_fields_values.push({
        field_id: +V2_AMO_COMPLECT_FIELD_ID,
        values: [
          {
            value: complect,
          },
        ],
      });
    }

    // GeoLocation
    if (location) {
      leadData[0].custom_fields_values.push({
        field_id: +V2_AMO_LOCATION_FIELD_ID,
        values: [
          {
            value: location,
          },
        ],
      });
    }

    // utm_campaign
    if (utm_campaign) {
      leadData[0].custom_fields_values.push({
        field_id: +V2_AMO_CAMPAIGN_FIELD_ID,
        values: [
          {
            value: utm_campaign,
          },
        ],
      });
    }

    // utm_term
    if (utm_term) {
      leadData[0].custom_fields_values.push({
        field_id: +V2_AMO_TERM_FIELD_ID,
        values: [
          {
            value: utm_term,
          },
        ],
      });
    }

    // utm_content
    if (utm_content) {
      leadData[0].custom_fields_values.push({
        field_id: +V2_AMO_UTM_CONTENT_FIELD_ID,
        values: [
          {
            value: utm_content,
          },
        ],
      });
    }

    logger.info('Sending lead to the CRM');
    await axios.post(`${AMO_API_DOMAIN}/api/v4/leads`, leadData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  sendTelegram = async (telegram_message) => {
    logger.info('Sending lead to Telegram');
    telegram_message
      ? await axios.post(
          `${TELEGRAM_BOT_URL}/sendMessage`,
          {},
          {
            params: {
              chat_id: TELEGRAM_CHAT_ID,
              // message_thread_id: TELEGRAM_MESSAGE_THREAD,
              text: telegram_message,
              parse_mode: 'MarkdownV2',
            },
          }
        )
      : null;
  };
}

export default new LeadsService();
