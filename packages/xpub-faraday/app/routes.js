import React from 'react'
import { Route, Switch } from 'react-router-dom'

import App from 'pubsweet-component-xpub-app/src/components'

import {
  PrivateRoute,
  SignupPage,
  LoginPage,
  LogoutPage,
} from 'pubsweet-component-xpub-authentication/src/components'

// import DashboardPage from 'pubsweet-component-xpub-dashboard/src/components/DashboardPage'
import DashboardPage from 'pubsweet-components-faraday/src/components/Dashboard'
import { Wizard } from 'pubsweet-component-wizard/src/components'
import ManuscriptPage from 'pubsweet-component-xpub-manuscript/src/components/ManuscriptPage'
import ConfirmationPage from 'pubsweet-components-faraday/src/components/UIComponents/ConfirmationPage'
import NotFound from 'pubsweet-components-faraday/src/components/UIComponents/NotFound'
import AdminPage from 'pubsweet-components-faraday/src/components/Admin'

const Routes = () => (
  <App>
    <Switch>
      <Route component={LoginPage} exact path="/login" />
      <Route component={SignupPage} exact path="/signup" />
      <PrivateRoute component={DashboardPage} exact path="/" />
      <PrivateRoute
        component={ConfirmationPage}
        exact
        path="/confirmation-page"
      />
      <PrivateRoute component={AdminPage} exact path="/admin" />
      <PrivateRoute component={LogoutPage} exact path="/logout" />
      <PrivateRoute
        component={Wizard}
        exact
        path="/projects/:project/versions/:version/submit"
      />
      <PrivateRoute
        component={ManuscriptPage}
        exact
        path="/projects/:project/versions/:version/manuscript"
      />
      <Route component={NotFound} />
    </Switch>
  </App>
)

export default Routes
