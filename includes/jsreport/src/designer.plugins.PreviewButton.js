/*
 * jsreports 1.4.129-beta1
 * Copyright (c) 2018 jsreports
 * http://jsreports.com
 */
/*
 * Ditto 1.4.129-beta1
 * Copyright (c) 2018 Ditto
 * http://dittojs.com
 */

import '../lib/featherlight.css';

module.exports = function(ditto, $) {

require('../lib/featherlight.js')($)

/** @namespace ditto.designer.plugins */
ditto.ns('designer.plugins', ditto);

/**
 * @class PreviewButton
 * @memberof ditto.designer.plugins
 * @classdesc Adds a button to the designer toolbar that shows a preview of
 * the current report.
 *
 * @param {Object} options - Configuration object with the following properties
 * @param {Boolean} [options.label] - Text to show in preview button
 *
 * @example
 * var designer = new ditto.Designer({
 *   dataSources: dataSources,
 *   report: reportDef,
 *   plugins: [{
 *     pluginType: 'PreviewButton',
 *     label: 'Click for Preview'
 *   }]
 * });
 */
ditto.designer.plugins.PreviewButton = function(cfg) {
    $.extend(true, this, {
        label: 'Preview',
    }, cfg);
};

$.extend(ditto.designer.plugins.PreviewButton.prototype, (function() {

    return {
    
        /** Bind this plugin to the designer, used to hook into the designer render event */
        bind: function(designer) {
            this.designer = designer;
            $(designer).on('render', this.onDesignerRender.bind(this));
        },

        /** @private */
        onDesignerRender: function() {
            var $nav = this.designer.designer_el.find('.jsr-designer-toolbar');
            var $wrap = $('<span class="jsr-designer-plugin-previewbutton jsr-toolbar-item-right"></span>');
            this.$newButton = $('<button class="jsr-btn jsr-plugin-reportlist-new"></button>')
                .text(this.label);
            this.$newButton.on('click', this.onButtonClick.bind(this));
            $wrap.append(this.$newButton);
            $nav.append($wrap);
        },

        onButtonClick: function() {
            const designer = this.designer;
            const report = designer.getReport();
            if (!this.modalDiv) {
                this.modalDiv = $(`<div class="jsr-designer-preview-content"></div>`);
                $(document.body).append(this.modalDiv);
            }
            this.modalDiv.html('');
            $(this.modalDiv).css({
                width: `${$(window).width() - 150}px`,
                height: `${$(window).height() - 150}px`
            });
            $.featherlight(this.modalDiv, {
                variant: 'jsr-featherlight',
                // Featherlight relies on "this" in its afterOpen callback
                afterOpen: function() {
                    this.$content.html('');
                    const viewer = ditto.render({
                        report_def: report,
                        target: this.$content,
                        datasets: designer.data_sources,
                        customElements: designer.customElements || []
                    });
                }
            });
        }

    };

}()));

};
