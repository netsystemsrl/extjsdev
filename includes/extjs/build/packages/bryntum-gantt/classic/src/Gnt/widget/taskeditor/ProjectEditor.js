/**
 @class Gnt.widget.taskeditor.ProjectEditor
 @extends Gnt.widget.taskeditor.BaseEditor

 A widget used to display and edit project information.
 By default the widget is an Ext.tab.Panel instance which can contain the following tabs:

 - General information
 - Description

 You can easily add new custom tabs using {@link #items} config.

 # General

 Contains a customizable {@link Gnt.widget.ProjectForm form} instance for viewing and editing the following project data:

 - the name of the project
 - the start date of the project
 - the end date of the project
 - the readOnly status of the project
 - the allowDependencies status of the project

 ### Project form customization

 There is a {@link #projectFormConfig} config which can be used to customize the form panel.

        Ext.create('Gnt.widget.taskeditor.ProjectEditor', {
            // Configure the form located in the "General" tab
            projectFormConfig : {
                // turn off fields highlighting
                highlightTaskUpdates : false,
                // alter panel margin
                margin : 20
            }
        });

 ### Fields configuration

 The {@link Gnt.widget.ProjectForm} class has a config for each field presented at the `General` tab.
 And using {@link #projectFormConfig} we can get access for those options to setup fields.
 For example:

        Ext.create('Gnt.widget.taskeditor.ProjectEditor', {
            // setup form located at "General" tab
            projectFormConfig : {
                // set AllowDependencies field invisible
                allowDependenciesConfig : {
                    hidden : true
                }
            }
        });

 Here are some more configs for other fields:

 - {@link Gnt.widget.ProjectForm#nameConfig nameConfig} (the name of the project field)
 - {@link Gnt.widget.ProjectForm#startConfig startConfig} (the start date of the project field)
 - {@link Gnt.widget.ProjectForm#finishConfig finishConfig} (the end date of the project field)

 Please see {@link Gnt.widget.ProjectForm} class to see the full list of available config options.

 ### Extending the General field set

 If you want to add a new field to the `General` tab you will have to extend the {@link Gnt.widget.ProjectForm ProjectForm} class.
 After that you will need to configure the project editor to use your extended class:

        // extend standard ProjectForm class
        Ext.define('MyProjectForm', {
            extend : 'Gnt.widget.taskeditor.ProjectForm',

            constructor : function(config) {
                this.callParent(arguments);

                // add some custom field
                this.add({
                    fieldLabel  : 'Foo',
                    name        : 'Name',
                    width       : 200
                });
            }
        });

        // Let task editor know which class to use
        Ext.create('Gnt.widget.taskeditor.ProjectEditor', {
            // to use MyProjectForm to build the "General" tab
            projectFormClass : 'MyProjectForm'
        });

 #Description

 Contains an {@link Ext.form.field.HtmlEditor} HTML editor instance for viewing and editing a freetext description about the Project.

You can enable/disable this tab by setting the {@link #showDescription} option.
To rename this tab you can use the `descriptionText` property of {@link #l10n} config.
Customizing the grid itself can be done via the {@link #descriptionConfig} config.

 */
Ext.define('Gnt.widget.taskeditor.ProjectEditor', {

    extend                  : 'Gnt.widget.taskeditor.BaseEditor',

    alias                   : 'widget.projecteditor',

    requires                : [
        'Ext.form.field.HtmlEditor',
        'Gnt.widget.taskeditor.ProjectForm',
        'Ext.panel.Panel'
    ],

    alternateClassName      : ['Gnt.widget.ProjectEditor'],

    eventIndicator          : 'project',

    /**
     * @event loadproject
     * Fires after project has been loaded into the editor.
     *
     * This event can be used to do additional data loading if project editor was extended with some extra fields.
     * Also please take a look at {@link #afterupdateproject} event to have an example of how to implement custom data saving.
     *
     * @param {Gnt.widget.taskeditor.ProjectEditor} projectEditor The project editor widget instance.
     * @param {Gnt.model.Project} project The project.
     */

    /**
     * @event beforeupdateproject
     * @preventable
     * Fires before project updating occurs. Return `false` to prevent the update.
     * @param {Gnt.widget.taskeditor.ProjectEditor} projectEditor The project editor widget instance.
     * @param {Function} proceedCallback The function which can be called manually to continue project updating. Example:
     */

    /**
     * @event afterupdateproject
     * Fires after a project has been updated.
     *
     * This event can be used to do some extra processing after project was updated by project editor.
     * For example in case when you have some additional fields you can implement saving of them using this event.
     * Also please take a look at {@link #loadproject} event to have an example of how to implement custom data loading.
     *
     * @param {Gnt.widget.taskeditor.ProjectEditor} projectEditor The project editor instance.
     */

    /**
     * @event validate
     * @preventable
     * Fires when task validating occurs.
     * @param {Gnt.widget.taskeditor.ProjectEditor} projectEditor The task editor instance.
     * @param {Ext.Component} tabToFocus The tab panel item where one or more invalid fields was detected.
     *
     * Fires during a {@link #method-validate} method call when task validation occurs.
     * Return `false` to make the validation fail, but take care of marking invalid component somehow (to let user know of error)
     * since normally invalid components are being highlighted during validate call.
     */

    /**
     * @cfg {Gnt.model.Project} task The project to edit.
     */

    /**
     * @cfg {String} projectFormClass Class representing the form in the `General` tab.
     *
     * This option supposed to be used to implement a custom form in the `General` tab content.
     */
    projectFormClass           : 'Gnt.widget.taskeditor.ProjectForm',

    /**
     * @cfg {Boolean} showDescription `true` to display a `Description` tab.
     */
    showDescription               : true,

    /**
     * @cfg {Object/Object[]} items A single item, or an array of child Components to be **appended** after default tabs to this container.
     * For example:
     *
     *      var projectEditor = Ext.create('Gnt.widget.taskeditor.ProjectEditor', {
     *          items: [{
     *              title   : "Some custom tab",
     *              items   : [{
     *                  xtype       : 'textfield',
     *                  fieldLabel  : 'Enter your name',
     *                  id          : 'enter-your-name',
     *                  allowBlank  : false,
     *                  blankText   : 'Please enter your name'
     *              }]
     *          }]
     *      });
     */

    /**
     * @cfg {Object} projectFormConfig Configuration options to be supplied to the `General` tab.
     * For possible options take a look at the {@link Gnt.widget.ProjectForm}.
     */
    projectFormConfig             : null,

    /**
     * @cfg {Object} descriptionConfig Configuration options for the HTML-editor placed in the `Description` tab.
     * For possible options take a look at the {@link Ext.form.field.HtmlEditor}.
     */
    descriptionConfig             : null,

    /**
     * @property {Ext.panel.Panel} descriptionPanel The `Description` tab.
     * Please use {@link #descriptionEditor} to access an enclosed HTML-editor.
     */
    descriptionPanel              : null,

    /**
     * @property {Ext.form.field.HtmlEditor} descriptionEditor The HTML-editor presented in the `Description` tab.
     * To specify setting for the HTML-editor please use {@link #descriptionConfig}.
     */
    descriptionEditor             : null,


    /**
     * @property {Gnt.widget.ProjectForm} projectForm The `General` tab project form.
     * By default it's a {@link Gnt.widget.ProjectForm} instance but it might be customized by using {@link #projectFormClass} option.
     */
    projectForm                   : null,

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

     - generalText         : 'General',
     - descriptionText     : 'Description',
     */

    buildItems : function () {
        var me      = this,
            items   = [],
            project = this.task;

        // create ProjectForm instance
        me.projectForm  = Ext.create(me.projectFormClass, Ext.apply({
            task        : project,
            border      : false,
            taskStore   : me.taskStore
        }, me.projectFormConfig));

        items.push(me.projectForm);

        // create description panel
        if (me.showDescription) {
            // create notes HtmlEditor instance
            me.descriptionEditor = Ext.create(Ext.apply({
                xclass        : 'Ext.form.field.HtmlEditor',
                listeners     : {
                    // we need this to draw content of HtmlEditor properly on very first activation of tab
                    // to gracefully process deferredRender = true
                    afterrender : function (el) {
                        me.descriptionEditor.setValue(me.task.get(me.task.descriptionField));
                    }
                },
                readOnly      : project && !project.isEditable(project.descriptionField),

                isDataChanged : function() {
                    return this.isDirty();
                }
            }, me.descriptionConfig));

            // we have to wrap it in a panel since it'll be a tab in TabPanel
            // (to avoid some render bugs)
            me.descriptionPanel = Ext.create('Ext.panel.Panel', {
                border          : false,
                layout          : 'fit',
                items           : me.descriptionEditor
            });

            items.push(me.descriptionPanel);
        }

        // make sure that each panel has its title
        if (!me.projectForm.title) me.projectForm.title = me.L('generalText');
        if (me.descriptionPanel && !me.descriptionPanel.title) me.descriptionPanel.title = this.L('descriptionText');

        return items;
    },


    /**
     * Loads project data into the project editor.
     * **Note**, it's an alias for the {@link #loadTask} method.
     * @param {Gnt.model.Project} project Project to load to the editor.
     */
    loadProject : function (project) {
        this.loadTask.apply(this, arguments);
    },


    loadTask : function (project) {
        if (!project) return;

        this.task           = project;

        var projectForm     = this.projectForm;

        // on task loading step let's suppress task updating
        projectForm.setSuppressTaskUpdate(true);
        projectForm.getForm().reset();

        this.callParent(arguments);

        projectForm.loadRecord(project, this.taskBuffer);

        if (this.descriptionEditor) {
            this.descriptionEditor.setValue(project.getDescription());
        }

        this.setReadOnly(project.isReadOnly());

        // enable 'projectupdated' event processing back
        projectForm.setSuppressTaskUpdate(false);

        this.fireEvent('loadproject', this, project);
    },

    setReadOnly : function (readOnly) {
        var me      = this,
            project = me.task;

        this.callParent(arguments);

        if (project) {
            if (me.descriptionEditor) {
                me.descriptionEditor.setReadOnly(readOnly || !project.isEditable(project.descriptionField));
            }
        }
    },

    onTaskUpdated : function (record) {
        this.setReadOnly(record.isReadOnly());
    },

    /**
     * Persists editor data into the project instance.
     * **Note**, this is an alias for the {@link #updateTask} method.
     * @param {Gnt.model.Project} project Project to load to the editor.
     */
    updateProject : function () {
       this.updateTask();
    },


    // Since we do not need dependencies/assignments and resources copies
    // we override following methods to not fullfil corresponding store clones w/ data
    loadClonedDependencyStore   : Ext.emptyFn,
    loadClonedResourceStore     : Ext.emptyFn,
    loadClonedAssignmentStore   : Ext.emptyFn,


    doValidate : function(invalidComponentsAccFn) {
        var result = this.callParent(arguments);

        if (this.projectForm && !this.projectForm.isValid()) {
            result = false;
            invalidComponentsAccFn && invalidComponentsAccFn(this.getTabByComponent(this.projectForm));
        }

        return result;
    },

    doUpdateTask : function() {
        var me      = this,
            project = me.task;

        project.beginEdit();

        project.set(me.getTaskUpdateData(project, me.taskBuffer));

        me.descriptionEditor && project.set(project.descriptionField, me.descriptionEditor.getValue());

        project.maybeMarkChildrenForRescheduling();

        project.endEdit();
    },


    isDataChanged : function (changedComponentsAccFn) {
        var result    = this.callParent(arguments);

        if (this.projectForm && this.projectForm.isDataChanged()) {
            result = true;
            changedComponentsAccFn && changedComponentsAccFn(this.getTabByComponent(this.projectForm));
        }

        if (this.descriptionEditor && this.descriptionEditor.isDataChanged()) {
            result = true;
            changedComponentsAccFn && changedComponentsAccFn(this.getTabByComponent(this.descriptionEditor));
        }

        return result;
    },

    updateReadOnly : function () {
        var me             = this,
            widgetReadOnly = me.getReadOnly();

        me.projectForm && me.projectForm.setReadOnly(widgetReadOnly);
    },

    propagateTaskUpdate : function (callback, scope) {
        var me      = this,
            project = me.task;

        me.initRoboManager();

        project.propagateChanges(
            Ext.bind(me.propagateTaskUpdateChanger, me),
            function onPropagationComplete (cancelChanges, affectedTasks) {
                me.onTaskUpdatePropagationComplete(cancelChanges, affectedTasks);
                callback && callback.call(scope || me, cancelChanges, affectedTasks);
            },
            undefined,
            true, // async
            me.isTasksReschedulingNeeded() || undefined
        );
    },

    isTasksReschedulingNeeded : function () {
        var me      = this,
            project = me.task,
            data    = me.getTaskUpdateData(project, me.taskBuffer);

        return (project.getScheduleBackwards() ? data[project.endDateField] : data[project.startDateField]) || data.hasOwnProperty(project.scheduleBackwardsField);
    }

});
