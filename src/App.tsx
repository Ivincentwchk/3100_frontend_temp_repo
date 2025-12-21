import { useState } from "react";
import { useAuth } from "./feature/auth/useAuth";
import { StartPage } from "./components/pages/StartPage";
import { Login } from "./components/pages/Login";
import { Register } from "./components/pages/Register";
import { AuthHeader } from "./components/AuthHeader";
import Dashboard from "./components/Dashboard";
import { ResetPassword } from "./components/pages/ResetPassword";
import Cert from "./components/pages/Cert";

type Page = "start" | "login" | "register" | "cert";

export default function App() {
  const { user, isAuthenticated, loading, handleLogout, handleLogin, error, token } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>("cert");
  const isResetRoute = typeof window !== "undefined" && window.location.pathname.includes("reset-password");

  const handleGetStarted = () => {
    setCurrentPage("register");
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

  if (!loading && isResetRoute) {
    return (
      <div className="app-shell">
        <AuthHeader onLogoClick={navigateToStart} />
        <ResetPassword />
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
            handleLogin={handleLogin}
            authError={error}
          />
        )}
        {currentPage === "register" && (
          <Register
            onLogin={navigateToLogin}
          />
        )}
        {currentPage === "cert" && (
          <Cert />
        )}

      </>
    </div>
  );
}
