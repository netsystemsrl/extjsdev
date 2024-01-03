/*
 * jsreports 1.4.129-beta1
 * Copyright (c) 2018 jsreports
 * http://jsreports.com
 */
const fonts = [
  'Asap',
  'Fira Sans',
  'Fira Sans Condensed',
  'Roboto',
  'Open Sans',
  'Lato',
  'Roboto Condensed',
  'Source Sans Pro',
  { name: 'Merriweather', fallback: 'serif' },
  'Overpass',
  'Raleway',
  'Rubik',
  { name: 'Playfair Display', fallback: 'serif' },
  { name: 'Crimson Text', fallback: 'serif' },
  'Muli',
  'Titillium Web',
  'Cabin',
  'Merriweather Sans',
  'Exo 2',
  'Josefin Sans',
  { name: 'Roboto Mono', fallback: 'monospace' },
  { name: 'Alegreya', fallback: 'serif' },
  'Alegreya Sans',
  { name: 'Josefin Slab', fallback: 'serif' },
  { name: 'Cormorant Garamond', fallback: 'serif' },
  'Proza Libre',
  'Overlock'
].map(el => typeof el === 'object' ? el : {
  name: el,
  fallback: 'sans-serif',
  hasLatinExt: true
}).sort((a, b) => a.name.localeCompare(b.name));

export default fonts;
