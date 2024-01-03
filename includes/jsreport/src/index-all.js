/*
 * jsreports 1.4.129-beta1
 * Copyright (c) 2018 jsreports
 * http://jsreports.com
 */
/**
 * Combine ditto-core and ditto-designer into one module
 */
import ditto from './index-core';
import Designer from './index-designer';
Designer(ditto);

module.exports = ditto;
