import Promise from 'bluebird'
import reduce from 'lodash.reduce'
import { parseString } from 'xml2js'
import { parseNumbers, parseBooleans } from 'xml2js/lib/processors'

const artifactReducer = (memo, val) => {
  if (!memo) return undefined
  return memo[val]
}

const parseEmpty = (str) => {
  if (str === '') return undefined
  return str
}

export default class Archaeologist {
  constructor(xml) {
    this.xml = xml
  }

  excavate() {
    return new Promise((res, rej) => {
      parseString(this.xml, {
        trim: true,
        explicitArray: true,
        attrValueProcessors: [parseEmpty, parseNumbers, parseBooleans],
        valueProcessors: [parseEmpty, parseNumbers, parseBooleans],
      }, (err, result) => {
        if (err) {
          rej(err)
          return
        }

        this.json = result
        res(this.json)
      })
    })
  }

  find(artifact, source) {
    const scrubbedArtifact = artifact
      .replace(/\[(\w+)\]/g, '.$1')
      .replace(/^\./, '')
      .replace(/\.$/, '')

    return reduce(
      scrubbedArtifact.split('.'),
      artifactReducer,
      source || this.json
    )
  }
}
