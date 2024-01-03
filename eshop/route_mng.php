<?php
//https://github.com/nikic/fastroute

function create_routes (){
	global $routes;

	$parsedUrl = parse_url($_SERVER['REQUEST_URI']);
	//var_dump($parsedUrl);
	//var_dump($parsedUrl['path']);
	//var_dump($parsedUrl['query']);
	//$url = $_SERVER['REQUEST_URI'];
	$url = substr($parsedUrl['path'], strlen(BASEROUTE));
	//var_dump($url);
	//$end = end(explode('/', $url));
	//$end = end(explode('/', rtrim($url, '/')));
	//$end =  array_slice(explode('/', rtrim($url, '/')), -1)[0];
	$urlArray = explode('/', rtrim($url, '/'));
	//var_dump($urlArray);
	$count = count($urlArray);
	//var_dump($count);
	if (($count-1) % 3 == 0){
		//la struttura delle url con filtri è sempre composto da multipli di 3 secondo la logica VoceMenu/DettaglioElemento/IdElemento
		if(($count-1)>3){
			$menuItem = $urlArray[1];
			$param = [
				['el'=>$urlArray[1],'details'=>$urlArray[2],'id'=>$urlArray[3]],
				['el'=>$urlArray[4],'details'=>$urlArray[5],'id'=>$urlArray[6]]
			];
		} else {
			$menuItem = (isset($urlArray[1])) ? $urlArray[1]: false;
			$param = (isset($urlArray[3])) ? $urlArray[3]: false;
		}
	}else if($count == 4 ) {
		//prima parte = form/layout da chiamare
		$menuItem = $urlArray[$count-3];
		//seconda parte = nome dell'elemento da filtrare per il terzo parametro
		//terza parte = parametro di filtro ID lato GEQO
		/*
		$param = array(
			'name' => $urlArray[$count-2],
			'ID' => $urlArray[$count-1]
		);
		*/
		$param = $urlArray[$count-1];
	} else if($count == 3 ) {
		//$urlArray[$count-2] prima parte = form/layout da chiamare
		$menuItem = $urlArray[$count-2];
		//$urlArray[$count-1] seconda parte = parametro di filtro lato GEQO
		$param = $urlArray[$count-1];
	} else {
		//$urlArray[$count-1] = form/layout da chiamare
		$menuItem = $urlArray[$count-1];
	}
	
	//var_dump($menuItem);
	//logInFile($menuItem);

	$routes = array('/' => 'web_page_main');
	if(!empty($menuItem)) {
		//$urlParams = '&node=1000';
		$urlParams = '&query='.$menuItem;
		//$urlParams = '';
		$menuStr = sw_nsextdev_make_curl('menuRead', $urlParams);
		
		//var_dump($menuStr);
		$menuObj = json_decode($menuStr);
		//var_dump($menuObj->enableMenu);

		if(!isset($menuObj->data)) {
			//voce di menù non restituita da codegun
			if(isset($menuObj->enableMenu) && !$menuObj->enableMenu) {
				//voce menu esite ma disabilitata da ACL
				$go_to_url = BASEURL.'Login';
				header('Location: '.$go_to_url);
			} else {
				//voce menu non esiste
				$go_to_url = BASEURL.'Notfound';
				header('Location: '.$go_to_url);
			}
		} else {
			foreach ($menuObj->data as $menuItem) {
				//var_dump($menuItem);
				/*
				$urlParams = '&menuid='.$menuItem->id;
				$menuItemInfoStr = sw_nsextdev_make_curl('menuInfo', $urlParams);
				$menuItemInfoObj  = json_decode($menuItemInfoStr);
				//var_dump($menuItemInfoObj);
				*/
				$urlParams = '&processid='.$menuItem->ctid;
				$menuItemProcStr = sw_nsextdev_make_curl('process', $urlParams);
				$menuItemProcObj  = json_decode($menuItemProcStr);
				//var_dump($menuItemProcObj);
				$routes[$menuItem->text] = $menuItemProcObj->ctid;
				$routes['datawhere'] = (property_exists($menuItemProcObj, 'datawhere')) ? $menuItemProcObj->datawhere : '';
				if(isset($param) && !empty($param)) {
					//aggiunge il secondo parametro alla chiamata a geqo
					//var_dump($param);
					$routes['FILTRO'] = $param;
					//$urlParams = '&layoutid='.$menuItemProcObj->ctid.'&FILTRO='.$param;
					//$boh = sw_nsextdev_make_curl('write', $urlParams);
				}
			}
		}
	}
	//var_dump($routes);
	
	/*ROUTE DEFS*/
	/*
	$routes = array(
		'/' => 'web_main',
		'home' => 'web_main',
		'pagina1' => 'web_primaparte',
		'pagina2' => 'web_secondaparte',
		'pagina3' => 'web_terzaparte',
		'categorie' => 'web_categorie',
		'login' => 'web_login',
	);
	*/

	/*ROUTE MANAGER*/
	require 'vendor/autoload.php';

	//var_dump($_SERVER['DOCUMENT_ROOT']);

	$dispatcher = FastRoute\simpleDispatcher(function(FastRoute\RouteCollector $r) {
		//$r->addRoute('GET', '/users', 'get_all_users_handler');
		// {id} must be a number (\d+)
		//$r->addRoute('GET', '/user/{id:\d+}', 'get_user_handler');
		// The /{title} suffix is optional
		//$r->addRoute('GET', '/articles/{id:\d+}[/{title}]', 'get_article_handler');
		//mg routes
		//$r->addRoute('GET', '/eshop/[{name:.+}]', 'get_page_handler');
		$r->addRoute('GET', '/'.BASEROUTE.'[{name:.+}]', 'get_page_handler');
	});

	//var_dump($dispatcher);

	// Fetch method and URI from somewhere
	$httpMethod = $_SERVER['REQUEST_METHOD'];
	$uri = $_SERVER['REQUEST_URI'];
	//var_dump($uri);

	// Strip query string (?foo=bar) and decode URI
	if (false !== $pos = strpos($uri, '?')) {
		//var_dump(substr($uri, 0, $pos));
		$uri = substr($uri, 0, $pos);
	}
	//var_dump($uri);
	$uri = rawurldecode($uri);
	//var_dump($uri);

	$routeInfo = $dispatcher->dispatch($httpMethod, $uri);
	//var_dump($routeInfo);

	switch ($routeInfo[0]) {
		case FastRoute\Dispatcher::NOT_FOUND:
			// ... 404 Not Found
			break;
		case FastRoute\Dispatcher::METHOD_NOT_ALLOWED:
			$allowedMethods = $routeInfo[1];
			// ... 405 Method Not Allowed
			break;
		case FastRoute\Dispatcher::FOUND:
			$handler = $routeInfo[1];
			$vars = $routeInfo[2];
			// ... call $handler with $vars
			//list($class, $method) = explode("/", $handler, 2);
			//call_user_func_array(array(new $class, $method), $vars);
			call_user_func_array($handler, $vars);
			break;
	}
}

/*TEST ROUTE FUNCTIONS*/
function get_all_users_handler() {
	echo 'qui';
}

function get_page_handler_test($vars) {
	echo 'qua';
	var_dump($vars);
}
