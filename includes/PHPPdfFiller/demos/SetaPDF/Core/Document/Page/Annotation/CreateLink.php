<?php
/**
 * Create a simple document and add a link annotation
 */

date_default_timezone_set('Europe/Berlin');
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', 1);
require_once('../../../../../../library/SetaPDF/Autoload.php');

$document = new SetaPDF_Core_Document(new SetaPDF_Core_Writer_Http());
$pages = $document->getCatalog()->getPages();
$page = $pages->create(SetaPDF_Core_PageFormats::A4);
$canvas = $page->getCanvas();

$font = SetaPDF_Core_Font_Standard_Helvetica::create($document);
$text = new SetaPDF_Core_Text_Block($font, 12);
$text->setText('www.setasign.com');
$x = $page->getWidth() / 2 - $text->getWidth() / 2;
$y = $page->getHeight() - 100;
$text->draw($canvas, $x, $y);

$link = new SetaPDF_Core_Document_Page_Annotation_Link(
    array($x, $y, $x + $text->getWidth(), $y + $text->getHeight()),
    new SetaPDF_Core_Document_Action_Uri('http://www.setasign.com')
);
$page->getAnnotations()->add($link);

$document->save()->finish();

