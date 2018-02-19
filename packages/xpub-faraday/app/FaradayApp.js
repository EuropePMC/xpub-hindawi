import React from 'react'
import 'xpub-bootstrap'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { actions } from 'pubsweet-client'
import { withJournal } from 'xpub-journal'
import { AppBar } from 'pubsweet-components-faraday/src/components'

const App = ({ children, currentUser, journal, logoutUser }) => (
  <Root>
    <AppBar
      brand={journal.metadata.name}
      onLogoutClick={logoutUser}
      user={currentUser}
    />
    <MainContainer>{children}</MainContainer>
  </Root>
)

const Root = styled.div`
  font-family: 'Fira Sans', sans-serif;
`

const MainContainer = styled.div`
  padding: 8px;
  margin-top: 20px;
`

export default compose(
  connect(
    state => ({
      currentUser: state.currentUser.user,
    }),
    { logoutUser: actions.logoutUser },
  ),
  withJournal,
)(App)
