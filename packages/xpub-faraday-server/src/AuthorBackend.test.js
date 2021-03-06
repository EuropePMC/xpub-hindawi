process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
process.env.SUPPRESS_NO_CONFIG_WARNING = true

const bodyParser = require('body-parser')
const supertest = require('supertest')
const component = require('..')
const express = require('express')
const fixtures = require('./fixtures/fixtures')
const passport = require('passport')
const BearerStrategy = require('passport-http-bearer').Strategy
const cloneDeep = require('lodash/cloneDeep')
const UserMock = require('./mocks/User')
const Fragment = require('./mocks/Fragment')

function makeApp(collection, fragment, standardUser, existingUser) {
  const app = express()
  app.use(bodyParser.json())

  app.use(passport.initialize())
  passport.use(
    'bearer',
    new BearerStrategy((token, done) =>
      done(null, fixtures.users.standardUser, { scope: 'all' }),
    ),
  )
  app.locals.passport = passport
  app.locals.models = {
    Fragment: {
      find: jest.fn(
        () =>
          fragment instanceof Error
            ? Promise.reject(fragment)
            : Promise.resolve(fragment),
      ),
    },
    User: {},
    Collection: {
      find: jest.fn(
        () =>
          collection instanceof Error
            ? Promise.reject(collection)
            : Promise.resolve(collection),
      ),
    },
  }

  UserMock.find = jest.fn(
    () =>
      standardUser instanceof Error
        ? Promise.reject(standardUser)
        : Promise.resolve(standardUser),
  )
  UserMock.findByEmail = jest.fn(
    () =>
      existingUser instanceof Error
        ? Promise.reject(existingUser)
        : Promise.resolve(existingUser),
  )

  app.locals.models.User = UserMock

  component.backend()(app)
  return supertest(app)
}

const createAuthorUrl = '/api/collections/123/fragments/123/authors'
const getNewFragment = authors => {
  const fragProps = {
    type: 'fragment',
    fragmentType: 'blogpost',
    title: 'Just your regular blogpost',
    source: '<blog></blog>',
    presentation: '<p></p>',
    authors,
    owners: [],
  }
  return new Fragment(fragProps)
}
describe('Author Backend API', () => {
  let testFixtures = {}
  beforeEach(() => (testFixtures = cloneDeep(fixtures)))

  it('should return an error if fragment is not found', () => {
    const error = new Error()
    error.name = 'NotFoundError'
    error.status = 404
    return makeApp(testFixtures.collections.standardCollection, error)
      .post(createAuthorUrl)
      .set('Authorization', 'Bearer 123')
      .send(testFixtures.authors.standardAuthor)
      .expect(404, '{"error":"Object not found"}')
  })

  it('should return an error if collection is not found', () => {
    const error = new Error()
    error.name = 'NotFoundError'
    error.status = 404
    return makeApp(error)
      .post(createAuthorUrl)
      .set('Authorization', 'Bearer 123')
      .send(testFixtures.authors.standardAuthor)
      .expect(404, '{"error":"Object not found"}')
  })

  it('should return an error if an author field is invalid', () => {
    const error = new Error()
    error.name = 'ValidationError'
    error.status = 404
    error.details = []
    error.details.push({ message: 'firstName is required' })
    return makeApp(testFixtures.collections.standardCollection, error)
      .post(createAuthorUrl)
      .set('Authorization', 'Bearer 123')
      .send(testFixtures.authors.invalidAuthor)
      .expect(404, '{"error":"firstName is required"}')
  })

  it('should return an error if an author already exists with the same email', () => {
    const fragment = getNewFragment([testFixtures.authors.standardAuthor])
    return makeApp(testFixtures.collections.standardCollection, fragment)
      .post(createAuthorUrl)
      .set('Authorization', 'Bearer 123')
      .send(testFixtures.authors.standardAuthor)
      .expect(400, '{"error":"Author with the same email already exists"}')
  })

  it('should return an error if there already is a submitting author', () => {
    const fragment = getNewFragment([testFixtures.authors.standardAuthor])
    return makeApp(testFixtures.collections.standardCollection, fragment)
      .post(createAuthorUrl)
      .set('Authorization', 'Bearer 123')
      .send(testFixtures.authors.newSubmittingAuthor)
      .expect(400, '{"error":"There can only be one sumbitting author"}')
  })

  it('should return success when saving a new author', () => {
    const fragment = getNewFragment([])

    return makeApp(
      fixtures.collections.standardCollection,
      fragment,
      testFixtures.users.standardUser,
    )
      .post(createAuthorUrl)
      .set('Authorization', 'Bearer 123')
      .send(testFixtures.authors.newAuthor)
      .expect(200)
      .then(() => expect(fragment.save).toHaveBeenCalled())
  })

  it('should return success when the admin adds a submitting author and the author already has a corresponding user account', () => {
    const fragment = getNewFragment([])

    return makeApp(
      testFixtures.collections.standardCollection,
      fragment,
      testFixtures.users.admin,
      testFixtures.users.existingUser,
    )
      .post(createAuthorUrl)
      .set('Authorization', 'Bearer 123')
      .send(testFixtures.authors.standardAuthor)
      .expect(200)
      .then(() => {
        expect(fragment.save).toHaveBeenCalled()
        expect(
          testFixtures.collections.standardCollection.save,
        ).toHaveBeenCalled()
        expect(fragment.owners.length).toBeGreaterThan(0)
        expect(
          testFixtures.collections.standardCollection.owners.length,
        ).toBeGreaterThan(1)
        expect(fragment.owners[0]).toBe('123987')
        expect(testFixtures.collections.standardCollection.owners[1]).toBe(
          '123987',
        )
      })
  })

  it('should return success when the admin adds a submitting author and creates a corresponding user account', () => {
    const error = new Error()
    error.name = 'NotFoundError'
    error.status = 404
    const fragment = getNewFragment([])
    return makeApp(
      testFixtures.collections.standardCollection,
      fragment,
      testFixtures.users.admin,
      error,
    )
      .post(createAuthorUrl)
      .set('Authorization', 'Bearer 123')
      .send(testFixtures.authors.standardAuthor)
      .expect(200)
      .then(() => {
        expect(fragment.save).toHaveBeenCalled()
        expect(
          testFixtures.collections.standardCollection.save,
        ).toHaveBeenCalled()
        expect(fragment.owners.length).toBeGreaterThan(0)
        expect(
          testFixtures.collections.standardCollection.owners.length,
        ).toBeGreaterThan(1)
        expect(fragment.owners[0]).toBe('111222')
        expect(testFixtures.collections.standardCollection.owners[1]).toBe(
          '111222',
        )
      })
  })
})
