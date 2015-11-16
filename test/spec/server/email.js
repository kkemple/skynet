import chai from 'chai'
import nock from 'nock'

import { getServer, loadPlugins } from '../../../server'

chai.should()

const wolframResponse = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<queryresult success="false"></queryresult>'

describe('Hapi Server', () => {
  let server

  before((done) => {
    server = getServer('0.0.0.0', 8080)
    loadPlugins(server)
      .then(() => done())
      .catch((err) => done(err))
  })

  describe('Email Plugin', () => {
    describe('POST /mailgun/email', () => {
      beforeEach(() => {
        nock('https://api.api.ai')
          .post('/v1/query')
          .reply(200, {
            result: {
              speech: 'test',
              action: 'smalltalk.greetings',
              parameters: {},
            },
          })

        nock('http://api.wolframalpha.com')
          .get('/v2/query')
          .query(true)
          .reply(200, wolframResponse)

        nock('https://api.mailgun.net/v3')
          .post('/messages')
          .reply(200, {})
      })

      it('should return with a valid response', (done) => {
        server.inject({
          method: 'POST',
          url: '/mailgun/email',
          payload: {
            Body: '20% tip 66 dollars',
            To: 'test',
            From: 'test',
          },
        }, (res) => {
          res.payload.should.eq('ok')
          done()
        })
      })
    })
  })
})
