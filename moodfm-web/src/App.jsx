import { Routes, Route } from "react-router-dom";
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

const App = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/program-details" element={<ProgramDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/news" element={<News />} />
        <Route path="/news-details" element={<NewsDetails />} />
        <Route path="/events" element={<Events />} />
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
      </Routes>
    </>
  );
};

export default App;
