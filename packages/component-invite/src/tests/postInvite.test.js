process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
process.env.SUPPRESS_NO_CONFIG_WARNING = true

const httpMocks = require('node-mocks-http')
const random = require('lodash/random')
const fixtures = require('./fixtures/fixtures')
const UserMock = require('./mocks/User')
const Chance = require('chance')
const TeamMock = require('./mocks/Team')

jest.mock('pubsweet-component-mail-service', () => ({
  setupInviteEmail: jest.fn(),
  setupAssignEmail: jest.fn(),
}))
const chance = new Chance()
const globalRoles = ['editorInChief', 'author', 'admin']
const manuscriptRoles = ['handlingEditor', 'reviewer']

const buildModels = (collection, findUser, emailUser) => {
  const models = {
    User: {},
    Collection: {
      find: jest.fn(
        () =>
          collection instanceof Error
            ? Promise.reject(collection)
            : Promise.resolve(collection),
      ),
    },
    Team: {},
  }
  UserMock.find = jest.fn(
    () =>
      findUser instanceof Error
        ? Promise.reject(findUser)
        : Promise.resolve(findUser),
  )
  UserMock.findByEmail = jest.fn(
    () =>
      emailUser instanceof Error
        ? Promise.reject(emailUser)
        : Promise.resolve(emailUser),
  )

  models.User = UserMock
  models.Team = TeamMock
  return models
}

const body = {
  email: chance.email(),
  role: globalRoles[random(0, globalRoles.length - 1)],
  firstName: chance.first(),
  lastName: chance.last(),
  title: 'professor',
  affiliation: 'MIT',
}
body.admin = body.role === 'admin'

const notFoundError = new Error()
notFoundError.name = 'NotFoundError'
notFoundError.status = 404

const { admin, editorInChief, handlingEditor, author } = fixtures.users
const { standardCollection } = fixtures.collections
const postInvitePath = '../routes/postInvite'
describe('Post invite route handler', () => {
  it('should return success when the admin invites a global role', async () => {
    const req = httpMocks.createRequest({
      body,
    })
    req.user = admin
    const res = httpMocks.createResponse()
    const models = buildModels(notFoundError, admin, notFoundError)
    await require(postInvitePath)(models)(req, res)

    expect(res.statusCode).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.roles[0]).toEqual(body.role)
    expect(data.firstName).toEqual(body.firstName)
    expect(data.email).toEqual(body.email)
    expect(data.admin).toEqual(body.admin)
  })
  it('should return an error when the admin invites an user on a collection', async () => {
    const req = httpMocks.createRequest({
      body,
    })
    req.user = admin
    req.params.collectionId = '123'
    const res = httpMocks.createResponse()
    const models = buildModels(notFoundError, admin)
    await require(postInvitePath)(models)(req, res)
    expect(res.statusCode).toBe(403)
    const data = JSON.parse(res._getData())
    expect(data.error).toEqual(
      `admin cannot invite an ${body.role} to a collection`,
    )
  })
  it('should return an error when the admin invites a manuscript role', async () => {
    body.role = manuscriptRoles[random(0, manuscriptRoles.length - 1)]
    body.admin = false
    const req = httpMocks.createRequest({
      body,
    })
    req.user = admin
    const res = httpMocks.createResponse()
    const models = buildModels(notFoundError, admin)
    await require(postInvitePath)(models)(req, res)
    expect(res.statusCode).toBe(403)
    const data = JSON.parse(res._getData())
    expect(data.error).toEqual(`admin cannot invite a ${body.role}`)
  })
  it('should return an error params are missing', async () => {
    delete body.email
    const req = httpMocks.createRequest({
      body,
    })
    req.user = admin
    const res = httpMocks.createResponse()
    const models = buildModels(notFoundError, admin)
    await require(postInvitePath)(models)(req, res)
    expect(res.statusCode).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.error).toEqual('Email and role are required')
    body.email = chance.email()
  })
  it('should return an error when the a non-admin invites a globalRole on a collection', async () => {
    body.role = globalRoles[random(0, globalRoles.length - 1)]
    body.admin = body.role === 'admin'
    const req = httpMocks.createRequest({
      body,
    })
    req.user = editorInChief
    req.params.collectionId = '123'
    const res = httpMocks.createResponse()
    const models = buildModels(notFoundError, editorInChief)
    await require(postInvitePath)(models)(req, res)
    expect(res.statusCode).toBe(403)
    const data = JSON.parse(res._getData())
    expect(data.error).toEqual(
      `${req.user.roles[0]} cannot invite a ${body.role}`,
    )
  })
  it('should return an error when an editorInChief invites a handlingEditor without a collection', async () => {
    body.role = 'handlingEditor'
    body.admin = false
    const req = httpMocks.createRequest({
      body,
    })
    req.user = editorInChief
    const res = httpMocks.createResponse()

    const models = buildModels(notFoundError, editorInChief)
    await require(postInvitePath)(models)(req, res)
    expect(res.statusCode).toBe(403)
    const data = JSON.parse(res._getData())
    expect(data.error).toEqual(
      `${req.user.roles} cannot invite a ${body.role} without a collection`,
    )
  })
  it('should return an error when an handlingEditor invites a reviewer without a collection', async () => {
    body.role = 'reviewer'
    body.admin = false
    const req = httpMocks.createRequest({
      body,
    })
    req.user = handlingEditor
    const res = httpMocks.createResponse()

    const models = buildModels(notFoundError, handlingEditor)
    await require(postInvitePath)(models)(req, res)
    expect(res.statusCode).toBe(403)
    const data = JSON.parse(res._getData())
    expect(data.error).toEqual(
      `${req.user.roles} cannot invite a ${body.role} without a collection`,
    )
  })
  it('should return an error when inviting an existing user', async () => {
    body.role = globalRoles[random(0, globalRoles.length - 1)]
    body.admin = body.role === 'admin'
    const req = httpMocks.createRequest({
      body,
    })
    req.user = admin
    const res = httpMocks.createResponse()
    const models = buildModels(notFoundError, admin, editorInChief)
    await require(postInvitePath)(models)(req, res)

    expect(res.statusCode).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.error).toEqual('User already exists')
  })
  it('should return success when the editor in chief invites a handlingEditor with a collection', async () => {
    const body = {
      email: author.email,
      role: 'handlingEditor',
    }
    const req = httpMocks.createRequest({
      body,
    })
    req.user = editorInChief
    req.params.collectionId = '123'
    const res = httpMocks.createResponse()
    const models = buildModels(standardCollection, editorInChief, author)
    await require(postInvitePath)(models)(req, res)

    expect(res.statusCode).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.roles).toContain(body.role)
    expect(data.email).toEqual(body.email)
    expect(data.assignations[0].collectionId).toEqual(req.params.collectionId)
  })
  it('should return success when the handlingEditor invites a reviewer with a collection', async () => {
    const body = {
      email: author.email,
      role: 'reviewer',
    }
    const req = httpMocks.createRequest({
      body,
    })
    req.user = handlingEditor
    req.params.collectionId = '123'
    const res = httpMocks.createResponse()
    const models = buildModels(standardCollection, handlingEditor, author)
    await require(postInvitePath)(models)(req, res)

    expect(res.statusCode).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.roles).toContain(body.role)
    expect(data.email).toEqual(body.email)
    expect(data.assignations[0].collectionId).toEqual(req.params.collectionId)
  })
})