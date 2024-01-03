/**
 * A column representing {@link Gnt.model.Task#Duration Duration} field of a task. The column is editable, however to enable the editing you will need to add a
 * Sch.plugin.TreeCellEditing plugin to your gantt panel. The overall setup will look like this:
 *
 *     var gantt = Ext.create('Gnt.panel.Gantt', {
 *         height      : 600,
 *         width       : 1000,
 *
 *         // Setup your grid columns
 *         columns         : [
 *             ...
 *             {
 *                 xtype       : 'durationcolumn',
 *                 width       : 70
 *             }
 *             ...
 *         ],
 *
 *         plugins             : [
 *             Ext.create('Sch.plugin.TreeCellEditing', {
 *                 clicksToEdit: 1
 *             })
 *         ],
 *         ...
 *     })
 *
 * {@img gantt/images/duration-field.png}
 *
 * This column uses a field - {@link Gnt.field.Duration} which allows the
 * user to specify not only the duration value, but also the duration units.
 *
 * When rendering the name of the duration unit, the {@link Sch.util.Date#getReadableNameOfUnit}
 * method will be used to retrieve the name of the unit.
 */
Ext.define('Gnt.column.Duration', {
    extend                  : 'Ext.grid.column.Column',

    alias                   : [
        'widget.durationcolumn',
        'widget.ganttcolumn.duration'
    ],

    requires                : ['Gnt.field.Duration'],

    mixins                  : ['Gnt.column.mixin.TaskFieldColumn'],

    isDurationColumn        : true,

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:
     *
     * - text : 'Duration'
     */

    /**
     * @cfg {Number} width The width of the column.
     */
    width                   : 80,

    /**
     * @cfg {String} align The alignment of the text in the column.
     */
    align                   : 'left',

    /**
     * @cfg {Number} decimalPrecision A number of digits to show after the dot when rendering the value of the field or when editing it.
     * When set to 0, the duration values containing decimals part (like "6.5 days") will be considered invalid.
     */
    decimalPrecision        : 2,

    /**
     * @cfg {Boolean} useAbbreviation When set to `true`, the column will render the abbreviated duration unit name, not full. Abbreviation will also be used
     * when editing the value. Useful if the column width is limited.
     */
    useAbbreviation         : false,

    instantUpdate           : true,

    fieldProperty           : 'durationField',

    fieldConfigs            : [ 'instantUpdate', 'useAbbreviation', 'decimalPrecision', 'fieldProperty' ],

    editor                  : 'durationfield',

    defaultEditor           : 'durationfield',

    initComponent : function () {
        this.initTaskFieldColumn();

        this.callParent(arguments);
    },

    afterRender : function() {
        this.callParent(arguments);

        this.setSorter(Ext.Function.bind(this.sorterFn, this));
    },

    getValueToRender : function (value, meta, task) {
        if (!Ext.isNumber(value)) return '';

        var unit = this.field.originalDurationUnit || task.getDurationUnit();
        value = task.getDuration(unit);
        return this.field.valueToVisible(value, unit);
    },

    putRawData : function (data, task) {
        task.setDuration(data);
    },

    eraseData : function(task) {
        this.putRawData(null, task);
    },

    sorterFn : function (task1, task2) {
        var ms1 = task1.getCalendar().convertDurationToMs(task1.getDuration(), task1.getDurationUnit()),
            ms2 = task2.getCalendar().convertDurationToMs(task2.getDuration(), task2.getDurationUnit());

        return ms1 === ms2 ? 0 : (ms1 < ms2 ? -1 : 1);
    }
});
