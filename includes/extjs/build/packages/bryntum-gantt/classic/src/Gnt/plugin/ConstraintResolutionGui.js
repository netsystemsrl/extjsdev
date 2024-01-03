/**
 * @class   Gnt.plugin.ConstraintResolutionGui
 * @extends Ext.AbstractPlugin
 */
Ext.define("Gnt.plugin.ConstraintResolutionGui", {
    extend   : "Ext.AbstractPlugin",
    alias    : "plugin.constraintresolutiongui",
    requires : ["Gnt.widget.ConstraintResolutionWindow"],

    config : {
        /**
         * @cfg {String} dateFormat
         *
         * Date format to pass to {@link Gnt.widget.ConstraintResolutionWindow}
         */
        dateFormat : null
    },

    cmpDetacher         : null,
    storeDetacher       : null,
    storedResolutions   : null,
    window              : null,

    init : function(cmp) {
        var me = this;

        me.callParent(arguments);

        if (!me.disabled) {
            me.enable();
        }
    },

    destroy : function () {
        // Destroy any active window if Gantt/plugin is destroyed
        this.window && this.window.destroy();

        this.callParent(arguments);
    },

    enable : function() {
        var me = this,
            cmp = me.getCmp();

        me.callParent();

        // This is a GUI class, let's wait for the Gantt view to render first
        if (cmp.rendered) {
            me.attachToTaskStore();
        }
        else {
            me.cmpDetacher = cmp.on('afterrender', function() {
                me.attachToTaskStore();
            }, null, { destroyable : true, single : true });
        }
    },

    disable : function() {
        var me = this,
            cmp = me.getCmp();

        me.callParent();

        if (cmp.rendered) {
            me.detachFromTaskStore();
        }
        else {
            me.cmpDetacher && Ext.destroy(me.cmpDetacher);
            me.cmpDetacher = null;
        }
    },

    attachToTaskStore : function() {
        var me = this,
            cmp, store;

        if (!me.storeDetacher) {
            cmp   = me.getCmp();
            store = cmp.getTaskStore();
            me.storeDetacher = cmp.mon(store, 'constraintconflict', me.onConstraintConflict, me, { destroyable : true });
        }
    },

    detachFromTaskStore : function() {
        var me = this;
        me.storeDetacher && Ext.destroy(me.storeDetacher);
        me.storeDetacher = null;
    },

    onConstraintConflict : function(task, resolutionContext) {
        var me         = this,
            ganttPanel = me.getCmp(),
            lockedView = ganttPanel.lockedGrid.getView(),
            normalView = ganttPanel.normalGrid.getView(),
            depView    = ganttPanel.getDependencyView(),
            detacher, detacherWrapper = {
                destroy : function() {
                    Ext.destroy(detacher);
                }
            };

        // Redrawing the conflicting task row and dependencies
        function redrawTask() {
            lockedView.refreshNode(task);
            normalView.refreshNode(task);
            depView.updateDependencies(task.getAllDependencies()).then(null, Ext.emptyFn);
        }

        redrawTask();

        if (!me.hasStoredResolutionForContext(resolutionContext)) {
            var windowCfg = {
                dateFormat        : me.getDateFormat(),
                resolutionContext : resolutionContext
            };

            // resolution context can override the window title
            if (resolutionContext.windowTitle) {
                windowCfg.title = resolutionContext.windowTitle;
            }

            me.window = new Gnt.widget.ConstraintResolutionWindow(windowCfg);

            detacher = me.window.on({
                'ok'        : Ext.Function.bind(me.onUserActionOk,     me, [resolutionContext, redrawTask, me.window, detacherWrapper], true),
                'cancel'    : Ext.Function.bind(me.onUserActionCancel, me, [resolutionContext, redrawTask, me.window, detacherWrapper], true),
                'close'     : Ext.Function.bind(me.onUserActionClose,  me, [resolutionContext, redrawTask, detacherWrapper],      true),

                destroyable : true
            });

            ganttPanel.completeEdit();

            me.window.show();
        }
        else {
            me.resolveSilently(resolutionContext, redrawTask);
        }
    },

    getStoredResolutions : function() {
        var me = this;

        if (!me.storedResolutions) {
            me.storedResolutions = {};
        }
        return me.storedResolutions;
    },

    getStoredResolutionKeyForContext : function(resolutionContext) {
        // <debug>
        Ext.isObject(resolutionContext) && Ext.isString(resolutionContext.constraintClassName) && Ext.isArray(resolutionContext.resolutions) ||
            Ext.Error.raise("Can't get stored resolution key for context, invalid context is given!");
        // </debug>

        return resolutionContext.constraintClassName + resolutionContext.resolutions.length;
    },

    hasStoredResolutionForContext : function(resolutionContext) {
        var me = this,
            key = me.getStoredResolutionKeyForContext(resolutionContext),
            storedResolutions = me.getStoredResolutions();

        return Ext.isDefined(storedResolutions[key]);
    },

    getStoredResolutionForContext : function(resolutionContext) {
        var me = this,
            key = me.getStoredResolutionKeyForContext(resolutionContext),
            storedResolutions = me.getStoredResolutions();

        // <debug>
        Ext.isDefined(storedResolutions[key]) ||
            Ext.Error.raise("Can't get resolution for context, no resolutions has been stored previously!");
        // </debug>

        return storedResolutions[key];
    },

    storeResolutionForContext : function(resolutionContext, optionIndex) {
        var me = this,
            key = me.getStoredResolutionKeyForContext(resolutionContext),
            storedResolutions = me.storedResolutions;

        me.storedResolutions[key] = optionIndex;
    },

    resolveSilently : function(resolutionContext, redrawTaskFn) {
        var me = this,
            optionIndex = me.getStoredResolutionForContext(resolutionContext);

        // <debug>
        Ext.isObject(resolutionContext) && Ext.isArray(resolutionContext.resolutions) && Ext.isDefined(resolutionContext.resolutions[optionIndex]) ||
            Ext.Error.raise("Can't resolve constraint confict silently, stored resolution is inconsistent to the context given!");
        // </debug>

        resolutionContext.resolutions[optionIndex].resolve();

        // Redrawing the conflicting task again after user has decided what to do
        redrawTaskFn();
    },

    onUserActionOk : function(form, userChoice, eOpts, resolutionContext, redrawTaskFn, wnd, detacher) {
        var me = this;

        // <debug>
        Ext.isObject(userChoice) &&
        Ext.isDefined(userChoice.resolutionOption) &&
        Ext.isDefined(userChoice.dontAsk) ||
            Ext.Error.raise("Can't resolve constraint conflict according to user choice, user choice is invalid!");

        Ext.isObject(resolutionContext) &&
        Ext.isArray(resolutionContext.resolutions) &&
        Ext.isDefined(resolutionContext.resolutions[userChoice.resolutionOption]) ||
            Ext.Error.raise("Can't resolve constraint conflict according to user choice, resolution context is inconsistent to user choice!");
        // </debug>

        Ext.destroy(detacher);
        wnd.close();

        if (userChoice.dontAsk) {
            me.storeResolutionForContext(resolutionContext, userChoice.resolutionOption);
        }

        resolutionContext.resolutions[userChoice.resolutionOption].resolve();

        // Redrawing the conflicting task again after user has decided what to do
        redrawTaskFn();
    },

    onUserActionCancel : function(form, eOpts, resolutionContext, redrawTaskFn, wnd, detacher) {
        var me = this;

        // <debug>
        Ext.isObject(resolutionContext) && Ext.isFunction(resolutionContext.cancelAction) ||
            Ext.Error.raise("Invalid resolution context given!");
        // </debug>

        Ext.destroy(detacher);
        wnd.close();

        resolutionContext.cancelAction();

        // Redrawing the conflicting task again after user has decided what to do
        redrawTaskFn();
    },

    onUserActionClose : function(wnd, eOpts, resolutionContext, redrawTaskFn, detacher) {
        var me = this;

        // <debug>
        resolutionContext && Ext.isFunction(resolutionContext.cancelAction) ||
            Ext.Error.raise("Invalid resolution context given!");
        // </debug>

        Ext.destroy(detacher);

        resolutionContext.cancelAction();

        // Redrawing the conflicting task again after user has decided what to do
        redrawTaskFn();
    }
});
