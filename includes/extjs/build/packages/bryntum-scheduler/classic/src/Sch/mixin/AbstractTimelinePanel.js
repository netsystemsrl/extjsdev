/**

@class Sch.mixin.AbstractTimelinePanel
@private

A base mixin giving the consuming panel "time line" functionality.
This means that the panel will be capable to display a list of "events", along a {@link Sch.data.TimeAxis time axis}.

This class should not be used directly.

*/

Ext.define('Sch.mixin.AbstractTimelinePanel', {
    requires                     : [
        'Sch.data.TimeAxis',
        'Sch.view.model.TimeAxis',
        'Sch.feature.ColumnLines',
        'Sch.preset.Manager'
    ],

    mixins                       : [
        'Sch.mixin.Zoomable'
    ],

    /**
     * @cfg {String} mode An initial mode of the view - can be either `weekview`, `horizontal` or `vertical`.
     * Default value is `horizontal`.
     *
     *
     * Options: ['weekview', 'horizontal', 'vertical']
     */

    /**
     * @cfg {Number} weekStartDay A valid JS day index between 0-6 (0: Sunday, 1: Monday etc.) to be considered the start day of the week.
     * When omitted, the week start day is retrieved from the active locale class.
     */

    /**
     * @cfg {Boolean} snapToIncrement true to snap to resolution increment while interacting with scheduled events.
     */
    snapToIncrement              : false,

    /**
     * @cfg {Boolean} readOnly true to disable editing.
     */
    readOnly                     : false,

    /**
     * @cfg {Boolean} forceFit Set to true to force the time columns to fit to the available horizontal space.
     */
    forceFit                     : false,

    /**
     * @cfg {String} eventResizeHandles Defines which resize handles to use for resizing events. Possible values: 'none', 'start', 'end', 'both'. Defaults to 'both'
     */
    eventResizeHandles           : 'both',

    /**
     * @cfg {Number} rowHeight The row height (used in horizontal mode only)
     */

    /**
     * @cfg {Sch.data.TimeAxis} timeAxis The backing store providing the input date data for the timeline panel.
     */
    timeAxis                     : null,

    /**
     * @cfg {Boolean} autoAdjustTimeAxis The value for the {@link Sch.data.TimeAxis#autoAdjust} config option, which will be used
     * when creating the time axis instance. You can set this option to `false` to make the timeline panel start and end on the exact provided
     * {@link #startDate}/{@link #endDate} w/o adjusting them.
     */
    autoAdjustTimeAxis           : true,

    /**
     * @private
     * @cfg {Sch.view.model.TimeAxis/Object} timeAxisViewModel The backing view model for the visual representation of the time axis.
     * Either a real instance or a simple config object.
     */
    timeAxisViewModel            : null,

    /**
     * @cfg {Object} validatorFnScope
     * The scope used for the different validator functions.
     */

    /**
     * @cfg {Sch.crud.AbstractManager} crudManager The CRUD manager holding all the project stores.
     */
    crudManager                  : null,

    /**
     * @cfg {String/Object} viewPreset
     * A string key used to lookup a predefined {@link Sch.preset.ViewPreset} (e.g. 'weekAndDay', 'hourAndDay'),
     * managed by {@link Sch.preset.Manager}. See {@link Sch.preset.Manager} for more information.
     * Or a config object for a viewPreset.
     *
     * Options: ['secondAndMinute', 'minuteAndHour', 'hourAndDay', 'dayAndWeek', 'weekAndDay', 'weekAndMonth',
     * 'monthAndYear', 'year', 'manyYears', 'weekAndDayLetter', 'weekDateAndMonth', 'day', 'week']
     *
     * If passed as a config object, the settings from the viewPreset with the provided 'name' property will be used along
     * with any overridden values in your object.
     *
     * To override:

    viewPreset       : {
        name                : 'hourAndDay',
        headerConfig        : {
            middle          : {
                unit       : "HOUR",
                increment  : 12,
                renderer   : function(startDate, endDate, headerConfig, cellIdx) {
                    return "";
                }
            }
        }
    }

     * or set a new valid preset config if the preset is not registered in the {@link Sch.preset.Manager}.
     *
     * When you use scheduler in weekview mode, this config is used to pick view preset. If passed view preset is not
     * supported by weekview (only 2 supported by default - 'day' and 'week') default preset will be used - 'week'.
     */
    viewPreset                   : 'weekAndDay',

    /**
     * @cfg {Boolean} trackHeaderOver `true` to highlight each header cell when the mouse is moved over it.
     */
    trackHeaderOver              : true,

    /**
     * @cfg {Date} startDate The start date of the timeline. If omitted, and a TimeAxis has been set, the start date of the provided {@link Sch.data.TimeAxis} will be used.
     * If no TimeAxis has been configured, it'll use the start/end dates of the loaded event dataset. If no date information exists in the event data
     * set, it defaults to the current date and time.
     */
    startDate                    : null,

    /**
     * @cfg {Date} endDate The end date of the timeline. If omitted, it will be calculated based on the {@link #startDate} setting and
     * the 'defaultSpan' property of the current {@link #viewPreset}.
     */
    endDate                      : null,

    /**
     * @cfg {Number} startTime Start time for weekview mode, used only with day/week presets.
     */
    startTime                    : 0,

    /**
     * @cfg {Number} endTime End time for weekview mode, used only with day/week presets.
     */
    endTime                      : 24,

    /**
     * @cfg {Number} timeZone Shows timeline for a specified timezone, where timezone is a difference in **minutes**
     * between UTC and the configured time zone. Examples:
     *
     * ```
     * 120  : +2 hours from UTC
     * 0    : UTC
     * -180 : -3 hours from UTC
     * ```
     *
     * Default value `null` means current system timezone is used.
     *
     * This setting will update the timeline header and tooltips will show dates in the specified timezone.
     * Events data remain intact.
     *
     * For instance, if you are in UTC+04:00 and you want to render UTC+0 timeline
     * with event starting on 00:00 you should set start date correctly:
     *
     * 1. In local timezone: `new Date(2020, 8, 1, 4)` // matches 00:00 in UTC+0
     * 2. Using Date API: `new Date("2020-09-01T00:00Z")` // same time
     *
     *
     * **NOTE**: DST transitions are not supported, this config only specifies time zone offset from UTC. If value is
     * 0, UTC time zone is used. UTC time zone has no DST.
     */
    timeZone                     : null,

    columnLines                  : true,

    /**
     * Returns dates that will constrain resize and drag operations. The method will be called with the Resource, and
     * for operations on existing events - the event. For drag create operation, the mousedown date will be passed as the second parameter
     * @return {Object} Constaining object
     * @return {Date} return.start Start date
     * @return {Date} return.end End date
     */
    getDateConstraints           : Ext.emptyFn,

    /**
     * @cfg {Boolean} snapRelativeToEventStartDate Affects drag drop and resizing of events when {@link #snapToIncrement} is enabled. If set to `true`, dates will be snapped relative to event start.
     * e.g. for a zoom level with timeResolution = { unit: "s", increment: "20" }, an event that starts at 10:00:03 and is dragged would snap its start date to 10:00:23, 10:00:43 etc.
     * When set to `false`, dates will be snapped relative to the timeAxis startDate (tick start) - 10:00:03, 10:00:20, 10:00:40 etc.
     */
    snapRelativeToEventStartDate : false,

    trackMouseOver               : false,

    // If user supplied a 'rowHeight' config or a panel subclass with such a value - skip reading this setting
    // from the viewpreset
    readRowHeightFromPreset      : true,

    /**
     * @cfg {Number} eventBorderWidth
     * The width of the border of your event, needed to calculate the correct start/end positions
     */
    eventBorderWidth             : 1,

    cachedCenterDate             : null,

    /**
     * @event beforeviewchange
     * @preventable
     * Fires before the current view changes to a new view type or a new time span. Return false to abort this action.
     * @param {Sch.mixin.TimelinePanel} timelinePanel The timeline panel instance
     * @param {Sch.preset.ViewPreset} preset The new preset
     */

    /**
     * @event viewchange
     * Fires after current view preset or time span has changed
     * @param {Sch.mixin.TimelinePanel} timelinePanel The timeline panel instance
     */

    cellBorderWidth              : 1,

    // ---row---------------------
    // |  cellTopBorderWidth       // 0
    // |    | barMargin            // 0
    // |    | eventBorderWidth     // 1
    // |    |   | event |          // rowHeight - 2 * barMargin - eventBorderWidth
    // |    | barMargin            // These lines equal to 1 rowHeight value
    // |        | barMargin
    // |        | eventBorderWidth
    // |        |   | event |
    // |        | barMargin
    // |    cellBottomBorderWidth  // 0
    // ---EOF row
    cellTopBorderWidth           : 0,
    cellBottomBorderWidth        : 0,

    renderers                    : null,

    /**
    * Returns the mode of this panel, 'horizontal', 'vertical' or 'weekview'
    * @return {String}
    */
    getMode: function () {
        return this.mode;
    },

    isHorizontal : function () {
        return this.getMode() === 'horizontal';
    },

    isVertical : function () {
        return this.getMode() === 'vertical';
    },

    isWeekView : function () {
        return this.getMode() === 'weekview';
    },

    // Must be called during initialization by consuming class
    _initializeTimelinePanel : function() {
        // this is an entry point to this mixin, so we should wrap 'mode' here
        if (this.mode) {
            // Calendar was renamed to weekview, silently fallback to 'weekview' if user passes 'calendar' as a mode
            // #3345
            if (this.mode === 'calendar') {
                this.mode = 'weekview';
            }
        } else {
            this.mode = 'horizontal';
        }

        this.applyViewPreset(this.viewPreset);

        if (this.isWeekView()) {
            // Split unit is a sign that passed view preset can be used for weekview mode, if passed preset cannot
            // be used - we fall back to default 'week' #3345
            if (!this.viewPreset.headerConfig.middle.splitUnit) {
                this._oldViewPresetArgs  = [this.viewPreset];
                this.viewPreset     = this.calendarViewPreset || 'week';
            }
        }

        this.initializeZooming();

        this.on('viewchange', this.clearCenterDateCache, this);
        this.on('viewready', this.setupClearCenterDateCache, this);

        this.renderers                  = [];

        // Setting a rowHeight config on the panel should override any rowHeight value in the view presets
        if (this.readRowHeightFromPreset) {
            this.readRowHeightFromPreset    = !this.rowHeight;
        }

        if (!(this.timeAxis instanceof Sch.data.TimeAxis)) {
            this.timeAxis = Ext.create(Ext.applyIf(this.timeAxis || {}, {
                xclass      : 'Sch.data.TimeAxis',
                autoAdjust  : this.autoAdjustTimeAxis,
                mode        : this.isWeekView() ? 'week' : 'plain'
            }));
        }

        if (!(this.timeAxisViewModel instanceof Sch.view.model.TimeAxis)) {
            this.timeAxisViewModel = Ext.create(Ext.applyIf(this.timeAxisViewModel || {}, {
                xclass          : 'Sch.view.model.TimeAxis',
                mode            : this.mode,
                snapToIncrement : this.snapToIncrement,
                forceFit        : this.forceFit,
                timeAxis        : this.timeAxis,
                eventStore      : this.getEventStore(),
                viewPreset      : this.viewPreset
            }));
        }

        if (this.rowHeight) {
            this.setRowHeight(this.rowHeight, true);
            this.rowHeight = null;
        }

        this.timeAxisViewModel.on('update', this.onTimeAxisViewModelUpdate, this);

        this.timeAxisViewModel.refCount++;

        this.on('destroy', this.onPanelDestroyed, this);

        var orientationClasses;

        if (this.isHorizontal()) {
            orientationClasses = ['sch-horizontal'];
        } else if (this.isVertical()) {
            orientationClasses = ['sch-vertical', 'sch-vertical-resource'];
        } else if (this.isWeekView()) {
            orientationClasses = ['sch-vertical', 'sch-calendar'];
        }

        this.addCls([].concat.apply(['sch-timelinepanel'], orientationClasses));
    },

    // private
    // applies preset config on the manager, only used at initialization time
    applyViewPreset : function (preset) {
        var viewPreset;

        if (Ext.isString(preset)) {
            viewPreset = Sch.preset.Manager.getPreset(preset);

            if (!viewPreset) {
                throw 'You must define a valid view preset object. See Sch.preset.Manager class for reference';
            }
        }
        else if (Ext.isObject(preset)) {
            var registeredPreset = preset.name && Sch.preset.Manager.getPreset(preset.name);

            if (registeredPreset) {
                viewPreset = new Sch.preset.ViewPreset(Ext.applyIf(preset, registeredPreset));
            } else {
                var name = preset.name || ('preset' + Sch.preset.Manager.getCount());

                Sch.preset.Manager.registerPreset(name, preset);

                viewPreset = Sch.preset.Manager.getPreset(name);
            }
        }

        this.viewPreset = viewPreset;
    },

    onTimeAxisViewModelUpdate : function() {
        var view = this.getSchedulingView();

        if (view && view.viewReady) {
            view.refreshKeepingScroll();
        }

        this.fireEvent('viewchange', this);
    },

    onPanelDestroyed : function() {
        var timeAxisViewModel   = this.timeAxisViewModel;

        timeAxisViewModel.un('update', this.onTimeAxisViewModelUpdate, this);
        timeAxisViewModel.refCount--;

        if (timeAxisViewModel.refCount <= 0) {
            timeAxisViewModel.destroy();
        }
    },

    /**
     * @abstract
     *
     * @return {Sch.mixin.AbstractSchedulerView} A view consuming the {@link Sch.mixin.AbstractSchedulerView} mixin
     */
    getSchedulingView: function () {
        throw 'Abstract method call';
    },

    /**
     * The {@link #readOnly} accessor. Use it to switch the `readonly` state.
     */
    setReadOnly: function (readOnly) {
        var me = this;

        me.getSchedulingView().setReadOnly(readOnly);

        if (me.allDayNormalHeader) {
            me.allDayNormalHeader.setReadOnly(readOnly);
        }
    },

    /**
    * Returns true if the panel is currently read only.
    * @return {Boolean} readOnly
    */
    isReadOnly: function () {
        return this.getSchedulingView().isReadOnly();
    },

    setupClearCenterDateCache : function () {
        this.mon(this.getSchedulingView().getScrollable(), 'scroll', this.clearCenterDateCache, this);
    },

    // When switching to a preset we try to stay on the same central date.
    // The date is cleared after any user scroll operation
    /** @ignore */
    getViewportCenterDateCached : function () {
        if (this.cachedCenterDate) return this.cachedCenterDate;

        return this.cachedCenterDate = this.getViewportCenterDate();
    },

    clearCenterDateCache : function (scrollable, left, top) {
        var isHorizontal = this.isHorizontal(),
            activeScroll = this.viewPresetActiveScroll;

        var scrollToIgnore = activeScroll && (isHorizontal ? left === activeScroll.left : top == activeScroll.top);

        if (!scrollToIgnore) {
            this.cachedCenterDate = null;
            this.viewPresetActiveScroll = null;
        }
    },

    /**
     * Alias for {@link setViewPreset}
     */
    switchViewPreset: function () {
        this.setViewPreset.apply(this, arguments);
    },

    /**
     * Sets the current view preset. See the {@link Sch.preset.Manager} class for details.
     * Calling it will first fire a {@link Sch.panel.SchedulerGrid#beforeviewchange SchedulerGrid} /
     * {@link Sch.panel.SchedulerTree#beforeviewchange SchedulerTree} beforeviewchange event,
     * followed by a {@link Sch.panel.SchedulerGrid#viewchange SchedulerGrid} /
     * {@link Sch.panel.SchedulerTree#viewchange SchedulerTree} viewchange event.
     * Returning `false` from any 'beforeviewchange' listener will cancel the operation.
     *
     * @param {String} preset The id of the new preset (see {@link Sch.preset.Manager} for details)
     * @param {Date} [startDate] A new start date for the time axis
     * @param {Date} [endDate] A new end date for the time axis
     */
    setViewPreset : function(preset, startDate, endDate, initial, options) {
        options = options || {};

        var centerDate  = options.centerDate,
            timeAxis    = this.timeAxis,
            view        = this.getSchedulingView();

        // normalize preset
        if (typeof preset === 'string') {
            preset = Sch.preset.Manager.getPreset(preset);
        }

        if (!preset) {
            throw new Error('View preset not found');
        }

        if (this.fireEvent('beforeviewchange', this, preset, startDate, endDate) !== false) {

            this.viewPreset = preset.name;

            var isHorizontal = this.isHorizontal(),
                isVertical   = this.isVertical();

            view.setDisplayDateFormat(preset.displayDateFormat);

            // Timeaxis may already be configured (in case of sharing with the timeline partner), no need to reconfigure it
            if (!(initial && timeAxis.isConfigured)) {

                var timeAxisCfg     = {
                    // we use either provided "weekStartDay" value or the localized value
                    weekStartDay    : this.weekStartDay !== undefined ? this.weekStartDay : (this.L ? this.L('weekStartDay') : 1),
                    startTime       : this.startTime,
                    endTime         : this.endTime,
                    timeZone        : this.timeZone
                };

                if (initial || !this.rendered) {
                    if (timeAxis.getCount() === 0 || startDate) {
                        timeAxisCfg.start = startDate || new Date();
                        timeAxisCfg.end   = endDate;
                    }
                } else {
                    // if startDate is provided we use it and the provided endDate
                    if (startDate) {
                        timeAxisCfg.start = startDate;
                        timeAxisCfg.end   = endDate;

                        // if both dates are provided we can calculate centerDate for the viewport
                        if (!centerDate && endDate) {
                            if (this.infiniteScroll && view.cachedScrollDate && view.cachedScrollDateIsCentered) {
                                centerDate = view.cachedScrollDate;
                            } else {
                                centerDate = new Date((startDate.getTime() + endDate.getTime())/2);
                            }
                        }

                    // when no start/end dates are provided we use the current timespan
                    } else {
                        timeAxisCfg.start = timeAxis.getStart();
                        timeAxisCfg.end   = endDate || timeAxis.getEnd();

                        if (!centerDate) {
                            if (this.infiniteScroll && view.cachedScrollDate && view.cachedScrollDateIsCentered) {
                                centerDate = view.cachedScrollDate;
                            } else {
                                centerDate = this.getViewportCenterDateCached();
                            }
                        }
                    }
                }

                timeAxis.consumeViewPreset(preset);

                timeAxis.reconfigure(timeAxisCfg, true);

                this.timeAxisViewModel.reconfigure({
                    // update preset name in viewmodel to simplify zooming sync for partner panels
                    viewPreset          : this.viewPreset,
                    headerConfig        : preset.headerConfig,
                    columnLinesFor      : preset.columnLinesFor || 'middle',
                    rowHeightHorizontal : this.readRowHeightFromPreset ? preset.rowHeight : this.timeAxisViewModel.getViewRowHeight(),
                    tickWidth           : isHorizontal ? preset.timeColumnWidth : preset.timeRowHeight || preset.timeColumnWidth || 60,
                    timeColumnWidth     : preset.timeColumnWidth,

                    // timeColumnWidth is also used for row height in vertical mode
                    rowHeightVertical   : preset.timeRowHeight || preset.timeColumnWidth || 60,
                    timeAxisColumnWidth : preset.timeAxisColumnWidth,
                    resourceColumnWidth : this.resourceColumnWidth || preset.resourceColumnWidth || 100
                });
            }

            if (isVertical) {
                view.setColumnWidth(this.resourceColumnWidth || preset.resourceColumnWidth || 100, true);
            }

            var viewEl = view.getOuterEl();

            // if view is rendered and scroll is not disabled by "notScroll" option
            if (!options.notScroll && viewEl && this.getView().el) {
                // and we have centerDate to scroll to
                if (centerDate) {
                    // remember the central date we scroll to (it gets reset after user scroll)
                    this.cachedCenterDate = centerDate;

                    var x = null, y = null;

                    if (isVertical) {
                        y = Math.max(Math.floor(view.getCoordinateFromDate(centerDate, true) - view.getViewContainerHeight() / 2), 0);
                        this.viewPresetActiveScroll = { top : y };
                        view.scrollVerticallyTo(y);
                    } else {
                        x = Math.max(Math.floor(view.getCoordinateFromDate(centerDate, true) - viewEl.getWidth() / 2), 0);
                        this.viewPresetActiveScroll = { left : x };

                        if (Ext.getVersion().isGreaterThan('6.2.0')) {
                            // In 6.2.1 there's one more partner: scrollbar. Also on afterlayout ext will restore previous
                            // scroll position. That will trigger async method, that will create race condition between us
                            // setting scroll and scrollers, synchronizing position. Normal scrollbar seems to be one
                            // responsible for setting incorrect position. We cannot rely on suspend/resume partner sync,
                            // because it's one more race condition.
                            var normalScroller = view.up('timelinegrid,timelinetree').normalScrollbarScroller;
                            normalScroller && normalScroller.scrollTo(x);
                        }

                        // Sync header scroll and view scroll to make sure the view of the center date is not corrupted
                        view.headerCt.scrollTo(x);
                        view.scrollTo(x);
                    }

                // if we don't have a central date to scroll at we reset scroll (this is bw compatible behavior)
                } else {
                    if (isHorizontal) {
                        view.scrollHorizontallyTo(0);
                    } else {
                        view.scrollVerticallyTo(0);
                    }
                }
            }
        }
    },

    /**
     * Method to get the current view preset of the timeline panel.
     * @return {String} The name of the currently active view preset
     */
    getViewPreset : function() {
        return this.viewPreset;
    },

    /**
     * @inheritdoc #getStartDate
     * @localdoc Alias for {@link #getStartDate} method.
     */
    getStart: function () {
        return this.getStartDate();
    },

    /**
     * Method to get the current start date of the scheduler
     * @return {Date} The start date
     */
    getStartDate: function () {
        return this.timeAxis.getStart();
    },


    /**
     * @inheritdoc #getEndDate
     * @localdoc Alias for {@link #getEndDate} method.
     */
    getEnd: function () {
        return this.getEndDate();
    },

    /**
     * Method to get the current end date of the scheduler
     * @return {Date} The end date
     */
    getEndDate: function () {
        return this.timeAxis.getEnd();
    },

    /**
     * Updates the widths of all the time columns to the supplied value. Only applicable when {@link #forceFit} is set to false.
     * @param {Number} width The new time column width
     */
    setTimeColumnWidth: function (width, preventRefresh) {
        this.timeAxisViewModel.setTickWidth(width, preventRefresh);
    },

    /**
     * @return {Number} width The time column width
     */
    getTimeColumnWidth: function () {
        return this.timeAxisViewModel.getTickWidth();
    },

    getRowHeight: function () {
        return this.timeAxisViewModel.getViewRowHeight();
    },

    /**
    * Moves the time axis forward in time in units specified by the view preset 'shiftUnit', and by the amount specified by the parameter or by the shiftIncrement config of the current view preset.
    * @param {Number} amount (optional) The number of units to jump forward
    */
    shiftNext: function (amount) {
        this.suspendLayouts && this.suspendLayouts();

        this.timeAxis.shiftNext(amount);

        this.suspendLayouts && this.resumeLayouts(true);
    },

    /**
    * Moves the time axis backward in time in units specified by the view preset 'shiftUnit', and by the amount specified by the parameter or by the shiftIncrement config of the current view preset.
    * @param {Number} amount (optional) The number of units to jump backward
    */
    shiftPrevious: function (amount) {
        this.suspendLayouts && this.suspendLayouts();

        this.timeAxis.shiftPrevious(amount);

        this.suspendLayouts && this.resumeLayouts(true);
    },

    /**
    * Convenience method to go to current date.
    */
    goToNow: function () {
        this.setTimeSpan(new Date());
    },

    getTimezone : function () {
        return this.timeAxis.timeZone;
    },

    /**
     * Changes timezone of the time axis.
     * @param {Number} timeZone New timezone offset in minutes. E.g. for UTC+2 pass 120, for UTC-3 pass -180
     */
    setTimeZone : function (timeZone) {
        this.timeZone = timeZone;
        this.setTimeSpan(this.getStart(), this.getEnd(), timeZone);
    },

    /**
     * Changes the time axis timespan to the supplied start and end dates.
     * @param {Date} start The new start date
     * @param {Date} end (Optional) The new end date. If not supplied, the {@link Sch.preset.ViewPreset#defaultSpan} property of the current view preset will be used to calculate the new end date.
     * @param {Number} timeZone (Optional) New timezone
     */
    setTimeSpan: function (start, end, timeZone) {
        if (this.timeAxis) {
            this.timeAxis.setTimeSpan(start, end, timeZone);
        }
    },

    /**
     * @inheritdoc #setStartDate
     * @localdoc Alias for {@link #setStartDate} method.
     */
    setStart: function (date) {
        this.setStartDate(date);
    },

    /**
     * @inheritdoc #setEndDate
     * @localdoc Alias for {@link #setEndDate} method.
     */
    setEnd: function (date) {
        this.setEndDate(date);
    },

    /**
     * Changes the time axis start date to the supplied date.
     * @param {Date} date The new start date
     */
    setStartDate: function (date) {
        this.setTimeSpan(date);
    },

    /**
     * Changes the time end start date to the supplied date.
     *
     * **Note**: passed date should be greater than current time axis start date.
     * @param {Date} date The new end date
     */
    setEndDate: function (date) {
        this.setTimeSpan(null, date);
    },

    /**
    * Returns the {@link Sch.data.TimeAxis} instance in use.
    * @return {Sch.data.TimeAxis}
    */
    getTimeAxis: function () {
        return this.timeAxis;
    },


    /**
    * Scrolls the time line to the specified `date`.
    * @param {Date} date The date to which to scroll the time line
    */
    scrollToDate: function (date, animate, offset) {
        var view = this.getSchedulingView();
        var coordinate = view.getCoordinateFromDate(date, true);

        this.scrollToCoordinate(coordinate, date, animate, false, offset);
    },

    /**
    * Scrolls the time line so that specified `date` is in the center of the view.
    * @param {Date} date The date to which to scroll the time line
    * @param {Boolean} animate (optional) Whether or not scroll should be animated
    */
    scrollToDateCentered: function (date, animate) {
        var view = this.getSchedulingView();
        var delta = 0;

        if (view.isHorizontal()) {
            delta = view.getBox().width / 2;
        } else {
            delta = view.getBox().height / 2;
        }

        var coordinate = Math.round(view.getCoordinateFromDate(date, true) - delta);
        this.scrollToCoordinate(coordinate, date, animate, true);
    },

    //private
    scrollToCoordinate: function (coordinate, date, animate, centered, offsetFromViewportStart) {
        var view    = this.getSchedulingView();
        var me      = this;

        offsetFromViewportStart = offsetFromViewportStart || 0;

        // Not currently have this date in a timeaxis. Ignore negative scroll in weekview, it can be just 'filtered' with
        // startTime/endTime config
        if (coordinate < 0 && !view.isWeekView()) {
            if (this.infiniteScroll) {
                // for infinite scroll we have a special formula to calculate adjustment borders
                // shiftToDate() will perform adjustment and then recall scrollToDate() again
                view.shiftToDate(date, centered);

            } else {
                // adjust the timeaxis first
                var halfVisibleSpan = (this.timeAxis.getEnd() - this.timeAxis.getStart()) / 2;

                var newStartDate = new Date(date.getTime() - halfVisibleSpan);
                var newEndDate = new Date(date.getTime() + halfVisibleSpan);

                // We're trying to reconfigure time span to current dates, which means we are as close to center as it
                // could be. Do nothing then.
                // covered by 1102_panel_api
                if (newStartDate - this.getStart() !== 0 && newEndDate - this.getEnd() !== 0) {
                    this.setTimeSpan(newStartDate, newEndDate);

                    if (centered) {
                        me.scrollToDateCentered(date, animate);
                    } else {
                        me.scrollToDate(date, animate, offsetFromViewportStart);
                    }
                }
            }

            return;
        }

        if (this.isHorizontal()) {
            view.scrollHorizontallyTo(coordinate - offsetFromViewportStart, animate);
        } else {
            view.scrollVerticallyTo(coordinate - offsetFromViewportStart, animate);
        }
    },

    /**
     * Returns the center date of the currently visible timespan of scheduler.
     *
     * @return {Date} date Center date for the viewport.
     */
    getViewportCenterDate: function(){
        return this.getSchedulingView().getViewportCenterDate();
    },

    addCls : function() {
        throw 'Abstract method call';
    },

    removeCls : function() {
        throw 'Abstract method call';
    },

    registerRenderer : function(fn, scope) {
        this.renderers.push({
            fn      : fn,
            scope   : scope
        });
    },

    deregisterRenderer : function(fn, scope) {
        Ext.each(this.renderers, function(rend, i) {
            if (fn === rend) {
                Ext.Array.removeAt(this.renderers, i);
                return false;
            }
        });
    },

    /**
     * Returns the event store instance
     * @method getEventStore
     * @abstract
     * @return {Ext.data.AbstractStore}
     */


    /**
     * @method
     * @returns {Sch.crud.AbstractManager}
     */
    getCrudManager : function() {
        return this.crudManager;
    },

    setCrudManager : function(cm) {
        this.crudManager = cm;
    }
});
