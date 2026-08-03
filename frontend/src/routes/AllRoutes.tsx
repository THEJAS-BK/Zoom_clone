import { Route, Routes } from "react-router-dom";
import Register from "../components/auth/Register";
import Login from "../components/auth/Login";
import Dashboard from "../pages/Dashboard";
import RoomPage from "../pages/RoomPage";
import Offlineboard from "../pages/Offlineboard";
import ProtectedRoute from "../components/ProtectedRoute";
export default function AllRoutes() {
  return (
    <Routes>
      <Route path="/offlineboard/:id" element={<ProtectedRoute><Offlineboard /></ProtectedRoute>}></Route>
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route
        path="/room/:roomId"
        element={
          <ProtectedRoute>
            <RoomPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
