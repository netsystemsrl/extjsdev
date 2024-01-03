/**
 @class Gnt.template.Deadline
 @extends Ext.XTemplate

 Template class rendering deadline markers.
 */
Ext.define("Gnt.template.Deadline", {
    extend         : 'Ext.XTemplate',
    mixins         : ['Gnt.mixin.Localizable'],

    disableFormats : true,
    markup         : '<div data-qtip="__DEADLINE__:  {date}" data-qalign="b-tl" class="gnt-deadline-indicator {cls}" style="{dir}:{offset}px"></div>',

    constructor : function () {
        this.markup = this.markup.replace(/__DEADLINE__/, this.L('deadline'));

        this.callParent([this.markup]);
    }
});
