import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useHistory } from "react-router-dom";
import { useAuthContext } from "../libs/AuthenticateLib";
import { getElement, alertBox } from "../libs/Helper";

function SecurityQuestion() {
    let history = useHistory();
    
    if(localStorage.getItem("step") == 0){
        history.push("/");
    }else if(localStorage.getItem("step") == 2){
        history.push("/captcha");
    }else if(localStorage.getItem("step") == 3){
        history.push("/dashboard");
    }else if(localStorage.getItem("step") != 1){
        history.push("/");
    }

    const { userAuthenticate } = useAuthContext();
    const [errors, setErrors] = useState({});

    var flag = 0;
    var alertCon = getElement("alert_box");

    const [values, setValues] = useState({
        email: localStorage.getItem("email"),
        answer: "",
    });

    const handleChange = (event) => {
        setValues({
            ...values,
            [event.target.name]: event.target.value.trim(),
        });
    };
    useEffect(()=>{
        loadQuestion(values.email);
    }, []);
    function validation(values) {
        let errors = {};
        let re_email =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (!values.email) {
            errors.email = "Please enter email.";
            flag = 1;
        }
        if (!values.answer) {
            errors.answer = "Please enter your answer.";
            flag = 1;
        }
        return errors;
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        setErrors(validation(values));
        if (flag === 0) {
            checkAnswer(values.email, values.answer);
        }
    };
    function checkAnswer(){
        axios
        .post(process.env.REACT_APP_SQ_API, values)
        .then(function (response) {
            if(response.data.code == 200){
                alertCon.innerHTML = alertBox(1, response.data.message);
                localStorage.setItem("step", 2);
                history.push("/captcha");
            }else{
                alertCon.innerHTML = alertBox(0, "Invalid answer");
            }
        })
        .catch(function (error) {
            alertCon.innerHTML = alertBox(0, "Invalid answer");
        });
    }
    function loadQuestion(email){
        var sq = getElement("question");
        axios
        .get(process.env.REACT_APP_SQ_API + "?email=" + email)
        .then(function (response) {
            sq.innerHTML = response.data.message;
        })
        .catch(function (error) {
            alertCon.innerHTML = alertBox(0, "Could not connect with the server!");
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
                                        <h2 className="h3 expensio-title">Two-Factor Authentication</h2>
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
                                        value={values.email}
                                        disabled
                                    />
                                    {errors.email && <p className="text-danger">{errors.email}</p>}
                                </div>
                                <div>
                                    <label id="question" for="answer">
                                    </label>
                                </div>
                                <div className="Login-form mb-2 text-muted">
                                    <label htmlFor="answer">Answer</label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        name="answer"
                                        id="answer"
                                        placeholder="Enter your answer"
                                        value={values.answer}
                                        onChange={handleChange}
                                    />
                                    {errors.answer && <p className="text-danger">{errors.answer}</p>}
                                </div>
                                <div className="mb-2">
                                    <button
                                        className="btn btn-cyan mx-auto d-inline"
                                        type="submit"
                                        name="submit"
                                        id="submit"
                                        onClick={handleSubmit}
                                    >
                                        Continue
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default SecurityQuestion;