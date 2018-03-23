const helpers = require('../helpers/helpers')
const teamHelper = require('../helpers/Team')
const config = require('config')
const inviteHelper = require('../helpers/Invitation')
const mailService = require('pubsweet-component-mail-service')
const logger = require('@pubsweet/logger')

const configRoles = config.get('roles')
module.exports = models => async (req, res) => {
  const { role } = req.query
  if (!helpers.checkForUndefinedParams(role)) {
    res.status(400).json({ error: 'Role is required' })
    return
  }

  if (!configRoles.collection.includes(role)) {
    res.status(400).json({ error: `Role ${role} is invalid` })
    return
  }

  const reqUser = await models.User.find(req.user)
  if (!reqUser.editorInChief) {
    res.status(400).json({ error: 'The request user must be Editor in Chief' })
    return
  }

  const { collectionId, userId } = req.params
  try {
    await models.Collection.find(collectionId)
    let user = await models.User.find(userId)
    const team = await teamHelper.getTeamByGroupAndCollection(
      collectionId,
      role,
      models.Team,
    )

    if (team === undefined) {
      res.status(400).json({
        error: `The requested collection does not have a ${role} Team`,
      })
      return
    }
    await inviteHelper.revokeInvitation(user, collectionId, role)
    user = await models.User.find(userId)
    await teamHelper.removeTeamMember(team.id, userId, models.Team)
    try {
      await mailService.setupRevokeInvitationEmail(
        user.email,
        'revoke-handling-editor',
      )

      return res.status(204).json()
    } catch (e) {
      logger.error(e.message)
      return res.status(500).json({ error: 'Email could not be sent.' })
    }
  } catch (e) {
    const notFoundError = await helpers.handleNotFoundError(e, 'item')
    return res.status(notFoundError.status).json({
      error: notFoundError.message,
    })
  }
}