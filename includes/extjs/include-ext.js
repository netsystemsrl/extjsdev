/**
 * This file includes the required ext-all js and css files based upon "theme" and "rtl"
 * url parameters.  It first searches for these parameters on the page url, and if they
 * are not found there, it looks for them on the script tag src query string.
 * For example, to include the neptune flavor of ext from an index page in a subdirectory
 * of extjs/examples/:
 * <script type="text/javascript" src="../../examples/shared/include-ext.js?theme=neptune"></script>
 */
 
//THEME DEFINITION
var themeUI = '';
var themeSize = '';
var themeType = '';
var themeName = '';

var scriptPath = '';
 
var CurrentDeviceType = 'desktop';
var CurrentDeviceMono = false;
var CurrentDeviceApp = false;

//LOGGING DEFINITION
function log(str) {
	if (window.console) {
		console.log(str);
	}
}
//******************** Normalized address bar hiding for iOS & Android ****************************************//
function toggleFullScreen() {
  var doc = window.document;
  var docEl = doc.documentElement;

  var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
  var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

  if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
    requestFullScreen.call(docEl);
  }
  else {
    cancelFullScreen.call(doc);
  }
}
function loadCss(url) {
	document.write('<link rel="stylesheet" type="text/css" href="' + url + '"/>');
}
function loadScript(url, defer) {
	document.write('<script type="text/javascript" src="' + url + '"' +
			(defer ? ' defer' : '') + '></script>');
}
function getQueryParam(name) {
	var regex = RegExp('[?&]' + name + '=([^&]*)');

	var match = regex.exec(location.search) || regex.exec(scriptPath);
	return match && decodeURIComponent(match[1]);
}
function hasOption(opt, queryString) {
	var s = queryString || location.search;
	var re = new RegExp('(?:^|[&?])' + opt + '(?:[=]([^&]*))?(?:$|[&])', 'i');
	var m = re.exec(s);

	return m ? (m[1] === undefined || m[1] === '' ? true : m[1]) : false;
}

//LOADING DYNAMIC LIBRARY EXTJS DEFINITION
(function() {
	
	/*DEFINIZIONE CARTELLA*/
	extjsVersion = 'build';
	
    Ext = window.Ext || {};
	var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;

	var useDebug = false;
    var scriptEls = document.getElementsByTagName('script');
    scriptPath = scriptEls[scriptEls.length - 1].src;
	
	if (typeof location.origin === 'undefined')
		location.origin = location.protocol + '//' + location.host;
	var debugSuffix = useDebug ? '-debug' : '';
	var debugmin = useDebug ? '' : '.min';
	var origDir = location.origin;
	
	/* DA MODIFICARE PER SUB INSTALLAZIONE*/
	origDir = origDir;
	
	var includeDir = origDir + '/includes/';
	var extDir = includeDir + 'extjs/' + extjsVersion + '/';
	var dynamicDir = includeDir + 'dynamic/';
	
	/* ----- RESPONSIVE  --------------------------------------------*/
	
	
	//THEME
	//OVERRIDE IN URL
	if(getQueryParam('appmode') == 'true') {
		CurrentDeviceType = 'app';
		themeName = '/nsneptune-touch';
	}else if(getQueryParam('monomode') == 'true') {
		CurrentDeviceType = 'tablet';
		themeName = '/nsneptune-touch';
		themeType = 'classic';
	}else if(getQueryParam('theme')) {
		themeName = (getQueryParam('theme') || '/azzurra').replace(/^([-A-Za-z]*)(.*)/, '$2');
		themeType = (getQueryParam('theme') || 'classic').replace(/^([-A-Za-z]*)(.*)/, '$1');
		if (themeName != '/nsneptune-touch'){
			CurrentDeviceType = 'desktop';
		}else{
			CurrentDeviceType = 'tablet';
		}
	}else{
		//DEVICE AUTO
		if((/iPad|iPod/i.test(navigator.userAgentData)) || ((x < 1023) && (x > 499))) {
			CurrentDeviceType = 'tablet';
			themeName = '/nsneptune-touch';
			themeType = 'classic';
		}else if((/Android|webOS|iPhone|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgentData)) || (x < 500))  {
			CurrentDeviceType = 'phone';
			themeName = '/nsneptune-touch';
			themeType = 'classic';
		}else{
			CurrentDeviceType = 'desktop';
		}
		if (((CurrentDeviceType == 'tablet') || (CurrentDeviceType == 'phone') || (CurrentDeviceType == 'app'))) {
			themeName = '/nsneptune-touch';
			themeType = 'classic';
		}else{
			themeName = '/azzurra';
			themeType = 'classic';
		}
	}
	
	
	/* ----- INCLUDING  --------------------------------------------*/
	themeName = themeName.substring(1);
    var useDebug = hasOption('debug');
    var hasOverrides = !hasOption('nooverrides', scriptPath) && !!{
							'azzurra': 1,
							'azzurramin': 1,
							'carbon':1,
							'classic': 1,
							'crisp': 1,
							'gray': 1,
							'triton': 1,
							'neptune-touch': 1,
							'crisp-touch': 1,
							'graphite':1,
							'material':1
						}[themeName];

	themeNameAddOn = themeName;
	if (themeNameAddOn == 'azzurra') themeNameAddOn = 'triton';
	if (themeNameAddOn == 'carbon') themeNameAddOn = 'triton';
	if (themeNameAddOn.substring(0, 2) == 'ns') themeNameAddOn = 'classic';
	
	//JSReport --> 
	//if (CurrentDeviceType == 'desktop') {
		loadScript(includeDir + 'jsreport/jquery-1.11.0.min.js');
		loadScript(includeDir + 'jsreport/highlight.pack.js');
		loadScript(includeDir + 'jsreport/jsreports-all.min.js');
		loadCss(includeDir + 'jsreport/jsreports-all.min.css');
	//}
	
	//NumPad --> 
	//if (CurrentDeviceType == 'desktop') {
		loadScript(includeDir + 'jquery.numpad.js');
		loadCss(includeDir + 'jquery.numpad.css');
	//}
	
	loadScript(includeDir + 'signature_pad.umd.min.js');

	//Visual codeeditor -->
	if (CurrentDeviceType == 'desktop') {
		//ace
		//loadScript(includeDir + 'ace/codeeditor.js');
		//loadScript(includeDir + 'ace/src-min-noconflict/ace.js');

		//codemirror -->
		loadCss(includeDir + 'CodeMirror/lib/codemirror.css');
		loadCss(includeDir + 'CodeMirror/addon/hint/show-hint.css');
		loadCss(includeDir + 'CodeMirror/addon/fold/foldgutter.css');
		loadCss(includeDir + 'CodeMirror/addon/display/fullscreen.css');
		loadCss(includeDir + 'CodeMirror/addon/dialog/dialog.css');
		loadCss(includeDir + 'CodeMirror/addon/search/matchesonscrollbar.css');
		loadCss(includeDir + 'CodeMirror/addon/lint/lint.css');
		
		loadScript(includeDir + 'CodeMirror/lib/codemirror.js');
		loadScript(includeDir + 'CodeMirror/addon/formatting/formatting.js');
		
		loadScript(includeDir + 'CodeMirror/addon/mode/loadmode.js');
		loadScript(includeDir + 'CodeMirror/addon/edit/matchbrackets.js');
		loadScript(includeDir + 'CodeMirror/mode/htmlmixed/htmlmixed.js');
		loadScript(includeDir + 'CodeMirror/mode/xml/xml.js');
		loadScript(includeDir + 'CodeMirror/mode/css/css.js');
		loadScript(includeDir + 'CodeMirror/mode/clike/clike.js');
		loadScript(includeDir + 'CodeMirror/mode/php/php.js');
		loadScript(includeDir + 'CodeMirror/mode/javascript/javascript.js');
		loadScript(includeDir + 'CodeMirror/mode/sql/sql.js');
		loadScript(includeDir + 'CodeMirror/addon/hint/show-hint.js');
		loadScript(includeDir + 'CodeMirror/addon/hint/sql-hint.js');
		loadScript(includeDir + 'CodeMirror/addon/hint/anyword-hint.js');
		loadScript(includeDir + 'CodeMirror/addon/display/fullscreen.js');
		loadScript(includeDir + 'CodeMirror/addon/lint/lint.js');
		
		loadScript(includeDir + 'CodeMirror/addon/selection/active-line.js');
	
		loadScript(includeDir + 'CodeMirror/addon/lint/php-parser.js');
		loadScript(includeDir + 'CodeMirror/addon/lint/php-lint.js');
		
		loadScript(includeDir + 'CodeMirror/addon/fold/foldcode.js');
		loadScript(includeDir + 'CodeMirror/addon/fold/foldgutter.js');
		loadScript(includeDir + 'CodeMirror/addon/fold/brace-fold.js');
		loadScript(includeDir + 'CodeMirror/addon/fold/xml-fold.js');
		loadScript(includeDir + 'CodeMirror/addon/fold/markdown-fold.js');
		loadScript(includeDir + 'CodeMirror/addon/fold/comment-fold.js');
		
		loadScript(includeDir + 'CodeMirror/addon/search/search.js');
		loadScript(includeDir + 'CodeMirror/addon/search/searchcursor.js');
		loadScript(includeDir + 'CodeMirror/addon/search/jump-to-line.js');
		loadScript(includeDir + 'CodeMirror/addon/scroll/annotatescrollbar.js');
		loadScript(includeDir + 'CodeMirror/addon/search/matchesonscrollbar.js');
		loadScript(includeDir + 'CodeMirror/addon/dialog/dialog.js');
		loadScript(includeDir + 'CodeMirror/addon/display/panel.js');
	}
	
	//THEME CSS
    if (hasOverrides) {
		loadScript(extDir +  themeType + '/theme-' + themeName + '/theme-' + themeName + debugSuffix + '.js', true);
	} 
	loadCss(extDir + themeType + '/theme-' + themeName + '/resources/theme-' + themeName + '-all' + debugSuffix + '.css');
	
	loadCss(extDir + 'packages/charts/' 	+ themeType + '/' + themeNameAddOn + '/resources/charts-all' + debugSuffix + '.css');
	if (CurrentDeviceType == 'desktop') {
		loadCss(extDir + 'packages/ux/' 		+ themeType + '/' + themeNameAddOn 	+ '/resources/ux-all' + debugSuffix + '.css');
		loadCss(extDir + 'packages/pivot/' 		+ themeType + '/' + themeNameAddOn 	+ '/resources/pivot-all' + debugSuffix + '.css');
		loadCss(extDir + 'packages/d3/' 		+ themeType + '/' + themeNameAddOn 	+ '/resources/d3-all' + debugSuffix + '.css');
		loadCss(extDir + 'packages/pivot-d3/'   + themeType + '/' + themeNameAddOn 	+ '/resources/pivot-d3-all' + debugSuffix + '.css');
		loadCss(extDir + 'packages/calendar/' 	+ themeType + '/' + themeNameAddOn  + '/resources/calendar-all' + debugSuffix + '.css');
		if (themeName != 'azzurra') {
			loadCss(extDir + '/packages/bryntum-gantt/' + themeType + '/' + themeName   + '/resources/bryntum-gantt-theme-' + themeNameAddOn   + '-all' + debugSuffix + '.css');
			//loadCss(extDir + '/packages/bryntum-scheduler/' + themeType + '/' + themeName   + '/resources/bryntum-scheduler-theme-' + themeName   + '-all' + debugSuffix + '.css');
		}else{
			loadCss(extDir + '/packages/bryntum-gantt/' + themeType + '/' + themeName   + '/resources/bryntum-gantt-theme-' + themeName   + '-all' + debugSuffix + '.css');
			//loadCss(extDir + '/packages/bryntum-scheduler/' + themeType + '/' + themeName   + '/resources/bryntum-scheduler-theme-' + themeName   + '-all' + debugSuffix + '.css');
		}
		//loadCss(extDir + 'packages/saki-grid-multisearch/' + themeType + '/' + 'classic'   + '/resources/saki-grid-multisearch-all' + debugSuffix + '.css');
		//loadCss(extDir + 'packages/saki-tree-icon/' + 'classic'   + '/resources/saki-tree-icon-all' + debugSuffix + '.css');
	}
	
	//EXT STD
    loadScript(extDir + 'ext-all' + debugSuffix + '.js');
    //loadScript(extDir + 'ext-all.js');
	
	//Plugin ADDON
	loadScript(extDir + 'packages/charts/' + themeType +'/' + 'charts' + debugSuffix + '.js');
	if (CurrentDeviceType == 'desktop') {
		loadScript(extDir + 'packages/ux/' + themeType   + '/ux' + debugSuffix + '.js');
		loadScript(extDir + 'packages/exporter/' + themeType +'/' + 'exporter' + debugSuffix + '.js');
		loadScript(extDir + 'packages/pivot/' + themeType +'/' + 'pivot' + debugSuffix + '.js');
		loadScript(extDir + 'packages/d3/' + themeType   + '/d3' + debugSuffix + '.js');
		loadScript(extDir + 'packages/pivot-d3/' + themeType   + '/pivot-d3' + debugSuffix + '.js');
		loadScript(extDir + 'packages/calendar/' + themeType +'/' + 'calendar' + debugSuffix + '.js');
		loadScript(extDir + 'packages/bryntum-gantt/' + themeType +'/' + 'bryntum-gantt' + debugSuffix + '.js');
		loadScript(extDir + 'packages/bryntum-scheduler/' + themeType + '/' + 'bryntum-scheduler' + debugSuffix + '.js');
		//loadScript(extDir + 'packages/bryntum-taskboard/' + themeType + '/' + 'bryntum-taskboard' + debugSuffix + '.js');
		
		//loadScript(extDir + 'packages/saki-tree-icon/' + themeType +'/' + 'saki-tree-icon' + debugSuffix + '.js');
		//loadScript(extDir + 'packages/saki-grid-multisearch/' + themeType +'/' + 'saki-grid-multisearch' + debugSuffix + '.js');
	}else{
		//loadScript(includeDir + 'zxing.js');
		//loadScript(includeDir + 'video.js');
	}
	
	// DynamicObj -->
	loadScript(includeDir + 'jszip' + debugmin + '.js');
	loadScript(includeDir + 'FileSaver' + debugmin + '.js');
	loadScript(dynamicDir + 'dynamiccommon.js');
	loadScript(dynamicDir + 'dynamicgrid.js');
	loadScript(dynamicDir + 'dynamictreegrid.js');
	loadScript(dynamicDir + 'Printer.js');
	loadScript(dynamicDir + 'dynamicgridform.js');
	loadScript(dynamicDir + 'dynamiccombo.js');
	loadScript(dynamicDir + 'dynamictreecombo.js');
	loadScript(dynamicDir + 'dynamichtmlbox.js');
	loadScript(dynamicDir + 'dynamicimage.js');
	loadScript(dynamicDir + 'dynamicgallery.js');
	loadScript(dynamicDir + 'dynamicbutton.js');
	loadScript(dynamicDir + 'dynamicbuttontimer.js');
	loadScript(dynamicDir + 'dynamiccombobutton.js');
	loadScript(dynamicDir + 'kpi.js');
	loadScript(dynamicDir + 'geometry.js');
	loadScript(dynamicDir + 'dynamictextfield.js');
	loadScript(dynamicDir + 'timeext.js');
	loadScript(dynamicDir + 'datetimefield.js');
	loadScript(dynamicDir + 'dynamiccolor.js');
	loadScript(dynamicDir + 'dynamicclock.js');
	loadScript(dynamicDir + 'dynamicsignature.js');
	loadScript(dynamicDir + 'dynamicmeteo.js');
	loadScript(dynamicDir + 'dynamicframe.js');
	loadScript(dynamicDir + 'dynamictabproc.js');
	loadScript(dynamicDir + 'dynamicnumeric.js');
	loadScript(dynamicDir + 'dynamicounter.js');
	loadScript(dynamicDir + 'dynamicflowchart.js');
	loadScript(dynamicDir + 'dynamickanban.js');
	
	//Visual gmap -->
	loadScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyB8lxl0D4K5WCuudzpvx82qPymSNN-FiiA&libraries=drawing&sensor=false');
	loadScript(dynamicDir + 'gmap.js');

	//LOCALIZATION
	loadScript(extDir + themeType + '/locale/' + 'locale-it' + debugSuffix + '.js');
	if (CurrentDeviceType == 'desktop') {
		loadScript(extDir + 'packages/pivot-locale/' + themeType +'/' + 'pivot-locale-it' + debugSuffix + '.js');
		//loadScript(extDir + 'packages/bryntum-gantt-locale/' + 'It'  + '.js');
		//loadScript(extDir + 'packages/bryntum-scheduler-locale/' + 'It'  + '.js');
		//loadScript(extDir + 'packages/bryntum-taskboard-locale/' + 'It'  + '.js');
	}
	
	//weather -->
	//loadCss(includeDir + 'weather-icons.min.css');
	loadCss('https://cdnjs.cloudflare.com/ajax/libs/weather-icons/1.3.2/css/weather-icons.min.css');
		
	//INTROGuide -->
	loadScript(includeDir + 'intro/intro.min.js');
	loadCss(includeDir + 'intro/intro.min.css');
	
	//JSBarcode -->
	loadScript(includeDir + 'JsBarcode/JsBarcode.all' + debugmin + '.js');
	loadScript(dynamicDir + 'dynamicbarcode.js');
	loadScript(includeDir + 'jsreport/jsreports-integration-extjs.js');
	
	
	//OBJ DESKTOP --> 
	if (CurrentDeviceType == 'desktop') {	
		// DynamicMAPObj -->
		loadScript(dynamicDir + 'dynamicwmsgmap.js');
		loadScript(dynamicDir + 'dynamicwmsviewmap.js');
		loadScript(dynamicDir + 'dynamicgmappanel.js');
		//svg -->
		loadScript(dynamicDir + 'dynamicsvg.js')
		loadScript(dynamicDir + 'dynamicstl.js')
		
		//theme -->
		loadScript(includeDir + 'extjs/' + 'options-toolbar.js');
		//codemirror -->
		loadScript(includeDir + 'CodeMirror/codeeditor.js');
		//Visual three -->
		if (1==1){
			//three -->
			loadScript(includeDir + 'three/js/stl_viewer.min.js');
			//loadScript(includeDir + 'three/js/controls/OrbitControls.js');
			loadScript(includeDir + 'three/js/Detector.js');
			loadScript(includeDir + 'three/js/libs/dat.gui/dat.gui.js');
			//loadScript(includeDir + 'three/dynamic3d.js');		
		}
	
		//Visual calendar gantt-->
		loadScript(dynamicDir + 'dynamiccalendar.js');
		loadScript(dynamicDir + 'dynamicgantt.js');
		loadScript(dynamicDir + 'dynamicscheduler.js');
		//loadScript(dynamicDir + 'dynamictaskboard.js');
	
		//Visual SQLQueryBuilder-->
		loadScript(dynamicDir + 'VisualSQLQueryBuilder.min.js');
	
		//Visual PDF-->
		loadScript(includeDir + 'pdfjs/pdf.js');
		loadScript(includeDir + 'pdfjs/pdf.worker.js');
		loadScript(includeDir + 'pdfjs/viewer.js');
		loadScript(includeDir + 'pdfjs/l10n.js');
		loadScript(includeDir + 'pdfjs/compatibility.js');
		loadScript(dynamicDir + 'dynamicpdf.js');
		
		//Visual XML XSL-->
		loadScript(dynamicDir + 'dynamicxml.js');
		
		//Visual PDF Extract-->
		if (1==1){
			loadScript(includeDir + 'PHPPdfExtractor/jquery.blockUI.js');
			loadScript(includeDir + 'PHPPdfExtractor/jquery.Jcrop.js');
			loadScript(dynamicDir + 'dynamicpdfextract.js');
		}
		
		//Visual JSPlumb-->
		if (1==1){
			loadScript(includeDir + 'jsplumb/jsplumb.browser-ui.cjs.js');
			//loadScript(includeDir + 'go.js');
		}
	}
	
	//PontoJS App Interface
	if (CurrentDeviceType == 'app') {
		loadScript(includeDir + 'ponto.js');
	}
	
})();
