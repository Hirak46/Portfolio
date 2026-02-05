'use client';

import { motion } from 'framer-motion';
import { Award, Users, BookOpen, Briefcase, CheckCircle, Trophy } from 'lucide-react';
import profileData from '@/data/profile.json';

export default function Experience() {
  return (
    <section id="experience" className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            Professional Experience
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Research, Reviews, Memberships & Recognition
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Work Experience */}
          {profileData.workExperience && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-8"
            >
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
                <Briefcase className="w-6 h-6 text-primary-400" />
                Work Experience
              </h3>
              {profileData.workExperience.map((work, index) => (
                <div key={index} className="mb-6 last:mb-0">
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{work.position}</h4>
                  <p className="text-primary-400 mb-2">{work.organization}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{work.period} | {work.location}</p>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{work.description}</p>
                  <p className="text-sm text-blue-400 mt-2">{work.email}</p>
                </div>
              ))}
            </motion.div>
          )}

          {/* Awards */}
          {profileData.awards && profileData.awards.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-8"
            >
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
                <Trophy className="w-6 h-6 text-yellow-400" />
                Honors & Awards
              </h3>
              {profileData.awards.map((award, index) => (
                <div key={index} className="mb-6 last:mb-0">
                  <h4 className="text-lg font-semibold text-yellow-400">{award.title}</h4>
                  <p className="text-gray-900 dark:text-white mt-2">{award.event}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{award.date}</p>
                  {award.paperId && (
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{award.paperId}</p>
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {/* Review Experience */}
          {profileData.reviewExperience && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-8"
            >
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
                <BookOpen className="w-6 h-6 text-green-400" />
                Review Experience
              </h3>
              
              <div className="mb-6">
                <h4 className="font-semibold text-green-400 mb-3">Journal Reviews</h4>
                <ul className="space-y-2">
                  {profileData.reviewExperience.journals.map((journal, index) => (
                    <li key={index} className="text-gray-700 dark:text-gray-300 text-sm flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      {journal}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-green-400 mb-3">Conference Reviews</h4>
                {profileData.reviewExperience.conferences.map((conf, index) => (
                  <div key={index} className="mb-4 last:mb-0">
                    <p className="text-gray-900 dark:text-white font-medium">{conf.name}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{conf.fullName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{conf.date} | {conf.location}</p>
                    <p className="text-sm text-blue-400">Publisher: {conf.publisher}</p>
                    <p className="text-sm text-green-400">Role: {conf.role}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Memberships */}
          {profileData.memberships && profileData.memberships.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-8"
            >
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
                <Users className="w-6 h-6 text-purple-400" />
                Professional Memberships
              </h3>
              {profileData.memberships.map((membership, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <h4 className="text-lg font-semibold text-purple-400">{membership.organization}</h4>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">{membership.type}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{membership.period}</p>
                </div>
              ))}
            </motion.div>
          )}

          {/* Certifications */}
          {profileData.certifications && profileData.certifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-8 lg:col-span-2"
            >
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
                <Award className="w-6 h-6 text-blue-400" />
                Certifications & Achievements
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {profileData.certifications.map((cert, index) => (
                  <div key={index} className="flex items-start gap-3 bg-gray-100 dark:bg-white/5 rounded-lg p-4">
                    <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{cert}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Volunteer */}
          {profileData.volunteer && profileData.volunteer.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-8 lg:col-span-2"
            >
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
                <Users className="w-6 h-6 text-pink-400" />
                Volunteer Experience
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {profileData.volunteer.map((vol, index) => (
                  <div key={index} className="flex items-start gap-3 bg-gray-100 dark:bg-white/5 rounded-lg p-4">
                    <CheckCircle className="w-5 h-5 text-pink-400 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{vol}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* References */}
          {profileData.references && profileData.references.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-8 lg:col-span-2"
            >
              <h3 className="text-2xl font-bold mb-6 text-white">References</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {profileData.references.map((ref, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-6">
                    <h4 className="text-xl font-semibold text-white mb-2">{ref.name}</h4>
                    <p className="text-primary-400 mb-1">{ref.position}</p>
                    <p className="text-gray-300 text-sm mb-1">{ref.department}</p>
                    <p className="text-gray-300 text-sm mb-3">{ref.institution}, {ref.location}</p>
                    <a href={`mailto:${ref.email}`} className="text-blue-400 hover:text-blue-300 text-sm">
                      {ref.email}
                    </a>
                    {ref.url && (
                      <a 
                        href={ref.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block text-sm text-gray-400 hover:text-gray-300 mt-2"
                      >
                        View Profile →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
