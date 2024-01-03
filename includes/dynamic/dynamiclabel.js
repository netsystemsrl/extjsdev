Ext.define('dynamiclabel', {
  extend: 'Ext.panel.Panel',
  alias: 'widget.dynamiclabel',
  mixins: {
    field: 'Ext.form.field.Base'
  },

  /* DATA */
  title: 'Dynamic Label',
  datasource: 'ESEMPIO',
  datasourcetype: 'ESEMPIO',
  valueField: 'ID',
  displayField: 'NOME',
  datasourcefield: '',
	layouteditorid:'',
	layouteditorWindowMode: 'acDialog',
  fontColor: null,
  fontWeight: '700',
  fontSize: '20px',
  store: {},
  referenceHolder: true,
  layout: {
    type: 'hbox', //vbox, hbox, auto, absolute,
    align: 'stretch'
  },

  /* STORE OBJ */
  config: {
    store: 'ext-empty-store'
  },
  publishes: 'store',
  applyStore: function (store) {
    console.log("Apply Store:", { store })
    return Ext.getStore(store)
  },

  /* SETUP LABEL */
  initComponent: function () {
    var me = this

    me.store = Ext.StoreManager.lookup(me.store);

    console.log({
      store: me.getStore(),
      field: this.displayField,
    })

    var ValueObj = {
      xtype: 'label',
      itemId: 'valueLabel',
      margin: '20 0 0 0',
      labelWidth: 200,
      text: '',
      style: {
        fontSize: me.fontSize,
        color: me.fontColor,
        fontWeight: me.fontWeight,
        background: 'transparent',
        border: 20
      },
    }

    me.items = [ValueObj]
    me.callParent()
  },

  /* ON RENDER LISTENER */
  onRender: function (ct, position) {
    dynamiclabel.superclass.onRender.call(this, ct, position)
    this.store.on('load', this.storeLoad, this)
    this.storeLoad()
    this.callParent(arguments)
  },

  /* GET STORE AND UPDATE LABEL */
  storeLoad: function () {
    var me = this;
    var objlabel = this.child('label')
    console.log("STORE LOAD", { store: me.store })

    if (me.store.data.items.length > 0) {
      var result = me.store.data.items[0].data[me.displayField]
      objlabel.setText(result)
    }
  },

  /* GET STORE */
  getStore: function () {
    return (
      Ext.data.StoreManager
        .lookup(this.store || 'ext-empty-store')
        .data.items
    )
  }
})
