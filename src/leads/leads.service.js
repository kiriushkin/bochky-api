import axios from 'axios';
import db from '../db.js';

const {
  AMO_API_DOMAIN,
  AMO_PIPELINE_ID,
  AMO_STATUS_ID,
  AMO_PHONE_FIELD_ID,
  AMO_SOURCE_FIELD_ID,
  AMO_LANDING_VALUE_ID,
  AMO_QUIZ_ANSWERS_ID,
  AMO_FEEDBACK_TYPE_FIELD_ID,
  AMO_FEEDBACK_TELEGRAM_ID,
  AMO_FEEDBACK_WHATSAPP_ID,
  AMO_FEEDBACK_CALLBACK_ID,
  AMO_CALLBACK_TIME_FIELD_ID,
  AMO_UTM_CAMPAIGN_FIELD_ID,
  AMO_UTM_TERM_FIELD_ID,
} = process.env;
class LeadsService {
  sendLead = async ({
    name,
    phone,
    answers,
    feedback_type,
    callback_time,
    utm_campaign,
    utm_term,
  }) => {
    try {
      const token = await db.getData('/auth/access_token');

      const feedbackId =
        feedback_type === 'Telegram'
          ? +AMO_FEEDBACK_TELEGRAM_ID
          : feedback_type === `What'sApp`
          ? +AMO_FEEDBACK_WHATSAPP_ID
          : feedback_type === 'Звонок'
          ? +AMO_FEEDBACK_CALLBACK_ID
          : null;

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
            // Quiz answers
            {
              field_id: +AMO_QUIZ_ANSWERS_ID,
              values: [
                {
                  value: answers,
                },
              ],
            },
            // Feedback type
            {
              field_id: +AMO_FEEDBACK_TYPE_FIELD_ID,
              values: [
                {
                  enum_id: feedbackId,
                },
              ],
            },
            // utm_campaign
            {
              field_id: +AMO_UTM_CAMPAIGN_FIELD_ID,
              values: [
                {
                  value: utm_campaign,
                },
              ],
            },
            // utm_term
            {
              field_id: +AMO_UTM_TERM_FIELD_ID,
              values: [
                {
                  value: utm_term,
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

      if (callback_time)
        leadData[0].custom_fields_values.push({
          field_id: +AMO_CALLBACK_TIME_FIELD_ID,
          values: [
            {
              value: callback_time,
            },
          ],
        });

      const { data: leadsData } = await axios.post(
        `${AMO_API_DOMAIN}/api/v4/leads`,
        leadData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return { data: leadsData, status: 'ok' };
    } catch (error) {
      console.error(error.message);
      console.error(error?.response?.data['validation-errors'][0].errors);

      if (error?.response?.data?.status === 401) {
        return {
          status: 401,
          refreshToken: await db.getData('/auth/refresh_token'),
        };
      }

      return { status: 500 };
    }
  };
}

export default new LeadsService();
