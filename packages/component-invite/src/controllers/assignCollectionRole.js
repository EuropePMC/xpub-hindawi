const logger = require('@pubsweet/logger')
const config = require('config')
const helpers = require('../helpers/helpers')
const teamHelper = require('../helpers/Team')
const mailService = require('pubsweet-component-mail-service')
const inviteHelper = require('../helpers/Invitation')
const collHelper = require('../helpers/Collection')
const userHelper = require('../helpers/User')

const configRoles = config.get('roles')

module.exports = async (
  email,
  role,
  reqUser,
  res,
  collectionId,
  models,
  url,
  body,
) => {
  if (!configRoles.collection.includes(role)) {
    logger.error(`invitation has been attempted with invalid role: ${role}`)
    return res
      .status(403)
      .json({ error: `Role ${role} cannot be set on collections` })
  }

  if (reqUser.handlingEditor === true) {
    if (reqUser.teams === undefined) {
      return res.status(403).json({
        error: `Handling Editor ${reqUser.email} is not part of any teams`,
      })
    }
    const heTeams = await teamHelper.getMatchingTeams(
      reqUser.teams,
      models.Team,
      collectionId,
      role,
    )

    if (heTeams.length === 0) {
      return res.status(403).json({
        error: `User ${
          reqUser.email
        } cannot invite a ${role} to ${collectionId}`,
      })
    }
  }

  let collection
  try {
    collection = await models.Collection.find(collectionId)
  } catch (e) {
    const notFoundError = await helpers.handleNotFoundError(e, 'collection')
    return res.status(notFoundError.status).json({
      error: notFoundError.message,
    })
  }

  try {
    let user = await models.User.findByEmail(email)

    const team = await teamHelper.setupManuscriptTeam(
      models,
      user,
      collectionId,
      role,
    )
    // get updated user from DB
    user = await models.User.findByEmail(email)
    if (role === 'coAuthor') {
      try {
        await mailService.setupAssignEmail(user.email, 'assign-coauthor', url)

        return res.status(200).json(user)
      } catch (e) {
        logger.error(e)
        return res.status(500).json({ error: 'Email could not be sent.' })
      }
    }

    if (user.invitations === undefined) {
      user = await inviteHelper.setupInvitation(
        user,
        role,
        collectionId,
        team.id,
      )
      await collHelper.addAssignedPeople(collection, user, role)
    } else {
      const matchingInvitation = user.invitations.find(
        invitation =>
          invitation.collectionId === collectionId &&
          invitation.role === role &&
          invitation.hasAnswer === false,
      )
      if (matchingInvitation === undefined) {
        user = await inviteHelper.setupInvitation(
          user,
          role,
          collectionId,
          team.id,
        )
        await collHelper.addAssignedPeople(collection, user, role)
      }
    }

    try {
      await mailService.setupAssignEmail(
        user.email,
        'assign-handling-editor',
        url,
      )

      return res.status(200).json(user)
    } catch (e) {
      logger.error(e)
      return res.status(500).json({ error: 'Mail could not be sent.' })
    }
  } catch (e) {
    if (e.name === 'NotFoundError' && role === 'coAuthor') {
      return userHelper.setupNewUser(
        body,
        url,
        res,
        email,
        role,
        models.User,
        'invite-coauthor',
      )
    }
    const notFoundError = await helpers.handleNotFoundError(e, 'user')
    return res.status(notFoundError.status).json({
      error: notFoundError.message,
    })
  }
}
