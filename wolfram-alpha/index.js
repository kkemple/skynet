import each from 'lodash.foreach'
import flatten from 'lodash.flatten'
import map from 'lodash.map'
import Promise from 'bluebird'
import request from 'superagent'

import Archaeologist from '../archaeologist'
import logger from '../logger'

const wolframAlphaUrl = 'http://api.wolframalpha.com/v2/query'

const parseSubPod = (arc) => (subPod) => {
  const text = arc.find('plaintext[0]', subPod)
  const image = arc.find('img[0].$.src', subPod)

  return { text, image }
}

const parsePod = (arc) => (pod) => {
  const title = arc.find('$.title', pod)
  const subpods = arc.find('subpod', pod)
  const subdata = map(subpods, parseSubPod(arc))

  let text = ''
  const images = []

  each(subdata, (sub) => {
    text += (sub.text !== '') ? `${sub.text}\n---------\n` : ''
    images.push(sub.image)
  })

  if (text !== '') text = `${title}\n\n` + text + '\n'

  return { text, images }
}

const processRequest = (res, rej) => (err, response) => {
  if (err) return rej(err)

  const arc = new Archaeologist(response.text)
  arc.excavate()
    .then(() => {
      let speech = ''
      let images = []
      const success = arc.find('queryresult.$.success')

      if (!success) {
        res({ speech })
        return
      }

      const pods = arc.find('queryresult.pod')
      const dataSet = map(pods, parsePod(arc))

      speech = map(dataSet, (data) => data.text).join('')
      images = flatten(map(dataSet, (data) => data.images), true).reverse()

      logger.info({ speech, images }, 'wolfram alpha response')
      res({ speech, images })
    })
}

export default (query) => new Promise((res, rej) => {
  request
    .get(wolframAlphaUrl)
    .query({ input: query, appid: process.env.WOLFRAM_ALPHA_APP_ID })
    .end(processRequest(res, rej))
})
