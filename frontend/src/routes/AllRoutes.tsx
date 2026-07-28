import { Route, Routes } from "react-router-dom";
import Register from "../components/auth/Register";
import Login from "../components/auth/Login";
import Dashboard from "../pages/Dashboard";
import RoomPage from "../pages/RoomPage";
import ProtectedRoute from "../components/ProtectedRoute";
import Offlineboard from "../pages/Offlineboard";
export default function AllRoutes() {
  return (
    <Routes>
      <Route path="/offlineboard/:id" element={<Offlineboard/>} ></Route>
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/room/:roomId" element={<RoomPage />} />
    </Routes>
  );
}
