import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; // Ensure correct CSS styles

function Navbar() {
    const [showLogin, setShowLogin] = useState(false);

    // Function to toggle login popup
    const toggleLoginPopup = () => {
        setShowLogin(!showLogin);
    };

    return (
        <>
            <nav className="navbar">
                <div className="logo">
                    <img src="/i1.jpeg" alt="Logo" className="logo-img" />
                </div>
                <div className="nav-links">
                    <Link to="/" className="nav-link">Home</Link>
                </div>
                <div className="login-btn">
                    <button className="login-button" onClick={toggleLoginPopup}>
                        Login
                    </button>
                </div>
            </nav>

            {/* Popup Login Form */}
            {showLogin && (
                <div className="popup">
                    <div className="popup-content">
                        <span className="close-btn" onClick={toggleLoginPopup}>&times;</span>
                        <h2>Login</h2>
                        <form>
                            <label>Enter Your Email:</label>
                            <input type="email" required />

                            <label>Enter Your Password:</label>
                            <input type="password" required />

                            <button type="submit">Login</button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default Navbar;
