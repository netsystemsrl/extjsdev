// https://www.sencha.com/forum/showthread.php?324999-Locked-grid-hides-normal-grid-header&p=1154992#post1154992
Ext.define('Sch.patches.TimelinePanel', {
    extend     : 'Sch.util.Patch',

    target     : 'Sch.mixin.TimelinePanel',
    minVersion : '6.2.0',

    applyFn : function () {
        Sch.panel.TimelineGridPanel && Sch.panel.TimelineGridPanel.override({
            hideHeaders : false
        });

        Sch.panel.TimelineTreePanel && Sch.panel.TimelineTreePanel.override({
            hideHeaders : false
        });
    }
});