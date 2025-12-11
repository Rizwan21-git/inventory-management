import { motion } from "framer-motion";
import clsx from "clsx";

const Card = ({children,title,subtitle,actions,className,noPadding = "",hoverable = "",...props}) => {
  const cardClasses = clsx(
    "bg-white rounded-xl shadow-card border mt-3",
    hoverable && "card-hover cursor-pointer",
    className
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cardClasses}
      {...props}
    >
      {(title || actions) && (
        <div className="px-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className= "p-2 md:p-4 lg:p-6">{children}</div>
    </motion.div>
  );
};

export default Card;
