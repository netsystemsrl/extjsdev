/**
 * @class Kanban.model.Task
 *
 * A data model class describing a task in your Kanban board. You can assign it to a resource using the {@link #assign} method or by
 * setting the 'ResourceId' property directly in the data (using {@link #setResourceId} or {@link setResource}).
 *
 * You can of course also subclass this class like you would with any other Ext JS class and add your own custom fields.
 *
 * ```javascript
 *     Ext.define('MyTask', {
 *         extend : 'Kanban.model.Task',
 *
 *         fields : [
 *             { name : 'NbrComments', type : 'int' },
 *             { name : 'Attachments', type : 'int' }
 *         ],
 *
 *         // Define the states your tasks can be in
 *         states            : [
 *             'NotStarted',
 *             'InProgress',
 *             'Test',
 *             'Acceptance',
 *             'Done'
 *         ],
 *
 *         // Here you can control which state transitions are allowed
 *         isValidTransition : function (state) {
 *             return true;
 *         }
 *     })
 * ```
 */
Ext.define('Kanban.model.Task', {
    extend        : 'Sch.model.Event',

    alias         : 'model.kanban_taskmodel',

    resourceStore : null,

    /**
     * @cfg {String[]} states The names of the possible states that a task can be in. Default states are ["NotStarted", "InProgress", "Test", "Done"].
     */
    states        : [
        'NotStarted',
        'InProgress',
        'Test',
        'Done'
    ],

    customizableFields      : [

        /**
         * @field State
         * @type {String}
         * The state of the the task, should be one of the values listed in the {@link #states} array.
         */
        { name : 'State', defaultValue : 'NotStarted' },

        /**
         * @field Position
         * @type {Number}
         * The order/position of the tasks in each state column.
         */
        { name : 'Position', type : 'int' },

        /**
         * @field CreatedDate
         * @type {Date}
         * The date when the task was created.
         */
        { name : 'CreatedDate', type : 'date' },

        /**
         * @field ImageUrl
         * @type {String}
         * The url of an image to be shown in the task element
         */
        { name : 'ImageUrl' }
    ],

    constructor : function() {
        this.callParent(arguments);

        if (this.phantom && !this.getCreatedDate()) {
            this.setCreatedDate(new Date());
        }
    },

    /**
     * @cfg {String} stateField The name of the field that defines the task state. Defaults to "State".
     */
    stateField  : 'State',

    /**
     * @cfg {String} imageUrlField The name of the field that defines the task image url. Defaults to "ImageUrl".
     */
    imageUrlField  : 'ImageUrl',

    /**
     * @cfg {String} createdDateField The name of the field that defines the task state. Defaults to "CreatedDate".
     */
    createdDateField  : 'CreatedDate',

    /**
     * @cfg {String} positionField The name of the field that defines the task order. Defaults to "Position".
     */
    positionField  : 'Position',

    /**
     * @method getResource
     *
     * Returns the resource that is assigned to this task.
     * @return {Kanban.model.Resource} The resource
     */

    /**
     * @method setResource
     *
     * Assigns a new resource to this task.
     * @param {Kanban.model.Resource} resource The resource
     */

    /**
     * @method getPosition
     *
     * Returns the position of this task within it's current {@link Kanban.view.TaskView view}.
     * @return {Number} The position
     */

    /**
     * @method setPosition
     *
     * Sets the position of this task within it's current {@link Kanban.view.TaskView view}.
     * @param {Number} The position
     */

    /**
     * @method setResource
     *
     * Sets the new position of this task within it's current {@link Kanban.view.TaskView view}.
     * @param {Number} The new position
     */

    /**
     * @method getState
     *
     * Returns the state identifier of this task
     * @return {String} The state
     */

    /**
     * @method setState
     *
     * Sets the state identifier of this task
     * @param {String} The state
     */

    /**
     * @method getCreatedDate
     *
     * Returns the created date for this task
     * @return {Date} The created date
     */

    /**
     * @method setCreatedDate
     *
     * Sets the created date for this task
     * @param {Date} The created date
     */

    /**
     * @method getImageUrl
     *
     * Returns the image URL for this task
     * @return {String} The created date
     */

    /**
     * @method setImageUrl
     *
     * Sets the image URL for this task
     * @param {String} The created date
     */

    /**
     * Returns the associated user store of this task.
     *
     * @return {Kanban.data.ResourceStore} The user store
     */
    getResourceStore : function() {
        if (!this.resourceStore) {
            Ext.Array.each(this.joined, function(store) {
                if (store.resourceStore) {
                    this.resourceStore = store.resourceStore;

                    return false;
                }
            }, this);
        }

        return this.resourceStore;
    },

    /**
     * @method isValidTransition
     *
     * Override this method to define which states are valid based on the current task state. If you want to allow all,
     * simply create a method which always returns true.
     *
     * @param {String} toState The new state of this task
     * @return {Boolean} true if valid
     */
    isValidTransition : function (toState) {
        var currentState = this.getState();

        // Always allow reordering in same column
        if (currentState === toState) return true;

        switch (this.getState()) {
            case "NotStarted":
                return toState == "InProgress";
            case "InProgress":
                return toState != "Done";
            case "Test":
                return toState != "NotStarted";
            case "Done":
                return toState == "Test" || toState == "InProgress";

            default:
                return true;
        }
    }
});
