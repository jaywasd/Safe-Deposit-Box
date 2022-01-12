import React, { useState } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Navbar from "./components/Navbar";
import PlainPage from "./routes/PlainPage";
import DashboardPage from "./routes/DashboardPage";
import { AuthContext } from "./libs/AuthenticateLib";
import 'cross-fetch/polyfill';
import {CognitoUserPool, CognitoUserAttribute, CognitoUser} from 'amazon-cognito-identity-js';
import OnlineSupport from "./components/online-support-module/OnlineSupport";


function App() {
  const PoolConfig = {
    UserPoolId: process.env.REACT_APP_USER_POOL_ID,
    ClientId: process.env.REACT_APP_CLIENT_ID
  };
  var userPool = new CognitoUserPool(PoolConfig);
  
  const [isAuthenticated, userAuthenticate] = useState(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userAuthenticate }}>
      <div className="">
          <BrowserRouter>
              <Navbar />
              <Switch>
                  <Route path={["/", "/login", "/register", "/email-verification", "/security-question", "/captcha"]}>
                      <PlainPage />
                  </Route>
              </Switch>
              <Switch>
                  <Route
                      path={[
                          "/dashboard", "/online-support", "/chat"
                      ]}
                  >
                      <div id="pageBody">
                          <DashboardPage />
                      </div>
                  </Route>
              </Switch>
          </BrowserRouter>
      </div>
    </AuthContext.Provider>
  );
}
export default App;
