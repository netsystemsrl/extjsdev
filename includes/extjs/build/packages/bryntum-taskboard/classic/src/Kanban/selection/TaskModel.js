/**
 @class Kanban.selection.TaskModel
 @extends Ext.mixin.Observable

 A composite selection model which relays methods to the various selection models used by the internal data
 views of the task board component.
 */
Ext.define('Kanban.selection.TaskModel', {
    extend : 'Ext.mixin.Observable',

    panel     : null,
    selModels : null,

    constructor : function (config) {
        var me = this;

        Ext.apply(me, config);
        me.callParent(arguments);

        me.selModels = Ext.Array.map(me.panel.views, function (view) {
            return view.getSelectionModel();
        });

        me.forEachView(function (view) {
            me.mon(view, 'containerclick', me.onEmptyAreaClick, me);
            me.relayEvents(view, [ 'select', 'deselect' ]);
            me.relayEvents(view.getSelectionModel(), [ 'selectionchange' ]);
        });
    },

    /**
     * Selects one or more tasks.
     * @param {Kanban.model.Task/Kanban.model.Task[]} tasks An array of tasks
     * @param {Boolean} [keepExisting=false] True to retain existing selections
     * @param {Boolean} [suppressEvent=false] True to not fire a select event
     */
    select : function (tasks, keepExisting, suppressEvent) {
        tasks        = [].concat(tasks);
        var fired    = false;
        var listener = function () {
            fired = true;
        };

        this.forEachSelModel(function (sm) {
            var recordsInView = Ext.Array.filter(tasks, function (rec) {
                return sm.store.indexOf(rec) >= 0;
            });

            sm.on('selectionchange', listener, null, { single : true });

            if (recordsInView.length > 0) {
                sm.select(recordsInView, keepExisting, suppressEvent);
            } else {
                sm.deselectAll();
            }

            sm.un('selectionchange', listener, null, { single : true });
        });

        if (fired) {
            this.fireEvent('selectionchange', this.getSelection());
        }
    },

    /**
     * Deselects a task instance.
     * @param {Kanban.model.Task/Kanban.model.Task} tasks One or more tasks
     * @param {Boolean} [suppressEvent=false] True to not fire a deselect event
     */
    deselect : function (tasks, suppressEvent) {
        tasks = [].concat(tasks);

        this.forEachSelModel(function (sm) {
            var recordsInView = Ext.Array.filter(tasks, function (rec) {
                return sm.store.indexOf(rec) >= 0;
            });

            sm.deselect(recordsInView, suppressEvent);
        });

        this.fireEvent('selectionchange', this.getSelection());
    },

    /**
     * Selects all tasks in the view.
     * @param {Boolean} suppressEvent True to suppress any select events
     */
    selectAll : function () {
        this.relayMethod('selectAll');
    },

    /**
     * Deselects all tasks in the view.
     * @param {Boolean} [suppressEvent] True to suppress any deselect events
     */
    deselectAll : function () {
        this.relayMethod('deselectAll');
    },

    /**
     * Returns an array of the currently selected tasks.
     * @return {Ext.data.Model[]} The selected tasks
     */
    getSelection : function () {
        return this.relayMethod('getSelection');
    },

    /**
     * Returns the count of selected tasks.
     * @return {Number} The number of selected tasks
     */
    getCount : function () {
        return Ext.Array.sum(this.relayMethod('getCount'));
    },

    // BEGIN PRIVATE METHODS
    deselectAllInOtherSelectionModels : function (selModel) {
        this.forEachSelModel(function (sm) {
            sm !== selModel && sm.deselectAll();
        });
    },

    // relays results, flattens results from all calls into one array
    relayMethod : function (method, args) {
        return [].concat.apply([], Ext.Array.map(this.selModels, function (sm) {
            return sm[ method ].apply(sm, args || []);
        }));
    },

    forEachSelModel : function (fn, scope) {
        Ext.Array.each(this.selModels, fn, scope || this);
    },

    onEmptyAreaClick : function () {
        this.deselectAll();
    },

    forEachView : function (fn, scope) {
        Ext.Array.each(this.panel.views, fn, scope || this);
    },

    destroy : function () {

    }
    // EOF PRIVATE METHODS
});