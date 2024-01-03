/*
 * jsreports 1.4.79
 * Copyright (c) 2017 jsreports
 * http://jsreports.com
 */
/**
 * jsreports client-side package root.  This is the entry point for Webpack to build
 * the browser module.  This module can be loaded directly in the browser, and is also
 * bundled into the jsreports-server module for use in a Jasper context for server-side
 * rendering.
 */
import { ReportElement, PropTypes } from './elements/ReportElement';
import CompositeElement from './elements/CompositeElement';
import ElementUtils from './elements/ElementUtils';
import Checkbox from './elements/Checkbox';
// import MeasureTile from './elements/MeasureTile';
// import BarChartTile from './elements/BarChartTile';
import Text from './elements/Text';
import Line from './elements/Line';
import Table from './elements/Table';
require('./styles.js');

var jsreports = null;
var $ = require('jquery');
var saveAs = (typeof window !== 'undefined' && window.saveAs) ? 
  window.saveAs : require('filesaverjs').saveAs;
jsreports = require('./jsreports')(window, saveAs, $);
require('./reportbuilder')(jsreports);
require('./jsreports-integration-jasper.js')(jsreports, $);

Object.assign(jsreports, {
    ReportElement,
    CompositeElement,
    ElementUtils,
    PropTypes,
    elements: { 
      Checkbox,
      // MeasureTile, 
      // BarChartTile,
      Text,
      Table,
      Line
    }
});

module.exports = jsreports;
