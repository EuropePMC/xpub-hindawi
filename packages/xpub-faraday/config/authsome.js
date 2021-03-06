const get = require('lodash/get')
const pickBy = require('lodash/pickBy')
const omit = require('lodash/omit')

async function teamPermissions(user, operation, object, context) {
  const permissions = ['handlingEditor', 'author']
  const teams = await Promise.all(
    user.teams
      .map(async teamId => {
        const team = await context.models.Team.find(teamId)
        if (permissions.includes(team.teamType.permissions)) {
          return team
        }
        return null
      })
      .filter(Boolean),
  )

  const collIDs = teams.map(team => team.object.id)

  if (collIDs.length > 0) {
    return {
      filter: filterParam => {
        if (filterParam.length > 0) {
          const collections = filterParam.filter(
            coll => collIDs.includes(coll.id) || coll.owners.includes(user.id),
          )
          return collections
        }
        return filterParam
      },
    }
  }

  return {}
}

function unauthenticatedUser(operation, object) {
  // Public/unauthenticated users can GET /collections, filtered by 'published'
  if (operation === 'GET' && object && object.path === '/collections') {
    return {
      filter: collections =>
        collections.filter(collection => collection.published),
    }
  }

  // Public/unauthenticated users can GET /collections/:id/fragments, filtered by 'published'
  if (
    operation === 'GET' &&
    object &&
    object.path === '/collections/:id/fragments'
  ) {
    return {
      filter: fragments => fragments.filter(fragment => fragment.published),
    }
  }

  // and filtered individual collection's properties: id, title, source, content, owners
  if (operation === 'GET' && object && object.type === 'collection') {
    if (object.published) {
      return {
        filter: collection =>
          pickBy(collection, (_, key) =>
            ['id', 'title', 'owners'].includes(key),
          ),
      }
    }
  }

  if (operation === 'GET' && object && object.type === 'fragment') {
    if (object.published) {
      return {
        filter: fragment =>
          pickBy(fragment, (_, key) =>
            ['id', 'title', 'source', 'presentation', 'owners'].includes(key),
          ),
      }
    }
  }

  return false
}

async function authenticatedUser(user, operation, object, context) {
  // Allow the authenticated user to POST a collection (but not with a 'filtered' property)
  // if (operation === 'POST' && object.path === '/collections') {
  //   return {
  //     filter: collection => omit(collection, 'filtered'),
  //   }
  // }

  // Allow the authenticated user to GET collections they own
  if (operation === 'GET' && object === '/collections/') {
    return {
      filter: collection => collection.owners.includes(user.id),
    }
  }

  // Allow owners of a collection to GET its teams, e.g.
  // GET /api/collections/1/teams
  if (operation === 'GET' && get(object, 'path') === '/teams') {
    const collectionId = get(object, 'params.collectionId')
    if (collectionId) {
      const collection = await context.models.Collection.find(collectionId)
      if (collection.owners.includes(user.id)) {
        return true
      }
    }
  }

  if (
    operation === 'GET' &&
    get(object, 'type') === 'team' &&
    get(object, 'object.type') === 'collection'
  ) {
    const collection = await context.models.Collection.find(
      get(object, 'object.id'),
    )
    if (collection.owners.includes(user.id)) {
      return true
    }
  }

  // Advanced example
  // Allow authenticated users to create a team based around a collection
  // if they are one of the owners of this collection
  if (['POST', 'PATCH'].includes(operation) && get(object, 'type') === 'team') {
    if (get(object, 'object.type') === 'collection') {
      const collection = await context.models.Collection.find(
        get(object, 'object.id'),
      )
      if (collection.owners.includes(user.id)) {
        return true
      }
    }
  }

  if (user.teams.length !== 0) {
    const permissions = await teamPermissions(user, operation, object, context)

    if (permissions) {
      return permissions
    }
  }

  if (get(object, 'type') === 'fragment') {
    const fragment = object

    if (fragment.owners.includes(user.id)) {
      return true
    }
  }

  if (get(object, 'type') === 'collection') {
    const collection = object

    // Owner user
    if (collection.owners.includes(user.id)) {
      if (['GET', 'DELETE'].includes(operation)) {
        return true
      }

      // Only allow filtered updating (mirroring filtered creation) for non-admin users)
      if (operation === 'PATCH') {
        return {
          filter: collection => omit(collection, 'filtered'),
        }
      }
    }
  }

  // A user can GET, DELETE and PATCH itself
  if (get(object, 'type') === 'user' && get(object, 'id') === user.id) {
    if (['GET', 'DELETE', 'PATCH'].includes(operation)) {
      return true
    }
  }
  // If no individual permissions exist (above), fallback to unauthenticated
  // user's permission
  return unauthenticatedUser(operation, object)
}

const authsomeMode = async (userId, operation, object, context) => {
  if (!userId) {
    return unauthenticatedUser(operation, object)
  }

  // It's up to us to retrieve the relevant models for our
  // authorization/authsome mode, e.g.
  const user = await context.models.User.find(userId)

  // Admins and editor in chiefs can do anything
  if (user && (user.admin === true || user.editorInChief === true)) return true

  if (user) {
    return authenticatedUser(user, operation, object, context)
  }

  return false
}

module.exports = authsomeMode
