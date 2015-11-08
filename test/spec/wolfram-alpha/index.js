import chai from 'chai'
import nock from 'nock'
import Promise from 'bluebird'

import wolframAlpha from '../../../wolfram-alpha'
import { wolframAlphaData } from '../../fixtures'

chai.should()

const wolframResponse = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<queryresult success="false"></queryresult>'

describe('Wolfram Alpha', () => {
  it('should be a function', () => {
    wolframAlpha.should.be.a('function')
  })

  it('should return a promise', (done) => {
    nock('http://api.wolframalpha.com')
      .get('/v2/query')
      .query(true)
      .reply(200, wolframResponse)

    wolframAlpha('artificial intelligence').should.be.instanceOf(Promise)
    done()
  })

  describe('when given a query it can resolve', () => {
    it('should parse out text and images from xml "Pods"', (done) => {
      nock('http://api.wolframalpha.com')
        .get('/v2/query')
        .query(true)
        .reply(200, wolframAlphaData)

      wolframAlpha('artificial intelligence')
        .then((response) => {
          response.speech.should.contain('Result')
          response.speech.should.contain('Test')
          response.images[0].should.eq('http://some.url/and/image/path.jpg')
          done()
        })
    })
  })

  describe('when given a query it can\'t resolve', () => {
    it('should return empty string and no images array', (done) => {
      nock('http://api.wolframalpha.com')
        .get('/v2/query')
        .query(true)
        .reply(200, wolframResponse)

      wolframAlpha('artificial intelligence')
        .then((response) => {
          response.speech.should.eq('')
          response.should.not.have.key('images')
          done()
        })
    })
  })
})
