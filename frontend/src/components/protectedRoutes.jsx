import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (user === null) return <div>Loading...</div>; // still checking
  if (user === false) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
