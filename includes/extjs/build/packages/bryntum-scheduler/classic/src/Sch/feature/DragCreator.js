/**
 * @private
 * @class Sch.feature.DragCreator
 * @constructor
 * An internal class which shows a drag proxy while clicking and dragging.
 * Create a new instance of this plugin
 * @param {Object} config The configuration options
 */
Ext.define("Sch.feature.DragCreator", {
    requires : [
        'Ext.XTemplate',
        'Ext.ToolTip',
        'Sch.util.Date',
        'Sch.util.ScrollManager',
        'Sch.util.DragTracker',
        'Sch.tooltip.Tooltip',
        'Sch.tooltip.HoverTip'
    ],

    /**
     * @cfg {Boolean} disabled true to start disabled
     */
    disabled            : false,

    /**
     * @cfg {Boolean} showHoverTip true to show a time tooltip when hovering over the time cells
     */
    showHoverTip        : true,

    /**
     * @cfg {Boolean} showDragTip true to show a time tooltip when dragging to create a new event
     */
    showDragTip         : true,

    /**
     * @cfg {Ext.tip.ToolTip/Object} dragTip
     * The tooltip instance to show while dragging to create a new event or a configuration object for the default instance of
     * {@link Sch.tooltip.ToolTip}
     */
    dragTip             : null,

    /**
     * @cfg {Number} dragTolerance Number of pixels the drag target must be moved before dragging is considered to have started. Defaults to 2.
     */
    dragTolerance       : 2,

    /**
     * @cfg {Ext.tip.ToolTip/Object} hoverTip
     * The tooltip instance to show when mouse pointer is over scheduling area or a configuration object
     */
    hoverTip            : null,

    /**
     * An empty function by default, but provided so that you can perform custom validation on the event being created.
     * Return true if the new event is valid, false to prevent an event being created.
     * @param {Sch.model.Resource} resourceRecord the resource for which the event is being created. Will be null if Scheduler is in `week` mode
     * @param {Date} startDate
     * @param {Date} endDate
     * @return {Boolean} isValid
     */
    validatorFn         : Ext.emptyFn,

    /**
     * @cfg {Object} validatorFnScope
     * The scope for the validatorFn
     */
    validatorFnScope    : null,

    /**
     * @cfg {Object} trackerConfig A custom config object used to create the internal {@link Sch.util.DragTracker} instance
     */
    trackerConfig : null,

    schedulerView : null,

    /**
     * @cfg {Ext.Template/String} template The HTML template shown when dragging to create new items
     */
    template            : '<div class="sch-dragcreator-proxy">' +
                              '<div class="sch-event-inner">&#160;</div>' +
                          '</div>',

    constructor : function (config) {
        Ext.apply(this, config || {});

        this.lastTime = new Date();

        if (!(this.template instanceof Ext.Template)) {
            this.template = new Ext.Template(this.template);
        }

        this.schedulerView.on("destroy", this.onSchedulerDestroy, this);

        if (Ext.supports.Touch) {
            this.schedulerView.on('boxready', this.initDragTracker, this);
        } else {
            this.schedulerView.el.on('mousemove', this.initDragTracker, this, { single : true });
        }

        this.callParent([config]);
    },


    /**
     * Enable/disable the plugin
     * @param {Boolean} disabled True to disable this plugin
     */
    setDisabled : function (disabled) {
        this.disabled = disabled;

        if (this.hoverTip && this.hoverTip.setDisabled) {
            this.hoverTip.setDisabled(disabled);
        }

        if (this.dragTip && this.dragTip.setDisabled) {
            this.dragTip.setDisabled(disabled);
        }
    },

    getProxy          : function () {
        if (!this.proxy) {
            this.proxy = this.template.append(this.schedulerView.getEl(), {}, true);

            this.proxy.hide = function () {
                this.setStyle({
                    left  : 0,
                    right : 0,
                    top   : '-10000px'
                });
            };
        }
        return this.proxy;
    },

    // private
    onBeforeDragStart : function (tracker, e) {
        var s = this.schedulerView,
            t = e.getTarget('.' + s.timeCellCls, 5);

        if (t && this.isCreateAllowed(e) && (!e.event.touches || e.event.touches.length === 1)) {
            var internalResource = s.resolveResource(t),
                resourceRecord = s.isWeekView() ? null : internalResource,
                dateTime = s.getDateFromDomEvent(e);

            if (!this.disabled && t && s.fireEvent('beforedragcreate', s, resourceRecord, dateTime, e) !== false) {

                // Save record if the user ends the drag outside the current row
                this.resourceRecord = resourceRecord;

                // Start time of the event to be created
                this.originalStart = dateTime;

                // Constrain the dragging within the current row schedule area
                this.resourceRegion = s.getScheduleRegion(internalResource, this.originalStart);

                // Save date constraints
                this.dateConstraints = s.getDateConstraints(internalResource, this.originalStart);

                // TODO apply xStep or yStep to drag tracker
                return true;
            }
        }
        return false;
    },

    isCreateAllowed : function (e) {
        return !e.getTarget(this.schedulerView.eventSelector);
    },

    disableHoverTip : function () {
                          // Check to make sure component is created
        this.hoverTip && this.hoverTip.disable && this.hoverTip.disable();
    },

    // private
    onDragStart       : function () {
        var me = this,
            view = me.schedulerView,
            dragRegion = me.tracker.getRegion(),
            proxy = me.getProxy();

        this.dragging = true;

        if (this.hoverTip) {
            // Ext.tip.Tooltip will disable itself on click and reenable after 100ms
            this.hoverTip.on('enable', this.disableHoverTip, this);
            this.hoverTip.disable();
        }

        me.start = me.originalStart;
        me.end = me.start;
        me.originalScroll = view.getScroll();

        if (view.isHorizontal()) {
            me.rowBoundaries = {
                top    : me.resourceRegion.top,
                bottom : me.resourceRegion.bottom
            };

        } else {
            me.rowBoundaries = {
                left  : me.resourceRegion.left,
                right : me.resourceRegion.right
            };

        }

        Ext.apply(dragRegion, me.rowBoundaries);

        if (view.rtl) {
            // proxy.setBox() is going to calculate relative coordinate
            // if not set to auto - coordinates are messed up
            proxy.setStyle({
                right: 'auto'
            });
        }

        proxy.setBox(dragRegion);
        proxy.show();

        view.fireEvent('dragcreatestart', view, proxy);

        if (me.showDragTip) {
            me.dragTip.enable();
            me.dragTip.update(me.start, me.end, true);
            me.dragTip.showForElement(proxy);

            // for some reason Ext set `visibility` to `hidden` after a couple of `.hide()` calls
            me.dragTip.setStyle('visibility', 'visible');
        }

        Sch.util.ScrollManager.activate(view, view.isHorizontal() ? 'horizontal' : 'vertical');
    },

    // private
    onDrag            : function () {
        var me         = this,
            view       = me.schedulerView,
            dragRegion = me.tracker.getRegion(),
            message    = '',
            dates      = view.getTimeZoneStartEndDatesFromRegion(dragRegion, 'round');

        if (!dates) {
            return;
        }

        me.start = dates.start || me.start;
        me.end = dates.end || me.end;

        var dc = me.dateConstraints;

        if (dc) {
            me.end = Sch.util.Date.constrain(me.end, dc.start, dc.end);
            me.start = Sch.util.Date.constrain(me.start, dc.start, dc.end);
        }

        me.valid = this.validatorFn.call(me.validatorFnScope || me, me.resourceRecord, me.start, me.end);

        if (me.valid && typeof me.valid !== 'boolean') {
            message = me.valid.message;
            me.valid = me.valid.valid;
        }

        // If users returns nothing, that's interpreted as valid
        me.valid = (me.valid !== false);

        if (me.showDragTip) {
            me.dragTip.update(me.start, me.end, me.valid, message);
        }

        Ext.apply(dragRegion, me.rowBoundaries);

        var scroll = view.getScroll();
        var proxy = this.getProxy();
        proxy.setBox(dragRegion);

        if (view.isHorizontal()) {
            proxy.setY(me.resourceRegion.top + me.originalScroll.top - scroll.top);
        }

    },

    eventSwallower : function (e) {
        e.stopPropagation();
        e.preventDefault();
    },

    // private
    onDragEnd         : function (tracker, e) {
        var me          = this,
            s           = me.schedulerView,
            doFinalize  = true,
            t           = e.getTarget(),
            el          = Ext.get(t);

        // When dragging, we don't want a regular scheduleclick to fire - swallow the coming "click" event
        el.on('click', this.eventSwallower);

        me.unbindTimer = setTimeout(function () {
            el.un('click', me.eventSwallower);
        }, 100);

        me.dragging = false;

        if (me.showDragTip) {
            me.dragTip.disable();
        }

        if (!me.start || !me.end || (me.end - me.start <= 0)) {
            me.valid = false;
        }

        var createContext = {
            start          : me.start,
            end            : me.end,
            resourceRecord : me.resourceRecord,
            e              : e,
            valid          : me.valid,
            finalize       : function (doCreate) {
                me.finalize(doCreate, createContext);
            }
        };

        if (me.valid) {
            doFinalize = s.fireEvent('beforedragcreatefinalize', s, createContext, e, this.getProxy()) !== false;
        }

        if (doFinalize) {
            me.finalize(me.valid, createContext);
        }

        Sch.util.ScrollManager.deactivate();
    },

    createEvent : function (context) {
        var schedulerView = this.schedulerView,
            eventStore    = schedulerView.getEventStore(),
            newEvent      = Ext.create(eventStore.getModel()),
            resourceCalendar,
            resource;

        // if we deal w/ the Gantt task
        if (newEvent.isTaskModel) {
            // make sure the new model is aware of the task store presence
            newEvent.taskStore = eventStore;

            // if resource has a calendar set it temporarily on the task
            resource         = context.resourceRecord;
            resourceCalendar = resource && resource.getCalendar && resource.getCalendar(true);

            if (resourceCalendar) {
                newEvent.setCalendar(resourceCalendar);
            }
        }

        newEvent.setStartEndDate(context.start, context.end);

        // Remove temporary calendar
        if (resourceCalendar) {
            newEvent.setCalendar(null);
        }

        return newEvent;
    },

    finalize : function (doCreate, context) {
        var schedulerView   = this.schedulerView;

        if (doCreate) {
            schedulerView.fireEvent('dragcreateend', schedulerView, this.createEvent(context), context.resourceRecord, context.e, this.getProxy());
        }

        this.proxy.hide();

        this.schedulerView.fireEvent('afterdragcreate', schedulerView, this.getProxy());

        if (this.hoverTip) {
            this.hoverTip.un('enable', this.disableHoverTip, this);
            this.hoverTip.enable();
        }
    },

    dragging : false,

    // Lazy setup of additional functionality
    initDragTracker : function () {
        var me      = this,
            isTouch = Ext.supports.Touch,
            view    = me.schedulerView;

        var config = Ext.apply({
            el                      : view.el,
            rtl                     : view.rtl,
            tolerance               : me.dragTolerance,
            listeners               : {
                mousedown       : me.verifyLeftButtonPressed,
                beforedragstart : me.onBeforeDragStart,
                dragstart       : me.onDragStart,
                drag            : me.onDrag,
                dragend         : me.onDragEnd,
                scope           : me
            }
        }, this.trackerConfig);

        this.bindRightClickPreventer();

        // Tips should be disabled for things like ipad, otherwise dragcreate suffers
        // But for desktop tips should be enabled
        if (isTouch && !Ext.platformTags.windows) {
            this.showDragTip    = false;
            this.showHoverTip   = false;
            this.dragTip        = null;
            this.hoverTip       = null;
        } else {
            this.setupTooltips();
        }

        me.tracker = new Sch.util.DragTracker(config);
    },

    // Prevent right clicks when drag creating an event
    bindRightClickPreventer : function () {
        this.schedulerView.el.on('contextmenu', this.stopDragCreateOnRightClick, this, { priority : 999 });
    },

    stopDragCreateOnRightClick    : function (e) {
        // https://www.assembla.com/spaces/bryntum/tickets/2113
        // To unify behavior of IE under different OS's (especially for windows 7)
        // we interpret right mouse button down as left mouse button up to stop drag create.
        // NOTE: Cannot be tested in siesta using simulated events
        if (e.button !== 0 && this.dragging) {
            this.tracker.onMouseUp(e);
        }
    },

    setupTooltips : function () {
        var me = this,
            sv = me.schedulerView;

        if (this.showDragTip) {
            var dragTip     = this.dragTip;

            if (dragTip instanceof Ext.tip.ToolTip) {
                dragTip.schedulerView = sv;

                dragTip.on('beforeshow', function () {
                    return me.dragging;
                });
            } else {
                this.dragTip = new Sch.tooltip.Tooltip(Ext.apply({
                    cls             : 'sch-dragcreate-tip',
                    schedulerView   : sv,
                    constrainTo     : sv.up('grid').el,
                    listeners       : {
                        beforeshow      : function () {
                            return me.dragging;
                        }
                    }
                }, dragTip));
            }
        }

        if (me.showHoverTip) {
            var hoverTip     = me.hoverTip;

            if (hoverTip instanceof Ext.tip.ToolTip) {
                hoverTip.schedulerView = sv;
            } else {
                me.hoverTip = Ext.ComponentManager.create(Ext.applyIf({
                    renderTo        : Ext.getBody(),
                    target          : sv.el,
                    schedulerView   : sv
                }, hoverTip), 'scheduler_hovertip');
            }
        }
    },

    verifyLeftButtonPressed : function (dragTracker, e) {
        return e.button === 0;
    },

    onSchedulerDestroy : function () {
        // hoverTip might still be a config object if tip hasn't been instantiated/rendered
        if (this.hoverTip && this.hoverTip.destroy) {
            this.hoverTip.destroy();
        }

        // dragTip might still be a config object if tip hasn't been instantiated/rendered
        if (this.dragTip && this.dragTip.destroy) {
            this.dragTip.destroy();
        }

        if (this.tracker) {
            this.tracker.destroy();
        }

        if (this.proxy) {
            Ext.destroy(this.proxy);
            this.proxy = null;
        }

        clearTimeout(this.unbindTimer);
    }
});
