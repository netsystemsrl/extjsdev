//*************************************************************************************************************//
//			DYNAMIC HTML READER BOX
// Ext.define('dynamichtmlbox', {
// 	extend: 'Ext.form.HtmlEditor',
// 	alias: 'widget.dynamichtmlbox',
// 	createLink: true,
// 	enableLinks: true,
// 	editable: false,
// 	initComponent: function () {
// 		console.log("[HTML] initComponent")

// 		var me = this
// 		var config = {}
// 		if (me.editable == false) {
// 			var config = {
// 				enableColors: false,
// 				enableAlignments: true,
// 				enableLists: true,
// 				enableLinks: true,
// 				enableFormat: true,
// 				enableFontSize: true,
// 				enableFont: true,
// 				enableSourceEdit: false
// 			}
// 		}
// 		Ext.apply(me, config)
// 		me.callParent(arguments)
// 		console.log("FINISHHH")
// 	}
// })

Ext.define('dynamichtmlbox', {
	extend: 'Ext.form.field.HtmlEditor',
	xtype: 'dynamichtmlbox',
	createLink: true,
	enableColors: true,
	enableAlignments: true,
	enableSourceEdit: true,
	enableLists: true,
	enableLinks: true,
	enableFormat: true,
	enableFontSize: true,
	//enableFont: true,
	iframeEl: true,
	fontFamilies: [
		'Arial', 'Arial Black', 'Courier New', 'Georgia', 'Impact',
		'Lucida Console', 'Lucida Sans Unicode', 'Palatino Linotype',
		'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana'
	],
	initComponent: function () {
		console.log("[HTMLBOX] INIT")
		this.on('render', this.onRender, this)
		this.callParent()
		const me = this
		const config = {
			...(
				`enableColors
				enableAlignments
				enableFormat
				enableFontSize
				enableSourceEdit
				enableLists
				enableLinks`.split("\n").reduce((acc, configEl) => {
					acc[configEl.trim()] = me.editable
					return acc
				}, {}))
		}

		Ext.apply(me, config)
	},
	listeners: {
		afterrender: function(editor) {
			editor.getToolbar().hide();
		},
	},
	onRender: function (args) {
		const me = this
		const tb = me.getToolbar()
		console.log("[HTMLBOX] onRender")

		const btns = {
			StrikeThrough: {
				itemId: 'add-iframe',
				cls: 'x-btn-icon',
				iconCls: 'x-fa fa-video-camera',
				enableOnSelection: true,
				tooltip: {
					title: 'Aggiungi link',
					text: 'Inserisci il link del video'
				},
				handler: function () {
					console.log("[HTMLBOX] ESEGUP")

					Ext.MessageBox.prompt('Inserisci link', 'Inserisci il link del video', function (btn, url) {
						if (btn === 'ok' && url) {
							const iframeHtml = '<iframe src="' + url + '"></iframe>'
							me.insertAtCursor(iframeHtml)
						}
					})

					this.callParent()
				},
				scope: this,
			},
		}

		tb.insert(5, btns.StrikeThrough) // insert button to the toolbar

		this.callParent() // call regular 'onRender' here or at the start of the foo
	}
})