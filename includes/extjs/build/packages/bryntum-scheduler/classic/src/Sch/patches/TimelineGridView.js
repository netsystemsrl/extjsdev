// https://www.sencha.com/forum/showthread.php?312033
Ext.define('Sch.patches.TimelineGridView', {
    extend     : 'Sch.util.Patch',

    target     : 'Sch.view.TimelineGridView',

    // In chrome 53 this also became a problem in 6.0.2
    // covered by 012_dragdrop_rtl
    minVersion : '6.0.1',

    overrides : {
        initComponent : function () {
            this.callParent(arguments);

            if (this.rtl) {
                this.headerCt.on('afterlayout', function (header) {
                    header.scrollTo(this.getScrollX());
                }, this);
            }
        }
    }
});