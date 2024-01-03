/**
 @class Sch.view.model.TimeAxis
 @extends Ext.util.Observable
 @private

 This class is an internal view model class, describing the visual representation of a {@link Sch.data.TimeAxis timeaxis}.
 The config for the header rows is described in the {@link Sch.preset.ViewPreset#headerConfig headerConfig}.
 To calculate the widths of each cell in the time axis, this class requires:

 - availableWidth  - The total width available for the rendering
 - tickWidth     - The fixed width of each cell in the lowest header row. This value is normally read from the
 {@link Sch.preset.ViewPreset viewPreset} but this can also be updated programmatically using {@link #setTickWidth}

 Normally you should not interact with this class directly.

 */
Ext.define("Sch.view.model.TimeAxis", {
    extend              : 'Ext.util.Observable',

    requires            : [
        'Ext.Date',
        'Sch.util.Date',
        'Sch.preset.Manager'
    ],

    /**
     * @cfg {Sch.data.TimeAxis} timeAxis
     * The time axis providing the underlying data to be visualized
     */
    timeAxis            : null,

    /**
     * @cfg {Number} availableWidth
     * The available width, this is normally not known by the consuming UI component using this model class until it has been fully rendered.
     * The consumer of this model should call {@link #setAvailableWidth} when its width has changed.
     */
    availableWidth      : 0,

    /**
     * @cfg {Number} tickWidth
     * The "tick width" to use for the cells in the bottom most header row.
     * This value is normally read from the {@link Sch.preset.ViewPreset viewPreset}
     */
    tickWidth           : 100,

    /**
     * @cfg {Boolean} snapToIncrement
     * true if there is a requirement to be able to snap events to a certain view resolution.
     * This has implications of the {@link #tickWidth} that can be used, since all widths must be in even pixels.
     */
    snapToIncrement     : false,

    /**
     * @cfg {Boolean} forceFit
     * true if cells in the bottom-most row should be fitted to the {@link #availableWidth available width}.
     */
    forceFit            : false,

    headerConfig        : null,

    // cached linear version of `headerConfig` - array of levels, starting from top
    headers             : null,
    mainHeader          : 0,
    calendar            : null,

    // the width of time axis column in vertical
    timeAxisColumnWidth : null,
    // the width of resource column in vertical
    resourceColumnWidth : null,

    // width of the columns in week view
    weekViewColumnWidth : null,
    // array of columns start/end dates, because timeaxis may be filtered
    calendarColumnDates : null,

    headersDatesCache   : null,

    // aka tickWidth in horizontal
    timeColumnWidth     : null,

    rowHeightHorizontal : null,
    rowHeightVertical   : null,

    mode                : 'horizontal', // or 'vertical', or 'week'

    //used for Exporting. Make sure the tick columns are not recalculated when resizing.
    suppressFit         : false,

    // Since this model may be shared by multiple synced timelinePanels, we need to keep count of usage to know when we can destroy the view model.
    refCount            : 0,

    // cache of the config currently used.
    columnConfig        : {},

    // the view preset name to apply initially
    viewPreset          : null,

    // The default header level to draw column lines for
    columnLinesFor      : 'middle',

    eventStore          : null,

    originalTickWidth   : null,

    constructor: function (config) {
        var me = this;
        Ext.apply(this, config);

        me.headersDatesCache = {};

        if (this.viewPreset) {
            if (this.viewPreset instanceof Sch.preset.ViewPreset) {
                this.consumeViewPreset(this.viewPreset);
            } else {
                var preset      = Sch.preset.Manager.getPreset(this.viewPreset);

                preset && this.consumeViewPreset(preset);
            }
        }

        /**
         * @event update
         * Fires after the model has been updated.
         * @param {Sch.view.model.TimeAxis} model The model instance
         */

        // When time axis is changed, reconfigure the model
        me.timeAxis.on('reconfigure', me.onTimeAxisReconfigure, me);

        this.callParent(arguments);
    },

    isHorizontal : function () {
        return this.mode === 'horizontal';
    },

    isVertical : function () {
        return this.mode === 'vertical';
    },

    isWeek : function () {
        return this.mode === 'weekview';
    },

    hasTimeZone : function () {
        return this.timeAxis.hasTimeZone();
    },

    toTimeZone : function (date) {
        return this.timeAxis.toTimeZone(date);
    },

    destroy : function() {
        this.timeAxis.un('reconfigure', this.onTimeAxisReconfigure, this);
    },

    onTimeAxisReconfigure: function (timeAxis, suppressRefresh) {
        if (!suppressRefresh) {
            this.update();
        }
    },

    reconfigure : function (config) {
        // clear the cached headers
        this.headers        = null;

        Ext.apply(this, config);

        var value;

        if (this.isHorizontal()) {
            value = this.timeColumnWidth;
        } else {
            value = this.rowHeightVertical;
        }

        this.setTickWidth(value);

        this.fireEvent('reconfigure', this);
    },

    /**
     *  Returns a model object of the current timeAxis, containing an array representing the cells for each level in the header.
     *  This object will always contain a 'middle' array, and depending on the {@link Sch.preset.ViewPreset#headerConfig} it can also contain a 'top' and 'bottom' property.
     *  @return {Object} The model representing each cell (with start date and end date) in the timeline representation.
     */
    getColumnConfig : function() {
        return this.columnConfig;
    },

    /**
     *  Updates the view model current timeAxis configuration and available width.
     *  @param {Number} [availableWidth] The available width for the rendering of the axis (used in forceFit mode)
     */
    update: function (availableWidth, suppressEvent) {
        var timeAxis        = this.timeAxis,
            headerConfig    = this.headerConfig;

        this.availableWidth = Math.max(availableWidth || this.availableWidth, 0);

        if (!Ext.isNumber(this.availableWidth)) {
            throw new Error('Invalid available width provided to Sch.view.model.TimeAxis');
        }

        if (this.forceFit && this.availableWidth <= 0) {
            // No point in continuing
            return;
        }

        this.columnConfig   = {};

        // Generate the underlying date ranges for each header row, which will provide input to the cell rendering
        for (var pos in headerConfig) {
            if (headerConfig[pos].cellGenerator) {
                this.columnConfig[pos] = headerConfig[pos].cellGenerator.call(this, timeAxis.getStart(), timeAxis.getEnd());
            } else {
                this.columnConfig[pos] = this.createHeaderRow(pos, headerConfig[pos]);
            }
        }

        // The "column width" is considered to be the width of each tick in the lowest header row and this width
        // has to be same for all cells in the lowest row.
        var tickWidth       = this.calculateTickWidth(this.originalTickWidth);

        if (!Ext.isNumber(tickWidth) || tickWidth <= 0) {
            throw new Error('Invalid column width calculated in Sch.view.model.TimeAxis');
        }

        this.updateTickWidth(tickWidth);

        if (!suppressEvent) this.fireEvent('update', this);
    },

    /**
     * Will update columns start/end dates to perform date/coordinate lookups
     * @param {Object[]} columns Array of column configs including start/end dates
     * @private
     */
    updateCalendarColumnDates : function (columns) {
        this.calendarColumnDates = [];

        for (var i = 0; i < columns.length; i++) {
            var obj = columns[i];
            this.calendarColumnDates.push([obj.start, obj.end]);
        }
    },

    /**
     * Returns current column start/end dates array
     * @returns {Date[][]}
     * @private
     */
    getCalendarColumnDates : function () {
        return this.calendarColumnDates;
    },

    // private
    createHeaderRow : function (position, headerConfig) {
        var cells    = [],
            me       = this,
            align    = headerConfig.align,
            today    = Ext.Date.clearTime(new Date()),
            calendar = this.calendar;

        if (calendar) {
            var clsField      = calendar.model.getField(calendar.model.prototype.clsField),
                defaultDayCls = clsField.getDefaultValue().trim();
        }

        me.headersDatesCache[position] = {};

        me.forEachInterval(position, function (start, end, i) {
            var colConfig = {
                align     : align,
                start     : start,
                end       : end,
                headerCls : ''
            };

            // Convert start/end dates for display purposes
            if (me.hasTimeZone() && !this.timeAxis.isUTCTimeZone()) {
                start = this.toTimeZone(start);
                end = this.toTimeZone(end);
            }

            me.headersDatesCache[position][start.getTime()] = 1;

            if (headerConfig.renderer) {
                colConfig.header = headerConfig.renderer.call(headerConfig.scope || me, start, end, colConfig, i, me.eventStore);
            }
            else {
                if (this.timeAxis.isUTCTimeZone()) {
                    colConfig.header = Sch.util.Date.format(start, headerConfig.dateFormat, this.timeAxis.timeZone);
                }
                else {
                    colConfig.header = Ext.Date.format(start, headerConfig.dateFormat);
                }
            }

            // To be able to style individual day cells, weekends or other important days
            if (headerConfig.unit === Sch.util.Date.DAY && (!headerConfig.increment || headerConfig.increment === 1)) {
                colConfig.headerCls += ' sch-dayheadercell-' + start.getDay();

                if (calendar) {
                    if (!calendar.isWorkingDay(start)) {
                        colConfig.headerCls += ' sch-dayheadercell-nonworking';
                    }

                    var calendarDay = calendar.getCalendarDay(start),
                        dayCls      = calendarDay.getCls().trim();

                    // historically default value equals to 'sch-nonworkingtime' or 'gnt-holiday', so need to add only manually specified classes, otherwise all days will be marked as non working time
                    if (dayCls != defaultDayCls) {
                        colConfig.headerCls += ' ' + dayCls;
                    }
                }

                if (Ext.Date.clearTime(start, true) - today === 0) {
                    colConfig.headerCls += ' sch-dayheadercell-today';
                }
            }

            cells.push(colConfig);
        });

        return cells;
    },

    /**
     *  Returns the distance for a timespan with the given start and end date.
     *  Returns 0 if one of the start/end dates are filtered out of the timeaxis.
     *  @return {Number} The width of the time span
     */
    getDistanceBetweenDates: function (start, end) {
        return Math.round(this.getPositionFromDate(end, true) - this.getPositionFromDate(start));
    },

    /**
     *  Gets the position of a date on the projected time axis or -1 if the date is not in the timeAxis.
     *  @param {Date} date, the date to query for.
     *  @param {Boolean} [isEnd] true to return bottom coordinate for calendar view
     *  @returns {Number} the coordinate representing the date
     */
    getPositionFromDate: function (date, isEnd) {
        var result = -1;

        if (this.isWeek()) {
            var rowHeight       = this.rowHeightVertical;
            var headers         = this.getHeaders();
            var startDate       = this.timeAxis.getStart();
            var UD              = Sch.util.Date;

            // weekview inherits vertical view so this method should only return vertical coordinate
            var verticalDate    = UD.copyTimeValues(Ext.Date.clone(startDate), date);
            result              = UD.getDurationInUnit(startDate, verticalDate, headers[1].unit, true) / (headers[1].increment || 1) * rowHeight;

            if (result === 0 && isEnd) {
                result = this.calendarRowsAmount * rowHeight;
            }
        } else {
            var tick      = this.timeAxis.getTickFromDate(date);
            var tickWidth = this.getTickWidth();

            if (this.hasTimeZone() && this.timeAxis.isTickLengthVarying()) {
                // First and last ticks have different scale from other ticks because they have different width and duration
                // For a scheduler with days preset and tick width 40 and timezone UTC+12 lookups should look like this (tick -> position):
                // 0    -> 0
                // 0.25 -> 5
                // 0.5  -> 10
                // 0.75 -> 15
                // 1    -> 20 // first tick has width 20
                // 1.25 -> 30
                // 1.5  -> 40
                // 1.75 -> 50
                // 2    -> 60 // second tick has full width
                var nbrTicks       = this.timeAxis.getCount(),
                    firstTickWidth = tickWidth * (1 - this.timeAxis.timezoneTickStart),
                    lastTickWidth  = tickWidth * (1 - nbrTicks + this.timeAxis.timezoneTickEnd);

                if (tick <= 1) {
                    result = tick * firstTickWidth;
                }
                else if (tick === nbrTicks) {
                    result = this.getTotalWidth();
                }
                else if (tick > nbrTicks - 1) {
                    result = firstTickWidth + (Math.floor(tick) - 1) * tickWidth + (tick % 1) * lastTickWidth;
                }
                else {
                    result = firstTickWidth + (tick - 1) * tickWidth;
                }
            }
            else {
                if (tick >= 0) {
                    result = this.getTickWidth() * (tick - this.timeAxis.visibleTickStart);
                }
            }
        }

        return Math.round(result);
    },

    /**
     * Gets the date for a position on the time axis
     * @param {Number} position The page X or Y coordinate
     * @param {String} [roundingMethod] The rounding method to use
     * @returns {Date} the Date corresponding to the xy coordinate
     */
    getDateFromPosition: function (position, roundingMethod) {
        if (this.isWeek()) {
            var columns = this.getCalendarColumnDates();

            if (!columns) {
                return null;
            }

            // Last column width may differ in 1px, so we need to constrain columnIndex by array length
            var columnIndex             = Math.min(Math.floor(Math.max(position[0], 0) / this.weekViewColumnWidth), columns.length - 1),
                horizontalDate          = columns[columnIndex][0],
                first                   = this.timeAxis.first(),
                millisecondsPerPixel    = (first.get('end') - first.get('start')) / this.rowHeightVertical,
                UD                      = Sch.util.Date,
                result                  = UD.add(horizontalDate, UD.MILLI, Math.round(position[1] * millisecondsPerPixel));

            if (roundingMethod) {
                result  = this.timeAxis[roundingMethod + 'Date'](result);
            }

            return result;

        } else {
            var tick;
            var tickWidth = this.getTickWidth();
            var nbrTicks = this.timeAxis.getCount();

            // With time zone time axis ticks may have different size, which makes position <-> tick relation non-linear
            // e.g. if first tick is 20px, which is a half size of the normal tick, this is how lookups would work:
            // position -> tick
            // 0 -> 0
            // 10 -> 0.5
            // 20 -> 1
            // 30 -> 1.25
            // 40 -> 1.5
            // 50 -> 1.75
            // 60 -> 2
            // Same applies to the end.
            if (this.hasTimeZone() && this.timeAxis.isTickLengthVarying()) {
                var firstTickWidth = tickWidth * (1 - this.timeAxis.timezoneTickStart),
                    lastTickWidth  = tickWidth * (1 - nbrTicks + this.timeAxis.timezoneTickEnd),
                    middleTicksWidth = this.getTotalWidth() - firstTickWidth - lastTickWidth;

                if (position < firstTickWidth) {
                    tick = position / firstTickWidth;
                }
                else if (position - firstTickWidth >= middleTicksWidth) {
                    tick = nbrTicks - 1 + (position - firstTickWidth - middleTicksWidth) / lastTickWidth;
                }
                else {
                    tick = (position - firstTickWidth) / tickWidth + 1;
                }
            }
            else {
                tick = position / tickWidth + this.timeAxis.visibleTickStart;
            }

            if (tick < 0 || tick > nbrTicks) {
                return null;
            }

            return this.timeAxis.getDateFromTick(tick, roundingMethod);
        }
    },

    /**
     * Returns the amount of pixels for a single unit
     * @private
     * @return {Number} The unit in pixel
     */
    getSingleUnitInPixels: function (unit) {
        return Sch.util.Date.getUnitToBaseUnitRatio(this.timeAxis.getUnit(), unit) * this.getTickWidth() / this.timeAxis.increment;
    },

    /**
     * [Experimental] Returns the pixel increment for the current view resolution.
     * @return {Number} The width increment
     */
    getSnapPixelAmount: function () {
        if (this.snapToIncrement) {
            var resolution = this.timeAxis.getResolution();
            return (resolution.increment || 1) * this.getSingleUnitInPixels(resolution.unit);
        } else {
            return 1;
        }
    },

    /**
     * Returns the current time column width (the width of a cell in the lowest header row)
     * @return {Number} The width
     */
    getTickWidth: function () {
        return this.tickWidth;
    },

    /**
     * Sets a new tick width (the width of a time cell in the bottom-most time axis row)
     * @param {Number} width The width
     */
    setTickWidth: function (width, suppressEvent) {
        this.originalTickWidth = width;

        this.updateTickWidth(width);

        this.update(null, suppressEvent);
    },

    updateTickWidth : function (value) {
        this.tickWidth = value;

        this[this.isHorizontal() ? 'timeColumnWidth' : 'rowHeightVertical'] = value;
    },

    /**
     * Returns the total width of the time axis representation.
     * @return {Number} The width
     */
    getTotalWidth: function () {
        return Math.round(this.getTickWidth() * this.timeAxis.getVisibleTickTimeSpan());
    },

    // Calculates the time column width based on the value defined viewPreset "timeColumnWidth". It also checks for the forceFit view option
    // and the snapToIncrement, both of which impose constraints on the time column width configuration.
    calculateTickWidth: function (proposedWidth) {
        var forceFit        = this.forceFit;
        var timeAxis        = this.timeAxis;

        var width           = 0,
            timelineUnit    = timeAxis.getUnit(),
            ratio           = Number.MAX_VALUE,
            DATE            = Sch.util.Date;

        if (this.snapToIncrement) {
            var resolution  = timeAxis.getResolution();

            ratio           = DATE.getUnitToBaseUnitRatio(timelineUnit, resolution.unit) * resolution.increment;
        } else {
            var measuringUnit = DATE.getMeasuringUnit(timelineUnit);

            ratio           = Math.min(ratio, DATE.getUnitToBaseUnitRatio(timelineUnit, measuringUnit));
        }

        if (!this.suppressFit) {

            var ticks = this.isWeek() ? timeAxis.endTime - timeAxis.startTime : timeAxis.getVisibleTickTimeSpan(),
                fittingWidth = Math[ forceFit ? 'floor' : 'round' ](this.getAvailableWidth() / ticks);

            width = (forceFit || proposedWidth < fittingWidth) ? fittingWidth : proposedWidth;

            if (ratio > 0 && (!forceFit || ratio < 1)) {
                // For touch, make sure we always fill the available space with forceFit (to not show edges of side-time-pickers)
                var method  = Ext.versions.touch && forceFit? 'ceil' : (forceFit ? 'floor' : 'round');

                width       = Math.round(Math.max(1, Math[method](ratio * width)) / ratio);
            }
        } else {
            width           = proposedWidth;
        }

        return width;
    },

    /**
     * Returns the available width for the time axis representation.
     * @return {Number} The available width
     */
    getAvailableWidth: function () {
        return this.availableWidth;
    },

    /**
     * Sets the available width for the model, which (if changed) will cause it to update its contents and fire the {@link #event-update} event.
     * @param {Number} width The width
     */
    setAvailableWidth: function (width) {
        var oldAvailableWidth = this.availableWidth;

        this.availableWidth = Math.max(0, width);

        var newTickWidth = this.calculateTickWidth(this.originalTickWidth);

        // We should only need to repaint fully if the tick width has changed (which will happen if forceFit is set, or if the full size of the time axis doesn't
        // occupy the available space - and gets stretched
        var doUpdate     = newTickWidth > 0 && ((oldAvailableWidth !== width && this.forceFit) ||
                           newTickWidth !== this.getTickWidth());

        if (doUpdate) {
            this.update();
        }
    },

    /**
     * This function fits the time columns into the available space in the time axis column.
     * @param {Boolean} suppressEvent `true` to skip firing the 'update' event.
     */
    fitToAvailableWidth: function (suppressEvent) {
        var proposedWidth   = Math.floor(this.availableWidth / this.timeAxis.getVisibleTickTimeSpan());

        this.setTickWidth(proposedWidth, suppressEvent);
    },

    /**
     * Sets the forceFit value for the model, which will cause it to update its contents and fire the {@link #event-update} event.
     * @param {Boolean} value
     */
    setForceFit: function (value) {
        if (value !== this.forceFit) {
            this.forceFit = value;
            this.update();
        }
    },

    /**
     * Sets the snapToIncrement value for the model, which will cause it to update its contents and fire the {@link #event-update} event.
     * @param {Boolean} value
     */
    setSnapToIncrement: function (value) {
        if (value !== this.snapToIncrement) {
            this.snapToIncrement = value;
            this.update();
        }
    },

    getViewRowHeight : function () {
        var val = this.isHorizontal() ? this.rowHeightHorizontal : this.rowHeightVertical;

        // Sanity check
        if (!val) throw new Error('rowHeight info not available');

        return val;
    },

    setViewRowHeight : function (value, suppressEvent) {
        var property        = 'rowHeight' + Ext.String.capitalize(this.mode);

        if (this[ property ] != value) {
            this[ property ]    = value;

            if (this.isHorizontal()) {
                if (!suppressEvent) this.fireEvent('update', this);
            } else {
                this.setTickWidth(value, suppressEvent);
            }
        }
    },

    setViewColumnWidth : function (value, suppressEvent) {
        if (this.isHorizontal()) {
            this.setTickWidth(value, suppressEvent);
        } else if (this.isVertical()) {
            this.resourceColumnWidth = value;
        } else if (this.isWeek()) {
            this.weekViewColumnWidth = value;
        }

        if (!suppressEvent) {
            this.fireEvent('columnwidthchange', this, value);
        }
    },

    getHeaders : function () {
        if (this.headers) return this.headers;

        var headerConfig        = this.headerConfig;

        // main header is always `middle` (which is always requires to present in `headerConfig`)
        // `top` may absent, in this case `middle` will be on 0-th index
        this.mainHeader         = headerConfig.top ? 1 : 0;

        return this.headers     = [].concat(headerConfig.top || [], headerConfig.middle || [], headerConfig.bottom || []);
    },

    getMainHeader : function () {
        return this.getHeaders()[this.mainHeader];
    },

    getBottomHeader : function () {
        var headers     = this.getHeaders();

        return headers[headers.length - 1];
    },

    getLowestHeader : function() {
        return 'bottom' in this.headerConfig ? 'bottom' : 'middle';
    },

    /**
     * This method is meant to return name of the header which 2nd lowest. It is used for {@link #isMajorTick} method
     * @return {String/null}
     * @private
     */
    getMajorHeaderName : function () {
        var headerConfig = this.headerConfig;

        // If there's a bottom header - return middle one as it's required
        if (headerConfig.bottom) {
            return 'middle';
        }

        // if there is a top header - return that, because middle is required and we do not have bottom for sure
        if (headerConfig.top) {
            return 'top';
        }

        return null;
    },

    /**
     * For vertical view (and column lines plugin) we sometimes want to know if current tick starts along with the
     * upper header level.
     * @param {Date} date
     * @return {Boolean}
     * @private
     */
    isMajorTick : function (date) {
        var nextLevel = this.getMajorHeaderName();

        if (this.hasTimeZone() && !this.timeAxis.isUTCTimeZone()) {
            date = Sch.util.Date.toTimeZone(date, this.timeAxis.timeZone);
        }

        // if forceFit is used headersDatesCache won´t have been generated yet on the first call here,
        // since no width is set yet
        return nextLevel && this.headersDatesCache[nextLevel] && this.headersDatesCache[nextLevel][date.getTime()] || false;
    },

    /**
     * Calls the supplied iterator function once per interval. The function will be called with three parameters, start date and end date and an index.
     * Return false to break the iteration.
     * @param {String} position 'main' (middle), 'top' or 'bottom'
     * @param {Function} iteratorFn The function to call, will be called with start date, end date and "tick index"
     * @param {Object} scope (optional) The "this" object to use for the function call
     */
    forEachInterval : function (position, iteratorFn, scope) {
        scope               = scope || this;

        var headerConfig    = this.headerConfig;

        if (!headerConfig) return;     // Not initialized

        if (position === 'top' || (position === 'middle' && headerConfig.bottom)) {
            var header      = headerConfig[ position ];

            this.timeAxis.forEachAuxInterval(header.unit, header.increment, iteratorFn, scope);
        } else {
            // This is the lowest header row, which should be fed the data in the tickStore
            this.timeAxis.each(function(r, index) {
                return iteratorFn.call(scope, r.data.start, r.data.end, index);
            });
        }
    },

    /**
     * Calls the supplied iterator function once per interval. The function will be called with three parameters, start date and end date and an index.
     * Return false to break the iteration.
     * @protected
     * @param {Function} iteratorFn The function to call
     * @param {Object} scope (optional) The "this" object to use for the function call
     */
    forEachMainInterval : function (iteratorFn, scope) {
        this.forEachInterval('middle', iteratorFn, scope);
    },

    consumeViewPreset : function (preset) {
        // clear the cached headers
        this.headers        = null;

        Ext.apply(this, {
            headerConfig        : preset.headerConfig,
            columnLinesFor      : preset.columnLinesFor || 'middle',
            rowHeightHorizontal : preset.rowHeight,
            tickWidth           : this.isHorizontal() ? preset.timeColumnWidth : preset.timeRowHeight || preset.timeColumnWidth || 60,
            timeColumnWidth     : preset.timeColumnWidth,

            // timeColumnWidth is also used for row height in vertical mode
            rowHeightVertical   : preset.timeRowHeight || preset.timeColumnWidth || 60,
            timeAxisColumnWidth : preset.timeAxisColumnWidth,
            resourceColumnWidth : preset.resourceColumnWidth || 100
        });

        this.originalTickWidth = this.getTickWidth();
    },

    setEventStore : function(store) {
        this.eventStore = store;
    },

    setCalendar : function(cal) {

        if (cal !== this.calendar) {
            this.calendar = cal;

            if (cal) {
                this.update();
            }
        }
    }
});
