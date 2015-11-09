import models from '../../../models'
import verifyUser from '../../verify-user'
import verifyToken from '../../verify-token'
import {
  authenticationPayload,
  headers,
  userPostPayload,
  userParams,
} from '../../../validations'

const { User } = models

const deleteUser = (token) => {
  return new User({ id: token.id, email: token.email })
    .destroy()
}

const patchUser = (token, payload) => {
  return new User({ id: token.id, email: token.email })
    .save(payload, { patch: true })
}

const putUser = (token, payload) => {
  return new User({ id: token.id, email: token.email })
    .save(payload)
}

export const register = (server, options, next) => {
  server.route([
    {
      method: 'POST',
      path: '/api/authenticate',
      config: {
        validate: {
          payload: authenticationPayload,
        },
        handler(req, reply) {
          User.authenticate(req.payload.email, req.payload.password)
            .then((token) => reply({
              success: true,
              payload: { token },
              timestamp: Date.now(),
            }))
            .catch((err) => reply({
              success: false,
              error: err.name,
              message: err.message,
              stack: err.stack,
              timestamp: Date.now(),
            }))
        },
      },
    },
    {
      method: 'GET',
      path: '/api/users/{id}',
      config: {
        validate: {
          headers: headers,
          params: userParams,
        },
        handler(req, reply) {
          verifyToken(req.headers['x-access-token'])
            .then((token) => verifyUser(req.params.id, token))
            .then((token) => User.profile(token.id, token.email))
            .then((user) => reply({
              success: true,
              payload: { user },
              timestamp: Date.now(),
            }))
            .catch((err) => reply({
              success: false,
              error: err.name,
              message: err.message,
              stack: err.stack,
              timestamp: Date.now(),
            }))
        },
      },
    },
    {
      method: 'POST',
      path: '/api/users',
      config: {
        validate: {
          payload: userPostPayload,
        },
        handler(req, reply) {
          User.forge(req.payload)
            .save()
            .then((user) => User.profile(user.get('id'), user.get('email')))
            .then((user) => reply({
              success: true,
              payload: { user },
              timestamp: Date.now(),
            }))
            .catch((err) => reply({
              success: false,
              error: err.name,
              message: err.message,
              stack: err.stack,
              timestamp: Date.now(),
            }))
        },
      },
    },
    {
      method: 'PATCH',
      path: '/api/users/{id}',
      config: {
        validate: {
          headers: headers,
          params: userParams,
        },
        handler(req, reply) {
          verifyToken(req.headers['x-access-token'])
            .then((token) => verifyUser(req.params.id, token))
            .then((token) => patchUser(token, req.payload))
            .then((user) => User.profile(user.get('id'), user.get('email')))
            .then((user) => reply({
              success: true,
              payload: { user },
              timestamp: Date.now(),
            }))
            .catch((err) => reply({
              success: false,
              error: err.name,
              message: err.message,
              stack: err.stack,
              timestamp: Date.now(),
            }))
        },
      },
    },
    {
      method: 'PUT',
      path: '/api/users/{id}',
      config: {
        validate: {
          headers: headers,
          params: userParams,
        },
        handler(req, reply) {
          verifyToken(req.headers['x-access-token'])
            .then((token) => verifyUser(req.params.id, token))
            .then((token) => putUser(token, req.payload))
            .then((user) => User.profile(user.get('id'), user.get('email')))
            .then((user) => reply({
              success: true,
              payload: { user },
              timestamp: Date.now(),
            }))
            .catch((err) => reply({
              success: false,
              error: err.name,
              message: err.message,
              stack: err.stack,
              timestamp: Date.now(),
            }))
        },
      },
    },
    {
      method: 'DELETE',
      path: '/api/users/{id}',
      config: {
        validate: {
          headers: headers,
          params: userParams,
        },
        handler(req, reply) {
          verifyToken(req.headers['x-access-token'])
            .then((token) => verifyUser(req.params.id, token))
            .then((token) => deleteUser(token))
            .then(() => reply({
              success: true,
              timestamp: Date.now(),
            }))
            .catch((err) => reply({
              success: false,
              error: err.name,
              message: err.message,
              stack: err.stack,
              timestamp: Date.now(),
            }))
        },
      },
    },
  ])

  next()
}

register.attributes = {
  name: 'api.users',
  version: '1.0.0',
}
