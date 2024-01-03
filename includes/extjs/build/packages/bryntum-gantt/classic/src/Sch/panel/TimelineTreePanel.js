/**

 @class Sch.panel.TimelineTreePanel
 @extends Ext.tree.Panel
 @mixins Sch.mixin.TimelinePanel

 Internal class.

 */
Ext.define("Sch.panel.TimelineTreePanel", {
    extend              : "Ext.tree.Panel",
    requires            : [
        // need to require grid panel too here, because one of the sub-grids will be a normal grid
        'Ext.grid.Panel',
        'Ext.data.TreeStore',
        // will be used in the `setupLockableTree` of lockable mixin
        'Sch.mixin.FilterableTreeView'
    ],
    mixins              : [
        'Sch.mixin.Localizable',
        'Sch.mixin.TimelinePanel'
    ],
    alias               : [ 'widget.timelinetree'],

    useArrows           : true,
    rootVisible         : false,
    lockedXType         : 'treepanel',

    isTimelineTreePanel : true,

    initComponent : function () {
        this.callParent(arguments);
        this.getSchedulingView()._initializeTimelineView();
    }
}, function () {
    this.override(Sch.mixin.TimelinePanel.prototype.inheritables() || {});
});
