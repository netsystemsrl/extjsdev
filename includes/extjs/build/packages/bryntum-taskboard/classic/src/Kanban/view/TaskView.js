/**

 @class Kanban.view.TaskView
 @extends Ext.view.View

 A task view class used internally by the Kanban Panel, based on the {@link Ext.view.View} class, showing a
 plain list of {@link Kanban.model.Task tasks}.
 */
Ext.define('Kanban.view.TaskView', {
    extend : 'Ext.view.View',
    alias  : 'widget.taskview',

    requires        : [
        "Kanban.template.Task",
        "Kanban.data.ViewStore"
    ],

    // Inherited configs
    autoScroll      : true,
    trackOver       : true,
    overItemCls     : 'sch-task-over',
    selectedItemCls : 'sch-task-selected',
    itemSelector    : '.sch-task',

    // Class configs & properties
    state           : null,

    /**
     * @cfg {String} taskBodyTpl The template to use for the task body rendering
     */

    /**
     * @cfg {String} resourceImgTpl The template to use for the user image
     */

    /**
     * @cfg {String} taskToolTpl The template to use for any tools that should be shown at the bottom of a task box.
     */

    /**
     * @cfg {String} menuIconTpl The template to use for the task menu icon
     */

    /**
     * A renderer template method intended to be overwritten to supply custom values for the template used to render a task.
     * This is called once every time a task is rendered and two arguments are passed, the task record and a 'renderData' object containing
     * the properties that will be applied to the template. In addition to the prepopulated renderData properties such as task 'Name', 'Id' etc you can also
     * supply a 'cls' (added as a CSS class) property and 'style' (added as inline styles) to programmatically change the appearance of tasks in the list.

     * @param {Kanban.model.Task} task The task record
     * @param {Object} renderData The object that will be applied to the template
     */
    taskRenderer : function(task, renderData) {},

    initComponent : function () {
        var me = this;
        
        if (me.store && me.store.model) {
            me.tpl = new Kanban.template.Task({
                model          : me.store.model,
                resourceImgTpl : me.resourceImgTpl,
                taskToolTpl    : me.taskToolTpl,
                taskBodyTpl    : me.taskBodyTpl,
                menuIconTpl    : me.menuIconTpl
            });
        } else {
            me.tpl = new Ext.XTemplate('');
        }

        me.addCls('sch-taskview sch-taskview-state-' + me.state.replace(/\s/g, '-'));

        me.callParent(arguments);
    },

    bindStore   : function (store) {
        // can be ext-empty-store
        if (store && store.model) {
            this.tpl = new Kanban.template.Task({
                model          : store.model,
                resourceImgTpl : this.resourceImgTpl,
                taskToolTpl    : this.taskToolTpl,
                taskBodyTpl    : this.taskBodyTpl,
                menuIconTpl    : this.menuIconTpl
            });
        }

        this.callParent(arguments);
    },

    // ViewSelector UX breaks after a view refresh :/
    // http://www.sencha.com/forum/showthread.php?293015-DragSelector-UX-broken-after-view-refresh&p=1069838#post1069838
    refresh : function() {
        var el            = this.getEl();
        var selectorProxy = el.down('.' + Ext.baseCSSPrefix + 'view-selector');

        if (selectorProxy) {
            el.removeChild(selectorProxy);
        }

        this.callParent(arguments);

        if (selectorProxy) {
            el.appendChild(selectorProxy);
        }
    },

    collectData : function(records) {
        var collected = this.callParent(arguments),
            result    = [];

        for (var i = 0; i < collected.length; i++) {
            // collected[i] is reference to the record[i].data
            // we don't want to pollute it so lets make a new object instead
            var taskRenderData  = Ext.apply({}, collected[i]);
            var task            = records[i];
            var user            = task.getResource();
            var userImgUrl      = user && user.getImageUrl();

            taskRenderData.resourceImageCls = '';
            taskRenderData.resourceImageUrl = userImgUrl || Ext.BLANK_IMAGE_URL;
            taskRenderData.taskImageUrl     = task.getImageUrl();
            taskRenderData.task             = task;
            taskRenderData.name             = task.getName();

            if (!userImgUrl) {
                taskRenderData.resourceImageCls = "sch-no-img";
            }

            this.taskRenderer(task, taskRenderData);

            if (task.phantom) {
                taskRenderData.cls = (taskRenderData.cls || '') + " sch-phantom-task";
            }

            result.push(taskRenderData);
        }

        return result;
    }
});
