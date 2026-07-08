import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RouteScrollToTop from "./helper/RouteScrollToTop";
import SignInPage from "./pages/SignInPage";
import FMPage from "./pages/FMPage";
// import HomePageTen from "./pages/HomePageTen";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminsPage";
import UsersPage from "./pages/UsersPage";
import StaticInfoPage from "./pages/StaticInfoPage";
import StaticInfoAboutUsEditPage from "./pages/StaticInfoAboutUsEditPage";
import BroadcasterPage from "./pages/BroadcasterPage";
import BroadcasterFormPage from "./pages/BroadcasterFormPage";
import ProgramsPage from "./pages/ProgramsPage";
import ProgramFormPage from "./pages/ProgramFormPage";
import NewsPage from "./pages/NewsPage";
import NewsFormPage from "./pages/NewsFormPage";
import EventPage from "./pages/EventPage";
import AdvertisementPage from "./pages/AdvertisementPage";
import InterviewApplicantsPage from "./pages/InterviewApplicantsPage";
import UploadedTracksPage from "./pages/UploadedTracksPage";

import UnauthorizedPage from "./pages/UnauthorizedPage";
import ForgotPasswordLayer from "./components/ForgotPasswordLayer";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoutes";
import Cookie from "js-cookie";

function App() {
  const { user } = useAuth(); // use your context to get user
  
  // Check if token exists in cookie
  const token = Cookie.get("token");
  const isLoggedIn = !!token && !!user?.id;

  return (
    <BrowserRouter
      basename={process.env.NODE_ENV === "production" ? "/cms" : ""}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <RouteScrollToTop />
      <Routes>
        {/* Root route - redirect based on authentication */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Navigate to="/" replace />
            ) : (
              <Navigate to="/sign-in" replace />
            )
          }
        />

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
          path="/static-info/about-us/edit"
          element={
            <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
              <StaticInfoAboutUsEditPage />
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
          path="/broadcasters/new"
          element={
            <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
              <BroadcasterFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/broadcasters/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
              <BroadcasterFormPage />
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
          path="/programs/new"
          element={
            <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
              <ProgramFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/programs/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
              <ProgramFormPage />
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
          path="/news/new"
          element={
            <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
              <NewsFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/news/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
              <NewsFormPage />
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
