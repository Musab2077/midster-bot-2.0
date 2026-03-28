import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Auth from "./components/Auth";
import Chat from "./components/Chat";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/auth", { replace: true });
    }
    const handler = () => {
      if (!localStorage.getItem("token")) navigate("/auth", { replace: true });
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [navigate]);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="dark"
        toastClassName="!rounded-xl !bg-[#13141f] !border !border-white/10 !text-sm !font-light"
        progressClassName="!bg-gradient-to-r from-indigo-400 to-sky-400"
      />
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<Chat />} />
        <Route path="/chat/:videoId/:chatId" element={<Chat />} />
      </Routes>
    </>
  );
}
