import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import Home from "./pages/Home";
import About from "./pages/About";
import News from "./pages/News";
import NewsDetails from "./pages/NewsDetails";
import Events from "./pages/Events";
import Presenters from "./pages/Presenters";
import AdWithUs from "./pages/AdWithUs";
import ShowYourTalent from "./pages/ShowYourTalent";
import GetDiscovered from "./pages/GetDiscovered";
import SignUp from "./pages/Auth/Signup";
import Login from "./pages/Auth/Login";
import ForgotPassword from "./context/ForgotPassword";
import Profile from "./pages/Profile";
import ProgramDetails from "./pages/ProgramDetails";

import ProtectedRoute from "./components/Auth/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import { useLiveStream } from "./context/LiveStreamContext";

// Set to true to enable /news and /events routes (and show nav links in Header/Footer)
const SHOW_NEWS_AND_EVENTS_ROUTES = true;

const WHATSAPP_NUMBER = "962789292002"; // +962 789 292 002
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

const App = () => {
  const location = useLocation();
  const { isPlaying, togglePlay } = useLiveStream();
  const showFloatingLive = location.pathname !== "/";

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/program-details" element={<ProgramDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/news" element={SHOW_NEWS_AND_EVENTS_ROUTES ? <News /> : <Navigate to="/" replace />} />
        <Route path="/news-details" element={SHOW_NEWS_AND_EVENTS_ROUTES ? <NewsDetails /> : <Navigate to="/" replace />} />
        <Route path="/events" element={SHOW_NEWS_AND_EVENTS_ROUTES ? <Events /> : <Navigate to="/" replace />} />
        <Route path="/presenters" element={<Presenters />} />
        <Route path="/ad-with-us" element={<AdWithUs />} />
        <Route path="/show-your-talent" element={<ShowYourTalent />} />
        <Route path="/get-discovered" element={<GetDiscovered />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />


        {/* Protected Profile Route */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Unknown routes → redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* WhatsApp: fixed right, vertically centered, round icon only */}
      <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="floating-whatsapp-box"
          title="Chat on WhatsApp"
          aria-label="Chat on WhatsApp"
        >
          <Icon icon="logos:whatsapp-icon" width="28" height="28" />
        </a>
      {/* Listen Live: bottom right (when not on home) */}
      {showFloatingLive && (
        <button
          type="button"
          className="floating-live-box"
          onClick={togglePlay}
          title={isPlaying ? "Pause live" : "Listen live"}
          aria-label={isPlaying ? "Pause live stream" : "Play live stream"}
        >
          <Icon
            icon={isPlaying ? "material-symbols:pause-rounded" : "material-symbols:play-circle-rounded"}
            width="28"
            height="28"
          />
          <span className="floating-live-text">{isPlaying ? "Live" : "Listen Live"}</span>
          {isPlaying && <span className="floating-live-dot" aria-hidden />}
        </button>
      )}
    </>
  );
};

export default App;
