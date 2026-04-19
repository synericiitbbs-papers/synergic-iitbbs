import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import Cookies from 'js-cookie';
import { auth, googleProvider, signInWithPopup } from "../../firebase"; 
import './Login1.css';
import illustration from '../../images/login.png';
import Toast from '../Toast/Toast';
import logo from '../../images/logo1.png'; //
function Login({ setAuth }) {  
    const [credentials, setCredentials] = useState({ username: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            Cookies.set('username', user.displayName, { expires: 7 });
            setToast({ type: "success", message: `Welcome back, ${user.displayName}!` });
            setAuth(true);
            setTimeout(() => navigate("/questionpapers"), 1500);
        } catch (error) {
            setToast({ type: "error", message: error.message || "Google Sign-In failed" });
        }
    };

    const onChange = (e) => setCredentials({ ...credentials, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch("https://synergic-backend.onrender.com/api/loginUser", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            const json = await response.json();
            if (json.success) {
                Cookies.set('username', credentials.username, { expires: 7 });
                setToast({ type: "success", message: "Login Successful!" });
                setAuth(true); 
                setTimeout(() => navigate("/questionpapers"), 1200); 
            } else {
                setToast({ type: "error", message: "Invalid credentials" });
            }
        } catch (error) {
            setToast({ type: "error", message: "Connection failed." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-wrapper">
            <div className="top-left-logo">
                <img src={logo} alt="Company Logo" />
            </div>
            <div className="bg-circle-top-left"></div>
            <div className="bg-circle-bottom-left"></div>
            <div className="bg-circle-bottom-right"></div>
        <div className="bg-circle-extra"></div> {/* Optional extra circle */}
            {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
            
            <div className="book-container">
                <div className="illustration-side">
                    <img src={illustration} alt="Reading Illustration" />
                </div>
                <div className="book-side">
                    <div className="login-card">
                        <h2 className="welcome-text">Welcome back !</h2>
                        
                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="input-group">
                                <label>Username</label>
                                <input type="text" name="username" value={credentials.username} onChange={onChange} required />
                            </div>

                            <div className="input-group">
                                <label>Password</label>
                                <input type="password" name="password" value={credentials.password} onChange={onChange} required />
                            </div>

                            {/* REPLACED FORGOT PASSWORD WITH SIGNUP */}
                            <div className="signup-prompt">
                                <span>Don't have an account? </span>
                                <Link to="/signup" className="signup-link">Sign up</Link>
                            </div>

                            <button type="submit" className="sign-in-btn" disabled={loading}>
                                {loading ? (
        <div className="loading-container">
            <div className="spinner"></div>
        </div>
    ) : (
        "Sign in"
    )}
                            </button>
                        </form>

                        <div className="divider">
                            <span>or</span>
                        </div>
                    </div>

                    <button onClick={handleGoogleLogin} className="google-signin-btn">
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" />
                        Continue with Google
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Login;