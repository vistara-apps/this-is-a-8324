/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(210 40% 96.1%)",
        foreground: "hsl(222.2 47.4% 11.2%)",
        card: "hsl(0 0% 100%)",
        'card-foreground': "hsl(222.2 47.4% 11.2%)",
        popover: "hsl(0 0% 100%)",
        'popover-foreground': "hsl(222.2 47.4% 11.2%)",
        primary: "hsl(222.2 47.4% 11.2%)",
        'primary-foreground': "hsl(210 40% 98%)",
        secondary: "hsl(210 40% 96.1%)",
        'secondary-foreground': "hsl(222.2 47.4% 11.2%)",
        muted: "hsl(210 40% 96.1%)",
        'muted-foreground': "hsl(215.4 16.3% 46.9%)",
        accent: "hsl(209.4 100% 53.5%)",
        'accent-foreground': "hsl(210 40% 98%)",
        destructive: "hsl(0 84.2% 60.2%)",
        'destructive-foreground': "hsl(210 40% 98%)",
        border: "hsl(210 40% 94.1%)",
        input: "hsl(210 40% 96.1%)",
        ring: "hsl(209.4 100% 53.5%)",
      },
      borderRadius: {
        lg: "16px",
        md: "10px",
        sm: "6px",
      },
      boxShadow: {
        card: "0 8px 24px hsla(0, 0%, 0%, 0.12)",
        outline: "0 0 0 2px hsl(var(--ring))",
      },
      spacing: {
        lg: "20px",
        md: "12px",
        sm: "8px",
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
      },
    },
  },
  plugins: [],
}