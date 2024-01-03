<?php
/**
 * This demo combines multiple pages of an existing document on new pages with a predefined grid size.
 *
 * Please notice that this will only work for flat, non-dynamic pdf documents.
 */
error_reporting(E_ALL | E_STRICT);

// list some files
$files = glob('../_files/*.pdf');
$files = array_merge($files, glob('../../_files/pdfs/*.pdf'));
$files = array_merge($files, glob('../../_files/pdfs/tektown/*.pdf'));

if (!isset($_GET['f']) || !in_array($_GET['f'], $files)) {
    header("Content-Type: text/html; charset=utf-8");

    foreach ($files AS $path) {
        $name = basename($path);
        echo '<a href="CombinePages.php?f=' . urlencode($path) . '&perPage=2">';
        echo htmlspecialchars($name);
        echo '</a><br />';
    }

    die();
}

// load and register the autoload function
require_once('../../../../library/SetaPDF/Autoload.php');

$perPage = $_GET['perPage'];

if (($perPage & ($perPage - 1)) != 0) {
    throw new InvalidArgumentException('per page is not a square from 2');
}

$gridSizeShortSide = 1;
$gridSizeLongSide = 1;

// calculate grid size
for ($a = $perPage; $a > 1; $a /= 2) {
    if ($gridSizeShortSide == $gridSizeLongSide) {
        $gridSizeShortSide *= 2;
    } else {
        $gridSizeLongSide = $gridSizeShortSide;
    }
}

// load the original document
$originalDocument = SetaPDF_Core_Document::loadByFilename($_GET['f']);
// get the pages instance of the original document
$originalPages = $originalDocument->getCatalog()->getPages();

$page = $originalPages->getPage(1);

$pageSize = $page->getWidthAndHeight();

$longSide = array_keys($pageSize, max($pageSize))[0];
$shortSide = array_keys($pageSize, min($pageSize))[0];

// create a new writer for the new document
$writer = new SetaPDF_Core_Writer_Http(basename($_GET['f']), true);

// create a new document
$newDocument = new SetaPDF_Core_Document($writer);

// get the pages instance of the new document
$newPages = $newDocument->getCatalog()->getPages();

// store the original page count
$originalPageCount = $originalPages->count();

// determine how many pages need to be generated
$finalPageCount = ceil($originalPageCount / $perPage);

// get the page size according to the orientation and page size
$newPageSize = [
    $shortSide => $pageSize[$shortSide] * $gridSizeShortSide,
    $longSide  => $pageSize[$longSide] * $gridSizeLongSide
];

// create the new pages
for ($newPageNumber = 1; $newPageNumber <= $finalPageCount; $newPageNumber++) {
    // create a new page
    $newPage = $newPages->create($newPageSize, SetaPDF_Core_PageFormats::ORIENTATION_AUTO);

    // prepare an offset to access the pages of the original document
    $pageOffset = ($newPageNumber - 1) * $perPage;

    $pos = [
        $newPageSize[0],
        $pageSize[1]
    ];

    // iterate through the pages of the original document that should be placed onto the new created page
    for (
        $pageCounter = 1;
        $pageOffset + $pageCounter <= $originalPageCount && $pageCounter <= $perPage;
        $pageCounter++
    ) {
        $originalPage = $originalPages->getPage($pageOffset + $pageCounter);

        $xObject = $originalPage->toXObject($newDocument);

        $xObject->draw(
            $newPage->getCanvas(),
            $newPage->getWidth() - $pos[0],
            $newPage->getHeight() - $pos[1],
            $pageSize[0],
            $pageSize[1]
        );

        $pos[0] -= $pageSize[0];
        if ($pos[0] < SetaPDF_Core::FLOAT_COMPARISON_PRECISION) {
            $pos[1] += $pageSize[1];
            $pos[0] = $newPageSize[0];
        }
    }
}

$newDocument->save()->finish();