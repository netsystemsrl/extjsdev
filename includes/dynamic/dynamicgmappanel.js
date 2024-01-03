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
    mapType: 'ROADMAP',
    initComponent: function () {
        console.log('initComponent')
        var mapTypeId = google.maps.MapTypeId.HYBRID;
        if (this.mapType == 'HYBRID')   mapTypeId = google.maps.MapTypeId.HYBRID;
        if (this.mapType == 'ROADMAP')  mapTypeId = google.maps.MapTypeId.ROADMAP;
        Ext.applyIf(this, {
            plain: true,
            gmapType: 'map',
            border: false,
            mapOptions: {
            //    center: new google.maps.LatLng(44, 8),
                zoom: this.zoom,
                mapTypeId: mapTypeId
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

    createMap: function (CoorCenter, CoorMarker) {
        var mapTypeId = google.maps.MapTypeId.HYBRID;
        if (this.mapType == 'HYBRID')   mapTypeId = google.maps.MapTypeId.HYBRID;
        if (this.mapType == 'ROADMAP')  mapTypeId = google.maps.MapTypeId.ROADMAP;
        var mapOptions = {
            center: CoorCenter,
            zoom: this.zoom,
            mapTypeId: mapTypeId
        };
        this.gmap = new google.maps.Map(this.body.dom, mapOptions);

        if (CoorMarker) this.addMarker(CoorMarker);

        //Ext.each(this.markers, this.addMarker, this);
        //this.fireEvent('mapready', this, this.gmap);
    },

    addMarker: function (myLatLng, title = 'posizione') {
        var result = new google.maps.Marker({
            position: myLatLng,
            map: this.gmap,
            title: title
        });

        return result;
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
        if (this.texttype == 'address') {
            console.log('address');
            center = {	geoCodeAddr: new_value,
                        marker: {
                                title: 'Mark 1'
                            }
                        };
            this.lookupCode(this.center.geoCodeAddr, this.center.marker);
        } 
        else if (this.texttype == 'coordinate') {
            console.log('coordinate');
            var coord = new_value.split(',')
            var lat = parseFloat(coord[0]);
            var lng = parseFloat(coord[1]);

            var myLatLng = { lat: lat, lng: lng };
            this.createMap(myLatLng, myLatLng);
        } 
        else {
          //  Ext.raise('center is required');
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
