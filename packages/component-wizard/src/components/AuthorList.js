import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { connect } from 'react-redux'
import { get } from 'lodash'
import { reduxForm } from 'redux-form'
import { required } from 'xpub-validators'
import { withRouter } from 'react-router-dom'
import { selectCurrentUser } from 'xpub-selectors'
import {
  compose,
  withHandlers,
  withProps,
  getContext,
  lifecycle,
  withState,
} from 'recompose'
import { TextField, Menu, Icon, ValidatedField, Button } from '@pubsweet/ui'

import {
  addAuthor,
  getFragmentAuthors,
  setAuthors,
  moveAuthors,
} from '../redux/authors'

import classes from './AuthorList.local.scss'
import SortableList from './SortableList'

const countries = [
  { label: 'Romania', value: 'ro' },
  { label: 'United Kingdom', value: 'uk' },
  { label: 'Germany', value: 'de' },
  { label: 'France', value: 'fr' },
]

const emailRegex = new RegExp(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)

const emailValidator = value =>
  emailRegex.test(value) ? undefined : 'Invalid email'

const ValidatedTextField = ({ label, name, isRequired, validators = [] }) => {
  const v = [isRequired && required, ...validators].filter(Boolean)
  return (
    <div className={classnames(classes['validated-text'])}>
      <span className={classnames(classes.label)}>{label}</span>
      <ValidatedField component={TextField} name={name} validate={v} />
    </div>
  )
}

const MenuItem = ({ label, name, options }) => (
  <div className={classnames(classes['validated-text'])}>
    <span className={classnames(classes.label)}>{label}</span>
    <ValidatedField
      component={input => <Menu {...input} options={options} />}
      name={name}
      validate={[required]}
    />
  </div>
)

const Label = ({ label, value }) => (
  <div className={classnames(classes['label-container'])}>
    <span className={classnames(classes.label)}>{label}</span>
    <span className={classnames(classes.value)}>{value}</span>
  </div>
)

const DragHandle = () => (
  <div className={classnames(classes['drag-handle'])}>
    <Icon>chevron_up</Icon>
    <Icon size={16}>menu</Icon>
    <Icon>chevron_down</Icon>
  </div>
)

const AuthorAdder = ({ authors, editMode, setEditMode, handleSubmit }) => (
  <div className={classnames(classes.adder)}>
    <Button onClick={setEditMode(true)} primary>
      {authors.length === 0 ? '+ Add submitting author' : '+ Add author'}
    </Button>
    {editMode && (
      <div className={classnames(classes['form-body'])}>
        <span className={classnames(classes.title)}>
          {authors.length === 0 ? 'Submitting author' : 'Author'}
        </span>
        <div className={classnames(classes.row)}>
          <ValidatedTextField
            isRequired
            label="First name"
            name="author.firstName"
          />
          <ValidatedTextField label="Middle name" name="author.middleName" />
          <ValidatedTextField
            isRequired
            label="Last name"
            name="author.lastName"
          />
        </div>

        <div className={classnames(classes.row)}>
          <ValidatedTextField
            isRequired
            label="Email"
            name="author.email"
            validators={[emailValidator]}
          />
          <ValidatedTextField
            isRequired
            label="Affiliation"
            name="author.affiliation"
          />
          <MenuItem label="Country" name="author.country" options={countries} />
        </div>
        <div className={classnames(classes['form-buttons'])}>
          <Button onClick={setEditMode(false)}>Cancel</Button>
          <Button onClick={handleSubmit} primary>
            Save
          </Button>
        </div>
      </div>
    )}
  </div>
)

const AuthorEdit = ({ setAuthorEdit, handleSubmit }) => (
  <div className={classnames(classes['editor-body'])}>
    <div className={classnames(classes.row)}>
      <ValidatedTextField isRequired label="First name" name="edit.firstName" />
      <ValidatedTextField label="Middle name" name="edit.middleName" />
      <ValidatedTextField isRequired label="Last name" name="edit.lastName" />
    </div>

    <div className={classnames(classes.row)}>
      <ValidatedTextField
        isRequired
        label="Email"
        name="edit.email"
        validators={[emailValidator]}
      />
      <ValidatedTextField
        isRequired
        label="Affiliation"
        name="edit.affiliation"
      />
      <MenuItem label="Country" name="edit.country" options={countries} />
    </div>

    <div className={classnames(classes['form-buttons'])}>
      <Button onClick={setAuthorEdit(-1)}>Cancel</Button>
      <Button onClick={handleSubmit} primary>
        Save
      </Button>
    </div>
  </div>
)

const Editor = compose(
  withRouter,
  getContext({ version: PropTypes.object, project: PropTypes.object }),
  connect(
    (state, { match: { params: { version } } }) => ({
      authors: getFragmentAuthors(state, version),
    }),
    {
      setAuthors,
    },
  ),
  reduxForm({
    form: 'edit',
    onSubmit: (
      values,
      dispatch,
      { setAuthorEdit, setAuthors, project, version, authors, index, ...rest },
    ) => {
      const newAuthors = [
        ...authors.slice(0, index),
        values.edit,
        ...authors.slice(index + 1),
      ]
      setAuthors(newAuthors, version.id)
      setTimeout(setAuthorEdit(-1), 100)
    },
  }),
)(AuthorEdit)

const Adder = compose(
  connect(state => ({
    currentUser: selectCurrentUser(state),
  })),
  withProps(({ currentUser }) => {
    const { admin, email, username } = currentUser
    if (!admin) {
      return {
        initialValues: {
          author: {
            email,
            firstName: username,
          },
        },
      }
    }
  }),
  reduxForm({
    form: 'author',
    onSubmit: (
      values,
      dispatch,
      { authors, addAuthor, setEditMode, reset, match },
    ) => {
      const collectionId = get(match, 'params.project')
      const fragmentId = get(match, 'params.version')
      const isFirstAuthor = authors.length === 0
      addAuthor(
        {
          ...values.author,
          isSubmitting: isFirstAuthor,
          isCorresponding: isFirstAuthor,
        },
        collectionId,
        fragmentId,
      ).then(() => {
        reset()
        setEditMode(false)()
      })
    },
  }),
)(AuthorAdder)

const Author = ({
  firstName,
  middleName,
  lastName,
  email,
  affiliation,
  country,
  isDragging,
  dragHandle,
  isOver,
  countryParser,
  removeAuthor,
  isSubmitting,
  isCorresponding,
  setAsCorresponding,
  parseAuthorType,
  ...rest
}) => (
  <div
    className={classnames({
      [classes.author]: true,
      [classes.dashed]: isOver,
    })}
  >
    {!isOver && dragHandle}
    <div
      className={classnames({
        [classes.container]: true,
        [classes.hide]: isOver,
      })}
    >
      <span className={classnames(classes.title)}>
        {parseAuthorType(isSubmitting, isCorresponding)}
      </span>
      <div className={classnames(classes.row)}>
        <Label label="First name" value={firstName} />
        <Label label="Middle name" value={middleName} />
        <Label label="Last name" value={lastName} />
      </div>
      <div className={classnames(classes.row)}>
        <Label label="Email" value={email} />
        <Label label="Affiliation" value={affiliation} />
        <Label label="Country" value={countryParser(country)} />
      </div>
    </div>
    <div className={classnames(classes['button-container'])}>
      {!isSubmitting && (
        <div
          className={classnames(classes['delete-button'])}
          onClick={removeAuthor(email)}
        >
          <Icon>trash</Icon>
        </div>
      )}
      {!isCorresponding && (
        <div
          className={classnames(classes.corresponding)}
          onClick={setAsCorresponding(email)}
        >
          <Icon>mail</Icon>
        </div>
      )}
      <div
        className={classnames(classes.corresponding)}
        onClick={rest.setAuthorEdit(rest.index)}
      >
        <Icon>edit-2</Icon>
      </div>
    </div>
  </div>
)

const Authors = ({
  authors,
  moveAuthor,
  addAuthor,
  editAuthor,
  match,
  version,
  dropItem,
  editMode,
  setEditMode,
  ...rest
}) => (
  <div>
    <Adder
      addAuthor={addAuthor}
      authors={authors}
      editAuthor={editAuthor}
      editMode={editMode}
      match={match}
      setEditMode={setEditMode}
    />
    <SortableList
      dragHandle={DragHandle}
      dropItem={dropItem}
      editItem={Editor}
      items={authors}
      listItem={Author}
      moveItem={moveAuthor}
      {...rest}
    />
  </div>
)

export default compose(
  withRouter,
  getContext({ version: PropTypes.object, project: PropTypes.object }),
  connect(
    (state, { match: { params: { version } } }) => ({
      authors: getFragmentAuthors(state, version),
    }),
    {
      addAuthor,
      setAuthors,
      moveAuthors,
    },
  ),
  lifecycle({
    componentDidMount() {
      const { version, setAuthors } = this.props
      setAuthors(version.authors, version.id)
    },
  }),
  withState('editMode', 'setEditMode', false),
  withState('editedAuthor', 'setEditedAuthor', -1),
  withHandlers({
    setAuthorEdit: ({ setEditedAuthor }) => editedAuthor => e => {
      e && e.preventDefault && e.preventDefault()
      setEditedAuthor(prev => editedAuthor)
    },
    setEditMode: ({ setEditMode }) => mode => e => {
      e && e.preventDefault()
      setEditMode(v => mode)
    },
    dropItem: ({ authors, project, version, setAuthors }) => () => {
      setAuthors(authors, version.id)
    },
    countryParser: () => countryCode =>
      countries.find(c => c.value === countryCode).label,
    parseAuthorType: () => (isSubmitting, isCorresponding) => {
      if (isSubmitting) return 'Submitting author'
      if (isCorresponding) return 'Corresponding author'
      return 'Author'
    },
    moveAuthor: ({
      authors,
      moveAuthors,
      project,
      version,
      match: { params },
    }) => (dragIndex, hoverIndex) => {
      const newAuthors = SortableList.moveItem(authors, dragIndex, hoverIndex)
      moveAuthors(newAuthors, params.version)
    },
    removeAuthor: ({
      authors,
      project,
      version,
      setAuthors,
    }) => authorEmail => () => {
      const newAuthors = authors.filter(a => a.email !== authorEmail)
      setAuthors(newAuthors, version.id)
    },
    setAsCorresponding: ({
      authors,
      setAuthors,
      version,
      project,
    }) => authorEmail => () => {
      const newAuthors = authors.map(a => ({
        ...a,
        isCorresponding: a.isSubmitting || a.email === authorEmail,
      }))
      setAuthors(newAuthors, version.id)
    },
  }),
)(Authors)
