/*
 * jsreports 1.4.129-beta1
 * Copyright (c) 2018 jsreports
 * http://jsreports.com
 */
var _ = require('underscore');

module.exports = function(ditto, $) {

/** X2JS from https://code.google.com/p/x2js/ (Apache2 license) */
function X2JS(v){var q="1.1.7";v=v||{};h();r();function h(){if(v.escapeMode===undefined){v.escapeMode=true;}v.attributePrefix=v.attributePrefix||"_";v.arrayAccessForm=v.arrayAccessForm||"none";v.emptyNodeForm=v.emptyNodeForm||"text";if(v.enableToStringFunc===undefined){v.enableToStringFunc=true;}v.arrayAccessFormPaths=v.arrayAccessFormPaths||[];if(v.skipEmptyTextNodesForObj===undefined){v.skipEmptyTextNodesForObj=true;}if(v.stripWhitespaces===undefined){v.stripWhitespaces=true;}v.datetimeAccessFormPaths=v.datetimeAccessFormPaths||[];if(v.useDoubleQuotes===undefined){v.useDoubleQuotes=false;}}var g={ELEMENT_NODE:1,TEXT_NODE:3,CDATA_SECTION_NODE:4,COMMENT_NODE:8,DOCUMENT_NODE:9};function r(){function x(z){var y=String(z);if(y.length===1){y="0"+y;}return y;}if(typeof String.prototype.trim!=="function"){String.prototype.trim=function(){return this.replace(/^\s+|^\n+|(\s|\n)+$/g,"");};}if(typeof Date.prototype.toISOString!=="function"){Date.prototype.toISOString=function(){return this.getUTCFullYear()+"-"+x(this.getUTCMonth()+1)+"-"+x(this.getUTCDate())+"T"+x(this.getUTCHours())+":"+x(this.getUTCMinutes())+":"+x(this.getUTCSeconds())+"."+String((this.getUTCMilliseconds()/1000).toFixed(3)).slice(2,5)+"Z";};}}function t(x){var y=x.localName;if(y==null){y=x.baseName;}if(y==null||y==""){y=x.nodeName;}return y;}function o(x){return x.prefix;}function p(x){if(typeof(x)=="string"){return x.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;");}else{return x;}}function j(x){return x.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#x27;/g,"'").replace(/&amp;/g,"&");}function l(B,y,A){switch(v.arrayAccessForm){case"property":if(!(B[y] instanceof Array)){B[y+"_asArray"]=[B[y]];}else{B[y+"_asArray"]=B[y];}break;}if(!(B[y] instanceof Array)&&v.arrayAccessFormPaths.length>0){var x=0;for(;x<v.arrayAccessFormPaths.length;x++){var z=v.arrayAccessFormPaths[x];if(typeof z==="string"){if(z==A){break;}}else{if(z instanceof RegExp){if(z.test(A)){break;}}else{if(typeof z==="function"){if(z(B,y,A)){break;}}}}}if(x!=v.arrayAccessFormPaths.length){B[y]=[B[y]];}}}function a(C){var A=C.split(/[-T:+Z]/g);var B=new Date(A[0],A[1]-1,A[2]);var z=A[5].split(".");B.setHours(A[3],A[4],z[0]);if(z.length>1){B.setMilliseconds(z[1]);}if(A[6]&&A[7]){var y=A[6]*60+Number(A[7]);var x=/\d\d-\d\d:\d\d$/.test(C)?"-":"+";y=0+(x=="-"?-1*y:y);B.setMinutes(B.getMinutes()-y-B.getTimezoneOffset());}else{if(C.indexOf("Z",C.length-1)!==-1){B=new Date(Date.UTC(B.getFullYear(),B.getMonth(),B.getDate(),B.getHours(),B.getMinutes(),B.getSeconds(),B.getMilliseconds()));}}return B;}function n(A,y,z){if(v.datetimeAccessFormPaths.length>0){var B=z.split(".#")[0];var x=0;for(;x<v.datetimeAccessFormPaths.length;x++){var C=v.datetimeAccessFormPaths[x];if(typeof C==="string"){if(C==B){break;}}else{if(C instanceof RegExp){if(C.test(B)){break;}}else{if(typeof C==="function"){if(C(obj,y,B)){break;}}}}}if(x!=v.datetimeAccessFormPaths.length){return a(A);}else{return A;}}else{return A;}}function w(z,E){if(z.nodeType==g.DOCUMENT_NODE){var F=new Object;var x=z.childNodes;for(var G=0;G<x.length;G++){var y=x.item(G);if(y.nodeType==g.ELEMENT_NODE){var D=t(y);F[D]=w(y,D);}}return F;}else{if(z.nodeType==g.ELEMENT_NODE){var F=new Object;F.__cnt=0;var x=z.childNodes;for(var G=0;G<x.length;G++){var y=x.item(G);var D=t(y);if(y.nodeType!=g.COMMENT_NODE){F.__cnt++;if(F[D]==null){F[D]=w(y,E+"."+D);l(F,D,E+"."+D);}else{if(F[D]!=null){if(!(F[D] instanceof Array)){F[D]=[F[D]];l(F,D,E+"."+D);}}(F[D])[F[D].length]=w(y,E+"."+D);}}}for(var A=0;A<z.attributes.length;A++){var B=z.attributes.item(A);F.__cnt++;F[v.attributePrefix+B.name]=B.value;}var C=o(z);if(C!=null&&C!=""){F.__cnt++;F.__prefix=C;}if(F["#text"]!=null){F.__text=F["#text"];if(F.__text instanceof Array){F.__text=F.__text.join("\n");}if(v.stripWhitespaces){F.__text=F.__text.trim();}delete F["#text"];if(v.arrayAccessForm=="property"){delete F["#text_asArray"];}F.__text=n(F.__text,D,E+"."+D);}if(F["#cdata-section"]!=null){F.__cdata=F["#cdata-section"];delete F["#cdata-section"];if(v.arrayAccessForm=="property"){delete F["#cdata-section_asArray"];}}if(F.__cnt==1&&F.__text!=null){F=F.__text;}else{if(F.__cnt==0&&v.emptyNodeForm=="text"){F="";}else{if(F.__cnt>1&&F.__text!=null&&v.skipEmptyTextNodesForObj){if((v.stripWhitespaces&&F.__text=="")||(F.__text.trim()=="")){delete F.__text;}}}}delete F.__cnt;if(v.enableToStringFunc&&(F.__text!=null||F.__cdata!=null)){F.toString=function(){return(this.__text!=null?this.__text:"")+(this.__cdata!=null?this.__cdata:"");};}return F;}else{if(z.nodeType==g.TEXT_NODE||z.nodeType==g.CDATA_SECTION_NODE){return z.nodeValue;}}}}function m(E,B,D,y){var A="<"+((E!=null&&E.__prefix!=null)?(E.__prefix+":"):"")+B;if(D!=null){for(var C=0;C<D.length;C++){var z=D[C];var x=E[z];if(v.escapeMode){x=p(x);}A+=" "+z.substr(v.attributePrefix.length)+"=";if(v.useDoubleQuotes){A+='"'+x+'"';}else{A+="'"+x+"'";}}}if(!y){A+=">";}else{A+="/>";}return A;}function i(y,x){return"</"+(y.__prefix!=null?(y.__prefix+":"):"")+x+">";}function s(y,x){return y.indexOf(x,y.length-x.length)!==-1;}function u(y,x){if((v.arrayAccessForm=="property"&&s(x.toString(),("_asArray")))||x.toString().indexOf(v.attributePrefix)==0||x.toString().indexOf("__")==0||(y[x] instanceof Function)){return true;}else{return false;}}function k(z){var y=0;if(z instanceof Object){for(var x in z){if(u(z,x)){continue;}y++;}}return y;}function b(z){var y=[];if(z instanceof Object){for(var x in z){if(x.toString().indexOf("__")==-1&&x.toString().indexOf(v.attributePrefix)==0){y.push(x);}}}return y;}function f(y){var x="";if(y.__cdata!=null){x+="<![CDATA["+y.__cdata+"]]>";}if(y.__text!=null){if(v.escapeMode){x+=p(y.__text);}else{x+=y.__text;}}return x;}function c(y){var x="";if(y instanceof Object){x+=f(y);}else{if(y!=null){if(v.escapeMode){x+=p(y);}else{x+=y;}}}return x;}function e(z,B,A){var x="";if(z.length==0){x+=m(z,B,A,true);}else{for(var y=0;y<z.length;y++){x+=m(z[y],B,b(z[y]),false);x+=d(z[y]);x+=i(z[y],B);}}return x;}function d(D){var x="";var B=k(D);if(B>0){for(var A in D){if(u(D,A)){continue;}var z=D[A];var C=b(z);if(z==null||z==undefined){x+=m(z,A,C,true);}else{if(z instanceof Object){if(z instanceof Array){x+=e(z,A,C);}else{if(z instanceof Date){x+=m(z,A,C,false);x+=z.toISOString();x+=i(z,A);}else{var y=k(z);if(y>0||z.__text!=null||z.__cdata!=null){x+=m(z,A,C,false);x+=d(z);x+=i(z,A);}else{x+=m(z,A,C,true);}}}}else{x+=m(z,A,C,false);x+=c(z);x+=i(z,A);}}}}x+=c(D);return x;}this.parseXmlString=function(z){var B=window.ActiveXObject||"ActiveXObject" in window;if(z===undefined){return null;}var A;if(window.DOMParser){var C=new window.DOMParser();var x=null;if(!B){try{x=C.parseFromString("INVALID","text/xml").childNodes[0].namespaceURI;}catch(y){x=null;}}try{A=C.parseFromString(z,"text/xml");if(x!=null&&A.getElementsByTagNameNS(x,"parsererror").length>0){A=null;}}catch(y){A=null;}}else{if(z.indexOf("<?")==0){z=z.substr(z.indexOf("?>")+2);}A=new ActiveXObject("Microsoft.XMLDOM");A.async="false";A.loadXML(z);}return A;};this.asArray=function(x){if(x===undefined||x==null){return[];}else{if(x instanceof Array){return x;}else{return[x];}}};this.toXmlDateTime=function(x){if(x instanceof Date){return x.toISOString();}else{if(typeof(x)==="number"){return new Date(x).toISOString();}else{return null;}}};this.asDateTime=function(x){if(typeof(x)=="string"){return a(x);}else{return x;}};this.xml2json=function(x){return w(x);};this.xml_str2json=function(x){var y=this.parseXmlString(x);if(y!=null){return this.xml2json(y);}else{return null;}};this.json2xml_str=function(x){return d(x);};this.json2xml=function(y){var x=this.json2xml_str(y);return this.parseXmlString(x);};this.getVersion=function(){return q;};}
/** vkBeautify - prettifyXml - https://github.com/vkiryukhin/vkBeautify (MIT license) */
function createShiftArr(e){var r="    ";if(isNaN(parseInt(e)))r=e;else{r="";for(var s=0;e>s;s++)r+=" "}var c=["\n"];for(let ix=0;ix<100;ix++)c.push(c[ix]+r);return c}function prettifyXml(e,r){var s=e.replace(/>\s{0,}</g,"><").replace(/</g,"~::~<").replace(/\s*xmlns\:/g,"~::~xmlns:").replace(/\s*xmlns\=/g,"~::~xmlns=").split("~::~"),c=s.length,a=!1,h=0,l="",n=0,i=r?createShiftArr(r):this.shift;for(n=0;c>n;n++)s[n].search(/<!/)>-1?(l+=/*i[h]+*/s[n],a=!0,(s[n].search(/-->/)>-1||s[n].search(/\]>/)>-1||s[n].search(/!DOCTYPE/)>-1)&&(a=!1)):s[n].search(/-->/)>-1||s[n].search(/\]>/)>-1?(l+=s[n],a=!1):/^<\w/.exec(s[n-1])&&/^<\/\w/.exec(s[n])&&/^<[\w:\-\.\,]+/.exec(s[n-1])==/^<\/[\w:\-\.\,]+/.exec(s[n])[0].replace("/","")?(l+=s[n],a||h--):s[n].search(/<\w/)>-1&&-1==s[n].search(/<\//)&&-1==s[n].search(/\/>/)?l=l+=a?s[n]:i[h++]+s[n]:s[n].search(/<\w/)>-1&&s[n].search(/<\//)>-1?l=l+=a?s[n]:i[h]+s[n]:s[n].search(/<\//)>-1?l=l+=a?s[n]:i[--h]+s[n]:s[n].search(/\/>/)>-1?l=l+=a?s[n]:i[h]+s[n]:l+=s[n].search(/<\?/)>-1?i[h]+s[n]:s[n].search(/xmlns\:/)>-1||s[n].search(/xmlns\=/)>-1?i[h]+s[n]:s[n];return"\n"==l[0]?l.slice(1):l}

var EMPTY_JRXML = [
    '<jasperReport',
        'xmlns="http://jasperreports.sourceforge.net/jasperreports"',
        'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ',
        'xsi:schemaLocation="http://jasperreports.sourceforge.net/jasperreports http://jasperreports.sourceforge.net/xsd/jasperreport.xsd" ',
        'name="Untitled Report" ',
        'language="groovy" pageWidth="612" pageHeight="792" columnWidth="535" ',
        'leftMargin="36" rightMargin="36" topMargin="36" bottomMargin="36">',
        '<detail>',
            '<band height="72">',
            '</band>',
        '</detail>',
    '</jasperReport>'
].join(' ');

ditto.ns('integrations.jasper', ditto);

ditto.integrations.jasper.JasperReportDef = function(cfg) {
    this.setJasperDef(jasperDefFromJRXML(EMPTY_JRXML));
};

function jasperDefFromJRXML(jrxml) {
    var x2js = new X2JS();
    return x2js.xml_str2json(jrxml);
}

// static method
ditto.integrations.jasper.JasperReportDef.fromJRXML = function(jrxmlStr) {
    var obj = new ditto.integrations.jasper.JasperReportDef();
    obj.setJasperDef(jasperDefFromJRXML(jrxmlStr));
    return obj;
};

$.extend(ditto.integrations.jasper.JasperReportDef.prototype, function() {

var inputTypes = [{
    ditto: ['text'],
    jasper: ['java.lang.String']
},{
    ditto: ['number'],
    jasper: ['java.lang.Integer' /* TODO other types */ ]
},{
    ditto: ['date'],
    jasper: [ 'java.util.Date' ]
}];

var barcodeTypes = [
    ['UPC', 'UPCA'], 
    ['EAN13', 'EAN13'], 
    ['ITF14', 'Int2of5'], 
    ['CODE128', 'Code128'], 
    ['CODE39', 'Code39'], 
    ['QR', 'Code39']
].map(function(pair) {
    return {
        ditto: [ pair[0] ],
        jasper: [ pair[1] ]
    };
});

function getMappedValue(collection, from, to, value) {
    var match = collection.filter(function(mapping) {
        return (mapping[from].indexOf(value) >= 0);
    });
    return (match.length > 0 ? match[0][to][0] || null : null);
}

function getJasperValue(collection, jsrValue) {
    return getMappedValue(collection, 'ditto', 'jasper', jsrValue);
}

function getJsrValue(collection, jasperValue) {
    return getMappedValue(collection, 'jasper', 'ditto', jasperValue);
}

function textIsExpression(text) {
    return (
        text.indexOf('=') === 0
        || text.indexOf('"') === 0
        || text.indexOf('$P{') >= 0
        || text.indexOf('$F{') >= 0
        || text.indexOf('$V{') >= 0
    );
}

/** 
 * JRXML requires child elements in a specific order; this information is
 * derived from the JRXML schema reference at http://jasperreports.sourceforge.net/schema.reference.html 
 */
var allowedChildOrderings = {
    'textField': [ 'reportElement', 'box', 'textElement', 'textFieldExpression', 
        'patternExpression', 'anchorNameExpression', 'hyperlinkReferenceExpression', 
        'hyperlinkWhenExpression', 'hyperlinkAnchorExpression', 'hyperlinkPageExpression', 
        'hyperlinkTooltipExpression', 'hyperlinkParameter' ],
    'jasperReport': [ 'property', 'import', 'template', 'reportFont', 'style', 'subDataset', 
        'scriptlet', 'parameter', 'queryString', 'field', 'sortField', 'variable', 
        'filterExpression', 'group', 'background', 'title', 'pageHeader', 'columnHeader', 
        'detail', 'columnFooter', 'pageFooter', 'lastPageFooter', 'summary', 'noData' ],
    'lineChart': [ 'chart', 'categoryDataset', 'linePlot' ],
    'barChart': [ 'chart', 'categoryDataset', 'barPlot' ],
    'pieChart': [ 'chart', 'pieDataset', 'piePlot' ],
    'pieDataset': [ 'dataset', 'pieSeries', 'keyExpression', 'valueExpression',
        'labelExpression', 'sectionHyperlink', 'otherKeyExpression', 'otherLabelExpression',
        'otherSectionHyperlink' ],
    'categoryDataset': [ 'dataset', 'categorySeries' ],
    'categorySeries': [ 'seriesExpression', 'categoryExpression', 'valueExpression', 
        'labelExpression', 'itemHyperlink' ],
    'linePlot': [ 'plot', 'categoryAxisLabelExpression', 'categoryAxisFormat',
        'valueAxisLabelExpression', 'valueAxisFormat', 'domainAxisMinValueExpression', 
        'domainAxisMaxValueExpression', 'rangeAxisMinValueExpression', 
        'rangeAxisMaxValueExpression' ],
    'barPlot': [ 'plot', 'itemLabel', 'categoryAxisLabelExpression',
        'categoryAxisFormat', 'valueAxisLabelExpression', 'valueAxisFormat',
        'domainAxisMinValueExpression', 'domainAxisMaxValueExpression', 
        'rangeAxisMinValueExpression', 'rangeAxisMaxValueExpression'],
    'piePlot': [ 'plot', 'itemLabel' ]
};

function enforceChildOrdering(nodeName, val) {
    var ordering = allowedChildOrderings[nodeName];
    if (ordering) {
        if (Array.isArray(val)) {
            return val.map(function(el) {
                return enforceChildOrdering(nodeName, el);
            });
        }
        if (typeof val === 'object') {
            var temp = Object.keys(val).map(function(key) {
                return { key: key, val: val[key] };
            });
            temp.sort(function(a, b) {
                return ordering.indexOf(a.key) - ordering.indexOf(b.key);
            });
            val = {};
            temp.forEach(function(pair) {
                val[pair.key] = pair.val;
            });
        }
    }
    return val;
}

// function findElement(def, jasperId) {
//     if (def['$jasperId'] === jasperId) return def;
//     var match = null;
//     Object.keys(def).forEach(function(key) {
//         var val = def[key];
//         if (val) {
//             var valType = typeof val;
//             if (valType !== 'array') {
//                 val = [ val ];
//             }
//             val.forEach(function(el) {
//                 if (typeof el === 'object') {
//                     match = match || findElement(el, jasperId);
//                 }
//             });
//         }
//     });
//     return match;
// }

// function forEachTreeNode(root, fn) {
//     fn.call(this, root);
//     Object.keys(root).forEach(function(key) {
//         var val = root[key];
//         if (val) {
//             if (!Array.isArray(val)) {
//                 val = [ val ];
//             }
//             val.forEach(function(node) {
//                 if (typeof node === 'object') {
//                     forEachTreeNode(node, fn);
//                 }
//             });
//         }
//     });
// }

// function find_path_to_element(jasper_el, root, path) {
//     if (!path) {
//         path = [];
//     }
//     if (jasper_el === root) {
//         console.log('found match');
//         return path;
//     }
//     var keys = Object.keys(root);
//     for (var j = 0; j < keys.length; j++) {
//         var key = keys[j];
//         var val = root[key];
//         var newPath = path.concat({
//             key: key,
//             val: val
//         });
//         console.log(newPath.map(function(el) { return el.key; }));
//         if (Array.isArray(val)) {
//             for (var i = 0; i < val.length; i++) {
//                 var found = find_path_to_element(jasper_el, val[i], newPath);
//                 if (found) {
//                     return found;
//                 };
//             }
//         } else if (typeof val === 'object') {
//             var found = find_path_to_element(jasper_el, val, newPath);
//             if (found) {
//                 return found;
//             };
//         }
//     }
//     return null;
// }

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.substr(1);
}

function get_jasper_element_type(jsr_type) {
    switch (jsr_type) {
        case 'text':
            return 'textField';
        case 'image':
            return 'image';
        case 'box':
            return 'rectangle';
        case 'barcode':
            return 'componentElement';
        case 'chart_line':
            return 'lineChart';
        case 'chart_pie':
            return 'pieChart';
        case 'chart_bar':
            return 'barChart';
        default:
            throw new Error('No known Jasper Reports type for ditto type: ' + jsr_type);
    }
}

// var knownJasperElementTypes = ['staticText', 'textField', 'image', 'frame'];
var dpi = 72;   // Jasper stores units in pixels at 72dpi

function requireArray(obj) {
    if (obj && !Array.isArray(obj)) {
        return [ obj ];
    }
    return obj;
}

function arrayFind(arr, predicate) {
    var value;
    for (var i = 0, length = arr.length; i < length; i++) {
      value = arr[i];
      if (predicate.call(this, value, i, arr)) {
        return value;
      }
    }
    return undefined;
}

const stripQuotes = (str) => {
    if (str.length > 1 && str[0] === '"' && str[str.length - 1] === '"') {
        return str.substr(1, str.length - 2);
    }
    return str;
};

return {

    jsrDefFromJasperDef: function(jasperDef) {
        var me = this;
        // console.log(jasperDef);
        var builder = ditto.createReport(jasperDef._name);
        builder.data('-');
        delete builder.def.header;
        delete builder.def.footer;
        delete builder.def.page_header;
        delete builder.def.page_footer;
        this.ix = 1;
        this.leftMarginInches = (jasperDef._leftMargin || 0) / dpi;
        var units = 'inches';
        builder.page(jasperDef._pageWidth / dpi, jasperDef._pageHeight / dpi, units);
        builder.margins((jasperDef._topMargin || 0) / dpi, (jasperDef._rightMargin || 0) / dpi, 
            (jasperDef._bottomMargin || 0) / dpi, (jasperDef._leftMargin || 0) / dpi);
        if (jasperDef.parameter) {
            var params = requireArray(jasperDef.parameter);
            params.forEach(function(jasperParam) {
                jasperParam.$jasperId = me.ix++;
                builder.input(jasperParam._name, getJsrValue(inputTypes, jasperParam._class), null, { "$jasperId": jasperParam.$jasperId });
            });
        }
        this.embeddedSchema = { fields: [] };
        const stylesheet = {};   // dictionary of classes by classname, no leading period
        if (jasperDef.field) {
            var fields = requireArray(jasperDef.field);
            this.embeddedSchema.fields = fields.map(function(jasperField) {
                jasperField.$jasperId = me.ix++;
                return {
                    name: jasperField._name,
                    type: getJsrValue(inputTypes, jasperField._class),
                    $jasperId: jasperField.$jasperId
                };
            });
        }
        if (jasperDef.style) {
            var styles = requireArray(jasperDef.style);
            styles.forEach(jasperStyle => {
                const className = jasperStyle._name;
                if (!className) return;
                const ruleList = [];
                if (jasperStyle._backcolor) {
                    ruleList.push(['background-color', jasperStyle._backcolor]);
                }
                if (jasperStyle._forecolor) {
                    ruleList.push(['color', jasperStyle._forecolor]);
                }
                if (jasperStyle._hTextAlign) {
                    ruleList.push(['text-align', jasperStyle._hTextAlign.toLowerCase()]);
                }
                if (jasperStyle._fontName) {
                    ruleList.push(['font-family', jasperStyle._fontName]);
                }
                if (jasperStyle._fontSize) {
                    ruleList.push(['font-size', `${jasperStyle._fontSize}pt`]);
                }
                if (jasperStyle._isBold) {
                    ruleList.push(['font-weight', 'bold']);
                }
                stylesheet[className] = ruleList;
            });
        }
        this.createSectionIfPresent(jasperDef.title, builder, builder.header);
        this.createSectionIfPresent(jasperDef.pageHeader, builder, builder.pageHeader);
        this.createSectionIfPresent(jasperDef.columnHeader, builder, builder.columnHeader);
        if (jasperDef.group) {
            if (!Array.isArray(jasperDef.group)) {
                jasperDef.group = [ jasperDef.group ];
            }
            jasperDef.group.forEach(function(group) {
                group.$jasperId = me.ix++;
                builder.groupBy(group.groupExpression.__cdata);
                builder.lastLevel.$jasperId = group.$jasperId;
                if (group.groupHeader) {
                    builder.header(group.groupHeader.band._height / dpi);
                    me.loadBand(group.groupHeader.band, builder);
                }
                if (group.groupFooter) {
                    builder.footer(group.groupFooter.band._height / dpi);
                    me.loadBand(group.groupFooter.band, builder);
                }
            });
        }
        // Have to manually reset level pointer here if groups were added
        builder.lastLevel = null;
        this.createSectionIfPresent(jasperDef.detail, builder, builder.detail);
        this.createSectionIfPresent(jasperDef.columnFooter, builder, builder.columnFooter);
        this.createSectionIfPresent(jasperDef.pageFooter, builder, builder.pageFooter);
        this.createSectionIfPresent(jasperDef.summary, builder, builder.footer);
        var def = builder.done();
        if (!jasperDef.detail) {
            def.body.show_detail = false;
        }
        def.stylesheet = stylesheet;
        // console.log('def is', def);
        def.type = 'jasper';
        return def;
    },

    setSchema: function(schema) {
        this.schemaChanged = true;
        this.embeddedSchema = schema;
    },

    createSectionIfPresent: function(jasperSection, builder, createFn) {
        if (jasperSection && jasperSection.band && typeof jasperSection.band._height !== 'undefined') {
            createFn.call(builder, jasperSection.band._height / dpi);
            this.loadBand(jasperSection.band, builder);
        }
    },

    /** Load elements from a Jasper report def band into a ditto ReportBuilder (def).  Def is expected to be pointing at the correct report section. */
    loadBand: function(band, def, offset) {
        var me = this;
        // Move any grouped elements out into the main band
        requireArray(band.elementGroup || []).forEach(elGroup => {
            Object.keys(elGroup).forEach(eltType => {
                band[eltType] = (band[eltType] || [])
                    .concat(requireArray(elGroup[eltType]));
            });
        });
        Object.keys(band).forEach(function(eltType) {
            // skip attributes
            if (eltType.indexOf('_') === 0 || eltType === '$jasperId') return;
            var els = requireArray(band[eltType]);
            if (!els) return;
            els.forEach(function(el) {
                var rptEl = el.reportElement; //me.get_report_element(el);
                el['$jasperId'] = me.ix++;
                if (!rptEl) return;
                var pos = me.getElementPosition(el);
                var extraProps = {
                    '$jasperId': el['$jasperId'],
                    '$jasperType': eltType
                };
                if (offset) {
                    pos.left += offset.left;
                    pos.top += offset.top;
                }
                switch (eltType) {
                    case 'staticText':
                        me.readTextElement(el, rptEl, def, pos, extraProps, true);
                        break;
                    case 'image':
                        var url = '';
                        if (el.imageExpression && el.imageExpression.__cdata) {
                            url = el.imageExpression.__cdata;
                            if (url.length > 1 && url.charAt(0) === "\"") {
                                url = url.substr(1, url.length - 2);
                            }
                        }
                        def.image(url, pos.left, pos.top, pos.width, pos.height, extraProps);
                        break;
                    case 'frame':
                        def.box(rptEl._backcolor, rptEl._forecolor, pos.left, pos.top, pos.width, pos.height, extraProps);
                        // Put child elements of the frame into the same section
                        me.loadBand(el, def, pos);
                        break;
                    case 'textField':
                        me.readTextElement(el, rptEl, def, pos, extraProps, false);
                        break;
                    case 'componentElement':
                        if (el.barbecue) {
                            const value = stripQuotes(el.barbecue.codeExpression.__cdata);
                            const barcodeType = getJsrValue(barcodeTypes, el.barbecue._type);
                            def.barcode(value, barcodeType, pos.left, pos.top, pos.width, pos.height, _.extend(extraProps, {
                                show_value: !!el.barbecue.codeExpression._drawText
                            }));
                        } else if (el.QRCode) {
                            const value = stripQuotes(el.QRCode.codeExpression.__cdata);
                            def.barcode(value, 'QR', pos.left, pos.top, pos.width, pos.height, extraProps);
                        } else {
                            console.error('Error: Unrecognized barcode element in JRXML: ', el);
                        }
                        break;
                    default:
                        extraProps.type = 'unknownJasperElement';
                        def.text(eltType, pos.left, pos.top, pos.width, pos.height, extraProps);
                        break;
                }
            });
        });
    },

    readTextElement: function(el, rptEl, def, pos, extraProps, isStatic) {
        var text = (isStatic ? (el.text && el.text.__cdata) : (el.textFieldExpression && el.textFieldExpression.__cdata)) || '';
        if (el.textElement) {
            var font = el.textElement.font;
            if (font) {
                extraProps.bold = (font._isBold === 'true');
                extraProps.italic = (font._isItalic === 'true');
                extraProps.underline = (font._isUnderline === 'true');
                if (font._size) {
                    extraProps.fontsize = Number(font._size);
                }
            }
            if (el.textElement._textAlignment) {
                extraProps.align = el.textElement._textAlignment;
            }
        }
        if (rptEl._forecolor) {
            extraProps.text_color = rptEl._forecolor;
        }
        if (rptEl._backcolor) {
            extraProps.background_color = rptEl._backcolor;
        }
        if (rptEl._style) {
            extraProps.styles = [ rptEl._style ];
        }

        if (el.box) {
            const box = el.box;
            const borders = {};
            ['top', 'left', 'bottom', 'right'].forEach(side => {
                const pen = box[`${side}Pen`];
                if (pen) {
                    const width = pen._lineWidth ? `${pen._lineWidth}pt` : '';
                    borders[side] = `${width} ${(pen._lineStyle || '').toLowerCase()} ${pen._lineColor || ''}`;
                }
            });
            extraProps.borders = borders;
        }
        def.text(text, pos.left, pos.top, pos.width, pos.height, extraProps);
    },

    getElementPosition: function(jasperEl) {
        var rptEl = this.get_report_element(jasperEl);
        return {
            left: rptEl._x / dpi,
            top: rptEl._y / dpi, 
            width: rptEl._width / dpi, 
            height: rptEl._height / dpi
        };
    },

    // instance method, not to be called directly
    setJasperDef: function(jasperDefObj) {
        this.jasperDef = jasperDefObj;
        this.jsrDef = this.jsrDefFromJasperDef(jasperDefObj.jasperReport);
        // Store copy of jsrDef, for later diffing for changes
        this.origJsrDef = JSON.parse(JSON.stringify(this.jsrDef));
    },

    toJRXML: function() {
        var x2js = new X2JS({ useDoubleQuotes: true, emptyNodeForm: 'object' });
        var merged_jasper = this.remove_internal_properties(this.merge_all_changes());
        // console.log('merged jasper is');
        // console.log(JSON.stringify(merged_jasper, null, 2));
        // console.log('XML is');
        // console.log(prettifyXml(x2js.json2xml_str(merged_jasper), 4));
        return prettifyXml(x2js.json2xml_str(merged_jasper), 4);
    },

    remove_internal_properties: function(jasperDef) {
        var lastGroupName = '';
        var prevKey = '';
        return JSON.parse(JSON.stringify(jasperDef, function(k, v) {
          if (k && k.indexOf('$') === 0) {
            return undefined;
          }
          if (prevKey === 'group' && v._name) {
            lastGroupName = v._name;
          }
          prevKey = k;
          if (v && v['$insertGroupId']) {
            ['_resetGroup', '_evaluationGroup'].map(function(groupKey) {
                if (v.hasOwnProperty(groupKey)) {
                    v[groupKey] = lastGroupName;
                }
            });
            delete v['$insertGroupId'];
          }
          v = enforceChildOrdering(k, v);
          return v;
        }));
    },

    /** Find changes between origJsrDef and jsrDef and apply to jasperDef */
    merge_all_changes: function() {
        var me = this;
        // Work on a clone because we may need to merge again in future, keeping original for that
        var jasperDef = JSON.parse(JSON.stringify(this.jasperDef));
        this.handle_element_section_moves();
        this.merge_section(jasperDef.jasperReport, 'title', this.origJsrDef.header, this.jsrDef.header);
        this.merge_section(jasperDef.jasperReport, 'pageHeader', this.origJsrDef.page_header, this.jsrDef.page_header);
        if (this.origJsrDef.columns || (this.jsrDef.columns && this.jsrDef.columns.header)) {
            this.merge_section(jasperDef.jasperReport, 'columnHeader', 
                this.origJsrDef.columns ? this.origJsrDef.columns.header : null, 
                this.jsrDef.columns ? this.jsrDef.columns.header : null);
        }
        this.merge_section(jasperDef.jasperReport, 'detail', this.origJsrDef.body, this.jsrDef.body);
        if (this.origJsrDef.columns || (this.jsrDef.columns && this.jsrDef.columns.footer)) {
            this.merge_section(jasperDef.jasperReport, 'columnFooter', 
                this.origJsrDef.columns ? this.origJsrDef.columns.footer : null, 
                this.jsrDef.columns ? this.jsrDef.columns.footer : null);
        }
        this.merge_section(jasperDef.jasperReport, 'pageFooter', this.origJsrDef.page_footer, this.jsrDef.page_footer);
        this.merge_section(jasperDef.jasperReport, 'summary', this.origJsrDef.footer, this.jsrDef.footer);
        // If there have been any changes to the groups, just blindly overwrite all groups
        var oldLevels = this.origJsrDef.body.sublevels || [];
        var newLevels = this.jsrDef.body.sublevels || [];
        var jasperGroups = requireArray(jasperDef.jasperReport.group || []);
        // New and changed groups
        // console.log('new levels are', newLevels);
        newLevels.forEach(function(currentLevel, index) {
            var jasperId = currentLevel.$jasperId;
            var origLevel = arrayFind(oldLevels, function(lvl) { return lvl.$jasperId === jasperId; });
            var jasperGroup;
            if (origLevel) {
                // changed
                jasperGroup = arrayFind(jasperGroups, function(grp) { return grp.$jasperId === jasperId; });
                if (currentLevel.group_by !== origLevel.group_by) {
                    jasperGroup.groupExpression = { __cdata: currentLevel.group_by };
                }
                if (!jasperGroup.groupHeader) {
                    jasperGroup.groupHeader = { band: {} };
                }
                if (!jasperGroup.groupFooter) {
                    jasperGroup.groupFooter = { band: {} };
                }
                me.merge_section(jasperGroup, 'groupHeader', origLevel.header, currentLevel.header);
                me.merge_section(jasperGroup, 'groupFooter', origLevel.footer, currentLevel.footer);
            } else {
                // new group
                if (!jasperDef.jasperReport.group) {
                    jasperDef.jasperReport.group = [];
                }
                var jasperGroup = {
                    _name: 'Group' + String(index + 1),
                    groupExpression: { __cdata: currentLevel.group_by },
                    groupHeader: {
                        band: {}
                    },
                    groupFooter: {
                        band: {}
                    }
                };
                jasperGroups.push(jasperGroup);
                me.merge_section(jasperGroup, 'groupHeader', null, currentLevel.header);
                me.merge_section(jasperGroup, 'groupFooter', null, currentLevel.footer);
            }
            // console.log('jasper group', JSON.stringify(jasperGroup));
        });
        // Deleted groups
        oldLevels.forEach(function(oldLevel) {
            var newLevel = arrayFind(newLevels, function(lvl) { return lvl.$jasperId === oldLevel.$jasperId; });
            if (!newLevel) {
                jasperGroup = arrayFind(jasperGroups, function(grp) { return grp.$jasperId === oldLevel.$jasperId; });
                jasperGroups.splice(jasperGroups.indexOf(jasperGroup), 1);
            }
        });
        if (jasperGroups.length === 0) {
            delete jasperDef.jasperReport.group;
        } else {
            jasperDef.jasperReport.group = jasperGroups;
        }
        if (this.schemaChanged) {
            jasperDef.jasperReport.field = this.embeddedSchema.fields.map(function(field) {
                return {
                    _name: field.name,
                    _class: getJasperValue(inputTypes, field.type)
                };
            });
        }
        return jasperDef;
    },

    /** Find an array element by $jasperId property, caching in the provided object */
    find_by_key: function(arr, key_prop, key, cache) {
        var hit = cache[key];
        if (hit === null) return null;
        return hit || (cache[key] = (arr.find(function(item) {
            return item[key_prop] === key;
        }) || null));
    },

    /** Identify elements that moved between jsr sections and move them in the jasper def */
    handle_element_section_moves: function() {

    },

    // /** Merge a javascript array, taking handler fn to merge an item as argument */
    // merge_collection: function(out, in_old, in_new, key_prop, merge_element_fn) {
    //     var me = this;
    //     var in_new_cache = [];
    //     var in_old_cache = [];
    //     // Remove deleted items
    //     out = out.filter(function(out_item) {
    //         return !!me.find_by_key(in_new, key_prop, out_item[key_prop], in_new_cache);
    //     });
    //     // Add any new items
    //     in_new.forEach(function(item_new) {
    //         var item_old = me.find_by_key(in_old, key_prop, item_new[key_prop], in_old_cache);
    //         if (!item_old) {
    //             var out_item = {};
    //             out_item[key_prop] = item_new[key_prop];
    //             out.push(merge_element_fn.call(me, out_item, null, item_new));
    //         }
    //     });
    //     // Merge changed items
    //     out.forEach(function(out_item) {
    //         var old_item = me.find_by_key(in_old, key_prop, out_item[key_prop], in_old_cache);
    //         var new_item = me.find_by_key(in_new, key_prop, out_item[key_prop], in_new_cache);
    //         merge_element_fn.call(me, out_item, old_item, new_item);
    //     });
    //     // Sort so orderings match
    //     out.sort(function(a, b) {
    //         var jsr_a = me.find_by_key(in_new, key_prop, a[key_prop], in_new_cache);
    //         var jsr_b = me.find_by_key(in_new, key_prop, b[key_prop], in_new_cache);
    //         return in_new.indexOf(jsr_a) - in_new.indexOf(jsr_b);
    //     });
    //     return out;
    // },

    /** Special section merge because jasper doesn't store elements as a single collection */
    merge_section: function(jasper_parent, section_name, old_section, new_section) {
        // console.log('merge section', new_section, jasper_section);
        var jasper_section = jasper_parent[section_name] || { band: {} };
        if (!new_section) {
            if (old_section) {
                // Section removed; set band to empty element
                jasper_section.band = "";
            } else {
                // Neither section existed then or now
                return;
            }
        } else if (!old_section) {
            // Section created
            jasper_section.band = {};
        }
        // console.log(old_section, new_section, jasper_section);
        var me = this;
        var in_new_cache = [];
        var in_old_cache = [];
        var jasper_el_types = ['line', 'rectangle', 'textField', 'staticText', 'image', 'componentElement'];
        var in_new = new_section.elements;
        // Old section may be null (when it's a new section)
        var in_old = old_section ? old_section.elements : [];
        var key_prop = '$jasperId';
        var framed_els = {};
        var jasper_band = jasper_section.band;
        if (!jasper_band) {
            throw new Error('Couldn\'t find band for section ' + jasper_section);
        }
        if (jasper_band.frame) {
            var frames = requireArray(jasper_band.frame);
            frames.forEach(function(frameEl) {
                jasper_el_types.forEach(function(jtype) {
                    var els = requireArray(frameEl[jtype]);
                    if (!els) return;
                    framed_els[jtype] = (framed_els[jtype] || []).concat(els);
                });
            });
        }
        // Remove deleted items
        jasper_el_types.forEach(function(type) {
            var list = requireArray(jasper_band[type]);
            if (!list) return;
            var keep = list.filter(function(out_item) {
                const found = me.find_by_key(in_new, key_prop, out_item[key_prop], in_new_cache);
                if (!found) {
                    console.warn(`Can't find item with ${key_prop} ${out_item[key_prop]}; element: ${JSON.stringify(out_item)}`);
                }
                return !!found;
            });
            if (keep.length === 0) {
                delete jasper_band[type];
            } else {
                jasper_band[type] = keep;
            }
        });
        // Add any new items
        var alreadyProcessedNew = [];
        in_new.forEach(function(item_new) {
            var item_old = me.find_by_key(in_old, key_prop, item_new[key_prop], in_old_cache);
            if (!item_old) {
                var out_item = {};
                out_item[key_prop] = item_new[key_prop];
                me.merge_element(out_item, null, item_new);
                var jasper_type = item_new['$jasperType'];
                var list = jasper_band[jasper_type];
                if (!list) {
                    list = [];
                }
                if (!Array.isArray(list)) {
                    list = [ list ];
                }
                list.push(out_item);
                alreadyProcessedNew.push(item_new);
                jasper_band[jasper_type] = list;
            }
        });
        // Merge changed items
        jasper_el_types.forEach(function(type) {
            [ jasper_band, framed_els ].forEach(function(jasper_container) {
                var list = requireArray(jasper_container[type]);
                if (!list) return;
                list.forEach(function(out_item) {
                    var new_item = me.find_by_key(in_new, key_prop, out_item[key_prop], in_new_cache);
                    if (alreadyProcessedNew.indexOf(new_item) >= 0) return;
                    var old_item = me.find_by_key(in_old, key_prop, out_item[key_prop], in_old_cache);
                    me.merge_element(out_item, old_item, new_item);
                });
                // Sort so orderings match (this is probably not really needed for elements)
                list.sort(function(a, b) {
                    var jsr_a = me.find_by_key(in_new, key_prop, a[key_prop], in_new_cache);
                    var jsr_b = me.find_by_key(in_new, key_prop, b[key_prop], in_new_cache);
                    return in_new.indexOf(jsr_a) - in_new.indexOf(jsr_b);
                });
            });
            if (jasper_band[type] && !Array.isArray(jasper_band[type])) {
                jasper_band[type] = [ jasper_band[type] ];
            }
        });
        var visible = (section_name === 'detail' ? new_section.show_detail : new_section.visible);
        if (visible === false) {
            jasper_band._height = 0;
        } else {
            if (!old_section || (old_section.height !== new_section.height)) {
                jasper_band._height = (new_section.height * dpi).toFixed(0);
            }
        }
        jasper_parent[section_name] = jasper_section;
    },

    /** Merge changes from old jsr el to new jsr el into jasper el */
    merge_element: function(jasper_el, old_el, new_el) {
        // console.log('looking at el', new_el, new_el && new_el.$jasperType, old_el);
        // Find out and save jasper type for new element
        var me = this;
        if (!old_el) {
            new_el['$jasperType'] = get_jasper_element_type(new_el.type);
            old_el = {};
        }
        // Handle any deleted properties
        Object.keys(old_el).forEach(function(old_key) {
            if (typeof new_el[old_key] === 'undefined') {
                // Deleted property
                me.merge_element_property(jasper_el, new_el, old_key, old_el[old_key], undefined);
            }
        });
        // Changed properties and added properties
        Object.keys(new_el).forEach(function(new_key) {
            // console.log('checking property', new_key, new_el[new_key]);
            me.merge_element_property(jasper_el, new_el, new_key, old_el[new_key], new_el[new_key]);
        });
        return jasper_el;
    },

    /** Translate jsr props back to jasper props, also handling addition/deletion of props */
    merge_element_property: function(jasper_el, jsr_el, jsr_prop_name, old_val, new_val) {
        if (new_val !== old_val) {
            // Common property handling
            var rptEl = this.get_report_element(jasper_el);
            switch (jsr_prop_name) {
                case 'top':
                    rptEl._y = (new_val * dpi).toFixed(0);
                    break;
                case 'left':
                    rptEl._x = (new_val * dpi).toFixed(0);
                    break;
                case 'width':
                    rptEl._width = (new_val * dpi).toFixed(0);
                    break;
                case 'height':
                    rptEl._height = (new_val * dpi).toFixed(0);
                    break;
                default:
                    // Element-type-specific properties
                    switch (jsr_el.type) {
                        case 'text':
                            this.merge_text_property(jasper_el, jsr_el, jsr_prop_name, old_val, new_val);
                            break;
                        case 'box':
                            this.merge_box_property(jasper_el, jsr_el, jsr_prop_name, old_val, new_val);
                            break;
                        case 'image':
                            this.merge_image_property(jasper_el, jsr_el, jsr_prop_name, old_val, new_val);
                            break;
                        case 'barcode':
                            this.merge_barcode_property(jasper_el, jsr_el, jsr_prop_name, old_val, new_val);
                            break;
                        case 'chart_line':
                        case 'chart_bar':
                        case 'chart_pie':
                            this.merge_chart_property(jasper_el, jsr_el, jsr_prop_name, old_val, new_val);
                            break;
                    }
                    break;
            }
        }
    },

    merge_text_property: function(jasper_el, jsr_el, prop_name, old_val, new_val) {
        // console.log('mergetextproperty', prop_name, old_val, new_val);
        switch (prop_name) {
            case 'text':
                if (jsr_el['$jasperType'] === 'textField') {
                    if (textIsExpression(new_val)) {
                        jasper_el.textFieldExpression = { __cdata: new_val };
                    } else {
                        jasper_el.textFieldExpression = { __cdata: '"' + new_val + '"' };
                    }
                } else {
                    // assume staticText
                    jasper_el.text = new_val;
                }
                break;
            case 'text_color':
                // if (!jasper_el['$style']) {
                //     jasper_el['$style'] = {};
                // }
                // jasper_el['$style'].forecolor = new_val;
                this.get_report_element(jasper_el)._forecolor = new_val;
                break;
            case 'background_color':
                // if (!jasper_el['$style']) {
                //     jasper_el['$style'] = {};
                // }
                // jasper_el['$style'].backcolor = new_val;
                this.get_report_element(jasper_el)._backcolor = new_val;
                break;
            case 'align':
                this.get_text_element(jasper_el)._textAlignment = capitalize(new_val);
                break;
            case 'bold':
                /* falls through */
            case 'italic':
                /* falls through */
            case 'underline':
                this.get_font_node(jasper_el)['_is' + capitalize(prop_name)] = new_val;
                break;
            case 'fontsize':
                this.get_font_node(jasper_el)._size = new_val;
                break;
            case 'font':
                this.get_font_node(jasper_el)._fontName = new_val;
                break;                
            // wrap
            // pattern
        }
    },

    get_font_node: function(el) {
        this.get_text_element(el);
        if (!el.textElement.font) {
            el.textElement.font = {};
        }
        return el.textElement.font;
    },

    get_text_element: function(el) {
        if (!el.textElement) {
            el.textElement = {};
        }
        return el.textElement;
    },

    get_report_element: function(el) {
        if (el.chart) {
            el = el.chart;
        }
        if (!el.reportElement) {
            el.reportElement = {};
        }
        return el.reportElement;
    },

    merge_box_property: function(jasper_el, jsr_el, prop_name, old_val, new_val) {
        switch (prop_name) {
            case 'corner_radius':
                jasper_el._radius = new_val;
                break;
            case 'background_color':
                this.get_report_element(jasper_el)._backcolor = new_val;
                break;
            case 'border_color':
                if (!jasper_el.graphicElement) {
                    jasper_el.graphicElement = {};
                }
                if (!jasper_el.graphicElement.pen) {
                    jasper_el.graphicElement.pen = {};
                }
                jasper_el.graphicElement.pen._lineColor = new_val;
                break;
        }
    },

    merge_barcode_property: function(jasper_el, jsr_el, prop_name, old_val, new_val) {
        switch (prop_name) {
            case 'barcode_type':
                /* falls through */
            case 'value':
                // If type OR value changed, delete any existing jr:XXX and replace with a new one
                Object.keys(jasper_el).forEach(function(key) {
                    if (key.indexOf('jr:') === 0) {
                        delete jasper_el[key];
                    }
                });
                if (jsr_el.barcode_type === 'QR') {
                    jasper_el['jr:QRCode'] = {
                        '_xmlns:jr': 'http://jasperreports.sourceforge.net/jasperreports/components',
                        '_xsi:schemaLocation': "http://jasperreports.sourceforge.net/jasperreports/components http://jasperreports.sourceforge.net/xsd/components.xsd",
                        'jr:codeExpression': {
                            __cdata: `"${jsr_el.value}"`
                        }
                    };
                } else {
                    jasper_el['jr:barbecue'] = {
                        '_xmlns:jr': 'http://jasperreports.sourceforge.net/jasperreports/components',
                        '_xsi:schemaLocation': 'http://jasperreports.sourceforge.net/jasperreports/components http://jasperreports.sourceforge.net/xsd/components.xsd',
                        _type: getJasperValue(barcodeTypes, jsr_el.barcode_type),
                        _drawText: jsr_el.show_value,
                        _checksumRequired: "false",
                        'jr:codeExpression': {
                            __cdata: `"${jsr_el.value}"`
                        }
                    };
                }
                break;
        }
    },

    merge_image_property: function(jasper_el, jsr_el, prop_name, old_val, new_val) {
        switch (prop_name) {
            case 'url':
                jasper_el.imageExpression = { __cdata: '"' + new_val + '"' };
                break;
        }
    },

    merge_chart_property: function(jasper_el, jsr_el, prop_name, old_val, new_val) {
        switch (prop_name) {
            case 'series':
                var valueField = '';
                var labelField = '';
                var enclosingGroupId = '';  // FIXME
                if (new_val.length > 0) {
                    var series = new_val[0];
                    valueField = series.value_field || '';
                    labelField = series.label_field || '';
                }
                if (!jasper_el.chart) {
                    jasper_el.chart = {
                        _evaluationTime: 'Group',
                        _evaluationGroup: '',
                        reportElement: {},
                        chartTitle: {},
                        chartSubtitle: {},
                        chartLegend: {},
                        '$insertGroupId': true
                    };
                    // reportElement may be added in wrong place before
                    // chart sub-element exists
                    if (jasper_el.reportElement) {
                        jasper_el.chart.reportElement = jasper_el.reportElement;
                        delete jasper_el.reportElement;
                    }
                }
                if (jsr_el.type === 'chart_line' || jsr_el.type === 'chart_bar') {
                    if (!jasper_el.categoryDataset) {
                        jasper_el.categoryDataset = {
                            dataset: { 
                                _resetType: 'Group',
                                _resetGroup: '',
                                '$insertGroupId': true
                            },
                            categorySeries: {
                                seriesExpression: { __cdata: '"Series1"' },
                                categoryExpression: { __cdata: '$F{' + labelField + '}' },
                                valueExpression: { __cdata: '$F{' + valueField + '}' }
                            }
                        };
                    }
                } else if (jsr_el.type === 'chart_pie') {
                    if (!jasper_el.pieDataset) {
                        jasper_el.pieDataset = {
                            dataset: { 
                                _resetType: 'Group',
                                _resetGroup: '',
                                '$insertGroupId': true
                            },
                            keyExpression: { __cdata: '$F{' + labelField + '}' },
                            valueExpression: { __cdata: '$F{' + valueField + '}' }
                        };
                    }
                }
                var plotObj;
                var plotKey;
                var lineBarPlotObj = {
                    plot: {},
                    categoryAxisFormat: { 
                        axisFormat: {} 
                    },
                    valueAxisFormat: {
                        axisFormat: {}
                    }
                };
                switch (jsr_el.type) {
                    case 'chart_line':
                        if (!jasper_el.linePlot) {
                            jasper_el.linePlot = lineBarPlotObj;
                        }
                        break;
                    case 'chart_bar':
                        if (!jasper_el.barPlot) {
                            jasper_el.barPlot = lineBarPlotObj;
                            jasper_el.barPlot.itemLabel = {};
                        }
                        break;
                    case 'chart_pie':
                        if (!jasper_el.piePlot) {
                            jasper_el.piePlot = {
                                plot: {},
                                itemLabel: {}
                            };
                        }
                        break;
                }
                break;
        }
    }    

};

}());

};
