

Ext.define('PdfViewer.view.combo.scaleCombo', {
    extend: 'Ext.form.field.ComboBox',
    xtype: 'PdfViewerScaleCombo',
    requires: ['Ext.data.ArrayStore'],
    editable: false,
    keyNavEnabled: true,
    selectOnFocus: false,
    submitValue: false,
    isFormField: false,
    autoSelect: true,
    store: new Ext.data.SimpleStore({
        id: 0,
        fields: ['scale', 'text'],
        data: [
            [0.5, '50%'],
            [0.75, '75%'],
            [1, '100%'],
            [1.25, '125%'],
            [1.5, '150%'],
            [2, '200%']
        ]
    }),
    valueField: 'scale',
    displayField: 'text',
    mode: 'local',
    listeners: {
        change: function (cb,
            newVal) {
            var record = cb.store.findRecord('scale', newVal);
            if (record === null) {
                cb.store.add({
                    scale: newVal,
                    text: Math.round(newVal * 100).toString() + '%'
                });
            }
        }
    }
});
Ext.define('PdfViewer.view.field.pageNumber', {
    extend: 'Ext.form.field.Number',
    xtype: 'pdfviewer_pagenumber',
    allowDecimals: false,
    minValue: 1,
    hideTrigger: true,
    enableKeyEvents: true,
    keyNavEnabled: false,
    selectOnFocus: true,
    submitValue: false,
    isFormField: false
});
Ext.define('PdfViewer.view.panel.PDFController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.PdfViewerController',
    requires: [],
    container: null,
    pageScale: null,
    zoomFactor: null,
    minScale: null,
    maxScale: null,
    control: {
        '#': {
            boxready: 'onBoxReady',
            onSetSrc: 'onSetSrc',
            onUnset: 'onUnset',
            onGetDocument: 'onGetDocument',
            afterrender: 'onAfterrender'
        }
    },
    init: function (view) {
        var me = this;
        me.zoomFactor = view.zoomFactor;
        me.minScale = view.minScale;
        me.maxScale = view.maxScale;
        me.pageScale = view.pageScale;
        PDFJS.workerSrc = 'includes/pdfjs/pdf.worker.js';
    },
    onSetSrc: function (src) {
        var view = this.getView();
        view.src = src;
        view.currentPage = 1;
        this.showLoaderMask(view);
        this.getDocument(src);
    },
    onUnset: function () {
        if (this.container !== null) {
            this.container.innerHTML = '';
            this.setToolbarProperties(0, true);
        }
    },
    onGetDocument: function () {
        this.getDocument();
    },
    onBoxReady: function () {
        var view = this.getView();
        if (view.showLoadMaskOnInit) {
            this.showLoaderMask(view);
        }
    },
    onAfterrender: function (view) {
        var me = this;
        me.container = view.getPdfEl();
        me.container.mozOpaque = true;
        if (!!view.src) {
            me.getDocument(view.src);
        }
    },
    getDocument: function (src) {
        var me = this;
        var view = me.getView();
        PDFJS.getDocument(src).then(function (pdfDoc) {
            view.pdfDoc = pdfDoc;
            me.renderDocument();
        });
    },
    renderDocument: function () {
        try {
            var view = this.getView(),
                isEmpty;
            isEmpty = view.pdfDoc.numPages === 0;
            view.currentPage = view.currentPage || (isEmpty ? 0 : 1);
            this.renderPage(view.currentPage);
        } catch (error) {
            Ext.log({
                level: 'warning'
            }, "PDF: Can't render: " + error.message);
        }
    },
    renderPage: function (page) {
        var me = this,
            view = me.getView(),
            isEmpty, pageCount, currPage, afterText;
        if (view.isRendering) {
            return;
        }
        view.isRendering = true;
        view.currentPage = page;
        currPage = view.currentPage;
        pageCount = view.pdfDoc.numPages;
        Ext.suspendLayouts();
        this.setToolbarProperties(currPage);
        this.container.innerHTML = '';
        var numPages = view.showPerPage ? page : pageCount;
        var idx = view.showPerPage ? page : 1;
        for (var i = idx; i <= numPages; i++) {
            view.pdfDoc.getPage(i).then(function (page) {
                var viewport = page.getViewport(view.pageScale);
                var div = document.createElement('div');
                var id = view.getId() + '-page-' + (page.pageIndex + 1);
                div.setAttribute('id', id);
                div.setAttribute('style', 'position: relative');
                me.container.appendChild(div);
                var canvas = document.createElement('canvas');
                div.appendChild(canvas);
                var context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                context.save();
                context.fillStyle = 'rgb(255, 255, 255)';
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.restore();
                var renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                page.render(renderContext).then(function () {
                    if (view.disableTextLayer === false) {
                        return page.getTextContent();
                    }
                }).then(function (textContent) {
                    var textLayerDiv = document.createElement('div');
                    textLayerDiv.setAttribute('class', 'textLayer');
                    div.appendChild(textLayerDiv);
                    PDFJS.renderTextLayer({
                        textContent: textContent,
                        container: textLayerDiv,
                        viewport: viewport,
                        pageIndex: page.pageIndex,
                        textDivs: []
                    });
                });
                Ext.resumeLayouts(true);
                view.isRendering = false;
                if (view.loader) {
                    view.loader.destroy();
                }
                if (view.rendered) {
                    me.updateBorder(view.body, id, 'bordered', 'add');
                    view.scrollTo(0, 0);
                    view.fireEvent('change', view, {
                        current: view.currentPage,
                        total: view.pdfDoc.numPages
                    });
                }
            });
        }
    },
    moveFirst: function () {
        var view = this.getView();
        if (view.fireEvent('beforechange', view, 1) !== false) {
            this.renderThis(1);
        }
    },
    movePrevious: function () {
        var view = this.getView(),
            prev = view.currentPage - 1;
        if (prev > 0) {
            if (view.fireEvent('beforechange', view, prev) !== false) {
                this.renderThis(prev);
            }
        }
    },
    moveNext: function () {
        var view = this.getView(),
            total = view.pdfDoc.numPages,
            next = view.currentPage + 1;
        if (next <= total) {
            if (view.fireEvent('beforechange', view, next) !== false) {
                this.renderThis(next);
            }
        }
    },
    moveLast: function () {
        var me = this.getView(),
            last = me.pdfDoc.numPages;
        if (me.fireEvent('beforechange', me, last) !== false) {
            this.renderThis(last);
        }
    },
    onPagingBlur: function (e) {
        var curPage = this.getView().currentPage;
        this.lookup('inputItem').setValue(curPage);
    },
    onPagingKeyDown: function (field, e) {
        var me = this.getView(),
            k = e.getKey(),
            increment = e.shiftKey ? 10 : 1,
            pageNum, total = me.pdfDoc.numPages;
        if (k === e.RETURN) {
            e.stopEvent();
            pageNum = this.readPageFromInput();
            if (pageNum !== false) {
                pageNum = Math.min(Math.max(1, pageNum), total);
                if (me.fireEvent('beforechange', me, pageNum) !== false) {
                    this.renderThis(pageNum);
                }
            }
        } else {
            if (Ext.Array.indexOf([e.HOME, e.END], k) > 0) {
                e.stopEvent();
                pageNum = k == e.HOME ? 1 : total;
                field.setValue(pageNum);
            } else {
                if (Ext.Array.indexOf([e.UP, e.PAGE_UP, e.DOWN, e.PAGE_DOWN], k) > 0) {
                    e.stopEvent();
                    pageNum = this.readPageFromInput();
                    if (pageNum) {
                        if (k === e.DOWN || k === e.PAGE_DOWN) {
                            increment *= -1;
                        }
                        pageNum += increment;
                        if (pageNum >= 1 && pageNum <= total) {
                            field.setValue(pageNum);
                        }
                    }
                }
            }
        }
    },
    onPagingFocus: function () {
        this.lookup('inputItem').select();
    },
    onScaleBlur: function (e) {
        var me = this.getView();
        this.lookup('scaleCombo').setValue(me.pageScale);
    },
    onBtnZoomInClicked: function (b) {
        var me = this;
        me.pageScale += me.zoomFactor;
        if (me.pageScale > me.maxScale) {
            me.pageScale = me.maxScale;
        }
        this.lookup('scaleCombo').setValue(me.pageScale);
    },
    onBtnZoomOutClicked: function (b) {
        var me = this;
        me.pageScale -= me.zoomFactor;
        if (me.pageScale < me.minScale) {
            me.pageScale = me.minScale;
        }
        this.lookup('scaleCombo').setValue(me.pageScale);
    },
    onScaleChange: function (combo, newValue) {
        var me = this;
        var view = me.getView();
        view.pageScale = me.pageScale = newValue;
        me.renderPage(view.currentPage);
    },
    readPageFromInput: function () {
        var view = this.getView(),
            v = this.lookup('inputItem').getValue(),
            pageNum = parseInt(v, 10);
        if (!v || isNaN(pageNum)) {
            this.lookup('inputItem').setValue(view.currentPage);
            return false;
        }
        return pageNum;
    },
    privates: {
        setToolbarProperties: function (page, reset) {
            var me = this,
                view = me.getView(),
                currPage = page,
                pageCount = view.pdfDoc.numPages,
                isEmpty = pageCount === 0,
                afterText = Ext.String.format(view.afterPageText, isNaN(pageCount) ? 1 : pageCount);
            if (typeof reset !== 'undefined') {
                isEmpty = true;
            }
            view.currentPage = isEmpty ? '' : currPage;
            me.lookup('afterTextItem').setText(afterText);
            me.lookup('inputItem').setDisabled(isEmpty).setValue(currPage);
            me.lookup('first').setDisabled(currPage === 1 || isEmpty);
            me.lookup('prev').setDisabled(currPage === 1 || isEmpty);
            me.lookup('next').setDisabled(currPage === pageCount || isEmpty);
            me.lookup('last').setDisabled(currPage === pageCount || isEmpty);
            me.lookup('scaleCombo').setDisabled(isEmpty).setValue(view.pageScale);
        },
        renderThis: function (page) {
            var me = this;
            var view = me.getView();
            if (view.showPerPage) {
                me.renderPage(page);
            } else {
                me.setToolbarProperties(page);
                var el = me.container.childNodes.item(page - 1);
                view.scrollTo(0, el.offsetTop, true);
            }
        },
        showLoaderMask: function (view) {
            view.loader = new Ext.LoadMask({
                msg: view.loadingMessage,
                target: view
            });
            view.loader.show();
        },
        updateBorder: function (el, id, addCls, action) {
            var elem = el.getById(id);
            var canvas = elem.dom.firstChild;
            var hasClass = canvas.hasAttribute('class');
            if (action === 'add') {
                if (hasClass) {
                    canvas.className += ' ' + addCls;
                } else {
                    canvas.setAttribute('class', addCls);
                }
            } else {
                if (hasClass) {
                    canvas.className = canvas.className.replace(new RegExp('(?:^|s)' + addCls + '(?!S)'), '');
                    if (canvas.className.length === 0) {
                        canvas.removeAttribute('class');
                    }
                }
            }
        }
    }
});
Ext.define('PdfViewer.view.panel.PDF', {
    extend: 'Ext.panel.Panel',
    controller: 'PdfViewerController',
    xtype: 'PdfViewerPdfPanel',
    requires: ['Ext.button.Button', 'Ext.toolbar.Fill', 'Ext.toolbar.Separator', 'Ext.toolbar.TextItem', 'PdfViewer.view.combo.scaleCombo', 'PdfViewer.view.field.pageNumber', 'PdfViewer.view.panel.PDFController'],
    extraBaseCls: Ext.baseCSSPrefix + 'pdf',
    extraBodyCls: Ext.baseCSSPrefix + 'pdf-body',
    autoScroll: true,
    disableTextLayer: false,
    showPerPage: false,
    pageScale: 1,
    pageBorders: true,
    src: '',
    disableWorker: false,
    loadingMessage: 'Loading PDF, please wait...',
    beforePageText: 'Page',
    afterPageText: 'of {0}',
    firstText: 'First Page',
    prevText: 'Previous Page',
    nextText: 'Next Page',
    lastText: 'Last Page',
    inputItemWidth: 60,
    scaleWidth: 100,
    showLoadMaskOnInit: null,
    zoomFactor: 0.1,
    minScale: 0.5,
    maxScale: 4,
    initComponent: function () {
        var me = this,
            dockedItems;
        dockedItems = [{
            dock: 'bottom',
            reference: 'PagingToolbar',
            xtype: 'toolbar',
            items: [{
                    reference: 'first',
                    tooltip: me.firstText,
                    overflowText: me.firstText,
                    iconCls: 'ext ext-double-chevron-left',
                    disabled: true,
                    handler: 'moveFirst'
                }, {
                    reference: 'prev',
                    tooltip: me.prevText,
                    overflowText: me.prevText,
                    iconCls: 'ext ext-chevron-left',
                    disabled: true,
                    handler: 'movePrevious'
                }, '-', me.beforePageText, {
                    xtype: 'pdfviewer_pagenumber',
                    reference: 'inputItem',
                    name: 'inputItem',
                    cls: Ext.baseCSSPrefix + 'tbar-page-number',
                    width: me.inputItemWidth,
                    margins: '-1 2 3 2',
                    disabled: true,
                    listeners: {
                        keydown: 'onPagingKeyDown',
                        blur: 'onPagingBlur'
                    }
                }, {
                    xtype: 'tbtext',
                    reference: 'afterTextItem',
                    text: Ext.String.format(me.afterPageText, 1),
                    margins: '0 5 0 0'
                }, '-', {
                    reference: 'next',
                    tooltip: me.nextText,
                    overflowText: me.nextText,
                    iconCls: 'ext ext-chevron-right',
                    disabled: true,
                    handler: 'moveNext'
                }, {
                    reference: 'last',
                    tooltip: me.lastText,
                    overflowText: me.lastText,
                    iconCls: 'ext ext-double-chevron-right',
                    disabled: true,
                    handler: 'moveLast'
                },
                '-\x3e', {
                    xtype: 'button',
                    iconCls: 'fa fa-search-plus',
                    tooltip: 'Zoom in',
                    handler: 'onBtnZoomInClicked'
                }, {
                    reference: 'scaleCombo',
                    xtype: 'PdfViewerScaleCombo',
                    disabled: true,
                    width: me.scaleWidth,
                    listeners: {
                        change: 'onScaleChange',
                        blur: 'onScaleBlur'
                    }
                }, {
                    xtype: 'button',
                    tooltip: 'Zoom out',
                    iconCls: 'fa fa-search-minus',
                    handler: 'onBtnZoomOutClicked'
                }
            ]
        }];
        if (typeof me.dockedItems !== 'undefined') {
            dockedItems = dockedItems.concat(me.dockedItems);
        }
        Ext.apply(me, {
            html: '\x3cdiv class\x3d"canvasWrapper"\x3e\x3c/div\x3e',
            dockedItems: dockedItems
        });
        me.bodyCls = me.bodyCls || '';
        me.bodyCls += ' ' + me.extraBodyCls;
        me.cls = me.cls || '';
        me.cls += ' ' + me.extraBaseCls;
        me.callParent(arguments);
        if (me.disableWorker) {
            PDFJS.disableWorker = true;
        }
    },
    getPdfEl: function () {
        return this.el.dom.getElementsByClassName('canvasWrapper')[0];
    },
    setSrc: function (src) {
        this.fireEvent('onSetSrc', src);
    },
    unset: function () {
        this.fireEvent('onUnset');
    }
});


//*************************************************************************************************************//
//			DYNAMIC PDF EXTRACT
Ext.define('dynamicpdf', {
	alias: 'widget.dynamicpdf',
	mixins: {
        field: 'Ext.form.field.Base'
    },
    extend: 'PdfViewer.view.panel.PDF',
	
	//showLoadMaskOnInit: false,
	//disableTextLayer: false,
	//showPerPage: false,
	pageScale: 1.25,
	
	text: '',
	initValue : function(){
        var me = this;
		this.setValue(this.value);
    },
			
    initComponent: function () {
        var me = this;
        this.callParent();
    },
    setValue: function (new_value) {
        var me = this;
		me.text = new_value;
		if (new_value == undefined || new_value == null) {	
			
		} else {
			var src = "../includes/io/CallFile.php?fileid=" + me.text + '&nocache=' + Math.floor(Math.random() * 1000);
			me.setSrc(src);
		}
    },
	getValue: function () {
		var me = this;
        var data = {};
		data[me.getName()] = '' + me.text;
        //return data;
		return '' + me.text;
    },
	getSubmitData: function () {
        var me = this;
        var data = {};
		data[me.getName()] = '' + me.text;
        return data;
    },	
    
	onRender: function (ct, position) {
        dynamicsvg.superclass.onRender.call(this, ct, position);
        var me = this;
        if ((me.hasOwnProperty('height') == false) && (me.hasOwnProperty('anchor')) == false) {
			me.anchor = '100% 100%';
		}
    }
});

