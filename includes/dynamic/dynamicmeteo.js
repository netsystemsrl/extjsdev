

//*************************************************************************************************************//
//			DYNAMIC METEO
//https://jsfiddle.net/sceendy/nea4z7ff/

Ext.define('dynamicmeteo', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.dynamicmeteo',
    mixins: {
        field: 'Ext.form.field.Base'
    },
    submitFormat: 't',
    submitValue: true,
    buttonOnly: true,
    text: null,
    zoomration: 1,
    allowadd: false,
    allowedit: false,
    allowdelete: false,
    allowexport: false,
    procremoteonselect: false,

    autoScroll: true,

    text: '',
    apikey: 'e43f64ee98be9268f7a7f49e34aecfdf',
    html: '',
    layout: {
        type: 'fit',
        align: 'stretch'
    },

    initComponent: function () {
        var me = this;

        me.callParent();
    },

    initValue: function () {
        this.setValue(this.value);
    },
    setValue: function (new_value) {
        var me = this;
        var myImage = me.down('image');
        me.text = new_value;
        if (new_value == undefined || new_value == null) {
            //myImage.setSrc('');
        } else {

            Ext.Ajax.request({
                useDefaultXhrHeader: false,
                cors: true,
                //url: 'https://api.openweathermap.org/data/2.5/weather',
                url: 'https://api.openweathermap.org/data/2.5/forecast/daily',
                method: 'GET',
                params: {
                    cnt: 7,
                    units: 'metric',
                    zip: new_value + ',it', //'42027,it', // new_value,
                    //APPID: '528059a33dd4308555f16fe6118e3940'
                    APPID: 'e43f64ee98be9268f7a7f49e34aecfdf'
                },
                reader: {
                    type: 'json'
                },
                callback: function (options, success, response) {
                    var weatherData = Ext.util.JSON.decode(response.responseText);
                    const city = weatherData.city;

                    innerHTML = "<div class='component__weather-box'>";
                    
					innerHTML = innerHTML + '<div class="component__forecast-box">';
					weatherData.list.forEach(CurDay => {
						const currentWeather = CurDay.weather[0];
						let date = new Date(CurDay.dt * 1000);
						let days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
						//let days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
						let name = days[date.getDay()];
						let day = date.getDate();

						innerHTML = innerHTML + "<div class = class='forecast__item'>";
							innerHTML = innerHTML + "<div class='forecast-item__heading'>" +
														name +"<br>" + day  +
													"</div>";
													
					innerHTML = innerHTML + "<div class='forecast-item__info'><i class='wi " + me.applyIcon(currentWeather.icon)+"'></i>" +
														"<span class='degrees'>" + Math.round(CurDay.temp.day)+"<i class='wi wi-degrees'></i></span>" +
													"</div>";
						innerHTML = innerHTML + "</div>";
					});
					innerHTML = innerHTML + "</div>"; 
				
                    
                    innerHTML = innerHTML + "</div>";
                    me.update(innerHTML);
                }
            });
        }
    },
    applyIcon: function (icon) {
        let selectedIcon;
        switch (icon) {
        case '01d':
            selectedIcon = "wi-day-sunny"
            break;
        case '01n':
            selectedIcon = "wi-night-clear"
            break;
        case '02d':
        case '02n':
            selectedIcon = "wi-cloudy"
            break;
        case '03d':
        case '03n':
        case '04d':
        case '04n':
            selectedIcon = "wi-night-cloudy"
            break;
        case '09d':
        case '09n':
            selectedIcon = "wi-showers"
            break;
        case '10d':
        case '10n':
            selectedIcon = "wi-rain"
            break;
        case '11d':
        case '11n':
            selectedIcon = "wi-thunderstorm"
            break;
        case '13d':
        case '13n':
            selectedIcon = "wi-snow"
            break;
        case '50d':
        case '50n':
            selectedIcon = "wi-fog"
            break;
        default:
            selectedIcon = "wi-meteor"
        }
        return selectedIcon;
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
        dynamicmeteo.superclass.onRender.call(this, ct, position);

        var me = this;
        me.maxHeight = Ext.getBody().getViewSize().height - (me.y + 100);
        if (me.hasOwnProperty('height') == false) me.height = Ext.getBody().getViewSize().height - (me.y + 100);
    }

});
