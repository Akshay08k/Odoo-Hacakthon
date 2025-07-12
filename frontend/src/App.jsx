import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import RegisterPage from "./components/Register";
import LatestQuestions from "./components/latestQuestion";
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/question" element={<LatestQuestions />} />
      </Routes>
    </Router>
  );
};

export default App;
