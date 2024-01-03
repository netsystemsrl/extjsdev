//http://maschek.hu/imagemap/imgmap/
//https://github.com/maschek/imgmap
Ext.define('imagemap', {
    extend: 'Ext.Component',
    alias: 'widget.imagemap',

    hotZone: '',
    qtip: '',

    autoEl: {
        tag: 'img',
        src: Ext.BLANK_IMAGE_URL,
        border: 1
    },

    onRender: function (ct, position) {
        imagemap.superclass.onRender.call(this, ct, position);
        var el;
        this.autoEl = Ext.apply({}, this.initialConfig, this.autoEl);

        el = this.getEl();
        el.on('click', this.onClick, this);
        el.on('mousemove', this.onMouseMove, this);
    },

    onMouseMove: function (e) {
        var x, y, xy, elxy, EQ;
        var currentHotZone;

        elxy = this.el.getXY();

        xy = e.getXY();

        x = xy[0] - elxy[0];
        y = xy[1] - elxy[1];

        currentHotZone = '';
        if (typeof this.hotspots !== 'undefined') {
            Ext.each(this.hotspots, function (hs) {
                if (x >= hs.left && x <= hs.right && y >= hs.top && y <= hs.bottom) {
                    currentHotZone = hs.name;
                    this.qtip = hs.qtip;
                }
            }, this);
        }

        if (currentHotZone !== '') {
            if (currentHotZone !== this.hotZone) {
                ConsoleLog('Entered zone ' + currentHotZone);
                this.el.setStyle('cursor', 'pointer');
                if (this.qtip !== '') {
                    EQ = Ext.QuickTips;
                    EQ.register({
                        target: this.el,
                        text: this.qtip
                    });
                    EQ.getQuickTip().showForTarget(this.el);
                }
            }
        } else {
            if (this.hotZone !== '') {
                this.el.setStyle('cursor', 'default');
                ConsoleLog('Leaving zone ' + this.hotZone);
                if (this.qtip !== '') {
                    EQ = Ext.QuickTips;
                    EQ.getQuickTip().hide();
                    EQ.unregister(this.el);
                    this.qtip = '';
                }
            }
        }

        this.hotZone = currentHotZone;
    },

    onClick: function (e) {
        ConsoleLog('clicked ' + this.hotZone);
    }
});

Ext.application({
    name: 'Fiddle',
    launch: function () {
        Ext.create('Ext.panel.Panel', {
            anchor: "100% 100%",
            height: 200,
            items: [{
                xtype: 'imagemap',
                src: 'http://www.howtocreate.co.uk/tutorials/jsexamples/imagemap.png',
                hotspots: [{
                    name: 'hotspot1',
                    top: 65,
                    left: 23,
                    bottom: 120,
                    right: 80
                }, {
                    name: 'hotspot2',
                    top: 140,
                    left: 36,
                    bottom: 180,
                    right: 95
                }]
            }, {
                xtype: 'button',
                reference: 'browsebutton',
                text: "Click me to update layout",
                handler: function () {
                    this.up('panel').updateLayout();
                }
            }],
            renderTo: Ext.getBody()
        });

    }
});
