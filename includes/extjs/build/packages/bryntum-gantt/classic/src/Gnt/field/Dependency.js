/**
@class Gnt.field.Dependency
@extends Ext.form.field.Text

A specialized field allowing a user to change the dependencies of a task. The type of dependecies
created by this field is controlled by the {@link #type} config.

The text describing a dependency can be one or more values in the following format, separated with a {@link #separator} string:

    [TaskId][DependencyType][Lag]

where:

- `TaskId` is the id of the predecessor/successor task, can be a "real" or "sequential" id, see below.
- `DependencyType` (optional, default value is equal to Dependency model Type field default value) is one of the following (based on the {@link Gnt.util.DependencyParser#l10n}) property.
* **Please note** that dependency types are localized and depend on selected language (following values present English translation):
    - `FS` - for "Finish-To-Start"
    - `FF` - for "Finish-To-Finish"
    - `SF` - for "Start-To-Finish"
    - `SS` - for "Start-To-Start"
- `Lag` (optional). Should start with `+` or `-` followed by a number indicating the lag amount
and duration unit.


The `TaskId` part can contain either "real" id of the task (the id that is stored in the database) or "sequential" id.
The sequential id corresponds to the ordinal position of the task in the whole dataset. When you add or remove tasks
from the dataset, the sequential id of the tasks may change. Which type of id is used is controled by the
{@link #useSequenceNumber} config.

For example:
    10          - Finish to start dependency from task with Id 10
    10SS        - Start to start dependency from task with Id 10
    3FS+1d      - Finish to start dependency from task with Id 3, with +1 day lag
    3FS-10h      - Finish to start dependency from task with Id 3, with -10 hours lag

*/
Ext.define("Gnt.field.Dependency", {
    extend              : "Ext.form.field.Text",

    alternateClassName  : "Gnt.widget.DependencyField",
    alias               : "widget.dependencyfield",

    requires            : [
        'Sch.util.Date',
        'Gnt.util.DependencyParser',
        'Gnt.model.Dependency'
    ],

    mixins              : ['Gnt.mixin.Localizable'],

    /**
     * @cfg {String} type Either `predecessors` or `successors`. Defines the type of dependencies managed by this field. Defaults to 'predecessors'.
     */
    type                : 'predecessors',        // Or successors

    /**
     * @cfg {String} separator A separator between the dependency values in the text field.
     */
    separator           : ';',

    task                : null,

    /**
     * @property {Gnt.util.DependencyParser} dependencyParser
     * An object used to parse entered string to a proper dependency data.
     * **See also** {@link #dependencyParserConfig} config.
     */
    dependencyParser    : null,

    /**
     * @cfg {Object} dependencyParserConfig
     * A config object to be passed to {@link Gnt.util.DependencyParser} constructor.
     */
    dependencyParserConfig  : null,

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

            - invalidFormatText   : 'Invalid dependency format',
            - invalidDependencyText : 'Invalid dependency found, please make sure you have no cyclic paths between your tasks',
            - invalidDependencyType : 'Invalid dependency type {0}. Allowed values are: {1}.'
     */

    /**
     * @cfg {Boolean} useSequenceNumber Set to `true` to use auto-generated sequential identifiers
     * to reference other tasks (see {@link Gnt.model.Task#getSequenceNumber} for definition).
     * If value is `false`then "real" id (that is stored in the database) will be used.
     */
    useSequenceNumber : false,

    constructor         : function(config) {
        var me = this;
        Ext.apply(this, config);

        this.dependencyParser = new Gnt.util.DependencyParser(Ext.apply({
            separator : new RegExp('\\s*' + me.separator + '\\s*'),
            // Since we're reusing the NumberField's parsing of numbers, we have to pass this on to the parser
            // to avoid having the same definitions in the parser too
            parseNumberFn : function() { return Gnt.field.Duration.prototype.parseValue.apply(me, arguments); }
        }, this.dependencyParserConfig));

        this.callParent(arguments);

        this.addCls('gnt-field-dependency');
    },


    isPredecessor : function() {
        return this.type === 'predecessors';
    },

    /**
     * Set the task this field is bound to.
     *
     * @param {Gnt.model.Task} task
     */
    setTask : function(task) {
        this.task   = task;
        this.setRawValue(this.getFieldDisplayValue(task));
    },

    /**
     * Returns an array of dependency objects representing the current value of the field:

        [
            {
                taskId  : 3,    // Int, always present
                type    : "FS", // String, always present
                lag     : 3,    // Int, optional
                lagUnit : 'd'   // String, optional
            },
            ...
        ]

     * @return {Object} The dependencies
     */
    getDependencies: function (task) {
        return this.dependencyParser.parse(this.getRawValue(), this.getDefaultDependencyType(task));
    },


    getTaskIdFromDependency : function (dependencyData) {
        var store = this.task.getTaskStore(),
            taskId = dependencyData.taskId,
            task;

        if (this.useSequenceNumber) {
            task = store.getBySequenceNumber(taskId);
            taskId = task && task.getId();
        }

        return taskId;
    },


    getErrors : function (value) {
        if (!value) return [];

        var dependencies;

        if (!Ext.isArray(value)) {
            dependencies = this.dependencyParser.parse(value, this.getDefaultDependencyType());

            if (!dependencies) {
                return [ this.L('invalidFormatText') ];
            }
        } else {
            dependencies = value;
        }

        if (this.task) {
            var isPredecessor   = this.isPredecessor(),
                task            = this.task,
                dependencyStore = task.getTaskStore().getDependencyStore(),
                depClass        = dependencyStore.model,
                // existing dependencies
                oldDependencies = task[isPredecessor ? 'predecessors' : 'successors'],
                typeAbbrs       = this.dependencyParser.types,
                allowedTypes    = dependencyStore.allowedDependencyTypes,
                typeCodes       = depClass.Type, // 'Type' is not a field name (look at Sch.model.DependencyBase -> inheritableStatics -> Type)
                taskId;

            // build list of tasks to be created, we need to provide it to isValidDependency() for correct validation
            var newDeps    = [];

            for (var i = 0; i < dependencies.length; i++) {
                var depData = dependencies[i];

                taskId      = this.getTaskIdFromDependency(depData);
                if (!taskId) {
                    return [ this.L('invalidDependencyText') ];
                }

                // validate dependency type used
                if (dependencyStore.allowedDependencyTypes && !dependencyStore.isValidDependencyType(depData.type)) {
                    var allowed         = '';

                    for (var j = 0, k = allowedTypes.length; j < k; j++) {
                        allowed += typeAbbrs[typeCodes[allowedTypes[j]]] + ',';
                    }

                    return [ Ext.String.format(this.L('invalidDependencyType'), typeAbbrs[depData.type], allowed.substring(0, allowed.length-1)) ];
                }

                var dep     = new dependencyStore.model();

                dep.setSourceId(isPredecessor ? taskId : task.getId());
                dep.setTargetId(isPredecessor ? task.getId() : taskId);
                dep.setType(depData.type);
                dep.setLag(depData.lag, depData.lagUnit);

                newDeps.push(dep);
            }

            // loop over dependencies to be created
            for (i = 0; i < newDeps.length; i++) {
                // validate dependency: we ask store if `newDeps[i]` is valid if we remove `oldDependencies` and add `newDeps` dependencies
                if (!dependencyStore.isValidDependency(newDeps[i], newDeps, oldDependencies)) {
                    return [ this.L('invalidDependencyText') ];
                }
            }
        }

        return this.callParent([ value ]);
    },

    getDefaultDependencyType : function (task) {
        task = task || this.task;

        var depStore     = task && task.getTaskStore() && task.getTaskStore().getDependencyStore(),
            depClass     = depStore ? depStore.model : Gnt.model.Dependency,
            typeFieldDef = depClass.getField(depClass.prototype.typeField);

        return typeFieldDef && typeFieldDef.defaultValue || null;
    },

    getFieldDisplayValue : function (task) {
        var isPredecessor = this.isPredecessor(),
            deps          = isPredecessor ? task.getIncomingDependencies(true) : task.getOutgoingDependencies(true),
            dpTypes       = this.dependencyParser.types,
            strings       = [],
            depTask;

        for (var i = 0; i < deps.length; i++) {
            var dep     = deps[i];

            depTask     = isPredecessor ? dep.getSourceTask() : dep.getTargetTask();

            if (depTask && dep.isValid(false)) {
                var type        = dep.getType(),
                    lag         = dep.getLag(),
                    lagUnit     = dep.getLagUnit();

                strings.push(Ext.String.format(
                    '{0}{1}{2}{3}{4}',
                    this.useSequenceNumber ? depTask.getSequenceNumber() : depTask.getId(),
                    lag || type !== this.getDefaultDependencyType(task) ? dpTypes[type] : '',
                    lag > 0 ? '+' : '',
                    lag || '',
                    lag && lagUnit !== Sch.util.Date.DAY ? lagUnit : '')
                );
            }
        }

        return strings.join(this.separator);
    },

    isDirty : function (task) {
        task            = task || this.task;
        if (!task) return false;

        var isPredecessor   = this.isPredecessor(),
            depStore        = task.getTaskStore().dependencyStore,
            deps            = isPredecessor ? task.getIncomingDependencies() : task.getOutgoingDependencies(),
            taskId          = task.getId();

        // check if some of task dependencies are dirty
        for (var i = 0, l = deps.length; i < l; i++) {
            if (deps[i].dirty || deps[i].phantom) return true;
        }

        if (depStore) {
            var fn  = isPredecessor ? 'getTargetId' : 'getSourceId';

            // check if there are some unsaved removed dependencies
            deps    = depStore.getRemovedRecords();
            for (i = 0, l = deps.length; i < l; i++) {
                if (deps[i][fn]() == taskId) return true;
            }
        }

        return false;
    },

    /**
     * This method applies the changes from the field to the bound task or to the task provided as 1st argument.
     *
     * @param {Gnt.model.Task} [task] The task to apply the changes to. If not provided, changes will be applied to the last bound task
     * (with {@link #task} config option or {@link #setTask) method)
     */
    applyChanges : function(task) {
        task = task || this.task;

        var depStore      = task.getTaskStore().dependencyStore,
            dependencies  = this.getDependencies(task),
            isPredecessor = this.isPredecessor(),
            currentDeps   = isPredecessor ? task.getIncomingDependencies(true) : task.getOutgoingDependencies(true),
            toRemove      = [],
            i;

        var ids = Ext.Array.map(dependencies, function(dep){
             return this.getTaskIdFromDependency(dep);
        }, this);

        // First remove deleted dependencies
        for (i = 0; i < currentDeps.length; i++) {
            if (!Ext.Array.contains(ids, currentDeps[i][isPredecessor ? 'getSourceId' : 'getTargetId']())) {
                toRemove.push(currentDeps[i]);
            }
        }
        if (toRemove.length > 0) {
            depStore.remove(toRemove);
        }

        var toAdd = [];

        // Now iterate cell value, to update or add new dependencies
        for (i = 0; i < dependencies.length; i++) {
            var depData = dependencies[i];
            var predId = this.getTaskIdFromDependency(depData);
            var dep = depStore.getTasksLinkingDependency(predId, task.getId());

            if (dep) {
                dep.beginEdit();
                dep.setType(depData.type);
                dep.setLag(depData.lag, depData.lagUnit);
                dep.endEdit();
            } else {
                dep = new depStore.model();

                dep.setSourceId(isPredecessor ? predId : task.getId());
                dep.setTargetId(isPredecessor ? task.getId() : predId);
                dep.setType(depData.type);
                dep.setLag(depData.lag, depData.lagUnit);

                toAdd.push(dep);
            }
        }

        if (toAdd.length > 0) {
            depStore.add(toAdd);
        }
    }
});
