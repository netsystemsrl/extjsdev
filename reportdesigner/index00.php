<?php 
	session_start(); 
	if (isset($_SESSION['UserId']) === false) header("location: index.php"); 
?>
<!DOCTYPE HTML>
<html>
	<head>
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1" />
		<meta http-equiv="Cache-control" content="public">
		<meta http-equiv="expires" content="never"/>
		<meta http-equiv="content-language" content="it"/>
		<meta lang="it" />
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
		<meta name="apple-mobile-web-app-capable" content="yes" />
		<meta name="apple-mobile-web-app-status-bar-style" content="black" />
		<link rel="apple-touch-icon" href="/repositorycom/logo.png" />
		<meta name="format-detection" content="telephone=no" />
		<title>ExtjsDEV Form Editor</title>
		
		<!-- ** Ext CSS	** -->
		<style>
			.x-hidden-node {display: none !important;}
			.shift10 {margin-left: 10px;}
			.bolder {font-weight: bold;}
			.bold {border-bottom: 1px solid #ddd;}
			
			.circled {
				content:attr(data-letters);
				display:inline-block;
				font-size:1em;
				width:2.5em;
				height:2.5em;
				line-height:2.5em;
				text-align:center;
				border-radius:50%;
				background:plum;
				vertical-align:middle;
				margin-right:1em;
				color:white;
			}
		</style>		
		<!-- ** Loader Page	** -->
		<style type="text/css">
			HTML, BODY { height: 100%; }
			#loading-mask {
				 position: absolute;
				 top: 0;
				 left: 0;
				 width: 100%;
				 height: 100%;
				 z-index: 1;
			}
			#loading {
				 position: absolute;
				 top: 40%;
				 left: 45%;
				 z-index: 2;
			}
			#loading SPAN {
				 background: url('../repositorycom/loader.gif') no-repeat left center;
				 padding: 5px 30px;
				 display: block;
			}
		</style>
		<!-- ** Report ** -->
		<style type="text/css">
			body {
				padding: 20px;
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
				height: 600px;;
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
			.CodeMirror {border: 1px solid #aaa;}
		</style>
		<!-- ** ThemeEditor  ** -->
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
	
		<!-- ** Sencha ExtJS ** -->
		<script type="text/javascript" src="../includes/extjs/include-ext.js"></script>
		<script type="text/javascript" src="../includes/jsreport/highlight.pack.js" ></script>
		
	</head>
	<body oncontextmenu="return false;">
		<!-- Main 	-->
		<script type="text/javascript" src="main.js"></script>
		
		<div id="west"></div>
		<div id="header"></div>
		<div id="center1"></div>
		<div id="props-panel" style="width:200px;height:100;overflow:hidden;"></div>
		<div id="footer"></div>
	</body>
</html>