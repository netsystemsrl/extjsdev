<?php 
/**
 * Get all link annotations with an Uri action from a document
 */
error_reporting(E_ALL | E_STRICT);
header("Content-Type: text/html; charset=utf-8");

// list some files
$files = glob('../../_files/*.pdf');
foreach ($files AS $path) {
	echo '<a href="GetLinkAnnotations.php?f=' . urlencode($path) . '">' . htmlspecialchars(basename($path)) . '</a><br />';
}

if (!isset($_GET['f']) || !in_array($_GET['f'], $files)) {
	die();
}

echo '<br />';

// load and register the autoload function
require_once('../../../../../library/SetaPDF/Autoload.php');

// create a reader
$reader = new SetaPDF_Core_Reader_File($_GET['f']);
// create a document
$document = SetaPDF_Core_Document::load($reader);

// Get the pages helper
$pages = $document->getCatalog()->getPages();

$linksFound = false;
for ($pageNo = 1, $pageCount = $pages->count(); $pageNo <= $pageCount; $pageNo++) {
	$page = $pages->getPage($pageNo);
	$annotationsHelper = $page->getAnnotations();
	$linkAnnotations = $annotationsHelper->getAll(SetaPDF_Core_Document_Page_Annotation::TYPE_LINK);
	foreach ($linkAnnotations AS $linkAnnotation) {
		// $linkAnnotation is an instance of SetaPDF_Core_Document_Page_Annotation_Link
	    $action = $linkAnnotation->getAction();
	    if ($action && $action instanceof SetaPDF_Core_Document_Action_Uri) {
	        echo 'Link Annotation on Page #' . $pageNo . ' - ';
    		echo 'Uri: ' . $action->getUri() . '<br />';
    		$linksFound = true;
			break;
	    }
	}
}

if (false === $linksFound) {
    echo 'No links found!';
}