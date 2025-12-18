import { useState } from "react";
import { useAuth } from "./feature/auth/useAuth";
import { StartPage } from "./components/pages/StartPage";
import { Login } from "./components/pages/Login";
import { Register } from "./components/pages/Register";
import { Header } from "./components/Header";
import Dashboard from "./components/Dashboard";
import { ResetPassword } from "./components/pages/ResetPassword";
import { SubjectsPage } from "./components/pages/POC-Page/SubjectsPage";
import { GridBackground } from "./components/GridBackground";

type Page = "start" | "login" | "register";

export default function App() {
  const { user, isAuthenticated, loading, handleLogout, handleLogin, error, refreshUser } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>("start");
  const [dashboardView, setDashboardView] = useState<"home" | "subjects">("home");
  const isResetRoute = typeof window !== "undefined" && window.location.pathname.includes("reset-password");

  const handleLogoClick = () => {
    if (isAuthenticated) {
      setDashboardView("home");
      return;
    }
    setCurrentPage("start");
  };

  const handleGetStarted = () => {
    setCurrentPage("register");
  };

  const navigateToLogin = () => {
    setCurrentPage("login");
  };

  const navigateToRegister = () => {
    setCurrentPage("register");
  };

  const handleLogoutAndReturnHome = () => {
    handleLogout();
    setCurrentPage("start");
  };

  if (loading) {
    return (
      <div className="app-shell relative">
        <GridBackground />
        <Header onLogoClick={handleLogoClick} />
        <div className="page-shell">
          <div className="page-content" style={{ alignItems: "center" }}>
            <div className="form-card" style={{ width: "min(520px, 100%)" }}>
              <div className="skeleton skeleton-text lg" style={{ width: "55%" }} />
              <div className="skeleton skeleton-text" style={{ width: "85%" }} />
              <div className="skeleton" style={{ height: "180px", width: "100%" }} />
              <div style={{ display: "grid", gap: "0.75rem", width: "100%" }}>
                <div className="skeleton" style={{ height: "44px", width: "100%", borderRadius: "999px" }} />
                <div className="skeleton" style={{ height: "44px", width: "100%", borderRadius: "999px" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && isResetRoute) {
    return (
      <div className="app-shell relative">
        <GridBackground />
        <Header onLogoClick={handleLogoClick} />
        <ResetPassword />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="app-shell relative">
        <GridBackground />
        <Header onLogoClick={handleLogoClick} />
        {dashboardView === "subjects" ? (
          <SubjectsPage
            onBack={() => {
              refreshUser();
              setDashboardView("home");
            }}
          />
        ) : (
          <Dashboard
            user={user}
            onLogout={handleLogoutAndReturnHome}
            onOpenSubjects={() => setDashboardView("subjects")}
          />
        )}
      </div>
    );
  }

  return (
    <div className="app-shell relative">
      <GridBackground />
      <Header onLogoClick={handleLogoClick} />
      <>
        {currentPage === "start" && (
          <StartPage
            onGetStarted={handleGetStarted}
            onLogin={navigateToLogin}
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
      </>
    </div>
  );
}
