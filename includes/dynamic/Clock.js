
Ext.define('Clock', {
    extend: 'Ext.Component',
    mixins: ['Ext.form.field.Field'],
    alias: 'widget.clock',
 
	/**
	 * @cfg {Float} hourOffset An offset in hours added to current time
	 */
	hourOffset : 0,

	/**
	 * @cfg {string} hourColor The color for the hour hand
	 */
	hourColor : '#42B712',
	
	/**
	 * @cfg {string} minuteColor The color for the minute hand
	 */
	minuteColor : '#C6D92C',

	/**
	 * @cfg {string} secondColor The color for the second hand
	 */
	secondColor : '#dee',

	/**
	 * @cfg {string} clockBgUrl The URL for the clock background images
	 */
	clockBgUrl : "images/bg-clock.png",

	/**
	 * @cfg {string} label A label to display below the clock
	 */
	label : "",
	/**
	 * initializing the component with super class constructor call
	 */
	
	initComponent: function() {
		this.callParent();
	},

	// Overriding superclass template method
	afterRender : function() {
		this.addClass('ext-ux-clock');

		var size = Math.min(this.getHeight(), this.getWidth());
		
		this.innerEl = this.el.createChild({
			cls : 'ext-ux-clock-inner'
		})

		// Background image of an empty clock
		this.bgImg = this.innerEl.createChild({
			tag : 'img',
			cls : 'ext-ux-clock-img',
			src : this.clockBgUrl,
			width : size,
			height : size
		});
	   
		this.labelEl = this.el.createChild({
			cls : 'ext-ux-clock-label',
			html : this.label
		});

		// Initialize a Raphael canvas
		this.canvas = Raphael(this.innerEl.dom, size, size);

		this.on('resize', this.handleResize, this);
		
		this.drawHands();

		this.timer = setInterval( Ext.Function.createDelayed( this.drawHands, 1000, this ) );
		this.superclass.afterRender.call(this, arguments);
	},

	// private
	drawHands : function() {
		var size = Math.min(this.getHeight(), this.getWidth()),
			center = size / 2,
			pathTpl = "M{0} {1}L{0} {2}",
			brushSize = Math.ceil(size / 200),
			date = this.getDate(),
			secs = date.getSeconds(),
			mins = date.getMinutes(),
			hrs = date.getHours();

		this.canvas.clear();

		// Second indicator
		this.canvas.path(Ext.String.format(pathTpl, center, 1.15*center, 0.25*center)).attr({ 
			stroke: this.secondColor, 
			rotation : [6 * secs, center, center],
			"stroke-width": brushSize
		});
			
		// Minute indicator
		this.canvas.path(Ext.String.format(pathTpl, center, center, 0.35*center)).attr({ 
			stroke: this.minuteColor, 
			rotation : [6 * mins, center, center],
			"stroke-width": brushSize * 2 
		});

		// Hour indicator
		this.canvas.path(Ext.String.format(pathTpl, center, center, 0.5*center)).attr({
			stroke: this.hourColor, 
			rotation : [(30 * hrs + (mins/3)), center, + center],
			"stroke-width": brushSize * 3 
		});
	},

	getDate : function() {
		var d = new Date()
		return d;
	},

	getSubmitData: function () {
        var me = this,
            data = null;
		data = {};
		data[me.getName()] = me.getDate();
        return data;
    },
	
    getValue: function () {
        var me = this;
        return me.getDate();
    },

    setValue: function (value) {
        var me = this;

        if (value == null) {
            return;
        } else {
			
        }
    },
	
	setHourOffset : function(offset) {
		this.hourOffset = offset;
		this.drawHands();
	},

	// private
	handleResize : function(me, newWidth, newHeight) {
		var size = Math.min(newWidth, newHeight);
		
		this.bgImg.setSize(size, size, true);
		this.canvas.setSize(size, size);
		this.drawHands();
	},

	// private, clean up 
	onDestroy : function() {
		clearInterval(this.timer);
		this.canvas.clear();

		Ext.destroy(this.bgImg, this.labelEl, this.innerEl);
		
		// Call superclass
		this.superclass.onDestroy.apply(this, arguments);
	}

});