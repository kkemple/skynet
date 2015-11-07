import each from 'lodash.foreach'
import flatten from 'lodash.flatten'
import map from 'lodash.map'
import Promise from 'bluebird'
import request from 'superagent'

import Archaeologist from './archaeologist'

const wolframAlphaUrl = 'http://api.wolframalpha.com/v2/query'

const parseSubPod = (arc) => (subPod) => {
  const plaintext = arc.analyze('plaintext[0]', subPod)
  const image = arc.analyze('img[0].$.src', subPod)
  console.log(arc.analyze('img[0].$', subPod))

  return {
    plaintext,
    image: image,
  }
}

const parsePod = (arc) => (pod) => {
  const title = arc.analyze('$.title', pod)
  const subpods = arc.analyze('subpod', pod)
  const subdata = map(subpods, parseSubPod(arc))

  let text = `${title}\n`
  const images = []

  each(subdata, (sub) => {
    text += `${sub.plaintext}\n---------\n`
    images.push(sub.image)
  })

  text += '\n'

  return { text, images }
}

const processRequest = (res, rej) => (err, response) => {
  if (err) return rej(err)

  const arc = new Archaeologist(response.text)
  arc.excavate()
    .then(() => {
      let speech = ''
      let images = []
      const success = arc.analyze('queryresult.$.success')

      if (!success) {
        res({ speech })
        return
      }

      const pods = arc.analyze('queryresult.pod')
      const dataSet = map(pods, parsePod(arc))

      speech = map(dataSet, (data) => data.text).join('')
      images = flatten(map(dataSet, (data) => data.images), true).reverse()
      res({ speech, images })
    })
}

export default (query) => new Promise((res, rej) => {
  request
    .get(wolframAlphaUrl)
    .query({ input: query, appid: process.env.WOLFRAM_ALPHA_APP_ID })
    .end(processRequest(res, rej))
})
