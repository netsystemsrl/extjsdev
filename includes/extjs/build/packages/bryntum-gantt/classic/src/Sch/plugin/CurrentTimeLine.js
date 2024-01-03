/**
@class Sch.plugin.CurrentTimeLine
@extends Sch.plugin.Lines

Plugin (ptype = 'scheduler_currenttimeline') indicating the current date and time as a line in the schedule.

To add this plugin to scheduler:

    var scheduler = Ext.create('Sch.panel.SchedulerGrid', {
        ...

        resourceStore   : resourceStore,
        eventStore      : eventStore,

        plugins         : [
            Ext.create('Sch.plugin.CurrentTimeLine', { updateInterval : 30000 })
        ]
    });


*/
Ext.define("Sch.plugin.CurrentTimeLine", {
    extend              : "Sch.plugin.Lines",
    alias               : 'plugin.scheduler_currenttimeline',
    mixins              : ['Sch.mixin.Localizable'],

    requires            : [
        'Ext.data.JsonStore'
    ],

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

            - tooltipText : 'Current time'
     */

    /**
     * @cfg {Ext.data.Store} store
     * @hide
     */

    /**
     * @cfg {Number} updateInterval This value (in ms) defines how often the timeline shall be refreshed. Defaults to every once every minute.
     */
    updateInterval      : 60000,

    showHeaderElements  : true,

    /**
     * @cfg {Boolean} autoUpdate true to automatically update the line position over time. Default value is `true`
     */
    autoUpdate          : true,

    expandToFitView     : true,

    timer               : null,

    init                : function(cmp) {
        var me = this;

        // touch scheduler does not support header elements
        if (Ext.getVersion('touch')) me.showHeaderElements = false;

        me.store = new Ext.data.JsonStore({
            autoDestroy : true,
            fields      : ['Date', 'Cls', 'Text'],
            data        : [
                { Date : new Date(), Cls : 'sch-todayLine', Text : me.L('tooltipText') }
            ]
        });

        if (me.autoUpdate) {
            me.timer = setInterval(function () {
                me.updateDate();
            }, me.updateInterval);
        }

        me.updateDate();

        me.callParent(arguments);
    },

    updateDate : function() {
        var me     = this,
            record = me.store.first();

        record.set('Date', new Date());
    },

    destroy : function() {
        var me = this;

        clearInterval(me.timer);
        me.timer = null;

        if (me.store.autoDestroy) {
            me.store.destroy();
        }

        me.callParent(arguments);
    }
});
