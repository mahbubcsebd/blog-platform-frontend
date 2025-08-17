const config = {
  theme: {
    extend: {
      container: {
        center: true,
        padding: {
          DEFAULT: '5px',
          xm: '5px',
          sm: '5px',
          md: '1rem',
          lg: '2rem',
          xl: '2rem',
          '2xl': '3rem',
        },
      },
    },
  },
  plugins: ['@tailwindcss/postcss'],
};

export default config;
