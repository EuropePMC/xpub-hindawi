Note: xpub is still _very_ new. This repository contains an initial set of components but is not yet ready for use.

## Contents

### PubSweet components

* `component-app`: a PubSweet component that provides an app container with nav bar and journal provider.
* `component-authentication`: a PubSweet component that provides authentication-related client pages.
* `component-dashboard`: a PubSweet component that provides a Dashboard page.
* `component-manuscript`: a PubSweet component that provides a Manuscript page.
* `component-review`: a PubSweet component that provides a Review page.
* `component-submit`: a PubSweet component that provides a Submit page.

## PubSweet applications

* `xpub-collabra`: a PubSweet application that provides configuration and routing for a journal.

## xpub packages

* `xpub-edit`: WYSIWYG editors for use in xpub forms
* `xpub-fonts`: fonts for use in xpub applications
* `xpub-journal`: a helper that provides journal config to components
* `xpub-selectors`: some useful redux selectors
* `xpub-styleguide`: components for use in react-styleguidist
* `xpub-ui`: a library of user interface elements for use in PubSweet components
* `xpub-upload`: a helper function for file uploading

## Installing

In the root directory, run `npm install` then `npm run bootstrap` to install all the dependencies.

Note: this monorepo uses Lerna, which works best with npm v4 when linking unpublished packages. Hoisting is not yet reliable, so each component has its own node_modules folder.

## Configuration

To enable manuscript conversion via INK, add the following values to `packages/xpub-collabra/.env.dev` (ask in [the xpub channel](https://mattermost.coko.foundation/coko/channels/xpub) if you need an account):

```
INK_USERNAME=*****
INK_PASSWORD=*****
INK_ENDPOINT=http://ink-api.coko.foundation
```

## Running the app

1. `cd packages/xpub-collabra`
1. The first time you run the app, initialise the database with `npm run setupdb` (press Enter when asked for a collection title, to skip that step).
1. `npm run start`

## Community

Join [the Mattermost channel](https://mattermost.coko.foundation/coko/channels/xpub) for discussion of xpub.
