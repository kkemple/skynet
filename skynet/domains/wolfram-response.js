import wolframAlpha from '../../wolfram-alpha'

export default (speech, params, resolvedQuery) => {
  return wolframAlpha(resolvedQuery)
    .then((response) => {
      if (speech !== '') response.speech = `${speech}\n${response.speech}`
      return response
    })
}
