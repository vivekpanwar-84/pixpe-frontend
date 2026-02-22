"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ClipboardCheck } from "lucide-react";
import { useAuthContext } from "@/providers/AuthContext";

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuthContext();

  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.push("/role-detection");
      } else {
        router.push("/login");
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [router, isAuthenticated, loading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1.1, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 0.5
          }}
          className="inline-block mb-6"
        >
          <div className="bg-white rounded-3xl p-6 shadow-2xl">
            <ClipboardCheck className="w-16 h-16 md:w-20 md:h-20 text-blue-600" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2"
        >
          Pixpe
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-blue-100 text-sm md:text-base"
        >
          Professional Survey Management System
        </motion.p>
      </motion.div>
    </div>
  );
}
