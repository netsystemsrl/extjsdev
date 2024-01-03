// https://www.sencha.com/forum/showthread.php?305782-TreeViewDragDrop-cannot-be-disabled
Ext.define('Gnt.patches.TreeViewDragDrop', {
    extend : 'Sch.util.Patch',

    target     : 'Ext.tree.plugin.TreeViewDragDrop',
    minVersion : '6.0.0',

    overrides : {
        init: function(view) {
            Ext.applyIf(view, {
                copy: this.copy,
                allowCopy: this.allowCopy
            });

            // Wait for the LockingView to fix up its scrolling insanity, because we need access to its
            // Y scroller if we are to be able to scroll in the Y axis while dragging.
            if (this.containerScroll && view.ownerGrid.lockable) {
                view.ownerGrid.on('scrollersinitialized', this.onLockingScrollersInitialized, this, {single: true});
            } else {
                view.on('render', this.onViewRender, this, {single: true});
            }
        },

        onLockingScrollersInitialized: function(lockingView) {
            // The base will register its client View's element to scroll, but
            // because we know wer are locking, we have to register the Y scrolling element.
            // Save reference to element in order to unregister correctly
            this.cmp._registeredScrollableElement = lockingView.getScrollable().getElement();
            Ext.dd.ScrollManager.register(this.cmp._registeredScrollableElement);

            this.onViewRender(this.cmp);
        },

        destroy : function () {
            this.cmp._registeredScrollableElement && Ext.dd.ScrollManager.unregister(this.cmp._registeredScrollableElement);
            delete this.cmp._registeredScrollableElement;
            this.callParent();
        },

        disable : function () {
            this.callParent(arguments);

            this.dragZone && this.dragZone.lock();
            this.dropZone && this.dropZone.lock();
        },

        enable  : function () {
            this.callParent(arguments);

            this.dragZone && this.dragZone.unlock();
            this.dropZone && this.dropZone.unlock();
        }
    }
});