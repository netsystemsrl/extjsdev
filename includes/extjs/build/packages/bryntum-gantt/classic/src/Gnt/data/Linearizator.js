Ext.define('Gnt.data.Linearizator', function(thisClass) {

    var walkingSpecificationsCache = {};

    // {{{ linearWalkBySpecification
    /**
     * Linearly walks source task list and it's members dependent tasks in dependency resolution order.
     *
     * @param {Gnt.model.Task|[Gnt.model.Task]} sourceTasksList
     *  Walking source points
     * @param {Function}       processorFn
     *  Function to call at each walking step
     * @param {Gnt.model.Task} processorFn.task
     *  A task which dependencies are considered to be resolved at the step
     * @param {String}         processorFn.color
     *  Task dependencies resolution state, might be either **'green'** or **'yellow'**. Leaf tasks might be visited
     *  with **'green'** color only, but parent tasks will be visited twice, first with **'yellow'** color and then,
     *  after visiting all node's **'green'** children, the node will be visited again but with **'green'** color.
     *  Parent node **'yellow'** dependencies resolution state means that all it's horizontal dependencies, i.e.
     *  dependencies from node's predecessors, has been visited (and probably processed somehow during the visit),
     *  **'green'** (for any node) means that all node's dependencies, both horizontal and vertical has been visitied
     *  (and processed).
     * @param {Object}         processorFn.sourceSet
     *  Set of all tasks involved into the walking alongside with their dependency resolution state color.
     * @param {Gnt.model.Task} processor.sourceSet.task
     *  Step task
     * @param {String}         processorFn.sourceSet.color
     *  Step color
     * @param {Object}         processorFn.depsMap
     *  **Private**. Dependecies map, this parameter is currently considered to be private.
     * @param {Object}         walkingSpec
     *  Walking specification, contains information describing how to walk and process task dependencies
     * @param {Boolean}        walkingSpec.self
     *  Whether to include tasks from source tasks list into a walking sequence
     * @param {Boolean}        walkingSpec.ancestors
     *  Whether to include tasks' ancestors into a walking sequence
     * @param {Boolean}        walkingSpec.descendants
     *  Whether to include tasks' descendants into a walking sequence
     * @param {Boolean}        walkingSpec.successors
     *  Whether to include tasks's successors into a walking sequece
     * @param {String}         walkingSpec.cycles
     *  Cycles resolution strategy. See {@link Gnt.data.linearizator.CycleResolvers} public method for possible values.
     *
     * @member Gnt.data.Linearizator
     * @method linearWalkBySpecification
     */
    function linearWalkBySpecification(sourceTasksList, processorFn, walkingSpec) {
        // <debug>
        Ext.isObject(sourceTasksList) || Ext.isArray(sourceTasksList) ||
            Ext.Error.raise("Invalid arguments, source task list must be either a task or array of tasks!");
        Ext.isFunction(processorFn) ||
            Ext.Error.raise("Invalid arguments, processor function must be a function!");
        Ext.isObject(walkingSpec) ||
            Ext.Error.raise("Invalid arguments, walking specification must be an object!");
        // </debug>

        walkingSpec = resolveWalkingSpecification(walkingSpec);

        return linearWalk(
            [].concat(sourceTasksList),
            processorFn,
            walkingSpec.tasksDepsCollectingFn,
            walkingSpec.cycleSolverFn
        );
    }
    // }}}

    // {{{ linearWalk
    function linearWalk(sourceTasksList, processorFn, tasksDepsCollectingFn, cycleSolverFn) {
        var done = false,
            hadCycle = true,
            tasksColorMap$, depsColorMap$,
            taskId, task, color;

        tasksColorMap$ = createEmptyTasksColorMap();
        depsColorMap$  = createEmptyDepsColorMap();

        collectTasksAndDepsIntoColorMaps$(sourceTasksList, tasksDepsCollectingFn, tasksColorMap$, depsColorMap$);

        while (hadCycle) {

            done = false;

            while (!done) {
                done        = true;
                hadCycle    = false;

                for (taskId in tasksColorMap$) {
                    if (tasksColorMap$.hasOwnProperty(taskId) && tasksColorMap$[ taskId ].color != 'green') {

                        task  = tasksColorMap$[ taskId ].task;
                        color = calculateTaskColor(task, depsColorMap$);

                        if (color != 'red') {
                            setCalculatedTaskColor$(color, task, tasksColorMap$, depsColorMap$);
                            processorFn(task, color, tasksColorMap$, depsColorMap$);
                            done        = false;
                        } else {
                            hadCycle    = true;
                        }
                    }
                }
            }

            if (hadCycle) {
                hadCycle = cycleSolverFn && cycleSolverFn(tasksColorMap$, depsColorMap$);
            }
        }
    }
    // }}}

    // {{{ resolveWalkingSpecification
    function resolveWalkingSpecification(spec) {
        var walkingSpecificationKey = getWalkingSpecificationKey(spec),
            cycleSolverFn,
            tasksDepsCollectingFn,
            result;

        result = walkingSpecificationsCache[walkingSpecificationKey];

        if (!result) {

            cycleSolverFn = Gnt.data.linearizator.CycleResolvers[spec.cycles || 'none'];

            // <debug>
            cycleSolverFn ||
                Ext.Error.raise("Can't resolve cycle resolution function, " + spec.cycles + " is unknown!");
            // </debug>

            tasksDepsCollectingFn = [];
            spec.self            && (tasksDepsCollectingFn.push(selfTasksDepsCollector$));
            spec.ancestors       && (tasksDepsCollectingFn.push(ancestorsTasksDepsCollector$));
            spec.descendants     && (tasksDepsCollectingFn.push(descendantsTasksDepsCollector$));
            spec.successors      && (tasksDepsCollectingFn.push(successorsTasksDepsCollector$));
            spec.predecessors    && (tasksDepsCollectingFn.push(predecessorsTasksDepsCollector$));
            tasksDepsCollectingFn = composeTasksDepsCollectors(tasksDepsCollectingFn);

            result = {
                tasksDepsCollectingFn : tasksDepsCollectingFn,
                cycleSolverFn         : cycleSolverFn
            };

            walkingSpecificationsCache[walkingSpecificationKey] = result;
        }

        return result;
    }
    // }}}

    // {{{ getWalkingSpecificationKey
    function getWalkingSpecificationKey(spec) {
        var result = [],
            prop;

        for (prop in spec) {
            if (spec.hasOwnProperty(prop)) {
                result.push(prop, '=', String(spec[prop]));
            }
        }

        return result.join(';');
    }
    // }}}

    // {{{ composeTasksDepsCollectors
    function composeTasksDepsCollectors(collectors) {
        return function(task, tasksColorMap$, depsColorMap$) {
            var collectedTasks = [];

            Ext.Array.each(collectors, function(collectorFn) {
                collectedTasks = collectedTasks.concat(collectorFn(task, tasksColorMap$, depsColorMap$));
            });

            return collectedTasks;
        };
    }
    // }}}

    // {{{ collectTasksAndDepsIntoColorMaps$
    function collectTasksAndDepsIntoColorMaps$(tasksList, stepTasksDepsCollectorFn$, tasksMap$, depsMap$) {

        Ext.Array.each(tasksList, function(task) {

            var collectedTasks = stepTasksDepsCollectorFn$(task, tasksMap$, depsMap$);

            if (collectedTasks.length > 0) {
                collectTasksAndDepsIntoColorMaps$(collectedTasks, stepTasksDepsCollectorFn$, tasksMap$, depsMap$);
            }
        });
    }
    // }}}

    // {{{ selfTasksDepsCollector$
    function selfTasksDepsCollector$(task, tasksColorMap$, depsColorMap$) {
        var collectedTasks = [],
            taskId         = task.internalId;

        if (!tasksColorMap$.hasOwnProperty(taskId)) {
            // Collecting task
            tasksColorMap$[ taskId ] = {
                task  : task,
                color : 'red'
            };
            collectedTasks = [ task ];
        }

        return collectedTasks;
    }
    // }}}

    // {{{ ancestorsTasksDepsCollector$
    function ancestorsTasksDepsCollector$(task, tasksColorMap$, depsColorMap$) {
        var collectedTasks  = [],
            downFromByIdMap = depsColorMap$.downFromById,
            downToByIdMap   = depsColorMap$.downToById,
            upFromByIdMap   = depsColorMap$.upFromById,
            upToByIdMap     = depsColorMap$.upToById,
            taskId          = task.internalId,
            parentTask      = task.parentNode,
            parentId        = parentTask && parentTask.internalId,
            downColor, upColor;

        // Collecting task
        if (parentTask && !tasksColorMap$.hasOwnProperty(parentId)) {

            tasksColorMap$[ parentId ] = {
                task  : parentTask,
                color : 'red'
            };

            collectedTasks.push(parentTask);
        }

        // Collecting dependencies
        // NOTE: if a task is collected it doesn't mean all it's directional dependencies are collected
        if (parentTask) {
            downColor = [ 'red' ];
            upColor   = [ 'red' ];

            !downFromByIdMap[ parentId ]           && (downFromByIdMap[ parentId ]            = {});
            !downFromByIdMap[ parentId ][ taskId ] && (downFromByIdMap[ parentId ][ taskId ]  = downColor);
            !downToByIdMap[ taskId ]               && (downToByIdMap[ taskId ]                = downColor);

            !upToByIdMap[ parentId ]               && (upToByIdMap[ parentId ]                = {});
            !upToByIdMap[ parentId ][ taskId ]     && (upToByIdMap[ parentId ][ taskId ]      = upColor);
            !upFromByIdMap[ taskId ]               && (upFromByIdMap[ taskId ]                = upColor);
        }

        return collectedTasks;
    }
    // }}}

    // {{{ descendantsTasksDepsCollector$
    function descendantsTasksDepsCollector$(task, tasksColorMap$, depsColorMap$) {
        var collectedTasks  = [],
            downFromByIdMap = depsColorMap$.downFromById,
            downToByIdMap   = depsColorMap$.downToById,
            upFromByIdMap   = depsColorMap$.upFromById,
            upToByIdMap     = depsColorMap$.upToById,
            children        = !task.isRoot() && task.childNodes,
            taskId          = task.internalId;

        children && Ext.Array.each(children, function(childTask) {

            var childId = childTask.internalId,
                downColor,
                upColor;

            // Collecting tasks
            if (!tasksColorMap$.hasOwnProperty(childId)) {

                tasksColorMap$[ childId ] = {
                    task  : childTask,
                    color : 'red'
                };

                collectedTasks.push(childTask);
            }

            // Collecting dependencies
            // NOTE: if a task is collected it doesn't mean all it's directional dependencies are collected
            downColor = [ 'red' ];
            upColor   = [ 'red' ];

            !downFromByIdMap[ taskId ]            && (downFromByIdMap[ taskId ]            = {});
            !downFromByIdMap[ taskId ][ childId ] && (downFromByIdMap[ taskId ][ childId ] = downColor);
            !downToByIdMap[ childId ]             && (downToByIdMap[ childId ]             = downColor);

            !upToByIdMap[ taskId ]                && (upToByIdMap[ taskId ]                = {});
            !upToByIdMap[ taskId ][ childId ]     && (upToByIdMap[ taskId ][ childId ]     = upColor);
            !upFromByIdMap[ childId ]             && (upFromByIdMap[ childId ]             = upColor);
        });

        return collectedTasks;
    }
    // }}}

    // {{{ successorsTasksDepsCollector$
    function successorsTasksDepsCollector$(task, tasksColorMap$, depsColorMap$) {
        var collectedTasks = [],
            fromByIdMap    = depsColorMap$.fromById,
            toByIdMap      = depsColorMap$.toById,
            successors     = task.getSuccessors(),
            taskId         = task.internalId;

        Ext.Array.each(successors, function(successorTask) {

            var successorId = successorTask.internalId,
                color;

            // Collecting tasks
            if (!tasksColorMap$.hasOwnProperty(successorId)) {

                tasksColorMap$[ successorId ] = {
                    task  : successorTask,
                    color : 'red'
                };

                collectedTasks.push(successorTask);
            }

            // Collecting dependencies
            // NOTE: if a task is collected it doesn't mean all it's directional dependencies are collected
            color = [ 'red' ];

            !fromByIdMap[ taskId ]                && (fromByIdMap[ taskId ] = {});
            !fromByIdMap[ taskId ][ successorId ] && (fromByIdMap[ taskId ][ successorId ] = color);

            !toByIdMap[ successorId ]             && (toByIdMap[ successorId ] = {});
            !toByIdMap[ successorId ][ taskId ]   && (toByIdMap[ successorId ][ taskId ] = color);
        });

        return collectedTasks;
    }
    // }}}

    // {{{ predecessorsTasksDepsCollector$
    function predecessorsTasksDepsCollector$(task, tasksColorMap$, depsColorMap$) {
        var collectedTasks = [],
            fromByIdMap    = depsColorMap$.fromById,
            toByIdMap      = depsColorMap$.toById,
            predecessors   = task.getPredecessors(),
            taskId         = task.internalId;

        Ext.Array.each(predecessors, function(predecessorTask) {

            var predecessorId = predecessorTask.internalId,
                color;

            // Collecting tasks
            if (!tasksColorMap$.hasOwnProperty(predecessorId)) {

                tasksColorMap$[ predecessorId ] = {
                    task  : predecessorTask,
                    color : 'red'
                };

                collectedTasks.push(predecessorTask);
            }

            // Collecting dependencies
            // NOTE: if a task is collected it doesn't mean all it's directional dependencies are collected
            color = [ 'red' ];

            !fromByIdMap[ taskId ]                && (fromByIdMap[ taskId ] = {});
            !fromByIdMap[ taskId ][ predecessorId ] && (fromByIdMap[ taskId ][ predecessorId ] = color);

            !toByIdMap[ predecessorId ]             && (toByIdMap[ predecessorId ] = {});
            !toByIdMap[ predecessorId ][ taskId ]   && (toByIdMap[ predecessorId ][ taskId ] = color);
        });

        return collectedTasks;
    }
    // }}}

    // {{{ createEmptyTasksColorMap
    function createEmptyTasksColorMap() {
        return {};
    }
    // }}}

    // {{{ createEmptyDepsColorMap
    function createEmptyDepsColorMap() {
        return {
            // Horizontal successor dependencies from a task
            // {
            //     taskId : {
            //         successorTaskId : [dependency color]
            //         ...
            //     }
            //     ...
            //     1 : {
            //         2 : ['red'] // the array instance is shared with toById
            //     }
            // }
            fromById      : {},

            // Horizontal predecessor dependencies to a task
            // {
            //     taskId : {
            //         predecessorTaskId : [dependency color]
            //         ...
            //     }
            //     ...
            //     2 : {
            //         1 : ['red'] // the array instance is shared with fromById
            //     }
            // }
            toById        : {},

            // Vertical (virtual) downward dependencies from a parent task to a children tasks
            // {
            //     parentTaskId : {
            //         childTaskId : [dependency color] // the array instance is shared with downToById
            //         ...
            //     }
            //     ...
            // }
            downFromById  : {},

            // Vertical (virtual) downward dependency to a child task from a parent task
            // {
            //    childTaskId : [dependency color] // the array instance is shared with downFromById
            //    ...
            // }
            // The other participant is uniquely identified by child task parent node
            downToById    : {},

            // Vertical (virtual) upward dependencies from a child task to a parent task
            // {
            //    childTaskId : [dependency color] // the array instance is shared with upToById
            //    ...
            // }
            // The other participant is uniquely identified by child task parent node
            upFromById    : {},

            // Vertical (virtual) upward dependencies to a parent task from a child task
            // {
            //    parentTaskId : {
            //        childTaskId : [dependency color] // the array instance is shared with upFromById
            //        ...
            //    }
            //    ...
            // }
            upToById      : {}
        };
    }
    // }}}

    // {{{ hasRedDepsTo
    function hasRedDepsTo(task, depsMap) {
        var toByIdMap = depsMap.toById[ task.internalId ],
            result    = false,
            i;

        for (i in toByIdMap) {
            if (toByIdMap.hasOwnProperty(i) && toByIdMap[ i ] && toByIdMap[ i ][ 0 ] == 'red') {
                result = true;
                break;
            }
        }

        return result;
    }
    // }}}

    // {{{ hasRedDepsFrom
    function hasRedDepsFrom(task, depsMap) {
        var fromByIdMap = depsMap.fromById[ task.internalId ],
            result      = false,
            i;

        for (i in fromByIdMap) {
            if (fromByIdMap.hasOwnProperty(i) && fromByIdMap[ i ] && fromByIdMap[ i ][ 0 ] == 'red') {
               result = true;
               break;
            }
        }

        return result;
    }
    // }}}

    // {{{ hasRedDepsDownTo
    function hasRedDepsDownTo(task, depsMap) {
        var downToByIdMap = depsMap.downToById,
            internalId    = task.internalId;

        return downToByIdMap[ internalId ] && downToByIdMap[ internalId ][0] == 'red';
    }
    // }}}

    // {{{ hasRedDepsDownFrom
    function hasRedDepsDownFrom(task, depsMap) {
        var downFromByIdMap = depsMap.downFromById[ task.internalId ],
            result          = false,
            i;

        for (i in downFromByIdMap) {
            if (downFromByIdMap.hasOwnProperty(i) && downFromByIdMap[ i ] && downFromByIdMap[ i ][ 0 ] == 'red') {
                result = true;
                break;
            }
        }

        return result;
    }
    // }}}

    // {{{ hasRedDepsUpTo
    function hasRedDepsUpTo(task, depsMap) {
        var upToByIdMap = depsMap.upToById[ task.internalId ],
            result      = false,
            i;

        for (i in upToByIdMap) {
            if (upToByIdMap.hasOwnProperty(i) && upToByIdMap[ i ] && upToByIdMap[ i ][ 0 ] == 'red') {
                result = true;
                break;
            }
        }

        return result;
    }
    // }}}

    // {{{ hasRedDepsUpFrom
    function hasRedDepsUpFrom(task, depsMap) {
        var internalId  = task.internalId,
            upToByIdMap = depsMap.upToById;

        return upToByIdMap[ internalId ] && upToByIdMap[ internalId ][ 0 ] == 'red';
    }
    // }}}

    // {{{ calculateTaskColor
    function calculateTaskColor(task, depsMap) {
        var color = 'red';

        if (!hasRedDepsTo(task, depsMap) && !hasRedDepsDownTo(task, depsMap) && !hasRedDepsUpTo(task, depsMap)) {
            color = 'green';
        }
        else if (!hasRedDepsTo(task, depsMap) && !hasRedDepsDownTo(task, depsMap) && hasRedDepsDownFrom(task, depsMap)) {
            color = 'yellow';
        }
        else {
            color = 'red';
        }

        return color;
    }
    // }}}

    // {{{ setCalculatedTaskColor$
    function setCalculatedTaskColor$(color, task, tasksColorMap$, depsColorMap$) {

        var taskId          = task.internalId,
            fromByIdMap     = depsColorMap$.fromById[ taskId ],
            downFromByIdMap = depsColorMap$.downFromById[ taskId ],
            upFromByIdMap   = depsColorMap$.upFromById[ taskId ],
            i;

        tasksColorMap$[ taskId ].color   = color;

        if (color == 'green') {

            if (fromByIdMap) {
                for (i in fromByIdMap) {
                    if (fromByIdMap.hasOwnProperty(i)) {
                        fromByIdMap[ i ][ 0 ] = color;
                    }
                }
            }

            if (downFromByIdMap) {
                for (i in downFromByIdMap) {
                    if (downFromByIdMap.hasOwnProperty(i)) {
                        downFromByIdMap[ i ][ 0 ] = color;
                    }
                }
            }

            if (upFromByIdMap) {
                upFromByIdMap[ 0 ] = color;
            }
        }
        else if (color == 'yellow') {

            if (downFromByIdMap) {
                for (i in downFromByIdMap) {
                    if (downFromByIdMap.hasOwnProperty(i)) {
                        downFromByIdMap[ i ][ 0 ] = color;
                    }
                }
            }
        }
        // else red and do nothing
    }
    // }}}

    // {{{ Class descriptor
    return {
        // Class behaviour
        singleton       : true,
        requires        : [
            'Gnt.data.linearizator.CycleResolvers'
        ],
        // Public interface
        linearWalkBySpecification : linearWalkBySpecification
    };
    // }}}
});
