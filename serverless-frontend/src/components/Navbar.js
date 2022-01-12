import { Route } from "react-router-dom";

function Navbar() {
    function toggleSidebar() {
        var sideBar = document.getElementById("sidebar").classList;
        sideBar.toggle("open");
    }
    return (
        <header className="navbar bg-cyan text-white">
            <div className="w-100">
                <Route
                    path={[
                        "/dashboard",
                    ]}
                >
                    <button
                        id="NavToggler"
                        onClick={toggleSidebar}
                        className="btn btn-icon btn-46 float-left text-white"
                    >
                        <i className="fas fa-bars"></i>
                    </button>
                </Route>
                <div className="mx-2 navbar-brand text-white float-left">
                    <h2>Safe Deposit Box</h2>
                </div>
                <Route
                    path={[
                        "/dashboard",
                    ]}
                ></Route>
            </div>
        </header>
    );
}

export default Navbar;
