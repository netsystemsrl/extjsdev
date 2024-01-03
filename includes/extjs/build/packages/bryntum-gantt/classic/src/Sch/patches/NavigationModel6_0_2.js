// Sencha scrolls cell when clicking in the grid view, unwanted for our timeline view
// https://app.assembla.com/spaces/bryntum/tickets/realtime_list?page=2&ticket=3916
Ext.define('Sch.patches.NavigationModel6_0_2', {
    extend : 'Sch.util.Patch',

    target   : 'Ext.grid.NavigationModel',

    minVersion : '6.0.2',

    applyFn : function () {

        Ext.ClassManager.get(this.target).override({
            focusPosition : function (position) {
                var me = this;

                // PATCH Do not scroll into view cells from timeline view (gantt, scheduler, etc.)
                if (position && position.record && position.column && position.view && position.view._initializeTimelineView)
                {
                    var scroller = position.view.getScrollable();

                    if (scroller && scroller.scrollIntoView) {
                        var old                = scroller.ensureVisible;
                        scroller.ensureVisible = Ext.emptyFn;

                        var retVal             = this.callParent(arguments);
                        scroller.ensureVisible = old;

                        return retVal;
                    }
                }

                return this.callParent(arguments);
            }
        });
    }
});
