import { get, isEmpty, forEach, isArray, find } from 'lodash'
import moment from 'moment'

export const parseTitle = version => {
  const title = get(version, 'metadata.title')
  if (title) {
    return title.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '')
  }
  return 'Untitled'
}

export const getFilesURL = files => {
  const urls = []

  forEach(files, value => {
    if (!isEmpty(value)) {
      if (isArray(value)) {
        value.forEach(v => {
          urls.push(v)
        })
      } else {
        urls.push(value)
      }
    }
  })

  return urls
}

export const downloadAll = urls => {
  const link = document.createElement('a')
  link.style.display = 'none'

  document.body.appendChild(link)

  urls.forEach(u => {
    link.setAttribute('download', u.name)
    link.setAttribute('href', u.signedUrl || u.url)
    link.click()
  })
  document.body.removeChild(link)
}

export const parseAuthor = version => {
  const author = find(get(version, 'authors'), a => a.isSubmitting)
  return author ? `${author.firstName} ${author.lastName}` : 'N/A'
}

export const parseType = version => {
  const type = get(version, 'metadata.type')
  return type ? type.replace('-', ' ') : 'N/A'
}

export const parseSubmissionDate = version => {
  const submitted = get(version, 'submitted')
  return submitted ? moment(submitted).format('DD-MM-YYYY') : 'N/A'
}

export const parseVersion = version => ({
  author: parseAuthor(version),
  title: parseTitle(version),
  submitted: parseSubmissionDate(version),
  type: parseType(version),
  abstract: get(version, 'metadata.abstract'),
  version: get(version, 'version'),
})