//*************************************************************************************************************//
//			DYNAMIC 3D


Ext.define('dynamic3d', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.dynamic3d',
	mixins : {
		field : 'Ext.form.field.Base'
	},
	fieldBodyCls : 'extCodeEditor',

	//minWidth:700,
	//anchor: '83%',
	focusable : false,
	minHeight : 10,
	minWidth : 10,
	
	camera: null, 
	controls: null, 
	scene: null, 
	renderer: null, 
	guicontrols: null,
	cube: null, 
	line: null, 
	box: null,
	
	floorSize : {x:100, z:100}, //x,z
	racks: 5,
	volumeNames: [],
	boxSize: 10,
	//relativeBoxStartPosition: {x:floorSize['x']/2, y: 5, z: - floorSize['z']/2 + boxSize},
	relativeBoxStartPosition: {x:100/2, y: 5, z: - 100/2 + 10},

	/*INIZIO PARTE SPOSTAMENTO */
	angle: 0,
	position: 0,

	//3D
	//path3D,

	//2D
	// direction vector for movement
	//var direction = new THREE.Vector3(1, 0, 0);
	up : new THREE.Vector3(0, 0, 1),
	//var axis = new THREE.Vector3();
	// scalar to simulate speed
	speed : 0.5,

	config : {
		readOnly : false,
		mode : 'text/x-php',
		lineNumbers : true,
		matchBrackets : true,
		indentUnit : 4,
		tabSize : 4,
		indentWithTabs : true,
		toolbarHidden : false,
	},
	/*
	listeners: {
	render: 'onRenderField',
	resize: 'onResize',
	scope: 'this'
	},
	 */
	bbar : {
		xtype : 'toolbar',
		itemId : 'codetoolbar',
		items : []
	},
	items : [
		{
			xtype : 'textarea',
			width : '100%',
			height : '80%',
			listeners : {
				afterrender : function (textarea) {
					var me = textarea.up('codeeditor');

					var codeMirrorOptions = {
						value : '',
						gutters : ["CodeMirror-linenumbers", "breakpoints", "CodeMirror-foldgutter","CodeMirror-lint-markers"],
						matchBrackets : true,
						//mode: me.getMimeMode('php'),
						//mode : "text/x-php",
						mode: me.modecode,
						//mode : "application/x-httpd-php-open",
						readOnly : me.readOnly,
						lineNumbers : true,
						indentUnit : 4,
						tabSize : 4,
						//lineWrapping : false,
						foldGutter : true,
						indentWithTabs : true,
						smartIndent : true,
						autofocus : true,
						lint: {
							disableEval: false,
							disableExit: true,
							disablePHP7: false,
							disabledFunctions: ['proc_open', 'system'],
							deprecatedFunctions: ['wp_list_cats']
						},
						styleActiveLine: true,	
		/*				
						hintOptions : {
							tables : {
								users : {
									name : null,
									score : null,
									birthDate : null
								},
								countries : {
									name : null,
									population : null,
									size : null
								}
							}
						},
*/
						extraKeys : {
							"F11" : function (cm) {
								cm.setOption("fullScreen", !cm.getOption("fullScreen"));
							},
							"Esc" : function (cm) {
								if (cm.getOption("fullScreen"))
									cm.setOption("fullScreen", false);
							},
							"Ctrl-Space" : "autocomplete",
							"Ctrl-R" : "replace",
							"Ctrl-Q" : function (cm) {
								cm.foldCode(cm.getCursor());
							},
							"F10" : function (cm) {
								var me = this;
								var range = {
									from : this.editor.getCursor(true),
									to : this.editor.getCursor(false)
								};
								cm.autoFormatRange(range.from, range.to)
							},
						}
					};

					me.MyCodeEditor = new CodeMirror.fromTextArea(textarea.getEl().query('textarea')[0], codeMirrorOptions);

					/*DAFARE DEBUG PHP ??		*/
					me.MyCodeEditor.on("gutterClick", function (cm, n) {
						var info = cm.lineInfo(n);
						var marker = null;
						if (info.gutterMarkers) {
							marker = null;
						} else {
							marker = document.createElement("div");
							marker.style.color = "#822";
							marker.innerHTML = "●";
						}
						cm.setGutterMarker(n, "breakpoints", marker);
					});

					// hack to use the extjs eventhandler ;-)
					me.MyCodeEditor.un = me.MyCodeEditor.off;
					me.MyCodeEditor.doAddListener = me.MyCodeEditor.on;

				}
			}
		}
	],

	/* init component */
	initComponent : function () {
		var me = this;
		if (!me.toolbarHidden) {
			var sourceTypeStore = Ext.create('Ext.data.Store', {
				fields: ['abbr', 'name'],
				data : [
					{"ID":"text/x-php", "DESCNAME":"PHP"},
					{"ID":"text/json", "DESCNAME":"JSON"},
					{"ID":"text/javascript", "DESCNAME":"javascript"},
					{"ID":"text/html'", "DESCNAME":"html"},
					{"ID":"text/css", "DESCNAME":"css"},
					{"ID":"text/x-sql", "DESCNAME":"sql"},
					{"ID":"text/x-mysql", "DESCNAME":"mysql"},
					{"ID":"text/x-plsql", "DESCNAME":"mssql"}
				]
			});
			

			me.bbar = {
				xtype : 'toolbar',
				itemId : 'codetoolbar',
				items : [{
						itemId : 'BuilderSQL',
						pressed : false,
						enableToggle : false,
						text : 'Add/Edit SQL',
						iconCls : 'x-fa fa-pencil-square',
						handler : function (button, event) {
							var me = button.up('codeeditor');
							CurrentPanel = me.up('panel');

							//var qbWindow = Ext.create('VisualSQLQueryBuilder');
							qbWindow.on({
								applySQL : function (vartext) {
									me.setValue(vartext);
								}
							});
							qbWindow.show();
							qbWindow.setValue(me.getValue());
						}
					}, {
						itemId : 'BeautifyJS',
						pressed : false,
						enableToggle : false,
						text : 'BeautifyJS',
						iconCls : 'x-fa fa-magic',
						handler : function (button, event) {
							var me = button.up('codeeditor');
							Ext.Ajax.request({
								method : 'POST',
								async : false,
								params : {
									code : me.value,
									type : 'JSON'
								},
								url : '/includes/io/EditorFunction.php',
								success : function (response) {
									var me = button.up('codeeditor');
									me.setValue(response.responseText);
								},
								failure : function (response) {
									Ext.Msg.alert('Error', response);
								}
							});
						}
					}, {
						itemId : 'BeautifySQL',
						pressed : false,
						enableToggle : false,
						text : 'BeautifySQL',
						iconCls : 'x-fa fa-magic',
						handler : function (button, event) {
							var me = button.up('codeeditor');
							Ext.Ajax.request({
								method : 'POST',
								async : false,
								params : {
									code : me.value,
									type : 'SQL'
								},
								url : '/includes/io/EditorFunction.php',
								success : function (response) {
									var me = button.up('codeeditor');
									me.setValue(response.responseText);
								},
								failure : function (response) {
									Ext.Msg.alert('Error', response);
								}
							});
						}
					}, {
						itemId : 'CodeType',
						xtype: 'combobox',
						store: sourceTypeStore,
						queryMode: 'local',
						displayField: 'DESCNAME',
						valueField: 'ID',
						listeners:{
							 scope: this,
							 'select':  function (combo, record, index) {
								var me = combo.up('codeeditor');
								var Editor = me.MyCodeEditor.doc.getEditor();
								Editor.setOption("mode", combo.getValue());
							 }
						}
					}
				]
			};
		}
		me.callParent();
	},

	destroy : function () {
		var me = this;

		if (me.MyCodeEditor && me.MyCodeEditor.clear) {
			me.MyCodeEditor.clear();
		}
		me.MyCodeEditor = null;

		me.callParent(arguments);
	},

	getValue : function () {
		var me = this;
		this.text = me.MyCodeEditor.getValue();
		return this.text;
	},

	getSubmitValue : function () {
		var me = this;
		return me.getValue();
	},

	setValue : function (value) {
		var me = this;
		me.value = (value || '');
		me.MyCodeEditor.mode = me.modecode;
		me.MyCodeEditor.setValue(me.value);
	},

	isDirty : function () {
		return this.dirty;
	},

	setDirty : function (dirty) {
		this.dirty = dirty;
		this.fireEvent('dirtychange', dirty);
	},

	onChange : function (value) {
		var me = this;
		if (me.rendered && !me.suspendCodeChange && me.MyCodeEditor) {
			me.MyCodeEditor.setValue((value || ''));
			me.MyCodeEditor.clearHistory();
		}
		me.callParent(arguments);
	},

	setReadOnly : function (readOnly) {
		var me = this;
		readOnly = !!readOnly;
		me[readOnly ? 'addCls' : 'removeCls'](me.readOnlyCls);
		me.readOnly = readOnly;
		if (me.MyCodeEditor) {
			me.MyCodeEditor.setReadOnly(readOnly);
		}
		me.fireEvent('writeablechange', me, readOnly);
	},

	onResize : function () {
		var me = this;
		if (me.MyCodeEditor) {
			if (!me.toolbarHidden) {
				var bbar = me.down('toolbar');
				me.MyCodeEditor.setSize(me.getWidth()-1, me.getHeight()-bbar.getHeight()-5);
			}else{
				me.MyCodeEditor.setSize(me.getWidth()-1, me.getHeight()-8);
			}
		}
	},

	onWindowResize: function () {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	},
	
	animate: function () {
		//move2D();
		move3D();
		
		requestAnimationFrame(animate);

		controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
		render();
	},
	
	render: function () {
		// rotate the cube around its axes
		if (cube && 1==2) {
			cube.rotation.x += guicontrols.rotationSpeed;
			cube.rotation.y += guicontrols.rotationSpeed;
			cube.rotation.z += guicontrols.rotationSpeed;
		}
		if (line) {
			line.rotation.z += guicontrols.rotationSpeed;
		}
		
		renderer.render(scene, camera);
	},

	createDome:	function(){
		// Dome
		geometry = new THREE.IcosahedronGeometry(2000, 1);
		var domeMaterial = new THREE.MeshPhongMaterial({
			color: 0xfb4550,
			shading: THREE.FlatShading,
			flatShading: true,
			side: THREE.BackSide
		});
		var dome = new THREE.Mesh(geometry, domeMaterial);
		scene.add(dome);
	},

	createHelpers: function (){
		// helpers
		var axes = new THREE.AxesHelper(floorSize['x']/2);
		scene.add(axes);
		//grid Helper
		var size = 100;
		var divisions = 100;
		var planeGridHelper = new THREE.GridHelper(size, divisions);
		//planeGridHelper.position.y = 0;
		//scene.add(planeGridHelper);
		var vertSxGridHelper = new THREE.GridHelper(size, divisions);
		vertSxGridHelper.rotation.x = degra(90);
		vertSxGridHelper.position.z = 50;
		vertSxGridHelper.position.y = 50;
		//scene.add(vertSxGridHelper);
		var vertDxGridHelper = new THREE.GridHelper(size, divisions);
		vertDxGridHelper.rotation.x = degra(90);
		vertDxGridHelper.position.z = -50;
		vertDxGridHelper.position.y = 50;
		//scene.add(vertDxGridHelper);
			
		var radius = 10;
		//PolarGridHelper
		var radials = 16;
		var circles = 8;
		var divisions = 64;
		var polarGridHelper = new THREE.PolarGridHelper( radius, radials, circles, divisions );
		//scene.add( polarGridHelper );
	},

	createRoom: function(){
		// planes
		var floorPlaneGeometry = new THREE.PlaneGeometry( floorSize['x'], floorSize['z'], floorSize['x'], floorSize['z'] );
		//var material = new THREE.MeshBasicMaterial( { color: 0x0000ff, wireframe: true, side: THREE.DoubleSide } );
		var florMaterial = new THREE.MeshBasicMaterial({color: 0x919191, wireframe: false, side: THREE.DoubleSide});
		var floorPlane = new THREE.Mesh( floorPlaneGeometry, florMaterial );
		floorPlane.rotation.x = degra(90);
		//floorPlane.position.x = floorSize['x']/2;
		//floorPlane.position.z = floorSize['z']/2;
		scene.add( floorPlane );
		var wallMaterial = new THREE.MeshBasicMaterial({color: 0xddeeee, wireframe: false, side: THREE.DoubleSide});
		var vertPlaneGeometry = new THREE.PlaneGeometry( 100, 30, 100, 30  );
		var vertSxPlane = new THREE.Mesh( vertPlaneGeometry, wallMaterial );
		vertSxPlane.position.x = 0;
		vertSxPlane.position.z = +floorSize['z']/2;
		vertSxPlane.position.y = 15;
		scene.add( vertSxPlane );
		var vertRearPlane = new THREE.Mesh( vertPlaneGeometry, wallMaterial );
		vertRearPlane.rotation.y = degra(90);
		vertRearPlane.position.x = -floorSize['x']/2;
		//vertRearPlane.position.z = 0;
		vertRearPlane.position.y = 15;
		scene.add( vertRearPlane );
		var vertDxPlane = new THREE.Mesh( vertPlaneGeometry, wallMaterial );
		vertDxPlane.position.x = 0;
		vertDxPlane.position.z = -floorSize['z']/2;
		vertDxPlane.position.y = 15;
		scene.add( vertDxPlane );
	},

	createRack: function () {
		
		var cubeSize = 10;
		
		var relativCoord = {
			'x':-floorSize['x']/2,
			'z':floorSize['z']/2,
		};
		
		var relativCoordCubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
		//var relativCoordCubeMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
		var relativCoordCubeMaterial = new THREE.MeshLambertMaterial({color: 0xFF0000});
		relativCoordCube = new THREE.Mesh( relativCoordCubeGeometry, relativCoordCubeMaterial );
		//relativCoordCube.position.y = 0;
		relativCoordCube.position.set( relativCoord['x'], 5, relativCoord['z']);	
		//scene.add(relativCoordCube);
		
		var colors = {
			'0': 0x00ff00, //green
			'1': 0xFF0000, //red
			'2': 0x0000FF, //blue
			'3': 0xFFFF00, //yellow
		};
		
		dots = new THREE.Object3D();
		var zaddpos = 0;
		for (r = 0; r < racks; r++) {
			if (r != 0) {
				var zaddpos = zaddpos + 2 * cubeSize;
			}
			/*
			if (r % 2) {
				//is odd
				var zaddpos = zaddpos + r * cubeSize + cubeSize;
				console.log(r);
				console.log(zaddpos);
			} else {
				var zaddpos = zaddpos + r * cubeSize;
				console.log(r);
				console.log(zaddpos);
			}
			*/
			
			for (var i = 0; i < 8; i++) {
				var cubegeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
				//var cubematerial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
				var cubematerial = new THREE.MeshLambertMaterial({wireframe: true, color: colors[r]});
				cube = new THREE.Mesh( cubegeometry, cubematerial );
				//cube.position.y = 0;
				//cube.position.set( i * cubeSize + cubeSize/2 , 5, cubeSize/2 + zaddpos);
				cube.position.set( relativCoord['x'] + cubeSize/2 + i * cubeSize , 5, relativCoord['z'] - cubeSize/2 - zaddpos);
				cube.data = { rack: r, line: 1, pos: i };
				cube.name = r+'1'+i;
				volumeNames.push(cube.name);
				cube.userData.id = r+'1'+i;
				
				dots.add(cube);
			}

		   for (var i = 0; i < 8; i++) {

				var cubegeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
				//var cubematerial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
				var cubematerial = new THREE.MeshLambertMaterial({wireframe: true});
				cube = new THREE.Mesh( cubegeometry, cubematerial );
				//cube.position.y = 0;
				//cube.position.set( i * cubeSize + cubeSize/2, 5 + cubeSize, cubeSize/2 + zaddpos);
				cube.position.set( relativCoord['x'] + cubeSize/2 + i * cubeSize , 5 + cubeSize, relativCoord['z'] - cubeSize/2 - zaddpos);
				cube.data = { rack: r, line: 2, pos: i };
				cube.name = r+'2'+i;
				volumeNames.push(cube.name);
				cube.userData.id = r+'2'+i;
				
				dots.add(cube);
			}
		}	
		/*
		dots.position.x = 70;
		dots.position.y = 9;
		dots.position.z = -2;
		dots.rotation.y = Math.PI * 600;
		dots.rotation.z = Math.PI * 500;
		*/
		
		scene.add(dots);
	},

	createBoxes: function () {
		
		var loader = new THREE.TextureLoader();
		loader.load('img/pallet-s-h.png', function ( texture ) {

			var boxgeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
			//var boxmaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
			//var boxmaterial = new THREE.MeshLambertMaterial({ color: 0x0000FF });
			var boxmaterial = new THREE.MeshLambertMaterial({ map: texture, overdraw: 0.5 });
			box = new THREE.Mesh( boxgeometry, boxmaterial );
			//cube.position.y = 0;
			box.position.set( relativeBoxStartPosition.x , relativeBoxStartPosition.y, relativeBoxStartPosition.z );
			box.name = 'box';
			//cube.boxmaterial.wireframe = true;
			scene.add(box);
			
			box2 = box.clone();
			scene.add(box2);
		  
			//set a initial position or rotation
			//box2.rotation.z = Math.PI/4;
			box2.position.set( relativeBoxStartPosition.x , relativeBoxStartPosition.y, -relativeBoxStartPosition.z);

		});
		
	},

	// the path
	draw2DPath: function () {
		path = new THREE.Path([
			new THREE.Vector2(-50, -50),
			new THREE.Vector2(0, -50)
		]);
		
		var arcRadius = 50;
		path.moveTo(0, 0 - arcRadius);
		path.absarc(0, 0, arcRadius, -Math.PI / 2, 0, false);
		path.lineTo(50, 50);

		// Start angle and point
		previousAngle = getAngle( position );
		previousPoint = path.getPointAt( position );
		
		var vertices = path.getSpacedPoints(20);

		// Change 2D points to 3D points
		for (var i = 0; i < vertices.length; i++) {
			point = vertices[i]
			vertices[i] = new THREE.Vector3(point.x, point.y, 0);
		}
		var lineGeometry = new THREE.Geometry();
		lineGeometry.vertices = vertices;
		var lineMaterial = new THREE.LineBasicMaterial({
			color: 0x000000
		});
		var line = new THREE.Line(lineGeometry, lineMaterial)
		scene.add(line);
	},

	//Create a closed wavey loop - 3D path
	draw3DPath: function () {
		path3D = new THREE.CatmullRomCurve3( [
			//new THREE.Vector3( -10, 0, 10 ),
			new THREE.Vector3( relativeBoxStartPosition.x, relativeBoxStartPosition.y, -relativeBoxStartPosition.z),
			//new THREE.Vector3( -5, 5, 5 ),
			new THREE.Vector3( relativeBoxStartPosition.x, relativeBoxStartPosition.y, 0 ),
			//new THREE.Vector3( 5, -5, 5 ),
			//new THREE.Vector3( 10, 0, 10 )
			//new THREE.Vector3( relativeBoxStartPosition.x, relativeBoxStartPosition.y, relativeBoxStartPosition.z)
			new THREE.Vector3( 25, relativeBoxStartPosition.y, 5 )
		] );

		var points = path3D.getPoints( 50 );
		var geometry = new THREE.BufferGeometry().setFromPoints( points );

		var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );

		// Create the final object to add to the scene
		var curveObject = new THREE.Line( geometry, material );
		scene.add( curveObject );
	},

	move3D: function (){
		if (path3D != undefined) {
			position += 0.001;
			var pos =  path3D.getPoint(position);
			box2.position.set(pos.x, pos.y, pos.z);
		}
	},

	move2D: function () {
	  
		// add up to position for movement
		position += 0.001;

		// get the point at position
		try {
			var point = path.getPointAt(position);
			//var point = curve.getPointAt(position);
			if(point !== null) {
				box.position.x = point.x;
				box.position.y = point.y;

				var angle = getAngle(position);
				// set the quaternion
				box.quaternion.setFromAxisAngle( up, angle );

				/*
				box2.position.x += ( point.x - previousPoint.x );
				box2.position.y += ( point.y - previousPoint.y );

				// set the quaternion
				box2.rotation.z += ( angle - previousAngle );
				*/

				previousPoint = point;
				previousAngle = angle;
			}
		}
		catch(error) {
			console.error(error);
			// expected output: SyntaxError: unterminated string literal
			// Note - error messages will vary depending on browser
		}
	},

	getAngle: function ( position ){
		// get the 2Dtangent to the curve
		var tangent = path.getTangent(position).normalize();

		// change tangent to 3D
		angle = - Math.atan( tangent.x / tangent.y);

		return angle;
	},

//radians
	degra: function(degree){ 
		return degree*(Math.PI/180); 
	},

	setMode : function (mime) {
		var me = this;
		me.lineNumbers = true;
		me.matchBrackets = true;
		me.mode = me.getMimeMode(mime);
		me.indentUnit = 4;
		me.indentWithTabs = true;
		if (mime == 'php') {
			//me.value = "text/x-php";
		}
	}
});