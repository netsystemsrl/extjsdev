//*************************************************************************************************************//
//			DYNAMIC FRAME
Ext.define('dynamicstl', {
	extend: 'Ext.Component',
    //suspendLayout: true,
    alias: 'widget.dynamicstl',
    mixins: {
        field: 'Ext.form.field.Base'
    },
    submitFormat: 't',
    submitValue: true,
    buttonOnly: true,
    text: null,
    //zoomration: 1,
    allowadd: false,
    allowedit: false,
    allowdelete: false,
    allowexport: false,
    pdfExtractorMode: false,
    procremoteonselect: false,
	fieldPointSTL: '',
	panelPointSTL: '',
	processPointSTL: '',
    width: '100%',
    height: '100%',
	text: '',
	id: 'MyDynamicSTL',
	iFrame : null,
    initComponent: function () {
        var me = this;
		me.panelPointSTL = me.up('panel').up('panel').name;
        this.callParent(arguments);
	},
	html: '<progress id="pbtotal" style="text-align:center;  position:absolute; left: 50%;  top: 50%;"  value="0" max="1"></progress><div id="stlContainer" style="width:100%;height:100%;margin:0 auto;"></div>',
    listeners: {
		afterrender: function () {
			console.log('rendered');
			me = Ext.getCmp(this.id);
			
			//me.fieldPointSTL;
			//function displayMessage (evt)
			//const newMsg = { src: src, panelPointSTL : me.panelPointSTL, fieldPointSTL : me.fieldPointSTL, processPointSTL : me.processPointSTL };
			//el.contentWindow.postMessage(JSON.stringify(newMsg), "*");
			//el.contentWindow.postMessage(src, "*");
		
		}
	},
	initValue: function () {
        var me = this;
        this.setValue(this.value);
    },
    setValue: function (new_value) {
        var me = this;
        me.text = new_value;
		
		//loading
		function load_prog(load_status, load_session) {
			var loaded=0;
			var total=0;
			Object.keys(load_status).forEach(function(model_id){
				if (load_status[model_id].load_session==load_session) {
					loaded+=load_status[model_id].loaded;
					total+=load_status[model_id].total;
				}
			});
			document.getElementById("pbtotal").value=loaded/total;
		}
		//loadfile
		if (me.text){
			src = "/includes/io/CallFile.php?fileid=" + me.text + '&nocache=' + Math.floor(Math.random() * 1000);
			var stl_viewer = new StlViewer (
				document.getElementById("stlContainer"), {
					loading_progress_callback:load_prog,
					zoom:40,
					models: [
						{id:1, filename:src}
					],
					all_loaded_callback: function () {
						document.getElementById("pbtotal").remove();
					},
					on_model_mouseclick: function(model_id, e, distance, click_type){
						//model_id: Number, represents the model that was clicked; 
						//e:DOM event object; distance:distance form camera (z axis); 
						//click_type: Number, 1=left click, 3=right click, 11=double click, 20=touch screen)
					}
				}
			);
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
        dynamicstl.superclass.onRender.call(this, ct, position);
        var me = this;
        if ((me.hasOwnProperty('height') == false) && (me.hasOwnProperty('anchor')) == false) {
			me.anchor = 'none 100%';
		}
    },
	afterrender: function() {
        var me = this;
		console.log('afterrender');
	 },
	ready:function () {
        var me = this;
		console.log('ready');
	},
	load:function () {
        var me = this;
		console.log('load');
	},
	postImage: function () {
        //to image
        var me = this;
		
        var data = new FormData();
        me.text = Math.floor(Math.random() * 1000000000) + 1 + '.png';
		
        var imagesrc = me.canvas.toDataURL();
        var blobBin = atob(imagesrc.split(',')[1]);
        var array = [];
        for (var i = 0; i < blobBin.length; i++) {
            array.push(blobBin.charCodeAt(i));
        }
        var file = new Blob([new Uint8Array(array)], {
            type: 'image/png'
        });

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
});
