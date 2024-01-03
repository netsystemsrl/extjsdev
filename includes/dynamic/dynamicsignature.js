//*************************************************************************************************************//
//			DYNAMIC SIGNATURE DAFARE 
//	https://github.com/javachap/extjs-signature-pad
//  https://github.com/szimek/signature_pad


function dataURItoBlob(dataURI) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);

  // create a view into the buffer
  var ia = new Uint8Array(ab);

  // set the bytes of the buffer to the correct values
  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }

  // write the ArrayBuffer to a blob, and you're done
  var blob = new Blob([ab], {type: mimeString});
  return blob;

}

Ext.define('dynamicsignature', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.dynamicsignature',
    mixins: {
        field: 'Ext.form.field.Base'
    },
    submitFormat: 't',
    submitValue: true,
    text: null,

    allowBlank: true,
    validateBlank: true,

    velocityFilterWeight: 0.7,
    minBrushWidth: 0.5,
    maxBrushWidth: 2.5,
    penColor: 'black',
    backgroundColor: "rgba(0,0,0,0)",

    onEnd: undefined,
    onBegin: undefined,

    border: 1,
    margin: 5,
    bodyStyle: 'border-style: dotted',
    isAccepted: false,
    isEmpty: false,
    mycanvas: null,
    signaturePad: undefined,

    initValue: function () {
        this.setValue(this.value);
    },
    setValue: function (new_value) {
        var me = this;
        var myImage = me.down('image');
        me.text = new_value;
        if (new_value == undefined || new_value == null) {
            myImage.setSrc('');
        } else {
            var imagesrc = '/includes/io/CallFile.php?fileid=' + new_value + '&nocache=' + Math.floor(Math.random() * 1000);
            myImage.setSrc(imagesrc);
        }
    },
    getValue: function () {
        var me = this;
        var data = {};
        if (!me.isEmpty) {
            data[me.getName()] = '' + me.text;
        }
        //return data;
        return '' + me.text;
    },
    getSubmitData: function () {
        var me = this;
        var data = {};
        if (!me.isEmpty) {
            data[me.getName()] = '' + me.text;
        }
        return data;
    },

    onRender: function (ct, position) {
        dynamicsignature.superclass.onRender.call(this, ct, position);
        var me = this;
    },

    initComponent: function () {

        this.callParent(arguments);

        var me = this;
        me.bbar = [{
            xtype: 'button',
            itemId: 'signSave',
            tooltip: 'reset',
            iconCls: 'x-fa fa-floppy-o',
            cls: 'x-btn-text-icon',
            hidden: false,
            handler: function (button, event) {
                var me = button.up('dynamicsignature');
                me.postImage();
                Ext.Msg.alert('message', 'Ok');
            }
        }, {
            xtype: 'button',
            itemId: 'signReset',
            tooltip: 'reset',
            iconCls: 'x-fa fa-crosshairs',
            cls: 'x-btn-text-icon',
            hidden: false,
            handler: function (button, event) {
                var me = button.up('dynamicsignature');
                me.initCanvas()
                    //var myImage = me.down('image');
                    // myImage.setSrc('');
            },
        }];

        me.mycanvas = new Ext.Component({
            draggable: false,
            border: 1,
            height: "100%",
            width: "100%",
            anchor: "100% 100%",
            itemId: 'MyCanvas',
            style: {
                borderColor: 'black',
                borderStyle: 'solid'
            },
            autoEl: {
                tag: 'canvas'
            },
            listeners: {

            }
        });
        me.items = [
            me.mycanvas, {
                xtype: 'image',
                itemId: 'MyImage',
                cls: 'MyImage',
                height: "100%",
                width: "100%",
                src: '/repositorycom/empty.png'
            }
        ];

        this.on('boxready', this.initCanvas, this);

        me.callParent();
    },

    initCanvas: function () {
        var me = this;
        canvas = me.mycanvas.getEl().dom;
        if (canvas) {
            me.canvas = canvas;
            canvas.height = this.getHeight();
            canvas.width = this.getWidth();
            me.ctx = canvas.getContext("2d");

            me.signaturePad = new SignaturePad(me.canvas, {
                backgroundColor: 'rgba(255, 255, 255, 0)',
                penColor: 'rgb(0, 0, 0)'
            });

        }
    },
    postImage: function () {
        //to image
        var me = this;
        if (me.signaturePad.isEmpty()) {
            //return alert("Please provide a signature first.");
        }
        
        var imagesrc = me.signaturePad.toDataURL('image/png');
        var file = dataURItoBlob(imagesrc);
        var data = new FormData();
        me.text = Math.floor(Math.random() * 1000000000) + 1 + '.png';
        data.append('file', file, me.text);

        Ext.Ajax.request({
            url: '/includes/io/DataWrite.php',
            rawData: data,
            params: {
                layoutid: CurrentPanelRaw.id,
            },
            headers: {
                'Content-Type': null
            }, //to use content type of FormData
            success: function (response) {}
        });
    },
    clear: function () {
        var me = this;
        me.ctx.fillStyle = me.backgroundColor;
        me.ctx.clearRect(0, 0, me.mycanvas.width, me.mycanvas.height);
        me.ctx.fillRect(0, 0, me.mycanvas.width, me.mycanvas.height);
        me.resetta();

    },
});
