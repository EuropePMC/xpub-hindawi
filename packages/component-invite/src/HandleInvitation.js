const bodyParser = require('body-parser')

const HandleInvitation = app => {
  app.use(bodyParser.json())
  const authBearer = app.locals.passport.authenticate('bearer', {
    session: false,
  })
  app.post(
    '/api/collections/:collectionId/users',
    authBearer,
    require('./routes/postHandleInvitation')(app.locals.models),
  )
}

module.exports = HandleInvitation