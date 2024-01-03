<?php
/**
 * This demo adds two pushbuttons to an existing document.
 * A SubmitForm action is add to the button so that the field values are send via HTTP post
 * to this script.
 *
 * The snd pushbutton triggers a javascript which fills out the form fields with random data.
 *
 * !!!!!! THIS DEMO ONLY WORKS WITH A PROPER INSTALLED ACROBAT (READER) PLUGIN IN YOUR BROWSER !!!!!!!
 */
date_default_timezone_set('Europe/Berlin');
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', 1);

// Output the PDF file
if (isset($_GET['pdf'])) {
    // load and register the autoload function
    require_once('../../../../../../../../library/SetaPDF/Autoload.php');

    require_once('Pushbutton.php');

    // $pdfFile = '../../../../../../_files/pdfs/tektown/Order-Form.pdf';
    $pdfFile = '../../../../../../_files/pdfs/tektown/Subscription-tekMag.pdf';

    $writer = new SetaPDF_Core_Writer_Http('Add.pdf', true);
    $document = SetaPDF_Core_Document::loadByFilename($pdfFile, $writer);

    // let's get the page to which we want to add the button to
    $pages = $document->getCatalog()->getPages();
    $page = $pages->getPage(1);

    $width = 100;
    $height = 20;
    // right top
    $x = $page->getCropBox()->getUrx() - $width - 5;
    $y = $page->getCropBox()->getUrY() - $height - 5;

    // Create a pushbutton instance
    $pb = new Pushbutton(array($x, $y, $x + $width, $y + $height), 'submit btn', $document);
    $pb->setCaption('Submit');
    $pb->setFontSize(12);
    $pb->setTextColor(array(0));
    $font = SetaPDF_Core_Font_Standard_Helvetica::create($document);
    $pb->setFont($font);

    // Define the border and style
    $pb->getBorderStyle(true)
        ->setWidth(1)
        ->setStyle(SetaPDF_Core_Document_Page_Annotation_BorderStyle::BEVELED);

    // Set some appearance characteristics
    $pb->getAppearanceCharacteristics(true)
        ->setBorderColor(array(.6))
        ->setBackgroundColor(array(.9));

    // Create a SubmitForm action
    $target = 'http' . (isset($_SERVER['HTTPS']) ? 's' : '') . '://' . $_SERVER['HTTP_HOST'] . $_SERVER['SCRIPT_NAME'];
    $action = new SetaPDF_Core_Document_Action_SubmitForm($target);
    $action->setFlags(
        SetaPDF_Core_Document_Action_SubmitForm::FLAG_EXPORT_FORMAT | /* HTTP POST */
        SetaPDF_Core_Document_Action_SubmitForm::FLAG_INCLUDE_NO_VALUE_FIELDS /* Send also empty fields */
    );
    // Attach the action to the button
    $pb->setAction($action);

    // Let's add the button to the pages annotation and the AcroForm array
    $acroForm = $document->getCatalog()->getAcroForm();
    $fields = $acroForm->getFieldsArray(true);
    $annotations = $page->getAnnotations();

    $fields->push($annotations->add($pb));

    // Add a snd button whcih fills out the form with dummy values

    // left top
    $x = $page->getCropBox()->getLlx() + 5;
    $y = $page->getCropBox()->getUrY() - $height - 5;

    $pb = new Pushbutton(array($x, $y, $x + $width, $y + $height), 'submit btn', $document);
    $pb->setCaption('Set values');
    $pb->setFontSize(12);
    $pb->setTextColor(array(0));
    $pb->setFont($font);

    // Define the border and style
    $pb->getBorderStyle(true)
        ->setWidth(1)
        ->setStyle(SetaPDF_Core_Document_Page_Annotation_BorderStyle::BEVELED);

    // Set some appearance characteristics
    $pb->getAppearanceCharacteristics(true)
        ->setBorderColor(array(.6))
        ->setBackgroundColor(array(.9));

    $javaScript = '
var nFields = this.numFields;
var t = app.thermometer;
t.duration = nFields;
t.begin();
var name, field;
for (var i = 0; i < nFields; i++) {
    name = this.getNthFieldName(i);
    field = this.getField(name);
    switch (field.type) {
        case "text":
            field.value = name + " " + Math.floor(Math.random() * 10);
            break;
        case "checkbox":
            field.checkThisBox(0);
            break;
        case "radiobutton":
            var values = field.exportValues;
            field.value = values[Math.floor(Math.random() * (values.length - 1))];
            break;
    }

    t.value = i;
}
t.end();
    ';
    $action = new SetaPDF_Core_Document_Action_JavaScript($javaScript);
    $pb->setAction($action);

    $fields->push($annotations->add($pb));

    // send the document to the client
    $document->save()->finish();
    die();
}

?>
<embed src="<?php echo $_SERVER['SCRIPT_NAME'] . '?pdf=1'; ?>" width="49%" height="99%" style="float: left;" type="application/pdf" />

<?php

if (count($_POST) > 0) {
    echo '<pre style="display:block; width:49%;float: left;">';
    print_r($_POST);
    echo '</pre>';
}

?>
