import { useEffect, useState, type CSSProperties } from "react";
import Joyride, { type CallBackProps, STATUS, type Step } from "react-joyride";
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

type Page = "start" | "login" | "register";

function getFirstLoginFromCookie(keyBase: string): boolean {
  if (typeof document === "undefined") return false;
  const name = `firstLogin_${keyBase}=`;
  const decodedCookie = decodeURIComponent(document.cookie ?? "");
  const parts = decodedCookie.split(";");
  for (const part of parts) {
    const c = part.trim();
    if (c.startsWith(name)) {
      return c.substring(name.length) === "true";
    }
  }
  return false;
}

function setFirstLoginCookie(keyBase: string, value: boolean) {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 365; // 1 year
  document.cookie = `firstLogin_${keyBase}=${value ? "true" : "false"}; path=/; max-age=${maxAge}`;
}

export default function App() {
  const { user, isAuthenticated, loading, handleLogout, handleLogin, error, refreshUser } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>("start");
  const [activePage, setActivePage] = useState<NavPage>("home");
  const [dashboardView, setDashboardView] = useState<"home" | "user_info" | "subjects" | "achievements">("home");
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const isResetRoute = typeof window !== "undefined" && window.location.pathname.includes("reset-password");

  const [firstLogin, setFirstLogin] = useState(false);

  const [joyrideState, setJoyrideState] = useState<{ run: boolean; stepIndex: number }>({
    run: false,
    stepIndex: 0,
  });

  const joyrideSteps: Step[] = [
  // 0: HOME nav button
  {
    target: "header.header nav button:nth-of-type(1)",
    content: "This is your Home tab where you can see your scores, day streak, and quick actions.",
    placement: "bottom",
    disableBeacon: true,
  },
  // 1: EXPLORE nav button
  {
    target: "header.header nav button:nth-of-type(2)",
    content: "Next, click EXPLORE to discover courses.",
    placement: "bottom",
  },
  // 2: RANKING nav button
  {
    target: "header.header nav button:nth-of-type(3)",
    content: "RANKING shows how you compare with other learners.",
    placement: "bottom",
  },
  // 3: EXPORT nav button
  {
    target: "header.header nav button:nth-of-type(4)",
    content: "EXPORT lets you collect your certificates after completing courses.",
    placement: "bottom",
  },
  // 4: Profile area (right side)
  {
    target: ".header span[style*=\"Poppins\"]", // or a more precise selector you prefer
    content: "Access your profile and settings here.",
    placement: "bottom",
  },
];

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const keyBase = user.userID ? String(user.userID) : user.email ?? "global";
    const completed = getFirstLoginFromCookie(keyBase);
    setFirstLogin(completed);

    if (!completed) {
      setJoyrideState({ run: true, stepIndex: 0 });
    }
  }, [isAuthenticated, user]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, type, action } = data;

    if (!isAuthenticated || !user) return;

    const keyBase = user.userID ? String(user.userID) : user.email ?? "global";

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setFirstLogin(true);
      setFirstLoginCookie(keyBase, true);
      setJoyrideState({ run: false, stepIndex: 0 });
      return;
    }

    if (type === "step:after" && action === "next") {
      setJoyrideState((prev) => ({ ...prev, stepIndex: index + 1 }));

      switch (index) {
        case 0: // nav-home
          handleNavigate("home");
          break;
        case 1: // nav-explore
          handleNavigate("explore");
          break;
        case 2: // nav-ranking
          handleNavigate("ranking");
          break;
        case 3: // nav-export
          handleNavigate("export");
          break;
        case 4: // nav-profile
          handleNavigate("profile");
          break;
        case 5: // home-explore-primary
          handleNavigate("explore");
          break;
        default:
          break;
      }
    }
  };

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
        <Joyride
          steps={joyrideSteps}
          run={joyrideState.run}
          stepIndex={joyrideState.stepIndex}
          continuous
          showProgress
          showSkipButton
          disableOverlayClose
          spotlightClicks
          callback={handleJoyrideCallback}
          locale={{
            back: "Back",
            close: "Skip",
            last: "Finish",     // <- label for the last step's primary button
            next: "Next",
            skip: "Skip",
          }}
          styles={{
            options: {
              zIndex: 10000,
              backgroundColor: "#1c1c1c",   // tooltip background
              primaryColor: "#9D9D23",      // main (Next / Finish) button color
              arrowColor: "#1c1c1c",        // arrow same as background
              textColor: "#ffffff",         // text on dark background
              overlayColor: "rgba(0, 0, 0, 0.6)", // dimmed backdrop (optional)
            },
            buttonNext: {
              backgroundColor: "#9D9D23",
              borderRadius: 9999,
              padding: "6px 18px",
              fontWeight: 600,
              color: "#000000",
            },
            buttonBack: {
              color: "#cccccc",
            },
            tooltip: {
              backgroundColor: "#1c1c1c",
              borderRadius: 12,
              padding: "14px 16px",
              boxShadow: "0 20px 45px rgba(0,0,0,0.7)",
            },
          }}
        />
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
      </>
    </div>
  );
}
