/**

@class Gnt.model.task.Splittable
@mixin
@protected

Internal mixin class providing task splitting logic and functionality belonging to the Task model class.

*/
Ext.define('Gnt.model.task.Splittable', {

    uses                        : [
        'Gnt.model.TaskSegment'
    ],

    segmentsTrackingSuspended   : 0,

    changingTaskBySegments      : false,

    segmentsSnapshot            : null,

    segmentsProjection          : null,


    getFirstSegment : function () {
        var segments    = this.getSegments();

        return segments && segments[0];
    },


    getLastSegment : function () {
        var segments    = this.getSegments();

        return segments && segments[segments.length - 1];
    },


    normalizeSegments : function () {
        var segments    = this.getSegments();

        // we don't wanna hear any response from segments during their normalization
        this.suspendSegmentsTracking();

        // first let sort intervals by its start dates ascending
        segments.sort(function (a, b) {
            if (!a.normalized) a.normalize();
            if (!b.normalized) b.normalize();
            return a.getStartDate() > b.getStartDate() ? 1 : -1;
        });

        // merge overlapped segments if any
        this.mergeOverlappedSegments();

        // if we still have segmentation after merging
        if (this.getSegments()) {
            this.data[ this.durationField ] = this.getSegmentsDuration();
        }

        this.resumeSegmentsTracking();
    },


    // Refreshes the task segments dates. We have to call this after the task time span change.
    updateSegmentsDates : function (options) {
        options     = options || {};

        if (!this.isSegmented()) return;

        // we don't want to catch response from segments
        this.suspendSegmentsTracking();

        options             = Ext.apply({
            useAbsoluteOffset   : false
        }, options);

        options.isForward   = options.isForward !== false;

        var segmentsModified = false;

        this.forEachSegment(function (segment) {
            segment.updateDatesByOffsets(options);
            // remember any segment was actually modified
            segmentsModified = segmentsModified || Boolean(segment.modified);
        }, options.isForward);

        // need to set Segments field dirty
        if (segmentsModified) {
            this.set(this.segmentsField, this.getSegments().slice());
        }

        this.resumeSegmentsTracking();
    },


    getSegmentIntervalsForRange : function (from, till, segments) {
        segments    = segments || this.getSegments();
        if (!segments) return;

        var DATE    = Sch.util.Date,
            result  = [];

        for (var i = 0, l = segments.length; i < l; i++) {
            var part            = segments[i],
                segmentStart    = part.getStartDate(),
                segmentEnd      = part.getEndDate();

            if (DATE.intersectSpans(from, till, segmentStart, segmentEnd)) {
                result.push([ DATE.constrain(segmentStart, from, till) - 0, DATE.constrain(segmentEnd, from, till) - 0 ]);
            }
        }

        return result.length && result || null;
    },

    /**
     * Returns a segment that is ongoing on the provided date.
     * @param  {Date} date Date to find an ongoing segment on
     * @param  {Gnt.model.TaskSegment[]} [segments] List of segments to check. When not provided the task segments is used
     * @return {Gnt.model.TaskSegment} Ongoing segment
     */
    getSegmentByDate : function (date, segments) {
        segments    = segments || this.getSegments();
        if (!segments) return;

        for (var i = 0, l = segments.length; i < l; i++) {
            var part    = segments[i];
            if (date >= part.getStartDate() && date < part.getEndDate()) return part;
        }
    },


    // Truncates segments that don't fit into task time span (this can be detected either based on the task start/end dates or by comparing with the task duration).
    // @private
    constrainSegments : function (options) {
        // should be called only for the task driven changes, and `this.changingTaskBySegments` means that change initiated by a segment
        if (this.changingTaskBySegments) return;

        options             = options || {};

        var segments    = this.getSegments();
        if (!segments) return;

        var taskDuration    = this.getDuration('MILLI'),
            durationUnit    = options.unit || this.getDurationUnit(),
            durationLimit   = options.duration,
            startDate       = this.getStartDate(),
            endDate         = this.getEndDate(),
            converter       = this.getUnitConverter();

        if (!startDate || (!endDate && !taskDuration && !durationLimit)) {
            this.set(this.segmentsField, null);
            return;
        }

        if (durationLimit) {
            durationLimit   = converter.convertDurationToMs(durationLimit, durationUnit);
        } else if (!endDate) {
            durationLimit   = taskDuration;
        }

        // we don't want to catch response from segments
        this.suspendSegmentsTracking();

        segments[0].setStartDateWithoutPropagation(this.getStartDate(), false);

        // now let's loop over array and merge overlapping intervals
        var toRemove        = [],
            durationLeft    = durationLimit,
            current, previous;

        var toRemoveChecker;
        // we check if segment fits into task timespan using either task end date or task duration depending on options provided
        if (durationLimit) {
            toRemoveChecker = function () { return durationLeft <= 0; };
        } else {
            toRemoveChecker = function (segment) { return segment.getStartDate() >= endDate; };
        }

        for (var i = 0, l = segments.length; i < l; i++) {
            current         = segments[i];

            // we get rid of segments that do not fit into task timespan
            if (toRemoveChecker(current)) {
                toRemove.push.apply(toRemove, segments.slice(i));
                break;
            }

            durationLeft    -= current.getDuration('MILLI');

            previous        = current;
        }

        // remove segments swallowed during merge
        this.removeSegments(toRemove);

        if (segments.length < 2) {
            this.set(this.segmentsField, null);

        } else {

            var last            = this.getLastSegment();
            var lastAdjusted    = false;

            // if we constrain using duration
            if (durationLimit) {
                if (durationLeft) {
                    last.setDurationWithoutPropagation(converter.convertMSDurationToUnit(last.getEndOffset() - last.getStartOffset() + durationLeft, last.getDurationUnit()));
                    lastAdjusted    = true;
                }
            } else {
                if (last.getEndDate() - endDate) {
                    last.setEndDateWithoutPropagation(endDate, false);
                    lastAdjusted    = true;
                }
            }

            // if we modified segments and field is not marked as modified yet
            var taskStore = this.getTaskStore(true),
                isProjecting = taskStore && taskStore.isProjecting();
            if ((toRemove.length || lastAdjusted) && (isProjecting || !this.modified || !this.modified[this.segmentsField])) {
                this.set(this.segmentsField, this.getSegments().slice());
            }
        }

        this.resumeSegmentsTracking();
    },


    forEachSegment : function (fn, isForward, startSegment, scope) {
        if (!fn) return;

        scope       = scope || this;

        var method, segment;

        if (isForward !== false) {
            // method to walk down the segments available
            method  = 'getNextSegment';
            // initial segment
            segment = startSegment || this.getFirstSegment();
        } else {
            method  = 'getPrevSegment';
            segment = startSegment || this.getLastSegment();
        }

        while (segment) {
            if (fn.call(scope, segment) === false) return;

            segment    = segment[method].call(segment);
        }
    },


    /**
     * @propagating
     * Splits a task.
     * @param {Date} from The date to split this task at.
     * @param {Number} [duration=1] Split duration.
     * @param {String} [unit=d] Split duration unit.
     * @param {Boolean} [skipNonWorkingTime] Pass `true` to automatically move the start date to the earliest available working time (if it falls on non-working time).
     * Default is `false`
     * @param {Function} [callback] Callback function to call after task has been split and changes among dependent tasks were propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    split : function(from, duration, unit, skipNonWorkingTime, callback) {
        var me = this,
            cancelFn;

        me.propagateChanges(
            function() {
                return me.splitWithoutPropagation(from, duration, unit, skipNonWorkingTime, function cancelFeedback(fn) {
                    cancelFn = fn;
                });
            },
            function(cancelChanges, affectedTasks) {
                cancelChanges && cancelFn && cancelFn();
                callback && callback(cancelChanges, affectedTasks);
            }
        );
    },


    splitWithoutPropagation : function (from, duration, unit, skipNonWorkingTime, cancelFeedback) {
        var me  = this;

        if (skipNonWorkingTime !== true && skipNonWorkingTime !== false) {
            var taskStore       = me.getTaskStore(true);

            skipNonWorkingTime  = taskStore ? taskStore.skipWeekendsDuringDragDrop : false;
        }

        // cannot split:
        // - if no split date specified
        // - a summary task
        // - a milestone
        if (!from || !me.isLeaf() || me.isMilestone()) return;

        var startDate   = me.getStartDate(),
            endDate     = me.getEndDate();

        // - not scheduled task
        // - provided date violates task interval
        if (!startDate || !endDate || (startDate >= from) || (from >= endDate)) return;

        var segments    = me.getSegments(),
            segmentToSplit;

        // let's make a snapshot to rollback in case of some constraint violation
        var snapshot    = me.buildSegmentsSnapshot(segments);

        if (segments) {
            segmentToSplit  = me.getSegmentByDate(from);

            if (!segmentToSplit) return;
        } else {
            segments        = [];
        }

        duration        = duration || 1;
        unit            = unit || this.getDurationUnit();

        var date        = new Date(from),
            splitStart  = date,
            splitEnd    = date,
            durationMS  = me.getUnitConverter().convertDurationToMs(duration, unit);

        if (skipNonWorkingTime) {
            splitEnd    = me.skipNonWorkingTime(splitEnd, true, true);
            splitStart  = me.skipNonWorkingTime(splitStart, false, true);

            // exit if split date is in a large gap between working periods of time
            // if (splitEnd - splitStart  > durationMS) return;
        }

        var taskDurationUnit    = me.getDurationUnit(),
            segmentPrototype    = Ext.ClassManager.get(me.segmentClassName).prototype,
            firstPieceDuration,
            secondPieceDuration,
            segmentData;

        // suspend to not call onSegmentsChanged on every segment modification
        // we call it one time on the last step
        me.suspendSegmentsTracking();

        var addSegment = true;

        // split not segmented task
        if (!segmentToSplit) {

            firstPieceDuration      = me.calculateDuration(startDate, splitStart);
            secondPieceDuration     = me.getDuration() - firstPieceDuration;

            segmentData                                     = { task : me };
            segmentData[segmentPrototype.startDateField]    = startDate;
            segmentData[segmentPrototype.durationField]     = firstPieceDuration;
            segmentData[segmentPrototype.durationUnitField] = taskDurationUnit;
            segments.push(Ext.create(me.segmentClassName, segmentData));

        // split existing segment
        } else {
            firstPieceDuration  = me.calculateDuration( segmentToSplit.getStartDate(), splitStart, taskDurationUnit );
            secondPieceDuration = segmentToSplit.getDuration(taskDurationUnit) - firstPieceDuration;

            // we don't create a new segment if split date falls on a segment start
            // in this case we just push the segment further by split duration length
            addSegment = !!firstPieceDuration;

            var pushFrom;

            if (addSegment) {
                segmentToSplit.setEndDateWithoutPropagation( splitStart, false, skipNonWorkingTime );
                // push segments starting from the next after the clicked one
                pushFrom = segmentToSplit.getNextSegment();

            // if we don't split the clicked segment
            // we push segments starting from it
            } else {
                pushFrom = segmentToSplit;
            }

            // shift all further segments by provided duration
            if (pushFrom) {
                me.forEachSegment(function (s) {
                    s.setStartEndOffset( s.getStartOffset() + durationMS, s.getEndOffset() + durationMS );
                    s.updateDatesByOffsets();
                }, true, pushFrom);
            }
        }

        // if we need to create a new segment
        if (addSegment) {
            // take split duration into account
            splitEnd        = me.skipWorkingTime(splitEnd, durationMS);

            if (skipNonWorkingTime) {
                // adjust to calendar if required
                splitEnd    = me.skipNonWorkingTime(splitEnd);
            }

            segmentData     = {
                prevSegment : segmentToSplit || segments[0],
                task        : me
            };
            segmentData[segmentPrototype.startDateField]    = splitEnd;
            segmentData[segmentPrototype.durationField]     = secondPieceDuration;
            segmentData[segmentPrototype.durationUnitField] = taskDurationUnit;

            var newSegment = Ext.create(me.segmentClassName, segmentData);

            if (segmentToSplit) {
                Ext.Array.insert(segments, Ext.Array.indexOf(segments, segmentToSplit) + 1, [newSegment]);
            } else {
                segments.push(newSegment);
            }
        }

        me.resumeSegmentsTracking();

        cancelFeedback && cancelFeedback(function() {
            me.rollbackSegmentsToSnapshot(snapshot);
            me.onSegmentsChanged(null, null);
        });

        if (!segmentToSplit) {
            me.setSegmentsWithoutPropagation(segments);
        } else {
            me.onSegmentsChanged(null, null);
        }

        return true;
    },


    /**
     * @propagating
     * Merges two segments of a task.
     * @param {Gnt.model.TaskSegment} segment1 First segment to merge.
     * @param {Gnt.model.TaskSegment} segment2 Second segment to merge.
     * @param {Function} [callback] Callback function to call after task has been merged and changes among dependent tasks were propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    merge : function (segment1, segment2, callback) {
        var me = this;

        me.propagateChanges(
            function() {
                return me.mergeWithoutPropagation(segment1, segment2);
            },
            callback
        );
    },


    mergeWithoutPropagation : function(segment1, segment2) {
        if (!this.isSegmented() || !segment1 || !segment2) return;

        var first, second;

        if (segment1.getStartOffset() > segment2.getStartOffset()) {
            first   = segment2;
            second  = segment1;
        } else {
            first   = segment1;
            second  = segment2;
        }

        // merging itself will be done automatically inside of `onSegmentsChanged`
        first.setEndDateWithoutPropagation(second.getEndDate(), false);

        return true;
    },


    suspendSegmentsTracking : function () {
        this.segmentsTrackingSuspended++;
    },


    resumeSegmentsTracking : function () {
        this.segmentsTrackingSuspended--;
    },


    // Returns the sum of segments durations.
    getSegmentsDuration : function (unit) {
        unit            = unit || this.getDurationUnit();
        var segments    = this.getSegments();
        var duration    = 0;

        for (var i = 0, l = segments.length; i < l; i++) {
            var s       = segments[i];
            duration    += s.getEndOffset() - s.getStartOffset();
        }

        return this.getUnitConverter().convertMSDurationToUnit(duration, unit);
    },


    mergeOverlappedSegments : function (doNotTruncate) {
        var segments = this.getSegments();

        if (segments) {
            var toRemove    = [],
                previous    = segments[0],
                current;

            // Check if we should merge segments
            for (var i = 1, l = segments.length; i < l; i++) {
                current     = segments[i];

                // if `current` segment intersects `previous` segment
                if (current.getStartOffset() <= previous.getEndOffset()) {
                    // we skip the current
                    toRemove.push(current);

                    // if `current` end date is greater than `previous` one we elapse previous segment
                    if (current.getEndOffset() > previous.getEndOffset()) {
                        previous.setEndDateWithoutPropagation(current.getEndDate(), false);
                    }

                } else {
                    // `previous` keeps the last not skipped segment
                    previous    = current;
                }
            }

            this.removeSegments(toRemove);

            if (segments.length < 2 && !doNotTruncate) {
                this.setSegmentsWithoutPropagation(null);
            }
        }
    },


    onSegmentEditBegin : function (segment) {
        this.getTreeStore().onSegmentEditBegin(this, segment);
        this.snapshotSegments();
    },

    onSegmentEditEnd : function (segment) {
        this.getTreeStore().onSegmentEditEnd(this, segment);
    },

    onSegmentsChanged : function (segment, modified) {

        if (this.segmentsTrackingSuspended) return;

        this.changingTaskBySegments = true;

        // we don't want to escalate chain of calls
        this.suspendSegmentsTracking();

        // Check if we should merge segments
        // we pass `true` to not truncate segments array if we have 1 element in it (we need this to get duration from it)
        // The array will be completely reset inside of this.set() call
        this.mergeOverlappedSegments(true);

        // segments has been changed so we need re-adjust task to take them into account

        // if segment duration has been changed - task duration has to be updated
        if (segment && modified && segment.durationField in modified) {
            // even after merge here we have at least 1 segment to be able to get duration from it
            this.setDurationWithoutPropagation(this.getSegmentsDuration());

        // for effort driven tasks we use setStartEndDateWithoutPropagation
        // since we might need to recalculate both EndDate and Duration
        } else if (this.getSchedulingMode() == 'EffortDriven') {
            this.setStartEndDateWithoutPropagation(this.getStartDate(), this.recalculateEndDate());

        } else {
            this.setStartDateWithoutPropagation(this.getStartDate());
        }

        // re-get segments list since it could've been rolled back because of failed propagation
        // inside of setDuration/setStartDate call
        var segments    = this.getSegments();

        // set field state to dirty
        this.set(this.segmentsField, segments && segments.slice() || null);

        this.resumeSegmentsTracking();

        this.changingTaskBySegments = false;

        //this.getTreeStore().onSegmentsChanged(segment, modified);
    },


    removeSegments : function (toRemove) {
        var segments = this.getSegments();

        if (segments && toRemove) {

            if (!Ext.isArray(toRemove)) toRemove = [ toRemove ];

            if (toRemove.length) {

                for (var i = 0, l = toRemove.length; i < l; i++) {
                    Ext.Array.remove(segments, toRemove[i]);
                }

                this.onSegmentsChanged();
            }
        }
    },


    /**
     * @propagating
     * Sets list of segments of the split task.
     * @param {Gnt.model.TaskSegment[]/Object[]} value List of segments.
     * @param {Function} [callback] Callback function to call after task end date has been set and changes among dependent tasks were propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    setSegments : function (value, callback) {
        var me = this;

        me.propagateChanges(
            function() {
                return me.setSegmentsWithoutPropagation(value);
            },
            callback
        );
    },

    /**
     * Sets list of segments of the split task.
     * @param {Gnt.model.TaskSegment[]/Object[]} value List of segments.
     */
    setSegmentsWithoutPropagation : function (value) {
        this.onSegmentEditBegin();

        this.suspendSegmentsTracking();

        // We call processSegmentsValue(value) here explicitly regardless "Segment" field also does this in its "convert" method.
        // The reason is we might be in the middle of projection and then "model.set()" method is overridden
        // and "converter" is not really called (until projection gets committed).
        this.set(this.segmentsField, this.processSegmentsValue(value));

        this.resumeSegmentsTracking();

        this.onSegmentsChanged();
        this.onSegmentEditEnd();

        return true;
    },


    processSegmentsValue : function (value) {
        var segments, currentSegment, prevSegment;

        // if segments are specified for the task
        if (value) {
            value    = [].concat(value);
            segments = [];

            for (var i = 0, l = value.length; i < l; i++) {
                currentSegment = value[i];

                if (!(currentSegment instanceof Gnt.model.TaskSegment)) {
                    currentSegment = Ext.create(this.segmentClassName, Ext.apply(currentSegment, {
                        task    : this
                    }));
                }

                segments.push(currentSegment);

                prevSegment = currentSegment;
            }

            value = segments && segments.length > 1 && segments || null;
        }

        return value;
    },


    /**
     * Returns `true` if task is segmented and `false` otherwise.
     * @return {Boolean} `true` if task is segmented and `false` otherwise.
     */
    isSegmented : function () {
        return Boolean(this.getSegments());
    },


    /**
     * Gets segment by its index.
     * @param {Number} index Segment index to retrieve (zero based value).
     * @return {Gnt.model.TaskSegment}
     */
    getSegment : function(index) {
        return this.getSegments()[index];
    },


    getLastSegmentsSnapshot : function () {
        var result;

        if (this.segmentsProjection && this.getTaskStore().isProjecting()) {
            var levels = Ext.Object.getKeys(this.segmentsProjection);

            if (levels.length) {
                result = this.segmentsProjection[Ext.Array.max(levels)];
            } else {
                result = this.getSegmentsSnapshot();
            }
        }
        else {
            result = this.getSegmentsSnapshot();
        }

        return result;
    },

    rejectSegmentsProjection : function () {
        var projectionLevel = this.getTaskStore(true).getProjectionLevel();

        var snapshot, i;

        if (this.segmentsProjection) {
            var snapshotLevel;

            for (i = projectionLevel; i >= 0; i--) {
                if (snapshot        = this.segmentsProjection[i]) {
                    snapshotLevel   = i;
                    break;
                }
            }

            if (snapshotLevel === projectionLevel) {
                delete this.segmentsProjection[snapshotLevel];
            }
        }

        if (snapshot) {
            this.rollbackSegmentsToSnapshot(snapshot);
        }
    },


    commitSegmentsProjection : function () {
        var taskStore       = this.getTaskStore(true),
            projectionLevel = taskStore && taskStore.getProjectionLevel();

        if (this.segmentsProjection) {
            delete this.segmentsProjection[projectionLevel];
        }
    },


    rollbackSegmentsToSnapshot : function (snapshot) {
        this.data[this.segmentsField]   = snapshot && Ext.Array.map(snapshot, function (segment) {
            return segment && segment[0].readSnapshot(segment);
        });
    },


    buildSegmentsSnapshot : function (segments) {
        segments    = segments || this.getSegments();

        return segments && Ext.Array.map(segments, function (segment) {
            return segment && segment.buildSnapshot();
        });
    },

    getSegmentsSnapshot : function () {
        return this.segmentsSnapshot;
    },

    setSegmentsSnapshot : function (snapshot) {
        this.segmentsSnapshot = snapshot;
        this.hasSegmentsSnapshot = true;
    },

    resetSegmentsSnapshot : function () {
        this.segmentsSnapshot = null;
        this.hasSegmentsSnapshot = false;
    },

    snapshotSegments : function () {
        var taskStore       = this.getTaskStore(true),
            segments        = this.getSegments(),
            projectionLevel = taskStore && taskStore.getProjectionLevel(),
            snapshot;

        // if taskStore is in the middle of projection let's try to follow it
        // and bind snapshot to previous projection level, to be able to rollback segments
        // after projection rollback
        if (projectionLevel) {

            this.segmentsProjection = this.segmentsProjection || {};
            snapshot                = this.segmentsProjection[projectionLevel - 1];

            if (!snapshot) {

                snapshot                                        = this.buildSegmentsSnapshot(segments);
                this.segmentsProjection[projectionLevel - 1]    = snapshot;
            }

        }

        // this is a zero level snapshot that is used for task.reject() support
        if (!this.hasSegmentsSnapshot) {
            this.setSegmentsSnapshot(snapshot || this.buildSegmentsSnapshot(segments));
        }
    },


    commitSegments : function () {
        // EtxJS5 calls `commit` during `reject` call. o_O
        if (this.rejecting) return;

        // let's reset snapshot, we will fill it during first attempt to edit this task segments
        this.resetSegmentsSnapshot();

        var segments = this.getSegments();

        if (segments) {
            for (var i = 0, l = segments.length; i < l; i++) {
                segments[i].commit();
            }
        }
    },


    rejectSegments : function () {
        // get kept previous segments data
        this.hasSegmentsSnapshot && this.rollbackSegmentsToSnapshot(this.getSegmentsSnapshot());
        this.resetSegmentsSnapshot();

        var segments = this.getSegments();

        if (segments) {
            for (var i = 0, l = segments.length; i < l; i++) {
                segments[i].reject();
            }
        }
    }

});
