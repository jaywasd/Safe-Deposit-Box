import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { useAuthContext } from "../libs/AuthenticateLib";
import { getElement, alertBox } from "../libs/Helper";
import * as AWS from 'aws-sdk/global';
import {AuthenticationDetails, CognitoUserPool, CognitoUser} from 'amazon-cognito-identity-js';

function Login() {
    const { userAuthenticate } = useAuthContext();
    const [errors, setErrors] = useState({});
    const region = 'us-east-1';
    const PoolConfig = {
        UserPoolId: process.env.REACT_APP_USER_POOL_ID,
        ClientId: process.env.REACT_APP_CLIENT_ID
    };

    var flag = 0;
    var alertCon = getElement("alert_box");

    let history = useHistory();

    if(localStorage.getItem("step") == 0){
        history.push("/");
    }else if(localStorage.getItem("step") == 1){
        history.push("/security-question");
    }else if(localStorage.getItem("step") == 2){
        history.push("/captcha");
    }else if(localStorage.getItem("step") == 3){
        history.push("/dashboard");
    }else{
        history.push("/");
    }

    const [values, setValues] = useState({
        email: "",
        password: "",
    });

    const handleChange = (event) => {
        setValues({
            ...values,
            [event.target.name]: event.target.value.trim(),
        });
    };

    function validation(values) {
        let errors = {};
        let re_email =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        let re_password = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!values.email) {
            errors.email = "Please enter email.";
            flag = 1;
        }
        if (!values.password) {
            errors.password = "Please enter password.";
            flag = 1;
        }
        if (flag == 0 && (!re_email.test(values.email) || !re_password.test(values.password))) {
            alertCon.innerHTML = alertBox(0,"Invalid email or password");
            flag = 1;
        }
        return errors;
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        setErrors(validation(values));
        if (flag === 0) {
            authenticate(values.email, values.password, region, PoolConfig, process.env.REACT_APP_IDENTITY_POOL_ID, alertCon, history);
        }
    };

    function authenticate(email, password, region, config, identityPoolID, alertCon, history){
    
        var authenticationData = {
            Username: email,
            Password: password,
        };
        var authenticationDetails = new AuthenticationDetails(
            authenticationData
        );
        var userPool = new CognitoUserPool(config);
        var userData = {
            Username: email,
            Pool: userPool,
        };
        var cognitoUser = new CognitoUser(userData);
        var cognitoURI = 'cognito-idp.' + region + '.amazonaws.com/'+config.UserPoolId;
    
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function(result) {
                var accessToken = result.getAccessToken().getJwtToken();
                AWS.config.region = region;
                var creds = {
                    IdentityPoolId: identityPoolID, 
                    Logins: {},
                };
                creds.Logins[cognitoURI] = result
                .getIdToken()
                .getJwtToken();
                AWS.config.credentials = new AWS.CognitoIdentityCredentials(creds);
        
                AWS.config.credentials.refresh(error => {
                    if (error) {
                        console.error(error);
                    } else {
                        userAuthenticate(true);
                        alertCon.innerHTML = alertBox(1, 'Successfully logged in!');
                        localStorage.setItem("email", email);
                        localStorage.setItem("verified", true);
                        localStorage.setItem("step", 1);
                        history.push("/security-question");
                    }
                });
            },
            onFailure: function(err) {
                alertCon.innerHTML = alertBox(0, err.message);
                if(err.code == "UserNotConfirmedException"){
                    localStorage.setItem("email", email);
                    localStorage.setItem("verified", false);
                    localStorage.setItem("step", 0);
                    history.push("/email-verification");
                }
            },
        });
    }
    
    return (
        <div className="container mt-5">
            <div className="row">
                <div className="mx-auto col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <form className="form-group" id="form">
                                <div className="App-name">
                                    <div className="text-center p-3 mb-2">
                                        <h2 className="h3 expensio-title">Login</h2>
                                    </div>
                                    <hr />
                                </div>
                                <div className="space"></div>
                                <div id="alert_box"></div>
                                <div className="Login-form mb-2 text-muted">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        className="form-control"
                                        type="email"
                                        name="email"
                                        id="email"
                                        placeholder="Enter Email"
                                        value={values.email}
                                        onChange={handleChange}
                                    />
                                    {errors.email && <p className="text-danger">{errors.email}</p>}
                                </div>
                                <div className="Login-form mb-2 text-muted">
                                    <label htmlFor="password">Password</label>
                                    <input
                                        className="form-control"
                                        type="password"
                                        name="password"
                                        id="password"
                                        placeholder="Enter Password"
                                        value={values.password}
                                        onChange={handleChange}
                                    />
                                    {errors.password && <p className="text-danger">{errors.password}</p>}
                                </div>
                                <div className="mb-2">
                                    <button
                                        className="btn btn-cyan mx-auto d-block"
                                        type="submit"
                                        name="submit"
                                        id="submit"
                                        onClick={handleSubmit}
                                    >
                                        Login
                                    </button>
                                </div>
                                <div>
                                    <p className="text-center">
                                        New User? Please <Link to="/register">Sign up</Link>
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
