/**

@class Gnt.plugin.taskeditor.ProjectEditor
@extends Gnt.plugin.taskeditor.BaseEditor

A plugin (ptype = 'gantt_projecteditor') which shows a {@link Gnt.widget.taskeditor.ProjectEditor} in a window when a user double-clicks
{@link Gnt.model.Project a task of project type} bar in the gantt chart.

You can enable this plugin in your Gantt chart like this:

    var gantt = Ext.create('Gnt.panel.Gantt', {
        ...
        plugins : ['gantt_projecteditor']
        ...
    });

*/
Ext.define('Gnt.plugin.taskeditor.ProjectEditor', {
    extend              : 'Gnt.plugin.taskeditor.BaseEditor',

    alternateClassName  : ['Gnt.plugin.ProjectEditor'],

    requires            : [
        'Gnt.widget.taskeditor.ProjectEditor'
    ],

    alias               : 'plugin.gantt_projecteditor',
    // ptype isn't filled automatically, because we do not extend AbstractPlugin
    ptype               : 'gantt_projecteditor',

    height              : 390,
    width               : 600,

    /**
    * @cfg {Object} taskEditorCls Class for the {@link Gnt.widget.taskeditor.ProjectEditor} instance.
    */
    taskEditorCls       : 'Gnt.widget.taskeditor.ProjectEditor',

    /**
     * @cfg {Gnt.model.Task} task The task to show in the task editor.
     */

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

            - title               : 'Project Information',
            - alertCaption        : 'Information',
            - alertText           : 'Please correct marked errors to save changes',
            - okText              : 'Ok',
            - cancelText          : 'Cancel',
            - generalText         : 'General'
     */

    taskEditorConfigs  : 'l10n,task,taskStore,assignmentStore,resourceStore,projectFormClass,showDescription,projectFormConfig,descriptionConfig',

    /**
     * @event loadproject
     * Fires after project loading complete.
     * @param {Gnt.widget.taskeditor.ProjectEditor} projectEditor Project editor widget instance used for editing.
     * @param {Gnt.model.Project} project The loaded project.
     */

    /**
     * @event validate
     * Fires when project validation occurs. Take a look at example of using this event {@link Gnt.widget.taskeditor.TaskEditor#event-validate here}.
     * @param {Gnt.widget.taskeditor.ProjectEditor} projectEditor Project editor widget instance.
     */

    /**
     * @event beforeupdateproject
     * @preventable
     * Fires before project updating occurs. Return false to prevent the update.
     * @param {Gnt.widget.taskeditor.ProjectEditor} projectEditor Project editor widget instance used for editing.
     * @param {Function} proceedCallback The function which can be called manually to continue project updating. Example:
     */

    /**
     * @event afterupdateproject
     * Fires after project updating is finished.
     * @param {Gnt.widget.taskeditor.ProjectEditor} projectEditor Project editor widget instance.
     *
     */

    constructor : function (config) {
        this.callParent(arguments);
        this.addCls('gnt-projecteditor-window');
        // filter out all except project records
        this.addFilter(function (task) {
            return task && task.isProject;
        });
    },


    init : function (cmp) {
        this.callParent(arguments);
        // decorate the component with a reference to the plugin
        cmp.projectEditor   = this;
    }
});
