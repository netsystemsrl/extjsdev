


//*************************************************************************************************************//
//			DYNAMIC PDF EXTRACT
Ext.define('dynamicpdfextract', {
	alias: 'widget.dynamicpdfextract',
    extend: 'Ext.Img',
	mixins: {
        field: 'Ext.form.field.Base'
    },
	minWidth: 50,
	minHeight: 50,
	quadratic: false,
	preserveRatio: true,
	opacity: 1.0,
	style: {
		cursor: 'move',
		position: 'absolute',
		background: 'url(' + this.src + ') no-repeat left top'
	},
	autoEl: {
		tag: 'div',
		children: [{
				tag: 'div',
				cls: 'image-crop-wrapper',
				style: {
					background: '#ffffff',
					opacity: 0.5,
					position: 'absolute'
				}
			}
		]
	},
	listeners: {
		resize: function () {
			res = me.getResultPosition();
			me.fireEvent('changeCrop', me, res);
			me.fireEvent('resizeCrop', me, res);
		}
	},	
	text: '',
	initComponent: function(){
		var me = this;
        var config = {};
        Ext.apply(me, config);
		me.setSrc('/repositorycom/empty.png');
		me.callParent(arguments);
    },
	initValue : function(){
          this.setValue(this.value);
    },
	onRender: function (ct, position) {
		var me = this,
			height = me.height,
			width = me.width,
			wrap = me.el.down('.image-crop-wrapper'),
			dragConf = {
				constrain: true,
				constrainTo: me.el,
				listeners: {
					dragstart: function () {
						this.image.getEl().setStyle({
							'background': 'transparent'
						});
					},
					dragend: function () {
						var me = this,
						res = me.getResultPosition();
						me.image.getEl().setStyle({
							'background-image': 'url(' + me.src + ')',
							'background-repeat': 'no-repeat'
						});
						me.fireEvent('changeCrop', me, res);
						me.fireEvent('moveCrop', me, res);
					},
					scope: me
				}
			};
			//wrap.setSize(me.width, me.height);

		me.el.setStyle({
			background: 'url(' + me.src + ') no-repeat left top'
		});
	},
    setValue: function (new_value) {
        var me = this;
		me.text = new_value;
		if (new_value == undefined || new_value == null) {				
			this.setSrc('');
		} else {
			var imagesrc = 'includes/io/CallFile.php?fileid=' + new_value;
			this.setSrc(imagesrc);
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
	getResultPosition: function () {
		var me = this,
			parent = me.getBox(),
			img = me.image.getBox(),
			res = {
				x: (img.x - parent.x),
				y: (img.y - parent.y),
				width: img.width,
				height: img.height
			};
		me.image.getEl().setStyle({
			'background-position': (-res.x) + 'px ' + (-res.y) + 'px'
		});
		return res;
	},
	getCropData: function () {
		return this.getResultPosition();
	},
});