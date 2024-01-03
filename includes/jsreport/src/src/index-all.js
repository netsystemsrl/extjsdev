/*
 * jsreports 1.4.79
 * Copyright (c) 2017 jsreports
 * http://jsreports.com
 */
/**
 * Combine jsreports-core and jsreports-designer into one module
 */
import jsreports from './index-core';
import Designer from './index-designer';
Designer(jsreports);

module.exports = jsreports;
