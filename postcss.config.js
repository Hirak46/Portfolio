module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {
      overrideBrowserslist: [
        'last 4 versions',
        'iOS >= 10',
        'Safari >= 10',
        'Chrome >= 60',
        'Firefox >= 60',
        'Edge >= 79',
        'Samsung >= 8',
        'not dead',
        '> 0.2%',
      ],
      grid: 'autoplace',
      flexbox: 'no-2009',
    },
  },
};
