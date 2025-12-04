import React from "react";
import { motion } from "framer-motion";

const LoadingSpinner = ({ fullScreen = false, size = "lg" }) => {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  const Spinner = () => (
    <motion.div
      className={`${sizes[size]} border-4 border-primary-200 border-t-primary-600 rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );

  // if (fullScreen) {
  //   return (
  //     <div className="fixed inset-0 flex items-center justify-center ">
  //       <div className="text-center">
  //         <Spinner />
  //         <p className="mt-4 text-gray-600 font-medium">Loading...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="flex items-center justify-center p-8">
      <Spinner />
    </div>
  );
};

export default LoadingSpinner;
