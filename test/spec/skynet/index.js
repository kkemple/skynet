import chai from 'chai'
import nock from 'nock'
import Promise from 'bluebird'

import skynet from '../../../skynet'

chai.should()

describe('Skynet', () => {
  it('should be a function', () => {
    skynet.should.be.a('function')
  })

  it('should return a Promise', () => {
    nock('https://api.api.ai')
      .post('/v1/query')
      .reply(200, {
        result: {
          speech: 'test',
          action: 'smalltalk.greetings',
          parameters: {},
        },
      })

    skynet('test').should.be.instanceOf(Promise)
  })

  describe('when called with an understood command', () => {
    it('should return a response object', (done) => {
      nock('https://api.api.ai')
        .post('/v1/query')
        .reply(200, {
          result: {
            speech: 'test',
            action: 'smalltalk.greetings',
            parameters: {},
          },
        })

      skynet('hey there')
        .then((config) => {
          config.should.be.an('object')
          config.speech.should.be.a('string')
          done()
        })
        .catch(done)
    })
  })

  describe('when called with an unknown command', () => {
    it('should return a CommanderActionNotFoundError', (done) => {
      nock('https://api.api.ai')
        .post('/v1/query')
        .reply(200, {
          result: {
            speech: 'test',
            action: 'unknown.command',
            parameters: {},
          },
        })

      skynet('hey there')
        .catch((err) => {
          err.name.should.eq('CommanderActionNotFoundError')
          done()
        })
    })
  })
})
