import chai from 'chai'
import Promise from 'bluebird'

import Archaeologist from '../../../archaeologist'
import { wolframAlphaData } from '../fixtures'

chai.should()

describe('Archaeologist', () => {
  let archaeologist

  beforeEach(() => {
    archaeologist = new Archaeologist(wolframAlphaData)
  })

  describe('#constructor', () => {
    it('should assign an xml prop with passed in string', () => {
      archaeologist.xml.should.eq(wolframAlphaData)
    })
  })

  describe('#excavate', () => {
    it('should return a promise', () => {
      archaeologist.excavate().should.be.instanceOf(Promise)
    })

    it('should resolve with parsed json', (done) => {
      archaeologist.excavate()
        .then((json) => {
          json.should.be.an('object')
          json.should.have.key('queryresult')
          done()
        })
    })

    it('should assign a json property with parsed json', (done) => {
      archaeologist.excavate()
        .then((json) => {
          json.should.eq(archaeologist.json)
          done()
        })
    })
  })

  describe('#find', () => {
    it('should traverse internal json to get value at specified path', (done) => {
      archaeologist.excavate()
        .then(() => {
          const pod = archaeologist.find('queryresult.pod')
          pod.should.be.an('array')
          done()
        })
    })

    it('should fail soft if path fails', (done) => {
      archaeologist.excavate()
        .then(() => {
          try {
            archaeologist.find('invalid.path')
          } catch (err) {
            done(err)
          }

          done()
        })
    })

    it('should use different source if one is provided', (done) => {
      archaeologist.excavate()
        .then(() => {
          const pod = archaeologist.find('pod', { pod: 'test' })
          pod.should.be.a('string')
          pod.should.eq('test')
          done()
        })
    })
  })
})
