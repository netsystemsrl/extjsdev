<?php 
/**
 * Get all Rect values of all widget annotations from a document
 */
error_reporting(E_ALL | E_STRICT);
header("Content-Type: text/html; charset=utf-8");

// list some files
$files = glob('../../_files/*.pdf');
$files = array_merge($files, glob('../../../_files/pdfs/tektown/*.pdf'));
foreach ($files AS $path) {
	echo '<a href="GetFormFieldInfos.php?f=' . urlencode($path) . '">' . htmlspecialchars(basename($path)) . '</a><br />';
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

for ($pageNo = 1, $pageCount = $pages->count(); $pageNo <= $pageCount; $pageNo++) {
    // get a page instance
	$page = $pages->getPage($pageNo);
    echo '<h1>Page ' . $pageNo . '</h1>';

    // get the annotation helper
	$annotationsHelper = $page->getAnnotations();
	$widgetAnnotations = $annotationsHelper->getAll(SetaPDF_Core_Document_Page_Annotation::TYPE_WIDGET);
    echo '<p>' . count($widgetAnnotations) . ' widget annotations found.</p>';
    /* @var SetaPDF_Core_Document_Page_Annotation_Widget $widgetAnnotation */
	foreach ($widgetAnnotations AS $widgetAnnotation) {
		$fieldName = SetaPDF_Core_Document_Catalog_AcroForm::resolveFieldName(
            $widgetAnnotation->getIndirectObject()->ensure()
        );

        echo $fieldName . ': <pre>';

        $rect = $widgetAnnotation->getRect();
        echo '     llx: ' . $rect->getLlx() . "\n";
        echo '     lly: ' . $rect->getLly() . "\n";
        echo '     urx: ' . $rect->getUrx() . "\n";
        echo '     ury: ' . $rect->getUry() . "\n";
        echo '   width: ' . $rect->getWidth() . "\n";
        echo '  height: ' . $rect->getHeight() . "\n";

        // get the field value
        $value = SetaPDF_Core_Type_Dictionary_Helper::resolveAttribute($widgetAnnotation->getDictionary(), 'V');
        // limited to string values for demonstration purpose
        if ($value instanceof SetaPDF_Core_Type_StringValue) {
            echo '   value: ';
            echo SetaPDF_Core_Encoding::convertPdfString($value->getValue());
        }

        echo "</pre></br>";
	}
}