/** @type {import('tailwindcss').Config}*/

import { skeleton } from '@skeletonlabs/tw-plugin';
import { join } from 'path';

const config = {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}')
  ],

  theme: {
    extend: {}
  },

  plugins: [

  ]
};

module.exports = config;
