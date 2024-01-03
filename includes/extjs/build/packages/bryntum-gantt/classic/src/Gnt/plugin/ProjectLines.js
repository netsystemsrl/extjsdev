/**
@class Gnt.plugin.ProjectLines
@extends Sch.plugin.Lines

A simple subclass of the {@link Sch.plugin.Lines} which sets project lines on the gantt chart.
Generally, there's no need to instantiate it manually, it can be activated with the {@link Gnt.panel.Gantt#showProjectLines} configuration option.
 */
Ext.define("Gnt.plugin.ProjectLines", {
    extend              : 'Sch.plugin.Lines',
    alias               : 'plugin.gantt_projectlines',

    mixins              : ['Gnt.mixin.Localizable'],

    requires            : [
        'Ext.data.Store'
    ],

    innerTpl            : '<span class="sch-gantt-project-line-text" style="{Style}">{Text}</span>',

    // Some number to use to make sure labels don't overlap if project labels are rendered near each other.
    labelHeight         : 25,

    showHeaderElements  : true,

    /**
     * @cfg {Gnt.data.taskStore} taskStore The task store to extract projects from
     */
    taskStore           : null,

    /**
     * @cfg {Object} l10n
     * An object, purposed for the class localization. Contains the following keys/values:
     *
     * - startOf  : 'Start of'
     * - endOf    : 'End of'
     */

    /**
     * @cfg {String} linesFor
     * Specifies what project dates should be used to build lines. Might be:
     *
     * - `start` - to build lines for project start dates
     * - `end` - to build lines for project end dates
     * - `both` - to build lines for both project start and end dates
     */
    linesFor            : 'both',

    init : function (ganttPanel) {
        this.taskStore  = this.taskStore || ganttPanel.getTaskStore();

        this.bindTaskStore(this.taskStore);

        if (!this.store) {
            this.store  = new Ext.data.Store({
                fields      : [
                    { name: 'Id' },
                    { name: 'ProjectId' },
                    { name: 'Date', type: 'date' },
                    { name: 'Cls', type: 'string' },
                    { name: 'Text', type: 'string' }
                ]
            });
        }

        this.callParent(arguments);
        this.onTaskStoreLoad();
    },

    bindTaskStore : function (taskStore) {
        var listeners       = {
            nodeappend      : this.onTaskStoreNodeAppend,
            noderemove      : this.onTaskStoreNodeRemove,
            update          : this.onUpdate,
            load            : this.onTaskStoreLoad,
            scope           : this
        };

        if (this.taskStore) {
            this.taskStore.un(listeners);
        }

        if (taskStore) {
            taskStore.on(listeners);
        }

        this.taskStore = taskStore;
    },

    onUpdate : function (store, record, operation, modified) {
        // Can't trust "modified" to be an array :/
        // https://www.sencha.com/forum/showthread.php?314319-TreeStore-update-event-doesn-t-always-provide-an-array.&p=1142195#post1142195
        modified = modified || [];

        if (record && record.isProject && operation === Ext.data.Model.EDIT) {

            var update = Ext.Array.some([record.startDateField, record.endDateField, record.nameField], function (item) {
                return Ext.Array.indexOf(modified, item) !== -1;
            });

            if (update) {
                var projectId = record.modified && record.modified.Id || record.getId();

                // re-create the project related lines
                this.store.remove(this.getProjectLines(projectId));
                this.store.add(this.retrieveProjectLines(record));
            }
        }
    },

    onTaskStoreNodeAppend : function(parent, node) {
        if (node && node.isProject && !this.taskStore.isSettingRoot) {
            this.store.add(this.retrieveProjectLines(node));
        }
    },

    onTaskStoreNodeRemove : function(parent, node) {
        if (node && node.isProject) {
            this.store.remove(this.getProjectLines(node.getId()));
        }
    },

    onTaskStoreLoad : function () {
        this.refreshAllProjects();
    },

    refreshAllProjects : function () {
        this.store.removeAll(true);
        this.store.add(this.retrieveProjectLines());
    },

    getProjectLines : function (projectId) {
        var result = [];

        this.store.each(function (line) {
            if (line.get('ProjectId') === projectId) result.push(line);
        });

        return result;
    },

    /**
     * @protected
     * @method prepareProjectStartLine Prepares a record that corresponds to a project start date.
     * @param  {Gnt.model.Project} project Project
     * @return {Object} Object representing the record to be added to the store
     */
    prepareProjectStartLine : function (project, index) {
        return {
            Date        : project.getStartDate(),
            Text        : this.L('startOf') + ' ' + Ext.htmlEncode(project.getName()),
            Cls         : 'sch-gantt-project-line sch-gantt-project-line-start sch-gantt-project-line-' + Ext.htmlEncode(project.getId()),
            ProjectId   : project.getId(),
            Style       : 'margin-top:' + (index * this.labelHeight) + 'px'
        };
    },

    /**
     * @protected
     * @method prepareProjectEndLine Prepares a record that corresponds to a project end date.
     * @param  {Gnt.model.Project} project Project
     * @return {Object} Object representing the record to be added to the store
     */
    prepareProjectEndLine : function (project, index) {
        return {
            Date        : project.getEndDate(),
            Text        : this.L('endOf') + ' ' + Ext.htmlEncode(project.getName()),
            Cls         : 'sch-gantt-project-line sch-gantt-project-line-end sch-gantt-project-line-' + Ext.htmlEncode(project.getId()),
            ProjectId   : project.getId(),
            Style       : 'margin-top:' + (index * this.labelHeight) + 'px'
        };
    },

    retrieveProjectLines : function (project) {
        var me              = this,
            projects        = Ext.isArray(project) ? project : project && [project] || this.taskStore.getProjects(),
            projectLines    = [],
            linesFor    = me.linesFor;

        for (var i = 0; i < projects.length; i++) {
            linesFor !== 'end' && projectLines.push( me.prepareProjectStartLine(projects[i], i) );
            linesFor !== 'start' && projectLines.push( me.prepareProjectEndLine(projects[i], i) );
        }

        return projectLines;
    },

    destroy : function() {
        this.bindTaskStore(null);

        this.store.destroy();

        this.callParent(arguments);
    }
});
