/*
 * jsreports 1.4.129-beta1
 * Copyright (c) 2018 jsreports
 * http://jsreports.com
 */
const ELEMENT_RESIZE = 'ELEMENT_RESIZE';
const ELEMENT_PROPERTY_CHANGE = 'ELEMENT_PROPERTY_CHANGE';

export const elementResizeAction = (oldElDef, newElDef) => ({
  type: ELEMENT_RESIZE,
  oldElDef: { ...oldElDef },
  newElDef: { ...newElDef }
});

export const elementPropertyChangeAction = (oldElDef, propName, propVal) => ({
  type: ELEMENT_PROPERTY_CHANGE,
  oldElDef: { ...oldElDef },
  propName: propName,
  propVal: propVal
});
