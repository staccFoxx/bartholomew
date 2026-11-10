/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,js,svelte,ts}',
  ],
  theme: {
    extend: {
      colors: {
        'vscode-bg': '#030712',
        'vscode-card': '#0b1120',
        'vscode-border': '#1e293b'
      }
    },
  },
  plugins: [],
};
