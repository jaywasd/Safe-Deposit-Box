import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { getElement, alertBox } from "../libs/Helper";
import {CognitoUserPool, CognitoUserAttribute, CognitoUser} from 'amazon-cognito-identity-js';


function Registration() {
    const [errors, setErrors] = useState({});
    const [values, setValues] = useState({
        fname: "",
        lname: "",
        email: "",
        password: "",
        SQ: "",
        answer: ""
    });
    const PoolConfig = {
        UserPoolId: process.env.REACT_APP_USER_POOL_ID,
        ClientId: process.env.REACT_APP_CLIENT_ID
    };    
    const handleChange = (event) => {
        setValues({
            ...values,
            [event.target.name]: event.target.value.trim(),
        });
    };

    var alertCon = getElement("alert_box");
    var flag = 0;
    let history = useHistory();

    function validation(values) {
        let errors = {};
        let re_email =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        let re_password = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!values.fname) {
            errors.fname = "Please enter your first name.";
            flag = 1;
        }

        if (!values.lname) {
            errors.lname = "Please enter your last name.";
            flag = 1;
        }

        if (!values.email) {
            errors.email = "Please enter email.";
            flag = 1;
        }
        if (!values.password) {
            errors.password = "Please enter password.";
            flag = 1;
        }

        if (!values.SQ) {
            errors.SQ = "Please select a security question.";
            flag = 1;
        }

        if (!values.answer) {
            errors.answer = "Please enter your answer.";
            flag = 1;
        }

        if (flag == 0 && (!re_email.test(values.email) || !re_password.test(values.password))) {
            alertCon.innerHTML = alertBox(0, "Invalid user details.");
            flag = 1;
        }
        return errors;
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        setErrors(validation(values));
        if (flag === 0) {
            register(values.fname, values.lname, values.email, values.password, values.SQ, values.answer, PoolConfig, alertCon, history);
        }
    };
    function register(fname, lname, email, password, SQ, answer, config, alertCon, history) {
        var userPool = new CognitoUserPool(config);
        var attributes = [];
        attributes.push(new CognitoUserAttribute({Name: 'name',Value: fname}));
        attributes.push(new CognitoUserAttribute({Name: 'email',Value: email}));
        attributes.push(new CognitoUserAttribute({Name: "custom:securityQuestion",Value: SQ}));
        attributes.push(new CognitoUserAttribute({Name: 'custom:questionAnswer',Value: answer}));
        attributes.push(new CognitoUserAttribute({Name: 'custom:lastName',Value: lname}));
        userPool.signUp(email, password, attributes, null, 
          (err, result) => {
              if (err) {  
                alertCon.innerHTML = alertBox(0, err.message);
              }else{
                alertCon.innerHTML = alertBox(1, "Successfully registered.");
                localStorage.setItem("email", email);
                localStorage.setItem("verified", false);
                history.push("/email-verification");
            }
        });
    }    
    return (
        <div className="container my-5">
            <div className="row">
                <div className="mx-auto col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <div className="App-name">
                                <div className="text-center p-3 mb-2">
                                    <h2 className="h3 expensio-title">Register</h2>
                                </div>
                                <hr />
                            </div>
                            <div id="alert_box"></div>
                            <div className="row">
                                <div className="mx-auto">
                                    <form className="form-group" id="form">
                                        <div className="Login-form mb-2 text-muted">
                                            <label htmlFor="fname">First Name</label>
                                            <input
                                                className="form-control"
                                                type="text"
                                                name="fname"
                                                id="fname"
                                                placeholder="Enter Your First Name"
                                                value={values.fname}
                                                onChange={handleChange}
                                            />
                                            {errors.fname && <p className="text-danger">{errors.fname}</p>}
                                        </div>
                                        <div className="Login-form mb-2 text-muted">
                                            <label htmlFor="lname">Last Name</label>
                                            <input
                                                className="form-control"
                                                type="text"
                                                name="lname"
                                                id="lname"
                                                placeholder="Enter Your Last Name"
                                                value={values.lname}
                                                onChange={handleChange}
                                            />
                                            {errors.lname && <p className="text-danger">{errors.lname}</p>}
                                        </div>
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
                                            <small class="text-muted">Max length 8 chars, One Upper, One lower, One Digit, One Special Char Required</small>
                                            {errors.password && <p className="text-danger">{errors.password}</p>}
                                        </div>
                                        <div className="Login-form mb-2 text-muted">
                                            <label htmlFor="SQ">Security Question</label>
                                            <select className="form-control" onChange={handleChange} id="SQ" name="SQ">
                                                <option value="" selected>Select</option>
                                                <option value="What’s your favorite movie?" >What’s your favorite movie?</option>
                                                <option value="What was your first car?">What was your first car?</option>
                                                <option value="What city were you born in?">What city were you born in?</option>
                                            </select>
                                            {errors.SQ && <p className="text-danger">{errors.SQ}</p>}
                                        </div>
                                        <div className="Login-form mb-2 text-muted">
                                            <label htmlFor="answer">Answer</label>
                                            <input
                                                className="form-control"
                                                type="text"
                                                name="answer"
                                                id="answer"
                                                placeholder="Enter Answer"
                                                value={values.answer}
                                                onChange={handleChange}
                                            />
                                            {errors.answer && <p className="text-danger">{errors.answer}</p>}
                                        </div>

                                        <div className="mb-2">
                                            <button
                                                className="btn btn-cyan mx-auto d-block"
                                                type="submit"
                                                name="submit"
                                                id="submit"
                                                onClick={handleSubmit}
                                            >
                                                Submit
                                            </button>
                                        </div>
                                        <div>
                                            <p className="text-center">
                                                Existing user? Please <Link to="/login">Sign in</Link>
                                            </p>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Registration;
