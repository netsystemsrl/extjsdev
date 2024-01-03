//*************************************************************************************************************//
//			DYNAMIC IMAGE


Ext.define("dynamicimage", {
    extend: "Ext.panel.Panel",
    alias: "widget.dynamicimage",
    mixins: {
        field: "Ext.form.field.Base"
    },
    submitFormat: "t",
    submitValue: true,
    buttonOnly: true,
    text: null,
    zoomration: 1,
    allowadd: false,
    allowedit: false,
    allowdelete: false,
    allowexport: false,
    pdfExtractorMode: false,
    procremoteonselect: false,

    autoScroll: true,

    resizeMode: "fit",
    zoomLevel: 100,
    mousedowntime: 0,
    images: [],
    imageindex: 1,
    sourceX: 0,
    sourceY: 0,
    targetX: 0,
    targetY: 0,
    panWidth: 0,
    panHeight: 0,
    orgWidth: 0,
    orgHeight: 0,

    velocityFilterWeight: 0.7,
    minBrushWidth: 0.5,
    maxBrushWidth: 2.5,
    penColor: "black",
    backgroundColor: "rgba(0,0,0,0)",
    isDrawing: false,
    drawing: false,
    drawingPath: [],
    pathCounter: 0,

    onEnd: undefined,
    onBegin: undefined,

    border: 1,
    margin: 5,
    bodyStyle: "border-style: dotted",
    isAccepted: false,
    isEmpty: false,
    mycanvas: null,

    //  me.limitStart = ;
    //	me.limitEnd = ;
    scrollX: 0,
    scrollY: 0,

    localMediaStream: null,
    videoON: false,

    layout: {
        type: "fit",
        align: "stretch"
    },
    touchAction: {
        panY: true,
        panX: true,
        body: {
            pinchZoom: true
        }
    },
    listeners: {
        drag: function (e) {
            // handle drag on the panel's main element
        },
        pinch: {
            element: "body",
            fn: function (e, node) {
                this.component.zoomOut(10)
            }
        },
        DoubleTap: {
            element: "body",
            fn: function (e, node) {
                this.component.zoomIn(10)
            }
        },
        swipe: {
            element: "body",
            fn: function (e, node, options, eOpts) {
                var me = this.component

                if (!me.drawing) {
                    if (e.direction === "left") {
                        me.scrollX = me.scrollX + 500
                        this.component.body.scrollTo("left", me.scrollX)
                    }
                    if (e.direction === "right") {
                        me.scrollX = me.scrollX - 500
                        if (me.scrollX < 0) me.scrollX = 0
                        this.component.body.scrollTo("left", me.scrollX)
                    }
                    if (e.direction === "up") {
                        me.scrollY = me.scrollY + 500
                        this.component.body.scrollTo("top", me.scrollY)
                    }
                    if (e.direction === "down") {
                        me.scrollY = me.scrollY - 500
                        if (me.scrollY < 0) me.scrollY = 0
                        this.component.body.scrollTo("top", me.scrollY)
                    }

                } else {
                    console.log("drawing true")
                        // me.mycanvas.fireEvent("mousedown")
                }

                //Ext.Msg.alert('swipe', 'direction: ' + e.direction, Ext.emptyFn);
            }
        }
    },

    initComponent: function () {
        var me = this

        this.bbar = [{
            tooltip: "Fit to window",
            iconCls: "x-fa fa-arrows-alt",
            xid: "fit"
        }, {
            tooltip: "Zoom out",
            iconCls: "x-fa fa-search-minus",
            xid: "zoom-out"
        }, {
            xtype: "slider",
            hidden: ((CurrentDeviceType == "phone") ? true : false),
            xid: "zoomlevel",
            increment: 1,
            minValue: 10,
            maxValue: 200,
            value: 100,
            width: 200
        }, {
            xtype: "tbtext",
            xid: "zoomlevel-text",
            width: 40,
            style: "text-align:right;",
            text: "100%"
        }, {
            tooltip: "Zoom in",
            iconCls: "x-fa fa-search-plus",
            xid: "zoom-in"
        }, {
            xtype: "colorpicker",
            itemId: "colorpicker",
            hidden: false,
            value: "000000",
            listeners: {
                select: function (picker, color) {
                    var me = picker.up("dynamicimage")
                    me.penColor = "#" + color
                    me.ctx.strokeStyle = me.penColor
                    console.log("Colore:", me.penColor)
                }
            }
        }, {
            tooltip: "Draw",
            iconCls: "x-fa fa-pen",
            handler: function (button, event) {

                const me = button.up("dynamicimage")
                if (me.drawing) {
                    const icon = document.querySelector(".x-fa.fa-ban")
                    console.log(icon.classList, true)
                    icon.classList.replace("fa-ban", "fa-pen")
                    me.drawing = false
                } else {
                    const icon = document.querySelector(".x-fa.fa-pen")
                    console.log(icon.classList, false)
                    icon.classList.replace("fa-pen", "fa-ban")
                    me.drawing = true
                }

            }

        }, {
            xtype: "filefield",
            itemId: "FileSaveBtn",
            tooltip: "File Save",
            iconCls: "x-fa fa-floppy-o",
            cls: "x-btn-text-icon",
            buttonOnly: true,
            multiple: false,
            width: 60,
            buttonConfig: {
                text: "File",
                width: "100%",
                ui: "default-toolbar-small"
            },
            listeners: {
                change: function (button, value, eOpts) {
                    console.log("trigger upload of file:", value)
                    var file = button.fileInputEl.dom.files[0]

                    //preview
                    var me = button.up("dynamicimage")
                    var myImage = me.down("image")
                    var FileSaveBtn = me.down("#FileSaveBtn")
                    myImage.show()

                    var reader = new FileReader()
                    reader.onload = function (e) {
                        // image content is in e.target.result
                        // we can then put it into img.src, for example
                        var me = button.up("dynamicimage")
                        var myImage = me.down("image")
                        myImage.setSrc(e.target.result)
                        console.log("loadingsrc", myImage)
                            // me.drawImageOnCanvas()

                    }
                    reader.readAsDataURL(file)

                    //save
                    var data = new FormData()
                    me.text = Math.floor(Math.random() * 1000000000) + 1 + ".png"
                    data.append("file", file, me.text)
                    Ext.Ajax.request({
                        url: "/includes/io/DataWrite.php",
                        rawData: data,
                        params: {
                            layoutid: CurrentPanelRaw.id
                        },
                        headers: {
                            "Content-Type": null
                        }, //to use content type of FormData
                        success: function (response) {}
                    })

                    // reset file from upload element
                    fileField = button.fileInputEl.dom
                    parentNod = fileField.parentNode
                    tmpForm = document.createElement("form")
                    sparentNod.replaceChild(tmpForm, fileField)
                    tmpForm.appendChild(fileField)
                    tmpForm.reset()
                    parentNod.replaceChild(fileField, tmpForm)

                }
            },
            anchor: "100%",
            hidden: false
        }, {
            xtype: "button",
            itemId: "ClipBoardBtn",
            tooltip: "ClipBoard Drop",
            iconCls: "x-fa fa-floppy-o",
            cls: "x-btn-text-icon",
            hidden: false,
            handler: function (button, event) {
                var me = button.up("dynamicimage")
                CurrentPanel = me.up("panel")
                me.PasteClipboard()
            }
        }, {
            xtype: "button",
            itemId: "TextExtract",
            tooltip: "Extract Text",
            iconCls: "x-fa fa-compress",
            cls: "x-btn-text-icon",
            hidden: !me.pdfExtractorMode,
            handler: function (button, event) {
                var me = this
                var me = button.up("dynamicimage")
                CurrentPanel = me.up("panel")
                var myImage = me.down("image")
                Ext.toast("Usare il tasto dx per selezionare area di lettura")
                $(myImage.el.dom).Jcrop({
                    onSelect: function (c) {
                        var me = button.up("dynamicimage")
                        var myImage = me.down("image")
                        var myImg = myImage.el.dom
                            //var myImg = document.querySelector(".MyImage");
                        var width = myImg.naturalWidth //595
                        var height = myImg.naturalHeight //842

                        var ratiox = me.zoomration / 100
                        var ratioy = me.zoomration / 100

                        var selectedRowDataString = ""
                        selectedRowDataString += "layoutid" + "=" + CurrentPanelRaw.id + "&"
                        var CurrentForm = CurrentPanel.getForm()
                        var ID = CurrentForm.getRecord().data[CurrentPanelRaw.DataSourceField]
                        if (!Custom.IsNullOrEmptyOrZeroString(ID)) {
                            selectedRowDataString += CurrentPanelRaw.DataSourceField + "=" + ID + "&"
                        }
                        selectedRowDataString += me.name + "=" + me.text + "&"
                        selectedRowDataString += me.name + "_X1" + "=" + parseInt(c.x / ratiox) + "&"
                        selectedRowDataString += me.name + "_Y1" + "=" + parseInt(height - (c.y / ratioy)) + "&"
                        selectedRowDataString += me.name + "_X2" + "=" + parseInt(c.x2 / ratiox) + "&"
                        selectedRowDataString += me.name + "_Y2" + "=" + parseInt(height - (c.y2 / ratioy)) + "&"

                        Ext.Ajax.request({
                            params: selectedRowDataString,
                            url: "includes/io/DataWrite.php",
                            method: "POST",
                            async: false,
                            waitTitle: "Connecting",
                            waitMsg: "Invio dati...",
                            success: function (resp) {
                                var appo = Ext.util.JSON.decode(resp.responseText)
                                Custom.ExecuteProc(me.procremoteonselect)
                            },
                            failure: function () {
                                Ext.Msg.alert("error", "Not Ok")
                            }
                        })

                    },
                    onRelease: function () {}
                })
            }
        }, {
            xtype: "button",
            itemId: "TextExtractZero",
            tooltip: "Extract Pointer",
            iconCls: "x-fa fa-crosshairs",
            cls: "x-btn-text-icon",
            hidden: me.pdfExtractorMode,
            handler: function (button, event) {
                var myImage = me.down("image")
                Ext.toast("Usare il tasto dx per selezionare area di lettura")
                $(myImage.el.dom).Jcrop({
                    onSelect: function (c) {
                        var me = button.up("dynamicimage")
                        var myImage = me.down("image")
                        var myImg = myImage.el.dom
                            //var myImg = document.querySelector(".MyImage");
                        var width = myImg.naturalWidth //595
                        var height = myImg.naturalHeight //842

                        var ratiox = me.zoomration / 100
                        var ratioy = me.zoomration / 100

                        var selectedRowDataString = ""
                        selectedRowDataString += "layoutid" + "=" + CurrentPanelRaw.id + "&"
                        var CurrentForm = CurrentPanel.getForm()
                        var ID = CurrentForm.getRecord().data[CurrentPanelRaw.DataSourceField]
                        if (!Custom.IsNullOrEmptyOrZeroString(ID)) {
                            selectedRowDataString += CurrentPanelRaw.DataSourceField + "=" + ID + "&"
                        }
                        selectedRowDataString += me.name + "=" + me.text + "&"
                        selectedRowDataString += me.name + "_X1" + "=" + parseInt(c.x / ratiox) + "&"
                        selectedRowDataString += me.name + "_Y1" + "=" + parseInt(height - (c.y / ratioy)) + "&"
                        selectedRowDataString += me.name + "_X2" + "=" + parseInt(c.x2 / ratiox) + "&"
                        selectedRowDataString += me.name + "_Y2" + "=" + parseInt(height - (c.y2 / ratioy)) + "&"

                        Ext.Ajax.request({
                            params: selectedRowDataString,
                            url: "includes/io/DataWrite.php",
                            method: "POST",
                            async: false,
                            waitTitle: "Connecting",
                            waitMsg: "Invio dati...",
                            success: function (resp) {
                                var appo = Ext.util.JSON.decode(resp.responseText)
                                Custom.ExecuteProc(me.procremoteonselect)
                            },
                            failure: function () {
                                Ext.Msg.alert("error", "Not Ok")
                            }
                        })

                    },
                    onRelease: function () {}
                })
            }
        }, {
            xtype: "button",
            itemId: "Crop",
            tooltip: "Crop",
            iconCls: "x-fa fa-crop",
            cls: "x-btn-text-icon",
            hidden: me.pdfExtractorMode,
            handler: function (button, event) {
                var myImage = me.down("image")
                Ext.toast("Usare il tasto dx per selezionare area di lettura")
                $(myImage.el.dom).Jcrop({
                    aspectRatio: 1,
                    minSize: [130, 100],
                    onSelect: me.getCoords,
                    onChange: me.getCoords
                })
            }
        }, {
            xtype: "button",
            itemId: "signReset",
            tooltip: "reset",
            iconCls: "x-fa fa-ban",
            cls: "x-btn-text-icon",
            hidden: false,
            handler: function (button, event) {
                var me = button.up("dynamicimage")
                me.clear(true)

            }
        }]

        me.mycanvas = new Ext.Component({
            draggable: false,
            border: 1,
            height: "100%",
            width: "100%",
            anchor: "100% 100%",
            itemId: "MyCanvas",
            style: {
                borderColor: "black",
                borderStyle: "solid",
                boxSizing: "border-box"
            },
            autoEl: {
                tag: "canvas"
            },
            listeners: {}
        })

        this.items = [
            me.mycanvas, {
                xtype: "image",
                itemId: "MyImage",
                cls: "MyImage",
                height: "100%",
                width: "100%",
                src: "",
                hidden: true
            }
        ]

        me.callParent()

        me.on("boxready", this.initCanvas, this)

        me.on("afterrender", this.onImagePanelRendered, this)
        me.on("resize", this.onPanelResized, this)
        me.on("firstimage", this.onFirstImage, this)
        me.on("lastimage", this.onLastImage, this)
        me.on("imagechange", this.onImageChange, this)
        me.child("image").on("afterrender", this.onImageRendered, this)
    },

    initValue: function () {
        this.setValue(this.value)
    },
    setValue: function (new_value) {
        var me = this
        var myImage = me.down("image")
        me.text = new_value
        if (new_value == undefined || new_value == null) {
            myImage.setSrc("")
        } else {
            const new_valueArray = new_value.split(";")
            const new_valuePrimaImma = new_valueArray[0]
            const imagesrc = "/includes/io/CallFile.php?fileid=" + new_valuePrimaImma + "&nocache=" + Math.floor(Math.random() * 1000)
            myImage.setSrc(imagesrc)
        }
    },
    getValue: function () {
        var me = this
        var data = {}
        data[me.getName()] = "" + me.text
            //return data;
        return "" + me.text
    },
    getSubmitData: function () {
        var me = this
        var data = {}
        data[me.getName()] = "" + me.text
        return data
    },

    PasteClipboard: function () {
        var me = this
        var myImage = me.down("image")
            // use event.originalEvent.clipboard for newer chrome versions
        var items = (event.clipboardData || event.originalEvent.clipboardData).items
        console.log(JSON.stringify(items)) // will give you the mime types
            // find pasted image among pasted items
        var blob = null
        for (var i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") === 0) {
                blob = items[i].getAsFile()
            }
        }
        // load image if there is a pasted image
        if (blob !== null) {
            var reader = new FileReader()
            reader.onload = function (event) {
                console.log(event.target.result) // data url!
                document.getElementById("pastedImage").src = event.target.result
                var imagesrc = canvas.toDataURL()
                myImage.setSrc(imagesrc)
            }
            reader.readAsDataURL(blob)
        }
    },

    processImage: function (config) {
        Ext.log("Transforming Image")
        var me = this,
            maxWidth = config.maxHeight,
            maxHeight = config.maxWidth

        var image = new Image()
        image.src = config.dataURL
        image.onload = function () {

            var imgSize = me.imageSize(image.width, image.height, maxWidth, maxHeight),
                width = imgSize.width,
                height = imgSize.height,
                exifTags = undefined

            // extract exif information
            EXIF.getData(image, function () {

                exifTags = EXIF.getAllTags(this)
                var orientation = exifTags.Orientation

                Ext.log("Image Orientation :" + orientation)

                if (!imgSize.shouldResize && !orientation) {
                    Ext.log("Image Resizing and Orientation Change is not Required")
                    return Ext.callback(config.callback, config.scope, [config.dataURL, image, exifTags])
                }

                var canvas = document.createElement("canvas")
                if (orientation && orientation > 4) {
                    canvas.width = height
                    canvas.height = width
                } else {
                    canvas.width = width
                    canvas.height = height
                }

                var context = canvas.getContext("2d")
                switch (orientation) {
                case 1:
                    break
                case 2:
                    // horizontal flip
                    context.translate(width, 0)
                    context.scale(-1, 1)
                    break
                case 3:
                    // 180° rotate left
                    context.translate(width, height)
                    context.rotate(Math.PI)
                    break
                case 4:
                    // vertical flip
                    context.translate(0, height)
                    context.scale(1, -1)
                    break
                case 5:
                    // vertical flip + 90 rotate right
                    context.rotate(.5 * Math.PI)
                    context.scale(1, -1)
                    break
                case 6:
                    // 90° rotate right
                    context.rotate(.5 * Math.PI)
                    context.translate(0, -height)
                    break
                case 7:
                    // horizontal flip + 90 rotate right
                    context.rotate(0.5 * Math.PI)
                    context.translate(width, -height)
                    context.scale(-1, 1)
                    break
                case 8:
                    // 90° rotate left
                    context.rotate(-.5 * Math.PI)
                    context.translate(-width, 0)
                    break
                default:
                }
                context.drawImage(this, 0, 0, width, height)
                var dataURL = canvas.toDataURL(config.fileType)

                Ext.log("Image Resized to: " + width + " x " + height)
                Ext.callback(config.callback, config.scope, [dataURL, image, exifTags])
            })
        }
    },

    dataURItoBlob: function (dataURI) {
        // convert base64/URLEncoded data component to raw binary data held in a string
        var byteString
        if (dataURI.split(",")[0].indexOf("base64") >= 0)
            byteString = atob(dataURI.split(",")[1])
        elsem
        byteString = unescape(dataURI.split(",")[1])
            // separate out the mime component
        var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0]
            // write the bytes of the string to a typed array
        var ia = new Uint8Array(byteString.length)
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i)
        }
        return new Blob([ia], {
            type: mimeString
        })
    },

    getCoords: function (c) {
        if (parseInt(c.w) > 0) {
            xsize = 130,
                ysize = 100

            var rx = xsize / c.w
            var ry = ysize / c.h
            $pimg = $("#preview")
            $pimg.css({
                width: Math.round(rx * boundx) + "px",
                height: Math.round(ry * boundy) + "px",
                marginLeft: "-" + Math.round(rx * c.x) + "px",
                marginTop: "-" + Math.round(ry * c.y) + "px"
            })
        }
    },
    // Events -----------------------------------------------------------------------------------------

    onImagePanelRendered: function () {
        var me = this
        var bdy = this.body
        bdy.on("mousedown", this.onImagePanelMouseDown, this)
        bdy.on("mouseup", this.onImagePanelMouseUp, this)

        var tb = this.getDockedItems("toolbar[dock=bottom]")[0]
        Ext.each(tb.query("button"), function (btn) {
            btn.on("click", me.onToolbarButtonClicked, me)
        })

        tb.child("slider[xid=zoomlevel]").on("change", this.onZoomlevelChanged, this)
        tb.child("slider[xid=zoomlevel]").on("drag", this.onZoomlevelSelected, this)
        tb.child("slider[xid=zoomlevel]").getEl().on("click", this.onZoomlevelSelected, this)

        this.fireEvent("resize")
    },

    onPanelResized: function () {
        this.panWidth = Ext.get(this.body.dom).getWidth() - 20
        this.panHeight = Ext.get(this.body.dom).getHeight() - 20
        this.resize()
    },

    onImagePanelMouseDown: function (e) {
        if (e.button == 0) {
            this.mousedowntime = new Date().getTime()
            this.sourceX = this.targetX = e.browserEvent.clientX
            this.sourceY = this.targetY = e.browserEvent.clientY

            if (this.drawing) {
                console.log("firing mousedown")
                this.mycanvas.fireEvent("mousedown", this.mycanvas)
            } else {
                this.body.on("mousemove", this.onBodyMouseMove, this)
                    // e.stopEvent()
            }

        }
    },

    onImagePanelMouseUp: function (e) {
        if (e.button == 0) {

            var klicktime = ((new Date().getTime()) - this.mousedowntime)

            if (klicktime < 180 && (this.targetX - this.sourceX) < 5 &&
                (this.targetX - this.sourceX) > -5 && (this.targetY - this.sourceY) < 5 &&
                (this.targetY - this.sourceY) > -5) {
                this.next()
            }

            if (this.drawing) {
                this.mycanvas.fireEvent("mouseup", this.mycanvas)
            } else {
                this.body.un("mousemove", this.onBodyMouseMove, this)
            }
        }

        this.mousedowntime = 0
    },

    onBodyMouseMove: function (e) {
        this.scrollBy((this.targetX - e.browserEvent.clientX), (this.targetY - e.browserEvent.clientY))
        this.targetX = e.browserEvent.clientX
        this.targetY = e.browserEvent.clientY
    },

    onImageChange: function () {
        var tb = this.getDockedItems("toolbar[dock=bottom]")[0]
        tb.child("button[xid=next]").enable()
        tb.child("button[xid=prev]").enable()
    },

    onFirstImage: function () {
        var tb = this.getDockedItems("toolbar[dock=bottom]")[0]
        tb.child("button[xid=prev]").disable()
    },

    onLastImage: function () {
        var tb = this.getDockedItems("toolbar[dock=bottom]")[0]
        tb.child("button[xid=next]").disable()
    },

    onToolbarButtonClicked: function (btn) {
        if (btn.xid == "fit") {
            this.resizeMode = "fit"
        }
        if (btn.xid == "fit-h") {
            this.resizeMode = "fith"
        }
        if (btn.xid == "fit-v") {
            this.resizeMode = "fitv"
        }
        if (btn.xid == "org") {
            this.resizeMode = null
        }
        if (btn.xid == "fit" || btn.xid == "fit-h" || btn.xid == "fit-v" || btn.xid == "org") {
            this.resize()
        }
        if (btn.xid == "next") {
            this.next()
        }
        if (btn.xid == "prev") {
            this.prev()
        }
        if (btn.xid == "zoom-in") {
            this.zoomIn(10)
        }
        if (btn.xid == "zoom-out") {
            this.zoomOut(10)
        }
    },

    onZoomlevelChanged: function (combo, newval) {
        this.zoomLevel = newval
        var tb = this.getDockedItems("toolbar[dock=bottom]")[0]
        var tbtext = tb.child("tbtext[xid=zoomlevel-text]")
        tbtext.setText(this.zoomLevel + "%")
        this.imageZoom(this.zoomLevel)
    },

    onZoomlevelSelected: function (slider) {
        this.resizeMode = "zoom"
    },

    onImageRendered: function (img) {
        var me = this

        img.el.on({
            load: function (evt, ele, opts) {
                ele.style.width = ""
                ele.style.height = ""
                me.orgWidth = Ext.get(ele).getWidth()
                me.orgHeight = Ext.get(ele).getHeight()
                me.resize()
                me.fireEvent("imageloaded")
                if (ele.src != "") {
                    me.setLoading(false)
                    me.drawImageOnCanvas()
                }
            },
            error: function (evt, ele, opts) {}
        })
        this.prev()
    },

    onRender: function (ct, position) {
        dynamicimage.superclass.onRender.call(this, ct, position)

        var me = this
        me.maxHeight = Ext.getBody().getViewSize().height - (me.y + 100)
        if (me.hasOwnProperty("height") == false) me.height = Ext.getBody().getViewSize().height - (me.y + 100)

    },

    // Methods ZOOM ----------------------------------------------------------------------------------------

    resize: function () {
        if (this.resizeMode == "fit") {
            this.imageFit()
        } else if (this.resizeMode == "fith") {
            this.imageFitHorizontal()
        } else if (this.resizeMode == "fitv") {
            this.imageFitVertical()
        } else if (this.resizeMode == null) {
            this.imageFitNot()
        }
        this.imageZoom(this.zoomLevel)
    },

    imageFit: function () {
        var pwidth = this.panWidth
        var pheight = this.panHeight
        var iwidth = this.orgWidth
        var iheight = this.orgHeight

        if ((iwidth * pheight / iheight) > pwidth) {
            this.imageFitHorizontal()
        } else {
            this.imageFitVertical()
        }
    },

    imageFitHorizontal: function () {
        var pwidth = this.panWidth
        var pheight = this.panHeight
        var iwidth = this.orgWidth
        var iheight = this.orgHeight

        if (iwidth >= pwidth) {
            var perc = (100 / iwidth * pwidth)
            var tb = this.getDockedItems("toolbar[dock=bottom]")[0]
            tb.child("slider[xid=zoomlevel]").setValue(perc)
        } else {
            this.imageFitNot()
        }
    },

    imageFitVertical: function (changemode) {
        var pwidth = this.panWidth
        var pheight = this.panHeight
        var iwidth = this.orgWidth
        var iheight = this.orgHeight

        if (iheight >= pheight) {
            var perc = (100 / iheight * pheight)
            var tb = this.getDockedItems("toolbar[dock=bottom]")[0]
            tb.child("slider[xid=zoomlevel]").setValue(perc)
        } else {
            this.imageFitNot()
        }
    },

    imageZoom: function (level) {
        this.zoomration = level

        var iwidth = this.orgWidth
        var iheight = this.orgHeight
        this.child("image").getEl().dom.style.width = parseInt((iwidth / 100 * level)) + "px"
        this.child("image").getEl().dom.style.height = parseInt((iheight / 100 * level)) + "px"
    },

    zoomIn: function (interval) {
        this.resizeMode = "zoom"
        var tb = this.getDockedItems("toolbar[dock=bottom]")[0]
        var slider = tb.child("slider[xid=zoomlevel]")
        var min = slider.minValue
        var max = slider.maxValue
        var current = slider.getValue()

        var target = current + interval
        if (target > max) {
            target = max
        }

        slider.setValue(target)
        this.drawImageOnCanvas()

    },

    zoomOut: function (interval) {
        this.resizeMode = "zoom"
        var tb = this.getDockedItems("toolbar[dock=bottom]")[0]
        var slider = tb.child("slider[xid=zoomlevel]")
        var min = slider.minValue
        var max = slider.maxValue
        var current = slider.getValue()

        var target = current - interval
        if (target > max) {
            target = max
        }

        slider.setValue(target)
        this.drawImageOnCanvas()
    },

    imageFitNot: function (changemode) {
        var tb = this.getDockedItems("toolbar[dock=bottom]")[0]
        tb.child("slider[xid=zoomlevel]").setValue(100)

    },

    setImage: function (img) {
        var ip = this.child("image")
        this.setLoading("Loading...")
        ip.setSrc(img)
    },

    // Methods CROP SELECT ----------------------------------------------------------------------------------------

    getResultPosition: function () {
        var me = this
        var parent = me.getBox()
        var myImage = me.down("image")
        var img = myImage.getBox()
        var res = {
            x: (img.x - parent.x),
            y: (img.y - parent.y),
            width: img.width,
            height: img.height
        }
        myImage.setStyle({
            "background-position": (-res.x) + "px " + (-res.y) + "px"
        })
        return res
    },
    getCropData: function () {
        return this.getResultPosition()
    },

    /**
     * Returns the Calculated Size of the Image.
     *
     * @param {Number} width Original Width of the Image
     * @param {Number} height Original Height of the Image
     * @param {Number} maxWidth The maximum width that is allowed for Resize.
     * @param {Number} maxHeight The Maximum height that is allowed for Resize.
     */
    imageSize: function (width, height, maxWidth, maxHeight) {
        var newHeight = width,
            newWidth = height,
            shouldResize = width > maxWidth || height > maxHeight

        if (width > height) {
            newHeight = height * (maxWidth / width)
            newWidth = maxWidth
        } else {
            newWidth = width * (maxHeight / height)
            newHeight = maxHeight
        }
        return {
            width: newWidth,
            height: newHeight,
            shouldResize: shouldResize
        }
    },

    drawPathOnCanvas: function () {
        console.log("drawing path", this.drawingPath)
        t = this
        if (t.drawingPath.length > 0) {
            t.ctx.lineWidth = 2;

            for (const path of t.drawingPath) {
                console.log({
                    path
                })
                t.ctx.beginPath();
                t.ctx.moveTo(path[0].x, path[0].y);

                for (var i = 1; i < path.length; i++) {
                    t.ctx.strokeStyle = path[i].color;
                    t.ctx.lineTo(path[i].x, path[i].y);
                    // t.ctx.stroke();
                }

                t.ctx.stroke();
                t.ctx.closePath();
            }
        }
    },

    drawImageOnCanvas: function () {
        const me = this
        const img = this.down("image").el.dom
        const ctx = me.ctx
        const canvas = ctx.canvas
        const h = me.orgHeight // this.getHeight()
        const w = me.orgWidth // this.getWidth()

        const zoomLevel = (me.zoomLevel / 100)

        ctx.setTransform(1, 0, 0, 1, 0, 0)
        me.clear()
        me.ctx.scale(zoomLevel, zoomLevel)

        me.drawPathOnCanvas();
        me.ctx.drawImage(
            img,
            0, 0,
            w , h
        )
    },

    initCanvas: function (...params) {
        var me = this
        canvas = me.mycanvas.getEl().dom

        if (canvas) {
            me.canvas = canvas

            console.log("Initialize canvas")

            canvas.height = this.getHeight()
            canvas.width = this.getWidth()
            me.ctx = canvas.getContext("2d")

            me.ctx.setTransform(1, 0, 0, 1, 0, 0)
            me.ctx.scale((me.zoomLevel / 100), (me.zoomLevel / 100))

            canvas.addEventListener("mousedown", function (event) {
                console.log("qui")
                if (!me.drawing) return

                me.isDrawing = true

                me.ctx.strokeStyle = t.penColor;
                me.ctx.lineWidth = 2;
                me.ctx.beginPath();
                me.drawingPath.push([])

                const canvasRect = canvas.getBoundingClientRect();
                const scrollX = window.scrollX || window.pageXOffset;
                const scrollY = window.scrollY || window.pageYOffset;
                const x = (event.clientX - canvasRect.left) + scrollX;
                const y = (event.clientY - canvasRect.top) + scrollY;

                me.ctx.moveTo(x, y);

            })

            canvas.addEventListener("mousemove", function (event) {
                if (!me.isDrawing || !me.drawing) return

                const canvasRect = canvas.getBoundingClientRect();
                const scrollX = window.scrollX || window.pageXOffset;
                const scrollY = window.scrollY || window.pageYOffset;
                const x = (event.clientX - canvasRect.left) + scrollX;
                const y = (event.clientY - canvasRect.top) + scrollY;

                me.ctx.lineTo(x, y);
                me.drawingPath[me.pathCounter].push({
                    x, y, color: me.penColor
                });

                me.ctx.stroke();

            })

            canvas.addEventListener("mouseup", function () {
                if (!me.isDrawing || !me.drawing) return
                me.isDrawing = false
                me.pathCounter++
            })
        }
    },
    clear: function (isReset = false) {
        var me = this
        me.ctx.clearRect(0, 0, this.getWidth(), this.getHeight())

        if (isReset) {
            me.drawingPath = []
            me.pathCounter = 0
        }
    }
})
