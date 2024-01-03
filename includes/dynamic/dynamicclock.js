var NTP = {
	cookieShelfLife: 7, //7 days
	requiredResponses: 2,
	serverTimes: new Array,
	serverUrl: "/path/to/getTime",
	resyncTime: 10, // minutes
	sync: function () {
		// if the time was set within the last x minutes; ignore this set request; time was synce recently enough
		var offset = NTP.getCookie("NTPClockOffset");
		if (offset) {
			try {
				var t = offset.split("|")[1];
				var d = NTP.fixTime() - parseInt(t, 10);
				if (d < (1000 * 60 * NTP.resyncTime)) {
					return false;
				} // x minutes; return==skip
			} catch (e) {}
		}

		NTP.serverTimes = new Array;
		NTP.getServerTime();
	},
	getNow: function () {
		var date = new Date();
		return date.getTime();
		return (date.getTime() + (date.getTimezoneOffset() * 60000));
	},
	parseServerResponse: function (data) {
		var offset = parseInt(data.responseText.split(":")[0]);
		var origtime = parseInt(data.responseText.split(":")[1]);
		var delay = ((NTP.getNow() - origtime) / 2);
		offset = offset - delay;
		NTP.serverTimes.push(offset);

		// if we have enough responces set cookie
		if (NTP.serverTimes.length >= NTP.requiredResponses) {
			// build average
			var average = 0;
			var i = 0;
			for (i = 0; i < NTP.serverTimes.length; i++) {
				average += NTP.serverTimes[i];
			}
			average = Math.round(average / i);
			NTP.setCookie("NTPClockOffset", average); // set the new offset
			NTP.setCookie("NTPClockOffset", average + '|' + NTP.fixTime()); // save the timestamp that we are setting it
		} else {
			NTP.getServerTime();
		}

	},
	getServerTime: function () {
		try {
			var req = new Ajax.Request(NTP.serverUrl, {
					onSuccess: NTP.parseServerResponse,
					method: "get",
					parameters: "t=" + NTP.getNow()
				});
		} catch (e) {
			return false;
			//prototype.js not available
		}
	},
	setCookie: function (aCookieName, aCookieValue) {
		var date = new Date();
		date.setTime(date.getTime() + (NTP.cookieShelfLife * 24 * 60 * 60 * 1000));
		var expires = '; expires=' + date.toGMTString();
		document.cookie = aCookieName + '=' + aCookieValue + expires + '; path=/';
	},
	getCookie: function (aCookieName) {
		var crumbs = document.cookie.split('; ');
		for (var i = 0; i < crumbs.length; i++) {
			var crumb = crumbs[i].split('=');
			if (crumb[0] == aCookieName && crumb[1] != null) {
				return crumb[1];
			}
		}
		return false;
	},
	fixTime: function (timeStamp) {
		if (!timeStamp) {
			timeStamp = NTP.getNow();
		}
		var offset = NTP.getCookie("NTPClockOffset");
		try {
			if (!offset) {
				offset = 0;
			} else {
				offset = offset.split("|")[0];
			}
			if (isNaN(parseInt(offset, 10))) {
				return timeStamp;
			}
			return timeStamp + parseInt(offset, 10);
		} catch (e) {
			return timeStamp;
		}
	}
}

Ext.define('dynamicclock', {
	extend: 'Ext.form.field.Text',
    alias: 'widget.dynamicclock',
	formatLabel: "D d M Y",
	formatField: "H:i:s",
	submitFormat: "Y-m-d H:i:s",
	updateDelay: 1000,
	labelAlign: 'top',
	width: 200,
	internaltime: '',
	labelStyle: ' font-size: 180%; text-align:center;',
	fieldStyle: 'font-weight:bold; font-size: 200%; text-align:center;',
	initComponent: function () {
		Ext.apply(this, {
			listeners: {
				
				beforerender: function (field, eOpts) {
					setTimeout('NTP.sync()', 2500);
				},
				afterrender: function (field, eOpts) {
					field.runner = new Ext.util.DelayedTask(function () {
							NTP.sync();
							var time = new Date();
							time = Date(NTP.fixTime(time.getTime()));
							//this.setValue(Ext.Date.format(time , this.dateFormat || 'H:i:s'));
							this.setValue(Ext.Date.format(new Date(), this.dateFormat || this.formatField));
							this.setFieldLabel(Ext.Date.format(new Date(), this.dateFormat || this.formatLabel));
							this.internaltime = Ext.Date.format(new Date(), this.dateFormat || this.submitFormat);
							this.runner.delay(this.updateDelay);
						}, field);
					field.runner.delay(1);
				},
				beforedestroy: function (field) {
					if (field.runner) {
						field.runner.cancel();
						field.runner = null;
					}
				}
			}
		});
		return this.callParent(arguments);
	},
	getValue: function () {
		var me = this;
		var data = {};
		data[me.getName()] = '' + me.internaltime;
		//return data;
		return '' + me.internaltime;
	},
	getSubmitData: function () {
		var me = this;
		var data = {};
		data[me.getName()] = '' + me.internaltime;
		return data;
	}
});
