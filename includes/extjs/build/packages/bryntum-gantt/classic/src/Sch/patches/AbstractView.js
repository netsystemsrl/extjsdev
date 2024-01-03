Ext.define('Sch.patches.AbstractView', {
    extend: 'Sch.util.Patch',

    target: 'Ext.view.AbstractView',

    minVersion: '6.2.0',

    obsoleteTestName : 'patches/002_abstract_view.t.js',

    overrides: {
        // to keep sanity/016_dom_footprint.t.js green
        setItemsDraggable : function(draggable) {
            var me = this,
                result;

            result = me.callParent([draggable]);

            if (!draggable && me.viewStyleSheet && me.viewStyleSheet.cssRules.length === 0) {
                me.viewStyleSheet.ownerNode.parentNode.removeChild(me.viewStyleSheet.ownerNode);
                me.viewStyleSheet = Ext.view.AbstractView.prototype.viewStyleSheet = null;
            }

            return result;
        }
    }
});
