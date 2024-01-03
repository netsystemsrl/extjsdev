/*
This file is part of Grid Plugins

Copyright (c) 2012-2019 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

This version of Grid Plugins is licensed commercially for a limited period for evaluation/test/trial
purposes only. Production use or use beyond the applicable evaluation period is prohibited under this license.

If your trial has expired, please contact the sales department at http://www.mzsolutions.eu.

Version: 1.1.1.64 Build date: 2019-04-03 11:26:22 (665c6ef3ef4245d25983ddb912829d5199961e75)

*/
Ext.define('Ext.overrides.dd.DragSource', {
    override: 'Ext.dd.DragSource',

    // removed the cachedTarget because nodeOut was not triggered on the GroupingPanel DropZone, so the indicators
    // were still visible in the grouping panel when the grid column was dragged back to the grid header
    onDragOut: function(e, id) {
        // var target = this.cachedTarget || Ext.dd.DragDropManager.getDDById(id);
        var target = Ext.dd.DragDropManager.getDDById(id);
        if (this.beforeDragOut(target, e, id) !== false) {
            if (target.isNotifyTarget) {
                target.notifyOut(this, e, this.dragData);
            }
            this.proxy.reset();
            if (this.afterDragOut) {
                /**
                 * An empty function by default, but provided so that you can perform a custom action
                 * after the dragged item is dragged out of the target without dropping.
                 * @param {Ext.dd.DragDrop} target The drop target
                 * @param {Event} e The event object
                 * @param {String} id The id of the dragged element
                 * @method afterDragOut
                 */
                this.afterDragOut(target, e, id);
            }
        }
        this.cachedTarget = null;
    }

});