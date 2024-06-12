// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactCompiler from 'eslint-plugin-react-compiler';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts, **/*.tsx'],
    plugins: {
      reactCompiler,
      reactRefresh,
      reactHooks,
    },
    rules: {
      'reactCompiler/react-compiler': 'error',
      'reactRefresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  }
);
