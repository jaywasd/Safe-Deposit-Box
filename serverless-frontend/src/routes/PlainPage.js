import { Route } from "react-router-dom";
import Captcha from "../components/Captcha";
import EmailVerification from "../components/EmailVerification";
import Login from "../components/Login";
import Registration from "../components/Registration";
import SecurityQuestion from "../components/SecurityQuestion";

function PlainPage() {
    return (
        <div id="pageBody">
            <Route exact path={["/", "/login"]}>
                <Login />
            </Route>
            <Route exact path="/register">
                <Registration />
            </Route>
            <Route exact path="/email-verification">
                <EmailVerification />
            </Route>
            <Route exact path="/security-question">
                <SecurityQuestion />
            </Route>
            <Route exact path="/captcha">
                <Captcha />
            </Route>
        </div>
    );
}
export default PlainPage;
