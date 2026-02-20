"use client";

import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Download } from "lucide-react";
import profileData from "@/data/profile.json";
import SectionTitle from "./SectionTitle";
import Image from "next/image";

export default function About() {
  return (
    <section
      id="about"
      className="min-h-screen py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          title="About Me"
          subtitle="Academic background and research interests"
        />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Profile Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-1"
          >
            <div className="lg:sticky lg:top-24">
              <div className="relative w-full aspect-square max-w-xs sm:max-w-sm mx-auto">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-500 to-purple-500 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
                <div className="relative glass rounded-3xl p-2 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center overflow-hidden">
                    <Image
                      src="/Abou.jpg"
                      alt="Profile"
                      width={400}
                      height={400}
                      className="w-full h-full object-cover rounded-2xl"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Download CV Button */}
              <motion.a
                href="/cv/Hirak.pdf"
                download
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
              >
                <Download className="w-5 h-5" />
                Download CV
              </motion.a>
            </div>
          </motion.div>

          {/* Right Column - Biography & Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Biography */}
            <div className="glass rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-primary-400" />
                Biography
              </h3>

              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                {profileData.bio}
              </p>
            </div>

            {/* Research Interests */}
            <div className="glass rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-4 text-primary-400">
                Research Interests
              </h3>
              <div className="flex flex-wrap gap-3">
                {profileData.interests.map((interest) => (
                  <motion.span
                    key={interest}
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 rounded-full bg-primary-500/20 text-primary-700 dark:text-primary-300 text-sm border border-primary-500/30 hover:bg-primary-500/30 transition-colors"
                  >
                    {interest}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="glass rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
                <GraduationCap className="w-6 h-6 text-primary-400" />
                Education
              </h3>

              <div className="space-y-6">
                {profileData.education.map((edu, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pl-8 pb-6 border-l-2 border-primary-500/30 last:pb-0"
                  >
                    <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-primary-500 -translate-x-[9px]"></div>

                    <div className="space-y-2">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {edu.degree}
                      </h4>
                      <p className="text-primary-400 font-medium">
                        {edu.institution}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {edu.year}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {edu.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Skills/Tools */}
            <div className="glass rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6">Tools & Technologies</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[
                  "Python",
                  "C/C++",
                  "Java",
                  "TensorFlow",
                  "PyTorch",
                  "MySQL",
                  "Node.js",
                  "Git",
                ].map((skill) => (
                  <motion.div
                    key={skill}
                    whileHover={{ scale: 1.08, y: -5 }}
                    className="p-4 rounded-xl bg-gradient-to-br from-primary-500/10 to-purple-500/10 text-center hover:from-primary-500/20 hover:to-purple-500/20 transition-all border border-primary-500/20 hover:border-primary-500/40"
                  >
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {skill}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
