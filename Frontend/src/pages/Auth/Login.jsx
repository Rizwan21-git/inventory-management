import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiLock } from "react-icons/fi";
import { login } from "../../slices/authSlice";
import { toast } from "react-hot-toast";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
const Login = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, isAuthenticated, error } = useSelector(
    (state) => state.auth
  );

  // useEffect(() => {
  //   if (isAuthenticated) {
  //     navigate("/");
  //   }
  // }, [isAuthenticated, navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, []);

 


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(credentials);
      await dispatch(login(credentials)).unwrap();
      localStorage.setItem("token", "json-web-token");
      toast.success("Login successful!");
      navigate("/");
    } catch (err) {
      toast.error(
        err?.message || "Login failed. Please check your credentials."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">B</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            icon={FiMail}
            placeholder="admin@example.com"
            value={credentials.email}
            onChange={(e) =>
              setCredentials({ ...credentials, email: e.target.value })
            }
            required
          />

          <Input
            label="Password"
            type="password"
            icon={FiLock}
            placeholder="••••••••"
            value={credentials.password}
            onChange={(e) =>
              setCredentials({ ...credentials, password: e.target.value })
            }
            required
          />

          {error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
              {error.message || "Invalid credentials"}
            </div>
          )}

          <Button type="submit" fullWidth loading={loading} className="mt-6">
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          {/* <p className="text-sm text-gray-500">
            Demo: admin@example.com / password123
          </p> */}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
