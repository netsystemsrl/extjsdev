/**
 * This mixin provides a grid view component with more canvases it can draw onto.
 *
 * There're two kinds of canvases provided:
 *  - secondary canvases which are created once and are outside of a node container
 *  - items canvases which might be deleted by the grid's original view and thus might be constantly recreated when
 *    requested, items canvases are created within node container, i.e. somewhere alongside item corresponding
 *    HTML elements
 *
 * NOTE: regardles of a canvas type a canvas consummer shall not store canvas reference, it shall always re-request
 *       a canvas.
 */
Ext.define('Sch.mixin.GridViewCanvas', {

    extend : 'Ext.Mixin',

    mixinConfig : {
        after : {
            'onRender' : 'afterOnRender'
        }
    },

    secondaryCanvasCls      : 'sch-secondary-canvas',
    secondaryCanvasLayerCls : 'sch-secondary-canvas-layer',

    itemsCanvasEl           : null,
    itemsCanvasCls          : 'sch-item-canvas',
    itemsCanvasLayerCls     : 'sch-item-canvas-layer',

    /**
     * Returns a sub canvas el - the el to be used for drawing column lines, zones etc
     *
     * @return {Ext.dom.Element}
     */
    getSecondaryCanvasEl : function() {
        var el = null;

        if (this.isItemCanvasAvailable()) {
            el = this.getItemCanvasEl(-1, {
                tag  : 'div',
                role : 'presentation',
                cls  : this.secondaryCanvasCls
            });
        }

        return el;
    },

    /**
     * Returns true if canvas is available.
     *
     * @param {Number} [layer]  Use this to fine grain the query to the presence of a specific layer
     *
     * @return {Boolean}
     */
    isItemCanvasAvailable : function(layer) {
        var me = this;
        return !!(
            me.rendered && !me.destroyed && (
                me.getNodeContainer() || me.itemsCanvasEl && (
                    me.itemsCanvasEl._underMixinControl || !Ext.isGarbage(me.itemsCanvasEl.dom)
                )
            )
        );
    },

    /**
     * Returns true if canvas is present (in the dom).
     *
     * @param {Number} [layer]  Use this to fine grain the query to the presence of a specific layer
     *
     * @return {Boolean}
     */
    isItemCanvasPresent : function(layer) {
        var me = this;
        return !!(
            me.rendered && !me.destroyed && me.itemsCanvasEl && (
                layer === undefined || (
                    me.itemsCanvasEl[layer] && (
                        me.itemsCanvasEl._underMixinControl || !Ext.isGarbage(me.itemsCanvasEl[layer].dom)
                    )
                )
            )
        );
    },

    /**
     * Returns a sub canvas element or it's child layer. This canvas element is attached to view's node
     * container, the canvas is volatile since node container contents are built using a template which has no
     * information about canvas element attached as node container's child. Thus one shouldn't cache the element instance
     * returned.
     *
     * @param {Number} layer
     * @param {Object|Function|String} layerCreationSpecification
     * @return {Ext.dom.Element}
     */
    getItemCanvasEl : function(layer, layerCreationSpecification) {
        var me = this,
            canvasEl = me.itemsCanvasEl,
            layerEl = canvasEl;

        // <debug>
        Ext.Assert && Ext.Assert.truthy(me.isItemCanvasAvailable(), "Can't get sub canvas element, view's node container isn't rendered yet");
        // </debug>

        if (!canvasEl || !canvasEl.dom || (!canvasEl._underMixinControl && (Ext.isGarbage(canvasEl.dom)))) {
            layerEl = canvasEl = me.itemsCanvasEl = Ext.fly(me.getNodeContainer()).insertFirst({
                cls : me.itemsCanvasCls
            });
        }

        if (arguments.length > 0) {

            layer = layer || 0;
            layerEl = canvasEl[layer] ||
                      Ext.dom.Query.selectNode('[data-sch-secondary-canvas-layer="' + layer + '"]', canvasEl.dom);

            // Make sure the element has not been wiped out of the DOM by the Ext JS buffered rendering
            if (!layerEl || !layerEl.dom || (!canvasEl._underMixinControl && Ext.isGarbage(layerEl.dom))) {

                layerEl = canvasEl.createChild(
                    (Ext.isFunction(layerCreationSpecification) ? layerCreationSpecification() : layerCreationSpecification) || {
                        tag : 'div'
                    }
                );

                layerEl.set({'data-sch-secondary-canvas-layer' : layer});
                layerEl.setStyle('zIndex', layer);
                layerEl.addCls(me.itemsCanvasLayerCls);

                canvasEl[layer] = layerEl;
            }
        }

        return layerEl;
    },

    afterOnRender : function() {
        if (this.bufferedRenderer) {
            this.on('viewready', this.onBufferedRendererViewReady, this);
        }
    },

    // Prevent Ext JS from destroying our item canvas element, which would mean we had to re-render its contents
    // constantly when scrolling fast which kills the frame rate
    onBufferedRendererViewReady : function() {
        var me = this,
            targetBufferedPlugin = Ext.getVersion().isGreaterThan('6.5.3') ? this.grid.up('tablepanel').lockedGrid.bufferedRenderer : me.bufferedRenderer,
            oldOnRangeFetched = targetBufferedPlugin.onRangeFetched;

        targetBufferedPlugin.onRangeFetched = function() {
            var itemsCanvas = me.getItemCanvasEl(),
                nodeContainer = me.getNodeContainer(),
                retVal;

            itemsCanvas._underMixinControl = true;
            itemsCanvas.dom.parentNode && itemsCanvas.dom.parentNode.removeChild(itemsCanvas.dom);

            retVal = oldOnRangeFetched.apply(this, arguments);

            nodeContainer.insertBefore(itemsCanvas.dom, nodeContainer.firstChild);
            delete itemsCanvas._underMixinControl;

            return retVal;
        };
    }
});
