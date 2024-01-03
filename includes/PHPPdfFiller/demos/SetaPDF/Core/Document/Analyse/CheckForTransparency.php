<?php
/**
 * This script extracts information about transparency elements used in a PDF document.
 *
 * It actually checks for:
 *  - an SMask entry (soft-mask image) in image xobjects and graphic states
 *  - the SMaskInData value for JPEG2000 images
 *  - ca and CA values in graphic states
 */
error_reporting(E_ALL | E_STRICT);
header("Content-Type: text/html; charset=utf-8");

// list some files
$files = glob('../../_files/*.pdf');
$files = array_merge($files, glob('../../../_files/pdfs/*.pdf'));
$files = array_merge($files, glob('../../../_files/pdfs/tektown/*.pdf'));
foreach ($files AS $path) {
    echo '<a href="CheckForTransparency.php?f=' . urlencode($path) . '">' . htmlspecialchars(basename($path)) . '</a><br />';
}

if (!isset($_GET['f']) || !in_array($_GET['f'], $files)) {
    die();
}

// load and register the autoload function
require_once('../../../../../library/SetaPDF/Autoload.php');

class TransparencyInspector
{
    /**
     * @var SetaPDF_Core_Document
     */
    protected $_document;

    /**
     * Information about the currently processed "location"
     *
     * @var string
     */
    protected $_currentLocation = array();

    protected $_elements = array();

    /**
     * The constructor
     *
     * @param SetaPDF_Core_Document $document
     */
    public function __construct(SetaPDF_Core_Document $document)
    {
        $this->_document = $document;
    }

    public function process($processAnnotations = true)
    {
        $this->_elements = array();
        $pages = $this->_document->getCatalog()->getPages();

        for ($pageNo = 1, $pageCount = $pages->count(); $pageNo <= $pageCount; $pageNo++) {
            $this->_currentLocation = 'Page ' . $pageNo;

            $page = $pages->getPage($pageNo);

            $this->_currentLocation = array('Page ' . $pageNo);

            $xObjects = $page->getCanvas()->getResources(true, false, SetaPDF_Core_Resource::TYPE_X_OBJECT);

            if ($xObjects) {
                $this->_processXObjects($xObjects);
            }

            $graphicStates = $page->getCanvas()->getResources(true, false, SetaPDF_Core_Resource::TYPE_EXT_G_STATE);
            if ($graphicStates) {
                $this->_processGraphicStates($graphicStates);
            }
        }

        return $this->_elements;
    }

    protected function _processGraphicStates(SetaPDF_Core_Type_Dictionary $graphicStates)
    {
        $root = $this->_currentLocation;
        foreach ($graphicStates AS $name => $graphicState) {
            $this->_currentLocation = $root;
            $this->_currentLocation[] = 'GraphicState (' . $name . ')';

            $dictionary = $graphicState->ensure();

            if (isset($dictionary['SMask']) && $dictionary->getValue('SMask')->ensure()->getValue() !== 'None') {
                $this->_addTransparentElement('GraphicState', $dictionary, 'Graphic state with SMask entry');
                continue;
            }

            if (isset($dictionary['CA']) && $dictionary->getValue('CA')->getValue() != 1.0) {
                $this->_addTransparentElement(
                    'GraphicState',
                    $dictionary,
                    'Graphic state with "CA" value of ' . sprintf('%.5F', $dictionary->getValue('CA')->getValue())
                );
            }

            if (isset($dictionary['ca']) && $dictionary->getValue('ca')->getValue() != 1.0) {
                $this->_addTransparentElement(
                    'GraphicState',
                    $dictionary,
                    'Graphic state with "ca" value of ' . sprintf('%.5F', $dictionary->getValue('CA')->getValue())
                );
            }
        }

        $this->_currentLocation = $root;
    }

    protected function _processXObjects(SetaPDF_Core_Type_Dictionary $xObjects)
    {
        $root = $this->_currentLocation;
        foreach ($xObjects AS $name => $xObject) {
            $this->_currentLocation = $root;
            $this->_currentLocation[] = 'XObject (' . $name . ')';

            $xObject = SetaPDF_Core_XObject::get($xObject);

            // images
            if ($xObject instanceof SetaPDF_Core_XObject_Image) {
                $dictionary = $xObject->getIndirectObject()->ensure()->getValue();

                /* An image XObject may contain its own soft-mask image in the form of a subsidiary image XObject in the
                 * SMask entry of the image dictionary (see “Image Dictionaries”). This mask, if present, shall override
                 * any explicit or colour key mask specified by the image dictionary’s Mask entry. Either form of mask
                 * in the image dictionary shall override the current soft mask in the graphics state.
                 */
                if (isset($dictionary['SMask'])) {
                    $this->_addTransparentElement('Image', $xObject, 'Image with SMask entry');
                    continue;
                }

                /* An image XObject that has a JPXDecode filter as its data source may specify an SMaskInData entry,
                 * indicating that the soft mask is embedded in the data stream (see “JPXDecode Filter”).
                 */
                if ($dictionary->getValue('Filter')->getValue() === 'JPXDecode') {
                    if (isset($dictionary['SMaskInData']) && $dictionary->getValue('SMaskInData')->getValue() != 0) {
                        $this->_addTransparentElement(
                            'Image',
                            $xObject,
                            'Image with JPXDecode filter and SMaskInData entry'
                        );
                        continue;
                    }
                }

            // form XObjects
            } elseif ($xObject instanceof SetaPDF_Core_XObject_Form) {
                $_xObjects = $xObject->getCanvas()->getResources(true, false, SetaPDF_Core_Resource::TYPE_X_OBJECT);
                if ($_xObjects) {
                    $this->_processXObjects($_xObjects);
                }

                $graphicStates = $xObject->getCanvas()->getResources(true, false, SetaPDF_Core_Resource::TYPE_EXT_G_STATE);
                if ($graphicStates) {
                    $this->_processGraphicStates($graphicStates);
                }
            }
        }
    }

    protected function _addTransparentElement($type, $data, $info)
    {
        $this->_elements[] = array(
            'type' => $type,
            'data' => $data,
            'info' => $info,
            'location' => join(', ', $this->_currentLocation)
        );
    }
}

echo '<h1>' . basename($_GET['f']) . '</h1>';

$document = SetaPDF_Core_Document::loadByFilename($_GET['f']);
$inspector = new TransparencyInspector($document);

$transparencyElements = $inspector->process();

foreach ($transparencyElements as $element) {
    echo 'Type: ' . $element['type'] . '<br />';
    echo 'Info: ' . $element['info'] . '<br />';
    echo 'Location: ' . $element['location'] . '<br />';
    echo 'Data (class name): ' . get_class($element['data']) . '<br />';
    echo "<br />";
}