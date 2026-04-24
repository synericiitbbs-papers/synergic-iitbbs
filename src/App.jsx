import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { useState } from "react";
import "./App.css";

import Navbar from "./Navbar"; 
import Login from "./pages/login section/Login.jsx";
import Contribute from "./pages/contribute section/Contribute.jsx";
import Papers from "./pages/question papers section/Papers.jsx";
import QuestionPaper from "./pages/question papers section/QuestionPapers.jsx";
import Save_Page from "./pages/Saved Pages/Save_Page.jsx";
import ProtectedLayout from "./ProtectedLayout.jsx";
import Contact from "./pages/Contact/Contact.jsx";
import Signup from "./pages/login section/Signup.jsx";
import Subjects from "./pages/special materials/Subjects.jsx";
import SubjectSelection from "./pages/special materials/SubjectSelection.jsx";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("isAuthenticated") === "true";
  });

  const handleAuth = (status) => {
    setIsAuthenticated(status);
    if (status) {
      sessionStorage.setItem("isAuthenticated", "true");
    } else {
      sessionStorage.removeItem("isAuthenticated");
    }
  };

  return (
    <Routes>
      {/* 1. Public Route: Login */}
      <Route
        path="/"
        element={
          !isAuthenticated ? (
            <Login setAuth={handleAuth} />
          ) : (
            <Navigate to="/questionpapers" />
          )
        }
      />

      {/* 2. Public Route: Signup (Moved outside protected if users need to register first) */}
      <Route path="/signup" element={<Signup />} />

      {/* 3. Protected Routes */}
      {isAuthenticated ? (
        <Route
          path="/*"
          element={<ProtectedRouteWrapper handleAuth={handleAuth} />}
        />
      ) : (
        
        <Route path="*" element={<Navigate to="/" />} />
      )}
    </Routes>
  );
}

/**
 * A helper component to handle Navbar visibility 
 * and nested routes within the protected area.
 */
function ProtectedRouteWrapper({ handleAuth }) {
  const location = useLocation();

  // Define paths where Navbar should NOT be visible
  const hideNavbarPaths = ["/ContactUs"];
  const showNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <ProtectedLayout>
      {/* Only show Navbar if not on a hidden path */}
      {showNavbar && <Navbar setAuth={handleAuth} />}
      
      <Routes>
        <Route path="/collections" element={<Save_Page />} />
        <Route path="/questionpapers" element={<Papers />} />
        <Route path="/contribute" element={<Contribute />} />
        <Route path="/questionpapers/:subject" element={<QuestionPaper />} />
        <Route path="/choose-subject/:groupName" element={<SubjectSelection />} />
        <Route path="/ContactUs" element={<Contact />} />
        
        {/* Fallback for protected routes */}
        <Route path="*" element={<Navigate to="/questionpapers" />} />
      </Routes>
    </ProtectedLayout>
  );
}