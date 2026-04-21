import js from '@eslint/js';
import globals from 'globals';

export default [
    js.configs.recommended,
    {
        // Lint the built output — all src vars are in scope within the IIFE
        files: ['dist/swivel.js'],
        languageOptions: {
            ecmaVersion: 2015,
            sourceType: 'script',
            globals: {
                ...globals.browser,
                ...globals.node,
                define: 'readonly',
            },
        },
        rules: {
            'curly': 'error',
            'eqeqeq': 'error',
            'no-eval': 'error',
            'no-new': 'error',
            'no-undef': 'error',
            'no-unused-vars': 'error',
            'no-trailing-spaces': 'error',
            'no-prototype-builtins': 'off',
            'no-shadow-restricted-names': 'off', // intentional: IIFE (undefined) pattern
            'complexity': 'off', // legacy export boilerplate
            'max-depth': ['warn', 2],
            'max-len': ['warn', { code: 120 }],
        },
    },
    {
        files: ['test/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.node,
            },
        },
        rules: {
            'no-undef': 'error',
            'no-unused-vars': 'error',
        },
    },
];
