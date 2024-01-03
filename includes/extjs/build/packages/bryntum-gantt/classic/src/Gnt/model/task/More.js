/**

@class Gnt.model.task.More
@mixin
@protected

Internal mixin class providing additional logic and functionality belonging to the Task model class.

*/
Ext.define('Gnt.model.task.More', {

    propagating : false,

    /**
     * @propagating
     * Increases the indentation level of this task in the tree
     *
     * @param {Function} [callback] Callback function to call after task has been indented and changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    indent : function(callback) {
        var me = this,
            previousSibling = me.previousSibling,
            cancelFn;

        if (previousSibling) {
            var taskStore = me.getTaskStore();
            taskStore.beginIndent();

            me.propagateChanges(
                function() {
                    return me.indentWithoutPropagation(function(fn) {
                        cancelFn = fn;
                    });
                },
                function(cancelChanges, affectedTasks) {
                    if (cancelChanges || Object.keys(affectedTasks).length === 0) {
                        cancelFn && cancelFn();
                    }
                    else {
                        previousSibling.expand();
                    }
                    taskStore.endIndent();
                    callback && callback(cancelChanges, affectedTasks);
                }
            );
        }
        else {  // TODO: actually an exception should be thrown here, but BC is such BC
            callback && callback(false, {});
        }
    },


    indentWithoutPropagation : function (cancelAndResultFeedback) {
        var me              = this,
            previousSibling = me.previousSibling,
            result;

        if (previousSibling) {

            var removeContext = {
                parentNode      : me.parentNode,
                previousSibling : me.previousSibling,
                nextSibling     : me.nextSibling
            };

            // we put the task as the last child of the previous sibling
            var insertAt = previousSibling.childNodes ? previousSibling.childNodes.length : 0;

            result = previousSibling.insertSubtaskWithoutPropagation(insertAt, me, cancelAndResultFeedback);

            // http://www.sencha.com/forum/showthread.php?270802-4.2.1-NodeInterface-removeContext-needs-to-be-passed-as-an-arg
            me.removeContext = removeContext;
        }

        return result;
    },

    /**
     * @propagating
     * Decreases the indentation level of this task in the tree
     * @param {Function} [callback] Callback function to call after task has been indented and changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    outdent : function(callback) {
        var me = this,
            parentNode = me.parentNode,
            cancelFn;

        if (parentNode && !parentNode.isRoot()) {
            var taskStore = me.getTaskStore();

            // need to do view refresh after indent to sync scroll between locked/normal view
            // and get rid of extra nodes
            taskStore.beginIndent();

            me.propagateChanges(
                function() {
                    return me.outdentWithoutPropagation(function(fn) {
                        cancelFn = fn;
                    });
                },
                function(cancelChanges, affectedTasks) {
                    cancelChanges && cancelFn && cancelFn();
                    taskStore.endIndent();
                    callback && callback(cancelChanges, affectedTasks);
                }
            );
        }
        else {  // TODO: actually an exception should be thrown here, but BC is such BC
            callback && callback(false, {});
        }

    },

    outdentWithoutPropagation : function (cancelAndResultFeedback) {
        var me             = this,
            originalParent = me.parentNode,
            removeContext,
            result;

        if (originalParent && !originalParent.isRoot()) {
            var newParent      = originalParent.parentNode,
                newNextSibling = originalParent.nextSibling;

            removeContext = {
                parentNode      : originalParent,
                previousSibling : me.previousSibling,
                nextSibling     : me.nextSibling
            };

            // we put the task as the last child of the previous sibling
            var insertAt = newNextSibling ? newParent.indexOf(newNextSibling) : newParent.childNodes.length;

            result = newParent.insertSubtaskWithoutPropagation(insertAt, me, cancelAndResultFeedback);

            // http://www.sencha.com/forum/showthread.php?270802-4.2.1-NodeInterface-removeContext-needs-to-be-passed-as-an-arg
            me.removeContext = removeContext;
        }

        return result;
    },


    removeInvalidDependencies : function() {
        var depStore    = this.getDependencyStore(),
            deps        = this.getAllDependencies();

        for (var i = 0; i < deps.length; i++) {

            if (!deps[i].isValid()) {
                depStore.remove(deps[i]);
            }
        }
    },

    removeDependenciesToParents : function(newParentNode) {
        var me          = this,
            linkedTasks = me.getSuccessors().concat(me.getPredecessors());

        newParentNode.bubble(function(parent) {
            if (Ext.Array.indexOf(linkedTasks, parent) >= 0) {
                me.removeLinkToTask(parent);
            }
        });
    },


    /**
     * Returns true if the task has at least one dependency
     *
     * @return {Boolean}
     */
    hasDependencies : function () {
        return this.hasIncomingDependencies() || this.hasOutgoingDependencies();
    },


    /**
     * Returns all dependencies of this task (both incoming and outgoing)
     *
     * @return {Gnt.model.Dependency[]}
     */
    getAllDependencies : function () {
        return this.predecessors.concat(this.successors);
    },

    /**
     * Returns true if this task has at least one incoming dependency
     *
     * @return {Boolean}
     */
    hasIncomingDependencies : function () {
        return this.predecessors.length > 0;
    },

    /**
     * Returns true if this task has at least one outgoing dependency
     *
     * @return {Boolean}
     */
    hasOutgoingDependencies : function () {
        return this.successors.length > 0;
    },

    /**
     * Returns all incoming dependencies of this task
     *
     * @param {Boolean} [doNotClone=false] Whether to **not** create a shallow copy of the underlying {@link Gnt.model.Task#predecessors} property.
     * Passing `true` is more performant, but make sure you don't modify the array in this case.
     *
     * @return {Gnt.model.Dependency[]}
     */
    getIncomingDependencies : function (doNotClone) {
        return doNotClone ? this.predecessors : this.predecessors.slice();
    },


    getParentsOutgoingDependencies : function (parentNode) {
        var parent = this.parentNode,
            result = [],
            toAppend;

        while (parent) {
            // provided parentNode restricts to take into account dependencies from only its descendants
            if (parentNode) {
                toAppend = Ext.Array.filter(parent.getOutgoingDependencies(true), function (dependency) {
                    var task = dependency.getTargetTask();
                    return task && task.isAncestor(parentNode);
                });
            } else {
                toAppend = parent.getOutgoingDependencies(true);
            }

            result = result.concat(toAppend);

            parent = parent.parentNode;
        }

        return result;
    },


    getParentsIncomingDependencies : function (parentNode) {
        var parent = this.parentNode,
            result = [],
            toAppend;

        while (parent) {
            // provided parentNode restricts to take into account dependencies from only its descendants
            if (parentNode) {
                toAppend = Ext.Array.filter(parent.getIncomingDependencies(true), function (dependency) {
                    var sourceTask = dependency.getSourceTask();
                    return sourceTask && sourceTask.isAncestor(parentNode);
                });
            } else {
                toAppend = parent.getIncomingDependencies(true);
            }

            result = result.concat(toAppend);

            parent = parent.parentNode;
        }

        return result;
    },

    /**
     * Returns all outcoming dependencies of this task
     *
     * @param {Boolean} [doNotClone=false] Whether to **not** create a shallow copy of the underlying {@link Gnt.model.Task#successors} property.
     * Passing `true` is more performant, but make sure you don't modify the array in this case.
     *
     * @return {Gnt.model.Dependency[]}
     */
    getOutgoingDependencies : function (doNotClone) {
        return doNotClone ? this.successors : this.successors.slice();
    },

    scheduleByEarlyDates : function (options) {
        options = options || {};

        // if the task has no duration we set it to 1 duration unit
        if (!Ext.isNumber(this.getDuration())) {
            this.set(this.durationField, 1);
        }

        var earlyStart          = this.getEarlyStartDate(options),
            earlyEnd            = this.getEarlyEndDate(options),
            currentCascadeBatch = options.currentCascadeBatch,
            result              = false;

        // If the task calculated position differs the current one
        if ((earlyStart && earlyStart - this.getStartDate() !== 0) || (earlyEnd && earlyEnd - this.getEndDate() !== 0)) {
            currentCascadeBatch && currentCascadeBatch.addAffected(this);

            this.setStartEndDateWithoutPropagation(earlyStart, earlyEnd, false);

            result = true;
        }

        return result;
    },

    scheduleByLateDates : function (options) {
        options = options || {};

        // if the task has no duration we set it to 1 duration unit
        if (!Ext.isNumber(this.getDuration())) {
            this.set(this.durationField, 1);
        }

        var lateStart           = this.getLateStartDate(options),
            lateEnd             = this.getLateEndDate(options),
            currentCascadeBatch = options.currentCascadeBatch,
            result              = false;

        // If the task calculated position differs the current one
        if ((lateStart && lateStart - this.getStartDate() !== 0) || (lateEnd && lateEnd - this.getEndDate() !== 0)) {
            currentCascadeBatch && currentCascadeBatch.addAffected(this);

            this.setStartEndDateWithoutPropagation(lateStart, lateEnd, false);

            result = true;
        }


        return result;
    },

    getScheduleBackwards : function (taskStore) {
        taskStore = taskStore || this.getTaskStore(true);

        // We schedule backwards ...
        switch (this.getConstraintType()) {
            // if ASAP constraint cannot be applied at the moment
            case 'assoonaspossible' : return !this.areEarlyDatesAvailable();
            // if ALAP constraint can be applied at the moment
            case 'aslateaspossible' : return this.areLateDatesAvailable();
        }

        return this.getProjectScheduleBackwards(taskStore);
    },

    scheduleWithoutPropagation : function (options) {
        options = options || {};

        var result = false;

        // reset "needsRescheduling" flag if it was set
        this.isMarkedForRescheduling() && this.unmarkForRescheduling();

        var taskStore = options.taskStore = options.taskStore || this.getTaskStore(true);

        // we don't affect the task by incoming dependencies if it's either:
        //  - a manually scheduled task
        //  - a read only task
        if (taskStore && !this.isProject && !this.isManuallyScheduled() && !this.isCompleted() && !this.isReadOnly()) {

            // By default we use deep scan which provides correct results but is more "expensive"
            if (typeof options.shallow !== 'boolean') {
                options.shallow = !taskStore.scheduleByConstraints;
            }

            // Let's decide how we should scheduled the tasks either ASAP or ALAP
            // depending on the task and taskStore settings

            if (this.getScheduleBackwards(taskStore)) {
                result = this.scheduleByLateDates(options);
            } else {
                result = this.scheduleByEarlyDates(options);
            }
        }

        return result;
    },


    schedule : function (options, callback) {
        var me  = this;

        me.propagateChanges(function () {
            return me.scheduleWithoutPropagation(options);
        }, callback, true);
    },


    /**
     * @private
     * Internal method, called recursively to query for the longest duration of the chain structure
     * @return {Gnt.model.Task[]} chain An array forming a chain of linked tasks
     */
    getCriticalPaths: function () {
        var toProcess    = [this],
            cPath        = [[this]],
            task;

        while (task = toProcess.shift()) {
            var dependencies         = task.getIncomingDependencies(),
                criticalPredecessors = [];

            for (var i = 0; i < dependencies.length; i++) {
                var dependency  = dependencies[i],
                    predecessor = dependency.getSourceTask();

                if (predecessor.isCritical() && dependency.isCritical(dependency)) {
                    criticalPredecessors.push(predecessor);
                }
            }

            if (criticalPredecessors.length) {
                toProcess = toProcess.concat(criticalPredecessors);
                cPath.push(criticalPredecessors);
            }
        }

        return cPath;
    },

    /**
     * @propagating
     * Adds the passed task to the collection of child tasks.
     * @param {Gnt.model.Task} subtask The new subtask
     * @param {Function} [callback] Callback function to call after task has been added and changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     * @return {Gnt.model.Task} The added subtask task
     */
    addSubtask : function(subtask, callback) {
        var me = this;

        return me.insertSubtask(me.childNodes ? me.childNodes.length : 0, subtask, callback);
    },

    /**
     * @propagating
     * Inserts the passed task to the collection of child tasks at the given index.
     * @param {Integer} index Tne new subtask index
     * @param {Gnt.model.Task} subtask The new subtask
     * @param {Function} [callback] Callback function to call after task has been inserted and changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     * @return {Gnt.model.Task} The inserted subtask
     */
    insertSubtask : function (index, subtask, callback) {
        var me = this,
            compatResult,
            cancelFn;

        me.propagateChanges(
            function() {
                return me.insertSubtaskWithoutPropagation(index, subtask, function cancelAndResultFeedback(fn, result) {
                    cancelFn = fn;
                    compatResult = result;
                });
            },
            function onPropagationComplete(cancelChanges, affectedTasks) {
                cancelChanges && cancelFn && cancelFn();
                callback && callback(cancelChanges, affectedTasks);
            }
        );

        return compatResult;
    },


    insertSubtaskWithoutPropagation : function (index, subtask, cancelAndResultFeedback) {
        var me = this,
            originalParent,
            originalIndex,
            propagationSources,
            wasLeaf,
            segments;

        originalParent = subtask.parentNode;
        originalIndex  = originalParent && originalParent.indexOf(subtask);

        wasLeaf = me.get('leaf');

        subtask = me.insertChild(index, subtask);

        // Subtask might exist in the tree and implementer can decide it's not movable
        if (!subtask) {
            return [];
        }

        if (wasLeaf) {
            segments = me.getSegments();
            me.markAsParent();
        }

        me.expand();

        // since subtask gets into a new inherited constraints setup it needs rescheduling
        subtask.markForRescheduling();

        cancelAndResultFeedback && cancelAndResultFeedback(function() {
            if (originalParent) {
                originalParent.insertChild(originalIndex, subtask);
            }
            else {
                me.removeChild(subtask);
            }

            wasLeaf && me.set('leaf', true);
            wasLeaf && segments && me.setSegmentsWithoutPropagation(segments);

        }, subtask);

        // Changes propagation will be collected using affected parents as the source points
        if (!originalParent) {
            propagationSources = subtask;
        }
        else if (me !== originalParent && me.getTaskStore(true) === originalParent.getTaskStore(true)) {
            propagationSources = [subtask, originalParent];
        }

        return propagationSources;
    },


    /**
     * @propagating
     * Constraints aware removes the passed subtask from this task child nodes.
     *
     * @param {Gnt.model.Task} [subtask] The subtask to remove
     * @param {Function} [callback] Callback function to call after the subtask has been removed and changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    removeSubtask : function(subtask, callback) {
        var me = this,
            cancelFn;

        // if the subtask is already removed then we have nothing to do
        if (me.indexOf(subtask) !== -1) {
            me.propagateChanges(
                function() {
                    return me.removeSubtaskWithoutPropagation(subtask, function cancelFeedback(fn) {
                        cancelFn = fn;
                    });
                },
                function onPropagationComplete(cancelChanges, affectedTasks) {
                    cancelChanges && cancelFn && cancelFn();
                    callback && callback(cancelChanges, affectedTasks);
                }
            );
        }
        else {
            callback && callback(false, {});
        }
    },

    removeSubtaskWithoutPropagation : function(subtask, cancelFeedback) {
        var me = this,
            indexOfSubtask = me.indexOf(subtask),
            subtree,
            dependencyStore,
            assignmentStore,
            dependencies,
            assignments,
            dependenciesIndices,
            assignmentsIndices,
            i, len, r;

        // <debug>
        indexOfSubtask != -1 ||
            Ext.Error.raise("Can't remove subtask `" + subtask.getId() + "` from task `" + me.getId() + "` subtask is not a child of the task!");
        // </debug>

        dependencyStore     = me.getDependencyStore();
        assignmentStore     = me.getAssignmentStore();
        dependencies        = subtask.getAllDependencies();
        assignments         = assignmentStore && subtask.getAssignments();
        subtree             = [];
        dependenciesIndices = [];
        assignmentsIndices  = [];

        // Collecting all the descendants of the subtask.
        subtask.cascadeBy(function(node) {
            subtree.push(node);
        });

        // Collecting dependencies and assignments of the subtree
        for (i = 0, len = subtree.length; (dependencyStore || assignmentStore) && i < len; i++) {
            r = subtree[i];
            dependencyStore && (dependencies = dependencies.concat(r.getAllDependencies()));
            assignmentStore && (assignments  = assignments.concat(r.getAssignments()));
        }

        // Sorting dependencies in index order for future restoration
        dependencies = dependencyStore && Ext.Array.unique(dependencies);
        dependencies = dependencyStore && Ext.Array.sort(dependencies, function(a, b) {
            return dependencyStore.indexOf(a) < dependencyStore.indexOf(b) ? -1 : 1; // 0 is not an option here
        });
        // Collecting dependencies indices
        for (i = 0, len = dependencies && dependencies.length; dependencyStore && i < len; i++) {
            dependenciesIndices.push(dependencyStore.indexOf(dependencies[i]));
        }

        // Sorting assignments in index order for future restoration
        assignments = assignmentStore && Ext.Array.sort(assignments, function(a, b) {
            return assignmentStore.indexOf(a) < assignmentStore.indexOf(b) ? -1 : 1; // 0 is not an option here
        });
        // Collecting assignments indicies
        for (i = 0, len = assignments && assignments.length; assignmentStore && i < len; i++) {
            assignmentsIndices.push(assignmentStore.indexOf(assignments[i]));
        }

        // It's important to remove subtask/subtree first. If we will remove assignments/dependencies first then
        // subtree tasks might be adjusted and such adjustments might envolve pricy calculations which then will be
        // made void by removing a task they affecting.

        // Removing subtask (which will remove subtree as well)
        subtask = me.removeChild(subtask);

        // Removing all assignments
        assignmentStore && assignmentStore.remove(assignments);
        // Removing all dependencies
        dependencyStore && dependencyStore.remove(dependencies);

        // Converting self to leaf if required
        if (me.childNodes.length === 0 && me.convertEmptyParentToLeaf) {
            me.set('leaf', true);
        }

        cancelFeedback && cancelFeedback(function() {
            // Restoring everything back
            me.insertChild(indexOfSubtask, subtask);
            for (i = 0, len = assignments && assignments.length; assignmentStore && i < len; i++) {
                assignmentStore.insert(assignmentsIndices[i], assignments[i]);
            }
            for (i = 0, len = dependencies && dependencies.length; dependencyStore && i < len; i++) {
                dependencyStore.insert(dependenciesIndices[i], dependencies[i]);
            }
        });

        return me;
    },

    /**
     * @propagating
     * Adds the passed task as a successor and creates a new Finish-To-Start dependency between the two tasks.
     * @param {Gnt.model.Task} [successor] The new successor
     * @param {Function} [callback] Callback function to call after task has been added and changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     * @return {Gnt.model.Task} the successor task
     */
    addSuccessor : function(successor, callback) {
        var me = this,
            compatResult,
            cancelFn;

        me.propagateChanges(
            function() {
                return me.addSuccessorWithoutPropagation(successor, function cancelAndResultFeedback(fn, result) {
                    cancelFn = fn;
                    compatResult = result;
                });
            },
            function onPropagationComplete(cancelChanges, affectedTasks) {
                cancelChanges && cancelFn && cancelFn();
                callback && callback(cancelChanges, affectedTasks);
            }
        );

        return compatResult;
    },


    addSuccessorWithoutPropagation : function(successor, cancelAndResultFeedback) {
        var me         = this,
            parentNode = me.parentNode,
            index      = parentNode.indexOf(me),
            sources    = [],
            insertCancelFn,
            linkCancelFn;

        successor = successor || new me.self();

        // TODO: similar code is executed during propagation so we might want to remove this ..as long as
        // we use this method followed (or wrapped) by propagation
        if (me.getEndDate()) {

            successor.beginEdit();

            var calendar = successor.getOwnCalendar() || me.getProjectCalendar();

            // preserve provided "successor" duration
            if (!Ext.isNumber(successor.getDuration())) {
                successor.set(me.durationField, 1);
            }

            if (successor.isUnscheduled()) {
                successor.set(me.startDateField, calendar.skipNonWorkingTime(me.getEndDate()));
                if (!successor.getEndDate()) {
                    successor.set(me.endDateField, calendar.calculateEndDate(me.getEndDate(), successor.getDuration(), successor.getDurationUnit()));
                }
            }

            successor.endEdit();

        // if the task is not scheduled yet we need it to be processed in the propagation
        // (the task will be marked as needing re-scheduling in the linkToWithoutPropagation() call)
        } else {
            sources = [me];
        }

        sources = Ext.Array.merge(
            sources,
            // adding successor below
            parentNode.insertSubtaskWithoutPropagation(index + 1, successor, function(fn, result) {
                insertCancelFn = fn;
                successor      = result;
            }),
            // and link the task to the added successor
            me.linkToWithoutPropagation(successor, Gnt.model.Dependency.Type.EndToStart, function(fn) {
                linkCancelFn = fn;
            })
        );

        cancelAndResultFeedback && cancelAndResultFeedback(function() {
            linkCancelFn();
            insertCancelFn();
        }, successor);

        // return propagation sources
        return sources;
    },

    /**
     * @propagating
     * Adds the passed task as a milestone below this task.
     * @param {Gnt.model.Task} milestone (optional) The milestone
     * @param {Function} [callback] Callback function to call after task has been added and changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     * @return {Gnt.model.Task} the new milestone.
     */
    addMilestone : function(milestone, callback) {
        var me        = this,
            date      = me.getEndDate();

        if (!milestone) {
            milestone = new me.self();
        }
        else if (Ext.isObject(milestone) && !(milestone instanceof Gnt.model.Task)) {
            milestone = new me.self(milestone);
        }

        if (date && !milestone.isMilestone()) {
            milestone.calendar = milestone.calendar || me.getCalendar();
            milestone.setStartEndDate(date, date);
        }

        return me.addTaskBelow(milestone, callback);
   },

    /**
     * @propagating
     * Adds the passed task as a predecessor and creates a new dependency between the two tasks.
     * @param {Gnt.model.Task} [predecessor] The new predecessor
     * @param {Function} [callback] Callback function to call after task has been added and changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     * @return {Gnt.model.Task} the new predecessor
     */
    addPredecessor : function(predecessor, callback) {
        var me = this,
            compatResult,
            cancelFn;

        me.propagateChanges(
            function() {
                return me.addPredecessorWithoutPropagation(predecessor, function cancelAndResultFeedback(fn, result) {
                    cancelFn = fn;
                    compatResult = result;
                });
            },
            function onPropagationComplete(cancelChanges, affectedTasks) {
                cancelChanges && cancelFn();
                callback && callback(cancelChanges, affectedTasks);
            }
        );

        return compatResult;
    },


    addPredecessorWithoutPropagation : function(predecessor, cancelAndResultFeedback) {
        var me         = this,
            parentNode = me.parentNode,
            index      = parentNode.indexOf(me),
            sources    = [],
            insertCancelFn,
            linkCancelFn;

        predecessor = predecessor || new me.self();

        if (me.getStartDate()) {
            predecessor.beginEdit();

            // preserve provided "predecessor" duration
            if (!Ext.isNumber(predecessor.getDuration())) {
                predecessor.set(me.durationField, 1);
            }

            if (predecessor.isUnscheduled()) {
                var calendar = predecessor.getOwnCalendar() || me.getProjectCalendar();
                predecessor.set(me.startDateField, calendar.calculateStartDate(me.getStartDate(), predecessor.getDuration(), predecessor.getDurationUnit()));
                predecessor.set(me.endDateField, calendar.skipNonWorkingTime(me.getStartDate()));
            }

            predecessor.endEdit();

        // if the task is not scheduled yet we need it to be processed in the propagation
        // (the task will be marked as needing re-scheduling in the linkToWithoutPropagation() call)
        } else {
            sources = [me];
        }

        sources = Ext.Array.merge(
            sources,
            // add predecessor
            parentNode.insertSubtaskWithoutPropagation(index, predecessor, function(fn, result) {
                insertCancelFn = fn;
                predecessor    = result;
            }),
            // ... and link it to the task
            predecessor.linkToWithoutPropagation(me, Gnt.model.Dependency.Type.EndToStart, function(fn) {
                linkCancelFn   = fn;
            })
        );

        cancelAndResultFeedback && cancelAndResultFeedback(function() {
            linkCancelFn();
            insertCancelFn();
        }, predecessor);

        // return propagation sources
        return sources;
    },

    /**
     * Returns all the successor tasks of this task
     *
     * @return {Gnt.model.Task[]}
     */
    getSuccessors: function () {
        var deps    = this.successors,
            res     = [];

        for (var i = 0, len = deps.length; i < len; i++) {
            var task = deps[i].getTargetTask(this.getTaskStore());

            if (task) res.push(task);
        }

        return res;
    },

    /**
     * Returns all the predecessor tasks of a this task.
     *
     * @return {Gnt.model.Task[]}
     */
    getPredecessors: function () {
        var deps    = this.predecessors,
            res     = [];

        for (var i = 0, len = deps.length; i < len; i++) {
            var task = deps[i].getSourceTask(this.getTaskStore());

            if (task) res.push(task);
        }

        return res;
    },

    /**
     * @propagating
     * Adds the passed task (or creates a new task) before itself.
     * @param {Gnt.model.Task/Object} [task] The task to add (or its configuration).
     * @param {Function} [callback] Callback function to call after task has been added and changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     * @return {Gnt.model.Task} the newly added task
     */
    addTaskAbove : function (task, callback) {
        var me = this,
            parentNode = me.parentNode,
            index = parentNode.indexOf(me),
            compatResult,
            cancelFn;

        task = task || new me.self();

        me.propagateChanges(
            function() {
                return parentNode.insertSubtaskWithoutPropagation(index, task, function cancelAndResultFeedback(fn, result) {
                    cancelFn = fn;
                    compatResult = result;
                });
            },
            function onPropagationComplete(cancelChanges, affectedTasks) {
                cancelChanges && cancelFn();
                callback && callback(cancelChanges, affectedTasks);
            }
        );

        return compatResult;
    },

    /**
     * @propagating
     * Adds the passed task (or creates a new task) after itself
     * @param {Gnt.model.Task} task (optional) The task to add
     * @param {Function} [callback] Callback function to call after task has been added and changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     * @return {Gnt.model.Task} the newly added task
     */
    addTaskBelow : function (task, callback) {
        var me = this,
            parentNode = me.parentNode,
            index = parentNode.indexOf(me) + 1,
            compatResult,
            cancelFn;

        task = task || new me.self();

        me.propagateChanges(
            function() {
                return parentNode.insertSubtaskWithoutPropagation(index, task, function cancelAndResultFeedback(fn, result) {
                    cancelFn = fn;
                    compatResult = result;
                });
            },
            function onPropagationComplete(cancelChanges, affectedTasks) {
                cancelChanges && cancelFn();
                callback && callback(cancelChanges, affectedTasks);
            }
        );

        return compatResult;
    },

    // Returns true if this task model is 'above' the passed task model
    isAbove : function(otherTask) {
        var me          = this,
            minDepth    = Math.min(me.data.depth, otherTask.data.depth);

        var current     = this;

        // Walk upwards until tasks are on the same level
        while (current.data.depth > minDepth) {
            current     = current.parentNode;

            if (current == otherTask) return false;
        }
        while (otherTask.data.depth > minDepth) {
            otherTask   = otherTask.parentNode;

            if (otherTask == me) return true;
        }

        // At this point, depth of both tasks should be identical.
        // Walk up to find common parent, to be able to compare indexes
        while (otherTask.parentNode !== current.parentNode) {
            otherTask   = otherTask.parentNode;
            current     = current.parentNode;
        }

        return otherTask.data.index > current.data.index;
    },

    /**
     * Cascades the children of a task. The given function is not called for this node itself.
     * @param {Function} fn The function to call for each child
     * @param {Object} scope The 'this' object to use for the function, defaults to the current node.
     */
    cascadeChildren : function(fn, scope) {
        var me = this;

        if (me.isLeaf()) return;

        var childNodes      = this.childNodes;

        for (var i = 0, len = childNodes.length; i < len; i++) childNodes[ i ].cascadeBy(fn, scope);
    },

    /**
     * Returns whether the task is critical or not.
     * The task is __critical__ if there is zero or less than zero {@link #getTotalSlack total slack}.
     * This means that if the task is delayed, successor tasks and the project finish date are delayed.
     * @return {Boolean} Returns `true` if the task is critical and `false` if it's not.
     */
    isCritical : function () {
        return this.getTotalSlack() <= 0;
    },


    /**
     * Returns the _start slack_ of this task.
     * The _start slack_ is calculated as the duration between
     * the {@link #getEarlyStartDate Early Start} and {@link #getLateStartDate Late Start} dates.
     * The value is used to calculate _total slack_.
     *
     * @param {String} unit The time unit used to calculate the slack.
     * @return {Number} The _start slack_ of this task.
     */
    getStartSlack : function (unit) {
        return this.calculateStartSlack({ unit : unit });
    },

    calculateSlackByDates : function (earlyDate, lateDate, unit) {
        var taskStore = this.getTaskStore(true),
            result;

        // is the task doesn't belong to a task store we cannot calculate its slack
        if (taskStore && earlyDate && lateDate) {
            var sign = 1;

            // flip dates if needed
            if (earlyDate > lateDate) {
                var tmp   = earlyDate;
                earlyDate = lateDate;
                lateDate  = tmp;

                sign      = -1;
            }

            // slack takes into account only working period of time
            result = this.getCalendar().calculateDuration(earlyDate, lateDate, unit || Sch.util.Date.DAY);
            if (result) result *= sign;
        }

        return result;
    },

    calculateStartSlack : function (options) {
        options = options || {};

        options.limitByConstraints = options.limitByConstraints === true;

        return this.calculateSlackByDates(this.getEarlyStartDate(options), this.getLateStartDate(options), options.unit);
    },

    /**
     * Returns the _end slack_ of this task.
     * The _end slack_ is calculated as the duration between
     * the {@link #getEarlyEndDate Early End} and {@link #getLateEndDate Late End} dates.
     * The value is used to calculate _total slack_.
     *
     * @param {String} unit The time unit used to calculate the slack.
     * @return {Number} The _end slack_ of this task.
     */
    getEndSlack : function (unit) {
        return this.calculateEndSlack({ unit : unit });
    },

    calculateEndSlack : function (options) {
        options = options || {};

        options.limitByConstraints = options.limitByConstraints === true;

        return this.calculateSlackByDates(this.getEarlyEndDate(options), this.getLateEndDate(options), options.unit);
    },

    calculateSlack : function (options) {
        options = options || {};

        var store = this.getTaskStore(true),
            result;

        // is the task doesn't belong to a task store we cannot calculate its slack
        if (store) {
            var startSlack = this.calculateStartSlack(options),
                // for summary tasks start slack might differ from the end slack value
                endSlack   = this.isLeaf() ? startSlack : this.calculateEndSlack(options);

            result = Math.min(startSlack, endSlack);
        }

        return result;
    },

    /**
     * Returns the _total slack_ (or _total float_) of this task.
     * The _total slack_ is the amount of time that this task can be delayed without causing a delay
     * to the project end.
     *
     * @param {String} unit The time unit used to calculate the slack.
     * @return {Number} The _total slack_ of this task.
     */
    getTotalSlack : function (unit) {
        return this.calculateSlack({ unit : unit || Sch.util.Date.DAY });
    },


    /**
     * Returns the _free slack_ (or _free float_) of this task.
     * The _free slack_ is the amount of time that this task can be delayed without causing a delay
     * to any of its successors.
     *
     * @param {String} unit The time unit used to calculate the slack.
     * @return {Number} The _free slack_ of this task.
     */
    getFreeSlack : function (unit) {
        unit = unit || Sch.util.Date.DAY;

        var me        = this,
            taskStore = me.getTaskStore(true),
            result;

        if (taskStore) {
            // Academic definition of Free Slack is something like: duration between successors minimal early start (ES) and the task early finish (EF).
            // Which is really far from the real life. It doesn't cover constraints, summary tasks, dufferent dependency types etc.

            var maxAllowedByConstraints, constraintLimits;

            if (taskStore.scheduleByConstraints && (constraintLimits = me.getInheritedConstraintRestrictions({ translateTo : 'endDate'}))) {

                // "Must start/finish on" is used which means the task cannot be moved - so slack is zero
                if (constraintLimits.startDate || constraintLimits.endDate) {
                    return 0;

                // if there is a late position limitation
                } else if (constraintLimits.max) {
                    maxAllowedByConstraints = constraintLimits.max.endDate;
                }
            }

            var options = { skipNonWorkingTime : false, limitByConstraints : false },
                endDate = me.getEndDate();

            // make sure we have a date to calculate based on
            if (endDate) {
                // get finish date allowed by successors
                var maxAllowedBySuccessors = me.getOutgoingDependenciesConstraintContext(Ext.apply(options, {
                    // this option will force to use successors end dates (instead of late end dates, by default)
                    shallow : true
                }));

                // Free Slack is duration between task EndDate and minimum of:
                // 1) max end date allowed by successors (or project end if no successors)
                // 2) max end date allowed by task constraints (own plus parent ones)
                result = me.calculateSlackByDates(
                    endDate,
                    Sch.util.Date.min(maxAllowedBySuccessors ? maxAllowedBySuccessors.endDate : me.getProjectEndDate() || endDate, maxAllowedByConstraints || Sch.util.Date.MAX_VALUE),
                    unit
                );
            }
        }

        return result;
    },

    endDateToStartDate : function (endDate) {
        var duration, result;

        // if the task is effort dirven and effort is provided
        if (this.isEffortDriven() && this.get(this.effortField) !== undefined) {
            result = this.calculateEffortDrivenStartDate(endDate, this.getEffort());
        } else {

            if (this.isSegmented()) {
                duration = this.calculateDuration(this.getStartDate(), this.getEndDate(), null, { segments : false });
            } else {
                duration = this.getDuration();
            }

            result = this.calculateStartDate(endDate, duration, null, { segments : false });
        }

        return result;
    },


    startDateToEndDate : function (startDate) {
        var result, duration;

        // if the task is effort dirven and effort is provided
        if (this.isEffortDriven() && this.get(this.effortField) !== undefined) {
            result = this.calculateEffortDrivenEndDate(startDate, this.getEffort());
        } else {

            if (this.isSegmented()) {
                duration = this.calculateDuration(this.getStartDate(), this.getEndDate(), null, { segments : false });
            } else {
                duration = this.getDuration();
            }

            result = this.calculateEndDate(startDate, duration, null, { segments : false });
        }

        return result;
    },


    getInheritedConstraintRestrictions : function (options) {
        options = options || {};

        var me              = this,
            translateTo     = options.translateTo || 'startDate',
            shallow         = Boolean(options.shallow),
            otherSide       = translateTo == 'startDate' ? 'endDate' : 'startDate',
            flipSideFn      = translateTo == 'startDate' ? me.endDateToStartDate : me.startDateToEndDate,
            lateDate        = Sch.util.Date.MAX_VALUE,
            earlyDate       = Sch.util.Date.MIN_VALUE,
            result;

        me.bubble(function (task) {

            var constraints = task.getConstraintClasses();

            for (var i = 0; i < constraints.length; i++) {

                var constraint   = constraints[i],
                    restrictions = constraint && constraint.getRestrictions(task),
                    dt;

                if (restrictions) {
                    // minimal allowed start/end dates
                    if (restrictions.min) {
                        dt = restrictions.min[translateTo] || restrictions.min[otherSide] && flipSideFn.call(me, restrictions.min[otherSide]);
                        // get maximum of such values
                        if (dt && (dt > earlyDate)) earlyDate = dt;

                    // maximal allowed start/end dates
                    } else if (restrictions.max) {
                        dt = restrictions.max[translateTo] || restrictions.max[otherSide] && flipSideFn.call(me, restrictions.max[otherSide]);
                        // get minimum of such values
                        if (dt && (dt < lateDate)) lateDate = dt;

                    // check for MSO/MFO
                    } else if (restrictions.startDate || restrictions.endDate) {
                        // TODO: do we need to swap end/start dates here??
                        result = restrictions;
                        return false;
                    }
                }
            }

            if (shallow) return false;
        });

        if (!result) {
            // if the earliest possible date is found
            if (earlyDate - Sch.util.Date.MIN_VALUE) {
                result                  = {};
                result.min              = {};
                result.min[translateTo] = earlyDate;
            }
            // if the latest possible date is found
            if (lateDate - Sch.util.Date.MAX_VALUE) {
                result                  = result || {};
                result.max              = {};
                result.max[translateTo] = lateDate;
            }
        }

        return result;
    },

    getIncomingDependenciesConstraintContext : function (options) {
        options = options || {};

        var me                  = this,
            deep                = !options.shallow,
            deps                = me.getIncomingDependencies(true),
            depType             = Gnt.model.Dependency.Type,
            translateTo         = options.translateTo || 'startDate',
            swapDatesFn         = translateTo == 'startDate' ? me.endDateToStartDate : me.startDateToEndDate,
            getEarlyStartDateFn = deep ? me.getEarlyStartDate : me.getStartDate,
            getEarlyEndDateFn   = deep ? me.getEarlyEndDate : me.getEndDate,
            getLateStartDateFn  = deep ? me.getLateStartDate : me.getStartDate,
            getLateEndDateFn    = deep ? me.getLateEndDate : me.getEndDate,
            parentNode          = options.parentNode,
            taskStore           = options.taskStore || me.getTaskStore(true),
            scheduleBackwards   = me.getProjectScheduleBackwards(taskStore),
            fetchAll            = options.fetchAll,
            getStartDateFn, getEndDateFn, result, resultDate, dt;

        // for nested calls we never want to enumerate all the dependencies
        options.fetchAll = false;

        // a task inherits its parents incoming dependencies restrictions
        if (!options.ignoreParents) {
            deps = deps.concat(me.getParentsIncomingDependencies(parentNode));
        }

        // Early Start Date is the largest of Early Finish Dates of the preceding tasks
        for (var i = 0, l = deps.length; i < l; i++) {

            var dependency = deps[i],
                fromTask   = dependency.getSourceTask(),
                swapDate   = false,
                dependencyCalendar;

            if (fromTask && (!parentNode || fromTask.isAncestor(parentNode))) {

                // for ALAP tasks in FW projects we use Late dates (if Late dates can be calculated)
                if (!scheduleBackwards && fromTask.isContraryScheduled(taskStore, null, scheduleBackwards) && fromTask.areLateDatesAvailable()) {
                    getStartDateFn = getLateStartDateFn;
                    getEndDateFn   = getLateEndDateFn;
                } else {
                    getStartDateFn = getEarlyStartDateFn;
                    getEndDateFn   = getEarlyEndDateFn;
                }

                // get calendar instance to use for lag calculations
                dependencyCalendar = dependency.getCalendar(taskStore);

                switch (dependency.getType()) {
                    case depType.StartToStart:
                        dt       = getStartDateFn.call(fromTask, options);
                        swapDate = translateTo == 'endDate';
                        break;
                    case depType.StartToEnd:
                        dt       = getStartDateFn.call(fromTask, options);
                        // If we are working with task end date restricting dependency we'll convert it to start date later (after we take lag into account).
                        // #5218 covered with 033_task_lag
                        swapDate = translateTo == 'startDate';
                        break;
                    case depType.EndToStart:
                        dt       = getEndDateFn.call(fromTask, options);
                        swapDate = translateTo == 'endDate';
                        break;
                    case depType.EndToEnd:
                        dt       = getEndDateFn.call(fromTask, options);
                        // If we are working with task end date restricting dependency we'll convert it to start date later (after we take lag into account).
                        // #5218 covered with 033_task_lag
                        swapDate = translateTo == 'startDate';
                        break;
                }

                // if we've got some date
                if (dt) {
                    // let's plus dependency Lag (if any)
                    var lag = dependency.getLag();

                    if (lag) dt = dependencyCalendar.skipWorkingTime(dt, lag, dependency.getLagUnit());

                    // if we got the end date restriction we turn it to the start date one
                    if (swapDate) dt = swapDatesFn.call(me, dt);

                    // if it was asked to return all the dependencies restrictions as well
                    if (fetchAll) {
                        result = result || { all : [] };

                        var _dt = dt;
                        var obj = {
                            constrainingTask       : fromTask,
                            constrainingDependency : dependency
                        };

                        // skip non-working time here if requested
                        if (options.skipNonWorkingTime && !me.isMilestone()) {
                            _dt = me.skipNonWorkingTime(_dt, true);
                        }


                        obj[translateTo] = _dt;

                        result.all.push(obj);
                    }

                    if ((dt > resultDate) || !resultDate) {
                        resultDate = dt;

                        result = result || {};

                        result[translateTo]           = dt;
                        result.constrainingTask       = fromTask;
                        result.constrainingDependency = dependency;
                    }
                }
            }
        }

        // restore initial "fetchAll" option state
        options.fetchAll = fetchAll;

        // skip non-working time here if requested
        if (options.skipNonWorkingTime && result && !me.isMilestone()) {
            result[translateTo] = me.skipNonWorkingTime(result[translateTo], true);
        }


        return result;
    },

    getOutgoingDependenciesConstraintContext : function (options) {
        options = options || {};

        var me                  = this,
            depth               = options.depth,
            shallow             = Ext.isNumber(depth) ? depth === 0 : options.shallow,
            dependencies        = me.getOutgoingDependencies(true),
            depType             = Gnt.model.Dependency.Type,
            translateTo         = options.translateTo || 'endDate',
            swapDatesFn         = translateTo == 'endDate' ? me.startDateToEndDate : me.endDateToStartDate,
            getLateStartDateFn  = options.getLateStartDateFn || (shallow ? me.getStartDate : me.getLateStartDate),
            getLateEndDateFn    = options.getLateEndDateFn || (shallow ? me.getEndDate : me.getLateEndDate),
            getEarlyStartDateFn = options.getEarlyStartDateFn || (shallow ? me.getStartDate : me.getEarlyStartDate),
            getEarlyEndDateFn   = options.getEarlyEndDateFn || (shallow ? me.getEndDate : me.getEarlyEndDate),
            parentNode          = options.parentNode,
            taskStore           = options.taskStore || me.getTaskStore(true),
            scheduleBackwards   = me.getProjectScheduleBackwards(taskStore),
            fetchAll            = options.fetchAll,
            getStartDateFn,
            getEndDateFn,
            result,
            resultDate,
            dt;

        if (Ext.isNumber(depth)) {
            options.depth--;
        }

        // for nested calls we never want to enumerate all the dependencies
        options.fetchAll = false;

        // a task inherits its parents dependencies restrictions
        if (!options.ignoreParents) {
            dependencies = dependencies.concat(me.getParentsOutgoingDependencies(parentNode));
        }

        // Late Finish Date is the smallest of Late Start Dates of succeeding tasks
        for (var i = 0, l = dependencies.length; i < l; i++) {

            var dependency = dependencies[i],
                toTask     = dependency.getTargetTask(),
                swapDate   = false,
                dependencyCalendar;

            if (toTask && (!parentNode || toTask.isAncestor(parentNode))) {

                // in BW projects for ASAP tasks we use Early dates (if Early dates can be calculated)
                if (scheduleBackwards && toTask.isContraryScheduled(taskStore, null, scheduleBackwards) && toTask.areEarlyDatesAvailable()) {
                    getStartDateFn = getEarlyStartDateFn;
                    getEndDateFn   = getEarlyEndDateFn;
                } else {
                    getStartDateFn = getLateStartDateFn;
                    getEndDateFn   = getLateEndDateFn;
                }

                // get calendar instance to use for lag calculations
                dependencyCalendar = dependency.getCalendar(taskStore);

                switch (dependency.getType()) {
                    case depType.StartToStart:
                        dt       = getStartDateFn.call(toTask, options);
                        swapDate = translateTo == 'endDate';
                        break;
                    case depType.StartToEnd:
                        dt       = getEndDateFn.call(toTask, options);
                        swapDate = translateTo == 'endDate';
                        break;
                    case depType.EndToStart:
                        dt       = getStartDateFn.call(toTask, options);
                        swapDate = translateTo == 'startDate';
                        break;
                    case depType.EndToEnd:
                        dt       = getEndDateFn.call(toTask, options);
                        swapDate = translateTo == 'startDate';
                        break;
                }

                // if we've got some date
                if (dt) {
                    // minus dependency Lag
                    var lag = dependency.getLag();

                    if (lag) dt  = dependencyCalendar.skipWorkingTime(dt, -lag, dependency.getLagUnit());

                    // swap dates using duration value
                    if (swapDate) dt = swapDatesFn.call(me, dt);

                    // if it was asked to return all the dependencies restrictions as well
                    if (fetchAll) {
                        result = result || { all : [] };

                        var _dt = dt;

                        // skip non-working time here if requested
                        if (options.skipNonWorkingTime) {
                            _dt = me.skipNonWorkingTime(_dt, false);
                        }

                        var _obj = {
                            constrainingTask       : toTask,
                            constrainingDependency : dependency
                        };

                        _obj[translateTo] = _dt;

                        result.all.push(_obj);
                    }

                    if (!resultDate || (dt < resultDate)) {

                        resultDate = dt;

                        result = result || {};

                        result[translateTo]           = dt;
                        result.constrainingTask       = toTask;
                        result.constrainingDependency = dependency;
                    }
                }
            }
        }

        // restore initial "fetchAll" option state
        options.fetchAll = fetchAll;

        // skip non-working time here if requested
        if (options.skipNonWorkingTime && result && !me.isMilestone()) {
            result[translateTo] = me.skipNonWorkingTime(result[translateTo], false);
        }

        return result;
    },


    getEarlyLateDateCacheKey : function (prefix, options) {
        if (typeof options == 'string') return options;

        return ''+ prefix +
            '-'+ this.internalId +
            '-'+ (options.skipNonWorkingTime !== false) +
            '-'+ Boolean(options.shallow) +
            '-'+ (options.limitByConstraints !== false) +
            '-'+ Boolean(options.ignoreConstraint) +
            '-'+ Boolean(options.treatAsLeaf) +
            // these are used in getIncomingDependenciesConstraintContext / getOutgoingDependenciesConstraintContext
            // which in turn affects early/late dates
            '-'+ Boolean(options.ignoreParents) +
            '-'+ (options.parentNode && options.parentNode.getId());
    },

    hasEarlyDateCachedValue : function (prefix, options) {
        var me    = this,
            store = options.taskStore || me.getTaskStore(true);

        return store.hasEarlyDateCachedValue(me.getEarlyLateDateCacheKey(prefix, options));
    },

    getEarlyDateCachedValue : function (prefix, options) {
        var me    = this,
            store = options.taskStore || me.getTaskStore(true);

        return store.getEarlyDateCachedValue(me.getEarlyLateDateCacheKey(prefix, options));
    },

    hasLateDateCachedValue : function (prefix, options) {
        var me    = this,
            store = options.taskStore || me.getTaskStore(true);

        return store.hasLateDateCachedValue(me.getEarlyLateDateCacheKey(prefix, options));
    },

    getLateDateCachedValue : function (prefix, options) {
        var me    = this,
            store = options.taskStore || me.getTaskStore(true);

        return store.getLateDateCachedValue(me.getEarlyLateDateCacheKey(prefix, options));
    },

    processEarlyStartDateValue : function (result, context) {
        var me       = this,
            options  = context.options,
            store    = options.taskStore || me.getTaskStore(true),
            maxValue = context.maxValue;

        if (result && !context.skipValueProcessing) {
            if (context.options.skipNonWorkingTime && me.getDuration()) {
                result = me.skipNonWorkingTime(result, true);
            }

            // and finally if result is limited with allowed maximum
            if (maxValue && store.limitEarlyLateDatesMutually && result >= maxValue) {
                result = maxValue;
            }
        }

        return result;
    },

    getEarlyStartDateDefaultValue : function (options) {
        var me      = this,
            store   = options.taskStore || me.getTaskStore(true),
            project = me.getProject();

        return project ? project.getStartDate() : store.getProjectStartDate();
    },

    /**
     * Returns the _early start date_ of this task.
     * The _early start date_ is the earliest possible start date of a task.
     * This value is calculated based on the earliest end dates of the task predecessors.
     * If the task has no predecessors, its start date is the early start date.
     *
     * @return {Date} The early start date.
     */
    getEarlyStartDate : function (options) {
        options = options || {};

        delete options.translateTo;

        var me                 = this,
            store              = options.taskStore || me.getTaskStore(true),
            skipNonWorkingTime = (typeof options.skipNonWorkingTime == 'boolean' ? options.skipNonWorkingTime : store.skipWeekendsDuringDragDrop),
            updateCache        = options.updateCache,
            treatAsLeaf        = options.treatAsLeaf,
            cacheKey,
            cachedResult;

        if (!updateCache) {
            cacheKey     = me.getEarlyLateDateCacheKey('es', options);
            if (store.hasEarlyDateCachedValue(cacheKey)) return store.getEarlyDateCachedValue(cacheKey);
        }

        if (!me.areEarlyDatesAvailable()) return;

        // For nested calls in this method we don't want excessive not working time skipping (too expensive).
        // But for milestones we have to do that since otherwise it won't be placed correctly.
        // Since we don't skip non-working time for milestones.
        if (!me.isMilestone()) {
            options.skipNonWorkingTime = false;
        }

        options.updateCache = false;
        // treatAsLeaf should work only for this exact task
        options.treatAsLeaf = false;

        var limitByConstraints  = options.limitByConstraints !== false,
            internalId          = me.internalId,
            skipValueProcessing = false,
            constraintLimits, dependenciesLimits,
            context, max, result;

        // If we are in the "full dependencies scan" mode
        // let's protect from infinite loops (in case of bad data structure)
        // by storing the flag informing that we stepped into "getEarlyStartDate" method for the task
        // till this method is done
        if (!options.shallow) {
            context = options.context || { calls : {} };
            context.calls.getEarlyStartDate = context.calls.getEarlyStartDate || {};

            if (context.calls.getEarlyStartDate[internalId]) {
                // <debug>
                Ext.log("Can't calculate Early Start Date for the "+ (me.getId() || me.getName()) +" task, tasks build a cycle");
                // </debug>
                return;
            }

            context.calls.getEarlyStartDate[internalId] = true;
            options.context = context;
        }

        // for a task outside a task store, a project, a manually scheduled or completed task we simply return start date
        if (!store || me.isProject || me.isManuallyScheduled() || me.isCompleted()) {
            result = me.getStartDate();
            skipValueProcessing = true;

        // we can also use a value w/ not skipped non-working time (if cached)
        } else if (!updateCache && me.hasEarlyDateCachedValue('es', options)) {
            result = me.getEarlyDateCachedValue('es', options);

        // for a parent task we take the minimum Early Start from its children
        } else if (me.childNodes.length && !treatAsLeaf) {

            Ext.each(me.childNodes, function (child) {
                var dt = child.getEarlyStartDate(options);

                if (dt && !result || dt < result) {
                    result = dt;
                }
            });

        } else {

            var ignoreDependencies = false,
                ignoreConstraint   = options.ignoreConstraint === true || !store.scheduleByConstraints;

            if (!ignoreConstraint) {

                // take the task constraint into account
                if (constraintLimits = me.getInheritedConstraintRestrictions()) {

                    // if exact start (or end) dates are passed we use those values (Must-Start-On/Must-Finish-On cases)
                    if (constraintLimits.startDate) {
                        result = constraintLimits.startDate;
                        // Dependencies can be skipped since MSO is a non-flexible constraint
                        ignoreDependencies  = true;
                        // ..and we cannot change the constraint date value
                        skipValueProcessing = true;

                    } else if (constraintLimits.endDate) {
                        result = me.endDateToStartDate(constraintLimits.endDate);
                        // Dependencies can be skipped since MFO is a non-flexible constraint
                        ignoreDependencies = true;

                    // if minimal allowed start/end dates are provided
                    // we use them as Early Start date unless there are incoming dependencies found on next steps
                    } else {
                        if (constraintLimits.min) {
                            result = constraintLimits.min.startDate;
                        }
                        if (limitByConstraints && constraintLimits.max) {
                            max = constraintLimits.max.startDate;
                        }
                    }
                }
            }

            // get minimal allowed start date based on incoming dependencies
            if (!ignoreDependencies) {
                dependenciesLimits = me.getIncomingDependenciesConstraintContext(options);

                // TODO: BW compat ..this case can be removed when we make aligning by constraints non-optional
                if (ignoreConstraint && !dependenciesLimits && !result) {
                    result = me.getStartDate() || me.getEarlyStartDateDefaultValue(options);

                } else if (dependenciesLimits && (!result || dependenciesLimits.startDate > result)) {
                    result = dependenciesLimits.startDate;
                }
            }

            // We use project start date for tasks not limited w/ constraints or dependencies
            if (store.scheduleByConstraints && !result) {
                result = me.getEarlyStartDateDefaultValue(options);
            }
        }

        // restore flags back
        options.treatAsLeaf = treatAsLeaf;
        options.skipNonWorkingTime = skipNonWorkingTime;

        result = me.processEarlyStartDateValue(result, {
            options             : options,
            cacheKey            : cacheKey,
            maxValue            : max,
            skipValueProcessing : skipValueProcessing,
            dependencyLimits    : dependenciesLimits,
            constraintLimits    : constraintLimits
        });

        // store found value into the cache
        store.setEarlyDateCachedValue(cacheKey, result);

        // reset the "anti-loop" flag we set in the beginning
        if (context) delete context.calls.getEarlyStartDate[internalId];

        return result;
    },

    processEarlyEndDateValue : function (value, context) {
        var me       = this,
            result   = value,
            options  = context.options,
            store    = options.taskStore || me.getTaskStore(true),
            minValue = context.minValue,
            maxValue = context.maxValue;

        if (result && !context.skipValueProcessing) {
            // make sure it does not violate its allowed maximum
            if (maxValue && store.limitEarlyLateDatesMutually && result > maxValue) {
                result = maxValue;
            }

            // skip non working time backwards if requested (do this only if the value is greater than its allowed minimum)
            if (options.skipNonWorkingTime && me.getDuration() && (!minValue || result > minValue)) {
                result = me.skipNonWorkingTime(result, false);
            }

            // make sure the value does not violate its allowed minimum
            if (minValue && result < minValue) {
                result = minValue;
            }
        }

        return result;
    },


    /**
     * Returns the _early end date_ of the task.
     * The _early end date_ is the earliest possible end date of the task.
     * This value is calculated based on the earliest end dates of predecessors.
     * If the task has no predecessors then its end date is used as its earliest end date.
     *
     * @return {Date} The early end date.
     */
    getEarlyEndDate : function (options) {
        options = options || {};

        delete options.translateTo;

        var me                 = this,
            store              = options.taskStore || me.getTaskStore(true),
            skipNonWorkingTime = (typeof options.skipNonWorkingTime == 'boolean' ? options.skipNonWorkingTime : store.skipWeekendsDuringDragDrop),
            updateCache        = options.updateCache,
            treatAsLeaf        = options.treatAsLeaf,
            cacheKey           = me.getEarlyLateDateCacheKey('ee', options);

        if (!updateCache && store.hasEarlyDateCachedValue(cacheKey)) return store.getEarlyDateCachedValue(cacheKey);

        // treatAsLeaf should work only for this exact task
        options.treatAsLeaf = false;
        // for nested calls we don't need excessive not working time skipping
        options.skipNonWorkingTime = false;

        var limitByConstraints  = options.limitByConstraints !== false,
            internalId          = me.internalId,
            skipValueProcessing = false,
            ignoreDependencies  = false,
            constraintLimits, dependenciesLimits,
            result, context, min, max;

        // If we are in the "full dependencies scan" mode
        // let's protect from infinite loops (in case of bad data structure)
        // by storing the flag informing that we stepped into "getEarlyEndDate" method for the task
        // till this method is done
        if (!options.shallow) {
            context = options.context || { calls : {} };
            context.calls.getEarlyEndDate = context.calls.getEarlyEndDate || {};

            if (context.calls.getEarlyEndDate[internalId]) {
                // <debug>
                Ext.log("Can't calculate Early End Date for the "+ (me.getId() || me.getName()) +" task, tasks build a cycle");
                // </debug>
                return;
            }

            context.calls.getEarlyEndDate[internalId] = true;
            options.context = context;
        }

        if (!store) {
            result = me.getEndDate();
            skipValueProcessing = true;

        // we can also use a value w/ not skipped non-working time (if cached)
        } else if (!updateCache && me.hasEarlyDateCachedValue('ee', options)) {
            result = me.getEarlyDateCachedValue('ee', options);

        // for a project or a manually scheduled task we simply return its end date
        } else if (me.isProject || me.isManuallyScheduled() || me.isCompleted()) {
            result = me.getEndDate();

        // for a parent task we take the max Early Finish of its children
        } else if (me.childNodes.length && !treatAsLeaf) {

            Ext.each(me.childNodes, function (child) {
                var dt = child.getEarlyEndDate(options);

                if (dt && !result || dt > result) {
                    result = dt;
                }
            });

        } else {

            if (store.scheduleByConstraints && !options.ignoreConstraint) {

                // Take the task constraint into account.
                if (constraintLimits = me.getInheritedConstraintRestrictions({ translateTo : 'endDate' })) {

                    // if exact end date is passed we use those values (Must-Finish-On case)
                    if (constraintLimits.endDate) {
                        result = constraintLimits.endDate;
                        // Dependencies can be skipped since MFO is a non-flexible constraint
                        ignoreDependencies  = true;
                        // ..and we cannot change the constraint date value
                        skipValueProcessing = true;


                    } else if (constraintLimits.startDate) {
                        result = me.startDateToEndDate(constraintLimits.startDate);
                        // Dependencies can be skipped since MFO is a non-flexible constraint
                        ignoreDependencies = true;

                    // if minimal allowed start/end dates are provided
                    // we use them as Early Start date unless there are incoming dependencies found on next steps
                    } else {
                        if (constraintLimits.min) {
                            min = result = constraintLimits.min.endDate;
                        }
                        if (limitByConstraints && constraintLimits.max) {
                            max = constraintLimits.max.endDate;
                        }
                    }
                }
            }

            // get minimal allowed start date based on incoming dependencies
            if (!ignoreDependencies) {
                dependenciesLimits = me.getIncomingDependenciesConstraintContext(Ext.apply({ translateTo : 'endDate' }, options));

                if (dependenciesLimits && (!result || dependenciesLimits.endDate > result)) {
                    min = result = dependenciesLimits.endDate;
                }
            }
        }

        // If minimum & maximum are provided due to dependencies and (or) constraints setup
        // we check if minimum is less than maximum (this means constraints conflict).
        // And in this case we ignore minimum limit.
        if (min && max && min >= max) {
            min = null;
        }

        // restore flags back
        options.treatAsLeaf = treatAsLeaf;
        options.skipNonWorkingTime = skipNonWorkingTime;

        // Let's fall back to formula:
        // Early Finish Date = Early Start Date + duration
        // 1) If we couldn't calculate date based on constraints & dependencies (if the task has no incoming dependencies & constraints for example)
        // 2) in BW compatible mode
        if (!result) {
            var value = me.getEarlyStartDate(options);
            if (value) result = me.startDateToEndDate(value);

            // TODO: check if below approach can be used
            // var value = me.getProjectStartDate();
            // if (value) result = me.startDateToEndDate(value);
        }

        result = me.processEarlyEndDateValue(result, {
            options          : options,
            cacheKey         : cacheKey,
            minValue         : min,
            maxValue         : max,
            skipValueProcessing : skipValueProcessing,
            dependencyLimits : dependenciesLimits,
            constraintLimits : constraintLimits
        });

        // store found value into the cache
        store.setEarlyDateCachedValue(cacheKey, result);

        // reset the "anti-loop" flag we set in the beginning
        if (context) delete context.calls.getEarlyEndDate[internalId];

        return result;
    },

    processLateEndDateValue : function (value, context) {
        var me       = this,
            result   = value,
            options  = context.options,
            store    = options.taskStore || me.getTaskStore(true),
            minValue = context.minValue;

        if (result && !context.skipValueProcessing) {
            if (options.skipNonWorkingTime && me.getDuration()) {
                result = me.skipNonWorkingTime(result, false);
            }

            // and finally if result is limited by "minValue"
            if (minValue && store.limitEarlyLateDatesMutually && result < minValue) {
                result = minValue;
            }
        }

        return result;
    },

    getLateEndDateDefaultValue : function (options) {
        var me      = this,
            store   = options.taskStore || me.getTaskStore(true),
            project = me.getProject();

        return project ? project.getEndDate() : store.getProjectEndDate();
    },

    /**
     * Returns the _late end date_ of the task.
     * The _late end date_ is the latest possible end date of the task.
     * This value is calculated based on the latest start dates of its successors.
     * If the task has no successors, the project end date is used as its latest end date.
     *
     * @return {Date} The late end date.
     */
    getLateEndDate : function (options) {
        options = options || {};

        delete options.translateTo;

        var me                 = this,
            store              = options.taskStore || me.getTaskStore(true),
            skipNonWorkingTime = (typeof options.skipNonWorkingTime == 'boolean' ? options.skipNonWorkingTime : store.skipWeekendsDuringDragDrop),
            updateCache        = options.updateCache,
            treatAsLeaf        = options.treatAsLeaf,
            limitByConstraints = options.limitByConstraints !== false,
            cacheKey           = me.getEarlyLateDateCacheKey('le', options);

        if (!updateCache && store.hasLateDateCachedValue(cacheKey)) return store.getLateDateCachedValue(cacheKey);

        if (!me.areLateDatesAvailable()) return;

        // treatAsLeaf should work only for this exact task
        options.treatAsLeaf = false;
        // for nested calls we don't need excessive not working time skipping
        options.skipNonWorkingTime = false;

        options.updateCache = false;

        var internalId          = me.internalId,
            skipValueProcessing = false,
            constraintLimits, dependenciesLimits,
            result, context, min;

        // If we are in the "full dependencies scan" mode
        // let's protect from infinite loops (in case of bad data structure)
        // by storing the flag informing that we stepped into "getLateEndDate" method for the task
        // till this method is done
        if (!options.shallow) {
            context = options.context || { calls : {} };
            context.calls.getLateEndDate = context.calls.getLateEndDate || {};

            if (context.calls.getLateEndDate[internalId]) {
                // <debug>
                Ext.log("Can't calculate Late End Date for the '"+ (me.getId() || me.getName()) +"'' task, tasks build a cycle");
                // </debug>
                return;
            }

            context.calls.getLateEndDate[internalId] = true;
            options.context = context;
        }

        // for a project or a manually scheduled task we simply return its end date
        if (!store || me.isProject || me.isManuallyScheduled() || me.isCompleted()) {
            result = me.getEndDate();
            skipValueProcessing = true;

        // we can also use a value w/ not skipped non-working time (if cached)
        } else if (!updateCache && me.hasLateDateCachedValue('le', options)) {
            result = me.getLateDateCachedValue('le', options);

        // for parent task we take maximum Late Finish from its children
        } else if (me.childNodes.length) {

            Ext.each(me.childNodes, function (child) {
                var dt = child.getLateEndDate(options);

                if (dt && !result || dt > result) {
                    result = dt;
                }
            });

        } else {

            var ignoreConstraint   = options.ignoreConstraint === true || !store.scheduleByConstraints,
                ignoreDependencies = false;

            if (!ignoreConstraint) {
                // take the task constraint into account
                if (constraintLimits = me.getInheritedConstraintRestrictions({ translateTo : 'endDate' })) {
                    // if exact start (or end) dates are passed we use those values (Must-Start-On/Must-Finish-On cases)

                    if (constraintLimits.startDate) {
                        result = me.startDateToEndDate(constraintLimits.startDate);
                        ignoreDependencies = true;

                    } else if (constraintLimits.endDate) {
                        result = constraintLimits.endDate;
                        ignoreDependencies  = true;
                        skipValueProcessing = true;

                    // if maximal allowed start/end dates are provided
                    // we use them as Late End date unless there are outgoing dependencies found on next steps
                    } else {
                        if (constraintLimits.max) {
                            result = constraintLimits.max.endDate;
                        }
                        if (limitByConstraints && constraintLimits.min) {
                            min = constraintLimits.min.endDate;
                        }
                    }
                }
            }

            if (!ignoreDependencies) {
                dependenciesLimits = me.getOutgoingDependenciesConstraintContext(options);
                if (dependenciesLimits && (!result || dependenciesLimits.endDate < result)) {
                    result = dependenciesLimits.endDate;
                }
            }

            // We use project end date for tasks not limited w/ constraints or dependencies
            if (!result) {
                result = me.getLateEndDateDefaultValue(options);
            }
        }

        // restore flags back
        options.treatAsLeaf = treatAsLeaf;
        options.skipNonWorkingTime = skipNonWorkingTime;

        result = me.processLateEndDateValue(result, {
            options             : options,
            cacheKey            : cacheKey,
            minValue            : min,
            skipValueProcessing : skipValueProcessing,
            dependencyLimits    : dependenciesLimits,
            constraintLimits    : constraintLimits
        });

        // store found value into the cache
        store.setLateDateCachedValue(cacheKey, result);

        // reset the "anti-loop" flag we set in the beginning
        if (context) delete context.calls.getLateEndDate[internalId];

        return result;
    },

    processLateStartDateValue : function (value, context) {
        var me       = this,
            result   = value,
            options  = context.options,
            store    = options.taskStore || me.getTaskStore(true),
            minValue = context.minValue,
            maxValue = context.maxValue;

        // if we've got some resulting value
        if (result && !context.skipValueProcessing) {
            // make sure it does not violate allowed minimum
            if (minValue && store.limitEarlyLateDatesMutually && result < minValue) {
                result = minValue;
            }

            // skip non working time forward if requested (do this only if the value is less than its allowed maximum)
            if (options.skipNonWorkingTime && !me.isMilestone() && (!maxValue || result < maxValue)) {
                result = me.skipNonWorkingTime(result);
            }

            // make sure it does not violate allowed maximum
            if (maxValue && result > maxValue) {
                result = maxValue;
            }
        }

        return result;
    },

    /**
     * Returns the _late start date_ of the task.
     * The _late start date_ is the latest possible start date of this task.
     * This value is calculated based on the latest start dates of its successors.
     * If the task has no successors, this value is calculated as the _project end date_ minus the task duration
     * (_project end date_ is the latest end date of all the tasks in the taskStore).
     *
     * @return {Date} The late start date.
     */
    getLateStartDate : function (options) {
        options = options || {};

        delete options.translateTo;

        var me                 = this,
            store              = options.taskStore || me.getTaskStore(true),
            skipNonWorkingTime = (typeof options.skipNonWorkingTime == 'boolean' ? options.skipNonWorkingTime : store.skipWeekendsDuringDragDrop),
            treatAsLeaf        = options.treatAsLeaf,
            updateCache        = options.updateCache,
            limitByConstraints = options.limitByConstraints !== false,
            cacheKey           = me.getEarlyLateDateCacheKey('ls', options),
            skipValueProcessing = false,
            result;

        if (!updateCache && store.hasLateDateCachedValue(cacheKey)) return store.getLateDateCachedValue(cacheKey);

        // treatAsLeaf should work only for this exact task
        options.treatAsLeaf = false;
        // for nested calls we don't need excessive not working time skipping
        options.skipNonWorkingTime = false;

        var nonWorkingTimeSkipped = false,
            internalId = me.internalId,
            constraintLimits,
            min, max, context;

        // If we are in the "full dependencies scan" mode
        // let's protect from infinite loops (in case of bad data structure)
        // by storing the flag informing that we stepped into "getLateStartDate" method for the task
        // till this method is done
        if (!options.shallow) {
            context = options.context || { calls : {} };
            context.calls.getLateStartDate = context.calls.getLateStartDate || {};

            if (context.calls.getLateStartDate[internalId]) {
                // <debug>
                Ext.log("Can't calculate Late End Date for the '"+ (me.getId() || me.getName()) +"'' task, tasks build a cycle");
                // </debug>
                return;
            }

            context.calls.getLateStartDate[internalId] = true;
            options.context = context;
        }


        if (!store) {
            result = me.getStartDate();
            skipValueProcessing = true;

        // we can also use a value w/ not skipped non-working time (if cached)
        } else if (!updateCache && me.hasLateDateCachedValue('ls', options)) {
            result = me.getLateDateCachedValue('ls', options);

        // for a project or a manually scheduled task we simply return its start date
        } else if (me.isProject || me.isManuallyScheduled() || me.isCompleted())  {
            result = me.getStartDate();
            skipValueProcessing = true;

        // for parent task we take the minimal Late Start from its children
        } else if (me.childNodes.length) {

            Ext.each(me.childNodes, function (child) {
                var dt = child.getLateStartDate(options);

                if (dt && !result || dt < result) {
                    result = dt;
                }
            });

        // Late Start Date is Late Finish Date minus duration
        } else {

            var ignoreDependencies = false;

            if (store.scheduleByConstraints && !options.ignoreConstraint) {

                // Take the task constraint into account.
                if (constraintLimits = me.getInheritedConstraintRestrictions({ translateTo : 'startDate' })) {

                    // Must-Start-On (MSO) constraint
                    if (constraintLimits.startDate) {
                        result                = constraintLimits.startDate;
                        // dependencies can be skipped since the constraint is not flexible
                        ignoreDependencies    = true;
                        // ..and we should use the constraint date value
                        nonWorkingTimeSkipped = true;

                    // Must-Finish-On (MFO)
                    } else if (constraintLimits.endDate) {
                        result             = me.endDateToStartDate(constraintLimits.endDate);
                        // dependencies can be skipped since MFO is a non-flexible constraint
                        ignoreDependencies = true;

                    // if maximum allowed start/end dates are provided
                    // we use them as Late Start date (unless there are incoming dependencies found on next steps)
                    } else {
                        if (constraintLimits.max) {
                            max = result = constraintLimits.max.startDate;
                        }
                        if (limitByConstraints && constraintLimits.min) {
                            min = constraintLimits.min.startDate;
                        }
                    }
                }
            }

            // get maximum allowed start date based on outgoing dependencies
            if (!ignoreDependencies) {
                var dependenciesLimits = me.getOutgoingDependenciesConstraintContext(Ext.apply({ translateTo : 'startDate' }, options));

                if (dependenciesLimits && (!result || dependenciesLimits.startDate < result)) {
                    max = result = dependenciesLimits.startDate;
                }
            }

        }

        // restore flags back
        options.treatAsLeaf = treatAsLeaf;
        options.skipNonWorkingTime = skipNonWorkingTime;

        if (!result) {
            var value = me.getLateEndDate(options);
            // ..subtract duration
            if (value) result = me.endDateToStartDate(value);
        }

        result = me.processLateStartDateValue(result, {
            minValue            : min,
            maxValue            : max,
            skipValueProcessing : skipValueProcessing,
            options             : options,
            cacheKey            : cacheKey,
            constraintLimits    : constraintLimits
        });

        // store found value into the cache
        store.setLateDateCachedValue(cacheKey, result);

        // reset the "anti-loop" flag we set in the beginning
        if (context) delete context.calls.getLateStartDate[internalId];

        return result;
    },


    getTopParent : function (all) {
        var root    = this.getTaskStore().getRoot(),
            p       = this,
            path    = [ this ],
            result;

        while (p) {
            if (p === root) return all ? path : result;

            path.push(p);

            result  = p;
            p       = p.parentNode;
        }
    },

    isContraryScheduled : function (taskStore, project, scheduleBackwards) {
        if (typeof scheduleBackwards !== 'boolean') {
            scheduleBackwards = this.getProjectScheduleBackwards(taskStore, project);
        }
        return this.getConstraintType() == (scheduleBackwards ? 'assoonaspossible' : 'aslateaspossible');
    },

    areEarlyDatesAvailable : function () {
        var me        = this,
            taskStore = me.getTaskStore(true),
            project   = me.getProject();

        return !(project ? project.isInvalidatingStartDate() : taskStore.isInvalidatingProjectStartDate());
    },


    areLateDatesAvailable : function () {
        var me        = this,
            taskStore = me.getTaskStore(true),
            project   = me.getProject();

        return !(project ? project.isInvalidatingEndDate() : taskStore.isInvalidatingProjectEndDate());
    },


    startInvalidatingProjectBorder : function () {
        var me                = this,
            taskStore         = me.getTaskStore(),
            project           = me.getProject();

        if (project) {
            project.startInvalidatingRange();
        } else {
            taskStore.startInvalidatingProjectBorder();
        }
    },


    finishInvalidatingProjectBorder : function () {
        var me                = this,
            taskStore         = me.getTaskStore(),
            project           = me.getProject();

        if (project) {
            project.finishInvalidatingRange();
        } else {
            taskStore.finishInvalidatingProjectBorder();
        }
    },


    initializePropagation : function () {
        var taskStore = this.getTaskStore(true),
            cascadeBatch;

        this.propagating = true;

        if (taskStore) {
            taskStore.suspendAutoSync();
            taskStore.suspendEarlyDatesResetNotification();
            taskStore.suspendLateDatesResetNotification();

            // reset Early/Late dates cache after the changer has finished its work
            // those values will be recalculated while rescheduling the affected tasks
            taskStore.resetEarlyDates(true);
            taskStore.resetLateDates(true);

            cascadeBatch = taskStore.startBatchCascade();
            taskStore.startProjection();
        }

        return {
            affectedTasks : {},
            cascadeBatch  : cascadeBatch
        };
    },

    finalizePropagation : function (cancelChanges, affectedTasks, callback) {
        var taskStore = this.getTaskStore(true);

        if (taskStore) {
            if (cancelChanges) {
                while (taskStore.isProjecting()) taskStore.rejectProjection();

                affectedTasks = {};
            } else {
                var modifiedData;

                while (taskStore.isProjecting()) {
                    modifiedData = taskStore.commitProjection();
                }

                // Zero-level projection commit returns array of fields *actually* modified on the record
                // so we can filter out record that were temporary marked as affected by propagation
                // and leave only those which were really changed to reduce number of refreshes of UI
                var currentCascadeBatch = taskStore.currentCascadeBatch,
                    affected            = currentCascadeBatch.affected,
                    nbrUpdated          = false,
                    internalId;

                for (internalId in affected) {
                    // remove record from list of affected if it was not really changed
                    if (!modifiedData[internalId] || !modifiedData[internalId].length) {
                        nbrUpdated = true;
                        delete affected[internalId];
                        delete affectedTasks[taskStore.getModelByInternalId(internalId).getId()];
                    }
                }

                currentCascadeBatch.nbrAffected                 = 0;
                currentCascadeBatch.affectedParentsbyInternalId = {};
                currentCascadeBatch.affectedParentsArray        = [];

                // Iterate through "affected" object to re-add affected tasks
                // in order to recalculate nbrAffected and collect affected nodes parents
                for (internalId in affected) {
                    var affectedTask = affected[internalId];
                    delete affected[internalId];
                    currentCascadeBatch.addAffected(affectedTask);
                }
            }

            taskStore.endBatchCascade();

            taskStore.resumeAutoSync(taskStore.autoSync && !cancelChanges && !Ext.Object.isEmpty(affectedTasks));
            taskStore.resumeEarlyDatesResetNotification();
            taskStore.resumeLateDatesResetNotification();
        }

        this.propagating = false;

        callback && callback(cancelChanges, affectedTasks);
    },

    // @private
    // If there are tasks that should be scheduled counter to others (ALAP in a FW-project or ASAP in a BW one)
    // we might need to propagate twice since to be able to calculate proper late dates (in FW projects, early dates in BW project).
    // This method decides if we need two-step propagation or not
    isTwoStepPropagationNeeded : function (taskStore, propagationSources, project, oppositeTasks) {
        var result = false;

        // If the 1st task is "counter" one
        // we check each other source trying to understand if project end might get changed or not.
        if (propagationSources[0].isContraryScheduled(taskStore, project)) {

            Ext.Array.each(propagationSources, function (source) {
                // Let's use 2-step propagation:
                // - if some other source is not "counter"
                if (!source.isContraryScheduled(null, project)) {
                    result = true;
                    return false;

                // - if a source start/end or duration is changed (might affect project end date)
                } else if (source.isProjected(source.startDateField) || source.isProjected(source.endDateField) || source.isProjected(source.durationField)) {
                    result = true;
                    return false;

                // - if a source had a constraint other than ASAP/ALAP (or got such a constraint)
                } else if (source.isProjected(source.constraintTypeField)) {

                    var prevConstraint = source.getUnprojected(source.constraintTypeField),
                        newConstraint  = source.getConstraintType();

                    var prevConstraintClass = prevConstraint && Gnt.constraint.Base.getConstraintClass(prevConstraint),
                        newConstraintClass  = newConstraint && Gnt.constraint.Base.getConstraintClass(newConstraint);

                    if (
                        (prevConstraintClass && prevConstraintClass.isSemiflexibleConstraint || prevConstraintClass && prevConstraintClass.isInflexibleConstraint) ||
                        (newConstraintClass && newConstraintClass.isSemiflexibleConstraint || newConstraintClass && newConstraintClass.isInflexibleConstraint)
                    ) {
                        result = true;
                        return false;
                    }
                }
            });

        // if 1st propagation source is not scheduled counter to other tasks
        // we use 2-step propagation if there are counter scheduled tasks in the project
        } else {
            result = Boolean(oppositeTasks.length);
        }

        return result;
    },

    twoStepPropagateChangesThroughTasks : function (cfg) {
        var me                  = this,
            propagationSources1 = cfg.propagationSources1,
            propagationSources2 = cfg.propagationSources2,
            walkingSpec1        = cfg.walkingSpec1,
            walkingSpec2        = cfg.walkingSpec2,
            taskStore           = cfg.taskStore,
            cascadeBatch        = cfg.cascadeBatch,
            cascadeChanges      = cfg.cascadeChanges,
            moveParentAsGroup   = cfg.moveParentAsGroup,
            affectedTasks       = cfg.affectedTasks,
            callback            = cfg.callback,
            scheduleBackwards   = cfg.scheduleBackwards;

        // Indicate that corresponding project border (start or end date) is being invalidated
        propagationSources1[0].startInvalidatingProjectBorder(scheduleBackwards);

        me.singleStepPropagateChangesThroughTasks({
            propagationSources : propagationSources1,
            walkingSpec        : walkingSpec1,
            taskStore          : taskStore,
            cascadeBatch       : cascadeBatch,
            cascadeChanges     : cascadeChanges,
            moveParentAsGroup  : moveParentAsGroup,
            affectedTasks      : affectedTasks,
            scheduleBackwards  : scheduleBackwards,
            callback           : function (cancelChanges, affectedTasks) {
                // Indicate that corresponding project border (start or end date) is stable and can be calculated safely
                propagationSources1[0].finishInvalidatingProjectBorder(scheduleBackwards);

                if (cancelChanges) {
                    callback.call(cancelChanges, affectedTasks);
                } else {
                    // reset early/late date caches
                    taskStore.resetEarlyDates(true);
                    taskStore.resetLateDates(true);
                    // project border has been changed
                    taskStore.resetTotalTimeSpanCache();

                    // Make a new empty cascadeBatch
                    var cascadeBatch2 = taskStore.getEmptyCascadeBatch();

                    cascadeBatch2.step1CascadeBatch = cascadeBatch;
                    cascadeBatch2.step1AffectedTasks = affectedTasks;

                    taskStore.startProjection();

                    me.singleStepPropagateChangesThroughTasks({
                        propagationSources : propagationSources2,
                        walkingSpec        : walkingSpec2,
                        taskStore          : taskStore,
                        cascadeBatch       : cascadeBatch2,
                        cascadeChanges     : cascadeChanges,
                        moveParentAsGroup  : moveParentAsGroup,
                        affectedTasks      : {},
                        scheduleBackwards  : scheduleBackwards,
                        callback           : callback
                    });
                }
            }
        });
    },

    singleStepPropagateChangesThroughTasks : function (cfg) {
        var me                  = this,
            propagationSources  = cfg.propagationSources,
            walkingSpec         = cfg.walkingSpec,
            taskStore           = cfg.taskStore,
            cascadeBatch        = cfg.cascadeBatch,
            cascadeChanges      = cfg.cascadeChanges,
            moveParentAsGroup   = cfg.moveParentAsGroup,
            affectedTasks       = cfg.affectedTasks,
            callback            = cfg.callback,
            scheduleBackwards   = cfg.scheduleBackwards;

        me.propagateChangesThroughDependentTasks(
            taskStore.getLinearWalkingSequenceForDependentTasks(
                propagationSources, Ext.apply({
                    self         : true,
                    ancestors    : taskStore.recalculateParents,
                    descendants  : moveParentAsGroup,
                    successors   : cascadeChanges && !scheduleBackwards,
                    predecessors : cascadeChanges && scheduleBackwards,
                    cycles       : taskStore.cycleResolutionStrategy
                }, walkingSpec)
            ),
            taskStore,
            cascadeBatch,
            propagationSources,
            cascadeChanges,
            affectedTasks,
            callback
        );
    },

    continutePropagateChanges : function (cascadeBatch, affectedTasks, propagationSources, callback, cascadeChanges, moveParentAsGroup) {
        var me = this,
            taskStore;

        taskStore = me.getTaskStore(true);

        if (taskStore) {

            if (propagationSources === true) {
                propagationSources = me.isProjected() && [me] || false;
            }
            else if (propagationSources) {
                propagationSources = [].concat(propagationSources);
            }

            cascadeBatch.propagationSources = propagationSources;

            // Propagating
            if (propagationSources && propagationSources.length > 0) {
                // TODO: need to review this later to support propagation through multiple projects
                var project           = me.getProject(),
                    scheduleBackwards = propagationSources[0].getProjectScheduleBackwards(taskStore),
                    oppositeTasks     = taskStore.getContraryScheduledTasks(project);

                var runPropagation = function (propagationSources, callback, walkingSpec) {
                    me.singleStepPropagateChangesThroughTasks({
                        propagationSources : propagationSources,
                        walkingSpec        : walkingSpec,
                        taskStore          : taskStore,
                        cascadeBatch       : cascadeBatch,
                        cascadeChanges     : cascadeChanges,
                        moveParentAsGroup  : moveParentAsGroup,
                        affectedTasks      : affectedTasks,
                        scheduleBackwards  : scheduleBackwards,
                        callback           : callback
                    });
                };

                // if we need 2-step propagation
                if (me.isTwoStepPropagationNeeded(taskStore, propagationSources, project, oppositeTasks)) {

                    Ext.each(oppositeTasks, function (task) {
                        task.markForRescheduling();
                    });

                    runPropagation = function (propagationSources, callback) {
                        me.twoStepPropagateChangesThroughTasks({
                            propagationSources1 : Ext.Array.union(propagationSources, oppositeTasks),
                            propagationSources2 : oppositeTasks,
                            taskStore           : taskStore,
                            cascadeBatch        : cascadeBatch,
                            cascadeChanges      : cascadeChanges,
                            moveParentAsGroup   : moveParentAsGroup,
                            affectedTasks       : affectedTasks,
                            scheduleBackwards   : scheduleBackwards,
                            callback            : callback
                        });
                    };
                }

                // Some constraints we check early before propagation starts
                // so we check them and launch the propagation cycle
                var prePropagationConstraints = taskStore.getPrePropagationConstraints(me);

                if (prePropagationConstraints.length) {
                    me.doVerifyConstraints(prePropagationConstraints, function onConstraintsVerifiedCallback (constraintSatisfied, cancelChanges) {
                        // react on the verification fail
                        if (cancelChanges) {
                            me.finalizePropagation(cancelChanges, affectedTasks, callback);

                        // launch the propagation cycle
                        } else {
                            runPropagation(propagationSources, function (cancelChanges, affectedTasks) {
                                me.finalizePropagation(cancelChanges, affectedTasks, callback);
                            });
                        }
                    });

                // launch the propagation cycle
                } else {
                    runPropagation(propagationSources, function (cancelChanges, affectedTasks) {
                        me.finalizePropagation(cancelChanges, affectedTasks, callback);
                    });
                }

            }
            else {
                me.finalizePropagation(true, {}, callback && function () {
                    callback(false, {});
                });
            }

        // No task store
        } else {
            me.verifyConstraints(function (constraintSatisfied, cancelChanges) {
                if (!cancelChanges) {
                    affectedTasks[me.getId()] = me;
                }

                me.finalizePropagation(!!cancelChanges, affectedTasks, callback);
            }, affectedTasks);
        }
    },

    /**
     * Propagates changes done in `changer` function to the task to all dependent tasks. The action is asynchronous
     * since changes propagation might violate some constraints applied, which in turn might require user
     * interaction.
     *
     * **Please note** that the propagation process cannot be nested which means `changer` function cannot have `propagateChanges` call inside of it.
     * To avoid such cases all the methods invoking the propagation are marked with a special <span class="signature"><span class="propagating">propagating</span></span>
     * (or <span class="signature"><span class="propagating">pg</span></span> in the methods menu) tag in the docs.
     *
     * @param {Function} [changer] Function which should apply changes to the task.
     *
     * ```javascript
     *  task.propagateChanges(
     *      function (task, continueFn) {
     *          // apply some changes
     *          task.set('StartDate', ...);
     *          task.set('EndDate', ...);
     *          // return true to treat the task as the propagation source
     *          return true;
     *      }
     *  );
     * ```
     *
     *  If changer is not given or it's equal to Ext.emptyFn then propagation will be forcefully executed and tasks
     *  will be aligned/constrained according to their dependencies and/or constraints.
     * @param {Gnt.model.Task} changer.task The task
     * @param {Boolean/Gnt.model.Task/Gnt.model.Task[]} [changer.return] A changer might return:
     *
     *  - `true` - in this case the task will be considered as propagation source and propagation will be done only
     *    if the task has outstanding changes;
     *  - `false` or nothing - to cancel changes and skip propagation entirely;
     *  - a task instance, or an array of task instances - to consider given instances as propagation source(s) and do
     *    the propagation
     *
     * @param {Function} [callback] A callback function which will be called after changes propagation.
     * @param {Boolean}  callback.cancel Flag showing whether entire changes transaction has been canceled
     *  and nothing is changed.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     * @param {Boolean}  [forceCascadeChanges=task store `cascadeChanges` option] Flag indicating whether to propagate changes to dependent tasks.
     * @param {Boolean}  [asyncChanger=false] Flag indicating that `changer` function is asynchronous.
     * @param {Boolean}  [forceMoveParentAsGroup=task store `forceMoveParentAsGroup` option] Flag indicating whether to propagate changes to child nodes.
     */
    propagateChanges : function(changer, callback, forceCascadeChanges, asyncChanger, forceMoveParentAsGroup) {
        var me = this,
            cascadeChanges,
            moveParentAsGroup,
            propagationSources,
            taskStore;

        // <debug>
        !changer || Ext.isFunction(changer) ||
            Ext.Error.raise("Can't propagate changes to a task, invalid changer function given");
        !callback || Ext.isFunction(callback) ||
            Ext.Error.raise("Can't propagate changes to a task, invalid callback function given");
        // </debug>

        taskStore = me.getTaskStore(true);

        cascadeChanges = typeof forceCascadeChanges === 'boolean' ? forceCascadeChanges : taskStore && taskStore.cascadeChanges;
        moveParentAsGroup = typeof forceMoveParentAsGroup === 'boolean' ? forceMoveParentAsGroup : taskStore && taskStore.moveParentAsGroup;

        // We are currently propagating
        if (me.propagating) {
            callback && callback(true, {});

        } else {

            var context          = me.initializePropagation(),
                changerArguments = [me];

            // If "changer" function is asynchronous we provide it with a function that should be called to continue the propagation
            if (asyncChanger) {
                changerArguments.push(function (propagationSources) {
                    me.continutePropagateChanges(context.cascadeBatch, context.affectedTasks, propagationSources, callback, cascadeChanges, moveParentAsGroup);
                });
            }

            try {
                propagationSources = (changer && changer !== Ext.emptyFn) ? changer.apply(this, changerArguments) : [me];
            }
            catch (e) {
                me.finalizePropagation(true);
                throw e;
            }

            if (!asyncChanger) {
                me.continutePropagateChanges(context.cascadeBatch, context.affectedTasks, propagationSources, callback, cascadeChanges, moveParentAsGroup);
            }
        }
    },


    /**
     * @private
     *
     * @param {Array} linearWalkingSequence
     * @param {Gnt.model.Task} linearWalkingSequence.0 Step task
     * @param {String}         linearWalkingSequence.1 Color of the visiting step
     *  - 'green'  - Task is ready to be processed
     *  - 'yellow' - Branch task is ready to process it's children
     * @param {Object}         linearWalkingSequence.2 Set of all collected dependent tasks
     * @param {Object}         linearWalkingSequence.3 Dependency data
     * @param {Gnt.data.TaskStore} taskStore
     * @param {Object}             cascadeBatch
     * @param {Gnt.model.Task[]}   propagationSources
     * @param {Boolean}            forceCascadeChanges
     * @param {Object}             affectedTasks
     * @param {Function}           callback
     * @param {Integer}            startAt
     */
    propagateChangesThroughDependentTasks : function(linearWalkingSequence, taskStore, cascadeBatch, propagationSources, forceCascadeChanges, affectedTasks, callback, startAt) {
        var me = this,
            i, len,
            constraintSatisfied;

        startAt             = startAt    || 0;
        constraintSatisfied = true;

        for (i = startAt, len = linearWalkingSequence.length; constraintSatisfied && i < len; ++i) {

            constraintSatisfied = me.processTaskConstraints(
                linearWalkingSequence,
                i,
                taskStore,
                cascadeBatch,
                propagationSources,
                forceCascadeChanges,
                affectedTasks,
                function(linearWalkingIndex, constraintSatisfied, propagationCanceled, affectedTasks) {
                    // This callback might be called either synchronously or asynchronously thus we can't rely on
                    // `i` variable here. That's because if it is called synchronously then `i` will not yet be
                    // incremented by the for loop counter incrementing part, and if it's called asynchronously
                    // then `i` will be already incremented by the for loop directive. Thus we got the index
                    // for which this callback is called for as a parameter

                    // Stop condition
                    if (propagationCanceled || (linearWalkingIndex == len - 1)) {

                        //  if two-step propagation was used let's glue affected tasks objects of 1st and 2nd step
                        if (cascadeBatch.step1AffectedTasks) {
                            Ext.apply(affectedTasks, cascadeBatch.step1AffectedTasks);
                        }

                        //  ..do the same for BW compat cascadeBatch structure
                        if (cascadeBatch.step1CascadeBatch) {
                            Ext.apply(cascadeBatch.step1CascadeBatch.affected, cascadeBatch.affected);
                            cascadeBatch.step1CascadeBatch.nbrAffected = Ext.Object.getSize(cascadeBatch.step1CascadeBatch.affected);
                        }

                        callback(propagationCanceled, affectedTasks);
                    }
                    // Continue by recursion condition
                    else if (!constraintSatisfied) {
                        me.propagateChangesThroughDependentTasks(
                            linearWalkingSequence,
                            taskStore,
                            cascadeBatch,
                            propagationSources,
                            forceCascadeChanges,
                            affectedTasks,
                            callback,
                            linearWalkingIndex + 1
                        );
                    }
                    // Else constraint is satisfied and we will continue by the for loop
                }
            );
        }
    },

    areLinkedTasksAffectedOrPropagationSourcesLinked : function (task, dependencies, affectedTasks, propagationSources) {
        var result = false,
            i, len, dep, linkedTask;

        for (i = 0, len = dependencies.length; !result && i < len; ++i) {
            dep = dependencies[i];
            linkedTask = dep.getTargetTask() === task ? dep.getSourceTask() : dep.getTargetTask();
            result = linkedTask && affectedTasks.hasOwnProperty(linkedTask.getId()) ||
                                 Ext.Array.contains(propagationSources, linkedTask);
        }

        return result;
    },

    processParentMoveAsGroup : function (task, taskStore, cascadeBatch, propagationSources, affectedTasks) {
        var scheduleBackwards              = task.getProjectScheduleBackwards(taskStore),
            scheduleByConstraints          = taskStore.scheduleByConstraints,
            recalculateParents             = taskStore.recalculateParents,
            parentNode                     = task.parentNode,
            parentNodeStartDate            = parentNode && (parentNode.getStartDate()),
            parentNodeUnprojectedStartDate = parentNode && (parentNode.getUnprojected(parentNode.startDateField)),
            parentNodeEndDate              = parentNode && (parentNode.getEndDate()),
            offsetFromParent;

        // We ignore case when parent StartDate (EndDate in bw mode) is not specified since we cannot calculate proper dates to shift child tasks at
        if (!scheduleBackwards && parentNodeStartDate || scheduleBackwards && parentNodeEndDate) {

            // BW compat mode
            if (!scheduleByConstraints) {
                var startDate = task.getStartDate();

                if (startDate >= parentNodeUnprojectedStartDate) {
                    offsetFromParent = task.calculateDuration(parentNodeUnprojectedStartDate, startDate, null, { segments : false });
                    task.setStartDateWithoutPropagation(task.calculateEndDate(parentNodeStartDate, offsetFromParent, null, { segments : false }));

                // if the summary task starts after this one
                } else {
                    // force to not take segments into account during new start date calculating
                    offsetFromParent = task.calculateDuration(startDate, parentNodeUnprojectedStartDate, null, { segments : false });
                    task.setStartDateWithoutPropagation(task.calculateStartDate(parentNodeStartDate, offsetFromParent, null, { segments : false }));
                }

                // Passing a parent node here limits the constraining to incoming dependencies incoming from
                // that parent node descendants only, outer nodes are not taken into account
                this.areLinkedTasksAffectedOrPropagationSourcesLinked(task, scheduleBackwards ? task.getOutgoingDependencies(true) : task.getIncomingDependencies(true), affectedTasks, propagationSources) &&
                    task.scheduleWithoutPropagation({
                        shallow             : !task.isContraryScheduled(taskStore, null, scheduleBackwards),
                        taskStore           : taskStore,
                        parentNode          : parentNode,
                        currentCascadeBatch : cascadeBatch
                    });

            // in scheduleByConstraints mode we simply trigger the task rescheduling
            } else {
                task.scheduleWithoutPropagation({
                    shallow             : !task.isContraryScheduled(taskStore, null, scheduleBackwards),
                    taskStore           : taskStore,
                    currentCascadeBatch : cascadeBatch,
                    treatAsLeaf         : task.hasChildNodes()
                });

                // Since summary task early dates (and late ones) are calculated based on its children
                // and on this stage we haven't stepped through the children yet (the changes are not applied to them).
                // So let's simply mark children for further scheduling and they will be processed on the next steps.
                task.cascadeBy(function (child) {
                    // mark leaves (and parents if "recalculateParents" is disabled)
                    if (!Ext.Array.contains(propagationSources, child) && (task.isLeaf() || !recalculateParents)) {
                        task.markForRescheduling();
                    }
                });
            }
        }
    },

    /**
     * @private
     *
     * Will return `false` if a constraint conflict has been detected and awaiting for resolution, once resolved
     * the callback method will be called.
     */
    processTaskConstraints : function(linearWalkingSequence, linearWalkingIndex, taskStore, cascadeBatch, propagationSources, forceCascadeChanges, affectedTasks, callback) {
        var step                           = linearWalkingSequence[linearWalkingIndex],
            task                           = step[0],
            color                          = step[1],
            isParent                       = task.hasChildNodes(),
            isLeaf                         = !isParent,
            needsRescheduling              = task.isMarkedForRescheduling(),
            autoScheduled                  = !(task.isManuallyScheduled() || task.isCompleted() || task.isReadOnly() || Ext.Array.contains(propagationSources, task)),
            cascadeChanges                 = forceCascadeChanges || taskStore.cascadeChanges,
            scheduleBackwards              = task.getProjectScheduleBackwards(taskStore),
            scheduleByConstraints          = taskStore.scheduleByConstraints,
            recalculateParents             = taskStore.recalculateParents,
            moveParentAsGroup              = taskStore.moveParentAsGroup,
            parentNode                     = task.parentNode,
            parentNodeStartDate            = parentNode && (parentNode.getStartDate()),
            parentNodeUnprojectedStartDate = parentNode && (parentNode.getUnprojected(parentNode.startDateField)),
            parentNodeEndDate              = parentNode && (parentNode.getEndDate()),
            parentNodeUnprojectedEndDate   = parentNode && (parentNode.getUnprojected(parentNode.endDateField)),
            parentNodeDateOffset           = parentNode && affectedTasks[parentNode.getId()] && (scheduleBackwards ? parentNodeEndDate - parentNodeUnprojectedEndDate : parentNodeStartDate - parentNodeUnprojectedStartDate),
            skipConstraintsVerification    = false,
            result;

        switch (true) {
            case autoScheduled && isLeaf   && color == 'green'  && parentNodeDateOffset && moveParentAsGroup:
            case autoScheduled && isParent && color == 'yellow' && parentNodeDateOffset && moveParentAsGroup:
                task.processParentMoveAsGroup(task, taskStore, cascadeBatch, propagationSources, affectedTasks);
                break;

            case isLeaf   && color == 'green'  && needsRescheduling:
            case isParent && color == 'yellow' && needsRescheduling:

                task.scheduleWithoutPropagation({
                    shallow             : !task.isContraryScheduled(taskStore, null, scheduleBackwards),
                    taskStore           : taskStore,
                    currentCascadeBatch : cascadeBatch
                });
                break;

            case autoScheduled && isLeaf   && color == 'green'  && cascadeChanges:
            case autoScheduled && isParent && color == 'yellow' && cascadeChanges:

                if (this.areLinkedTasksAffectedOrPropagationSourcesLinked(task, scheduleBackwards ? task.getOutgoingDependencies(true) : task.getIncomingDependencies(true), affectedTasks, propagationSources)) {
                    // If we need to schedule a summary task
                    if (isParent) {
                        if (moveParentAsGroup) {
                            // BW compat: pass special flag "treatAsLeaf" forcing to calculate ES/EE dates as for non-summary tasks (trying to comply the old behavior)
                            task.scheduleWithoutPropagation({
                                shallow             : !task.isContraryScheduled(taskStore, null, scheduleBackwards),
                                taskStore           : taskStore,
                                currentCascadeBatch : cascadeBatch,
                                treatAsLeaf         : true
                            });
                        }

                        // If we are in the "scheduleByConstraints" mode
                        if (scheduleByConstraints) {
                            // Since summary task early dates (and late ones) are calculated based on its children
                            // and on this stage we haven't stepped through the children yet (the changes are not applied to them).
                            // So let's simply mark children for further scheduling and they will be processed on the next steps.
                            task.cascadeBy(function (child) {
                                // mark leaves (and parents if "recalculateParents" is disabled)
                                if (!Ext.Array.contains(propagationSources, child) && (task.isLeaf() || !recalculateParents)) {
                                    task.markForRescheduling();
                                }
                            });

                            // no need to verify the task constraints yet
                            skipConstraintsVerification = true;
                        }

                    // if it's a leaf task we simply reschedule it
                    } else {
                        task.scheduleWithoutPropagation({
                            shallow             : !task.isContraryScheduled(taskStore, null, scheduleBackwards),
                            taskStore           : taskStore,
                            currentCascadeBatch : cascadeBatch
                        });
                    }
                }

                // If it's a parent task and "recalculateParents" is enabled then we haven't finished w/ the task positioning yet.
                // So let's skip the task constraints check at this step. We can do it later.
                skipConstraintsVerification = skipConstraintsVerification || isParent && recalculateParents;

                break;

            case isParent && color == 'green' && recalculateParents:

                task.refreshCalculatedParentNodeData();
                break;
        }

        // If the propagation has finished done with the task
        // but it's still marked as requiring rescheduling let's reset the mark (to not affect further propagations)
        if (color == 'green' && task.isMarkedForRescheduling()) {
            task.unmarkForRescheduling();
        }

        if (task.isProjected(true)) {
            cascadeBatch.addAffected(task);
            affectedTasks[task.getId()] = task;
        }

        var proceedOnVerificationIsDoneCallback = function (constraintSatisfied, propagationCanceled) {
            var yellowStep,
                yellowStepIdx;

            // In case a parent node is adjusted according to its children and such an adjustment violates
            // the parent node constraint then we rewind back to the same parent node yellow step to readjust
            // it and its children once again allowing a user to reconsider (by showing him constraint violation
            // dialog, for example). We rewind by calling a callback with adjusted step index.
            if (!constraintSatisfied && isParent && autoScheduled && taskStore.recalculateParents && color == 'green') {
                yellowStep = Ext.Array.findBy(linearWalkingSequence, function(step, index) {
                    var stepTask  = step[0],
                        stepColor = step[1];

                    yellowStepIdx = index;

                    return task === stepTask && stepColor == 'yellow';
                });
                // yellowStep must always be present in the linear walking sequence.
                callback(yellowStepIdx, constraintSatisfied, !!propagationCanceled, affectedTasks);
            }
            else {
                callback(linearWalkingIndex, constraintSatisfied, !!propagationCanceled, affectedTasks);
            }
        };

        // if verification should be skipped we proceed to the next step by calling "proceedOnVerificationIsDoneCallback" manually
        if (skipConstraintsVerification) {
            proceedOnVerificationIsDoneCallback(true, false);
            result = true;

        } else {
            // otherwise we do verification by calling "task.verifyConstraints()" and "proceedOnVerificationIsDoneCallback" will be called there
            result = task.verifyConstraints(proceedOnVerificationIsDoneCallback, affectedTasks);

            // flexible constraints (ASAP/ALAP) could change the task data during the verification, so let's update affectedTasks one more time
            if (task.isProjected(true)) {
                cascadeBatch.addAffected(task);
                affectedTasks[task.getId()] = task;
            }
        }

        return result;
    },

    removeLinkToTask : function(task) {
        var depStore    = this.getDependencyStore();
        var task1Id     = this.getId();
        var task2Id     = task.getId();

        Ext.Array.each(this.getAllDependencies(), function(dep) {
            if ((dep.getSourceId() === task1Id && dep.getTargetId() === task2Id) ||
                (dep.getSourceId() === task2Id && dep.getTargetId() === task1Id) )
            {
                depStore.remove(dep);
                return false;
            }
        });
    },

    getGroupValue : function(fieldName) {
        var field = this.getField(fieldName);

        if (field.getGroupValue) {
            return field.getGroupValue(this);
        }

        return this.get(fieldName);
    },

    convertEmptyParentToLeafTask : function() {
        this.beginEdit();
        this.set('leaf', true);
        this.setDurationWithoutPropagation(1, this.getDurationUnit());
        this.endEdit();
    },

    hasEndPredecessorsButNoStartPredecessors : function() {
        var incoming = this.getIncomingDependencies();
        var result = incoming.length > 0;
        var Type   = Gnt.model.Dependency.Type;

        Ext.Array.each(incoming, function(dep) {
            if (dep.getType() === Type.StartToStart || dep.getType() === Type.EndToStart) {
                return result = false;
            }
        });

        return result;
    },

    /**
     * Indicates if the task is completed (its percent completion is 100%).
     * Completed tasks are not affected by incoming dependencies.
     * @return {Boolean} `true` if the task is completed.
     */
    isCompleted : function() {
        return this.getPercentDone() >= 100;
    },

    /**
     * Indicates if the task is started (its percent completion is greater than zero).
     * @return {Boolean} `true` if the task is started.
     */
    isStarted : function() {
        return this.getPercentDone() > 0;
    },

    /**
     * Indicates if the task is in progress (its percent completion is greater than zero and less than 100%).
     * @return {Boolean} `true` if the task is in progress.
     */
    isInProgress : function() {
        return this.isStarted() && !this.isCompleted();
    },

    autoCalculateLag : function () {

        var dependencyStore = this.getDependencyStore();

        if (!dependencyStore || !dependencyStore.autoCalculateLag || !this.hasIncomingDependencies())
            return;

        var deps = this.getIncomingDependencies();

        for (var i = 0; i < deps.length; i++) {
            dependencyStore.updateAutoCalculatedLag(deps[i]);
        }
    },

    assignAndUnassignAssignments : function(toUnassign, newAssignments, callback) {
        var me = this,
            cancelFns = [];

        if (toUnassign.length === 0 && newAssignments.length === 0) {
            return;
        }

        // array of functions to cancel assignments/unassignments made
        var assignmentStore = me.getAssignmentStore();

        assignmentStore.suspendAutoSync();

        me.propagateChanges(
            function() {
                return me.assignAndUnassignAssignmentsWithoutPropagation(toUnassign, newAssignments, function (fns) {
                    cancelFns = fns;
                });
            },
            function onPropagationComplete (cancelChanges, affectedTasks) {
                // if we need to cancel changes we run all cancel callbacks provided in reverse order
                cancelChanges && cancelFns.length && Ext.each(cancelFns, function (cancelFn) { cancelFn(); }, this, true);

                assignmentStore.resumeAutoSync();

                if (!cancelChanges) {
                    // Fire this event so UI can just react and update the row for the task
                    assignmentStore.fireEvent('taskassignmentschanged', assignmentStore, me.id, newAssignments);

                    if (assignmentStore.autoSync) {
                        assignmentStore.sync();
                    }
                }

                callback && callback(cancelChanges, affectedTasks);
            }
        );
    },

    assignAndUnassignAssignmentsWithoutPropagation : function(toUnassign, newAssignments, cancelAndResultFeedback) {
        var me = this;
        var cancelFns = [];

        toUnassign.forEach(function (resource) {
            me.unassignWithoutPropagation(resource, function cancelFeedback(fn) {
                cancelFns.push(fn);
            });
        });

        newAssignments.forEach(function (assignment) {
            var resource = assignment.getResource(me.getResourceStore());

            resource && me.assignWithoutPropagation(resource, assignment.getUnits(), function cancelFeedback(fn) {
                cancelFns.push(fn);
            }, assignment.data);
        });

        me.adjustToCalendarWithoutPropagation();

        cancelAndResultFeedback && cancelAndResultFeedback(cancelFns);

        return [me];
    }
});
