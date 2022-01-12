import React, {Component} from "react";
import {Col, Row} from "react-bootstrap";
import Amplify from "aws-amplify";
import {AmplifyChatbot} from "@aws-amplify/ui-react";

Amplify.configure({
    Auth: {
        identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID,
        region: 'us-east-1'
    },
    Interactions: {
        bots: {
            "SafeDepositOnlineBot": {
                "name": "SafeDepositOnlineBot",
                "alias": "$LATEST",
                "region": "us-east-1"
            }
        }
    }
});

class OnlineSupport extends Component {
    render() {
        return (
            <section>
                <div id="container" className="container px-3">
                    <Row className="m-3">
                        <Col className={"text-left"}>
                            <h2>Online Support</h2>
                            <hr/>
                        </Col>
                    </Row>
                    <Row className="m-3 text-left justify-content-sm-center">
                        <AmplifyChatbot
                            botName="SafeDepositOnlineBot"
                            botTitle="Safe Deposit Application ChatBot"
                            welcomeMessage="Hi, Welcome to SafeDeposit Virtual Assistant."
                        />
                    </Row>
                </div>
            </section>
        )
    }
}

export default OnlineSupport