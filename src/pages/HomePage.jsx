import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const HomePage = () => {
  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.5,
        duration: 1,
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
      <motion.div
        className="relative overflow-hidden rounded-3xl shadow-2xl bg-white/10 backdrop-blur-lg p-10 max-w-3xl text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-400 to-pink-500 opacity-20 blur-xl" />

        {/* Main Content */}
        <motion.h1
          className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-pink-300 mb-6 relative z-10"
          variants={itemVariants}
        >
          Unlock the Power of WhatsApp API
        </motion.h1>

        <motion.p
          className="text-lg text-gray-200 mb-8 leading-relaxed relative z-10"
          variants={itemVariants}
        >
          Connect with your customers in a personalized and efficient way using
          the WhatsApp API. Automate your messages, provide instant support, and
          drive meaningful engagement.
        </motion.p>

        {/* Button Section */}
        <motion.div
          className="flex justify-center space-x-4 relative z-10"
          variants={itemVariants}
        >
          {/* Primary Button */}
          <Link to="/templates">
            <motion.button
              className="bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-full shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
          </Link>

          {/* Secondary Button */}
          <motion.button
            className="bg-white/20 hover:bg-white/30 text-gray-200 font-medium py-4 px-8 rounded-full border border-gray-300/50 shadow-md transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Learn More
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HomePage;
