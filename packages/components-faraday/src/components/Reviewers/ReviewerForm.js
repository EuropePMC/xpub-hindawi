import React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { th, Button } from '@pubsweet/ui'
import { compose, withHandlers } from 'recompose'
import { reduxForm, change as changeForm, initialize } from 'redux-form'

import { ReviewersSelect } from './'
import { ValidatedTextField } from '../AuthorList/FormItems'
import { inviteReviewer } from '../../redux/reviewers'

// const emailRegex = new RegExp(
//   /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i, //eslint-disable-line
// )

// const emailValidator = value =>
//   emailRegex.test(value) ? undefined : 'Invalid email'

const ReviewerForm = ({ clearForm, selectReviewer, handleSubmit }) => (
  <Root>
    <Row>
      <ReviewersSelect onSelect={selectReviewer} />
      <ValidatedTextField isRequired label="Last name*" name="lastName" />
    </Row>
    <Row>
      <ValidatedTextField label="First name" name="firstName" />
      <ValidatedTextField label="Affiliation" name="affiliation" />
    </Row>
    <ButtonsContainer>
      <FormButton onClick={clearForm}>Clear</FormButton>
      <FormButton onClick={handleSubmit} primary>
        Send
      </FormButton>
    </ButtonsContainer>
  </Root>
)

export default compose(
  connect(null, { changeForm, initialize, inviteReviewer }),
  reduxForm({
    form: 'inviteReviewer',
    onSubmit: (values, dispatch, { inviteReviewer }) => {},
  }),
  withHandlers({
    selectReviewer: ({ changeForm, initialize }) => reviewer => () => {
      Object.entries(reviewer).forEach(([key, value]) => {
        changeForm('inviteReviewer', key, value)
      })
    },
    clearForm: ({ reset }) => () => {
      reset()
    },
  }),
)(ReviewerForm)

// #region styled-components
const FormButton = styled(Button)`
  height: calc(${th('subGridUnit')} * 5);
  margin: ${th('subGridUnit')};
`

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: ${th('subGridUnit')} auto 0;
  width: 100%;
`

const Row = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: row;
`

const Root = styled.div`
  align-self: stretch;
  border: ${th('borderDefault')};
  display: flex;
  flex-direction: column;
  margin-bottom: ${th('gridUnit')};
  padding: ${th('subGridUnit')} calc(${th('subGridUnit')} * 3)
    calc(${th('subGridUnit')} * 3) calc(${th('subGridUnit')} * 3);
`
// #endregion
