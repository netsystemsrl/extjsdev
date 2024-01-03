// https://www.sencha.com/forum/showthread.php?471919-Task-name-is-changed-when-editor-is-moved-beyond-the-buffered-zone
// https://app.assembla.com/spaces/bryntum/tickets/8920-extjs-copies-value-from-one-cell-editor-to-another/details
Ext.define('Sch.patches.CellEditingPlugin', {
    extend : 'Sch.util.Patch',

    // need to specify here to let `sencha app build` add it to the bundle
    requires : ['Ext.grid.plugin.CellEditing'],

    target : 'Ext.grid.plugin.CellEditing',

    minVersion : '6.7.0',
    maxVersion : '8.0.1',

    overrides : {

        disableBufferedRenderingSupport : true,

        // In 6.7.0 sencha tries to support buffered rendering while editing,
        // so when you scroll out of the active editor and then get back to the same row,
        // the cell editor appears on the screen as if it has never been vanished.
        // The bug appears when you scroll out of the active editor and double click a cell to start a new editing.
        // Then editor plugin restores cached editor with wrong value in it.
        // Attempt to fix the issue and keep the buffered rendering support enabled got failed,
        // because it raised complexity of the override and still had some bugs/side effects.
        // Since this Ext feature is too raw and buggy, we decided to temporary disable the caching
        // and apply `deactivate` method from 6.6.0 to ignore buffered rendering while scrolling.
        deactivate : function () {
            var me = this;

            if (me.disableBufferedRenderingSupport) {
                var context = me.context,
                    editors = me.editors.items,
                    len     = editors.length,
                    editor, i;

                for (i = 0; i < len; i++) {
                    editor = editors[i];
                    // if we are deactivating the editor because it was de-rendered by a bufferedRenderer
                    // cycle (scroll while editing), we should cancel this active editing before caching
                    if (context.view.renderingRows) {
                        if (editor.editing) {
                            me.cancelEdit();
                        }
                        editor.cacheElement();
                    }
                }
            }
            else {
                me.callParent(arguments);
            }
        }
    }
});
