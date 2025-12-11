// import React, { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import { FiLock, FiEye, FiEyeOff, FiUser } from "react-icons/fi";
// import { login } from "../../slices/authSlice";
// import { toast } from "react-hot-toast";
// import Input from "../../components/common/Input";
// import Button from "../../components/common/Button";

// const Login = () => {
//   const [credentials, setCredentials] = useState({
//     username: "",
//     password: "",
//   });
//   const [showPassword, setShowPassword] = useState(false); // <--- new state
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { loading, isAuthenticated, error } = useSelector(
//     (state) => state.auth
//   );

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token && isAuthenticated) {
//       navigate("/");
//     }
//   }, [isAuthenticated, navigate]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await dispatch(login(credentials)).unwrap();
//       if (response.token) {
//         localStorage.setItem("token", response.token);
//       }
//       toast.success("Login successful!");
//       navigate("/");
//     } catch (err) {
//       toast.error(
//         err?.message || "Login failed. Please check your credentials."
//       );
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
//       >
//         <div className="text-center mb-8">
//           <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
//             <span className="text-white font-bold text-2xl">B</span>
//           </div>
//           <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
//           <p className="text-gray-500 mt-2">Sign in to your account</p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <Input
//             label="Username"
//             type="text"
//             icon={FiUser}
//             placeholder="Enter your username"
//             value={credentials.username}
//             onChange={(e) =>
//               setCredentials({ ...credentials, username: e.target.value })
//             }
//             required
//           />

//           <Input
//             label="Password"
//             type={showPassword ? "text" : "password"} // <--- toggle type
//             icon={FiLock}
//             placeholder="••••••••"
//             value={credentials.password}
//             onChange={(e) =>
//               setCredentials({ ...credentials, password: e.target.value })
//             }
//             required
//             RightIcon={showPassword ? FiEyeOff : FiEye}
//             onRightIconClick={() => setShowPassword(!showPassword)}
//           />

//           {error && (
//             <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
//               {error.message || "Invalid credentials"}
//             </div>
//           )}

//           <Button type="submit" fullWidth loading={loading} className="mt-6">
//             Sign In
//           </Button>
//         </form>
//       </motion.div>
//     </div>
//   );
// };

// export default Login;



import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue } from "framer-motion";
import { FiLock, FiEye, FiEyeOff, FiUser, FiArrowRight } from "react-icons/fi";
import { login } from "../../slices/authSlice";
import { toast } from "react-hot-toast";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

// ===================== 3D DOOR =====================
const Premium3DDoor = ({ delay = 0 }) => {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(-20);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 1, type: "spring" }}
      className="absolute"
      style={{ left: "5%", top: "10%", perspective: 1200 }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        rotateY.set(x * 20);
        rotateX.set(y * 20);
      }}
      onMouseLeave={() => {
        rotateX.set(0);
        rotateY.set(-20);
      }}
    >
      <motion.svg
        width="140"
        height="200"
        viewBox="0 0 140 200"
        animate={{ rotateX, rotateY }}
        transition={{ type: "spring", damping: 20 }}
      >
        <defs>
          <linearGradient id="doorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <linearGradient id="doorPanel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
        </defs>

        <rect
          x="10"
          y="10"
          width="120"
          height="180"
          fill="url(#doorGradient)"
          rx="12"
          filter="drop-shadow(0 20px 40px rgba(0,0,0,0.2))"
        />

        <motion.rect
          x="18"
          y="18"
          width="104"
          height="164"
          fill="url(#doorPanel)"
          rx="10"
          animate={{ x: [18, 22, 18], rotateZ: [0, 6, 0] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay,
          }}
        />

        <line
          x1="70"
          y1="25"
          x2="70"
          y2="175"
          stroke="#93C5FD"
          strokeWidth="2"
          opacity="0.6"
        />
        <line
          x1="25"
          y1="110"
          x2="115"
          y2="110"
          stroke="#93C5FD"
          strokeWidth="1.5"
          opacity="0.4"
        />

        <motion.circle
          cx="105"
          cy="110"
          r="6"
          fill="#60A5FA"
          filter="drop-shadow(0 0 6px rgba(96,165,250,0.6))"
          animate={{
            r: [6, 8, 6],
            boxShadow: [
              "0 0 6px rgba(96,165,250,0.6)",
              "0 0 12px rgba(96,165,250,0.9)",
              "0 0 6px rgba(96,165,250,0.6)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        <motion.ellipse
          cx="45"
          cy="60"
          rx="15"
          ry="30"
          fill="white"
          opacity="0.1"
          animate={{ opacity: [0.05, 0.2, 0.05] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </motion.svg>
    </motion.div>
  );
};

// ===================== MINI FLOATING CLOUDS =====================
const FloatingClouds = () => {
  const layers = [
    { count: 5, yOffset: 5, size: [60, 100], speed: 20 },
    { count: 3, yOffset: 15, size: [80, 140], speed: 35 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {layers.map((layer, i) =>
        Array.from({ length: layer.count }).map((_, j) => {
          const scale = Math.random() * 0.5 + 0.8;
          return (
            <motion.div
              key={`${i}-${j}`}
              className="absolute bg-white/50 rounded-full shadow-xl"
              style={{
                width:
                  (Math.random() * (layer.size[1] - layer.size[0]) +
                    layer.size[0]) *
                  scale,
                height:
                  ((Math.random() * (layer.size[1] - layer.size[0]) +
                    layer.size[0]) /
                    2) *
                  scale,
                left: `${Math.random() * 100}%`,
                top: `${layer.yOffset + Math.random() * 10}%`,
              }}
              animate={{ x: [0, 30, -20, 0] }}
              transition={{
                duration: layer.speed + Math.random() * 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          );
        })
      )}
    </div>
  );
};

// ===================== SUBTLE SKY-CHANDLER =====================
const SubtleChandelier = ({ delay = 0 }) => (
  <motion.svg
    width="60"
    height="120"
    viewBox="0 0 60 120"
    className="absolute"
    style={{ right: "10%", top: "5%" }}
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 1, type: "spring" }}
  >
    <line x1="30" y1="0" x2="30" y2="40" stroke="#60A5FA" strokeWidth="2" />
    <motion.g
      animate={{ rotateZ: [0, 3, 0, -3, 0] }}
      transition={{ duration: 4, repeat: Infinity }}
    >
      <path
        d="M15 40 Q30 25 45 40 L42 50 Q30 45 18 50 Z"
        fill="#93C5FD"
        stroke="#60A5FA"
        strokeWidth="1"
      />
      <circle
        cx="30"
        cy="60"
        r="4"
        fill="#60A5FA"
        filter="drop-shadow(0 0 4px rgba(96,165,250,0.5))"
      />
    </motion.g>
  </motion.svg>
);

// ===================== ADDITIONAL FLOATING OBJECTS =====================
const SkyObjects = () => {
  const objects = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    type: Math.random() > 0.5 ? "circle" : "square",
    size: Math.random() * 40 + 20,
    x: Math.random() * 80 + 10,
    y: Math.random() * 60 + 10,
    rotate: Math.random() * 360,
    speed: Math.random() * 15 + 10,
  }));

  return (
    <>
      {objects.map((obj) => (
        <motion.div
          key={obj.id}
          className={`absolute ${
            obj.type === "circle" ? "rounded-full" : "rounded-lg"
          } bg-gradient-to-br from-sky-400 to-sky-600 opacity-30`}
          style={{
            width: obj.size,
            height: obj.size,
            left: `${obj.x}%`,
            top: `${obj.y}%`,
            rotate: obj.rotate,
          }}
          animate={{ y: [0, 20, -10, 0], rotate: [0, 360, -360, 0] }}
          transition={{
            duration: obj.speed,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
};

// ===================== FLOATING PARTICLES =====================
// const FloatingParticles = () => {
//   const particles = Array.from({ length: 25 }, (_, i) => ({
//     id: i,
//     x: Math.random() * 100,
//     y: Math.random() * 100,
//     size: Math.random() * 1+1,
//     duration: Math.random() * 0 + 15,
//   }));

//   return (
//     <div className="absolute inset-0 overflow-hidden pointer-events-none">
//       {particles.map((p) => (
//         <motion.div
//           key={p.id}
//           className="absolute rounded-full bg-gradient-to-br from-sky-400 to-sky-600"
//           style={{
//             width: p.size,
//             height: p.size,
//             left: `${p.x}%`,
//             top: `${p.y}%`,
//             opacity: 0.4,
//           }}
//           animate={{ y: [0, -100, 0], x: [0, 30, 0], opacity: [0.2, 0.6, 0.2] }}
//           transition={{
//             duration: p.duration,
//             repeat: Infinity,
//             ease: "easeInOut",
//           }}
//         />
//       ))}
//     </div>
//   );
// };

// ===================== LOGIN COMPONENT =====================
const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, isAuthenticated, error } = useSelector(
    (state) => state.auth
  );
  const containerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  const handleMouseMove = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await dispatch(login(credentials)).unwrap();
      if (response.token) localStorage.setItem("token", response.token);
      toast.success("Logged in successfully!");
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      toast.error(err?.message || "Invalid credentials");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="min-h-screen relative overflow-hidden bg-gradient-to-br from-sky-900 via-sky-100 to-sky-900"
    >
      {/* BACKGROUND */}
      {/* <FloatingParticles /> */}
      {/* <FloatingClouds /> */}
      {/* <SkyObjects /> */}

      {/* GRADIENT OVERLAYS */}
      <motion.div
        className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-sky-400 to-transparent rounded-full blur-3xl"
        animate={{
          x: mousePosition.x * 50 - 192,
          y: mousePosition.y * 50 - 192,
        }}
        transition={{ type: "spring", damping: 30 }}
        style={{ opacity: 0.15 }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-sky-400 to-transparent rounded-full blur-3xl"
        animate={{
          x: (1 - mousePosition.x) * 50,
          y: (1 - mousePosition.y) * 50,
        }}
        transition={{ type: "spring", damping: 30 }}
        style={{ opacity: 0.15 }}
      />

      <div className="relative z-10 max-h-dvh flex items-center justify-center p-4">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* LEFT: Login Form */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="flex justify-center lg:justify-end"
          >
            <motion.div
              className="relative w-full max-w-md"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="absolute -inset-2 bg-gradient-to-r from-sky-400 via-sky-300 to-sky-400 rounded-3xl opacity-20 blur-xl" />
              <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
                <div className="text-center mb-8">
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-sky-400 to-sky-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", damping: 10 }}
                  >
                    <span className="text-white font-bold text-2xl">S</span>
                  </motion.div>
                  <motion.h1
                    className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    Welcome Back
                  </motion.h1>
                  <motion.p
                    className="text-gray-600 mt-2 font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    Sign in to explore premium interiors
                  </motion.p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Input
                      label="Username"
                      type="text"
                      icon={FiUser}
                      placeholder="Enter your username"
                      value={credentials.username}
                      onChange={(e) =>
                        setCredentials({
                          ...credentials,
                          username: e.target.value,
                        })
                      }
                      required
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Input
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      icon={FiLock}
                      placeholder="••••••••"
                      value={credentials.password}
                      onChange={(e) =>
                        setCredentials({
                          ...credentials,
                          password: e.target.value,
                        })
                      }
                      required
                      RightIcon={showPassword ? FiEyeOff : FiEye}
                      onRightIconClick={() => setShowPassword(!showPassword)}
                    />
                  </motion.div>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="bg-gradient-to-r from-red-50 to-sky-100 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full" />
                        {error.message || "Invalid credentials"}
                      </span>
                    </motion.div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Button
                      type="submit"
                      fullWidth
                      loading={loading || isSubmitting}
                      className="mt-6 relative group overflow-hidden bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <span className="flex items-center justify-center gap-2">
                        Sign In
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <FiArrowRight />
                        </motion.span>
                      </span>
                    </Button>
                  </motion.div>
                </form>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT SIDE: PREMIUM SKY SHOWCASE */}
          <motion.div
            className="hidden lg:flex relative h-screen max-h-screen items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="relative w-full h-full max-w-2xl max-h-[600px] flex items-center justify-center">
              {/* Dynamic gradient background */}
              <motion.div
                className="absolute inset-0 rounded-3xl bg-gradient-to-br from-sky-100 via-sky-50 to-sky-200"
                animate={{ scale: [1, 1.08, 1], rotate: [0, 2, 0] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Original objects + enhanced sky decorations */}
              <Premium3DDoor delay={0.2} />
              <SubtleChandelier delay={0.5} />

              <motion.div
                className="absolute w-32 h-32 border-2 border-red-700 rounded-full opacity-80"
                style={{ right: "5%", top: "15%" }}
                animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute w-24 h-24 border border-orange-900 rounded-lg opacity-90"
                style={{ left: "10%", bottom: "20%" }}
                animate={{ y: [0, 30, 0], rotate: [-100, 10, 100] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Floating text elements */}
              <motion.div
                className="absolute top-70 left-12 text-orange-600 font-bold text-lg opacity-80"
                animate={{ y: [0, 90, 0] }}
                transition={{ duration: 9, repeat: Infinity }}
              >
                Access Restricted – Please enter your credentials to proceed.
              </motion.div>
              <motion.div
                className="absolute bottom-32 right-16 text-amber-500 font-semibold text-sm opacity-50"
                animate={{ x: [0, 15, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                Premium Interiors
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;