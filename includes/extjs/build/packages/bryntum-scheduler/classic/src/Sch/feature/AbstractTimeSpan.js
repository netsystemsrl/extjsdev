/**
@class Sch.feature.AbstractTimeSpan
@extends Ext.AbstractPlugin

Plugin for visualizing "global" time span in the scheduler grid, these can by styled easily using just CSS. This is an abstract class not intended for direct use.

*/
Ext.define("Sch.feature.AbstractTimeSpan", {
    extend              : 'Ext.AbstractPlugin',

    mixins              : {
        observable      : 'Ext.util.Observable'
    },

    lockableScope       : 'top',

    schedulerView       : null,
    timeAxis            : null,

    // If lines/zones should stretch to fill the whole view container element in case the table does not fill it
    expandToFitView     : false,

    disabled            : false,

    /**
     * @property {String} cls An internal css class which is added to each rendered timespan element
     * @private
     */
    cls                 : null,

    /**
     * @cfg {String} clsField Name of field
     */
    clsField            : 'Cls',

    /**
     * @cfg {Ext.XTemplate} template Template to render the timespan elements
     */
    template            : null,

    /**
     * @cfg {Ext.data.Store} store A store with timespan data, or a string identifying a store.
     */
    store               : null,

    renderElementsBuffered      : false,

    /**
     * @cfg {Number} renderDelay Delay the zones rendering by this amount (in ms) to speed up the default rendering of rows and events.
     */
    renderDelay                 : 0,

    // true to refresh the sizes of the rendered elements when an item in the bound view changes
    // false to do a full refresh instead
    refreshSizeOnItemUpdate     : true,

    _renderTimer                : null,

    /**
     * @cfg {Boolean} showHeaderElements Set this to `true` to show indicators in the timeline header area.
     *
     * Header indicators are placed right above the corresponding element of the scheduling view. You can customize the HTML markup
     * for these indicators with the {@link #headerTemplate} config. Note that the indicators are rendered as a regular div element,
     * which will be styled differently in modern vs legacy browsers.
     *
     */
    showHeaderElements          : false,

    /**
     * @private
     * @cfg {Ext.XTemplate} headerTemplate Template used to render the header elements
     */
    headerTemplate              : null,


    /**
     * @cfg {String/Ext.XTemplate} innerHeaderTpl A template providing additional markup to render into each timespan header element
     */
    innerHeaderTpl              : null,

    headerContainerCls          : 'sch-header-secondary-canvas',
    headerContainerEl           : null,

    // event to be fired, when rendering has completed (only fired when all elements are rendered, not single)
    renderingDoneEvent          : null,


    constructor : function(cfg) {
        // unique css class to be able to identify only the zones belonging to this plugin instance
        this.uniqueCls = this.uniqueCls || ('sch-timespangroup-' + Ext.id());

        Ext.apply(this, cfg);

        this.mixins.observable.constructor.call(this);

        this.callParent(arguments);
    },

    init:function(scheduler) {
        // TODO COMMENT
        if (Ext.versions.touch && !scheduler.isReady()) {
            scheduler.on('viewready', function() { this.init(scheduler); }, this);
            return;
        }

        if (typeof this.innerHeaderTpl === 'string') {
            this.innerHeaderTpl = new Ext.XTemplate(this.innerHeaderTpl);
        }

        var innerHeaderTpl = this.innerHeaderTpl;

        if (!this.headerTemplate) {
            this.headerTemplate = new Ext.XTemplate(
                '<tpl for=".">',
                '<div id="{id}" class="{cls}" title="{[values.Name || values.Text || ""]}" style="{side}:{position}px;">' +
                (innerHeaderTpl ? '{[this.renderInner(values)]}' : '') +
                '</div>',
                '</tpl>',
                {
                    renderInner : function(values) {
                        return innerHeaderTpl.apply(values);
                    }
                }
            );
        }

        this.schedulerView = scheduler.getSchedulingView();
        this.panel = scheduler;
        this.timeAxis = scheduler.getTimeAxis();

        this.store = Ext.StoreManager.lookup(this.store);

        if (!this.store) {
            Ext.Error.raise("Error: You must define a store for this plugin");
        }

        if (this.showHeaderElements) {
            this.panel.on({
                horizontaltimeaxiscolumnrender  : this.renderHeaderElements,

                scope                           : this
            });
        }

        if (!this.schedulerView.getEl()) {
            this.schedulerView.on({
                viewready   : this.onViewReady,
                scope       : this
            });
        } else {
            this.onViewReady();
        }
    },


    /**
     * @param {Boolean} disabled Pass `true` to disable the plugin and remove all rendered elements.
     */
    setDisabled : function(disabled) {
        if (disabled) {
            this.removeElements();
        }

        this.disabled = disabled;
    },


    removeElements : function () {
        this.removeBodyElements();

        if (this.showHeaderElements) {
            this.removeHeaderElements();
        }
    },

    //Returns the currently rendered DOM elements of this plugin (if any), as a {@link Ext.CompositeElementLite} collection.
    getBodyElements : function() {
        var el = this.getContainerEl();

        if (el) {
            return el.select('.' + this.uniqueCls);
        }

        return null;
    },

    /**
     * Returns container to render header elements.
     *
     * @return {Ext.dom.Element|null}
     */
    getHeaderContainerEl : function() {
        var containerEl = this.headerContainerEl,
            prefix = Ext.baseCSSPrefix,
            parent;

        if (!containerEl || !containerEl.dom) {
            if (this.schedulerView.isHorizontal()) {
                var timeAxisColumn = this.panel.getHorizontalTimeAxisColumn();

                if (timeAxisColumn.headerView) { // Column must be rendered first
                    parent = timeAxisColumn.headerView.containerEl;
                } else {
                    return null;
                }
            } else {
                parent = this.panel.lockedGrid.getView().el;
            }

            if (parent) {
                containerEl = parent.down('.' + this.headerContainerCls);

                if (!containerEl) {
                    containerEl = parent.appendChild({
                        cls : this.headerContainerCls
                    });
                }

                this.headerContainerEl = containerEl;
            }
        }

        return containerEl;
    },


    getHeaderElements : function() {
        var containerEl = this.getHeaderContainerEl();

        if (containerEl) {
            return containerEl.select('.' + this.uniqueCls);
        }

        return null;
    },


    // private
    removeBodyElements : function() {
        var els = this.getBodyElements();

        if (els) {
            els.each(function(el) { el.destroy(); });
        }
    },


    removeHeaderElements : function() {
        var els = this.getHeaderElements();

        if (els) {
            els.each(function(el) { el.destroy(); });
        }
    },

    /**
     * Returns id of element for data record.
     *
     * @param {Ext.data.Model} record
     *
     * @return {String}
     */
    getElementId : function(record) {
        return this.uniqueCls + '-' + record.internalId;
    },

    /**
     * Returns id of header element for data record.
     *
     * @param {Ext.data.Model} record
     *
     * @return {String}
     */
    getHeaderElementId : function(record) {
        return this.uniqueCls + '-header-' + record.internalId;
    },

    /**
     * Returns data to apply to the HTML template for rendering a timespan element. You can use this to apply custom styling to each rendered timespan.
     *
     * @param {Ext.data.Model} record
     *
     * @return {Object}
     */
    getTemplateData : function(record) {
        return this.prepareTemplateData ? this.prepareTemplateData(record) : record.data;
    },


    /**
     * Return element class for a record.
     *
     * @param {Ext.data.Model} record Data record
     * @param {Object} data Template data
     *
     * @return {String}
     */
    getElementCls : function(record, data) {
        var clsField = record.clsField || this.clsField;

        if (!data) {
            data = this.getTemplateData(record);
        }

        return this.cls + ' ' + this.uniqueCls + ' ' + (data[clsField] || '');
    },


    /**
     * Return header element class for data record.
     *
     * @param {Ext.data.Model} record Data record
     * @param {Object} data
     *
     * @return {String}
     */
    getHeaderElementCls : function(record, data) {
        var clsField = record.clsField || this.clsField;

        if (!data) {
            data = this.getTemplateData(record);
        }

        return 'sch-header-indicator ' + this.uniqueCls + ' ' + (data[clsField] || '');
    },

    getContainerEl : function() {
        return this.schedulerView.getSecondaryCanvasEl();
    },

    onViewReady : function (scheduler) {
        var view            = this.schedulerView;

        this.storeListeners = {
            load            : this.renderElements,
            datachanged     : this.renderElements,
            clear           : this.renderElements,

            update          : this.refreshSingle,

            scope           : this
        };

        this.store.on(this.storeListeners);

        this.panel.on({
            beforemodechange                : this.onTimelinePanelBeforeModeChange,
            modechange                      : this.onTimelinePanelModeChange,

            scope                           : this
        });

        this.viewListeners = {
            // In case we cannot guarantee that we control the GridView "empty the view procedure", where the node container it emptied,
            // we'll need this as a fallback. See GridViewCanvas override of the BufferedRenderer instance

            // bufferedrefresh     : function() {
            //     if (!view.isHorizontal() || this.getContainerEl().dom.childNodes.length === 0) {
            //         this.renderElements();
            //     }
            // },
            refresh                 : this.renderElements,

            scope               : this
        };

        this.headerListeners = {
            afterlayout : this.renderElements,
            scope : this
        };

        // Weekview fires refresh before columns are actually laid out, we can safely render elements when columns
        // are sized correctly, which is 'afterlayout' event on header container
        if (view.isWeekView()) {
            view.headerCt.on(this.headerListeners);
        } else {
            view.on(this.viewListeners);
            this.renderElements();
        }
    },

    // Should not react to view refreshes until everything is fully setup in the new mode
    onTimelinePanelBeforeModeChange : function() {
        var view = this.schedulerView;
        if (view.isWeekView()) {
            view.headerCt.un(this.headerListeners);
        } else {
            this.schedulerView.un(this.viewListeners);
        }
    },

    // Re-enable view listeners and force a new render cycle
    onTimelinePanelModeChange : function() {
        var view = this.schedulerView;
        if (view.isWeekView()) {
            view.headerCt.on(this.headerListeners);
        } else {
            view.on(this.viewListeners);
        }
        this.forceNewRenderingTimeout();
    },

    forceNewRenderingTimeout : function () {
        this.renderElementsBuffered = false;

        clearTimeout(this._renderTimer);

        this.renderElements();
    },


    renderElements : function() {
        if (this.renderElementsBuffered || this.disabled) return;

        this.renderElementsBuffered = true;

        clearTimeout(this._renderTimer);

        // Defer to make sure rendering is not delayed by this plugin
        // deferring on 15 because the cascade delay is 10 (cascading will trigger a view refresh)
        this._renderTimer = Ext.Function.defer(this.renderElementsInternal, this.renderDelay, this);
    },


    /**
     * Sets element X coordinate relative direction (rtl or ltr).
     *
     * @param {Ext.Element} el
     * @param {Number} x
     */
    setElementX : function(el, x) {
        if (this.panel.rtl) {
            el.setRight(x);
        } else {
            el.setLeft(x);
        }
    },

    /**
     * Returns position of header element by date.
     *
     * @param {Date} date
     *
     * @return {Number}
     */
    getHeaderElementPosition : function(date) {
        var viewModel = this.schedulerView.getTimeAxisViewModel();

        return Math.round(viewModel.getPositionFromDate(date));
    },

    renderBodyElementsInternal : function (records) {
        var start       = this.timeAxis.getStart(),
            end         = this.timeAxis.getEnd(),
            data        = this.getElementData(start, end, records);

        if (data) {
            this.template.append(this.getContainerEl(), data);
        }
    },


    getHeaderElementData : function(records, isPrint) {
        throw 'Abstract method call';
    },


    renderHeaderElements : function (records) {
        var containerEl = this.getHeaderContainerEl();

        if (containerEl) {
            var data = this.getHeaderElementData(records);

            this.headerTemplate.append(containerEl, data);
        }
    },


    renderElementsInternal : function() {
        this.renderElementsBuffered = false;

        var view = this.schedulerView;

        // component could be destroyed during the buffering time frame,
        // Skip rendering while main backing store is empty
        if (this.disabled || view.isDestroyed || !this.getContainerEl() || view.store.getCount() === 0) return;

        // In weekview mode this method can be invoked before there're visible columns we need to avoid that
        if (view.isWeekView()) {
            var columns = view.getColumnManager().getColumns();
            if (columns[0] && !columns[0].rendered) {
                return;
            }
        }

        this.removeElements();

        this.renderBodyElementsInternal();

        if (this.showHeaderElements) {
            this.headerContainerEl = null;

            this.renderHeaderElements();
        }

        if (this.renderingDoneEvent) this.fireEvent(this.renderingDoneEvent, this);
    },


    getElementData : function (viewStart, viewEnd, records, isPrint) {
        throw 'Abstract method call';
    },


    updateBodyElement : function (record) {
        var el = Ext.get(this.getElementId(record));

        if (el) {
            var start       = this.timeAxis.getStart(),
                end         = this.timeAxis.getEnd(),
                data        = this.getElementData(start, end, [record])[0];

            if (data) {
                // Reapply CSS classes
                el.dom.className = data.$cls;

                el.setTop(data.top);
                this.setElementX(el, data.left);

                el.setSize(data.width, data.height);
            } else {
                Ext.destroy(el);
            }
        } else {
            // if element is not found, then its probably a newly added record in the store
            // in this case `renderBodyElementsInternal` will only add markup for that record
            this.renderBodyElementsInternal([ record ]);
        }
    },


    updateHeaderElement : function (record) {
        var el = Ext.get(this.getHeaderElementId(record));

        if (el) {
            var data = this.getHeaderElementData([record])[0];

            if (data) {
                // Reapply CSS classes
                el.dom.className = data.cls;

                if (this.schedulerView.isHorizontal()) {
                    this.setElementX(el, data.position);
                    el.setWidth(data.size);
                } else {
                    el.setTop(data.position);
                    el.setHeight(data.size);
                }
            } else {
                Ext.destroy(el);
            }
        } else {
            // if element is not found, then its probably a newly added record in the store
            // in this case `renderHeaderElements` will only add markup for that record
            this.renderHeaderElements([record]);
        }
    },


    destroy : function() {
        clearTimeout(this._renderTimer);

        this.store.un(this.storeListeners);

        if (this.store.autoDestroy) {
            this.store.destroy();
        }
    },


    refreshSingle : function(store, records) {

        records = records instanceof Array ? records : [records];

        Ext.Array.each(records, function(record) {
            this.updateBodyElement(record);

            if (this.showHeaderElements) {
                this.updateHeaderElement(record);
            }
        }, this);
    }
});
