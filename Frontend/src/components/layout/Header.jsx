// import React from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { FiMenu, FiBell, FiUser, FiLogOut } from "react-icons/fi";
// import { logout } from "../../slices/authSlice";
// import { toast } from "react-hot-toast";

// const Header = ({ onMenuClick }) => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { user } = useSelector((state) => state.auth);

//   const handleLogout = async () => {
//     try {
//       await dispatch(logout()).unwrap();
//       toast.success("Logged out successfully");
//       navigate("/login");
//     } catch (error) {
//       toast.error("Logout failed");
//     }
//   };

//   return (
//     <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20">
//       <div className="flex items-center justify-between">
//         <button
//           onClick={onMenuClick}
//           className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//         >
//           <FiMenu className="w-6 h-6 text-gray-600" />
//         </button>

//         <div className="flex items-center gap-4">
//           <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
//             <FiBell className="w-6 h-6 text-gray-600" />
//             <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full" />
//           </button>

//           <div className="flex items-center gap-3">
//             <div className="text-right">
//               <p className="text-sm font-medium text-gray-900">
//                 {user?.name || "Admin User"}
//               </p>
//               <p className="text-xs text-gray-500 capitalize">
//                 {user?.role || "admin"}
//               </p>
//             </div>
//             <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
//               <FiUser className="w-5 h-5 text-primary-600" />
//             </div>
//           </div>

//           <button
//             onClick={handleLogout}
//             className="p-2 hover:bg-danger-50 rounded-lg transition-colors group"
//           >
//             <FiLogOut className="w-6 h-6 text-gray-600 group-hover:text-danger-600" />
//           </button>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;



// File: src/components/layout/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiBell, FiUser, FiLogOut } from 'react-icons/fi';
import { logout } from '../../slices/authSlice';
import { toast } from 'react-hot-toast';

const Header = ({ onMenuClick }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // close notification dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!notifRef.current) return;
      if (!notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20">
      <div className="flex items-center justify-between">
        {/* left: menu button */}
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiMenu className="w-6 h-6 text-gray-600" />
        </button>

        {/* right: notifications + user */}
        <div className="relative flex items-center gap-4">
          {/* notification bell */}
          <button
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiBell className="w-6 h-6 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full" />
          </button>

          {/* notification dropdown */}
          {isNotifOpen && (
            <div
              ref={notifRef}
              className="absolute right-0 mt-10 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-30"
            >
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">
                  Notifications
                </span>
                <span className="text-xs text-gray-500">No new alerts</span>
              </div>
              <div className="p-4 text-sm text-gray-500">
                No notification rigth now.
                Check back later.
              </div>
            </div>
          )}

          {/* user info */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.name || 'Admin User'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role || 'admin'}
              </p>
            </div>
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <FiUser className="w-5 h-5 text-primary-600" />
            </div>
          </div>

          {/* logout button */}
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-danger-50 rounded-lg transition-colors group"
          >
            <FiLogOut className="w-6 h-6 text-gray-600 group-hover:text-danger-600" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
