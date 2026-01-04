import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RouteScrollToTop from "./helper/RouteScrollToTop";
import SignInPage from "./pages/SignInPage";
import FMPage from "./pages/FMPage";
// import HomePageTen from "./pages/HomePageTen";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminsPage";
import UsersPage from "./pages/UsersPage";
import StaticInfoPage from "./pages/StaticInfoPage";
import BroadcasterPage from "./pages/BroadcasterPage";
import ProgramsPage from "./pages/ProgramsPage";
import NewsPage from "./pages/NewsPage";
import EventPage from "./pages/EventPage";
import AdvertisementPage from "./pages/AdvertisementPage";
import InterviewApplicantsPage from "./pages/InterviewApplicantsPage";
import UploadedTracksPage from "./pages/UploadedTracksPage";

import UnauthorizedPage from "./pages/UnauthorizedPage";
import ForgotPasswordLayer from "./components/ForgotPasswordLayer";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoutes";

function App() {
  const { user } = useAuth(); // use your context to get user

  return (
    <BrowserRouter>
      <RouteScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordLayer />} />

        {/* Protected Route for Admins and SuperAdmins */}
        {/* <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <HomePageTen />
            </ProtectedRoute>
          }
        /> */}

        <Route
          path="/fm"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <FMPage />
            </ProtectedRoute>
          }
        />

        <Route path="/profile" element={<ProfilePage />} />

        <Route
          path="/admins"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
              <UsersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/static-info"
          element={
            <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
              <StaticInfoPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/broadcasters"
          element={
            <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
              <BroadcasterPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/programs"
          element={
            <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
              <ProgramsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/news"
          element={
            <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
              <NewsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/events"
          element={
            <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
              <EventPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/advertisement"
          element={
            <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
              <AdvertisementPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview-applicants"
          element={
            <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
              <InterviewApplicantsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/uploaded-tracks"
          element={
            <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
              <UploadedTracksPage />
            </ProtectedRoute>
          }
        />

        {/*
        <Route
          path="/categories"
          element={
            <ProtectedRoute allowedRoles={['admin', 'superadmin']} >
              <CategoriesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute allowedRoles={['admin', 'superadmin']} >
              <ProductsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/quotations"
          element={
            <ProtectedRoute allowedRoles={['admin', 'superadmin']} >
              <QuotationPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/files"
          element={
            <ProtectedRoute allowedRoles={['admin', 'superadmin']} >
              <FileCenterPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/contact-us"
          element={
            <ProtectedRoute allowedRoles={['admin', 'superadmin']} >
              <ContactUsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/gallery"
          element={
            <ProtectedRoute allowedRoles={['admin', 'superadmin']} >
              <GalleryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/videoGallery"
          element={
            <ProtectedRoute allowedRoles={['admin', 'superadmin']} >
              <VideoGalleryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/posts"
          element={
            <ProtectedRoute allowedRoles={['admin', 'superadmin']} >
              <PostsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cvs"
          element={
            <ProtectedRoute allowedRoles={['admin', 'superadmin']} >
              <CvPage />
            </ProtectedRoute>
          }
        /> */}

        {/* Unauthorized access */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Catch all route */}
        <Route
          path="*"
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <Navigate to="/sign-in" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
