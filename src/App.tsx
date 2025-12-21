import { useState, type CSSProperties } from "react";
import { useAuth } from "./feature/auth/useAuth";
import { StartPage } from "./components/pages/StartPage";
import { Login } from "./components/pages/Login";
import { Register } from "./components/pages/Register";
import { Header, type NavPage } from "./components/Header";
import { HomePage } from "./components/pages/HomePage";
import Dashboard from "./components/Dashboard";
import { EditProfileModal } from "./components/EditProfileModal";
import { ResetPassword } from "./components/pages/ResetPassword";
import { SubjectsPage } from "./components/pages/POC-Page/SubjectsPage";
import { AchievementsPage } from "./components/pages/AchievementsPage";
import { GridBackground } from "./components/GridBackground";
import Ranking from "./components/pages/POC-Page/Ranking"; 

type Page = "start" | "login" | "register" | "ranking";

export default function App() {
  const { user, isAuthenticated, loading, handleLogout, handleLogin, error, refreshUser } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>("ranking");
  const [activePage, setActivePage] = useState<NavPage>("home");
  const [dashboardView, setDashboardView] = useState<"home" | "user_info" | "subjects" | "achievements">("home");
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const isResetRoute = typeof window !== "undefined" && window.location.pathname.includes("reset-password");

  const handleLogoClick = () => {
    if (isAuthenticated) {
      setActivePage("home");
      setDashboardView("home");
      return;
    }
    setCurrentPage("start");
  };

  const handleNavigate = (page: NavPage) => {
    setActivePage(page);
    if (page === "home") {
      setDashboardView("home");
    } else if (page === "explore") {
      setDashboardView("subjects");
    } else if (page === "profile") {
      setDashboardView("user_info");
    }
    // ranking and export can be added when those pages exist
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
      <div className="app-shell relative" style={{ "--app-header-height": "70px" } as CSSProperties}>
        <GridBackground />
        <Header
          onLogoClick={handleLogoClick}
          user={user}
          onProfileClick={() => handleNavigate("profile")}
          activePage={activePage}
          onNavigate={handleNavigate}
        />
        {isEditProfileOpen && (
          <EditProfileModal
            user={user}
            onClose={() => setIsEditProfileOpen(false)}
            onUpdated={async () => {
              await refreshUser();
            }}
          />
        )}
        {dashboardView === "home" ? (
          <HomePage
            user={user}
            onExplore={() => handleNavigate("explore")}
            onContinueRecentCourse={() => handleNavigate("explore")}
          />
        ) : dashboardView === "subjects" ? (
          <SubjectsPage
            onBack={() => {
              refreshUser();
              setDashboardView("user_info");
            }}
            user={user}
            onBookmarked={refreshUser}
          />
        ) : dashboardView === "achievements" ? (
          <AchievementsPage onBack={() => setDashboardView("user_info")} />
        ) : (
          <Dashboard
            user={user}
            onLogout={handleLogoutAndReturnHome}
            onOpenSubjects={() => setDashboardView("subjects")}
            onEditProfile={() => setIsEditProfileOpen(true)}
            onOpenAchievements={() => setDashboardView("achievements")}
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
        {currentPage === "ranking" && (
          <Ranking />
        )}
      </>
    </div>
  );
}
