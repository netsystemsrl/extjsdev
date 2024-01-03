Ext.define('dynamicbuttontimer', {
	extend: 'Ext.button.Button',
    alias: 'widget.dynamicbuttontimer',	
    mixins: {
        field: 'Ext.form.field.Base'
    },
    submitFormat: 't',
    submitValue: true,
    massUpdate: true,
    title: '',
    text: '',
    /* DATA */
    valueField: null,
	activateTimer:10,
	
    getSubmitData: function () {
        var me = this,
            data = null;
        data = {};
        data[me.getName()] = '' + me.text;
        return data;
    },
    setValue: function (value) {
        var me = this;
        console.log('setvalue text in grid=' + value);
        me.text = value;
        me.keyValue = '';
        me.textFilter = value;
    },
    getValue: function () {
        var me = this;
        return '' + me.text;
    },
	listeners: {
		afterrender: function () {
            var me = this;
			//animate(this, 0, 1, me.activateTimer * 1000);
			me.startAnimate(me.activateTimer * 1000,0,1);
		},
		beforedestroy: function(){
            var me = this;
			me.stopAnimation();
		},
		destroy: function( button, eOpts ) {
            var me = this;
			me.stopAnimation();
		},
		click: function( button, e, eOpts ){
            var me = this;
			me.stopAnimation();
		}
	},
	
	initComponent: function () {
        var me = this;
		me.callParent();     
    },
    onRender: function(ct, position){
		dynamicbuttontimer.superclass.onRender.call(this, ct, position);
    },
	startAnimate: function(interVal, opacityFrom, opacityTo) {
        var me = this;
		me.animate({
			duration: interVal,
			from: {
				opacity: opacityFrom
			},
			to: {
				opacity: opacityTo
			},
			listeners: {
				beforeanimate:  function() {
					// Execute my custom method before the animation
					this.myBeforeAnimateFn(interVal, opacityFrom, opacityTo);
				},
				afteranimate: function() {
					// Execute my custom method after the animation
					this.myAfterAnimateFn(interVal, opacityFrom, opacityTo);
				},
				scope: this
			}
		});
	},
	myBeforeAnimateFn: function(interVal, opacityFrom, opacityTo) {
        var me = this;
		if(opacityFrom == 1) {
			me.startAnimate( 1000,1,0);    
			beep();         
		} else {
			me.startAnimate( 1000,0,1);
		}
		// My custom logic
	},
	myAfterAnimateFn: function(interVal, opacityFrom, opacityTo) {
        var me = this;
		// My custom logic
	}
});