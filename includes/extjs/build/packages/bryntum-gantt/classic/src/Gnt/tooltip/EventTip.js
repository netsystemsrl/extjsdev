Ext.define('Gnt.tooltip.EventTip', {
    extend  : 'Sch.tooltip.EventTip',

    onTipBeforeShow : function (me) {
        if (!me.triggerElement || !me.triggerElement.id) {
            return false;
        }

        var view = me.getView();

        // All visible modal windows on the page.
        var modalVisibleWindows = Ext.all('window[modal=true]{isVisible()}');

        // First modal window that is not a scheduler and doesn't contain scheduler inside.
        var foundWindow = Ext.Array.findBy(modalVisibleWindows, function (modalWindow) {
            return view !== modalWindow && !view.isDescendantOf(modalWindow);
        });

        // Tooltip should not be shown above task editor or other modal windows
        if (foundWindow) return false;

        var record = view.resolveEventRecord(me.triggerElement);

        if (!record || view.fireEvent('beforetooltipshow', view, record) === false) {
            return false;
        }

        var dataForMe = view.getDataForTooltipTpl(record, me.triggerElement, me.pointerEvent),
            tooltipString;

        if (!dataForMe) return false;

        tooltipString = view.tooltipTpl.apply(dataForMe);

        if (!tooltipString) return false;

        me.update(tooltipString);
    }
});