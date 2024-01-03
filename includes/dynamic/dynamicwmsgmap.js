//*************************************************************************************************************//
//			DYNAMIC MAP
Ext.define('dynamicwmsgmap', {
    extend: 'Ext.panel.Panel',
    suspendLayout: true,
    alias: 'widget.dynamicwmsgmap',
    mixins: {
        field: 'Ext.form.field.Base'
    },

    submitValue: true,
    text: null,
    allowadd: false,
    allowedit: false,
    allowdelete: false,
    allowexport: false,

	layout: 'fit',
	
    MaxMachine: 255,
    MachineColorMatrix: {
        1: "red",
        2: "green",
        3: "yellow",
        4: "blue",
        5: "red",
        6: "green",
        7: "yellow",
        8: "blue",
        9: "red",
        10: "green",
        241: "yellow",
        242: "blue",
        243: "green",
        244: "yellow",
        245: "blue",
        246: "red",
        254: "green",
        253: "yellow",
        252: "blue",
        251: "red"
    },

    /* DATA */
    datasource: 'ESEMPIO',
    datasourcetype: 'TABLE',
    valueFieldLat: "LAT",
    valueFieldLon: "LON",
    valueFieldAlt: "ALT",
    valueFieldTimer: "TIMER",
    valueFieldObject: "IDOBJ",
    valueFieldIcon: "",
    valueFieldColor: "",
    valueFieldTooltip: "",
	valueFieldLayout: "",
	keyField : "ID",
	
	valueFieldEvent: "",
	valueFieldEventIcon: "",
	
    refreshPosition: 0,
    flightPath: false,
    flightPathSimulate: false,
    loadedStore: false,

    displayField: 'CODICE',
    iconField: '',
    imageField: '',
    datasourcefield: 'dynamicwmsgmap1',
    defaultValue: '',
	mapType: google.maps.MapTypeId.ROADMAP, //google.maps.MapTypeId.HYBRID  google.maps.MapTypeId.TERRAIN

    /*RECORD EDITING DEFINITION*/
    layouteditorid: '',
    layouteditorWindowMode: 'acDialog',
	/* EVENT ON CHANGE*/
	autopostback: false,
	
    markers: [],
    flightPaths: [],
    DrawingManager: [],
    routesHandle: [],
	currentPolygon : null,
	
	/* add store to obj */
    config: {
        store: 'ext-empty-store'
    },
	store: [],
    publishes: 'store',
    applyStore: function (store) {
        return Ext.getStore(store);
    },

    initComponent: function () {
        var me = this;
		
        Ext.applyIf(this, {
            plain: true,
            gmapType: 'map',
            border: false
        });
		
        //me.on('afterrender', this.onImagePanelRendered, this);
        //me.on('resize', this.onPanelResized, this);
        //me.on('firstimage', this.onFirstImage, this);
        //me.on('lastimage', this.onLastImage, this);
        //me.on('imagechange', this.onImageChange, this);
        //me.child('image').on('afterrender', this.onImageRendered, this);
        this.callParent(arguments);
    },
	onRender: function (ct, position) {
        dynamicwmsgmap.superclass.onRender.call(this, ct, position);
        var me = this;
        if ((me.hasOwnProperty('height') == false) && (me.hasOwnProperty('anchor')) == false) {
			me.anchor = 'none 100%';
		}
		this.store.on('load', this.storeLoad, this);
    },
	storeLoad: function () {
        var me = this;
        var allRecords = me.store.snapshot || me.store.data;
        var items = allRecords.items;

        var DS_Form00 = Ext.data.StoreManager.lookup("DS_" + CurrentPanelRaw.name + "_" + "Form00");
        var valueFieldMAPLAT = DS_Form00.data.items[0].data[me.valueFieldMAPLAT];
        var valueFieldMAPLON = DS_Form00.data.items[0].data[me.valueFieldMAPLON];
		me.center = new google.maps.LatLng(valueFieldMAPLAT, valueFieldMAPLON);
		me.createMap(me.center);
		
		var renderArray = me.valueFieldEventIcon.split(',');
		
		var SymbolOne = {
			path: 'M -2,0 0,-2 2,0 0,2 z',
			strokeColor: '#F00',
			fillColor: '#F00',
			fillOpacity: 1
		};

		var SymbolTwo = {
			path: 'M -1,0 A 1,1 0 0 0 -3,0 1,1 0 0 0 -1,0M 1,0 A 1,1 0 0 0 3,0 1,1 0 0 0 1,0M -3,3 Q 0,5 3,3',
			strokeColor: '#00F',
			rotation: 45
		};

		var SymbolThree = {
			path: 'M -2,-2 2,2 M 2,-2 -2,2',
			strokeColor: '#292',
			strokeWeight: 4
		};

        var SymbolPlane = {
            path: 'M 8.1326447,0.80527736 C 8.5471666,0.063577346 9.742752,0.030177346 10.052431,0.82497736 C 10.093464,3.0114774 10.134497,5.1980774 10.17553,7.3845774 C 12.760407,8.9653774 15.345284,10.546179 17.930161,12.127079 C 17.930161,12.881779 17.930161,13.636479 17.930161,14.391179 C 15.373077,13.579479 12.815993,12.767779 10.258908,11.956179 C 10.27281,13.280479 10.286713,14.604879 10.300615,15.929279 C 10.8565,16.555879 11.412385,17.182479 11.96827,17.809079 C 12.25527,18.269479 12.437605,19.641079 11.59784,19.085079 C 10.804104,18.802179 10.010367,18.519179 9.21663,18.236279 C 8.3133108,18.620779 7.4099916,19.005279 6.5066724,19.389779 C 6.3952441,18.705879 6.2272708,17.857479 6.8519879,17.359679 C 7.2927717,16.882879 7.7335555,16.406079 8.1743393,15.929279 C 8.1465467,14.604879 8.1187541,13.280479 8.0909615,11.956179 C 5.5894706,12.824879 3.0879797,13.693479 0.58648883,14.562179 C 0.54479393,13.821679 0.50309893,13.081079 0.46140403,12.340579 C 3.0184842,10.717079 5.5755645,9.0935778 8.1326447,7.4700774 C 8.1326447,5.2484774 8.1326447,3.0268774 8.1326447,0.80527736 z',
            scale: 1,
            strokeOpacity: 1,
            //strokeColor: 'grey',
            strokeWeight: 1,
            rotation: 0,
            anchor: new google.maps.Point(9, 9)
        };
		
        var SymbolLifterLoad = {
            path: 'M101 383H351V115H101ZM429.91 142.96H480V152.35H429.91ZM429.91 142.96H480V152.35H429.91ZM423.13 334.43H473.22V343.83H423.13ZM423.13 334.43H473.22V343.83H423.13ZM849.497 73.902C878.637 70.472 903.117 143.552 904.177 237.122 905.227 328.912 883.327 406.692 854.787 412.522L854.117 379.002C865.147 368.922 872.887 300.002 871.397 225.062 869.977 153.102 860.527 101.222 849.877 106.832ZM849.497 73.902C878.637 70.472 903.117 143.552 904.177 237.122 905.227 328.912 883.327 406.692 854.787 412.522L854.117 379.002C865.147 368.922 872.887 300.002 871.397 225.062 869.977 153.102 860.527 101.222 849.877 106.832ZM847.232 73.578C876.362 70.148 900.842 143.228 901.912 236.798 902.972 330.368 880.222 408.998 851.092 412.428 851.062 412.428 851.022 412.438 850.982 412.438L850.892 403.838C875.292 400.358 894.292 325.528 893.342 236.698 892.382 147.868 871.832 78.678 847.432 82.158 847.402 82.158 847.362 82.168 847.332 82.168ZM847.232 73.578C876.362 70.148 900.842 143.228 901.912 236.798 902.972 330.368 880.222 408.998 851.092 412.428 851.062 412.428 851.022 412.438 850.982 412.438L850.892 403.838C875.292 400.358 894.292 325.528 893.342 236.698 892.382 147.868 871.832 78.678 847.432 82.158 847.402 82.158 847.362 82.168 847.332 82.168ZM374.167 367.663V119.103H397.147V367.663ZM374.167 367.663V119.103H397.147V367.663ZM96.83 333.45C96.83 328.65 100.71 324.77 105.51 324.77H377.36C382.16 324.77 386.04 328.65 386.04 333.45V340.6C386.04 345.39 382.16 349.28 377.36 349.28H105.51C100.71 349.28 96.83 345.39 96.83 340.6ZM96.83 333.45C96.83 328.65 100.71 324.77 105.51 324.77H377.36C382.16 324.77 386.04 328.65 386.04 333.45V340.6C386.04 345.39 382.16 349.28 377.36 349.28H105.51C100.71 349.28 96.83 345.39 96.83 340.6ZM98.87 146.3C98.87 141.5 102.76 137.62 107.55 137.62H379.4C384.2 137.62 388.08 141.5 388.08 146.3L388.09 153.45H388.08C388.08 158.24 384.2 162.13 379.4 162.13H107.55C102.76 162.13 98.87 158.24 98.87 153.45ZM98.87 146.3C98.87 141.5 102.76 137.62 107.55 137.62H379.4C384.2 137.62 388.08 141.5 388.08 146.3L388.09 153.45H388.08C388.08 158.24 384.2 162.13 379.4 162.13H107.55C102.76 162.13 98.87 158.24 98.87 153.45ZM398.43 360.765V117.315H439.66V360.765ZM398.43 360.765V117.315H439.66V360.765ZM426.06 373.02H572.94V427.4H426.06ZM426.06 373.02H572.94V427.4H426.06ZM425.94 60.19H572.81V114.57H425.94ZM425.94 60.19H572.81V114.57H425.94ZM464.94 122.49C464.94 89.23 491.9 62.27 525.15 62.27H820.63C853.89 62.27 880.85 89.23 880.85 122.49V363.36C880.85 396.61 853.89 423.57 820.63 423.57H525.15C491.9 423.57 464.94 396.61 464.94 363.36ZM464.94 122.49C464.94 89.23 491.9 62.27 525.15 62.27H820.63C853.89 62.27 880.85 89.23 880.85 122.49V363.36C880.85 396.61 853.89 423.57 820.63 423.57H525.15C491.9 423.57 464.94 396.61 464.94 363.36ZM518.55 117.19 521.62 369.19 579.83 369.96 578.3 404.43 652.6 405.19 648.77 81.96 579.06 80.43 576 115.66 518.55 117.19ZM518.55 117.19 521.62 369.19 579.83 369.96 578.3 404.43 652.6 405.19 648.77 81.96 579.06 80.43 576 115.66 518.55 117.19ZM648.487 113.353 827.027 136.583V349.423L648.487 372.653ZM648.487 113.353 827.027 136.583V349.423L648.487 372.653ZM650.92 200.27C650.92 188 660.87 178.05 673.14 178.05H764.92C777.19 178.05 787.14 188 787.14 200.27V289.13C787.14 301.4 777.19 311.35 764.92 311.35H673.14C660.87 311.35 650.92 301.4 650.92 289.13ZM650.92 200.27C650.92 188 660.87 178.05 673.14 178.05H764.92C777.19 178.05 787.14 188 787.14 200.27V289.13C787.14 301.4 777.19 311.35 764.92 311.35H673.14C660.87 311.35 650.92 301.4 650.92 289.13ZM789.08 184.59C789.08 181.7 791.43 179.35 794.32 179.35H815.3C818.19 179.35 820.54 181.7 820.54 184.59V307.41C820.54 310.3 818.19 312.65 815.3 312.65H794.32C791.43 312.65 789.08 310.3 789.08 307.41ZM789.08 184.59C789.08 181.7 791.43 179.35 794.32 179.35H815.3C818.19 179.35 820.54 181.7 820.54 184.59V307.41C820.54 310.3 818.19 312.65 815.3 312.65H794.32C791.43 312.65 789.08 310.3 789.08 307.41ZM654.867 176.433C651.967 176.433 649.617 174.083 649.617 171.193V150.213C649.617 147.323 651.967 144.973 654.867 144.973H777.677C780.567 144.973 782.917 147.323 782.917 150.213V171.193C782.917 174.083 780.567 176.433 777.677 176.433ZM654.867 176.433C651.967 176.433 649.617 174.083 649.617 171.193V150.213C649.617 147.323 651.967 144.973 654.867 144.973H777.677C780.567 144.973 782.917 147.323 782.917 150.213V171.193C782.917 174.083 780.567 176.433 777.677 176.433ZM653.889 344.105C650.999 344.105 648.649 341.765 648.649 338.865V317.895C648.649 314.995 650.999 312.645 653.889 312.645H776.699C779.599 312.645 781.949 314.995 781.949 317.895V338.865C781.949 341.765 779.599 344.105 776.699 344.105ZM653.889 344.105C650.999 344.105 648.649 341.765 648.649 338.865V317.895C648.649 314.995 650.999 312.645 653.889 312.645H776.699C779.599 312.645 781.949 314.995 781.949 317.895V338.865C781.949 341.765 779.599 344.105 776.699 344.105ZM524.43 241.3C524.43 207.98 532.93 180.97 543.41 180.97 553.88 180.97 562.38 207.98 562.38 241.3 562.38 274.61 553.88 301.62 543.41 301.62 532.93 301.62 524.43 274.61 524.43 241.3ZM533.92 241.3C533.92 269.37 538.17 292.14 543.41 292.14 548.64 292.14 552.89 269.37 552.89 241.3 552.89 213.22 548.64 190.46 543.41 190.46 538.17 190.46 533.92 213.22 533.92 241.3ZM524.43 241.3C524.43 207.98 532.93 180.97 543.41 180.97 553.88 180.97 562.38 207.98 562.38 241.3 562.38 274.61 553.88 301.62 543.41 301.62 532.93 301.62 524.43 274.61 524.43 241.3ZM533.92 241.3C533.92 269.37 538.17 292.14 543.41 292.14 548.64 292.14 552.89 269.37 552.89 241.3 552.89 213.22 548.64 190.46 543.41 190.46 538.17 190.46 533.92 213.22 533.92 241.3ZM458.042 344.683V142.343H494.042V344.683ZM458.042 344.683V142.343H494.042V344.683ZM491.98 335.17H841.66V345.1H491.98ZM491.98 335.17H841.66V345.1H491.98ZM494.04 142.76H843.72V152.69H494.04ZM494.04 142.76H843.72V152.69H494.04ZM528.826 143.996V335.396H520.336V143.996ZM528.826 143.996V335.396H520.336V143.996ZM598.563 147.31V338.7H590.073V147.31ZM598.563 147.31V338.7H590.073V147.31ZM668.305 145.659V337.049H659.805V145.659ZM668.305 145.659V337.049H659.805V145.659Z',
			scale: 0.05,
            strokeOpacity: 1,
            //strokeColor: 'grey',
            strokeWeight: 1,
            rotation: 90,
			anchor: new google.maps.Point(400, 400),
        };
		
        var SymbolLifter = {
            path: 'M101 383ZM429.91 142.96H480V152.35H429.91ZM429.91 142.96H480V152.35H429.91ZM423.13 334.43H473.22V343.83H423.13ZM423.13 334.43H473.22V343.83H423.13ZM849.497 73.902C878.637 70.472 903.117 143.552 904.177 237.122 905.227 328.912 883.327 406.692 854.787 412.522L854.117 379.002C865.147 368.922 872.887 300.002 871.397 225.062 869.977 153.102 860.527 101.222 849.877 106.832ZM849.497 73.902C878.637 70.472 903.117 143.552 904.177 237.122 905.227 328.912 883.327 406.692 854.787 412.522L854.117 379.002C865.147 368.922 872.887 300.002 871.397 225.062 869.977 153.102 860.527 101.222 849.877 106.832ZM847.232 73.578C876.362 70.148 900.842 143.228 901.912 236.798 902.972 330.368 880.222 408.998 851.092 412.428 851.062 412.428 851.022 412.438 850.982 412.438L850.892 403.838C875.292 400.358 894.292 325.528 893.342 236.698 892.382 147.868 871.832 78.678 847.432 82.158 847.402 82.158 847.362 82.168 847.332 82.168ZM847.232 73.578C876.362 70.148 900.842 143.228 901.912 236.798 902.972 330.368 880.222 408.998 851.092 412.428 851.062 412.428 851.022 412.438 850.982 412.438L850.892 403.838C875.292 400.358 894.292 325.528 893.342 236.698 892.382 147.868 871.832 78.678 847.432 82.158 847.402 82.158 847.362 82.168 847.332 82.168ZM374.167 367.663V119.103H397.147V367.663ZM374.167 367.663V119.103H397.147V367.663ZM96.83 333.45C96.83 328.65 100.71 324.77 105.51 324.77H377.36C382.16 324.77 386.04 328.65 386.04 333.45V340.6C386.04 345.39 382.16 349.28 377.36 349.28H105.51C100.71 349.28 96.83 345.39 96.83 340.6ZM96.83 333.45C96.83 328.65 100.71 324.77 105.51 324.77H377.36C382.16 324.77 386.04 328.65 386.04 333.45V340.6C386.04 345.39 382.16 349.28 377.36 349.28H105.51C100.71 349.28 96.83 345.39 96.83 340.6ZM98.87 146.3C98.87 141.5 102.76 137.62 107.55 137.62H379.4C384.2 137.62 388.08 141.5 388.08 146.3L388.09 153.45H388.08C388.08 158.24 384.2 162.13 379.4 162.13H107.55C102.76 162.13 98.87 158.24 98.87 153.45ZM98.87 146.3C98.87 141.5 102.76 137.62 107.55 137.62H379.4C384.2 137.62 388.08 141.5 388.08 146.3L388.09 153.45H388.08C388.08 158.24 384.2 162.13 379.4 162.13H107.55C102.76 162.13 98.87 158.24 98.87 153.45ZM398.43 360.765V117.315H439.66V360.765ZM398.43 360.765V117.315H439.66V360.765ZM426.06 373.02H572.94V427.4H426.06ZM426.06 373.02H572.94V427.4H426.06ZM425.94 60.19H572.81V114.57H425.94ZM425.94 60.19H572.81V114.57H425.94ZM464.94 122.49C464.94 89.23 491.9 62.27 525.15 62.27H820.63C853.89 62.27 880.85 89.23 880.85 122.49V363.36C880.85 396.61 853.89 423.57 820.63 423.57H525.15C491.9 423.57 464.94 396.61 464.94 363.36ZM464.94 122.49C464.94 89.23 491.9 62.27 525.15 62.27H820.63C853.89 62.27 880.85 89.23 880.85 122.49V363.36C880.85 396.61 853.89 423.57 820.63 423.57H525.15C491.9 423.57 464.94 396.61 464.94 363.36ZM518.55 117.19 521.62 369.19 579.83 369.96 578.3 404.43 652.6 405.19 648.77 81.96 579.06 80.43 576 115.66 518.55 117.19ZM518.55 117.19 521.62 369.19 579.83 369.96 578.3 404.43 652.6 405.19 648.77 81.96 579.06 80.43 576 115.66 518.55 117.19ZM648.487 113.353 827.027 136.583V349.423L648.487 372.653ZM648.487 113.353 827.027 136.583V349.423L648.487 372.653ZM650.92 200.27C650.92 188 660.87 178.05 673.14 178.05H764.92C777.19 178.05 787.14 188 787.14 200.27V289.13C787.14 301.4 777.19 311.35 764.92 311.35H673.14C660.87 311.35 650.92 301.4 650.92 289.13ZM650.92 200.27C650.92 188 660.87 178.05 673.14 178.05H764.92C777.19 178.05 787.14 188 787.14 200.27V289.13C787.14 301.4 777.19 311.35 764.92 311.35H673.14C660.87 311.35 650.92 301.4 650.92 289.13ZM789.08 184.59C789.08 181.7 791.43 179.35 794.32 179.35H815.3C818.19 179.35 820.54 181.7 820.54 184.59V307.41C820.54 310.3 818.19 312.65 815.3 312.65H794.32C791.43 312.65 789.08 310.3 789.08 307.41ZM789.08 184.59C789.08 181.7 791.43 179.35 794.32 179.35H815.3C818.19 179.35 820.54 181.7 820.54 184.59V307.41C820.54 310.3 818.19 312.65 815.3 312.65H794.32C791.43 312.65 789.08 310.3 789.08 307.41ZM654.867 176.433C651.967 176.433 649.617 174.083 649.617 171.193V150.213C649.617 147.323 651.967 144.973 654.867 144.973H777.677C780.567 144.973 782.917 147.323 782.917 150.213V171.193C782.917 174.083 780.567 176.433 777.677 176.433ZM654.867 176.433C651.967 176.433 649.617 174.083 649.617 171.193V150.213C649.617 147.323 651.967 144.973 654.867 144.973H777.677C780.567 144.973 782.917 147.323 782.917 150.213V171.193C782.917 174.083 780.567 176.433 777.677 176.433ZM653.889 344.105C650.999 344.105 648.649 341.765 648.649 338.865V317.895C648.649 314.995 650.999 312.645 653.889 312.645H776.699C779.599 312.645 781.949 314.995 781.949 317.895V338.865C781.949 341.765 779.599 344.105 776.699 344.105ZM653.889 344.105C650.999 344.105 648.649 341.765 648.649 338.865V317.895C648.649 314.995 650.999 312.645 653.889 312.645H776.699C779.599 312.645 781.949 314.995 781.949 317.895V338.865C781.949 341.765 779.599 344.105 776.699 344.105ZM524.43 241.3C524.43 207.98 532.93 180.97 543.41 180.97 553.88 180.97 562.38 207.98 562.38 241.3 562.38 274.61 553.88 301.62 543.41 301.62 532.93 301.62 524.43 274.61 524.43 241.3ZM533.92 241.3C533.92 269.37 538.17 292.14 543.41 292.14 548.64 292.14 552.89 269.37 552.89 241.3 552.89 213.22 548.64 190.46 543.41 190.46 538.17 190.46 533.92 213.22 533.92 241.3ZM524.43 241.3C524.43 207.98 532.93 180.97 543.41 180.97 553.88 180.97 562.38 207.98 562.38 241.3 562.38 274.61 553.88 301.62 543.41 301.62 532.93 301.62 524.43 274.61 524.43 241.3ZM533.92 241.3C533.92 269.37 538.17 292.14 543.41 292.14 548.64 292.14 552.89 269.37 552.89 241.3 552.89 213.22 548.64 190.46 543.41 190.46 538.17 190.46 533.92 213.22 533.92 241.3ZM458.042 344.683V142.343H494.042V344.683ZM458.042 344.683V142.343H494.042V344.683ZM491.98 335.17H841.66V345.1H491.98ZM491.98 335.17H841.66V345.1H491.98ZM494.04 142.76H843.72V152.69H494.04ZM494.04 142.76H843.72V152.69H494.04ZM528.826 143.996V335.396H520.336V143.996ZM528.826 143.996V335.396H520.336V143.996ZM598.563 147.31V338.7H590.073V147.31ZM598.563 147.31V338.7H590.073V147.31ZM668.305 145.659V337.049H659.805V145.659ZM668.305 145.659V337.049H659.805V145.659Z',
			scale: 0.05,
            strokeOpacity: 1,
            //strokeColor: 'grey',
            strokeWeight: 1,
            rotation: 90,
			anchor: new google.maps.Point(400, 400),
        };
		
        var SymbolLifterOld = {
            path: 'M469.609,417.354H355.298c-0.696-5.543-1.894-10.923-4.014-15.883V119.082c0-9.15-7.412-16.571-16.57-16.571	c-9.161,0-16.571,7.42-16.571,16.571V369.39c-2.995-1.181-6.085-2.2-9.289-2.888V189.345c0-103.478-84.179-187.667-187.667-187.667 c-27.283,0-49.485,22.203-49.485,49.487v236.593h-7.443c-16.798,0-30.472,13.674-30.472,30.48v68.588 C14.174,393.711,0,412.216,0,434.152c0,27.761,22.574,50.35,50.327,50.35c22.024,0,40.585-14.289,47.414-34.006h144.977 c9.629,20.034,29.954,34.006,53.628,34.006c23.691,0,44.033-13.973,53.677-34.006h119.587c9.159,0,16.571-7.42,16.571-16.571 C486.18,424.774,478.768,417.354,469.609,417.354z M121.188,34.82c85.2,0,154.525,69.316,154.525,154.525v98.413h-66.898 c2.784-2.962,4.547-6.877,4.547-11.255c0-9.15-7.411-16.571-16.571-16.571h-62.14v-80.094c0-9.15-7.41-16.571-16.571-16.571 c-5.549,0-10.227,2.913-13.236,7.104V51.165C104.844,42.151,112.175,34.82,121.188,34.82z M71.703,320.899h204.01v48.135 c-20.453,7.598-35.455,26.004-38.27,48.32H97.611c-5.097-14.272-16.377-25.479-30.682-30.512v-65.943H71.703z M50.327,459.646 	c-14.047,0-25.471-11.441-25.471-25.494c0-14.055,11.424-25.487,25.471-25.487c14.079,0,25.519,11.432,25.519,25.487 C75.845,448.205,64.405,459.646,50.327,459.646z M296.345,459.646c-19.192,0-34.807-15.623-34.807-34.832 c0-19.2,15.615-34.825,34.807-34.825c19.225,0,34.858,15.624,34.858,34.825C331.203,444.023,315.57,459.646,296.345,459.646z',
            scale: 0.05,
            strokeOpacity: 1,
            //strokeColor: 'grey',
            strokeWeight: 1,
            rotation: 270,
			anchor: new google.maps.Point(400, 400),
        };

        //      me.map.clear();
        //for (let i = 0; i < me.markers.length; i++) {
        //    me.markers[i].setMap(null);
        //}
        me.markers = [];
        me.flightPaths = [];
        MachineIdOld = 0;
		OldEvent = '';
		
        var FlightPlanCoordinates = [];
        var EventCoordinates = [];
        var Machines = [];
        var iconBase = '/archive/netsystem/repositorycom/';
        for (index = 0; index < items.length; ++index) {
            record = items[index];
            recordup = items[index + 1];
            MachineId = record.data[me.valueFieldObject];

			//Machine
			if (Machines[MachineId] == undefined) {
				MachineLabel = record.data[me.displayField];
				
				if (me.valueFieldColor != '') {
					MachineColor = record.data[me.valueFieldColor];
				} else {
					MachineColor = me.MachineColorMatrix[MachineId];
				}
				
				MachineSymbol = SymbolLifter
				if (record.data[me.valueFieldIcon]  == 'SymbolThree') MachineSymbol = SymbolThree;
				else if (record.data[me.valueFieldIcon]  == 'SymbolTwo') MachineSymbol = SymbolTwo;
				else if (record.data[me.valueFieldIcon]  == 'SymbolOne') MachineSymbol = SymbolOne;
				else if (record.data[me.valueFieldIcon]  == 'SymbolPlane') MachineSymbol = SymbolPlane;
				else if (record.data[me.valueFieldIcon]  == 'SymbolLifter') MachineSymbol = SymbolLifter;
				
				Machines[MachineId] = Array();
				Machines[MachineId].push({
											Color: MachineColor,
											Icon: MachineSymbol,
											Label: MachineLabel
										});
				FlightPlanCoordinates[MachineId] = Array();
				EventCoordinates[MachineId] = Array();
			}
			
			//event
			EventSymbol = SymbolOne;
			if (record.data[me.valueFieldEvent] != OldEvent){
				for (var i = 0; i < renderArray.length; i = i + 2) {
					//valore = colore
					if (Custom.isNumber(renderArray[i])) {
						if (record.data[me.valueFieldEvent] == renderArray[i]) {
							if (renderArray[i + 1] == 'SymbolThree') EventSymbol = SymbolThree;
							else if (renderArray[i + 1] == 'SymbolTwo') EventSymbol = SymbolTwo;
							else if (renderArray[i + 1] == 'SymbolOne') EventSymbol = SymbolOne;
							else if (renderArray[i + 1] == 'SymbolPlane') EventSymbol = SymbolPlane;
							else if (renderArray[i + 1] == 'SymbolLifter') EventSymbol = SymbolLifter;
						}
					} 
					// funzione  (val>0) = colore
					else {
						if (eval("'" + record.data[me.valueFieldEvent] + "' " + renderArray[i])) {
							EventSymbol = SymbolOne;
							if (renderArray[i + 1] == 'SymbolThree') EventSymbol = SymbolThree;
							else if (renderArray[i + 1] == 'SymbolTwo') EventSymbol = SymbolTwo;
							else if (renderArray[i + 1] == 'SymbolOne') EventSymbol = SymbolOne;
							else if (renderArray[i + 1] == 'SymbolPlane') EventSymbol = SymbolPlane;
							else if (renderArray[i + 1] == 'SymbolLifter') EventSymbol = SymbolLifter;
						}

					}
				}
				EventCoordinates[MachineId].push({
													lat: record.data[me.valueFieldLat],
													lng: record.data[me.valueFieldLon],
													icon: EventSymbol,
													label: record.data[me.valueFieldEvent],
													id: 'marker_' + record.data[me.keyField]
												});
				OldEvent = record.data[me.valueFieldEvent];
			}
			
			//path
            if (me.flightPath) {
				FlightPlanCoordinates[MachineId].push({
														lat: record.data[me.valueFieldLat],
														lng: record.data[me.valueFieldLon]
													});
				
					
            }
			else {
				var marker = me.addMarker({	lat:record.data[me.valueFieldLat],
												lng: record.data[me.valueFieldLon],
												title: MachineLabel,
												id: 'marker_' + record.data[me.keyField]});
			}
        }
		
		//DRAW event
        for (var machine in EventCoordinates) {
			for (let i = 0; i < EventCoordinates[machine].length; i++) {
				var marker = me.addMarker({	lat: EventCoordinates[machine][i].lat,
												lng: EventCoordinates[machine][i].lng,
												icon: EventCoordinates[machine][i].icon,
												title: MachineLabel,
												id: EventCoordinates[machine][i].id});
			}
		}
		
		//DRAW path
        if (me.flightPath) {
            for (var machine in FlightPlanCoordinates) {
                if (FlightPlanCoordinates.hasOwnProperty(machine)) {
					var ultimaIcon = SymbolLifter;
                    var flightPath = new google.maps.Polyline({
                        path: FlightPlanCoordinates[machine],
                        geodesic: true,
                        strokeColor: Machines[machine][0].Color,
                        strokeOpacity: 0.8,
                        strokeWeight: 1,
                        icons: [
							{
                                icon: ultimaIcon,
                                //offset: '100%',
								//repeat: '40px'
								//repeat: '4%'
                            }
                        ],
						fixedRotation: true,
                        map: me.gmap,
                    });
                    me.flightPaths.push(flightPath);

                    if (me.flightPathSimulate) {
						//animazione velocita
                        me.animateLine(flightPath, 70, 100);
                    } 
					else {
						//ultima posizione
                        var ultimapos = FlightPlanCoordinates[machine].length - 1;
						//var ultimaIcon = iconBase + Machines[machine][0].Icon + '.png';
						var ultimaIcon = SymbolLifter;
						var marker = new google.maps.Marker({
                            position: {
                                lat: FlightPlanCoordinates[machine][ultimapos].lat,
                                lng: FlightPlanCoordinates[machine][ultimapos].lng
                            },
							color: Machines[machine][0].Color,
							icon: ultimaIcon,
                            label: Machines[machine][0].Label,
							id: 'machine_' + machine,
                            map: me.gmap,
                        });
                        me.markers.push(marker);
						//me.addMarker({	lat: FlightPlanCoordinates[machine][ultimapos].lat,
						//					lng: FlightPlanCoordinates[machine][ultimapos].lng,
						//					title: Machines[machine][0].Label});
                    }
                }
            }
        }
    /*
	*/
	},
	
	onBoxReady: function() {
    },
 
    createMap: function(center, marker) {
		var me = this;
        var options = Ext.apply({}, this.mapOptions);
 
        /* global google */
        options = Ext.applyIf(options, {
            zoom: 19,
            center: center,
            mapTypeId: me.mapType
        });
        me.gmap = new google.maps.Map(this.body.dom, options);

		//drawingManager
		const drawingManager = new google.maps.drawing.DrawingManager({
			drawingMode: google.maps.drawing.OverlayType.MARKER,
			drawingControl: true,
			drawingControlOptions: {
			  position: google.maps.ControlPosition.TOP_CENTER,
			  drawingModes: [
				google.maps.drawing.OverlayType.POLYGON
			  ],
			}
		  });
		
		//Listener
		me.gmap.addListener('click', function(event) {
			me.currentPolygon = event.feature;
		});
		me.gmap.addListener('rightclick', function(event) {
			var data = JSON.parse(localStorage.getItem('geoData'));
			data.features = data.features.filter(function(feature) {
				return feature.properties.featureID !== event.feature.getProperty('featureID');
			});
			localStorage.setItem('geoData', JSON.stringify(data));
			me.gmap.remove(event.feature);
		});
        /*
        me.gmap.event.addListener(drawingManager, 'polygoncomplete', function(polygon) {
            var coordStr = "";
            for (var i = 0; i < polygon.getPath().getLength(); i++) {
              coordStr += polygon.getPath().getAt(i).toUrlValue(6) + ";";
              console.log(coordStr);
              document.getElementById('coords').value = coordStr;
            }
          });
          */
		drawingManager.setMap(me.gmap);
		
		//Load Polygons
		if (me.valueFieldLayout != ''){
			var DS_Form00 = Ext.data.StoreManager.lookup("DS_" + CurrentPanelRaw.name + "_" + "Form00");
			me.LayoutJson = DS_Form00.data.items[0].data[me.valueFieldLayout];
			me.loadPolygons(me);
		}
		
		//marker center
        if (marker) {
            this.addMarker(Ext.applyIf(marker, {
                position: center
            }));
        }
 
        Ext.each(this.markers, this.addMarker, this);
        this.fireEvent('mapready', this, this.gmap);
    },
    addMarker: function(marker) {
		var me = this;
        var o;
 
        marker = Ext.apply({
            map: this.gmap
        }, marker);
 
        if (!marker.position) {
            marker.position = new google.maps.LatLng(marker.lat, marker.lng);
        }
		
        o = new google.maps.Marker(marker);
 
		o.addListener("click", () => {
			if ((me.layouteditorid != 0) && (me.layouteditorid !== undefined)) {
				var renderArray = marker.id.split('_');
				var ValRiga = renderArray[1];
				Custom.LayoutRender(me.layouteditorid, 'form', me.keyField + " = " + ValRiga + "", 'edit', me.layouteditorWindowMode);
				
			}
		});
		
        Ext.Object.each(marker.listeners, function(name, fn) {
            google.maps.event.addListener(o, name, fn);
        });
 
        return o;
    },
    lookupCode: function(addr, marker) {
        this.geocoder = new google.maps.Geocoder();
        this.geocoder.geocode({
            address: addr
        }, Ext.Function.bind(this.onLookupComplete, this, [marker], true));
    }, 
    lookupPosition : function(addr, marker) {
        this.geocoder = new google.maps.Geocoder();
		cooodArray = addr.split(',');
		lat = parseFloat(cooodArray[0]);
		lng = parseFloat(cooodArray[1]);
		var latlng = new google.maps.LatLng(lat, lng);
        this.geocoder.geocode({
           location: latlng
        }, Ext.Function.bind(this.onLookupComplete, this, [marker], true));
    },
	
	onLookupComplete: function(data, response, marker) {
        if (response !== 'OK') {
            Ext.MessageBox.alert('Error', 'An error occured: "' + response + '"');
 
            return;
        }
 
        this.createMap(data[0].geometry.location, marker);
    },
    afterComponentLayout: function(w, h) {
        this.callParent(arguments);
        this.redraw();
    },
 
    redraw: function() {
        var map = this.gmap;
 
        if (map) {
            google.maps.event.trigger(map, 'resize');
        }
    },
	
	/* add property to manage as field in form*/
    initValue: function () {
        this.setValue(this.value);
    },
    setValue: function (new_value) {
        var me = this;
        me.text = new_value;
    },
    getValue: function () {
        var me = this;
        var data = {};
        data[me.getName()] = '' + me.text;
        //return data;
		//me.map.data.toGeoJson(function(o){console.log(o)});
        return '' + me.text;
    },
    getSubmitData: function () {
        var me = this;
        var data = {};
        data[me.getName()] = '' + me.text;
        data[me.valueFieldLayout] = '' + me.LayoutJson;
        return data;
    },
    
    animateLine: function (line, steps, stepTime) {
		var count = 0; // it counts from 0 to (parameter) steps, then cycles.
		var listener = window.setInterval(function () {
			count = (count + 1) % steps;
			var icons = line.get('icons');
			icons[0].offset = (100 * count / steps) + '%';
			line.set('icons', icons);
		}, stepTime);
		// you don't need this return, but you could use it for extra control, like if you have buttons to pause/stop/start the animation.
		return listener;
	},
    
	loadPolygons: function(me) {
       // var me = this;
		var data = JSON.parse(me.LayoutJson);
		me.gmap.data.forEach(function (f) {
			me.gmap.data.remove(f);
		});
		me.gmap.data.addGeoJson(data)
	},
	savePolygon: function() {
		this.gmap.data.toGeoJson(function (json) {
			var me = this.CurrentPanel.down('dynamicwmsgmap');
			me.LayoutJson = JSON.stringify(json);
		});
	},
	
});
 