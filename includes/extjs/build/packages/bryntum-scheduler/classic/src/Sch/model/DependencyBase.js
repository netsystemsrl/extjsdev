/**
 * @class Sch.model.DependencyBase
 *
 * Base class used for both Ext Scheduler and Ext Gantt. Not intended to be used directly.
 */
Ext.define('Sch.model.DependencyBase', {
    extend             : 'Sch.model.Customizable',

    isDependencyModel  : true,

    inheritableStatics : {
        /**
         * @static
         * @property {Object} Type The enumerable object, containing names for the dependency types integer constants.
         */
        Type    : {
            StartToStart : 0,
            StartToEnd   : 1,
            EndToStart   : 2,
            EndToEnd     : 3
        }
    },

    idProperty         : 'Id',

    customizableFields : [
        /**
         * @field Id
         * The id of the dependency itself
         */
        // 3 mandatory fields
        /**
         * @field
         * The id of the event at which the dependency starts
         */
        { name : 'From' },
        /**
         * @field
         * The id of the event at which the dependency ends
         */
        { name : 'To' },
        /**
         * @field
         * An integer constant representing the type of the dependency:
         *
         * - 0 - start-to-start dependency
         * - 1 - start-to-end dependency
         * - 2 - end-to-start dependency
         * - 3 - end-to-end dependency
         */
        { name : 'Type', type : 'int', defaultValue : 2 },
        /**
         * @field
         * An optional CSS class that will be added to the rendered dependency elements.
         */
        { name : 'Cls', defaultValue : ''},

        /**
         * @field
         * A boolean indicating if a dependency goes both directions (default false).
         */
        { name : 'Bidirectional', type : 'boolean' },
        { name : 'FromSide', type : 'string' },
        { name : 'ToSide', type : 'string' },

        /**
         * @field
         * A field that keeps dependency highlight CSS classes.
         */
        { name : 'Highlighted', type : 'string', persist : false, defaultValue : '' }
    ],

    /**
     * @cfg {String} fromField The name of the field that contains the id of the source event.
     */
    fromField       : 'From',

    /**
     * @cfg {String} toField The name of the field that contains the id of the target event.
     */
    toField         : 'To',

    /**
     * @cfg {String} typeField The name of the field that contains the dependency type.
     */
    typeField       : 'Type',

    /**
     * @cfg {String} clsField The name of the field that contains a CSS class that will be added to the rendered dependency elements.
     */
    clsField        : 'Cls',

    /**
     * @cfg {String} bidirectionalField The name of the boolean field that controls if arrows should be drawn at both start and end points.
     */
    bidirectionalField  : 'Bidirectional',

    /**
     * @cfg {String} highlightedField The name of the field that controls dependency highlight state.
     */
    highlightedField    : 'Highlighted',

    constructor     : function(config) {
        var me = this;

        me.callParent(arguments);

        if (config) {
            // Allow passing in event instances too
            if (config[me.fromField] && config[me.fromField].isRangeModel) {
                me.setSourceEvent(config[me.fromField]);

                delete config.fromField;
            }

            if (config[me.toField] && config[me.toField].isRangeModel) {
                me.setTargetEvent(config[me.toField]);

                delete config.toField;
            }
        }
    },

    getEventStore : function() {
        return this.store.getEventStore();
    },

    /**
     * Returns the source event of the dependency
     *
     * @return {Sch.model.Event} The source event of this dependency
     */
    getSourceEvent : function(eventStore) {
        var me = this;
        return (eventStore || me.getEventStore()).getModelById(me.getSourceId());
    },

    /**
     * Sets the source event of the dependency
     *
     * @param {Sch.model.Event} event The new source event of this dependency
     */
    setSourceEvent : function(event) {
        this.setSourceId(event.getId());
    },

    /**
     * Returns the target event of the dependency
     *
     * @return {Sch.model.Event} The target event of this dependency
     */
    getTargetEvent : function(eventStore) {
        var me = this;
        return (eventStore || me.getEventStore()).getModelById(me.getTargetId());
    },

    /**
     * Sets the target event of the dependency
     *
     * @param {Sch.model.Event} event The new target event of this dependency
     */
    setTargetEvent : function(event) {
        this.setTargetId(event.getId());
    },

    /**
     * Returns the source event id of the dependency
     *
     * @return {Mixed} The id of the source event for the dependency
     *
     * @method getFrom
     */
    /**
     * Returns the source event id of the dependency
     *
     * @return {Mixed} The id of the source event for the dependency
     */
    getSourceId : function() { return this.getFrom(); },

    /**
     * Sets the source event id of the dependency
     *
     * @param {Mixed} id The id of the source event for the dependency
     *
     * @method setFrom
     */
    /**
     * Sets the source event id of the dependency
     *
     * @param {Mixed} id The id of the source event for the dependency
     */
    setSourceId : function(id) { return this.setFrom(id); },

    /**
     * Returns the target event id of the dependency
     *
     * @return {Mixed} The id of the target event for the dependency
     *
     * @method getTo
     */
    /**
     * Returns the target event id of the dependency
     *
     * @return {Mixed} The id of the target event for the dependency
     */
    getTargetId : function() { return this.getTo(); },

    /**
     * Sets the target event id of the dependency
     *
     * @param {Mixed} id The id of the target event for the dependency
     *
     * @method setTo
     */
    /**
     * Sets the target event id of the dependency
     *
     * @param {Mixed} id The id of the target event for the dependency
     */
    setTargetId : function(id) { return this.setTo(id); },

    /**
     * @method getType
     *
     * Returns the dependency type
     * @return {Mixed} The type of the dependency
     */

    /**
     * @method setType
     *
     * Sets the dependency type
     * @param {Mixed} type The type of the dependency
     */

    /**
     * @method getCls
     *
     * Returns the dependency CSS class (see {@link #Cls} field).
     *
     * @return {String} The CSS class
     */

    /**
     * @method setCls
     *
     * Sets the dependency CSS class (see {@link #Cls} field).
     *
     * @return {String} The CSS class
     */

    /**
     * Returns true if the linked events have been persisted (e.g. neither of them are 'phantoms')
     *
     * @return {Boolean} true if this model can be persisted to server.
     */
    isPersistable : function() {
        var me = this,
            source = me.getSourceEvent(),
            target = me.getTargetEvent();

        return source && !source.phantom && target && !target.phantom;
    },

    getDateRange : function() {
        var sourceTask = this.getSourceEvent();
        var targetTask = this.getTargetEvent();

        if (sourceTask && targetTask && sourceTask.isScheduled() && targetTask.isScheduled()) {
            var Type = this.self.Type;
            var sourceDate, targetDate;

            switch(this.getType()) {
                case Type.StartToStart:
                    sourceDate = sourceTask.getStartDate();
                    targetDate = targetTask.getStartDate();
                    break;

                case Type.StartToEnd:
                    sourceDate = sourceTask.getStartDate();
                    targetDate = targetTask.getEndDate();
                    break;

                case Type.EndToEnd:
                    sourceDate = sourceTask.getEndDate();
                    targetDate = targetTask.getEndDate();
                    break;

                case Type.EndToStart:
                    sourceDate = sourceTask.getEndDate();
                    targetDate = targetTask.getStartDate();
                    break;
            }

            return {
                start : Sch.util.Date.min(sourceDate, targetDate),
                end   : Sch.util.Date.max(sourceDate, targetDate)
            };
        }

        return null;
    },

    /**
     * Applies given CSS class to dependency, the value doesn't persist
     *
     * @param {String} cls
     */
    highlight : function (cls) {
        var me      = this,
            classes = me.getHighlighted().split(' ');

        if (!Ext.Array.contains(classes, cls)) {
            var newClasses = classes.concat(cls);

            me.setHighlighted(newClasses.join(' '));
        }
    },

    /**
     * Removes given CSS class from dependency if applied, the value doesn't persist
     *
     * @param {String} cls
     */
    unhighlight : function (cls) {
        var me      = this,
            classes = me.getHighlighted().split(' ');

        if (Ext.Array.contains(classes, cls)) {
            var newClasses = Ext.Array.remove(classes, cls);

            me.setHighlighted(newClasses.join(' '));
        }
    },

    /**
     * Checks if the given CSS class is applied to dependency.
     *
     * @param {String} cls
     * @return {Boolean}
     */
    isHighlightedWith : function (cls) {
        var me      = this,
            classes = me.getHighlighted().split(' ');

        return Ext.Array.contains(classes, cls);
    }
});
