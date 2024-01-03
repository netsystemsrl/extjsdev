/**
 * A Column displaying the latest possible start date of a task.
 * This value is calculated as the latest start date of the dependent tasks for this task.
 * If a task has no successors then the column value is calculated as the project end date minus the task duration
 * (_project end date_ is the latest end date of all the tasks in the task store).
 *
 * ```javascript
 *     var gantt = Ext.create('Gnt.panel.Gantt', {
 *         height  : 600,
 *         width   : 1000,
 *
 *         columns : [
 *             ...
 *             {
 *                 xtype : 'latestartdatecolumn',
 *                 width : 80
 *             }
 *             ...
 *         ],
 *         ...
 *     });
 * ```
 *
 * **Note**, that this class inherits from Ext.grid.column.Date and supports its configuration options, notably the "format".
 */
Ext.define('Gnt.column.LateStartDate', {
    extend              : 'Ext.grid.column.Date',

    mixins              : ['Gnt.mixin.Localizable'],

    requires            : ['Ext.util.Format'],

    alias               : [
        'widget.latestartdatecolumn',
        'widget.ganttcolumn.latestartdate'
    ],

    isLateStartDateColumn : true,

    /**
     * @cfg {Number} width The width of the column.
     */
    width               : 100,

    /**
     * @cfg {String} align The alignment of the text in the column.
     */
    align               : 'left',

    /**
     * @cfg {Boolean} adjustMilestones
     * If `true`, the start/end dates of the milestones will be adjusted -1 day *during rendering and editing*.
     * The task model will still hold the raw unmodified date.
     *
     * **Note:** No adjustments will be applied if {@link Gnt.panel.Gantt#disableDateAdjustments} is set to `true`.
     */
    adjustMilestones    : true,

    lateStartDateFnOptions : null,

    constructor : function (config) {
        config        = config || {};

        this.text     = config.text || this.L('text');

        this.callParent(arguments);

        this.renderer = config.renderer || this.rendererFunc;
        this.scope    = config.scope || this;

        this.hasCustomRenderer = true;
    },

    afterRender : function() {
        var panel = this.up('ganttpanel');

        // Make top Gantt panel aware of the need for refreshing locked grid after changes in the dependency store
        panel.registerLockedDependencyListeners();

        this.callParent(arguments);
    },

    rendererFunc : function (value, meta, task) {
        var me     = this,
            result = '';

        meta.tdCls = (meta.tdCls || '') + ' sch-column-readonly';

        var store                  = task.getTaskStore(true),
            isUndoingOrRedoing     = store && store.isUndoingOrRedoing();

        // if Undo/Redo operations are in progress it makes no sense to render since anyway ..early/late dates will be reset on completion
        if (!isUndoingOrRedoing) {
            var date = task.getLateStartDate(me.lateStartDateFnOptions);

            if (store && store.disableDateAdjustments) {
                result = Ext.util.Format.date(date, me.format);
            } else {
                result = task.getDisplayStartDate(me.format, me.adjustMilestones, date);
            }
        }

        return result;
    }
});
