// https://sencha.jira.com/browse/EXTJS-22621
// As of 6.2.0 Sencha does vertical scrolling on the scroller of the top grid panel
// so our view needs to relay 'scrollend' fired by the owner top grid until it's fixed by Sencha
Ext.define('Sch.patches.TablePanelScroll6.2', {
    extend     : 'Sch.util.Patch',

    target     : 'Ext.panel.Table',

    minVersion : '6.2.0',

    overrides : {
        afterRender : function () {
            this.callParent(arguments);

            if (this.lockedGrid) {
                this.lockedGrid.getView().relayEvents(this.getScrollable(), ['scrollend']);
                this.normalGrid.getView().relayEvents(this.getScrollable(), ['scrollend']);
            }
        }
    }
});