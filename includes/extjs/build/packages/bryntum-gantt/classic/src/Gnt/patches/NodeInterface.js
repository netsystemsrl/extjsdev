// https://app.assembla.com/spaces/bryntum/tickets/9503-task-not-marked-as-modified-after-node-reordering/details#
Ext.define('Gnt.patches.NodeInterface', {
    extend: 'Sch.util.Patch',

    target: 'Gnt.model.Task',

    overrides: {
        /**
         * Updates general data of this node like isFirst, isLast, depth. This
         * method is internally called after a node is moved. This shouldn't
         * have to be called by the developer unless they are creating custom
         * Tree plugins.
         * @protected
         * @param {Boolean} commit
         * @param {Object} info The info to update. May contain any of the following
         *  @param {Object} info.isFirst
         *  @param {Object} info.isLast
         *  @param {Object} info.index
         *  @param {Object} info.depth
         *  @param {Object} info.parentId
         *  @return {String[]} The names of any persistent fields that were modified.
         */
        updateInfo: function(commit, info) {
            if (commit && typeof commit !== 'boolean') {
                commit = commit.commit;
            }

            return this.callParent([commit, info]);
        }
    }
});
