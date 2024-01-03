Ext.define('Sch.patches.DragZoneDupIds', {
    extend : 'Sch.util.Patch',

    target     : 'Ext.dd.DragZone',

    minVersion : '6.0.2',

    reportUrl  : 'https://www.sencha.com/forum/showthread.php?338467-DragZone-duplicates-DOM-ids-which-leads-to-error-if-one-Ext-get()s-duplicated-element',

    obsoleteTestName : 'patches/005_dragzone_dup_ids.t.js',

    description : [
        'Drag zone clones dragged element into drag status proxy without substituting cloned element id, thus we might',
        'hit the case when there are two or more elements with the same id in the DOM. If such original element has been',
        'accessed before via Ext.get(), i.e. it is cached in Ext.dom.Element cache, then accessing the similar element',
        'inside drag proxy with Ext.get() will lead to duplicate ids exception thrown from Ext.get()'
    ].join(' '),

    overrides : {
        onInitDrag : function(x, y) {
            var me = this,
                clone = me.dragData.ddel.cloneNode(true);

            // prevent duplicate ids
            clone.id = Ext.id();

            me.proxy.update(clone);
            me.onStartDrag(x, y);
            return true;
        }
    }
});
