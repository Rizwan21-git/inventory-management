import clsx from "clsx";

const Input = ({
  label,
  error,
  helperText,
  icon: Icon,
  className,
  containerClassName,
  ...props
}) => {
  const inputClasses = clsx(
    "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200",
    error ? "border-danger-500" : "border-gray-300",
    Icon && "pl-10",
    props.disabled && "bg-gray-50 cursor-not-allowed",
    className
  );

  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {props.required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input className={inputClasses} {...props} />
      </div>
      {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;





// import React from "react";
// import clsx from "clsx";

// const Input = ({
//   label,
//   error,
//   helperText,
//   icon: Icon,
//   className,
//   containerClassName,
//   type = "text",
//   ...props
// }) => {
//   const inputClasses = clsx(
//     "w-full px-3 md:px-4 py-2 md:py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm md:text-base",
//     error ? "border-danger-500" : "border-gray-300",
//     Icon && "pl-10",
//     props.disabled && "bg-gray-50 cursor-not-allowed",
//     className
//   );

//   return (
//     <div className={containerClassName}>
//       {label && (
//         <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
//           {label}
//         </label>
//       )}
//       <div className="relative">
//         {Icon && (
//           <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 md:w-5 h-4 md:h-5" />
//         )}
//         <input type={type} className={inputClasses} {...props} />
//       </div>
//       {error && (
//         <p className="text-xs md:text-sm text-danger-600 mt-1">{error}</p>
//       )}
//       {helperText && !error && (
//         <p className="text-xs md:text-sm text-gray-500 mt-1">{helperText}</p>
//       )}
//     </div>
//   );
// };

// export default Input;
