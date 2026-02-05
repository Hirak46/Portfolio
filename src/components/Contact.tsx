'use client';

import { motion } from 'framer-motion';
import { Mail, MapPin, Phone } from 'lucide-react';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { SiGooglescholar, SiOrcid, SiResearchgate } from 'react-icons/si';
import profileData from '@/data/profile.json';
import SectionTitle from './SectionTitle';

export default function Contact() {
  const contactMethods = [
    {
      icon: Mail,
      label: 'Email',
      value: profileData.email,
      href: `mailto:${profileData.email}`,
    },
    {
      icon: MapPin,
      label: 'Location',
      value: 'University Campus, City, Country',
      href: null,
    },
    {
      icon: Phone,
      label: 'Office Hours',
      value: 'By appointment',
      href: null,
    },
  ];

  const socialLinks = [
    { icon: SiGooglescholar, name: 'Google Scholar', url: profileData.social.scholar, color: 'hover:text-blue-400' },
    { icon: FaGithub, name: 'GitHub', url: profileData.social.github, color: 'hover:text-gray-400' },
    { icon: FaLinkedin, name: 'LinkedIn', url: profileData.social.linkedin, color: 'hover:text-blue-500' },
    { icon: SiOrcid, name: 'ORCID', url: profileData.social.orcid, color: 'hover:text-green-500' },
    { icon: SiResearchgate, name: 'ResearchGate', url: profileData.social.researchgate, color: 'hover:text-cyan-400' },
  ];

  return (
    <section id="contact" className="min-h-screen py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          title="Get In Touch"
          subtitle="Feel free to reach out for collaborations or questions"
        />

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 max-w-5xl mx-auto">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4 sm:space-y-6"
          >
            <div className="glass rounded-2xl p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Contact Information</h3>
              
              {contactMethods.map(({ icon: Icon, label, value, href }, index) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 sm:gap-4"
                >
                  <div className="p-2 sm:p-3 rounded-lg bg-primary-500/20 flex-shrink-0">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
                    {href ? (
                      <a
                        href={href}
                        className="text-sm sm:text-base text-white hover:text-primary-400 transition-colors break-all"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-white">{value}</p>
                    )}
                  </div>
                </motion.div>
              ))}

              <div className="pt-6 border-t border-gray-700">
                <h4 className="text-lg font-semibold mb-4">Connect on Social Media</h4>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map(({ icon: Icon, name, url, color }, index) => (
                    <motion.a
                      key={name}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.1, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-4 rounded-lg glass transition-colors ${color}`}
                      aria-label={name}
                    >
                      <Icon className="w-6 h-6" />
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-8"
          >
            <h3 className="text-2xl font-bold mb-6">Send a Message</h3>
            
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-700 focus:border-primary-500 focus:outline-none transition-colors"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-700 focus:border-primary-500 focus:outline-none transition-colors"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-700 focus:border-primary-500 focus:outline-none transition-colors"
                  placeholder="Research collaboration"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-700 focus:border-primary-500 focus:outline-none transition-colors resize-none"
                  placeholder="Your message..."
                />
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-6 bg-primary-500 hover:bg-primary-600 rounded-lg font-semibold transition-colors"
              >
                Send Message
              </motion.button>
            </form>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-20 pt-8 border-t border-gray-800"
        >
          <p className="text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} {profileData.name}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
