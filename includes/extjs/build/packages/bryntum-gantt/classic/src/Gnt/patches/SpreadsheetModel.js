// https://www.sencha.com/forum/showthread.php?305782-TreeViewDragDrop-cannot-be-disabled
Ext.define('Gnt.patches.SpreadsheetModel', {
    extend : 'Sch.util.Patch',

    requires : [
        'Gnt.patches.Cells'
    ],

    target : 'Ext.grid.selection.SpreadsheetModel',

    minVersion : '6.0.0',

    applyFn : function () {
        var overrides = {
            privates : {
                // prevent selecting cells in normal view
                onMouseMove : function (e, target, opts) {
                    var me   = this,
                        view = opts.view,
                        schedulingView;

                    if (view.getSchedulingView) {
                        schedulingView = view.getSchedulingView();
                    }
                    else if (view.ownerGrid.getSchedulingView) {
                        schedulingView = view.ownerGrid.getSchedulingView();
                    }

                    // if mouse is moving over scheduling view - do nothing
                    if (schedulingView && schedulingView._cmpCls && Ext.fly(target).up('.' + schedulingView._cmpCls)) {
                        return;
                    }

                    me.callParent(arguments);
                },

                // do not start drag selection on click in dragdrop column
                handleMouseDown : function (view, cellNode, cellIndex, record) {
                    // prevent selection start on click in normal view
                    if (!(view instanceof Gnt.view.Gantt)) {
                        var isRowReorderCell = cellNode.className.indexOf('sch-gantt-column-dragdrop') >= 0;

                        if (isRowReorderCell) {
                            // dragdrop plugin need a selection to work on, also
                            this.selectRows([record], this.isSelected(record));
                        } else {
                            this.callParent(arguments);
                        }
                    }
                }
            }
        };

        Ext.override(Ext.grid.selection.SpreadsheetModel, overrides);
    }
});
