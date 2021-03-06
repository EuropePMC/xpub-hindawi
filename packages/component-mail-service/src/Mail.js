const fs = require('fs')
const handlebars = require('handlebars')
const querystring = require('querystring')
const Email = require('@pubsweet/component-send-email')
const config = require('config')

const resetPath = config.get('invite-reset-password.url')

module.exports = {
  setupInviteEmail: async (email, emailType, token, inviteUrl) => {
    const replacements = {
      url: `${inviteUrl}${resetPath}?${querystring.encode({
        email,
        token,
      })}`,
    }

    const { htmlBody, textBody } = getEmailBody(emailType, replacements)
    const mailData = {
      from: config.get('mailer.from'),
      to: email,
      subject: 'Hindawi Invitation',
      text: textBody,
      html: htmlBody,
    }

    return Email.send(mailData)
  },
  setupAssignEmail: async (email, emailType, dashBoardUrl) => {
    let subject
    let replacements = {}
    switch (emailType) {
      case 'assign-handling-editor':
        subject = 'Hindawi Handling Editor Invitation'
        replacements = {
          url: dashBoardUrl,
        }
        break
      case 'assign-author':
        subject = 'Manuscript Assignment on Hindawi'
        replacements = {
          url: dashBoardUrl,
        }
        break
      default:
        subject = 'Welcome to Hindawi!'
        break
    }

    const { htmlBody, textBody } = getEmailBody(emailType, replacements)
    const mailData = {
      from: config.get('mailer.from'),
      to: email,
      subject,
      text: textBody,
      html: htmlBody,
    }
    return Email.send(mailData)
  },
  setupRevokeInvitationEmail: async (email, emailType) => {
    let subject
    const replacements = {}
    switch (emailType) {
      case 'revoke-handling-editor':
        subject = 'Invitation has been Cancelled'
        break
      default:
        subject = 'Welcome to Hindawi!'
        break
    }

    const { htmlBody, textBody } = getEmailBody(emailType, replacements)
    const mailData = {
      from: config.get('mailer.from'),
      to: email,
      subject,
      text: textBody,
      html: htmlBody,
    }
    return Email.send(mailData)
  },
  setupHandlingEditorAgreedEmail: async (
    toEmail,
    user,
    emailType,
    url,
    collectionId,
  ) => {
    const { htmlBody, textBody } = getEmailBody(emailType, {
      url,
      name: `${user.firstName} ${user.lastName}`,
      collectionId,
    })
    const mailData = {
      from: config.get('mailer.from'),
      to: toEmail,
      subject: 'Handling Editor Agreed',
      text: textBody,
      html: htmlBody,
    }
    return Email.send(mailData)
  },
  setupDeclineEmail: async (toEmail, user, emailType, collectionId, reason) => {
    let finalReason = ''
    if (reason !== undefined) {
      finalReason = `Reason: "${reason}"`
    }
    const replacements = {
      finalReason,
      name: `${user.firstName} ${user.lastName}`,
      collectionId,
    }

    const { htmlBody, textBody } = getEmailBody(emailType, replacements)
    const mailData = {
      from: config.get('mailer.from'),
      to: toEmail,
      subject: 'Handling Editor Declined',
      text: textBody,
      html: htmlBody,
    }

    return Email.send(mailData)
  },
}

const getEmailBody = (emailType, replacements) => {
  const htmlFile = readFile(`${__dirname}/templates/${emailType}.html`)
  const textFile = readFile(`${__dirname}/templates/${emailType}.txt`)
  const htmlTemplate = handlebars.compile(htmlFile)
  const textTemplate = handlebars.compile(textFile)
  const htmlBody = htmlTemplate(replacements)
  const textBody = textTemplate(replacements)
  return { htmlBody, textBody }
}

const readFile = path =>
  fs.readFileSync(path, { encoding: 'utf-8' }, (err, file) => {
    if (err) {
      throw err
    } else {
      return file
    }
  })
