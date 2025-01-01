/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "color-bg": "var(--color-bg)",
                "color-fg": "var(--color-fg)",
                "color-bg-secondary": "var(--color-bg-secondary)",
            }
        }
    },
    plugins: [],
}
