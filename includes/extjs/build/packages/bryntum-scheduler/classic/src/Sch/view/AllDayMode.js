/**
 * @class Sch.view.AllDayMode
 * @private
 *
 * A special view mode class used by All Day header scheduler in week/agenda views
 */
Ext.define('Sch.view.AllDayMode', {
    extend : 'Sch.view.Horizontal',

    // All events in All Day scheduler are assigned to one and only synthetic view so no arguments are needed,
    // all we need to do is to collect all currently visible all day events
    getScheduledEventsForResource : function() {
        var view   = this.view,
            result = [];

        view.getEventStore().each(function (event) {
            if (event.getAllDay() && event.isScheduled() && view.timeAxis.isRangeInAxis(event)) {
                result.push(event);
            }
        });

        return result;
    },

    onEventAdd : function() {
        this.view.refreshView();
    },

    onEventUpdate : function() {
        this.view.refreshView();
    },

    onEventRemove : function() {
        this.view.refreshView();
    }
});
