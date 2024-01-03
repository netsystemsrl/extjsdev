// @tag dependencies
/**
 * Drag drop functionality between two terminals
 * @private
 */
Ext.define('Sch.view.dependency.DragZone', {
    extend : 'Ext.dd.DragZone',
    alias  : 'schdependencydragzone.default',

    requires : [
        'Sch.template.DependencyInfo',
        'Sch.view.dependency.DropZone',
        'Sch.util.ScrollManager'
    ],

    mixins : {
        factoryable : 'Ext.mixin.Factoryable',
        observable  : 'Ext.util.Observable'
    },

    terminalSelector  : null,
    view              : null,
    fromText          : null,
    toText            : null,
    startText         : null,
    endText           : null,
    rtl               : false,
    useLineProxy      : true,
    dependencyStore   : null,
    tipTpl            : null,
    animationDuration : 400,
    checkDraggingFlag : true,

    constructor : function(config) {
        var me = this;

        me.mixins.observable.constructor.call(this, config);

        me.callParent([config.view.getEl(), config]);

        me.tipTpl = me.tipTpl || new Sch.template.DependencyInfo();

        if (!(me.tipTpl instanceof Ext.Template)) {
            me.tipTpl = new Ext.XTemplate(me.tipTpl);
        }

        me.dropZone = me.createDropZone();

        me.relayEvents(me.dropZone, [
            'drop',
            'afterdrop'
        ]);

        // #3434 - ScrollManager is active in IE which result in scrolling bug in rtl example
        me.on({
            dragstart   : me.onDependencyDragStart,
            afterdrop   : me.onDependencyAfterDrop,
            scope       : me
        });
    },

    onDependencyDragStart : function () {
        Sch.util.ScrollManager.activate(this.view);
    },

    onDependencyAfterDrop : function () {
        Sch.util.ScrollManager.deactivate();

        this.dropZone.destroyTip();
    },

    createDropZone : function () {
        return new Sch.view.dependency.DropZone(this.el, this.getDropZoneConfig());
    },

    getDropZoneConfig : function () {
        return {
            rtl              : this.rtl,
            terminalSelector : this.terminalSelector,
            ddGroup          : this.ddGroup,
            view             : this.view,
            dependencyStore  : this.dependencyStore,
            tipTpl           : this.tipTpl
        };
    },

    initLineProxy : function (sourceNode) {
        var me               = this,
            scroll           = me.view.getScroll(),
            offsets          = Ext.fly(sourceNode).getOffsetsTo(me.view.el),
            halfTerminalSize = Ext.fly(sourceNode).getWidth() / 2,
            posX             = offsets[ 0 ] + halfTerminalSize,
            posY             = offsets[1] + halfTerminalSize,
            side             = me.rtl ? 'right' : 'left';

            posX             = posX + scroll.left;
            posY             = posY;

            me.lineProxyEl   = me.el.createChild({
                cls   : 'sch-dependency-connector-proxy',
                style : 'top:' + posY + 'px;' + side + ':' + posX + 'px'
            });

        Ext.apply(me, {
            startXY         : [ posX, posY ],
            startScrollLeft : scroll.left,
            startScrollTop  : scroll.top
        });
    },

    updateLineProxy : function (pageXY) {
        var me         = this,
            scrollingPageEl  = (document.scrollingElement || document.documentElement || document.body),
            scroll     = me.view.getScroll(),
            viewElRect = me.view.el.dom.getBoundingClientRect(),
            newLocalX  = pageXY[0] - me.view.getX(),
            diffX      = (me.rtl ? me.startXY[0] - newLocalX - scroll.left: newLocalX - me.startXY[0] + scroll.left)  - scrollingPageEl.scrollLeft,
            diffY      = pageXY[1] - viewElRect.top - me.startXY[1] - scrollingPageEl.scrollTop,
            newHeight  = Math.max(1, Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2)) - 2),
            // Calculate new angle relative to start XY
            rad        = Math.atan2(diffY, diffX) - (Math.PI / 2);

        me.lineProxyEl.setStyle({
            "height"    : newHeight + 'px',
            "transform" : 'rotate(' + rad + 'rad)'
        });
    },

    // On receipt of a mousedown event, see if it is within a draggable element.
    // Return a drag data object if so. The data object can contain arbitrary application
    // data, but it should also contain a DOM element in the ddel property to provide
    // a proxy to drag.
    getDragData : function (e) {
        var me         = this,
            sourceNode = e.getTarget(me.terminalSelector);

        if (e.button === 0 && sourceNode) {
            var sourceTaskRecord = me.view.resolveEventRecord(sourceNode);

            if (me.fireEvent('beforedrag', me, sourceTaskRecord) === false) {
                return null;
            }

            var side    = sourceNode.className.match(/sch-terminal-(\w+)/)[ 1 ],
                tplData = {
                    fromTask : sourceTaskRecord,
                    fromSide : side
                },

                ddel    = document.createElement('div');

            // Force the source terminal to stay visible
            sourceNode.style.display = 'block';

            return {
                fromId         : sourceTaskRecord.getId() || sourceTaskRecord.internalId,
                fromSide       : side,
                tplData        : tplData,
                repairXY       : Ext.fly(sourceNode).getXY(),
                ddel           : ddel,
                valid          : false,
                sourceTerminal : sourceNode
            };
        }

        return false;
    },

    onStartDrag : function (x, y) {
        var me         = this,
            dd         = me.dragData,
            sourceNode = dd.sourceTerminal,
            sideCls    = sourceNode.className.match(/sch-terminal-(\w+)/)[ 0 ];

        me.fireEvent('dragstart', me);

        if (me.useLineProxy) {
            me.initLineProxy(sourceNode, dd.isStart);
            me.lineProxyEl.show();
        }

        // Not interested in any Ext drag proxy being visible
        me.proxy.setStyle('display', 'none');

        // Hide other terminals inside the event node
        Ext.fly(dd.sourceTerminal.parentNode).select('.sch-terminal:not(.' + sideCls + ')').addCls('sch-terminal-hidden');
    },

    onDrag : function (e, t) {
        this.useLineProxy && this.updateLineProxy(e.getXY());
    },

    // Override, get rid of weird highlight fx in default implementation
    afterRepair : function () {
        var me = this;

        me.dragging = false;

        if (!me.destroyed) {
            me.fireEvent('afterdrop', me.dropZone);
        }
    },

    onMouseUp : function () {
        var me = this;

        me.el.removeCls('sch-terminals-visible');

        me.dragData.sourceTerminal.style.display = '';

        if (me.lineProxyEl) {
            var el = me.lineProxyEl;

            el.animate({
                to       : { height : 0 },
                duration : me.animationDuration,
                callback : function () {
                    Ext.destroy(el);
                }
            });

            me.lineProxyEl = null;
        }
    },

    // Provide coordinates for the proxy to slide back to on failed drag.
    // This is the original XY coordinates of the draggable element.
    getRepairXY : function () {
        return this.dragData.repairXY;
    },

    destroy : function () {
        var me = this;

        Ext.destroy([
            me.lineProxyEl,
            me.dropZone
        ]);

        me.callParent(arguments);
    }
});
