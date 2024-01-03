/**

@class Sch.view.SchedulerGridView
@extends Sch.view.TimelineGridView
@mixins Sch.mixin.SchedulerView

Empty class just consuming the Sch.mixin.SchedulerView mixin.

*/
Ext.define("Sch.view.SchedulerGridView", {
    extend              : 'Sch.view.TimelineGridView',
    mixins              : ['Sch.mixin.SchedulerView', 'Sch.mixin.GridViewCanvas', 'Sch.mixin.Localizable'],
    alias               : 'widget.schedulergridview'
}, function() {
    this.override(Sch.mixin.SchedulerView.prototype.inheritables() || {});
});

