/*
 * jsreports 1.4.129-beta1
 * Copyright (c) 2018 jsreports
 * http://jsreports.com
 */
var merge = require('lodash.merge');
import fonts from './fonts';
import _ from 'underscore';
import locale_EN_US from './locales/EN_US.json';

if (typeof Object.assign != 'function') {
  Object.assign = function(target) {
    'use strict';
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    target = Object(target);
    for (var index = 1; index < arguments.length; index++) {
      var source = arguments[index];
      if (source != null) {
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
    }
    return target;
  };
}

var ditto = {
    version: '1.4.129-beta1',
    ToolbarItemPosition: { RIGHT: "right", LEFT: "left" },
    merge: merge,
    locales: {
        EN_US: locale_EN_US
    }
};
ditto.locale = ditto.locales.EN_US;

ditto.version_less_than = function(versionA, versionB) {
    var aParts = (versionA || "0.0.0").split('.').map(function(part) {
            return parseInt(part, 10);
        }),
        bParts = versionB.split('.').map(function(part) {
            return parseInt(part, 10);
        });
    for (var i = 0; i < aParts.length - 1; i++) {
        if (aParts[i] < bParts[i]) {
            return true;
        } else if (aParts[i] > bParts[i]) {
            return false;
        }
    }
    return aParts[aParts.length - 1] < bParts[aParts.length - 1];
};

ditto.isMac = typeof(navigator) !== 'undefined' && navigator.platform.toLowerCase().indexOf('mac') > -1;

ditto.defaultReport = {
    title: "New Report",
    "default_format": "html",
    version: '1.4.129-beta1',
    type: 'hierarchical',
    "page": { 
        units: "inches", 
        paper_size: {
            id: "letter",
            inches: ["8.5", "11"],
            mm: ["216", "279"]
        },
        margins: {
            "top": 0.5,
            "left": 0.5,
            "right": 0.5,
            "bottom": 0.5
        }
    },
    filters: [],
    inputs: [],
    header: {
        height: 1,
        elements: []
    },
    body: {
        data_source: null,
        show_detail: true,
        height: 1.5,
        elements: [],
        sublevels: [],
        column_count: 1,
        pivot_enabled: false,
        pivot_expression: "",
        pivot_column_sort_by: "",
        pivot_column_bucket_type: "",
        pivot_value_aggregate: ""
    },
    footer: {
        height: 1,
        elements: []
    },
    page_header: {
        visible: false,
        elements: [],
        height: 1
    },
    page_footer: {
        visible: false,
        elements: [],
        height: 1
    }
};

ditto.imageToDataUri = function(imgUrl, format) {
    var htmlDocument = ditto.window.document;
    var tmpImage = new Image();
    tmpImage.src = imgUrl;
    var naturalWidth = tmpImage.width;
    var naturalHeight = tmpImage.height;
    var canvas = htmlDocument.createElement("canvas");
    htmlDocument.body.appendChild(canvas);
    canvas.width  = naturalWidth;
    canvas.height = naturalHeight;
    var context = canvas.getContext("2d");
    context.fillStyle = "rgb(255,255,255)";
    context.fillRect(0, 0, naturalWidth, naturalHeight);
    context.drawImage(tmpImage, 0, 0, naturalWidth, naturalHeight);
    var imgData = canvas.toDataURL(format || 'image/jpeg');
    htmlDocument.body.removeChild(canvas);
    return imgData;
};

/** Deep-clone an object, while converting any snake_cased keys to camelCase */
ditto.camelCaseKeys = function(obj) {
    if (obj === null) return null;
    var clone = {};
    Object.keys(obj).forEach(function(key) {
        var camel = key.replace(/(_\w)/g, function(m) { 
            return m[1].toUpperCase();
        });
        clone[camel] = (typeof obj[key] === 'object') ? 
            ditto.camelCaseKeys(obj[key])
            : obj[key];
    });
    return clone;
};

ditto.ns = function(str, root) {
    var parts = str.split('.');
    var parent = root || (typeof global !== 'undefined' ? global : window), next;
    while (next = parts.shift()) {
        if (!parent[next]) {
            parent[next] = {};
        }
        parent = parent[next];
    }
};

ditto.nsExists = function(nsStr, root) {
    var parts = nsStr.split('.');
    var parent = root || (typeof global !== 'undefined' ? global : window), next;
    while (next = parts.shift()) {
        if (typeof parent[next] === 'undefined') {
            return false;
        }
        parent = parent[next];
    }
    return true;
}

ditto.svgToDataUri = function(svgDomEl, widthPx, heightPx, format) {
    // Select the first svg element
    var htmlDocument = ditto.window.document;
    var serializer = new XMLSerializer(),
        img = new Image(),
        svgStr = serializer.serializeToString(svgDomEl);
    if (!widthPx || !heightPx) {
        widthPx = $(svgDomEl).width();
        heightPx = $(svgDomEl).height();
    }
    // Re-render onto canvas
    img.src = 'data:image/svg+xml;base64,' + window.btoa(svgStr);
    var canvas = htmlDocument.createElement("canvas");
    $(canvas).css('display', 'none');
    htmlDocument.body.appendChild(canvas);
    canvas.width = widthPx;
    canvas.height = heightPx;
    var context = canvas.getContext("2d");
    context.fillStyle = "rgb(255,255,255)";
    context.fillRect(0, 0, widthPx, heightPx);
    context.fillStyle = "rgb(0,0,0)";
    context.drawSvg(svgStr, 0, 0, widthPx, heightPx);
    // context.drawImage(img, 0, 0, widthPx, heightPx);
    var dataUri = canvas.toDataURL(format === 'jpg' ? 'image/jpeg' : 'image/png');
    $(canvas).remove();
    return dataUri;
};

ditto.firstDefined = function() {
    for (var i = 0; i < arguments.length; i++) {
        if (typeof arguments[i] !== 'undefined') {
            return arguments[i];
        }
    }
};

const loadedFonts = {};
const fontInfo = _.indexBy(fonts, font => font.name.trim().toLowerCase());

const addStylesheet = (url) => {
    const htmlDocument = ditto.window.document;
    const link = htmlDocument.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = url;
    htmlDocument.head.appendChild(link);
};

/** Fetch the named webfont if possible */
ditto.requireWebFont = (fontName) => {
    const lower = fontName.trim().toLowerCase();
    if (loadedFonts[lower]) return;
    const info = fontInfo[lower];
    if (!info) return;
    const urlName = fontName.replace(/\s/g, '+');
    const stylesheetUrl = `https://fonts.googleapis.com/css?family=${urlName}:400,400i,700,700i&amp;subset=latin-ext`;
    addStylesheet(stylesheetUrl);
    loadedFonts[lower] = true;
};

ditto.setLocale = (localeObj) => {
    if (typeof localeObj === 'object') {
        ditto.locale = localeObj;
    } else {
        console.error('setLocale requires locale object as argument');
    }
};

ditto.translate = (s, data) => {
  let localized;
  if (ditto.locale.translations) {
    localized = ditto.locale.translations[s];
  }
  if (!localized) {
    console.warn('Missing translation for:', s);
    return '--';
  }
  return (localized || s).replace(/\{(\w*)\}/gi, function(match, g1) {
    return data[g1] || '';
  });
};

module.exports = ditto;
