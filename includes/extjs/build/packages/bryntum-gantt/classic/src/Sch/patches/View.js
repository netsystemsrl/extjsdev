//http://www.sencha.com/forum/showthread.php?295892-Ext-JS-5.1-Post-GA-Patches&p=1080371&viewfull=1#post1080371
Ext.define('Sch.patches.View', {
    extend : 'Sch.util.Patch',

    target     : 'Ext.view.View',
    minVersion : '5.1.0',

    overrides : {

        handleEvent: function(e) {
            var me = this,
                isKeyEvent = me.keyEventRe.test(e.type),
                nm = me.getNavigationModel();

            e.view = me;

            // 1002_tabbing
            if (isKeyEvent) {
                e.item = e.getTarget(me.itemSelector);
                e.record = nm.getRecord(e.item);
            }

            // If the key event was fired programatically, it will not have triggered the focus
            // so the NavigationModel will not have this information.
            if (!e.item) {
                // In Ext6 editor is moved from outside of grid to cell, so now getTarget
                // will resolve item for event, which will trigger view events. Major implications are
                // selection triggered, editor is collapsed when view dragdrop plugin is active.
                // Here we check if target element lies inside active editor, if so - no item should be
                // resolved for event
                // covered by 1017_duration_editor_place
                var editing = me.editingPlugin && me.editingPlugin.getActiveEditor && me.editingPlugin.getActiveEditor();
                if (!(editing && editing.getEl().contains(e.getTarget()))) {
                    e.item = e.getTarget(me.itemSelector);
                }
            }
            if (e.item && !e.record) {
                e.record = me.getRecord(e.item);
            }

            if (me.processUIEvent(e) !== false) {
                me.processSpecialEvent(e);
            }

            // We need to prevent default action on navigation keys
            // that can cause View element scroll unless the event is from an input field.
            // We MUST prevent browser's default action on SPACE which is to focus the event's target element.
            // Focusing causes the browser to attempt to scroll the element into view.

            if (isKeyEvent && !Ext.fly(e.target).isInputField()) {
                if (e.getKey() === e.SPACE || e.isNavKeyPress(true)) {
                    e.preventDefault();
                }
            }

            e.view = null;
        }
    }
});
