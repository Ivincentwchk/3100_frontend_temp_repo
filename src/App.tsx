import { useState } from "react";
import { useAuth } from "./feature/auth/useAuth";
import { StartPage } from "./components/pages/StartPage";
import { Login } from "./components/pages/Login";
import { Register } from "./components/pages/Register";
import { AuthHeader } from "./components/AuthHeader";
import Dashboard from "./components/Dashboard";

type Page = "start" | "login" | "register";

export default function App() {
  const { user, isAuthenticated, loading, handleLogout, handleLogin, error, token } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>("start");

  const handleGetStarted = () => {
    setCurrentPage("register");
  };

  const handleForgotPassword = () => {
    alert("Password reset link would be sent to your email");
    // Add forgot password logic here
  };

  const navigateToLogin = () => {
    setCurrentPage("login");
  };

  const navigateToRegister = () => {
    setCurrentPage("register");
  };

  const navigateToStart = () => {
    setCurrentPage("start");
  };

  const handleLogoutAndReturnHome = () => {
    handleLogout();
    setCurrentPage("start");
  };

  if (loading) {
    return (
      <div className="app-shell">
        <AuthHeader onLogoClick={navigateToStart} />
        <div className="page-shell">
          <div className="page-content" style={{ alignItems: "center" }}>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="app-shell">
        <AuthHeader onLogoClick={navigateToStart} />
        <Dashboard user={user} token={token} onLogout={handleLogoutAndReturnHome} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <AuthHeader onLogoClick={navigateToStart} />
      <>
        {currentPage === "start" && (
          <StartPage
            onGetStarted={handleGetStarted}
            onLogin={navigateToLogin}
            onLogoClick={navigateToStart}
          />
        )}
        {currentPage === "login" && (
          <Login
            onSignUp={navigateToRegister}
            onForgotPassword={handleForgotPassword}
            handleLogin={handleLogin}
            authError={error}
          />
        )}
        {currentPage === "register" && (
          <Register
            onLogin={navigateToLogin}
          />
        )}
      </>
    </div>
  );
}
