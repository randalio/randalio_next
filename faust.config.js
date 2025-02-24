import { setConfig } from '@faustwp/core';
import templates from './wp-templates';
import possibleTypes from './possibleTypes.json';

console.log('Faust config loading...'); // Add this line

/**
 * @type {import('@faustwp/core').FaustConfig}
 **/
export default setConfig({
  templates,
  plugins: [],
  experimentalToolbar: true,
  possibleTypes,
  apiUrl: 'https://source.randal.io/graphql',
  siteUrl: 'https://source.randal.io/',
  scripts: [
    {
      src: `${process.env.NEXT_PUBLIC_SITE_URL}/scripts/vanilla-tilt.js`,
      footer: true,
      inline: false,
      priority: 1,
    }
  ]
});
