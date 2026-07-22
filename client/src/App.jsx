import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Client from "./pages/Client.jsx";
import Admin from "./pages/Admin.jsx";
import Waiting from "./pages/Waiting.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/client" element={<Client />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/waiting" element={<Waiting />} />
    </Routes>
  );
}
