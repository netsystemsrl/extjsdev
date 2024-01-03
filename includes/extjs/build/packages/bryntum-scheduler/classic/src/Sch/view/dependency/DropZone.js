// @tag dependencies
/**
 * Drag drop functionality between two terminals
 * @private
 */
Ext.define('Sch.view.dependency.DropZone', {
    extend : 'Ext.dd.DropZone',

    mixins : {
        observable : 'Ext.util.Observable'
    },

    terminalSelector : null,
    dependencyStore  : null,
    toText           : null,
    startText        : null,
    endText          : null,
    view             : null,
    tipTpl           : null,

    // the tooltip instance shown when hovering over a target terminal
    tip              : null,

    constructor : function (el, config) {
        this.mixins.observable.constructor.call(this, config);

        this.callParent(arguments);
    },

    getTargetFromEvent : function (e) {
        return e.getTarget(this.terminalSelector);
    },

    // On entry into a target node, highlight that node.
    onNodeEnter : function (target, dd, e, data) {
        var me = this,
            targetRecord = me.view.resolveEventRecord(target),
            toSide = target.className.match(/sch-terminal-(\w+)/)[1],
            targetId = targetRecord.getId() || targetRecord.internalId,

            tplData = Ext.apply({
                toTask : targetRecord,
                toSide : toSide
            }, data.tplData);

        if (!me.tip) {
            me.tip = me.createTooltip();
        }

        data.valid = tplData.valid = me.isValidLink(data.fromId, targetId, dd.dragData.fromSide, toSide);

        me.tip.setData(tplData);
        me.tip.showBy(target);

        Ext.fly(target).addCls('sch-terminal-' + (data.valid ? 'valid' : 'invalid') + '-drop');
    },

    createTooltip : function () {
        var me = this;

        return new Ext.tip.ToolTip({
            tpl              : me.tipTpl,
            view             : me.view,
            cls              : 'sch-dependency-tip sch-create-dependency-tip',
            constrain        : true,
            anchor           : 't',
            trackMouse       : false,
            hideDelay        : 0,
            dismissDelay     : 0,
            delegate         : me.terminalSelector,
            target           : me.view.getEl(),
            constraintInsets : '7 -7 -7 7'
        });
    },

    // On exit from a target node, unhighlight that node.
    onNodeOut : function (target, dd, e, data) {
        data.valid = false;

        Ext.fly(target).removeCls(['sch-terminal-valid-drop', 'sch-terminal-invalid-drop']);
    },

    onNodeOver : function (target, dd, e, data) {
        return data.valid ? this.dropAllowed : this.dropNotAllowed;
    },

    onNodeDrop : function (target, dz, e, data) {
        var me = this,
            targetRec = me.view.resolveEventRecord(target),
            toSide    = target.className.match(/sch-terminal-(\w+)/)[ 1 ],
            targetId  = targetRec.getId() || targetRec.internalId,
            valid     = data.valid,
            newDependency   = me.createDependencyModel(dz.dragData.fromId, targetId, data.fromSide, toSide);

        me.fireEvent('drop', me, newDependency, valid);

        me.fireEvent('afterdrop', me);

        return valid;
    },

    createDependencyModel : function(fromId, toId, fromSide, toSide) {
        var dependencyStore = this.dependencyStore,
            newDependency   = new (dependencyStore.getModel())();

        newDependency.setSourceId(fromId);
        newDependency.setTargetId(toId);
        // Gantt uses different model, where sides doesn't need to be stored
        // Would be nicer to make subclasses for scheduler and gantt but too much work at the moment
        newDependency instanceof Sch.model.Dependency && newDependency.setFromSide(fromSide);
        newDependency instanceof Sch.model.Dependency && newDependency.setToSide(toSide);
        newDependency.setType(newDependency.getTypeFromSides(fromSide, toSide, this.view.rtl));

        return newDependency;
    },

    isValidLink : function (fromId, toId, fromSide, toSide) {
        var newDependency   = this.createDependencyModel(fromId, toId, fromSide, toSide);

        return this.dependencyStore.isValidDependency(newDependency);
    },

    destroyTip : function () {
        var me = this;

        me.tip && me.tip.destroy();
        me.tip = null;
    },

    destroy : function () {
        var me = this;

        me.destroyTip();
        me.callParent(arguments);
    }
});
