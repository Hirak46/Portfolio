'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { FileText, ExternalLink, Quote } from 'lucide-react';
import publications from '@/data/publications.json';
import SectionTitle from './SectionTitle';

export default function Publications() {
  const [filter, setFilter] = useState<'all' | 'conference' | 'journal' | 'book-chapter'>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');

  const years = Array.from(new Set(publications.map(p => p.year.toString()))).sort((a, b) => Number(b) - Number(a));

  const filteredPublications = publications.filter(pub => {
    const typeMatch = filter === 'all' || pub.type === filter;
    const yearMatch = yearFilter === 'all' || pub.year.toString() === yearFilter;
    return typeMatch && yearMatch;
  });

  // Count publications by type
  const counts = {
    all: publications.length,
    journal: publications.filter(p => p.type === 'journal').length,
    conference: publications.filter(p => p.type === 'conference').length,
    'book-chapter': publications.filter(p => p.type === 'book-chapter').length,
  };

  return (
    <section id="publications" className="min-h-screen py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          title="Publications"
          subtitle="Research contributions and academic papers"
        />

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-8 sm:mb-12 justify-center"
        >
          <div className="flex flex-wrap gap-2 justify-center">
            {(['all', 'journal', 'conference', 'book-chapter'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base rounded-full transition-all duration-300 ${
                  filter === type
                    ? 'bg-primary-500 text-white'
                    : 'glass hover:bg-white/10'
                }`}
              >
                {type === 'all' ? `All (${counts.all})` : 
                 type === 'book-chapter' ? `Book Chapters (${counts['book-chapter']})` :
                 `${type.charAt(0).toUpperCase() + type.slice(1)} (${counts[type]})`}
              </button>
            ))}
          </div>

          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-4 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base rounded-full glass bg-transparent border-0 cursor-pointer hover:bg-white/10 transition-all"
          >
            <option value="all" className="bg-gray-800">All Years</option>
            {years.map(year => (
              <option key={year} value={year} className="bg-gray-800">{year}</option>
            ))}
          </select>
        </motion.div>

        {/* Publications Grid */}
        <div className="space-y-4 sm:space-y-6">
          {filteredPublications.map((pub, index) => (
            <motion.div
              key={pub.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="glass rounded-2xl p-6 hover:bg-white/5 transition-all duration-300 group"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <FileText className="w-6 h-6 text-primary-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-400 transition-colors">
                        {pub.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        {pub.authors.join(', ')}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
                        <span className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-400">
                          {pub.venue}
                        </span>
                        <span>{pub.year}</span>
                        <span className="flex items-center gap-1">
                          <Quote className="w-4 h-4" />
                          {pub.citations} citations
                        </span>
                      </div>

                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {pub.abstract}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col gap-2">
                  {pub.pdf && (
                    <a
                      href={pub.pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg glass hover:bg-primary-500/20 transition-all flex items-center gap-2 text-sm whitespace-nowrap"
                    >
                      <FileText className="w-4 h-4" />
                      PDF
                    </a>
                  )}
                  {pub.doi && (
                    <a
                      href={`https://doi.org/${pub.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg glass hover:bg-primary-500/20 transition-all flex items-center gap-2 text-sm whitespace-nowrap"
                    >
                      <ExternalLink className="w-4 h-4" />
                      DOI
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredPublications.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 text-gray-600 dark:text-gray-400"
          >
            No publications found matching the selected filters.
          </motion.div>
        )}
      </div>
    </section>
  );
}
