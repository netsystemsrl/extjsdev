<?php

	error_reporting(E_ALL); 
	ini_set('display_startup_errors', 1);
	ini_set('display_errors', 1);
	error_reporting(-1);
	/*	
		file_put_contents("logAPI.txt","\n" .  $api . "\n", FILE_APPEND);
		file_put_contents("logAPI.txt", $_SERVER['REQUEST_URI']. "\n", FILE_APPEND);
		ob_start(); 		var_dump($_GET); 		$result = ob_get_clean();
		file_put_contents("logAPI.txt", $result . "\n", FILE_APPEND);
		ob_start(); 		var_dump($_POST); 		$result = ob_get_clean();
		file_put_contents("logAPI.txt", $result . "\n", FILE_APPEND);
		ob_start(); 		var_dump($_SERVER); 		$result = ob_get_clean();
		file_put_contents("logAPI.txt", $result . "\n", FILE_APPEND);
		ob_start(); 		var_dump($_FILES); 		$result = ob_get_clean();
		file_put_contents("logAPI.txt", $result . "\n", FILE_APPEND);
	*/	

	
	/*direct link  API*/
	if (isset($_POST["api"]) || isset($_GET["api"])) {
		$api   = '';
		$api   = isset($_POST["api"])   ? $_POST["api"]   : $api;
		$api   = isset($_GET["api"])    ? $_GET["api"]    : $api;
		
		$api   = 'API' . $api;
		$url  = $_SERVER['DOCUMENT_ROOT'].'/includes/io/' . $api . '.php';
		require ( $url);
		die();
	}

	/*autologin GET POST*/
	if (isset($_POST) || isset($_GET)) {
		if (
			((isset($_POST["username"]) || isset($_GET["username"]))) &&
			((isset($_POST["password"]) || isset($_GET["password"]))) &&
			((isset($_POST["dbname"]) || isset($_GET["dbname"])))
			) {
			$dbname   = '';
			$dbname   = isset($_POST["dbname"])   ? $_POST["dbname"]   : $dbname;
			$dbname   = isset($_GET["dbname"])    ? $_GET["dbname"]    : $dbname;
				
			$username = '';
			$username = isset($_POST["username"]) ? $_POST["username"] : $username;
			$username = isset($_GET["username"])  ? $_GET["username"]  : $username;
			
			$password = '';
			$password = isset($_POST["password"]) ? $_POST["password"] : $password;
			$password = isset($_GET["password"])  ? $_GET["password"]  : $password;
			
			require ($_SERVER['DOCUMENT_ROOT'].'/includes/io/LoginAuth.php');
			//if ($output['failure'] = true) //bho
		}
	}
	
	/*autologin COOKIE */
	if ((isset($_COOKIE['LOGIN'])) && (isset($_COOKIE['PASSWORD'])) && (isset($_COOKIE['DBNAME']))) {
		$dbname = $_COOKIE['DBNAME'];
		$username = $_COOKIE['LOGIN'];
		$password = $_COOKIE['PASSWORD'];
		
		require ($_SERVER['DOCUMENT_ROOT'].'/includes/io/LoginAuth.php');
		//if ($output['failure'] = true) //bho
	}
	
	/*
	$urlArray = parse_url($_SERVER['REQUEST_URI']);
	$urlArray = (isset($_SERVER['HTTPS']) ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
	$urlPath = str_replace('/', '', $urlArray['path']);
	//file_put_contents("logAPI.txt","URLPATH" . $urlPath, FILE_APPEND);
	if (($urlPath != '') && (strrpos($urlPath, ".php") === false)){
		$api   = "API" . $urlPath;
		file_put_contents("logAPI.txt","\n" . 'APIDIRECT API' . $api . "\n", FILE_APPEND);
		ob_start();
		file_put_contents("logAPI.txt",$_SERVER['DOCUMENT_ROOT'].'/includes/io/' . $api . '.php', FILE_APPEND);
		require ($_SERVER['DOCUMENT_ROOT'].'/includes/io/' . $api . '.php');
		$grabbed_information = ob_get_contents();
		file_put_contents("logAPI.txt",$grabbed_information, FILE_APPEND);
		die();
	}
	*/
	
	header('Cache-Control: max-age=3600');
?><!DOCTYPE HTML>
<html>
	<head>
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1" />
		<meta http-equiv="Cache-control" content="public">
		<!-- ** <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests"> ** -->
		
		<meta http-equiv="expires" content="no-cache" />
		<meta http-equiv="Cache-Control" content="no-store" />
		
		<meta http-equiv="origin-trial" content="AoaA8oeZc+dulFYaFohlxBTyHL8Ae2zK+sM982QQ/Mk4EB/mLYS4UfnLObne0/Pe7Mj+oW/S895ypZPeRZSjWgcAAABaeyJvcmlnaW4iOiJodHRwczovL2dlcW8uaXQ6NDQzIiwiZmVhdHVyZSI6IlNlcmlhbCIsImV4cGlyeSI6MTYwNzYyMDc0NiwiaXNTdWJkb21haW4iOnRydWV9">
		
		<!-- <meta http-equiv="expires" content="never"/>-->
		<meta http-equiv="content-language" content="it"/>
		<meta lang="it" />
		
		<!-- <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"> -->
		<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes" />
		
		<meta name="mobile-web-app-capable" content="yes">
		
		 
		<!-- Meta Tag Specifici per iOS -->
		<link rel="apple-touch-icon" href="/repositorycom/icon-192x192.png">
		<meta name="apple-mobile-web-app-capable" content="yes"> 
		<meta name="apple-mobile-web-app-status-bar-style" content="black">
		<meta name="apple-mobile-web-app-title" content="GeQo">
		 
 
		<!-- Meta Tag Specifici per OS Windows -->
		<meta name="application-name" content="GeQo" />
		<meta name="msapplication-TileImage" content="/repositorycom/icon-192x192.png"> 
		<meta name="msapplication-TileColor" content="#cc194b">

		<link rel="manifest" href="manifest.json">
		<meta name="format-detection" content="telephone=no" />
		
		<title>GeQo</title>
		
		<!-- ** Ext CSS	** -->
		<style type="text/css">
			.ticket {
				width: 16px;
				height: 16px;
				background-image: url('https://cdn4.iconfinder.com/data/icons/pretty-office-part-4-shadow-style/16/My-tickets.png') !important;
			}

			.icon2 {
				background-color: #FF9999;
				width: 15px;
				height: 15px;
				background-image: url('https://cdn2.iconfinder.com/data/icons/amazon-aws-stencils/100/Storage__Content_Delivery_Amazon_S3_Bucket_with_Objects-16.png') !important;
			}
			
			.x-hidden-node {display: none !important;}
			.shift10 {margin-left: 10px;}
			.bolder {font-weight: bold;}
			.bold {border-bottom: 1px solid #ddd;}
			
			
			.toolbal-label-style {
				font-weight: bold; 
				border: 1px solid red;
				text-align:center;
			}
			.custom-grid .x-grid-cell {
				height: 50px;
				font-size: 130%;
			}
			.custom-grid .x-column-header-inner {
				font-size: 130%;
			}
			.wrap .x-grid-cell-inner {
				white-space: normal;
			}
			.x-ux-plugin-afterlabelinfo {
				display: inline-block;
				margin-left: 5px;
				width: 12px;
				height: 12px;
				background-image: url(img/info-after.png) !important;
			}

			/* Custom CSS for the rhombus-shaped button */
			.rhombus-button {
				background-color: #007bff; /* Button background color */
				transform: rotate(45deg); /* Rotate the square button to make it a rhombus */
				border: none;
				color: white; /* Button text color */
			}
			.parallelogram-button {
				background-color: #007bff; /* Button background color */
				color: white; /* Button text color */
				border: none;
				transform: skewX(-20deg); /* Skew the button horizontally to create a parallelogram */
			}
			
			/*RED*/
			.fa-red {
				color: red !important;
			}
			.fa-red:hover {
				background-color: red  !important;
			}
			.fa-red .x-treelist-item-text,
			.fa-red .x-treelist-item-expander,
			.fa-red .x-treelist-item-icon {
				color: red !important;
			}
			.fa-red:hover .x-treelist-item-text,
			.fa-red:hover .x-treelist-item-expander,
			.fa-red:hover .x-treelist-item-icon {
				color: white !important;
			}
			
			/*BLUE*/
			.fa-blue {
				color: blue !important;
			}
			.fa-blue:hover {
				background-color: blue !important;
			}
			.fa-blue .x-treelist-item-text,
			.fa-blue .x-treelist-item-expander,
			.fa-blue .x-treelist-item-icon {
				color: blue !important;
			}
			.fa-blue:hover .x-treelist-item-text,
			.fa-blue:hover .x-treelist-item-expander,
			.fa-blue:hover .x-treelist-item-icon {
				color: white !important;
			}
			
			/*GREEN*/
			.fa-green {
				color: green !important;
			}
			.fa-green:hover {
				background-color: green !important;
			}
			.fa-green .x-treelist-item-text,
			.fa-green .x-treelist-item-expander,
			.fa-green .x-treelist-item-icon {
				color: green !important;
			}
			.fa-green:hover .x-treelist-item-text,
			.fa-green:hover .x-treelist-item-expander,
			.fa-green:hover .x-treelist-item-icon {
				color: white !important;
			}
			
			/*BLACK*/
			.fa-black {
				color: black !important;
			}
			.fa-black:hover {
				background-color: black !important;
			}
			.fa-black .x-treelist-item-text,
			.fa-black .x-treelist-item-expander,
			.fa-black .x-treelist-item-icon {
				color: black !important;
			}
			.fa-black:hover .x-treelist-item-text,
			.fa-black:hover .x-treelist-item-expander,
			.fa-black:hover .x-treelist-item-icon {
				color: white !important;
			}
			
			/*GRAY*/
			.fa-gray {
				color: gray !important;
			}
			.fa-gray:hover {
				background-color: gray !important;
			}
			.fa-gray .x-treelist-item-text,
			.fa-gray .x-treelist-item-expander,
			.fa-gray .x-treelist-item-icon {
				color: gray !important;
			}
			.fa-gray:hover .x-treelist-item-text,
			.fa-gray:hover .x-treelist-item-expander,
			.fa-gray:hover .x-treelist-item-icon {
				color: white !important;
			}
			
			/*ORANGE*/
			.fa-orange {
				color: orange !important;
			}
			.fa-orange:hover {
				background-color: orange !important;
			}
			.fa-orange .x-treelist-item-text,
			.fa-orange .x-treelist-item-expander,
			.fa-orange .x-treelist-item-icon {
				color: orange !important;
			}
			.fa-orange:hover .x-treelist-item-text,
			.fa-orange:hover .x-treelist-item-expander,
			.fa-orange:hover .x-treelist-item-icon {
				color: white !important;
			}
		</style>
		
		<!-- ** Weather CSS	** -->
		<style type="text/css">
					
			.component__weather-box {
				width: auto;
				overflow: hidden;
			}
			
			.component__weather-content {
				position: relative;
				overflow: hidden;
				color: #fff;
				background: #E06B4F;
				height: 120px;
			}
			
			
			.weather-content__overview {
				width: 50%;
				text-align: center;
				display: inline-block;
				float: left;
				z-index: 2;
				position: relative;
			}
			
			.weather-content__temp {
				width: 50%;
				z-index: 2;
				text-align: center;
				float: left;
				font-size: 50px;
				text-align: center;
				margin-top: 0.5em;
				position: relative;
				vertical-align: middle;
			}
			
			.weather-content__temp .degrees {
				line-height: 40px;
			}
			
			.weather-content__temp .wi-degrees {
				margin-left: -10px;
				vertical-align: top !important;
			}
			
			.currentTemp .wi {
				margin-right: 20px;
				font-size: 40px;
				vertical-align: baseline;
			}
			
			.component__forecast-box {
				display: flex;
			}
			
			.forecast__item {
				flex: 1;
				text-align: center;
			}
			
			.forecast-item__heading {
				background: #e68872;
				border: 1px solid #d64826;
				border-left: none;
				text-transform: uppercase;
				color: #fff;
				font-weight: 800;
				padding: 10px;
				margin: 0 auto;
			}
			
			.forecast-item__info {
				background: #fff;
				color: #E06B4F;
				padding-bottom: 10px;
				border-right: 1px solid #d64826;
			}
			
			.forecast-item__info .wi {
				display: block;
				margin: 0 auto;
				font-size: 24px;
				padding: 15px 0;
			}
			
			.forecast-item__info .degrees {
				font-size: 20px;
				line-height: 20px;
			}
			
			.forecast-item__info .degrees .wi-degrees {
				display: inline;
			}
		</style>

		<!-- ** ZOOM IMAGE ** -->
		<style type="text/css">
			.zoomA {
				  width: 600px;
				  height: auto;
				  /* ease | ease-in | ease-out | linear */
				  transition: transform ease-in-out 0.3s;
				}
			.zoomA:hover {
				transform: scale(2);
			}
			.imageZoomCls:hover { 
				height:300px;
				width:300px;
			}
		</style>
		
		<!-- ** LIST VIEW IMAGE ** -->
		<style type="text/css">

			.myGridGallery {
				width: auto;
				flex: 1;
				overflow: auto;
				margin: 10px;
			}

			.myGridGallery_selector {
				float: left;
				margin: 10px;
				background-color: #D0D0D0;
			}
		</style>

		<!-- ** Button  Toobar ** -->
		<style type="text/css">

			.toolBarIcon {
    			/* font-size: 22px !important; */
			}

			.toolBarIconGreen {
				color: green !important;
			}
			
			.toolBarIconRed {
				color: red !important;
			}
		</style>

		<!-- ** Button ** -->
		<style type="text/css">
			.wrap-button .x-btn-button {
				white-space: unset;
				align-items: unset;
				word-wrap: break-word;
				font-weight: bold;
				font-size: 10px;
			}
			
			.key-button .x-btn-button {
				white-space: unset;
				align-items: unset;
				word-wrap: break-word;
				font-weight: bold;
				font-size: 100px;
			}
			.key-button .x-btn-inner {
				overflow: visible;
				font-size: 34px;
				font-weight: bold;
			}
			
			
			.color1-button .x-btn-button {
				white-space: unset;
				align-items: unset;
				word-wrap: break-word;
				font-weight: bold;
				font-size: 100px;
			}
			.color1-button .x-btn-inner {
				font-size: 18px;
				font-weight: bold;
			}
			
			.color2-button .x-btn-button {
				background-color: red !important;
				white-space: unset;
				align-items: unset;
				word-wrap: break-word;
				font-weight: bold;
				font-size: 100px;
			}
			.color2-button .x-btn-inner {
				font-size: 18px;
				font-weight: bold;
			}
			
			.color3-button .x-btn-button {
				background-color: green !important;
				white-space: unset;
				align-items: unset;
				word-wrap: break-word;
				font-weight: bold;
				font-size: 100px;
			}
			.color3-button .x-btn-inner {
				font-size: 18px;
				font-weight: bold;
			}
			
			.color4-button .x-btn-button {
				background-color: Gold !important;
				white-space: unset;
				align-items: unset;
				word-wrap: break-word;
				font-weight: bold;
				font-size: 100px;
			}
			.color4-button .x-btn-inner {
				font-size: 18px;
				font-weight: bold;
			}
			
			.color5-button .x-btn-button {
				background-color: black !important;
				white-space: unset;
				align-items: unset;
				word-wrap: break-word;
				font-weight: bold;
				font-size: 100px;
			}
			.color5-button .x-btn-inner {
				font-size: 18px;
				font-weight: bold;
			}
			
			.color6-button .x-btn-button {
				background-color: orange !important;
				white-space: unset;
				align-items: unset;
				word-wrap: break-word;
				font-weight: bold;
				font-size: 100px;
			}
			.color6-button .x-btn-inner {
				font-size: 18px;
				font-weight: bold;
			}
			
			.color7-button .x-btn-button {
				background-color: Olive !important;
				white-space: unset;
				align-items: unset;
				word-wrap: break-word;
				font-weight: bold;
				font-size: 100px;
			}
			.color7-button .x-btn-inner {
				font-size: 18px;
				font-weight: bold;
			}
			
			.color8-button .x-btn-button {
				background-color: Purple !important;
				white-space: unset;
				align-items: unset;
				word-wrap: break-word;
				font-weight: bold;
				font-size: 100px;
			}
			.color8-button .x-btn-inner {
				font-size: 18px;
				font-weight: bold;
			}
			
			.color9-button .x-btn-button {
				background-color: SaddleBrown !important;
				white-space: unset;
				align-items: unset;
				word-wrap: break-word;
				font-weight: bold;
				font-size: 100px;
			}
			.color9-button .x-btn-inner {
				font-size: 18px;
				font-weight: bold;
			}
		</style>
		
		<!-- ** Report ** -->
		<style type="text/css">
			body {
				/*padding: 20px;*/
				margin: 0;
				font: 16px/22px "Source Sans Pro", Helvetica, sans-serif;
				font-size-adjust: none;
				font-style: normal;
				font-variant: normal;
				font-weight: normal;
				background: #f4f6ec;
				color: #333;
			}
			.nav-category {
				color: #777;
				font-weight: normal;
				margin-bottom: 0.75em;
			}
			h1, h2, h3 {
				margin: 0;
				padding: 0;
			}

			.report-output {
				background: white;
				border: 1px solid #ccc;
				height: 600px;
				/*height: 100%;*/
			}

			.edit-link {
				font-size: 120%;
				margin-bottom: 10px;
			}

			code.hljs.javascript {
				border-radius: 5px;
				padding: 0.5em 0.85em;
			}
			pre {
				margin: 0;
			}
		</style>
		<style type="text/css">
			#description {
				background: #EFEBE9;
				height: 100%;
			}
			h1 {
				color: #555;
				margin-top: 0;
			}
			#description .padding {
				padding: 20px;
			}
			#description p {
				color: black;
			}
			.x-toolbar-default {
				background: #696969;
			}
			.jsr-report {
				font-size: 12pt;
			}
		</style>
		
		<!-- ** codemirror ** -->	
		<style type="text/css">
			.breakpoints {width: .8em;}
			.breakpoint { color: #822; }
			.lint-error {font-family: arial; font-size: 70%; background: #ffa; color: #a00; padding: 2px 5px 3px; }
			.lint-error-icon {color: white; background-color: red; font-weight: bold; border-radius: 50%; padding: 0 3px; margin-right: 7px;}
			.CodeEditor {border: 1px solid #aaa;}
		</style>
		
		<!-- ** keypad ** -->	
		<style type="text/css">
			.nmpd-grid {
				opacity: .9;
				position: fixed;
				left: 50%;
				top: 50%;
				z-index: 999999 !important;
				-khtml-user-select: none;
				padding: 10px;
				width: initial;
				background-color: white;
				border: 1px solid black;
			}	
			.nmpd-overlay {
				opacity: .5;
				position: fixed;
				top: 0;
				right: 0;
				bottom: 0;
				left: 0;
				z-index: 999998 !important;
				background-color: #000;
			}
			
			.nmpd-grid input {
                width: 98%;
                min-height: 40px;
                font-size: 25px;
			}
			
		    .nmpd-grid button {
                width: 100%;
                min-width: 40px;
                min-height: 40px;
                font-size: 20px;
            }
		</style>
		
		<!-- ** range wms  ** -->	
		<style type="text/css">
			.x-slider-range .x-slider-thumb,
			.x-slider-range .x-slider-thumb.x-slider-thumb-over,
			.x-slider-range .x-slider-thumb.x-slider-thumb-drag  {
				cursor: pointer;
				height: 68px;
				width: 25px;
				background-position: 5px;
				background-image:url(/repositorycom/slider-thumb.png);
				z-index: 10000;
			}
			.x-masked .x-slider-range .x-slider-thumb {
				z-index: 1;
			}

			.x-slider-range .x-slider-horz,
			.x-slider-range .x-slider-horz .x-slider-end,
			.x-slider-range .x-slider-horz .x-slider-inner {
				height: 28px;

				background-image: none;
				background-color: #eee;
				text-align: center;

			}

			.x-slider-range .x-slider-thumb.x-item-disabled,
			.x-slider-range .x-slider-thumb.x-slider-thumb-over.x-item-disabled,
			.x-slider-range .x-slider-thumb.x-slider-thumb-drag.x-item-disabled {
				background-position: 8px -25px !important;
				/*background-size: 1px auto;*/
				/*background-image:url(slider-thumb-disabled.png);*/
				cursor: default;
			}

			.x-slider-range.x-item-disabled .x-slider.x-form-field {
				opacity: 1;
				filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);
			}

			.x-slider-range .x-slider-range-header-odd,
			.x-slider-range .x-slider-range-header-even {
				position: absolute;
				height: 28px;
				line-height: 28px;
				background-color:#eee;
				text-align: center;
				font-weight: bold;
				margin-left: 9px;
				overflow: hidden;
				/*border: 1px red solid;*/
			}

			.x-slider-range .x-slider-range-header-even {
				background-color:#ccc;

			}
		</style>
		
		<!-- ** pos ** -->	
		<style type="text/css">
			.my_btn .x-btn-inner{
				color:red;
				font-size:15px;
				font-weight:bold;
			}
		</style>
				<!-- Gallery -->
		<style>
			.x-dataview-item.x-item-selected > div {
                        	transform: scale(1.03);
                        	transition: ease-in-out .2s;
                        	border: 1px solid red;
			}
		</style>	
				<!-- ExtJSDEV -->

		<script type="text/javascript">
		function initMap() {
		}
		</script>
		<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB8lxl0D4K5WCuudzpvx82qPymSNN-FiiA&libraries=drawing&callback=initMap"></script>
		<script type="text/javascript" src="includes/extjs/include-ext.js"></script>
		<script id="service-worker" data-app="12345" type="text/javascript" src="service-worker.js"></script>
		
		<!--Start of Tawk.to Script-->
		<script type="text/javascript">
        if (CurrentDeviceType == 'app') {
		}
		else if ((CurrentDeviceType == 'tablet') || (CurrentDeviceType == 'phone')) {
		}
		else if (CurrentDeviceType == 'desktop') {
			/**/
			var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
			(function(){
				var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
				s1.async=true;
				s1.src='https://embed.tawk.to/62600e077b967b11798ba215/1g13jdk1r';
				s1.charset='UTF-8';
				s1.setAttribute('crossorigin','*');
				s0.parentNode.insertBefore(s1,s0);
			})();
		}
		</script>
		<!--End of Tawk.to Script <a href="javascript:void(Tawk_API.toggle())"> Click to Chat </a> -->

	</head>
	<body oncontextmenu="return false;">
		<!-- Main 	-->
		<script type="text/javascript" src="main.js?dc=3"></script>
		<!-- ** Chat 
		<script type="text/javascript" src="chat.js"></script>
		 ** -->
		 
		<!-- ** ThemeEditor  
		<script type="text/javascript" src="themeEditor.js"></script>
		<style type="text/css">
			.report-designer-container {
				height: 600px;
				border: 1px solid #aaa;
			}
			.report-designer-container {
				height: 600px;
				border: 1px solid #aaa;
			}
			
			.themeeditor-bordered{
				border: solid 1px red;
			}
		</style>
		** -->
		<!-- serviceWorker 	-->
		<script async>
			window.onload = () => {
				'use strict'; 
				if ('serviceWorker' in navigator) {
					navigator.serviceWorker.register('./service-worker.js');
				}
			}
		</script>
		<div id="west"></div>
		<div id="header"></div>
		<div id="center1"></div>
		<div id="props-panel" style="width:200px;height:200px;overflow:hidden;"></div>
		<div id="footer"></div>
		
	</body>
</html>
