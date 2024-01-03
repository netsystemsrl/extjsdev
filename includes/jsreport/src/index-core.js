/*
 * jsreports 1.4.129-beta1
 * Copyright (c) 2018 jsreports
 * http://jsreports.com
 */
/**
 * Ditto client-side package root.  This is the entry point for Webpack to build
 * the browser module.  This module can be loaded directly in the browser, and is also
 * bundled into the ditto-server module for use in a Jasper context for server-side
 * rendering.
 */
import { ReportElement, PropTypes } from './elements/ReportElement';
import CompositeElement from './elements/CompositeElement';
import ElementUtils from './elements/ElementUtils';
import Checkbox from './elements/Checkbox';
import Text from './elements/Text';
import Line from './elements/Line';
import Table from './elements/Table';
require('./styles.js');

var saveAs = (typeof window !== 'undefined' && window.saveAs) ? 
  window.saveAs : require('filesaverjs').saveAs;
const $ = require('jquery');
const ditto = require('./ditto')(window, saveAs, $);
require('./reportbuilder')(ditto);
require('./ditto-integration-jasper.js')(ditto, $);

Object.assign(ditto, {
    ReportElement,
    CompositeElement,
    ElementUtils,
    PropTypes,
    elements: { 
      Checkbox,
      Text,
      Table,
      Line
    }
});

module.exports = ditto;
