import { pick, debounce } from 'lodash'
import { compose, withProps, withState, withHandlers } from 'recompose'
import { connect } from 'react-redux'
import { reduxForm, SubmissionError } from 'redux-form'
import { actions } from 'pubsweet-client'
import uploadFile from 'xpub-upload'
import { ConnectPage } from 'xpub-connect'
import { selectCollection, selectFragment } from 'xpub-selectors'
import Submit from './Submit'

const onSubmit = (values, dispatch, { history, project, version }) => {
  console.log('submit', values)

  return dispatch(actions.updateFragment(project, {
    id: version.id,
    rev: version.rev,
    submitted: new Date(),
    ...values
  })).then(() => {
    return dispatch(actions.updateCollection({
      id: project.id,
      rev: project.rev,
      status: 'submitted'
    }))
  }).then(() => {
    history.push('/')
  }).catch(error => {
    if (error.validationErrors) {
      throw new SubmissionError()
    }
  })
}

// TODO: redux-form doesn't have an onBlur handler(?)
const onChange = (values, dispatch, { project, version }) => {
  console.log('change', values)

  return dispatch(actions.updateFragment(project, {
    id: version.id,
    rev: version.rev,
    // submitted: false,
    ...values
  }))

  // TODO: display a notification when saving/saving completes/saving fails
}

export default compose(
  ConnectPage(({ match }) => [
    actions.getCollection({ id: match.params.project }),
    actions.getFragment({ id: match.params.project }, { id: match.params.version })
  ]),
  connect(
    (state, { match }) => {
      const project = selectCollection(state, match.params.project)
      const version = selectFragment(state, match.params.version)

      return { project, version }
    },
    {
      uploadFile
    }
  ),
  withProps(({ version }) => {
    const paths = ['metadata', 'declarations', 'suggestions', 'notes', 'files']

    return {
      initialValues: pick(version, paths)
    }
  }),
  reduxForm({
    form: 'submit',
    // enableReinitialize: true,
    onSubmit,
    onChange: debounce(onChange, 1000, { maxWait: 5000 })
  }),
  withState('confirming', 'setConfirming', false),
  withHandlers({
    toggleConfirming: props => () => {
      props.setConfirming(confirming => !confirming)
    }
  })
)(Submit)
