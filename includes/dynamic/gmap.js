Ext.define('dynamicgmappanel', {
    alias: 'widget.dynamicgmappanel',
    mixins: {
        field: 'Ext.form.field.Base'
    },
    extend: 'Ext.panel.Panel',
    requires: ['Ext.window.MessageBox'],

    /* DATA */
    valueFieldIcon: "",
    valueFieldColor: "",
    valueFieldTooltip: "",
    valueFieldLayout: "",
    valueField: "",
    iconField: '',
    datasourcefield: "",
    defaultValue: '',
    /* EVENT ON CHANGE*/
    autopostback: false,
    /* INTERNAL */
    texttype: 'address',
    gmapType: 'map',
    text: '',
	zoom:15,
    mapTypeControl: true,
    mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU},
    navigationControl: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    initComponent: function () {
        console.log('initComponent')
        Ext.applyIf(this, {
            plain: true,
            gmapType: 'map',
            border: false,
            mapOptions: {
            //    center: new google.maps.LatLng(44, 8),
                mapTypeId: google.maps.MapTypeId.ROADMAP
            }
        });
        this.callParent();
    },

    onBoxReady: function () {
        console.log('onBoxReady')
        var center = this.center;
        this.callParent(arguments);
        if (center) {
            if (center.geoCodeAddr) {
                this.lookupCode(center.geoCodeAddr, center.marker);
            } else {
                this.createMap(center);
            }
        } else {
            Ext.raise('center is required');
        }

    },

    createMap: function (center, marker) {
        var options = Ext.apply({}, this.mapOptions);

        /* global google */
        options = Ext.applyIf(options, {
            zoom: 14,
            center: center,
            mapTypeId: google.maps.MapTypeId.HYBRID
        });
        this.gmap = new google.maps.Map(this.body.dom, options);

        if (marker) {
            this.addMarker(Ext.applyIf(marker, {
                position: center
            }));
        }

        Ext.each(this.markers, this.addMarker, this);
        this.fireEvent('mapready', this, this.gmap);
    },

    addMarker: function (marker) {
        var o;

        marker = Ext.apply({
            map: this.gmap
        }, marker);

        if (!marker.position) {
            marker.position = new google.maps.LatLng(marker.lat, marker.lng);
        }

        o = new google.maps.Marker(marker);

        Ext.Object.each(marker.listeners, function (name, fn) {
            google.maps.event.addListener(o, name, fn);
        });

        return o;
    },

    lookupCode: function (addr, marker) {
        this.geocoder = new google.maps.Geocoder();
        this.geocoder.geocode({
            'address': addr
        }, Ext.Function.bind(this.onLookupComplete, this, [marker], true));
    },

    onLookupComplete: function (data, response, marker) {
        if (response !== 'OK') {
            Ext.MessageBox.alert('Error', 'An error occured: "' + response + '"');

            return;
        }

        this.createMap(data[0].geometry.location, marker);
    },

    afterComponentLayout: function (w, h) {
        this.callParent(arguments);
        this.redraw();
    },

    redraw: function () {
        var map = this.gmap;

        if (map) {
            google.maps.event.trigger(map, 'resize');
        }
    },

    /* add property to manage as field in form*/
    initValue: function () {
        console.log('setValue')
        this.setValue(this.value);
    },
    setValue: function (new_value) {
        console.log('setValue')
        this.text = new_value;
        var center = this.center;
        if (this.texttype == 'address') {
            console.log('address')
            center = {	geoCodeAddr: new_value,
							marker: {
									title: 'Mark 1'
								}
							};
        } 
        else if (this.texttype == 'coordinate') {
            console.log('coordinate')
            center = {
                geoCodeCoord: new_value,
                marker: {
                    title: 'Mark 1'
                }
            };
        } 
        else {
            console.log('else')
            center = {
                geoCodeAddr: new_value,
                marker: {
                    title: 'Mark 1'
                }
            };
        }
		this.center = center;
		
        if (center) {
            if (center.geoCodeAddr) {
                this.lookupCode(center.geoCodeAddr, center.marker);
            } else {
                this.createMap(center);
            }
        } else {
            Ext.raise('center is required');
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
        var me = this,
            data = null;
        data = {};
        data[me.getName()] = '' + me.text;
        return data;
    },

});
