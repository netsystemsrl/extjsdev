/*
 * jsreports 1.4.79
 * Copyright (c) 2017 jsreports
 * http://jsreports.com
 */
/*
 * jsreports 1.4.79
 * Copyright (c) 2017 jsreports
 * http://jsreports.com
 */

import remodal from 'remodal';
import 'remodal/dist/remodal.css';
import 'remodal/dist/remodal-default-theme.css';

module.exports = function(jsreports, $) {

/** @namespace jsreports.designer.plugins */
jsreports.ns('designer.plugins', jsreports);

/**
 * @class PreviewButton
 * @memberof jsreports.designer.plugins
 * @classdesc Adds a button to the designer toolbar that shows a preview of
 * the current report.
 *
 * @param {Object} options - Configuration object with the following properties
 * @param {Boolean} [options.label] - Text to show in preview button
 *
 * @example
 * var designer = new jsreports.Designer({
 *   dataSources: dataSources,
 *   report: reportDef,
 *   plugins: [{
 *     pluginType: 'PreviewButton',
 *     label: 'Click for Preview'
 *   }]
 * });
 */
jsreports.designer.plugins.PreviewButton = function(cfg) {
    $.extend(true, this, {
        label: 'Preview',
    }, cfg);
};

$.extend(jsreports.designer.plugins.PreviewButton.prototype, (function() {

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
            this.$newButton = $('<button class="btn jsr-plugin-reportlist-new"></button>')
                .text(this.label);
            this.$newButton.on('click', this.onButtonClick.bind(this));
            $wrap.append(this.$newButton);
            $nav.append($wrap);
        },

        onButtonClick: function() {
            const report = this.designer.getReport();
            if (!this.modal) {
                this.modalDiv = $(`
                    <div data-remodal-id="jsr-designer-preview-modal" class="jsr-designer-preview-modal">
                      <button data-remodal-action="close" class="remodal-close"></button>
                      <div class="jsr-designer-preview-content"></div>
                    </div>
                `);
                $(document.body).append(this.modalDiv);
                this.modalContentDiv = this.modalDiv.find('.jsr-designer-preview-content');
                this.modal = $('[data-remodal-id=jsr-designer-preview-modal]').remodal({
                    hashTracking: false
                });
            }
            this.modalContentDiv.html('');
            const popupHeight = $(window).height() - 150;
            $(this.modalContentDiv).css({
                height: `${popupHeight}px`
            });
            this.modal.open();
            const viewer = jsreports.render({
                report_def: report,
                target: $(this.modalContentDiv),
                datasets: this.designer.data_sources
            });
        }

    };

}()));

};
