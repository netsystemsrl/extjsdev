Ext.define('Gnt.view.dependency.Painter', {

    extend : 'Sch.view.dependency.Painter',

    alias : 'schdependencypainter.ganttdefault',

    /**
     * Get index to cache for specified task
     * @private
     */
    getIndexForCache: function(primaryView, task) {
        return primaryView.getTaskStore().indexOf(task);
    },

    createLineDef : function (primaryView, dependency, source, target, sourceBox, targetBox, otherBoxes) {
        var DEP_TYPE         = dependency.self.Type,
            me               = this,
            horizontalMargin = me.pathFinder.getHorizontalMargin(),
            ganttRowHeight   = primaryView.getRowHeight(),
            result           = me.callParent([primaryView, dependency, source, target, sourceBox, targetBox, otherBoxes]);

        // Reversing start/end endpoints generate more Gantt-friendly arrows
        var endBox  = result.endBox;
        var endSide = result.endSide;

        result.startArrowSize   = result.endArrowSize;
        result.startArrowMargin = result.endArrowMargin;
        result.endArrowSize     = 0;
        result.endArrowMargin   = 0;

        result.endBox    = result.startBox;
        result.endSide   = result.startSide;
        result.startBox  = endBox;
        result.startSide = endSide;

        result.boxesReversed = true;

        result.startVerticalMargin = Math.floor((ganttRowHeight - (result.startBox.bottom - result.startBox.top))/2) + 1;
        result.endVerticalMargin   = Math.floor((ganttRowHeight - (result.endBox.bottom - result.endBox.top))/2) - 1;

        if (
            // This dependency type
            dependency.getType() == DEP_TYPE.EndToStart &&
            // Target box is below source box
            result.endBox.bottom < result.startBox.top &&
            // Horizontal gap between source box end and target box start is less then 5px
            (result.endBox.end - result.startBox.start < horizontalMargin)
        ) {
            result.startShift = target.isMilestone() ? 0 : (horizontalMargin - (targetBox.end - targetBox.start) / 2);
            result.startVerticalMargin = result.startHorizontalMargin = result.startArrowMargin = result.endArrowMargin = 0;
            result.startSide  = 'top';
        }

        return result;
    }
});
