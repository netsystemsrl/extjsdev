/**
 * @class Gnt.data.CalendarManager
 * @extends Ext.data.TreeStore
 *
 * Class implements a central storage of all project calendars. Technically it's a collection of {@link Gnt.model.Calendar} records.
 *
 *     var calendarManager = Ext.create('Gnt.data.CalendarManager');
 *
 * # Calendars loading
 *
 * This class is mainly designed to facilitate calendars loading/persisting. You can use both default Ext JS proxies approach:
 *
 *     var calendarManager = Ext.create('Gnt.data.CalendarManager', {
 *         proxy : {
 *             type : 'ajax',
 *             url  : 'calendars.php'
 *         },
 *         listeners : {
 *             load : function () {
 *                 // set project calendar when all calendars get loaded
 *                 taskStore.setCalendar(123);
 *             }
 *         }
 *     });
 *
 * Or the {@link Gnt.data.CrudManager} class to load all project stores by batch:
 *
 *     var calendarManager = Ext.create('Gnt.data.CalendarManager');
 *
 *     var taskStore = Ext.create('Gnt.data.TaskStore', {
 *         // taskStore calendar will automatically be set when calendarManager gets loaded
 *         calendarManager : calendarManager,
 *         resourceStore   : resourceStore,
 *         dependencyStore : dependencyStore,
 *         assignmentStore : assignmentStore
 *     });
 *
 *     var crudManager = Ext.create('Gnt.data.CrudManager', {
 *         taskStore       : taskStore,
 *         transport       : {
 *             load    : {
 *                 url     : 'php/read.php'
 *             },
 *             sync    : {
 *                 url     : 'php/save.php'
 *             }
 *         }
 *     });
 *
 * Each record in the store, except the root node, automatically gets linked to its {@link Gnt.data.Calendar calendar instance}
 * which can be retrieved by {@link #getCalendar} method.
 *
 *     // gets calendar instance having calendar Id equal to 'general'
 *     var calendar = calendarManager.getCalendar('general');
 *
 *     // and here we do the same using {@link Gnt.model.Calendar} {@link Gnt.model.Calendar#getCalendar getCalendar} method.
 *     calendar = calendarManager.getById('general').getCalendar();
 *
 * Please note that root node does not correspond to the project calendar (main calendar of the task store).
 * Any node can be the project calendar. See {@link #setProjectCalendar} for details.
 *
 * # Automatic calendar building
 *
 * When you add a new record to the store a new calendar is automatically gets created:
 *
 *     var calendarManager = Ext.create('Gnt.data.CalendarManager');
 *
 *     // append new record to the calendar manager
 *     var record = calendarManager.getRoot().appendChild({
 *         leaf                : true,
 *         Name                : 'General II',
 *         DaysPerMonth        : 30,
 *         DaysPerWeek         : 7,
 *         HoursPerDay         : 24,
 *         WeekendsAreWorkdays : true,
 *         WeekendFirstDay     : 6,
 *         WeekendSecondDay    : 0,
 *         DefaultAvailability : [ '00:00-24:00' ]
 *     });
 *
 *     // get newly created calendar to calendar2 variable
 *     var calendar2 = record.getCalendar();
 *
 * # Calendar class customization
 *
 * The class that should be used to instantiate a calendar (during loading or manual adding) can be customized by the {@link #calendarClass} config:
 *
 *     var calendarManager = Ext.create('Gnt.data.CalendarManager', {
 *         // by default we will create BusinessTime calendars
 *         calendarClass   : 'Gnt.data.calendar.BusinessTime'
 *     });
 *
 */
Ext.define('Gnt.data.CalendarManager', {

    extend              : 'Ext.data.TreeStore',

    requires            : ['Gnt.data.Calendar'],

    mixins              : [
        'Robo.data.Store',
        'Sch.data.mixin.UniversalModelGetter'
    ],

    model               : 'Gnt.model.Calendar',

    alias               : 'store.calendarmanager',

    storeId             : 'calendars',

    /**
     * @cfg {String} calendarClass
     * The name of a class that will be used to create calendar instances.
     * If {@link Gnt.model.Calendar.calendarClass calendarClass} field is specified on a {@link Gnt.model.Calendar record} then it will be used instead.
     */
    calendarClass       : 'Gnt.data.Calendar',

    /**
     * @cfg {Object} calendarConfig An object to be applied to the newly created instance of the {@link Gnt.widget.calendar.Calendar}.
     */
    calendarConfig      : null,

    projectCalendar     : null,

    myListeners         : null,

    proxy               : 'memory',

    ownedCalendars      : null,

    constructor : function (config) {
        this.ownedCalendars = [];

        this.callParent(arguments);

        this.myListeners = this.on({
            idchanged       : this.onChangeId,
            rootchange      : this.onNewRoot,
            nodeappend      : this.onNewNode,
            nodeinsert      : this.onNewNode,
            noderemove      : this.onRemoveNode,
            load            : this.onNodesLoaded,

            destroyable     : true,
            scope           : this
        });

        var root = this.getRoot();

        if (root) {
            this.bindCalendars(root);
        } else {
            this.setRoot({ expanded : true });
        }

    },


    destroy : function () {
        var me = this;

        me.ownedCalendars = [];

        me.myListeners.destroy();

        // Destroy any registered child calendars
        var root = me.getRoot();

        root && root.cascadeBy(function (node) {
            node.getCalendar() && me.destroyCalendar(node.calendar);
        });

        me.callParent(arguments);
    },


    onChangeId : function (store, node, oldId, newId, oldInternalId) {
        if (!(node instanceof Gnt.model.Calendar)) return;

        var calendar    = this.getCalendar(oldId || oldInternalId);

        calendar.setCalendarId(newId);
    },

    onNewNode : function (parent, node) {
        if (!parent || (parent.getId() !== node.getId())) {
            // create/bind calendar for the new node and for each of its children
            this.bindCalendars(node);

            if (node !== this.getRoot()) {
                this.fixCalendarParent(node);
            }

            var me  = this;

            node.cascadeBy(function (node) { node.setCalendarManager(me); });
        }
    },


    onNewRoot : function (root) {
        this.onNewNode(null, root);

        this.cleanupOwnedCalendars();
    },

    onNodesLoaded : function () {
        // we suppose that nodes are already bound at this point
        // so here we just need to drop orphan Gnt.data.Calendar instances
        this.cleanupOwnedCalendars();
    },

    destroyCalendar : function (calendar) {
        Ext.data.StoreManager.unregister(calendar);
        calendar.destroy();
        Ext.Array.remove(this.ownedCalendars, calendar);
    },

    onRemoveNode : function (parent, node, isMove) {
        if (!isMove) {
            var calendar    = node.calendar;

            if (calendar) {
                this.unbindCalendarEvents(calendar);

                // if we remove the project calendar we need to reset the corresponding property and signal about that
                if (this.getProjectCalendar() == calendar) {
                    this.setProjectCalendar(null);
                }

                // if we're not in the middle of calendar manager loading
                // let's destroy the calendar instance
                if (!this.__loading) {
                    this.destroyCalendar(calendar);
                }


                node.setCalendarManager(null);
            }
        }
    },

    cleanupOwnedCalendars : function () {
        var me = this;

        if (me.ownedCalendars.length) {
            var calendars = me.ownedCalendars.slice(0);

            // loop over the calendars created by the calendar manager
            Ext.Array.each(calendars, function (calendar) {
                // if the calendar is no longer bound to some node -> destroy it
                if (!me.getNodeByCalendar(calendar)) me.destroyCalendar(calendar);
            });
        }
    },

    suspendCalendarsEvents : function (queueSuspended) {
        var root = this.getRoot();
        root && root.cascadeBy(function (node) {
            var c   = node.getCalendar();
            if (c) c.suspendEvents(queueSuspended);
        }, this);
    },


    resumeCalendarsEvents : function () {
        var root = this.getRoot();
        root && root.cascadeBy(function (node) {
            var c   = node.getCalendar();
            if (c) c.resumeEvents();
        }, this);
    },


    getCalendarClass : function () {
        return this.calendarClass;
    },


    /**
     * Returns the project calendar.
     * @return {Gnt.data.Calendar} The project calendar.
     */
    getProjectCalendar : function () {
        return this.projectCalendar;
    },


    /**
     * Sets the project calendar.
     * @param {Gnt.data.Calendar/String} calendar The project calendar or its identifier.
     */
    setProjectCalendar : function (calendar) {
        // to avoid nested calls
        if (this.settingProjectCalendar) return;

        if (typeof calendar !== 'object') {
            calendar    = this.getCalendar(calendar) || Gnt.data.Calendar.getCalendar(calendar);
        }

        // if we assign another calendar
        if (this.getProjectCalendar() !== calendar) {

            this.settingProjectCalendar = true;

            this.projectCalendar    = calendar;

            /**
             * @event projectcalendarset
             * Fires after {@link #setProjectCalendar} completion.
             * @param {Gnt.data.CalendarManager} calendarManager The calendar manager.
             * @param {Gnt.data.Calendar} calendar The calendar that was set as a project calendar.
             */
            this.fireEvent('projectcalendarset', this, calendar);

            this.settingProjectCalendar = false;
        }
    },


    /**
     * Returns the calendar instance by specified identifier.
     * @param {String} calendarId Calendar identified.
     * @return {Gnt.data.Calendar}
     */
    getCalendar : function (calendarId) {
        var record  = this.getModelById(calendarId);

        return record && record.getCalendar();
    },

    /**
     * Returns the node associated with the provided calendar ({@link Gnt.data.Calendar} instance).
     * @param  {Gnt.data.Calendar} calendar Calendar instance.
     * @return {Gnt.model.Calendar}         Associated node.
     */
    getNodeByCalendar : function (calendar) {
        // only root node is supposed to not have a calendar assigned
        if (!calendar) return this.getRoot();

        var result = this.getModelById(calendar.calendarId);

        if (!result) {
            var root = this.getRoot();
            root && root.cascadeBy(function (node) {
                var c   = node.getCalendar();
                if (c === calendar) {
                    result = node;
                    return false;
                }
            }, this);
        }

        return result;
    },


    onParentChange : function (calendar, parent, oldParent) {
        var node    = this.getNodeByCalendar(calendar);

        if (node && !node.syncingCalendarParent) {
            this.fixNodeParent(node);
        }
    },


    bindCalendarEvents : function (calendar) {
        /**
         * @event calendarload
         * Fires after a calendar instance was loaded.
         * @param {Gnt.data.Calendar} calendar Calendar that was loaded.
         * @param {Gnt.model.CalendarDay[]} days An array of records
         * @param {Boolean} successful True if the operation was successful.
         * @param {Object} eOpts The options object passed to Ext.util.Observable.addListener.
         */
        this.relayEvents(calendar, ['load'], 'calendar');
        /**
         * @event dayadd
         * Fired when a {@link Gnt.model.CalendarDay} instance has been added to a calendar.
         * @param {Gnt.data.Calendar} calendar Calendar that got new record.
         * @param {Gnt.model.CalendarDay[]} days The days that were added.
         * @param {Number} index The index at which the instances were inserted
         * @param {Object} eOpts The options object passed to Ext.util.Observable.addListener.
         */
        /**
         * @event dayupdate
         * Fired when a {@link Gnt.model.CalendarDay} instance has been updated.
         * @param {Gnt.data.Calendar} calendar Calendar that holds the modified record.
         * @param {Gnt.model.CalendarDay} day The day record that was added.
         * @param {String} operation The update operation being performed. Value may be one of:
         *
         *  - `Ext.data.Model.EDIT`
         *  - `Ext.data.Model.REJECT`
         *  - `Ext.data.Model.COMMIT`
         * @param {String[]} modifiedFieldNames Array of field names changed during edit.
         * @param {Object} eOpts The options object passed to Ext.util.Observable.addListener.
         */
        /**
         * @event dayremove
         * Fired when a {@link Gnt.model.CalendarDay} instance has been removed from a calendar.
         *
         * **If many days may be removed in one go, then it is more efficient to listen for the {@link #event-daybulkremove} event
         * and perform any processing for a bulk remove than to listen for this {@link #event-dayremove} event.**
         * @param {Gnt.data.Calendar} calendar The calendar object.
         * @param {Gnt.model.CalendarDay} day The day record that was removed.
         * @param {Number} index The index of the day record that was removed.
         */
        /**
         * @event daybulkremove
         * Fired at the *end* of the {@link Gnt.data.Calendar#method-remove remove} method when all days in the passed array have been removed.
         *
         * If many records may be removed in one go, then it is more efficient to listen for this event
         * and perform any processing for a bulk remove than to listen for many {@link #event-dayremove} events.
         * @param {Gnt.data.Calendar} calendar The calendar object.
         * @param {Gnt.model.CalendarDay[]} days The array of days that were removed (In the order they appear in the calendar).
         * @param {Number[]} indexes The indexes of the days that were removed.
         */
        this.relayEvents(calendar, ['add', 'update', 'remove', 'bulkremove'], 'day');
        /**
         * @event calendarchange
         * Fired after calendar data has been changed (like day add, edit, remove).
         * @param {Gnt.data.Calendar} calendar The calendar object.
         */
        this.relayEvents(calendar, ['calendarchange']);

        calendar.on('parentchange', this.onParentChange, this);

        // we listen to relayed versions of events here since they fired before
        // original calendar add/update/remove events and we need our onDayAdd/onDayUpdate/onDayRemove to get executed
        // before gantt CRUD manager notice changes (and it listens to dayadd/dayupdate/dayremove)
        this.on({
            dayadd    : this.onDayAdd,
            dayupdate : this.onDayUpdate,
            dayremove : this.onDayRemove,

            scope     : this
        });
    },


    unbindCalendarEvents : function (calendar) {
        this.un({
            dayadd    : this.onDayAdd,
            dayupdate : this.onDayUpdate,
            dayremove : this.onDayRemove,

            scope     : this
        });

        calendar && calendar.un({
            parentchange : this.onParentChange,

            scope        : this
        });
    },


    onDayAdd : function (store, record) {
        this.getModelById(store.getCalendarId()).dirty = true;
    },


    onDayUpdate : function (store, record) {
        this.getModelById(store.getCalendarId()).dirty = true;
    },


    onDayRemove : function (store, record) {
        this.getModelById(store.getCalendarId()).dirty = true;
    },


    fixCalendarParent : function (node) {
        if (node.syncingCalendarParent) return;

        var parentNodeCalendar  = node.parentNode.getCalendar(),
            nodeCalendar        = node.getCalendar();

        if (parentNodeCalendar !== nodeCalendar.parent) {
            node.syncingCalendarParent = true;
            nodeCalendar.setParent(parentNodeCalendar);
            node.syncingCalendarParent = false;
        }
    },


    fixNodeParent : function (node) {
        var parentNodeCalendar  = node.parentNode.getCalendar(),
            calendarParent      = node.getCalendar().parent;

        // here we put "node" to the proper "parentNode" based on "calendar.parent"
        if (parentNodeCalendar !== calendarParent) {
            var properParentNode    = this.getNodeByCalendar(calendarParent);
            properParentNode && properParentNode.appendChild(node);
        }
    },


    bindCalendar : function (record) {
        if (!record || this.getRoot() === record) return;

        var calendar    = record.getCalendar();
        var days        = record.getDays();
        var id          = record.getId() || record.internalId;
        days            = Ext.isArray(days) && days;

        // if no calendar specified on the record or provided array of days to build new calendar
        if (!calendar || days) {

            if (!calendar) {
                // // let's try to get calendar by record identifier
                // calendar    = this.getCalendar(id);
                // // if this calendar is already bound to calendar manager
                // if (calendar) {
                //     // let's set link to it from the record
                //     record.setCalendar(calendar);
                //     return;
                // }

                // try to find calendar by record Id
                calendar    = Gnt.data.Calendar.getCalendar(id);
            }

            // if we don't have the calendar registered yet
            if (!calendar) {

                // get parent calendar
                var parent          = record.parentNode && record.parentNode.getCalendar();

                var calendarClass   = Ext.ClassManager.get(record.getCalendarClass() || this.calendarClass);

                var calendarConfig  = Ext.applyIf(record.getCalendarConfig(), {
                    data            : days,
                    parent          : parent
                });

                // create calendar instance
                calendar    = Ext.create(calendarClass, Ext.apply(calendarConfig, this.calendarConfig));

                this.ownedCalendars.push(calendar);
            }

            record.setCalendar(calendar);

            this.bindCalendarEvents(calendar);

        // if calendar specified on the record but not registered in the calendar manager
        } else if (!this.getCalendar(calendar.calendarId)) {
            // bind calendar manager listeners to it
            this.bindCalendarEvents(calendar);
        }

        /**
         * @event calendarbound
         * Fires after a calendar instance has been assigned to a record.
         * @param {Gnt.data.CalendarManager} calendarManager Calendar manager instance.
         * @param {Gnt.data.Calendar} calendar Calendar assigned to a record.
         * @param {Gnt.model.Calendar} record Record that was bound to a calendar.
         */
        this.fireEvent('calendarbound', this, calendar, record);
    },


    unbindCalendar : function (record) {
        if (!record || this.getRoot() === record) return;

        var calendar    = record.getCalendar();
        if (!calendar) return;

        this.unbindCalendarEvents(calendar);

        this.fireEvent('calendarunbound', this, calendar, record);
    },


    bindCalendars : function (node) {
        var me  = this;

        if (node) {
            Ext.Array.each([].concat(node), function (node) {
                node.cascadeBy(me.bindCalendar, me);
            });
        }
    },


    unbindCalendars : function (node) {
        var me  = this;

        if (node) {
            Ext.Array.each([].concat(node), function (node) {
                node.cascadeBy(me.unbindCalendar, me);
            });
        }
    }

});
