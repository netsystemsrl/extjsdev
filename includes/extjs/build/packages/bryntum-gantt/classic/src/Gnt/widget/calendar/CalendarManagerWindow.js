/**

 @class Gnt.widget.calendar.CalendarManagerWindow
 @extends Ext.window.Window
 @aside guide gantt_calendars

 {@img gantt/images/calendar_manager_window.png}

 This is just a {@link Gnt.widget.calendar.CalendarManager} widget, wrapped with the Ext.window.Window instance.
 It proxies the {@link #calendar} config and {@link #applyChanges} method.

 */
Ext.define('Gnt.widget.calendar.CalendarManagerWindow', {
    extend : 'Ext.window.Window',

    requires : ['Gnt.widget.calendar.CalendarManager'],

    mixins : ['Gnt.mixin.Localizable'],

    alias : 'widget.calendarmanagerwindow',

    layout : 'fit',
    border : false,

    constrain : true,

    defaultFocus : 'btnCancel',

    /**
     * @cfg {Object} calendarConfig An object to be applied to the newly created instance of the {@link Gnt.widget.calendar.Calendar}
     */
    calendarConfig : null,

    /**
     * @cfg {Gnt.data.CalendarManager} calendarManager An instance of the {@link Gnt.data.CalendarManager}
     */
    calendarManager : null,

    /**
     * @property {Gnt.widget.calendar.Calendar} panel The underlying calendar widget instance
     */
    panel : null,

    /**
     * @cfg {Boolean} readOnly Set to true to disable editing
     */
    readOnly            : false,

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:
     *
     * - title           : 'Calendar manager',
     * - ok              : 'Ok',
     * - cancel          : 'Cancel',
     * - confirm_action  : 'Confirm action',
     * - confirm_message : 'Calendar has unsaved changes. Would you like to save your changes?'
     */

    closing : false,


    initComponent : function () {

        this.panel = new Gnt.widget.calendar.CalendarManager({
            readOnly            : this.readOnly,
            calendarManager     : this.calendarManager,
            calendarPanelConfig : this.calendarConfig
        });

        // Only constrain width/height this way if user haven't set size
        Ext.applyIf(this, {
            width  : Math.min(Ext.getBody().getWidth() - 100, 1050),
            height : Math.min(Ext.getBody().getHeight() - 100, 700)
        });

        Ext.apply(this, {
            title   : this.title || this.L('title'),
            items   : [this.panel],
            buttons : [
                {
                    text    : this.L('ok'),
                    hidden  : this.readOnly,
                    handler : function () {
                        this.applyChanges();
                    },
                    scope   : this
                },
                {
                    text    : this.L('cancel'),
                    itemId  : 'btnCancel',
                    handler : function () {
                        this.close();
                    },
                    scope   : this
                }
            ],

            listeners : {
                beforeclose : this.onBeforeClose,
                close       : this.onAfterClose,
                show        : this.onAfterShow
            }
        });

        this.callParent(arguments);
    },

    /**
     * Call this method when user is satisfied with the current state of the calendar in the UI. It will apply all the changes made in the UI
     * to the original calendar.
     */
    applyChanges : function () {
        this.panel.applyChanges();
    },

    onBeforeClose : function () {
        var me    = this;
        var panel = this.panel;

        if (!me.closing && panel.hasChanges()) {
            Ext.Msg.show({
                title   : me.L('confirm_action'),
                msg     : me.L('confirm_message'),
                buttons : Ext.Msg.YESNOCANCEL,
                icon    : Ext.Msg.QUESTION,
                fn      : function (btn) {
                    switch (btn) {
                        case 'yes' :
                            panel.applyChanges();
                            me.close();
                            break;
                        case 'no' :
                            // set flag to skip this onBeforeClose processing again when we call me.close()
                            me.closing = true;
                            me.close();
                            break;
                    }
                }
            });

            return false;
        }
    },

    onAfterClose : function () {
        this.closing = false;
    },

    onAfterShow : function () {
        this.focus();
    }

});
