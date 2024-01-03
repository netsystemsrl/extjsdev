/**
 * The class implements the gantt specific dependency view.
 */
Ext.define('Gnt.view.dependency.View', {

    extend : 'Sch.view.dependency.View',

    alias : 'schdependencyview.basegantt',

    requires : [
        'Gnt.view.dependency.Painter'
    ],

    config : {
        painterConfig : {
            type : 'ganttdefault'
        }
    },

    constructor : function (config) {
        var me = this;

        me.callParent(arguments);

        if (me.painter.getUseDependencyRowIntersectionCache()) {
            if (me.getPrimaryView().taskStore) {
                me.getPrimaryView().mon(me.getPrimaryView().taskStore, {
                    rootchange   : me.resetPainterCache,
                    add          : me.resetPainterCache,
                    remove       : me.resetPainterCache,
                    // Since we mute Store events during collapseAll, we need to listen for this event
                    nodecollapse : me.resetPainterCache,

                    //load        : me.resetPainterCache, // TODO: check if refresh fired with load
                    clear      : me.resetPainterCache,
                    refresh    : me.resetPainterCache,
                    scope      : me
                });
            }
        }

        if (me.getEnableDependencyDragDrop()) {

            me.configureAllowedSourceTerminals();

            if (me.getDependencyStore().allowedDependencyTypes) {
                // Define the allowed targets at drag start time
                me.dragZone.on('dragstart', me.configureAllowedTargetTerminals, me);
            } else {
                // Allow all types
                me.getPrimaryView().el.addCls([ 'sch-terminal-allow-target-start', 'sch-terminal-allow-target-end' ]);
            }

            me.dragZone.on('drop', me.hideTargetTerminals, me);
        }
    },

    // Add classes to hide unallowed terminals
    // TODO: Replace with terminalSides as in scheduler? to not draw unallowed at all?
    configureAllowedSourceTerminals : function () {
        var allowed = this.getDependencyStore().allowedDependencyTypes,
            classes = [ 'sch-terminal-allow-source-start', 'sch-terminal-allow-source-end' ];

        if (allowed) {
            classes = [];

            if (Ext.Array.contains(allowed, 'EndToEnd') || Ext.Array.contains(allowed, 'EndToStart')) {
                classes.push('sch-terminal-allow-source-end');
            }

            if (Ext.Array.contains(allowed, 'StartToStart') || Ext.Array.contains(allowed, 'StartToEnd')) {
                classes.push('sch-terminal-allow-source-start');
            }
        }

        this.dragZone.view.el.addCls(classes);
    },

    configureAllowedTargetTerminals : function () {
        var allowed = this.getDependencyStore().allowedDependencyTypes,
            classes = [],
            el      = this.dragZone.view.el;

        el.removeCls([ 'sch-terminal-allow-target-start', 'sch-terminal-allow-target-end' ]);

        if (Ext.Array.contains(allowed, 'EndToEnd') || Ext.Array.contains(allowed, 'StartToEnd')) {
            classes.push('sch-terminal-allow-target-end');
        }

        if (Ext.Array.contains(allowed, 'StartToStart') || Ext.Array.contains(allowed, 'EndToStart')) {
            classes.push('sch-terminal-allow-target-start');
        }

        el.addCls(classes);
    },

    hideTargetTerminals : function () {
        this.getDependencyStore().allowedDependencyTypes &&
        this.getPrimaryView().el.removeCls([ 'sch-terminal-allow-target-start', 'sch-terminal-allow-target-end' ]);
    },

    // Since there's only one task per row in Gantt panel we need to update dependencies only for the updated task
    // instead of full redraw as for Scheduler
    onPrimaryViewItemUpdate : function (taskRecord, index, eventNode) {
        this.updateDependencies(taskRecord.getAllDependencies()).then(null, Ext.emptyFn);
    }
});
