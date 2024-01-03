/*
 * jsreports 1.4.79
 * Copyright (c) 2017 jsreports
 * http://jsreports.com
 */
/**
 * jsreports Designer module root.  Builds jsreports-designer.js.
 * The resulting module should be required as follows:
 *
 * var jsreports = require('./jsreports');
 * require('./jsreports-designer')(jsreports);
 */
import $ from 'jquery';
import ReportList from './designer.plugins.ReportList';
import PreviewButton from './designer.plugins.PreviewButton';
import Designer from './designer.js';
import ConditionalPropertiesPicker from './designer/controls/ConditionalPropertiesPicker';

module.exports = function(jsreports) {
  ReportList(jsreports, $);
  PreviewButton(jsreports, $);
  Designer(jsreports, $);
  jsreports.designer.controls = {
    ConditionalPropertiesPicker: ConditionalPropertiesPicker
  };
};
