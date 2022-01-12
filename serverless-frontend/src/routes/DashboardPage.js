import { Route, useHistory } from "react-router-dom";
import Chat from "../components/Chat";
import Dashboard from "../components/Dashboard";
import OnlineSupport from "../components/online-support-module/OnlineSupport";
import Sidebar from "../components/Sidebar";
import { useAuthContext } from "../libs/AuthenticateLib";

function DashboardPage() {
    const { userAuthenticate } = useAuthContext();

    let history = useHistory();
    var email = localStorage.getItem("email");

    if(localStorage.getItem("step") == 0){
        history.push("/");
    }else if(localStorage.getItem("step") == 1){
        history.push("/security-question");
    }else if(localStorage.getItem("step") == 2){
        history.push("/captcha");
    }

    if (localStorage.getItem("CognitoIdentityServiceProvider."+process.env.REACT_APP_CLIENT_ID+"."+email+".accessToken") == null) {
        history.push("/login");
    }else {
        userAuthenticate(true);
    }
    return (
        <div>
            <Sidebar />
            <div id="container" className="container px-3">
                <Route exact path="/Dashboard">
                    <Dashboard />
                </Route>
                <Route exact path="/online-support">
                    <OnlineSupport />
                </Route>
                <Route exact path="/Chat">
                    <Chat />
                </Route>
            </div>
        </div>
    );
}
export default DashboardPage;
