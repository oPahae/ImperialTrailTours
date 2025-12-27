import React, { useState } from 'react';
import { Mail, Lock, CheckCircle, ChevronRight } from 'lucide-react';
import { verifyAuth } from "@/middlewares/adminAuth";

export default function LoginPage({ session }) {
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [popup, setPopup] = useState({ message: "", type: "" });

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/_auth/adminLogin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (!res.ok) {
        setPopup({ message: data.message, type: "error" });
        return;
      }

      setPopup({ message: data.message, type: "success" });

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      setPopup({ message: "Erreur serveur", type: "error" });
    } finally {
      setTimeout(() => {
        setPopup({ message: '', type: '' });
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Login Form Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 px-8 py-12 text-center">
            <div className="w-20 h-20 bg-white rounded-full mx-auto mb-5 flex items-center justify-center shadow-lg">
              <Mail className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">Sign In</h2>
            <p className="text-amber-50 text-lg">Access your admin dashboard</p>
          </div>

          {/* Welcome Message */}
          <div className="px-8 py-6 bg-gray-50 border-b border-gray-200">
            <p className="text-gray-800 text-base mb-3">
              Hello Admin,
            </p>
            <p className="text-gray-600 text-base leading-relaxed">
              Please enter your credentials to continue your journey with us.
            </p>
          </div>

          {/* Login Form */}
          <div className="px-8 py-8">
            <div className="space-y-6">
              {/* Password Field */}
              <div>
                <div className="mb-5">
                  <h3 className="text-2xl font-bold text-gray-800 inline-block border-b-4 border-amber-500 pb-3">
                    Password
                  </h3>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border-2 border-amber-200">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full text-gray-900 text-base font-medium outline-none placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                  />
                  <span className="ml-2 text-gray-700 font-medium">Remember me</span>
                </label>
                {/* <button className="text-amber-600 hover:text-amber-700 font-medium transition-colors">
                  Forgot password?
                </button> */}
              </div>

              {popup.message && (
                <div className={`font-semibold text-center ${popup.type === "success" ? "text-green-600" : "text-red-600"
                  }`}>
                  {popup.message}
                </div>
              )}

              {/* Login Button */}
              <div className="pt-4">
                <button
                  onClick={handleLogin}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center text-lg"
                >
                  <CheckCircle className="mr-2 w-6 h-6" />
                  Sign In to Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps({ req, res }) {
  const admin = verifyAuth(req, res);
  console.log(admin)

  if (admin) {
    return {
      redirect: {
        destination: "./",
        permanent: false,
      },
    };
  }

  return {
    props: { session: null },
  };
}