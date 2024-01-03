/**
 @class Robo.Transaction

 This class encapsulates a single undo/redo transaction used with the {@link Robo.Manager}.

 Transaction consists from at least one action {@link Robo.action.Base}

 */
Ext.define('Robo.Transaction', {

    actions : null,

    /**
     * @cfg {String} title
     *
     * A human-readable name for this transaction.
     */
    title : null,

    constructor : function (config) {
        config = config || {};

        Ext.apply(this, config);

        this.callParent([config]);

        this.actions = [];
    },

    /**
     * Checks wheither a transaction has any actions recorded
     *
     * @return {Boolean}
     */
    hasActions : function () {
        return this.actions.length > 0;
    },

    addAction : function (action) {
        this.actions.push(action);
    },

    getActions : function () {
        return this.actions;
    },

    /**
     * Undoes this transaction. Generally should not be called directly.
     */
    undo : function () {
        for (var i = this.actions.length - 1; i >= 0; i--) {
            this.actions[i].undo();
        }
    },

    /**
     * Redoes this transaction. Generally should not be called directly.
     */
    redo : function () {
        for (var i = 0; i < this.actions.length; i++) {
            this.actions[i].redo();
        }
    },

    /**
     * Returns the title for this transaction. If not provided explicitly, a title of the first action is returned.
     *
     * @return {String}
     */
    getTitle : function () {
        if (this.title) return this.title;

        var firstAction = this.actions[0];

        return firstAction ? firstAction.getTitle() : null;
    }
});
