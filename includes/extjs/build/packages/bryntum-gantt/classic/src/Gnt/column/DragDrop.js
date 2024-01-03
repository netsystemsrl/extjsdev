/**
 * A column used to allow row reordering when using the SpreadSheet selection model
 *
 * ```javascript
 * var gantt = Ext.create('Gnt.panel.Gantt', {
 *     height      : 600,
 *     width       : 1000,
 *
 *     // Setup your grid columns
 *     columns         : [
 *         ...
 *         { xtype : 'dragdropcolumn' },
 *         ...
 *     ],
 *     ...
 * })
 * ```
 */
Ext.define('Gnt.column.DragDrop', {
    extend : 'Ext.grid.column.Column',

    alias : [
        'widget.dragdropcolumn',
        'widget.ganttcolumn.dragdrop'
    ],

    width : 35,
    tdCls : 'sch-gantt-column-dragdrop',

    cls : 'sch-gantt-column-dragdrop-header',

    ignoreInAddMenu : true,
    ignoreExport    : true,
    ignoreInExport  : true,
    sortable        : false,
    resizable       : false,
    hideable        : false,
    menuDisabled    : true,
    draggable       : false,
    align           : 'center',

    // private override
    processEvent : function (type) {
        return type !== 'click';
    }
});
