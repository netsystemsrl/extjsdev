Ext.define('dynamicUploader', {
    extend: 'Ext.form.Panel',
    alias: 'widget.dynamicuploader',

    title: 'Logo',
    bodyCls: 'body-border-only',
    bodyPadding: 20,
    height: 250,
    cls: 'thing',
    referenceHolder: true,
    defaultListenerScope: true,
    config: {
        droppedDocument: null
    },
    layout: {
        type: 'vbox',
        align: 'middle',
        pack: 'center'
    },
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        layout: {
            type: 'hbox',
            pack: 'end'
        },
        items: [{
            xtype: 'button',
            text: 'Remove',
            margin: 0,
            iconCls: 'fa fa-times'
        }, {
            xtype: 'button',
            text: 'Upload',
            listeners: {
                click: 'onClickUploadBtn'
            }
        }]
    }],
    items: [{
        xtype: 'component',
        margin: '0 0 5 0',
        html: '<div class="blah fa fa-cloud-upload-alt" style="font-size: 40px; color: #444;"></div>'
    }, {
        xtype: 'component',
        style: 'font-size: 16px',
        margin: '0 0 10 0',
        html: 'Upload logo here'
    }, {
        xtype: 'component',
        style: 'text-align: center;',
        html: 'Drag and drop or click to browse<br>.png or .jpeg.  Max size 2MB.'
    }, {
        xtype: 'filefield',
        name: 'DocumentField',
        hidden: true,
        reference: 'documentField'
    }],

    listeners: {
        drop: {
            element: 'el',
            fn: 'onDropView'
        },
        click: {
            element: 'body',
            fn: 'onClickView'
        }
    },

    /**
     * If this method returns false, then that means FormData is not defined in the browser (most likely IE9 only), so
     * depending on that, we have to determine how to handle any subsequent events... maybe it's just a fire and forget?
     */
    uploadDocument: async function () {
        // Use more modern approach
        if ('FormData' in window) {
            let files = this.getDroppedDocument();
            // If the user didn't drop a file, let's check if they manually selected one
            if (!files) {
                const fileInputDom = this.getDocumentFieldDom();
                files = fileInputDom && fileInputDom.files;
            }
            try {
                const formData = new FormData();
                for (let i = 0; i < files.length; i++) {
                    formData.append('DocumentField', files[i]);
                }
                await Ext.Ajax.requestAsync({
                    url: this.url,
                    method: 'POST',
                    rawData: formData,
                    headers: {
                        /* We have to unset the Content-Type, so the native XHR call figures out what our content should be...
                         * without this, it gets sent as text/plain, which throws a server error, and just isn't right */
                        'Content-Type': undefined
                    }
                });
                console.log('uploaded');
            } catch (ex) {
                this.logException(ex);
            }
        }
        // Otherwise, default to a form submit... really should just be IE9 that uses this
        else {
            await this.submitAsync();
            console.log('uploaded');
        }
    },

    onClickView: function () {
        this.lookup('documentField').fileInputEl.dom.click();
    },

    onClickUploadBtn: function () {
        const params = {};
        const files = this.getDroppedDocument();
        if (files) {
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('DocumentField', files[i]);
            }
            params.DocumentField = formData;
        }
        this.submit({
            url: 'blah',
            params: params
        })
    },

    onDropView: function (event) {
        this.setDroppedDocument(event.browserEvent.dataTransfer.files)
        event.preventDefault();
        event.stopPropagation()
    }
});