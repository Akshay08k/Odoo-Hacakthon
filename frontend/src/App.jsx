import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import RegisterPage from "./components/Register";
import LatestQuestions from "./components/latestQuestion";
import { AuthProvider } from "./contexts/authContext";
import ProtectedRoute from "./components/protectedRoutes";
import QuestionDetail from "./components/questionalDetails";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <LatestQuestions />
              </ProtectedRoute>
            }
          />
          <Route path="/question/:id" element={<QuestionDetail />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
