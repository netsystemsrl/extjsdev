/**
@class Sch.plugin.NonWorkingTime
@extends Sch.plugin.Zones

A simple subclass of the {@link Sch.plugin.Zones} which highlights holidays/weekends on the timeline.
Generally, there's no need to instantiate it manually, it can be activated with the {@link Sch.mixin.TimelinePanel#highlightWeekends} configuration option.

{@img gantt/images/plugin-working-time.png}

Note, that the holidays/weekends will only be shown when the resolution of the time axis is weeks or less.

*/
Ext.define("Sch.plugin.NonWorkingTime", {
    extend : 'Sch.plugin.Zones',
    alias  : 'plugin.scheduler_nonworkingtime',

    alternateClassName : 'Gnt.feature.WorkingTime',

    requires : [
        'Ext.data.Store',
        'Sch.model.Range'
    ],

    expandToFitView : true,

    /**
     * @cfg {Sch.data.Calendar} calendar The calendar to extract the holidays from
     */
    calendar : {
        type : 'calendar'
    },

    timeAxis : null,

    init : function (timelinePanel) {
        this.calendar = this.calendar && Ext.StoreMgr.lookup(this.calendar);

        if (!this.calendar) {
            Ext.Error.raise("Required attribute 'calendar' missed during initialization of 'Sch.plugin.NonWorkingTime'");
        }


        this.store = new Ext.data.Store({
            model       : 'Sch.model.Range',
            autoDestroy : true
        });

        this.timeAxis = timelinePanel.getTimeAxis();

        this.callParent(arguments);

        if (timelinePanel.isWeekView()) {
            timelinePanel.normalGrid.headerCt.on('afterlayout', this.onViewChange, this);
        } else {
            timelinePanel.on('viewchange', this.onViewChange, this);
        }

        this.bindCalendar(this.calendar);
    },

    bindCalendar : function(calendar) {
        var listeners = {
            datachanged     : this.refresh,
            update          : this.refresh,

            scope           : this,
            delay           : 1
        };

        if (this.calendar) {
            this.calendar.un(listeners);
        }

        if (calendar) {
            calendar.on(listeners);
        }

        this.calendar = calendar;

        this.refresh();
    },

    onViewReady : function () {
        this.callParent(arguments);
        if (this.schedulerView.isWeekView()) {
            // unbind extra listeners
            this.onTimelinePanelBeforeModeChange();
            // set listeners to empty object to avoid adding them later
            this.headerListeners = {};
        }
    },

    onViewChange : function () {
        var DATE      = Sch.util.Date;
        var disabled  = DATE.isUnitGreater(this.timeAxis.unit, DATE.WEEK);

        this.setDisabled(disabled);

        if (!disabled) {
            this.refresh();
        }
    },

    setDisabled : function(disabled) {
        var wasDisabled = this.disabled;

        this.callParent(arguments);

        if(wasDisabled && !disabled) {
            this.refresh();
        }
    },

    refresh : function() {
        if (this.store && !this.store.destroyed) {
            this.store.removeAll(true);

            if (this.calendar) {
                this.store.add(this.calendar.getHolidaysRanges(this.timeAxis.getStart(), this.timeAxis.getEnd(), true, this.timeAxis.timeZone));
            }
        }
    },

    destroy : function() {
        this.bindCalendar(null);

        this.callParent(arguments);
    }
});
