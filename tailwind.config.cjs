/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				title: ['Nunito', ...defaultTheme.fontFamily.sans],
				sans: ['Roboto', ...defaultTheme.fontFamily.sans],
				serif: [...defaultTheme.fontFamily.serif],
				mono: [...defaultTheme.fontFamily.mono]
			}
		}
	},
	plugins: [require('daisyui')],
	daisyui: {
		themes: [
			{
				light: {
					primary: '#07BE00',
					'primary-focus': '#709E2E',
					'primary-content': '#ffffff',
					secondary: '#8BC53C',
					'secondary-content': '#ffffff',
					accent: '#dae3e2',
					'accent-focus': '#a3ccc8',
					'accent-content': '#000',
					neutral: '#3d4451',
					'neutral-focus': '#2a2e37',
					'neutral-content': '#ffffff',
					'base-100': '#ffffff',
					'base-200': '#f9fafb',
					'base-300': '#d1d5db',
					'base-content': '#1f2937',
					info: '#739FF1',
					success: '#8BC53C',
					warning: '#ff9900',
					error: '#D75A6E',
					'error-focus': '#99404f',
					'error-content': '#ffffff'
				}
			}
		]
	}
};
