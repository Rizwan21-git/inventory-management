// import { useState, useEffect } from "react";
// import { Outlet } from "react-router-dom";
// import Sidebar from "./Sidebar";
// import Header from "./Header";
// import Footer from "./Footer";

// const Layout = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(true);

//   useEffect(() => {
//     const handleResize = () => {
//       if (window.innerWidth < 1024) {
//         setSidebarOpen(false);
//       } else {
//         setSidebarOpen(true);
//       }
//     };

//     // Set initial state
//     handleResize();

//     // Listen for window resize
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Sidebar
//         isOpen={sidebarOpen}
//         onToggle={() => setSidebarOpen(!sidebarOpen)}
//       />

//       <div
//         className={`transition-all duration-300 ${
//           sidebarOpen ? "ml-64" : "ml-16"
//         }`}
//       >
//         <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

//         <main>
//           <div className="p-6">
//             <Outlet />
//           </div>
//         </main>
//       </div>
//       <Footer />
//     </div>
//   );
// };

// export default Layout;







// Layout.jsx
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsMobile(true);
        setSidebarOpen(false);
      } else {
        setIsMobile(false);
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} isMobile={isMobile} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div
        className={`transition-all duration-300 min-h-screen ${
          isMobile
            ? "ml-0"
            : sidebarOpen
            ? "ml-64"
            : "ml-16"
        }`}
      >
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main>
          <div className="p-3 md:p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
