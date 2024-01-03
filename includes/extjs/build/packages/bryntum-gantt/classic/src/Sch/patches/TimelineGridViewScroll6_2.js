// https://sencha.jira.com/browse/EXTJS-22621
// As of 6.2.0 Sencha does vertical scrolling on the scroller of the top grid panel
// so our view needs to relay this scrolling to the owner top grid until it's fixed by Sencha
Ext.define('Sch.patches.TimelineGridViewScroll6_2', {
    extend     : 'Sch.util.Patch',

    target     : 'Sch.view.TimelineGridView',

    minVersion : '6.2.0',

    overrides : {
        scrollVerticallyTo : function (y, animate) {
            this.up('timelinegrid,timelinetree').getScrollable().scrollTo(null, y, animate);
        },

        getVerticalScroll : function () {
            var scrollable = this.up('timelinegrid,timelinetree').getScrollable();
            if (scrollable.getNormalScroller) {
                if (scrollable.getNormalScroller()) {
                    return scrollable.getPosition().y;
                } else {
                    return 0;
                }
            } else {
                return scrollable.getPosition().y;
            }
        }
    }
});