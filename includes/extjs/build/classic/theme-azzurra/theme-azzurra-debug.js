Ext.define('ExtThemeCodaxyCore.panel.Panel', {
    override: 'Ext.panel.Panel',
    initComponent: function() {
        this.callParent();
        var me = this,
            header = me.header,
            title = me.getTitle(),
            tools = me.tools,
            icon = me.getIcon(),
            glyph = me.getGlyph(),
            iconCls = me.getIconCls(),
            hasIcon = glyph || icon || iconCls,
            headerPosition = me.getHeaderPosition();
        if (Ext.isObject(header) || (header !== false && (title || hasIcon) || (tools && tools.length) || me.collapsible || me.closable)) {
            this.cls = 'cx-header-docked-' + this.headerPosition + ' ' + this.cls;
        }
    }
});

Ext.define('Ext.window.WindowActiveCls', {
    override: 'Ext.window.Window',
    statics: {
        _activeWindow: null
    },
    shadow: false,
    ghost: false,
    ui: 'blue-window-active',
    setActive: function(active, newActive) {
        this.callParent(arguments);
        var me = this;
        if (!me.el)  {
            return;
        }
        
        if (Ext.getVersion().version >= '4.2.2.1144') {
            if (me.id.indexOf('window') == 0 && me.id.indexOf('-ghost') > 0)  {
                return;
            }
            
        }
        var paw = Ext.window.Window._activeWindow;
        if (active) {
            me.addCls('x-window-active');
            Ext.window.Window._activeWindow = me;
            if (paw && paw != me && paw.el) {
                paw.removeCls('x-window-active');
            }
        } else {
            if (me != paw)  {
                me.removeCls('x-window-active');
            }
            
        }
    }
});

Ext.define('ExtThemeCodaxyCore.tab.Panel', {
    override: 'Ext.tab.Panel',
    initComponent: function() {
        this.callParent();
        if (this.tabBarHeaderPosition >= 0) {
            this.cls = 'cx-header-tabbar ' + this.cls;
        }
        if (this.plain) {
            this.cls = 'cx-header-tabbar-plain ' + this.cls;
        }
        //class for removing panel-body border
        this.cls = 'cx-tab-position-' + this.tabPosition + ' ' + this.cls;
        //class for inheritance
        if (this.ui !== 'default') {
            this.cls = 'cx-ui-defined ' + this.cls;
        }
    }
});

//Ext.define('Ext.theme.azzurra-classic.toolbar.Breadcrumb', {
//    override: 'Ext.toolbar.Breadcrumb',
//    config: {
//        buttonUI: 'default-toolbar'
//    }
//});

