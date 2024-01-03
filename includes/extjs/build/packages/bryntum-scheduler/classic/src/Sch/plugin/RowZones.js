/**
 * @abstract
 * @private
 * A plugin for visualizing row specific meta data, used internally by the Scheduler.
 */
Ext.define("Sch.plugin.RowZones", {
    extend : 'Sch.plugin.Zones',

    requires : [
        'Ext.XTemplate',
        'Sch.util.Date'
    ],

    /**
     * @cfg {String/Ext.XTemplate} innerTpl A template providing additional markup to render into each timespan element
     */
    innerTpl : null,

    /**
     * @cfg {Sch.data.EventStore} store (required) The store containing the meta 'events' to be rendered for each row
     */
    store : null,

    init : function (scheduler) {
        this.store = Ext.StoreManager.lookup(this.store);

        // unique css class to be able to identify the elements belonging to this instance
        this.uniqueCls = this.uniqueCls || ('sch-timespangroup-' + Ext.id());

        this.scheduler = scheduler;

        scheduler.registerRenderer(this.renderer, this);

        if (typeof this.innerTpl === 'string') {
            this.innerTpl = new Ext.XTemplate(this.innerTpl);
        }

        var innerTpl = this.innerTpl;

        if (!this.template) {
            this.template = new Ext.XTemplate(
                '<tpl for=".">' +
                '<div id="' + this.uniqueCls + '-{id}" class="' + this.cls + ' ' + this.uniqueCls + ' {Cls}" style="' + (scheduler.rtl ? 'right' : 'left') + ':{start}px;width:{width}px;top:{start}px;height:{width}px;{style}">' +
                // Let implementer override the rendering with the innerTpl property, output Name field by default
                (innerTpl ? '{[this.renderInner(values)]}' : ('{' + this.store.getModel().prototype.nameField + '}') ) +

                '</div>' +
                '</tpl>',
                {
                    renderInner : function (values) {
                        return innerTpl.apply(values);
                    }
                }
            );
        }

        this.storeListeners = {
            refresh : this.fullRefresh,
            clear   : this.fullRefresh,

            add    : this.onZoneAdd,
            remove : this.onZoneRemove,
            update : this.onZoneUpdate,

            scope : this
        };

        this.store.on(this.storeListeners);
    },

    destroy : function () {
        this.store.un(this.storeListeners);

        this.callParent(arguments);
    },

    /**
     * @protected
     * Returns the record owning the provided zone.
     * @param  {Sch.model.Event} zone Zone to get owner of.
     * @return {Ext.data.Model} The record owning the provided zone.
     */
    getViewRecordByZone : function (zone) {
        throw 'Abstract method call';
    },

    getZoneContainerEl : function (zone) {
        var view   = this.scheduler.getSchedulingView(),
            record = this.getViewRecordByZone(zone),
            node   = record && view.getNode(record);

        return node && node.querySelector('.' + Ext.baseCSSPrefix + 'grid-cell-inner');
    },

    onZoneRemove : function (store, zones) {
        Ext.Array.forEach(zones, function (zone) {
            var node = document.getElementById(this.getElementId(zone));

            node && node.parentElement.removeChild(node);
        }, this);
    },

    onZoneAdd : function (store, zones) {
        Ext.Array.forEach(zones, function (zone) {
            var container      = this.getZoneContainerEl(zone);

            container && this.appendZoneElement(zone, container);
        }, this);
    },

    fullRefresh : function () {
        var me   = this,
            view = this.scheduler.getSchedulingView();

        // if view is rendered
        if (view.el) {
            // remove this plugin instance related zone elements
            view.el.select('.' + this.uniqueCls).remove();

            Ext.Array.forEach(view.getNodes(), function (node) {
                me.renderRecordZones(view.getRecord(node), true);
            });
        }
    },

    renderer : function (val, meta, record, rowIndex) {
        var result = '';

        if (record && (this.scheduler.isHorizontal() || rowIndex === 0)) {
            result = this.renderRecordZones(record);
        }

        return result;
    },

    /**
     * @protected
     * Returns zones for the provided record.
     * @param  {Ext.data.Model} record Record to build zones for.
     * @return {Sch.model.Event[]}     List of the record zones.
     */
    getRecordZones : function (record) {
        throw 'Abstract method call';
    },

    getTemplateData : function (zone) {
        var scheduler  = this.scheduler,
            renderData = scheduler.getSchedulingView()[scheduler.getMode()].getEventRenderData(zone),
            start, width;

        if (scheduler.isHorizontal()) {
            start = scheduler.rtl ? renderData.right : renderData.left;
            width = renderData.width;
        } else {
            start = renderData.top;
            width = renderData.height;
        }

        return Ext.apply({
            id : zone.internalId,

            start : start,
            width : width,

            Cls : zone.getCls()
        }, zone.data);
    },

    renderRecordZones : function (record, targetElement) {
        var scheduler = this.scheduler,
            viewStart = scheduler.timeAxis.getStart(),
            viewEnd   = scheduler.timeAxis.getEnd(),
            data      = [],
            zones     = this.getRecordZones(record),
            result    = '',
            spanStartDate, spanEndDate, zone;

        for (var i = 0, len = zones.length; i < len; i++) {
            zone = zones[i];

            spanStartDate = zone.getStartDate();
            spanEndDate   = zone.getEndDate();

            if (spanStartDate && spanEndDate &&
                // Make sure this zone is inside current view
                scheduler.timeAxis.isRangeInAxis(zone)
            ) {
                data.push(this.getTemplateData(zone));
            }
        }

        if (targetElement) {
            if (zone) {
                if (Ext.isBoolean(targetElement)) {
                    targetElement = this.getZoneContainerEl(zone);
                }

                this.template.append(targetElement, data);
            }

        } else {
            result = this.template.apply(data);
        }

        return result;
    },

    appendZoneElement : function (zone) {
        var scheduler     = this.scheduler,
            viewStart     = scheduler.timeAxis.getStart(),
            viewEnd       = scheduler.timeAxis.getEnd(),
            containerEl   = this.getZoneContainerEl(zone),
            spanStartDate = zone.getStartDate(),
            spanEndDate   = zone.getEndDate();

        if (containerEl && spanStartDate && spanEndDate &&
            // Make sure this zone is inside current view
            Sch.util.Date.intersectSpans(spanStartDate, spanEndDate, viewStart, viewEnd)
        ) {
            this.template.append(containerEl, this.getTemplateData(zone));
        }
    },

    onZoneUpdate : function (store, zone) {
        var node = document.getElementById(this.getElementId(zone));

        if (node) {
            var scheduler = this.scheduler,
                viewStart = scheduler.timeAxis.getStart(),
                viewEnd   = scheduler.timeAxis.getEnd();

            var start = Sch.util.Date.max(viewStart, zone.getStartDate()),
                end   = Sch.util.Date.min(viewEnd, zone.getEndDate()),
                cls   = zone.getCls();

            var startPos = scheduler.getSchedulingView().getCoordinateFromDate(start);
            var width    = scheduler.getSchedulingView().getCoordinateFromDate(end) - startPos;

            // Reapply CSS classes
            node.className = this.cls + ' ' + this.uniqueCls + ' ' + (cls || '');

            node.style.left   = startPos + 'px';
            node.style.top    = startPos + 'px';
            node.style.height = width + 'px';
            node.style.width  = width + 'px';
        }
    }
});
