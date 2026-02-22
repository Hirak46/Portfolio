"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope } from "react-icons/fa";
import { SiGooglescholar, SiOrcid, SiResearchgate } from "react-icons/si";
import profileData from "@/data/profile.json";
import AnimatedCounter from "./AnimatedCounter";

export default function Hero() {
  const socialIcons = [
    {
      name: "Google Scholar",
      icon: SiGooglescholar,
      url: profileData.social.scholar,
      color: "hover:text-blue-400",
    },
    {
      name: "GitHub",
      icon: FaGithub,
      url: profileData.social.github,
      color: "hover:text-gray-400",
    },
    {
      name: "LinkedIn",
      icon: FaLinkedin,
      url: profileData.social.linkedin,
      color: "hover:text-blue-500",
    },

    {
      name: "ORCID",
      icon: SiOrcid,
      url: profileData.social.orcid,
      color: "hover:text-green-500",
    },
    {
      name: "ResearchGate",
      icon: SiResearchgate,
      url: profileData.social.researchgate,
      color: "hover:text-cyan-400",
    },
  ];

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16 sm:pt-20 md:pt-24"
    >
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-primary-500/20 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-purple-500/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
          {/* Left side - Text content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight"
            >
              <span className="gradient-text">{profileData.name}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-light"
            >
              {profileData.title}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-xl"
            >
              {profileData.tagline}
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-6 sm:pt-8"
            >
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary-400">
                  <AnimatedCounter
                    end={profileData.stats.publications}
                    duration={2}
                  />
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Publications
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary-400">
                  <AnimatedCounter
                    end={profileData.stats.citations}
                    duration={2}
                  />
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Citations
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary-400">
                  <AnimatedCounter
                    end={profileData.stats.hIndex}
                    duration={2}
                  />
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  h-index
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary-400">
                  <AnimatedCounter
                    end={profileData.stats.i10Index}
                    duration={2}
                  />
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  i10-index
                </div>
              </div>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="flex space-x-4 pt-4"
            >
              {socialIcons.map(({ name, icon: Icon, url, color }, index) => (
                <motion.a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, y: -5 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-3 rounded-full glass transition-colors ${color}`}
                  aria-label={name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                >
                  <Icon className="w-6 h-6" />
                </motion.a>
              ))}
            </motion.div>
          </motion.div>

          {/* Right side - Profile image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative"
          >
            <div className="relative w-full aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-500 to-purple-500 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
              <div className="relative glass rounded-3xl p-2 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center overflow-hidden">
                  {/* Profile Image */}
                  <Image
                    src={profileData.photo}
                    alt={profileData.name}
                    width={500}
                    height={500}
                    className="w-full h-full object-cover rounded-2xl"
                    priority
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center pt-2"
        >
          <div className="w-1 h-2 bg-gray-400 rounded-full"></div>
        </motion.div>
      </motion.div>
    </section>
  );
}
