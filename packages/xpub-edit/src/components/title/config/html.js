// convert HTML to/from Slate

import React from 'react'
import { Html } from 'slate'
import { parseFragment } from 'parse5'

// define the mapping from HTML tag to Slate node

const tags = {
  i: {
    type: 'italic',
    kind: 'mark'
  },
  sup: {
    type: 'superscript',
    kind: 'mark'
  },
  sub: {
    type: 'subscript',
    kind: 'mark'
  },
  // sc: {
  //   type: 'smallcaps',
  //   kind: 'mark'
  // }
}

// define the mapping from Slate node to HTML tag

const renderers = {
  block: {
    // paragraph: children => <p>{children}</p>,
  },
  mark: {
    italic: children => <i>{children}</i>,
    superscript: children => <sup>{children}</sup>,
    subscript: children => <sub>{children}</sub>,
    // smallcaps: children => <span style={{fontVariant:'small-caps'}}>{children}</span>,
  }
}

const deserialize = (el, next) => {
  if (!tags[el.tagName]) return // only convert known tags

  const { type, kind, data } = tags[el.tagName]

  // TODO: convert styles to marks

  return {
    type,
    kind,
    nodes: next(el.childNodes),
    data: data ? data(el) : null
  }
}

const serialize = (object, children) => {
  // TODO: output for HTML
  // TODO: output for email (in a separate converter, with just serialize)

  if (!renderers[object.kind]) return

  const renderer = renderers[object.kind][object.type]

  return renderer ? renderer(children, object.data) : null
}

export default new Html({
  rules: [
    { deserialize, serialize }
  ],
  defaultBlockType: 'paragraph',
  // parseHtml: null
  parseHtml: parseFragment
})