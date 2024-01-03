/*
 * jsreports 1.4.79
 * Copyright (c) 2017 jsreports
 * http://jsreports.com
 */
/** @preserve
 * jsPDF fromHTML plugin. BETA stage. API subject to change. Needs browser
 * Copyright (c) 2012 Willow Systems Corporation, willow-systems.com
 *               2014 Juan Pablo Gaviria, https://github.com/juanpgaviria
 *               2014 Diego Casorran, https://github.com/diegocr
 *               2014 Daniel Husar, https://github.com/danielhusar
 *               2014 Wolfgang Gassler, https://github.com/woolfg
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * ====================================================================
 */
module.exports = function(jsPDF, $) {

(function(jsPDFAPI) {
    var clone,
        DrillForContent,
        FontNameDB,
        FontStyleMap,
        TextAlignMap,
        FontWeightMap,
        FloatMap,
        ClearMap,
        GetCSS,
        PurgeWhiteSpace,
        Renderer,
        ResolveFont,
        ResolveUnitedNumber,
        UnitedNumberMap,
        elementHandledElsewhere,
        images,
        loadImgs,
        checkForFooter,
        process,
        tableToJson,
        pageHeader,
        pageFooter,
        pageHeaderHeight = 0,
        pageFooterHeight = 0,
        pageBackground,
        CssLengthToPx,
        fontOverrides = {},
        usedFontKeys = {};
    var allAsciiRegEx = /^[\000-\177]*$/;
    clone = (function() {
        return function(obj) {
            Clone.prototype = obj;
            return new Clone()
        };

        function Clone() {}
    })();
    PurgeWhiteSpace = function(array) {
        var fragment,
            i,
            l,
            lTrimmed,
            r,
            rTrimmed,
            trailingSpace;
        i = 0;
        l = array.length;
        fragment = void 0;
        lTrimmed = false;
        rTrimmed = false;
        while (!lTrimmed && i !== l) {
            fragment = array[i] = array[i].trimLeft();
            if (fragment) {
                lTrimmed = true;
            }
            i++;
        }
        i = l - 1;
        while (l && !rTrimmed && i !== -1) {
            fragment = array[i] = array[i].trimRight();
            if (fragment) {
                rTrimmed = true;
            }
            i--;
        }
        r = /\s+$/g;
        trailingSpace = true;
        i = 0;
        while (i !== l) {
            fragment = array[i].replace(/\s+/g, " ");
            if (trailingSpace) {
                fragment = fragment.trimLeft();
            }
            if (fragment) {
                trailingSpace = r.test(fragment);
            }
            array[i] = fragment;
            i++;
        }
        return array;
    };
    Renderer = function(pdf, x, y, settings) {
        this.pdf = pdf;
        this.x = x;
        this.y = y;
        this.settings = settings;
        //list of functions which are called after each element-rendering process
        this.watchFunctions = [];
        this.usedImagesBySrc = {};
        this.init();
        return this;
    };
    ResolveFont = function(css_font_family_string) {
        var name,
            part,
            parts;
        name = void 0;
        parts = css_font_family_string.split(',');
        part = parts.shift();
        while (!name && part) {
            var key = part.trim().toLowerCase().replace(/["']/g, '');
            name = FontNameDB[key];
            part = parts.shift();
        }
        return fontOverrides[name] || name;
    };
    CssLengthToPx = function(cssStr) {
        if (cssStr.indexOf("em") > -1 && !isNaN(Number(cssStr.replace("em", "")))) {
            cssStr = Number(cssStr.replace("em", "")) * 18.719 + "px";
        }
        if (cssStr.indexOf("pt") > -1 && !isNaN(Number(cssStr.replace("pt", "")))) {
            cssStr = Number(cssStr.replace("pt", "")) * 1.333 + "px";
        }
        return cssStr;
    };
    ResolveUnitedNumber = function(css_line_height_string) {
        css_line_height_string = CssLengthToPx(css_line_height_string);

        //IE8 issues
        css_line_height_string = css_line_height_string === "auto" ? "0px" : css_line_height_string;

        var normal,
            undef,
            value;
        undef = void 0;
        normal = 16.00;
        value = UnitedNumberMap[css_line_height_string];
        if (value) {
            return value;
        }
        value = {
            "xx-small": 9,
            "x-small": 11,
            small: 13,
            medium: 16,
            large: 19,
            "x-large": 23,
            "xx-large": 28,
            auto: 0
        }[{
            css_line_height_string: css_line_height_string
        }];

        if (value !== undef) {
            return UnitedNumberMap[css_line_height_string] = value / normal;
        }
        if (value = parseFloat(css_line_height_string)) {
            return UnitedNumberMap[css_line_height_string] = value / normal;
        }
        value = css_line_height_string.match(/([\d\.]+)(px)/);
        if (value && value.length === 3) {
            return UnitedNumberMap[css_line_height_string] = parseFloat(value[1]) / normal;
        }
        return UnitedNumberMap[css_line_height_string] = 1;
    };
    GetCSS = function(element) {
        var css,
            tmp,
            computedCSSElement;
        computedCSSElement = (function(el) {
            var compCSS;
            compCSS = (function(el) {
                if (document.defaultView && document.defaultView.getComputedStyle) {
                    return document.defaultView.getComputedStyle(el, null);
                } else if (el.currentStyle) {
                    return el.currentStyle;
                } else {
                    return el.style;
                }
            })(el);
            return function(prop) {
                prop = prop.replace(/-\D/g, function(match) {
                    return match.charAt(1).toUpperCase();
                });
                return compCSS[prop];
            };
        })(element);
        css = {};
        tmp = void 0;
        css["font-family"] = ResolveFont(computedCSSElement("font-family")) || "times";
        css["font-style"] = FontStyleMap[computedCSSElement("font-style")] || "normal";
        css["text-align"] = TextAlignMap[computedCSSElement("text-align")] || "left";
        tmp = FontWeightMap[computedCSSElement("font-weight")] || "normal";
        if (tmp === "bold") {
            if (css["font-style"] === "normal") {
                css["font-style"] = tmp;
            } else {
                css["font-style"] = tmp + css["font-style"];
            }
        }
        css["font-size"] = ResolveUnitedNumber(computedCSSElement("font-size")) || 1;
        const lineHeightCSS = computedCSSElement("line-height");
        css["line-height"] = (lineHeightCSS === 'normal') ? 1.2 
            : ResolveUnitedNumber(lineHeightCSS);
        css["display"] = (computedCSSElement("display") === "inline" ? "inline" : "block");
        if (css["display"] === "block") {
            css["margin-top"] = ResolveUnitedNumber(computedCSSElement("margin-top")) || 0;
            css["margin-bottom"] = ResolveUnitedNumber(computedCSSElement("margin-bottom")) || 0;
            css["padding-top"] = ResolveUnitedNumber(computedCSSElement("padding-top")) || 0;
            css["padding-bottom"] = ResolveUnitedNumber(computedCSSElement("padding-bottom")) || 0;
            css["margin-left"] = ResolveUnitedNumber(computedCSSElement("margin-left")) || 0;
            css["margin-right"] = ResolveUnitedNumber(computedCSSElement("margin-right")) || 0;
            css["padding-left"] = ResolveUnitedNumber(computedCSSElement("padding-left")) || 0;
            css["padding-right"] = ResolveUnitedNumber(computedCSSElement("padding-right")) || 0;
        }
        //float and clearing of floats
        css["float"] = FloatMap[computedCSSElement("cssFloat")] || "none";
        css["clear"] = ClearMap[computedCSSElement("clear")] || "none";
        css['text-decoration'] = computedCSSElement('text-decoration');
        css['background-color'] = computedCSSElement('background-color');
        css['color'] = computedCSSElement('color');
        return css;
    };
    elementHandledElsewhere = function(element, renderer, elementHandlers) {
        var handlers,
            i,
            isHandledElsewhere,
            l,
            t;
        isHandledElsewhere = false;
        i = void 0;
        l = void 0;
        t = void 0;
        handlers = elementHandlers["#" + element.id];
        if (handlers) {
            if (typeof handlers === "function") {
                isHandledElsewhere = handlers(element, renderer);
            } else {
                i = 0;
                l = handlers.length;
                while (!isHandledElsewhere && i !== l) {
                    isHandledElsewhere = handlers[i](element, renderer);
                    i++;
                }
            }
        }
        handlers = elementHandlers[element.nodeName];
        if (!isHandledElsewhere && handlers) {
            if (typeof handlers === "function") {
                isHandledElsewhere = handlers(element, renderer);
            } else {
                i = 0;
                l = handlers.length;
                while (!isHandledElsewhere && i !== l) {
                    isHandledElsewhere = handlers[i](element, renderer);
                    i++;
                }
            }
        }
        return isHandledElsewhere;
    };
    tableToJson = function(table, renderer) {
        var data,
            headers,
            i,
            j,
            rowData,
            tableRow,
            table_obj,
            table_with,
            cell,
            l;
        data = [];
        headers = [];
        i = 0;
        l = table.rows[0].cells.length;
        table_with = table.clientWidth;
        while (i < l) {
            cell = table.rows[0].cells[i];
            headers[i] = {
                name: cell.textContent.toLowerCase().replace(/\s+/g, ''),
                prompt: cell.textContent.replace(/\r?\n/g, ''),
                width: (cell.clientWidth / table_with) * renderer.pdf.internal.pageSize.width
            };
            i++;
        }
        i = 1;
        while (i < table.rows.length) {
            tableRow = table.rows[i];
            rowData = {};
            j = 0;
            while (j < tableRow.cells.length) {
                rowData[headers[j].name] = tableRow.cells[j].textContent.replace(/\r?\n/g, '');
                j++;
            }
            data.push(rowData);
            i++;
        }
        return table_obj = {
            rows: data,
            headers: headers
        };
    };
    var SkipNode = {
        SCRIPT: 1,
        STYLE: 1,
        NOSCRIPT: 1,
        OBJECT: 1,
        EMBED: 1,
        SELECT: 1
    };
    var listCount = 1;

    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    function extractCSSColorRGB(cssColorText) {
        if (!cssColorText) {
            return null;
        }
        if (cssColorText.indexOf("rgb") >= 0) {
            var rgb_values = cssColorText.match(/^rgb(a)?\((\d+),\s*(\d+),\s*(\d+)(,\s*(\d+))?\)$/);
            // Ignore transparency for now
            if (rgb_values[1] === "a") {
                if (parseInt(rgb_values[6], 10) === 0) {
                    return null;
                }
            }
            return {
                r: parseInt(rgb_values[2], 10),
                g: parseInt(rgb_values[3], 10),
                b: parseInt(rgb_values[4], 10)
            };
        }
        return hexToRgb(cssColorText);
    }

    function RenderElement(cn, renderer, elementHandlers, offsetTopPx, offsetLeftPx) {
        offsetTopPx = offsetTopPx || 0;
        offsetLeftPx = offsetLeftPx || 0;
        if (typeof cn === "object") {

            //execute all watcher functions to e.g. reset floating
            renderer.executeWatchFunctions(cn);

            // /*** HEADER rendering **/
            // if (cn.nodeType === 1 && cn.nodeName === 'HEADER') {
            //     var header = cn;
            //     //store old top margin
            //     var oldMarginTop = renderer.pdf.margins_doc.top;
            //     //subscribe for new page event and render header first on every page
            //     renderer.pdf.internal.events.subscribe('addPage', function(pageInfo) {
            //         //set current y position to old margin
            //         renderer.y = oldMarginTop;
            //         //render all child nodes of the header element
            //         DrillForContent(header, renderer, elementHandlers);
            //         //set margin to old margin + rendered header + 10 space to prevent overlapping
            //         //important for other plugins (e.g. table) to start rendering at correct position after header
            //         renderer.pdf.margins_doc.top = renderer.y + 10;
            //         renderer.y += 10;
            //     }, false);
            // }

            if (cn.nodeType === 8 && cn.nodeName === "#comment") {
                // if (~cn.textContent.indexOf("ADD_PAGE")) {
                //     renderer.pdf.addPage();
                //     renderer.y = renderer.pdf.margins_doc.top;
                // }

            } else if (cn.nodeType === 1 && !SkipNode[cn.nodeName]) {
                /*** IMAGE RENDERING ***/
                if (cn.className.indexOf("jsr-image") > -1) 
                {
                    var src = $(cn).data("image-url");
                    if (images[src]) {
                      var imagesCSS = GetCSS(cn),
                          img = images[src],
                          $img = $(cn),
                          imgPos = {
                            top: offsetTopPx + cn.offsetTop - renderer.offsetInSectionPx,
                            left: offsetLeftPx + cn.offsetLeft
                          };
                      var imageX = (imgPos.left) * renderer.settings.x_scale_factor;
                      // set image width to defined width, height to keep natural aspect ratio, limited
                      // to defined height (will scale down beyond that)
                      var outImageHeight = Math.min($img.height() * renderer.settings.x_scale_factor,
                        img.height / img.width * $img.width() * renderer.settings.x_scale_factor);

                      if (renderer.usedImagesBySrc[src]) {
                        // we've already added this image to the PDF; reference it by alias
                          renderer.pdf.addImage(images[src], imageX, 
                              (renderer.y + imgPos.top) * renderer.settings.x_scale_factor, 
                              $img.width() * renderer.settings.x_scale_factor, 
                              outImageHeight, src);
                      } else {
                            renderer.pdf.addImage(images[src], imageX, 
                                (renderer.y + imgPos.top) * renderer.settings.x_scale_factor, 
                                $img.width() * renderer.settings.x_scale_factor, 
                                outImageHeight);
                            renderer.usedImagesBySrc[src] = true;
                      }
                    }
                } else {
                    if (!elementHandledElsewhere(cn, renderer, elementHandlers)) {
                        var $cn = $(cn);
                        // if ($cn.hasClass("jsr-text")) {
                        //     renderText.call(this, $cn, renderer, { top: offsetTopPx, left: offsetLeftPx });
                        if ($cn.hasClass('jsr-page-header') 
                            || $cn.hasClass("jsr-page-footer")
                            || $cn.hasClass("jsr-page-background")) {
                            // DO NOTHING - prevent drill-down into this
                        } else if ($cn.hasClass("jsr-section")) {
                            renderSection.call(this, $cn, renderer, elementHandlers);
                        } else if ($(cn).hasClass("jsr-chart")) {
                            // Charts (new)
                            var svgDomEl = $(cn).find('svg')[0],
                                pos = {
                                    top: offsetTopPx + cn.offsetTop - renderer.offsetInSectionPx,
                                    left: offsetLeftPx + cn.offsetLeft
                                },
                                x = (pos.left) * renderer.settings.x_scale_factor,
                                y = (renderer.y + pos.top) * renderer.settings.x_scale_factor,
                                width = $(cn).width() * renderer.settings.x_scale_factor,
                                height = $(cn).height() * renderer.settings.x_scale_factor,
                                imgData = jsreports.svgToDataUri(svgDomEl, $(cn).width(), $(cn).height(), 'jpg');
                            renderer.pdf.addImage(imgData, 'jpeg', x, y, width, height);
                        } else if ($(cn).hasClass("jsr-box")) {
                            var $boxEl = $(cn),
                                pos = { 
                                    top: offsetTopPx + cn.offsetTop - renderer.offsetInSectionPx, 
                                    left: offsetLeftPx + cn.offsetLeft 
                                }, 
                                x = (pos.left) * renderer.settings.x_scale_factor,
                                y = (renderer.y + pos.top) * renderer.settings.x_scale_factor,
                                width = $boxEl.outerWidth() * renderer.settings.x_scale_factor,
                                height = $boxEl.outerHeight() * renderer.settings.x_scale_factor,
                                borderColor = extractCSSColorRGB($boxEl.css("border-color")),
                                backColor = extractCSSColorRGB($boxEl.css("background-color")) || { r: 255, g: 255, b: 255 };
                            if (borderColor) {
                                renderer.pdf.setDrawColor(borderColor.r, borderColor.g, borderColor.b);
                            }
                            renderer.pdf.setFillColor(backColor.r, backColor.g, backColor.b);
                            var cssRadius = $boxEl.css("border-radius"),
                                radiusPx = 0;
                            if (cssRadius) {
                                radiusPx = parseInt(cssRadius, 10);
                            }
                            if (radiusPx > 0) {
                                var radiusPdfUnits = radiusPx * renderer.settings.x_scale_factor;
                                radiusPdfUnits = Math.min(radiusPdfUnits, Math.min(width / 2, height / 2));
                                renderer.pdf.roundedRect(x, y, width, height, radiusPdfUnits, radiusPdfUnits, 
                                    (borderColor ? 'FD' : 'F'));
                            } else {
                                renderer.pdf.rect(x, y, width, height, (borderColor ? 'FD' : 'F'));
                            }
                        } else if ($(cn).hasClass("jsr-barcode")) {
                            var pos = {
                                    top: offsetTopPx + cn.offsetTop - renderer.offsetInSectionPx,
                                    left: offsetLeftPx + cn.offsetLeft
                                },
                                x = (pos.left) * renderer.settings.x_scale_factor,
                                y = (renderer.y + pos.top) * renderer.settings.x_scale_factor,
                                $img = $(cn).find("img"),
                                width = $img.width() * renderer.settings.x_scale_factor,
                                height = $img.height() * renderer.settings.x_scale_factor,
                                src = $img.attr('src');

                            var tmpImage = new Image();
                            tmpImage.src = src;
                            var naturalWidth = tmpImage.width; //$img.width() * 1.25; //tmpImage.width;
                            var naturalHeight = tmpImage.height; //$img.height() * 1.25; // tmpImage.height;
                            var canvas = document.createElement("canvas");
                            document.body.appendChild(canvas);
                            canvas.width  = naturalWidth;
                            canvas.height = naturalHeight;
                            var context = canvas.getContext("2d");
                            context.fillStyle = "rgb(255,255,255)";
                            context.fillRect(0, 0, naturalWidth, naturalHeight);
                            context.drawImage($img[0], 0, 0, naturalWidth, naturalHeight);
                            var imgData = canvas.toDataURL('image/jpeg');
                            if (imgData) {
                                if (imgData === "data:,") {
                                    imgData = src;
                                }
                                var format = (imgData.indexOf('image/png') >= 0 ? 'png' : 'jpeg');
                                renderer.pdf.addImage(imgData, format, x, y, width, height);
                            }
                            $(canvas).remove();
                        } else {
                            DrillForContent(cn, renderer, elementHandlers);
                        }
                    }
                }
            } else if (cn.nodeType === 3) {
                var value = cn.nodeValue;
                if (cn.nodeValue && cn.parentNode.nodeName === "LI") {
                    if (cn.parentNode.parentNode.nodeName === "OL") {
                        value = listCount++ +'. ' + value;
                    } else {
                        var fontPx = fragmentCSS["font-size"] * 16;
                        var radius = 2;
                        if (fontPx > 20) {
                            radius = 3;
                        }
                        cb = function(x, y) {
                            this.pdf.circle(x, y, radius, 'FD');
                        };
                    }
                }
                renderer.addText(value, fragmentCSS);
            } else if (typeof cn === "string") {
                renderer.addText(cn, fragmentCSS);
            }
        }
    };

    DrillForContent = function(element, renderer, elementHandlers) {
        var cn,
            cns,
            fragmentCSS,
            i,
            isBlock,
            l,
            px2pt,
            table2json,
            cb;
        cns = element.childNodes;
        cn = void 0;
        fragmentCSS = GetCSS(element);
        isBlock = fragmentCSS.display === "block";
        // if (isBlock) {
        //     renderer.setBlockBoundary();
        //     renderer.setBlockStyle(fragmentCSS);
        // }
        px2pt = 0.264583 * 72 / 25.4;
        i = 0;
        l = cns.length;
        while (i < l) {
            RenderElement(cns[i], renderer, elementHandlers);
            i++;
        }

        // if (isBlock) {
        //     return renderer.setBlockBoundary(cb);
        // }
    };
    images = {};
    loadImgs = function(element, renderer, elementHandlers, cb) {
        var imgs = $("img, div.jsr-image", element).toArray(),
            l = imgs.length,
            x = 0;
        const tdBackgroundImageUrls = [];

        var $tds = $('td', element);
        for (let i = 0; i < $tds.length; i++) {
            const backgroundImage = getTableCellBackgroundImage($tds.eq(i));
            if (backgroundImage) {
                tdBackgroundImageUrls.push(backgroundImage);
            }
        }

        function done() {
            renderer.pdf.internal.events.publish('imagesLoaded');
            cb();
        }

        function loadImage(url, width, height) {
            if (!url)
                return;
            var img = new Image();
            ++x;
            img.crossOrigin = '';
            img.onerror = img.onload = function() {
                try {
                    if (img.complete) {
                        //to support data urls in images, set width and height
                        //as those values are not recognized automatically
                        if (img.src.indexOf('data:image/') === 0) {
                            img.width = width || img.width || 0;
                            img.height = height || img.height || 0;
                        }
                        //if valid image add to known images array
                        if (img.width + img.height) {

                            var tmpImage = new Image();
                            tmpImage.src = img.src;
                            var naturalWidth = tmpImage.width || img.width; 
                            var naturalHeight = tmpImage.height || img.height; 
                            // Hard-limit max size of image to 3x pixel size of target area
                            // To prevent massive images from blowing out PDF file size
                            if (width && height) {
                                const maxWidth = width * 3;
                                const maxHeight = height * 3;
                                if (naturalWidth > maxWidth || naturalHeight > maxHeight) {
                                    const shrinkRatio = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight);
                                    // console.log('limiting max image res from', naturalWidth, naturalHeight, width, height);
                                    naturalWidth *= shrinkRatio;
                                    naturalHeight *= shrinkRatio;
                                }
                            }

                            // console.log('natural dimensions (limited)', naturalWidth, naturalHeight);
                            var canvas = document.createElement("canvas");
                            document.body.appendChild(canvas);
                            canvas.width  = naturalWidth;
                            canvas.height = naturalHeight;
                            var context = canvas.getContext("2d");
                            context.fillStyle = "rgb(255,255,255)";
                            context.fillRect(0, 0, naturalWidth, naturalHeight);
                            context.drawImage(img, 0, 0, naturalWidth, naturalHeight);
                            tmpImage.src = canvas.toDataURL('image/jpeg');
                            // console.log('data uri length is', tmpImage.src.length);
                            tmpImage.width = naturalWidth;
                            tmpImage.height = naturalHeight;
                            $(canvas).remove();

                            images[url] = images[url] || tmpImage;
                        }
                    }
                } catch (e) {
                    console.warn(e);
                }
                if (!--x) {
                    done();
                }
            };
            img.src = url;
        }
        while (l--) {
            var imgEl = imgs[l];
            var $imgEl = $(imgEl);
            // Ignore <img> tags found within div.jsr-image (those are handled separately in this loop)
            if ($imgEl.parent('.jsr-image').length) { continue; }
            var src = (imgEl.tagName.toLowerCase() === "img" ? imgEl.getAttribute("src") : $(imgEl).data("image-url"));
            loadImage(src, $imgEl.width(), $imgEl.height());
        }
        tdBackgroundImageUrls.forEach(src => loadImage(src));
        return x || done();
    };

    function extractTableCells(tableDomEl, offsetTop, offsetLeft, renderer) {
        var $table = $(tableDomEl);
        var tablePositionPx = {
            left: offsetLeft + tableDomEl.offsetLeft,
            top: offsetTop + tableDomEl.offsetTop
        };
        var cells = [];
        let rowOffsetPx = 0;
        $table.find('tr').each((ix, tr) => {
            let rowHeightPx = 0;
            let rowCells = [];
            $(tr).find('td,th').each((ix, cell) => {
                const $cell = $(cell);
                const styles = GetCSS(cell);
                // console.log('cell padding', styles['padding-top'], styles['padding-right'], styles['padding-bottom'], styles['padding-left']);

                // Must re-flow and measure cell content to increase row height to fit if necessary
                const block = layoutText.call(this, $cell, renderer);
                const cellHeight = Math.max(
                    block.heightPx, 
                    $cell.outerHeight());
                rowHeightPx = Math.max(rowHeightPx, cellHeight);
                block.leftPx += tablePositionPx.left;   // No need to fix topPx since it's not used

                // increase cell height taking padding into consideration

                rowCells.push({
                    isTableCell: true,
                    tablePositionPx: tablePositionPx,
                    top: tablePositionPx.top + rowOffsetPx,  // rel to section
                    $el: $cell,
                    laidOutText: block
                });
            });
            rowOffsetPx += rowHeightPx;
            // Fill in row bottom px on all cells in the previous row
            for (let i = 0; i < rowCells.length; i++) {
                const cell = rowCells[i];
                cell.bottom = tablePositionPx.top + rowOffsetPx; // rel to section
                cells.push(cell);
            }
        });
        return {
            cells: cells,
            bottomEdge: tablePositionPx.top + rowOffsetPx
        };
    }

    function extractSubreportChildElements(subreportDomEl, offsetTop, offsetLeft, renderer) {
        var subreportTop = offsetTop + subreportDomEl.offsetTop - renderer.offsetInSectionPx;
        var subreportLeft = offsetLeft + subreportDomEl.offsetLeft;
        var $subreport = $(subreportDomEl);
        var $sections = $subreport.children('.jsr-section');
        var allElts = [];
        var breaks = [];
        var sectionTop = 0;
        // var height = 0;
        for (var i = 0, secLen = $sections.length; i < secLen; i++) {
            var $section = $sections.eq(i);
            var section = $section[0];
            var sectionInfo = extractElementsWithinSection($section, 
                subreportTop + sectionTop, 
                subreportLeft, renderer);
            allElts = allElts.concat(sectionInfo.elts);
            breaks = breaks.concat(sectionInfo.breaks);
            sectionTop += sectionInfo.height;
        }
        return {
            breaks: breaks,
            elts: allElts,
            bottomEdge: subreportDomEl.offsetTop + sectionTop
        };
    }

    /**
     * Finds all leaf-level elements anywhere in the section, along with their net offset to $section,
     * plus a list of page breaks within any child sections, also relative to the root $section.
     * Breaks tables up into individual cell "elements", and flattens nested subreports into
     * collections of leaf-level elements.
     */
    function extractElementsWithinSection($section, offsetTop, offsetLeft, renderer) {
        var breaks = $section.data('page-breaks') || [];
        for (var i = 0, len = breaks.length; i < len; i++) {
            breaks[i] += offsetTop;
        }
        var allElts = [];
        var $childElts = $section.children('.jsr-element:not(.jsr-table,.jsr-subreport)');
        var sectionHeight = $section[0].offsetHeight;
        for (var i = 0, len = $childElts.length; i < len; i++) {
            var el = $childElts[i];
            var $el = $(el);
            var globalTop = offsetTop + el.offsetTop;
            var height = $el.outerHeight();
            var elInfo = {
                top: globalTop,
                offsetLeft: offsetLeft,
                offsetTop: offsetTop,
                $el: $el
            }
            if (el.className.indexOf('jsr-text') >= 0) {
                const textBlock = layoutText.call(this, $el, renderer);
                height = textBlock.heightPx;
                elInfo.isText = true;
                elInfo.textBlock = textBlock;
            }
            var globalBottom = globalTop + height;
            sectionHeight = Math.max(sectionHeight, el.offsetTop + height);
            elInfo.bottom = globalBottom;
            allElts[allElts.length] = elInfo;
        }
        $section.children('.jsr-table').each(function() {
            const tableInfo = extractTableCells.call(null, this, 
                offsetTop, offsetLeft, renderer);
            allElts = allElts.concat(tableInfo.cells);
            sectionHeight = Math.max(sectionHeight, tableInfo.bottomEdge);
        });
        var subreports = $section.children('.jsr-subreport');
        for (var i = 0, subreportLen = subreports.length; i < subreportLen; i++) {
            var subsectionInfo = extractSubreportChildElements.call(null, subreports[i], 
                offsetTop, offsetLeft, renderer);
            allElts = allElts.concat(subsectionInfo.elts);
            breaks = breaks.concat(subsectionInfo.breaks);
            sectionHeight = Math.max(sectionHeight, subsectionInfo.bottomEdge);
        }
        return {
            breaks: breaks,
            elts: allElts,
            height: sectionHeight
        };
    }

    function renderSection($section, renderer, elementHandlers) {
        renderer.current_section_height = $section.height();
        renderer.offsetInSectionPx = 0;
        var allChildInfo = extractElementsWithinSection.call(this, $section, 0, 0, renderer);
        var allElts = allChildInfo.elts;
        var breaks = allChildInfo.breaks;
        const isHeader = $section.hasClass('jsr-page-header');
        const isFooter = $section.hasClass('jsr-page-footer');
        const isBackground = $section.hasClass('jsr-page-background');
        const canWrap = !(isHeader || isFooter || isBackground);
        allElts.sort(function(a, b) {
            return a.top - b.top;
        });
        breaks.sort(function(a, b) {
            return a - b;
        });
        // startY and endY are always within [0..sectionHeight)
        var startY = 0;
        var endY;
        var sectionHeight = allChildInfo.height;
        var printableAreaBottom = (renderer.settings.y_height_pixels 
            - renderer.pdf.margins_doc.bottom - ((isFooter || isBackground) ? 0 : pageFooterHeight));
        var iters = 0;
        while (startY < sectionHeight) {
            endY = sectionHeight;
            // all these calculations are in pixels
            var wouldBeSectionBottom = (renderer.y + (endY - startY));
            // set endY to the max we can fit on the current page
            if (printableAreaBottom < wouldBeSectionBottom) {
                endY = startY + (printableAreaBottom - (renderer.y));
            }
            // if a defined page break exists before the end of this page, break there instead
            if (breaks.length > 0 && breaks[0] < endY) {
                endY = breaks.shift();
            }
            var nextStartY = endY;
            var batch = [];
            while (allElts.length > 0) {
                var eltInfo = allElts[0];

                if (eltInfo.top >= endY) {
                    break;
                }

                if (eltInfo.bottom <= endY || eltInfo.mustPrint) {
                    // will draw elt; remove from list
                    batch.push(eltInfo);
                    allElts.shift();
                } else if (eltInfo.isText /* TODO don't split if "splittable(?)" prop is set false on elt */) {
                    // This text block would span a page break - see if we can split it into two blocks
                    const linesOnThisPage = [];
                    const paddingTopPx = eltInfo.textBlock.paddingTopPx;
                    const firstLineTopPx = eltInfo.top + paddingTopPx;
                    let lastLineBottomPx = firstLineTopPx;
                    const lines = eltInfo.textBlock.lines;
                    const lineHeightPx = eltInfo.textBlock.lineHeightPx;
                    let lineIx = 0;
                    while (lineIx < lines.length) {
                        const line = lines[lineIx];
                        const thisLineBottomPx = firstLineTopPx + line.topPx + lineHeightPx;
                        if (thisLineBottomPx < endY) {
                            linesOnThisPage.push(line);
                            lastLineBottomPx = thisLineBottomPx;
                        } else {
                            break;
                        }
                        lineIx++;
                    }
                    if (linesOnThisPage.length > 0) {
                        const remainingLineCount = lines.length - linesOnThisPage.length;
                        if (remainingLineCount > 0) {
                            // Move the remaining lines into a new elt and append it to allElts
                            const newEltInfo = {
                                ...eltInfo,
                                mustPrint: true,
                                top: endY,
                                textBlock: {
                                    ...eltInfo.textBlock,
                                    topPx: lastLineBottomPx,
                                    topPts: lastLineBottomPx * renderer.settings.x_scale_factor,
                                    paddingTopPx: 0,
                                    heightPx: eltInfo.textBlock.heightPx - (lastLineBottomPx - firstLineTopPx),
                                    lines: eltInfo.textBlock.lines.slice(lineIx).map((line, ix) => ({
                                        ...line,
                                        topPx: line.topPx - lastLineBottomPx
                                    }))
                                }
                            };
                            allElts.push(newEltInfo);
                        }
                        // Put partial top block on this page
                        eltInfo.textBlock.lines = linesOnThisPage;
                        batch.push(eltInfo);
                        allElts.shift();
                    } else {
                        // Couldn't split; move to next page
                        eltInfo.mustPrint = true;
                        nextStartY = eltInfo.top;
                        break;                        
                    }
                } else {
                    // the first element we encounter with its bottom outside the printable range is shifted to the next page;
                    // we must print it in the next pass regardless of whether it fits
                    eltInfo.mustPrint = true;
                    nextStartY = eltInfo.top;
                    break;
                }
            }
            batch.sort(function(a, b) {
                // -1 = a beneath b
                var aEl = a.$el[0];
                var bEl = b.$el[0];
                var aZIndex = Number(aEl.style.zIndex) || 0;
                var bZIndex = Number(bEl.style.zIndex) || 0;
                if (aZIndex > bZIndex) {
                    return 1;
                } else if (bZIndex > aZIndex) {
                    return -1;
                } else {
                    // Same zIndex: put boxes beneath other elements
                    var aBox = aEl.className.indexOf('jsr-box') >= 0; //.hasClass('jsr-box');
                    var bBox = bEl.className.indexOf('jsr-box') >= 0; //.hasClass('jsr-box');
                    return (aBox ? (bBox ? 1 : -1) : 1);
                }
            });
            batch.forEach(function(eltInfo) {
                if (eltInfo.isTableCell) {
                    renderTableCell(eltInfo, renderer, eltInfo.tablePositionPx);
                } else if (eltInfo.isText) {
                    // console.log('rendering from pre-laid-out text block');
                    renderLaidOutText.call(this, eltInfo.textBlock, renderer);
                } else {
                    RenderElement(eltInfo.$el[0], renderer, elementHandlers, eltInfo.offsetTop, eltInfo.offsetLeft);
                }
            });
            renderer.y += (endY - startY);
            if (!canWrap) break;
            if (endY < sectionHeight) {
                // page break
                if (pageFooter) {
                    renderer.y = renderer.settings.y_height_pixels 
                        - renderer.pdf.margins_doc.bottom - pageFooterHeight;
                    renderSection.call(this, pageFooter, renderer, elementHandlers);
                }
                // add page
                renderer.pdf.addPage();
                renderer.pageNumber++;
                renderer.y = renderer.pdf.margins_doc.top;
                if (pageBackground) {
                    renderSection.call(this, $(pageBackground), renderer, elementHandlers);
                }
                renderer.y = renderer.pdf.margins_doc.top;
                // print next page header
                if (pageHeader) {
                    renderSection.call(this, pageHeader, renderer, elementHandlers);
                    // renderer.y += pageHeaderHeight;
                }
                renderer.offsetInSectionPx = nextStartY;
            }
            startY = nextStartY;
        }
    }

    function renderTableCell(cellInfo, renderer, tablePositionPx) {
        const $cell = cellInfo.$el;
        var cellPos = $cell.position();
        cellPos.left += tablePositionPx.left;
        cellPos.right = cellPos.left + $cell.outerWidth();
        const cellTop = cellInfo.top - renderer.offsetInSectionPx;
        cellInfo.laidOutText.topPts = cellInfo.top * renderer.settings.x_scale_factor;
        const cellBottom = cellInfo.bottom - renderer.offsetInSectionPx;
        renderTableCellBorder.call(this, cellInfo, renderer, 'top', cellTop, cellPos.left, cellPos.right);
        renderTableCellBorder.call(this, cellInfo, renderer, 'bottom', cellBottom, cellPos.left, cellPos.right);
        renderTableCellBorder.call(this, cellInfo, renderer, 'left', cellPos.left, cellTop, cellBottom);
        renderTableCellBorder.call(this, cellInfo, renderer, 'right', cellPos.right, cellTop, cellBottom);
        const backgroundImage = getTableCellBackgroundImage($cell);
        if (backgroundImage) {
            let backgroundLeftPx = 0;
            let backgroundTopPx = 0;
            const backgroundPos = $cell.css('background-position');
            if (backgroundPos) {
                const posParts = backgroundPos.split(' ');
                if (posParts.length === 1) {
                    backgroundTopPx = backgroundLeftPx = parseFloat(posParts[0]);
                } else if (posParts.length === 2) {
                    backgroundLeftPx = parseFloat(posParts[0]);
                    backgroundTopPx = parseFloat(posParts[1]);
                }
            }
            let backgroundWidthPx = 0;
            let backgroundHeightPx = 0;
            const backgroundSize = $cell.css('background-size');
            if (backgroundSize) {
                const sizeParts = backgroundSize.split(' ');
                if (sizeParts.length === 1) {
                    backgroundWidthPx = backgroundHeightPx = parseFloat(sizeParts[0]);
                } else if (posParts.length === 2) {
                    backgroundWidthPx = parseFloat(sizeParts[0]);
                    backgroundHeightPx = parseFloat(sizeParts[1]);
                }
            }
            if (images[backgroundImage]) {
                const img = images[backgroundImage];
                const imageLeftPts = (cellPos.left + backgroundLeftPx) * renderer.settings.x_scale_factor;
                const imageTopPts = (renderer.y + cellTop + backgroundTopPx) * renderer.settings.x_scale_factor;
                const outImageHeightPts = Math.min(backgroundHeightPx * renderer.settings.x_scale_factor,
                    img.height / img.width * backgroundWidthPx * renderer.settings.x_scale_factor);
                if (renderer.usedImagesBySrc[backgroundImage]) {
                // we've already added this image to the PDF; reference it by alias
                  renderer.pdf.addImage(img, imageLeftPts, imageTopPts, 
                      backgroundWidthPx * renderer.settings.x_scale_factor, 
                      outImageHeightPts, backgroundImage);
                } else {
                    renderer.pdf.addImage(img, imageLeftPts, imageTopPts, 
                        backgroundWidthPx * renderer.settings.x_scale_factor, 
                        outImageHeightPts);
                    renderer.usedImagesBySrc[backgroundImage] = true;
                }
            }
        }
        renderLaidOutText.call(this, cellInfo.laidOutText, renderer);
    }

    function getTableCellBackgroundImage($td) {
        const backgroundImage = $td.css('background-image');
        if (backgroundImage) {
            const matches = /^url\(['"]?([^'"\)]*)['"]?\)$/i.exec(backgroundImage);
            if (matches && matches.length > 1) {
                return matches[1];
            }
        }
        return null;
    }

    function renderTableCellBorder(cellInfo, renderer, borderName, pos, extent0, extent1) {
        const $cell = cellInfo.$el;
        var thickness = parseFloat($cell.css('border-' + borderName + '-width') || '0');
        var color = extractCSSColorRGB($cell.css('border-' + borderName + '-color')) || { r: 0, g: 0, b: 0 };
        if (!thickness || !color || color === 'transparent') return;
        thickness *= renderer.settings.x_scale_factor;
        pos -= thickness / 2;
        renderer.pdf.setFillColor(color.r, color.g, color.b);
        if (borderName === 'top' || borderName == 'bottom') {
            renderer.pdf.rect(
                extent0 * renderer.settings.x_scale_factor, 
                (renderer.y + pos) * renderer.settings.x_scale_factor, 
                (extent1 - extent0) * renderer.settings.x_scale_factor, 
                thickness * renderer.settings.x_scale_factor, 
                "F"
            );
        } else {
            renderer.pdf.rect(
                pos * renderer.settings.x_scale_factor, 
                (renderer.y + extent0) * renderer.settings.x_scale_factor, 
                thickness * renderer.settings.x_scale_factor, 
                (extent1 - extent0) * renderer.settings.x_scale_factor, 
                "F"
            );
        }
    }

    function getTextNodes(domEl, isListItem) {
        let textNodes = [];
        // Only look at element nodes
        if (domEl.nodeType !== 1) return textNodes;
        if (domEl.tagName.toLowerCase() === 'li') {
            isListItem = true;
        }
        for (let i = 0; i < domEl.childNodes.length; i++) {
            const child = domEl.childNodes[i];
            if (child.nodeType === 3) {
                textNodes.push({
                    text: child.textContent,
                    css: GetCSS(domEl),
                    node: child,
                    isListItem: isListItem,
                    isFirst: i === 0
                });
            } else {
                textNodes.push.apply(textNodes, getTextNodes(child, isListItem));
            }
        }
        return textNodes;
    }

    /** 
     * From HTML element, re-layout text for PDF, returning a set of lines
     * with some metadata, each line consisting of a set of chunks each
     * with its own formatting
     */
    function layoutText($elem, renderer, offsetPx) {
        const isMarkdown = $elem.hasClass('jsr-markdown');
        const domEl = $elem[0];
        const blockCSS = GetCSS(domEl);
        // The * 16 here is a weirdness due to the ResolveUnitedNumber function we inherited
        // from this plugin; it returns px / 16
        const paddingTopPx = (blockCSS['padding-top'] || 0) * 16;
        const paddingLeftPx = (blockCSS['padding-left'] || 0) * 16;
        const paddingRightPx = (blockCSS['padding-right'] || 0) * 16;
        const paddingBottomPx = (blockCSS['padding-bottom'] || 0) * 16;
        let blockPos = {
            top: domEl.offsetTop,
            left: domEl.offsetLeft
        };
        const defaultFontSize = 12;
        const blockAlign = blockCSS['text-align'] || 'left';
        let blockWidth = $elem.width();
        let lines = [];
        //    ^ edit: this is handled by the section renderer, may not be necessary 
        //      unless sections are really big
        let textNodes = getTextNodes($elem[0]);
        textNodes.forEach(node => {
            node.text = node.text.replace(/{{JSR_PRINT_PAGE_NUMBER}}/g, String(renderer.pageNumber));
        });
        if (offsetPx) {
            blockPos.left += offsetPx.left;
            blockPos.top += offsetPx.top;
        }
        var fontsize = $elem.data('font-size') || (blockCSS["font-size"] * defaultFontSize);
        renderer.pdf.setFont(blockCSS["font-family"], blockCSS["font-style"]);
        renderer.pdf.setFontSize(fontsize);

        const blockTopPts = (blockPos.top) * renderer.settings.x_scale_factor;
        var text_baseline_y = blockTopPts + fontsize,
            lineHeight = blockCSS['line-height'] * fontsize,
            lineHeightPx = lineHeight / renderer.settings.x_scale_factor;

        var lineOffsetPts = (lineHeight - fontsize) / 2.0;
        var lineCount = 0;

        blockCSS['font-size'] = fontsize / 12;   // splitFragment... uses 12 * fontsize as effective fontsize
        var fontKey = renderer.pdf.internal.getFont().id;
        usedFontKeys[fontKey] = true;

        let lineTopPx = 0;
        let lineWidthPts = 0;
        let chunks = [];

        const blockWidthPts = blockWidth * renderer.settings.x_scale_factor;
        for (let i = 0, n = textNodes.length; i < n; i++) {
            const node = textNodes[i];
            const nodeCSS = node.css;
            let nodeText = node.text;
            let leftIndentPts = 0;
            if (node.isListItem) {
                leftIndentPts = lineHeight;
                if (node.isFirst) {
                    lineWidthPts += leftIndentPts;
                    // Add text chunk for bullet
                    // Bullet gets same font but override bold/italic to just bold
                    const bulletCSS = {
                        ...nodeCSS,
                        'font-style': 'bold'
                    };
                    chunks.push({ style: bulletCSS, text: '•', leftPts: 0,
                        widthPts: leftIndentPts });
                }
            }
            // Must set font here for jspdf to measure correctly
            renderer.pdf.setFont(nodeCSS["font-family"], nodeCSS["font-style"]);
            if (isMarkdown) {
                // Handle literal linebreaks inside single text node
                nodeText = nodeText.replace(/[ \t]*\n[ \t]*/g, '\n');
            }
            const multiLineChunk = nodeText.split('\n');
            for (let j = 0, m = multiLineChunk.length; j < m; j++) {
                const subChunkLine = multiLineChunk[j];
                const textForMeasurement = subChunkLine.replace(/###jsPDFVarTotalPages###/g, '99');
                const textWidthPts = renderer.pdf.getStringUnitWidth(textForMeasurement) 
                    * fontsize / renderer.pdf.internal.scaleFactor;
                if (lineWidthPts + textWidthPts > blockWidthPts) {
                    const wrappedParts = renderer.pdf.splitTextToSize(subChunkLine, blockWidthPts, {
                        fontName: blockCSS['font-family'],
                        fontStyle: nodeCSS['font-style'],
                        fontSize: fontsize,
                        textIndent: lineWidthPts    // first line offset into block
                    });
                    // Each wrappedPart is on a separate line, starting with the end of 
                    // the current line
                    for (let k = 0; k < wrappedParts.length; k++) {
                        const wrappedPart = wrappedParts[k];
                        const wrappedPartWidthPts = renderer.pdf.getStringUnitWidth(wrappedPart) 
                            * fontsize / renderer.pdf.internal.scaleFactor;
                        chunks.push({ style: nodeCSS, text: wrappedParts[k], leftPts: lineWidthPts,
                            widthPts: wrappedPartWidthPts });
                        lineWidthPts += wrappedPartWidthPts;
                        if (k < wrappedParts.length - 1) {
                            lines.push({ topPx: lineTopPx, chunks: chunks, widthPts: lineWidthPts });
                            lineTopPx += lineHeightPx;
                            chunks = [];
                            lineWidthPts = leftIndentPts;
                        }
                    }
                } else {
                    chunks.push({ style: nodeCSS, text: subChunkLine, leftPts: lineWidthPts,
                        widthPts: textWidthPts });
                    lineWidthPts += textWidthPts;
                }
                /** Push hard line break after each sub-chunk line except last */
                if (j < m - 1) {
                    lines.push({ topPx: lineTopPx, chunks: chunks, widthPts: lineWidthPts });
                    lineTopPx += lineHeightPx;
                    chunks = [];
                    lineWidthPts = leftIndentPts;
                }
            }
        }
        lines.push({ topPx: lineTopPx, chunks: chunks, widthPts: lineWidthPts });

        const outerBlockWidth = blockWidth + paddingLeftPx + paddingRightPx;
        const outerBlockWidthPts = outerBlockWidth * renderer.settings.x_scale_factor;

        const block = {
            topPx: blockPos.top,
            topPts: blockTopPts,
            leftPx: blockPos.left,
            widthPx: outerBlockWidth,
            widthPts: outerBlockWidthPts,
            heightPx: lineTopPx + lineHeightPx + paddingTopPx + paddingBottomPx, // lineTopPx is last line top
            align: blockAlign,
            lines: lines,
            lineHeightPts: lineHeight,
            lineHeightPx: lineHeightPx,
            lineOffsetPts: lineOffsetPts,
            fontSize: fontsize,
            fontKey: fontKey,
            blockCSS: blockCSS,
            posPx: blockPos,
            paddingTopPx: paddingTopPx,
            paddingLeftPx: paddingLeftPx,
            paddingRightPx: paddingRightPx,
            paddingBottomPx: paddingBottomPx
        };
        return block;
    }

    /** Legacy function to layout and render text in one shot */
    // function renderText($elem, renderer, offsetPx) {
    //     renderLaidOutText.call(this, layoutText.call(this, $elem, renderer, offsetPx), renderer);
    // }

    /** 
     * Primary text rendering function; relies on pre-laid-out text block which is done
     * in a separate step in order to measure height before rendering 
     */
    function renderLaidOutText(block, renderer) {
        // Must adjust block top if we moved into a new page since the layout
        const blockTopPts = block.topPts + 
            ((renderer.y - renderer.offsetInSectionPx) * renderer.settings.x_scale_factor);
        const blockCSS = block.blockCSS;
        const lines = block.lines;

        const blockTextColor = blockCSS['color'];
        const blockBackColor = blockCSS['background-color'];
        const blockLeftPts = (block.leftPx) * renderer.settings.x_scale_factor;
        const paddingTopPts = (block.paddingTopPx) * renderer.settings.x_scale_factor;
        const paddingLeftPts = (block.paddingLeftPx) * renderer.settings.x_scale_factor;
        const paddingRightPts = (block.paddingRightPx) * renderer.settings.x_scale_factor;
        const paddingBottomPts = (block.paddingBottomPx) * renderer.settings.x_scale_factor;


        setColors.call(this, 
            renderer,
            blockLeftPts, 
            blockTopPts, 
            block.widthPx * renderer.settings.x_scale_factor, 
            block.heightPx * renderer.settings.x_scale_factor, 
            blockTextColor,
            blockBackColor
        );  

        const firstLineBaseline = blockTopPts + block.lineOffsetPts + paddingTopPts + block.fontSize;
        for (let l = 0, lc = lines.length; l < lc; l++) {
            const line = lines[l];
            let leftPts = paddingLeftPts;
            if (block.align === 'right') {
                leftPts = block.widthPts - paddingRightPts - line.widthPts;
            } else if (block.align === 'center') {
                leftPts = (block.widthPts - paddingRightPts - paddingLeftPts - line.widthPts) / 2;
            }
            for (let c = 0, cc = line.chunks.length; c < cc; c++) {
                const chunk = line.chunks[c];
                renderer.pdf.setFont(chunk.style["font-family"], chunk.style["font-style"]);
                renderer.pdf.setFontSize(block.fontSize);
                const chunkLeftPts = blockLeftPts + leftPts + chunk.leftPts;
                const chunkBaselinePts = firstLineBaseline + (l * block.lineHeightPts);
                const chunkTextColor = chunk.style['color'];
                let chunkBackColor = chunk.style['background-color'];
                if (chunkBackColor === blockBackColor) {
                    chunkBackColor = null;
                }
                setColors.call(this,
                    renderer,
                    chunkLeftPts, 
                    chunkBaselinePts - block.fontSize - block.lineOffsetPts, 
                    chunk.widthPts, 
                    block.lineHeightPts, 
                    chunkTextColor,
                    chunkBackColor
                );
                renderer.pdf.text(chunk.text, chunkLeftPts, chunkBaselinePts);
                if (chunk.style['text-decoration'] === 'line-through') {
                    const strikethroughPos = chunkBaselinePts - (0.3 * block.fontSize);
                    renderer.pdf.line(chunkLeftPts, strikethroughPos, chunkLeftPts + chunk.widthPts, strikethroughPos);
                } else if (chunk.style['text-decoration'] === 'underline') {
                    const underlinePos = chunkBaselinePts + (0.1 * block.lineHeightPts);
                    renderer.pdf.line(chunkLeftPts, underlinePos, chunkLeftPts + chunk.widthPts, underlinePos);
                }
            }
        }
    }

    function setColors(renderer, left, top, width, height, textColorCSS, backColorCSS) {
        const textColor = extractCSSColorRGB(textColorCSS) || { r: 0, g: 0, b: 0 };;
        const backColor = extractCSSColorRGB(backColorCSS);
        if (backColor) {
            renderer.pdf.setFillColor(backColor.r, backColor.g, backColor.b);
            renderer.pdf.rect(left, top, width, height, "F");
        }
        renderer.pdf.setTextColor(textColor.r, textColor.g, textColor.b);       
    }

    function getPixelCssDistance(cssPropText, renderer) {
        if (cssPropText.indexOf('%') >= 0) {
            return (parseFloat(cssPropText) / 100) * renderer.settings.width;
        }
        return parseFloat(cssPropText);
    }
    process = function(pdf, element, x, y, settings, callback) {
        usedFontKeys = {};
        if (!element)
            return false;
        if (typeof element !== "string" && !element.parentNode)
            element = '' + element.innerHTML;
        if (typeof element === "string") {
            element = (function(element) {
                var $frame,
                    $hiddendiv,
                    framename,
                    visuallyhidden;
                framename = "jsPDFhtmlText" + Date.now().toString() + (Math.random() * 1000).toFixed(0);
                visuallyhidden = "position: absolute !important;" + "clip: rect(1px 1px 1px 1px); /* IE6, IE7 */" + "clip: rect(1px, 1px, 1px, 1px);" + "padding:0 !important;" + "border:0 !important;" + "height: 1px !important;" + "width: 1px !important; " + "top:auto;" + "left:-100px;" + "overflow: hidden;";
                $hiddendiv = document.createElement('div');
                $hiddendiv.style.cssText = visuallyhidden;
                $hiddendiv.innerHTML = "<iframe style=\"height:1px;width:1px\" name=\"" + framename + "\" />";
                document.body.appendChild($hiddendiv);
                $frame = window.frames[framename];
                $frame.document.body.innerHTML = element;
                return $frame.document.body;
            })(element.replace(/<\/?script[^>]*?>/gi, ''));
        }
        var r = new Renderer(pdf, x, y, settings);
        r.offsetInSectionPx = 0;
        // r.rootElement = element;
        callback = callback || function() {};

        settings.x_scale_factor = r.pdf.internal.pageSize.width / r.settings.width;
        settings.y_height_pixels = r.pdf.internal.pageSize.height / settings.x_scale_factor;

        const clonePageHeaderOrFooter = ($section) => {
            const parent = $section.parent();
            const $clonedSection = $section.clone(true).css({
                display: 'block',
                left: '-10000px'
            });
            $clonedSection.find('.jsr-text').each((index, domEl) => {
                const $el = $(domEl);
                const template = $el.data('jsr-text-template');
                if (template) {
                    $el.text(template.replace(/{{JSR_PRINT_PAGE_COUNT}}/g, '###jsPDFVarTotalPages###'));
                }
            });
            parent.append($clonedSection);
            return $clonedSection;
        };

        // Find page header and footer if any
        pageHeader = $(".jsr-section.jsr-page-header", element);
        if (pageHeader.length > 0) {
            pageHeader = clonePageHeaderOrFooter(pageHeader);
            pageHeaderHeight = pageHeader.data("section-height") || pageHeader.height();
        } else {
            pageHeader = null;
        }
        pageFooter = $(".jsr-section.jsr-page-footer", element);
        if (pageFooter.length > 0) {
            pageFooter = clonePageHeaderOrFooter(pageFooter);
            pageFooterHeight = pageFooter.data("section-height") || pageFooter.height();
        } else {
            pageFooter = null;
        }
        pageBackground = $(".jsr-section.jsr-page-background", element);
        pageBackground = (pageBackground.length > 0 ? pageBackground[0] : null);
        r.pageNumber = 1;

        // 1. load images
        // 2. prepare optional footer elements
        // 3. render content
        var me = this;
        loadImgs.call(me, element, r, settings.elementHandlers, function() {

            // Begin rendering report content
            r.offset = { left: 0, top: 0 };
            
            delete r.current_section_height;

            if (pageBackground) {
                DrillForContent.call(this, pageBackground, r, settings.elementHandlers);
            }

            // print first page header
            if (pageHeader) {
                renderSection.call(this, pageHeader, r, settings.elementHandlers);
            }
            DrillForContent.call(this, element, r, settings.elementHandlers);
            // print last page footer
            if (pageFooter) {
                r.y = r.settings.y_height_pixels 
                    - r.pdf.margins_doc.bottom - pageFooterHeight;
                renderSection.call(this, pageFooter, r, settings.elementHandlers);
            }
            r.pdf.internal.events.publish('htmlRenderingFinished');
            if (pageHeader || pageFooter) {
                if (pageHeader) {
                    $(pageHeader).remove();
                }
                if (pageFooter) {
                    $(pageFooter).remove();
                }
                Object.keys(usedFontKeys).forEach(function(fontKey) {
                    var encoded = r.pdf.encodeText('###jsPDFVarTotalPages###', fontKey);
                    var replacement = r.pdf.encodeText(String(r.pdf.internal.getNumberOfPages()), fontKey);
                    r.pdf.putTotalPages.call(r.pdf, encoded, replacement);
                });
            }
            callback(r.dispose());
        });
        return { x: r.x, y: r.y };
    };
    Renderer.prototype.init = function() {
        this.paragraph = {
            text: [],
            style: []
        };
        return this.pdf.internal.write("q");
    };
    Renderer.prototype.dispose = function() {
        this.pdf.internal.write("Q");
        return {
            x: this.x,
            y: this.y
        };
    };

    //Checks if we have to execute some watcher functions
    //e.g. to end text floating around an image
    Renderer.prototype.executeWatchFunctions = function(el) {
        var ret = false;
        var narray = [];
        if (this.watchFunctions.length > 0) {
            for (var i = 0; i < this.watchFunctions.length; ++i) {
                if (this.watchFunctions[i](el) === true) {
                    ret = true;
                } else {
                    narray.push(this.watchFunctions[i]);
                }
            }
            this.watchFunctions = narray;
        }
        return ret;
    };

    Renderer.prototype.splitFragmentsIntoLines = function(fragments, styles, overrideAvailWidth) {
        var currentLineLength,
            defaultFontSize,
            ff,
            fontMetrics,
            fontMetricsCache,
            fragment,
            fragmentChopped,
            fragmentLength,
            fragmentSpecificMetrics,
            fs,
            k,
            line,
            lines,
            maxLineLength,
            style;
        defaultFontSize = 12;
        k = this.pdf.internal.scaleFactor;
        fontMetricsCache = {};
        ff = void 0;
        fs = void 0;
        fontMetrics = void 0;
        fragment = void 0;
        style = void 0;
        fragmentSpecificMetrics = void 0;
        fragmentLength = void 0;
        fragmentChopped = void 0;
        line = [];
        lines = [line];
        currentLineLength = 0;
        maxLineLength = overrideAvailWidth || this.settings.width;
        while (fragments.length) {
            fragment = fragments.shift();
            style = styles.shift();
            if (fragment) {
                ff = style["font-family"];
                fs = style["font-style"];
                fontMetrics = fontMetricsCache[ff + fs];
                if (!fontMetrics) {
                    fontMetrics = this.pdf.internal.getFont(ff, fs).metadata.Unicode;
                    fontMetricsCache[ff + fs] = fontMetrics;
                }
                if (!fontMetrics) {
                    fontMetrics = this.pdf.internal.getFont('helvetica', 'normal').metadata.Unicode;
                }
                fragmentSpecificMetrics = {
                    widths: fontMetrics.widths,
                    kerning: fontMetrics.kerning,
                    fontSize: style["font-size"] * defaultFontSize,
                    textIndent: currentLineLength
                };
                fragmentLength = this.pdf.getStringUnitWidth(fragment, fragmentSpecificMetrics) * fragmentSpecificMetrics.fontSize / k;
                if (currentLineLength + fragmentLength > maxLineLength) {
                    fragmentChopped = this.pdf.splitTextToSize(fragment, maxLineLength, fragmentSpecificMetrics);
                    line.push([fragmentChopped.shift(), style]);
                    while (fragmentChopped.length) {
                        line = [
                            [fragmentChopped.shift(), style]
                        ];
                        lines.push(line);
                    }
                    currentLineLength = this.pdf.getStringUnitWidth(line[0][0], fragmentSpecificMetrics) * fragmentSpecificMetrics.fontSize / k;
                } else {
                    line.push([fragment, style]);
                    currentLineLength += fragmentLength;
                }
            }
        }

        //if text alignment was set, set margin/indent of each line
        if (style['text-align'] !== undefined && (style['text-align'] === 'center' || style['text-align'] === 'right' || style['text-align'] === 'justify')) {
            for (var i = 0; i < lines.length; ++i) {
                if (lines[i].length === 0) continue;
                var length = this.pdf.getStringUnitWidth(lines[i][0][0], fragmentSpecificMetrics) * fragmentSpecificMetrics.fontSize / k;
                //if there is more than on line we have to clone the style object as all lines hold a reference on this object
                if (i > 0) {
                    lines[i][0][1] = clone(lines[i][0][1]);
                }
                var space = (maxLineLength - length);

                if (style['text-align'] === 'right') {
                    lines[i][0][1]['margin-left'] = space;
                    //if alignment is not right, it has to be center so split the space to the left and the right
                } else if (style['text-align'] === 'center') {
                    lines[i][0][1]['margin-left'] = space / 2;
                    //if justify was set, calculate the word spacing and define in by using the css property
                } else if (style['text-align'] === 'justify') {
                    var countSpaces = lines[i][0][0].split(' ').length - 1;
                    lines[i][0][1]['word-spacing'] = space / countSpaces;
                    //ignore the last line in justify mode
                    if (i === (lines.length - 1)) {
                        lines[i][0][1]['word-spacing'] = 0;
                    }
                }
            }
        }

        return lines;
    };
    // Renderer.prototype.RenderTextFragment = function(text, style) {
    //     var defaultFontSize,
    //         font,
    //         maxLineHeight;

    //     maxLineHeight = 0;
    //     defaultFontSize = 12;

    //     if (this.pdf.internal.pageSize.height - this.pdf.margins_doc.bottom < this.y + this.pdf.internal.getFontSize()) {
    //         this.pdf.internal.write("ET", "Q");
    //         this.pdf.addPage();
    //         this.y = this.pdf.margins_doc.top;
    //         this.pdf.internal.write("q", "BT", this.pdf.internal.getCoordinateString(this.x), this.pdf.internal.getVerticalCoordinateString(this.y), "Td");
    //         //move cursor by one line on new page
    //         maxLineHeight = Math.max(maxLineHeight, style["line-height"], style["font-size"]);
    //         this.pdf.internal.write(0, (-1 * defaultFontSize * maxLineHeight).toFixed(2), "Td");
    //     }

    //     font = this.pdf.internal.getFont(style["font-family"], style["font-style"]);

    //     //set the word spacing for e.g. justify style
    //     if (style['word-spacing'] !== undefined && style['word-spacing'] > 0) {
    //         this.pdf.internal.write(style['word-spacing'].toFixed(2), "Tw");
    //     }

    //     this.pdf.internal.write("/" + font.id, (defaultFontSize * style["font-size"]).toFixed(2), "Tf", "(" + this.pdf.internal.pdfEscape(text) + ") Tj");

    //     //set the word spacing back to neutral => 0
    //     if (style['word-spacing'] !== undefined) {
    //         this.pdf.internal.write(0, "Tw");
    //     }
    // };

    // Renderer.prototype.renderParagraph = function(cb) {
    //     var blockstyle,
    //         defaultFontSize,
    //         fontToUnitRatio,
    //         fragments,
    //         i,
    //         l,
    //         line,
    //         lines,
    //         maxLineHeight,
    //         out,
    //         paragraphspacing_after,
    //         paragraphspacing_before,
    //         priorblockstype,
    //         styles,
    //         fontSize;
    //     fragments = PurgeWhiteSpace(this.paragraph.text);
    //     styles = this.paragraph.style;
    //     blockstyle = this.paragraph.blockstyle;
    //     priorblockstype = this.paragraph.blockstyle || {};
    //     this.paragraph = {
    //         text: [],
    //         style: [],
    //         blockstyle: {},
    //         priorblockstyle: blockstyle
    //     };
    //     if (!fragments.join("").trim()) {
    //         return;
    //     }
    //     lines = this.splitFragmentsIntoLines(fragments, styles);
    //     line = void 0;
    //     maxLineHeight = void 0;
    //     defaultFontSize = 12;
    //     fontToUnitRatio = defaultFontSize / this.pdf.internal.scaleFactor;
    //     paragraphspacing_before = (Math.max((blockstyle["margin-top"] || 0) - (priorblockstype["margin-bottom"] || 0), 0) + (blockstyle["padding-top"] || 0)) * fontToUnitRatio;
    //     paragraphspacing_after = ((blockstyle["margin-bottom"] || 0) + (blockstyle["padding-bottom"] || 0)) * fontToUnitRatio;
    //     out = this.pdf.internal.write;
    //     i = void 0;
    //     l = void 0;
    //     this.y += paragraphspacing_before;
    //     out("q", "BT", this.pdf.internal.getCoordinateString(this.x), this.pdf.internal.getVerticalCoordinateString(this.y), "Td");

    //     //stores the current indent of cursor position
    //     var currentIndent = 0;

    //     while (lines.length) {
    //         line = lines.shift();
    //         maxLineHeight = 0;
    //         i = 0;
    //         l = line.length;
    //         while (i !== l) {
    //             if (line[i][0].trim()) {
    //                 maxLineHeight = Math.max(maxLineHeight, line[i][1]["line-height"], line[i][1]["font-size"]);
    //                 fontSize = line[i][1]["font-size"] * 7;
    //             }
    //             i++;
    //         }
    //         //if we have to move the cursor to adapt the indent
    //         var indentMove = 0;
    //         //if a margin was added (by e.g. a text-alignment), move the cursor
    //         if (line[0][1]["margin-left"] !== undefined && line[0][1]["margin-left"] > 0) {
    //             wantedIndent = this.pdf.internal.getCoordinateString(line[0][1]["margin-left"]);
    //             indentMove = wantedIndent - currentIndent;
    //             currentIndent = wantedIndent;
    //         }
    //         //move the cursor
    //         out(indentMove, (-1 * defaultFontSize * maxLineHeight).toFixed(2), "Td");
    //         i = 0;
    //         l = line.length;
    //         while (i !== l) {
    //             if (line[i][0]) {
    //                 this.RenderTextFragment(line[i][0], line[i][1]);
    //             }
    //             i++;
    //         }
    //         this.y += maxLineHeight * fontToUnitRatio;

    //         //if some watcher function was executed sucessful, so e.g. margin and widths were changed,
    //         //reset line drawing and calculate position and lines again
    //         //e.g. to stop text floating around an image
    //         if (this.executeWatchFunctions(line[0][1]) && lines.length > 0) {
    //             var localFragments = [];
    //             var localStyles = [];
    //             //create fragement array of 
    //             lines.forEach(function(localLine) {
    //                 var i = 0;
    //                 var l = localLine.length;
    //                 while (i !== l) {
    //                     if (localLine[i][0]) {
    //                         localFragments.push(localLine[i][0] + ' ');
    //                         localStyles.push(localLine[i][1]);
    //                     }
    //                     ++i;
    //                 }
    //             });
    //             //split lines again due to possible coordinate changes
    //             lines = this.splitFragmentsIntoLines(PurgeWhiteSpace(localFragments), localStyles);
    //             //reposition the current cursor
    //             out("ET", "Q");
    //             out("q", "BT", this.pdf.internal.getCoordinateString(this.x), this.pdf.internal.getVerticalCoordinateString(this.y), "Td");
    //         }

    //     }
    //     if (cb && typeof cb === "function") {
    //         cb.call(this, this.x - 9, this.y - fontSize / 2);
    //     }
    //     out("ET", "Q");
    //     return this.y += paragraphspacing_after;
    // };
    // Renderer.prototype.setBlockBoundary = function(cb) {
    //     return this.renderParagraph(cb);
    // };
    // Renderer.prototype.setBlockStyle = function(css) {
    //     return this.paragraph.blockstyle = css;
    // };
    // Renderer.prototype.addText = function(text, css) {
    //     this.paragraph.text.push(text);
    //     return this.paragraph.style.push(css);
    // };
    FontNameDB = {
        helvetica: "helvetica",
        "sans-serif": "helvetica",
        "times new roman": "times",
        serif: "times",
        times: "times",
        monospace: "courier",
        courier: "courier"
    };
    FontWeightMap = {
        100: "normal",
        200: "normal",
        300: "normal",
        400: "normal",
        500: "bold",
        600: "bold",
        700: "bold",
        800: "bold",
        900: "bold",
        normal: "normal",
        bold: "bold",
        bolder: "bold",
        lighter: "normal"
    };
    FontStyleMap = {
        normal: "normal",
        italic: "italic",
        oblique: "italic"
    };
    TextAlignMap = {
        left: "left",
        right: "right",
        center: "center",
        justify: "justify"
    };
    FloatMap = {
        none: 'none',
        right: 'right',
        left: 'left'
    };
    ClearMap = {
        none: 'none',
        both: 'both'
    };
    UnitedNumberMap = {
        normal: 1
    };
    /**
     * Converts HTML-formatted text into formatted PDF text.
     *
     * Notes:
     * 2012-07-18
     * Plugin relies on having browser, DOM around. The HTML is pushed into dom and traversed.
     * Plugin relies on jQuery for CSS extraction.
     * Targeting HTML output from Markdown templating, which is a very simple
     * markup - div, span, em, strong, p. No br-based paragraph separation supported explicitly (but still may work.)
     * Images, tables are NOT supported.
     *
     * @public
     * @function
     * @param HTML {String or DOM Element} HTML-formatted text, or pointer to DOM element that is to be rendered into PDF.
     * @param x {Number} starting X coordinate in jsPDF instance's declared units.
     * @param y {Number} starting Y coordinate in jsPDF instance's declared units.
     * @param settings {Object} Additional / optional variables controlling parsing, rendering.
     * @returns {Object} jsPDF instance
     */
    jsPDFAPI.fromHTML = function(HTML, x, y, settings, margins, customFonts, referencedFonts, usedFonts, fontFamilyOverrides, callback) {
        "use strict";

        this.margins_doc = margins || {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
        };
        if (!settings)
            settings = {};
        if (!settings.elementHandlers)
            settings.elementHandlers = {};
        // settings.defaultFontFamily = defaultFontFamily;
        fontOverrides = fontFamilyOverrides || {};
        customFonts.forEach(fontFamily => {
            FontNameDB[fontFamily.toLowerCase()] = fontFamily;
        });
        referencedFonts.forEach(function(font) {
            FontNameDB[font.name.toLowerCase()] = font.name;
        });

        return process.call(this, this, HTML, isNaN(x) ? 4 : x, this.margins_doc.top, settings, callback);
    };
})(jsPDF.API);

};
