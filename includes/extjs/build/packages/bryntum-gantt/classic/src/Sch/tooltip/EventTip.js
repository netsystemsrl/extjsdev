/**
 * Special tooltip class which is used to show information from {@link Sch.mixin.TimelineView#tooltipTpl} template
 *
 * Overrides some tooltip methods to properly align and constrain event tooltip within {@link Ext.component.constrainTo}
 * region with respect to {@link Ext.component.constraintInsets}.
 *
 * @private
 */
Ext.define("Sch.tooltip.EventTip", {
    extend : "Ext.tip.ToolTip",

    alias : "widget.scheduler_eventtip",

    uses : [
        'Ext.Number',
        'Ext.util.Format',
        'Ext.util.Region',
        'Ext.util.Point'
    ],

    config : {
        view : null
    },

    componentCls : 'sch-tooltip-eventtip',

    anchor           : 't',
    constraintInsets : '7 -7 -7 7',
    allowOver        : true,

    initComponent : function () {
        var me = this;

        me.callParent(arguments);

        me.on('beforeshow', me.onTipBeforeShow, me);
    },

    /**
     * This is mostly a direct copy {@link Ext.tip.Tooltip::getAlignRegion}.
     *
     * NOTE: please monitor this {@link https://www.sencha.com/forum/showthread.php?332162-Update-Ext-tip-Tooltip-getAlignRegion()-to-respect-constrainTo-and-constraintInsets}
     *       thread, to see when this method might be refactored.
     *
     * @private
     */
    getAlignRegion : function () {
        var me          = this,
            anchorEl    = me.anchorEl,
            align       = me.getAnchorAlign(),
            overlap,
            alignSpec,
            target,
            mouseOffset = me.mouseOffset,
            // --- begin changes ---
            // Original ExtJS code:
            // Bryntum's changes:
            constrainTo,
            constraintInsets;
        // --- end changes ---


        if (!me.anchorSize) {
            anchorEl.addCls(Ext.baseCSSPrefix + 'tip-anchor-top');
            anchorEl.show();
            me.anchorSize = new Ext.util.Offset(anchorEl.getWidth(), anchorEl.getHeight());
            anchorEl.removeCls(Ext.baseCSSPrefix + 'tip-anchor-top');
            anchorEl.hide();
        }

        // Target region from the anchorTarget element unless trackMouse set
        if ((me.anchor || me.align) && me.anchorToTarget && !me.trackMouse) {
            target = me.currentTarget.getRegion();
            // --- begin changes ---
            // Original ExtJS code:
            // Bryntum's changes: (check to make sure element is still in the DOM, easily happens when scroll zooming)
            if (!Ext.isGarbage(me.currentTarget.dom) && me.getView().getMode() === 'horizontal' && me.pointerEvent) {
                target = target.intersect(new Ext.util.Region(
                        target.top,
                        me.pointerEvent.getPoint().x + me.getRegion().width / 2,
                        target.bottom,
                        // we cannot do: me.pointerEvent.getPoint().x - me.getRegion().width / 2
                        // since it'll cause false failing of unscoped css rules test ..because minified it
                        // looks similar to hardcoded extjs selector
                        me.pointerEvent.getPoint().x + (-me.getRegion().width / 2)
                    )) || target;
            }
            // --- end changes ---
        }

        // Here, we're either trackMouse: true, or we're not anchored to the target
        // element, so we should show offset from the mouse.
        // If we are being shown programatically, use 0, 0
        else {
            target = me.pointerEvent ? me.pointerEvent.getPoint().adjust(-Math.abs(mouseOffset[ 1 ]), Math.abs(mouseOffset[ 0 ]), Math.abs(mouseOffset[ 1 ]), -Math.abs(mouseOffset[ 0 ])) : new Ext.util.Point();
            if (!me.anchor) {
                overlap = true;
                if (mouseOffset[ 0 ] > 0) {
                    if (mouseOffset[ 1 ] > 0) {
                        align = 'tl-br';
                    } else {
                        align = 'bl-tr';
                    }
                } else {
                    if (mouseOffset[ 1 ] > 0) {
                        align = 'tr-bl';
                    } else {
                        align = 'br-tl';
                    }
                }
            }
        }

        alignSpec = {
            align    : me.convertPositionSpec(align),
            axisLock : me.axisLock,
            target   : target,
            overlap  : overlap,
            offset   : me.targetOffset
            // --- begin changes ---
            // Original ExtJS code:
            // inside: me.constrainPosition ? Ext.getBody().getRegion().adjust(5, -5, -5, 5) : null
            // Bryntum's changes:
            // --- end changes ---
        };

        if (me.anchor) {
            alignSpec.anchorSize = me.anchorSize;
        }

        // --- begin changes ---
        // Original ExtJS code:
        // Bryntum's changes:
        if (me.constrainPosition) {

            constrainTo = me.constrainTo || Ext.getBody();

            if (!constrainTo.isRegion) {
                constrainTo = Ext.util.Region.getRegion(constrainTo);
            }

            if (me.constraintInsets) {

                constraintInsets = me.constraintInsets;

                if (!Ext.isObject(constraintInsets)) {
                    constraintInsets = Ext.util.Format.parseBox(constraintInsets);
                }

                constrainTo = constrainTo.copy().adjust(constraintInsets.top, constraintInsets.right, constraintInsets.bottom, constraintInsets.left);
            }

            alignSpec.inside = constrainTo;
        }
        // --- end changes ---

        return me.getRegion().alignTo(alignSpec);
    },

    // TODO: refactor this method
    onTipBeforeShow : function (me) {
        if (!me.triggerElement || !me.triggerElement.id) {
            return false;
        }

        var view = me.getView();

        // All visible modal windows on the page.
        var modalVisibleWindows = Ext.all('window[modal=true]{isVisible()}');

        // First modal window that is not a scheduler and doesn't contain scheduler inside.
        var activeModalWindow = Ext.Array.findBy(modalVisibleWindows, function (modalWindow) {
            return view !== modalWindow && !view.isDescendantOf(modalWindow) && Ext.WindowManager.getActive() === modalWindow;
        });

        // Tooltip should not be shown above task editor or other modal windows
        if (activeModalWindow) return false;

        var record = view.resolveEventRecord(me.triggerElement);

        if (!record || view.fireEvent('beforetooltipshow', view, record) === false) {
            return false;
        }

        var dataForMe = view.getDataForTooltipTpl(record, me.triggerElement),
            tooltipString;

        if (!dataForMe) return false;

        tooltipString = view.tooltipTpl.apply(dataForMe);

        if (!tooltipString) return false;

        me.update(tooltipString);
    },

    // @Override to fix Sencha issue where tooltip autohides due to mouse over of its own element if Tooltip doesn't fit on screen
    // https://www.sencha.com/forum/showthread.php?469723-Inifinte-hide-show-loop-if-tooltip-appears-where-cursor-is
    // https://app.assembla.com/spaces/bryntum/tickets/5925-event-tooltip-hides-shows-infinitely-when-it-doesn--39-t-fit-on-the-screen/details#
    onTargetOut: function(e) {
        if (this.rendered && this.allowOver && this.el.contains(e.relatedTarget)) {
            return;
        }

       return this.callParent(arguments);
    }
});
