
module.exports = {
  content: [
    "./public/index.html",
    "./src*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        inner: 'inset 0 1px 3px rgb(0 0 0 / 0.2)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        fadeInLeft: {
          '0%': { opacity: 0, transform: 'translateX(-30px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        fadeInRight: {
          '0%': { opacity: 0, transform: 'translateX(30px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
      },
      animation: {
        marquee: 'marquee 20s linear infinite',
        'fade-in-left': 'fadeInLeft 0.3s ease-out',
        'fade-in-right': 'fadeInRight 0.3s ease-out',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
}
