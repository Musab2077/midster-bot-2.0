import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  BrowserRouter,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Auth from "./components/Auth";
import ChatBot from "./components/Chat";
import "./App.css";
import { ToastContainer } from "react-toastify";
import Chat from "./components/Chat";

function App() {
  const [authResponse, setAuthResponse] = useState();
  const [storageResponse, setStorageResponse] = useState();

  const location = useLocation();
  const { response } = location.state || {};

  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/auth", { replace: true });
    }

    const handleStorageChange = () => {
      if (!localStorage.getItem("token")) {
        navigate("/auth", { replace: true });
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate]);

  if (storageResponse === null) {
    return;
  }

  return (
    <>
      <ToastContainer />
      {/* <Bounce/> */}
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<ChatBot />} />
        <Route path="/chat/:chatIds" element={<Chat />} />
      </Routes>
    </>
  );
}

export default App;
