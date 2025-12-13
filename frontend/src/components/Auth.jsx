import React, { use, useEffect, useState } from "react";
import { IoEye } from "react-icons/io5";
import { IoEyeOff } from "react-icons/io5";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { GiConsoleController } from "react-icons/gi";

export default function Auth(props) {
  const [showPassword, setShowPassword] = useState(true);
  const [switchAuthOptions, setSwitchAuthOptions] = useState(true);
  const [emailResponse, setEmailResponse] = useState();
  const [passwordResponse, setPasswordResponse] = useState();

  const navigate = useNavigate();
  const localHostURL = "http://127.0.0.1:8000";

  const handleSignUp = async () => {
    try {
      const response = await axios.post(`${localHostURL}/auth/register`, {
        email: emailResponse,
        password: passwordResponse,
      });
      console.log(response.data);
      toast.success(response.data["response"]);
      navigate("/");
      localStorage.setItem("token", response.data.access_token);
    } catch (error) {
      if (error.response.status == 400) {
        toast.error("Email is taken");
      } else {
        toast.error(error.message);
      }
    }
  };

  const handleSignIn = async () => {
    try {
      const response = await axios.post(`${localHostURL}/auth/login`, {
        email: emailResponse,
        password: passwordResponse,
      });
      console.log(response.data);
      toast.success(response.data["response"]);
      localStorage.setItem("token", response.data.access_token);
      navigate("/");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleContinue = (e) => {
    e.preventDefault();
    switchAuthOptions ? handleSignIn() : handleSignUp();
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Log in to your MidsterBot account
            </p>
          </div>

          <form className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  onChange={(e) => setEmailResponse(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2  shadow-sm focus:border-black focus:outline-none focus:ring-black"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="border-blue-800 flex items-center space-x-1">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "password" : "text"}
                    autoComplete="password"
                    required
                    onChange={(e) => setPasswordResponse(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-black"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPassword(!showPassword);
                    }}
                  >
                    {showPassword ? <IoEyeOff /> : <IoEye />}
                  </button>
                </div>
              </div>
              {/* <div>
                <button className="mt-7 w-full border border-gray-300 px-3 py-2 rounded-md flex justify-center space-x-2">
                  <FcGoogle size={25} />
                  <div>
                    Google
                  </div>
                </button>
              </div> */}
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center rounded-md border border-gray-300 bg-black py-2 px-4 text-sm font-medium text-white hover:bg-gray-800 shadow-sm"
                  onClick={handleContinue}
                >
                  Continue
                </button>
              </div>
            </div>
          </form>

          <div className="text-center text-xs text-gray-500">
            {switchAuthOptions ? "Don't have an account?" : ""}
            <button
              className="text-blue-600 ml-1 hover:underline"
              onClick={() => setSwitchAuthOptions(!switchAuthOptions)}
            >
              {switchAuthOptions ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
