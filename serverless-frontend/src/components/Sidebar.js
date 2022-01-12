import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { useAuthContext } from "../libs/AuthenticateLib";
import { CognitoUserPool, CognitoUser} from 'amazon-cognito-identity-js';

function Sidebar() {
    const { userAuthenticate } = useAuthContext();
    let history = useHistory();
    const PoolConfig = {
        UserPoolId: process.env.REACT_APP_USER_POOL_ID,
        ClientId: process.env.REACT_APP_CLIENT_ID
    };
    var userPool = new CognitoUserPool(PoolConfig);
    var email = localStorage.getItem("email");
    var userData = {
        Username: email,
        Pool: userPool,
    };
    var cognitoUser = new CognitoUser(userData);
    var callback = {
        onSuccess: function(result) {
            console.log("Successfully signed out");
        },
        onFailure: function(err) {
            console.log("Error signing out");
        }
    }
    return (
        <div id="sidebar" className="div">
            <div>
                <ul>
                    <li>
                        <Link to="/dashboard">
                            <span className="link_icon">
                                <i className="fas fa-th"></i>
                            </span>
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link to="/chat">
                            <span className="link_icon">
                                <i className="fas fa-comment"></i>
                            </span>
                            Chat With Others
                        </Link>
                    </li>
                    <li>
                        <Link to="/online-support">
                            <span className="link_icon">
                                <i className="fas fa-comment"></i>
                            </span>
                            Online Support
                        </Link>
                    </li>
                    <li>
                        <p
                            onClick={() => {
                                userAuthenticate(false);
                                localStorage.removeItem("email");
                                localStorage.removeItem("verified");
                                cognitoUser.signOut();
                                cognitoUser.globalSignOut(callback);
                                localStorage.clear();
                                history.push("/login");
                            }}
                        >
                            <span className="link_icon">
                                <i className="fas fa-sign-out-alt"></i>
                            </span>
                            Logout
                        </p>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default Sidebar;
