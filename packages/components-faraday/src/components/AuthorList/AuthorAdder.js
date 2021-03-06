import React from 'react'
import { get } from 'lodash'
import { connect } from 'react-redux'
import { Button } from '@pubsweet/ui'
import { reduxForm } from 'redux-form'
import styled from 'styled-components'
import { compose, withProps } from 'recompose'
import { selectCurrentUser } from 'xpub-selectors'

import countries from './countries'
import { Spinner } from '../UIComponents/'
import { emailValidator } from '../utils'
import { getAuthorFetching } from '../../redux/authors'
import { MenuItem, ValidatedTextField } from './FormItems'

const AuthorAdder = ({
  authors = [],
  editMode,
  setEditMode,
  handleSubmit,
  isFetching,
}) => (
  <Root>
    <Button data-test="button-add-author" onClick={setEditMode(true)} primary>
      {authors.length === 0 ? '+ Add submitting author' : '+ Add author'}
    </Button>
    {editMode && (
      <FormBody>
        <Title>{authors.length === 0 ? 'Submitting author' : 'Author'}</Title>
        <Row>
          <ValidatedTextField isRequired label="First name*" name="firstName" />
          <ValidatedTextField label="Middle name" name="middleName" />
          <ValidatedTextField isRequired label="Last name*" name="lastName" />
        </Row>

        <Row>
          <ValidatedTextField
            isRequired
            label="Email*"
            name="email"
            validators={[emailValidator]}
          />
          <ValidatedTextField
            isRequired
            label="Affiliation*"
            name="affiliation"
          />
          <MenuItem label="Country*" name="country" options={countries} />
        </Row>
        <ButtonsContainer>
          <Button data-test="button-cancel-author" onClick={setEditMode(false)}>
            Cancel
          </Button>
          {!isFetching ? (
            <Button
              data-test="button-save-author"
              onClick={handleSubmit}
              primary
            >
              Save
            </Button>
          ) : (
            <Spinner size={3} />
          )}
        </ButtonsContainer>
      </FormBody>
    )}
  </Root>
)

export default compose(
  connect(state => ({
    currentUser: selectCurrentUser(state),
    isFetching: getAuthorFetching(state),
  })),
  withProps(({ currentUser: { admin, username, email }, authors }) => {
    if (!admin && authors.length === 0) {
      return {
        initialValues: {
          email,
          firstName: username,
        },
      }
    }
  }),
  reduxForm({
    form: 'author',
    enableReinitialize: true,
    onSubmit: (
      values,
      dispatch,
      { authors = [], addAuthor, setEditMode, setFormAuthors, reset, match },
    ) => {
      const collectionId = get(match, 'params.project')
      const isFirstAuthor = authors.length === 0
      addAuthor(
        {
          ...values,
          isSubmitting: isFirstAuthor,
          isCorresponding: isFirstAuthor,
        },
        collectionId,
      ).then(author => {
        const newAuthors = [...authors, author]
        setEditMode(false)()
        setTimeout(() => {
          setFormAuthors(newAuthors)
        }, 1000)
        reset()
      })
    },
  }),
)(AuthorAdder)

// #region styled-components
const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-around;
  margin: 15px 0 0 0;
`

const Row = styled.div`
  display: flex;
  flex-direction: row;
  margin: 10px 0;
`

const Title = styled.span`
  font-size: ${({ theme }) => theme.fontSizeBase};
  font-weight: 500;
  margin: 10px 0;
  text-transform: uppercase;
`

const FormBody = styled.div`
  border: ${({ theme }) => theme.borderDefault};
  margin-top: 10px;
  padding: 10px;
`

const Root = styled.div`
  display: flex;
  flex-direction: column;
  margin: 10px 0;
`
// #endregion
