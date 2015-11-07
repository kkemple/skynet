import twilioFactory from 'twilio'

import skynet from '../../../skynet'
import logger from '../../../logger'

const twilio = twilioFactory(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

const method = 'POST'
const path = '/twilio/sms'
const handler = (request, reply) => {
  skynet(request.payload.Body)
    .then((response) => {
      const messageConfig = {
        to: request.payload.From,
        from: request.payload.To,
      }

      if (response.speech.length > 1600) {
        messageConfig.body = response.speech.substring(0, 1597) + '...'
      } else {
        messageConfig.body = response.speech
      }

      if (response.images) messageConfig.mediaUrl = response.images.slice(0, 10)

      twilio.messages.create(messageConfig, (err) => {
        if (err) {
          logger.error(err)
          return
        }
      })

      reply('ok')
    })
}

export const register = (server, options, next) => {
  server.route({ method, path, handler })
  next()
}

register.attributes = {
  name: 'twilio',
  version: '1.0.0',
}
