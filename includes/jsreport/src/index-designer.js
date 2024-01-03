/*
 * jsreports 1.4.129-beta1
 * Copyright (c) 2018 jsreports
 * http://jsreports.com
 */
/**
 * Ditto Designer module root.  Builds ditto-designer.js.
 * The resulting module should be required as follows:
 *
 * var ditto = require('./ditto');
 * require('./ditto-designer')(ditto);
 */

const $ = require('jquery');
import ReportList from './designer.plugins.ReportList';
import PreviewButton from './designer.plugins.PreviewButton';
import Designer from './designer.js';
import ConditionalPropertiesPicker from './designer/components/ConditionalPropertiesPicker';

module.exports = function(ditto) {
  ReportList(ditto, $);
  PreviewButton(ditto, $);
  Designer(ditto, $);
  ditto.designer.components = {
    ConditionalPropertiesPicker: ConditionalPropertiesPicker
  };
};
