<?php
/**
 * Displays information about a font in a document
 */
error_reporting(E_ALL | E_STRICT);
header("Content-Type: text/html; charset=utf-8");

// list some files
$files = glob('../../_files/*.pdf');
$files = array_merge($files, glob('../../../_files/pdfs/*.pdf'));
$files = array_merge($files, glob('../../../_files/pdfs/lenstown/*.pdf'));
foreach ($files AS $path) {
    echo '<a href="GetFonts.php?f=' . urlencode($path) . '">' . htmlspecialchars(basename($path)) . '</a><br />';
}

if (!isset($_GET['f']) || !in_array($_GET['f'], $files)) {
    die();
}

// load and register the autoload function
require_once('../../../../../library/SetaPDF/Autoload.php');

class FontInspector
{
    /**
     * @var SetaPDF_Core_Document
     */
    protected $_document;

    /**
     * All found font references
     */
    public $fonts = array();

    /**
     * The constructor
     *
     * @param $path
     */
    public function __construct($path)
    {
        $this->_document = SetaPDF_Core_Document::loadByFilename($path);
    }

    /**
     * Resolves all indirect objects of fonts in the document
     *
     * @return array
     */
    public function resolveFonts()
    {
        $pages = $this->_document->getCatalog()->getPages();
        for ($pageNo = 1, $pageCount = $pages->count(); $pageNo <= $pageCount; $pageNo++) {
            $page = $pages->getPage($pageNo);
            $this->_resolveFonts($page);

            // Fonts from annotations / appearance streams
            $annotations = $page->getAnnotations()->getAll();
            foreach ($annotations AS $annotation) {
                $dict = $annotation->getDictionary();
                $ap = $dict->getValue('AP');
                if (null === $ap)
                    continue;

                foreach ($ap AS $type => $value) {
                    $object = $value->ensure();
                    if ($object instanceof SetaPDF_Core_Type_Stream) {
                        $this->_resolveFonts($annotation->getAppearance($type));

                    } elseif ($object instanceof SetaPDF_Core_Type_Dictionary) {
                        foreach ($object AS $subType => $subValue) {
                            $subObject = $subValue->ensure();
                            if ($subObject instanceof SetaPDF_Core_Type_Stream) {
                                $this->_resolveFonts($annotation->getAppearance($type, $subType));
                            }
                        }
                    }
                }
            }
        }

        // DR entry in AcroForm dictionary
        $acroForm = $this->_document->getCatalog()->getAcroForm();
        $dict = $acroForm->getDictionary(false);
        if ($dict) {
            $dr = $dict->getValue('DR');
            if ($dr && $dr->ensure()->offsetExists('Font')) {
                $fonts = $dr->ensure()->getValue('Font')->ensure();
                $this->_remFonts($fonts);
            }
        }

        return $this->fonts;
    }

    /**
     * Walks through an dictionary and saves the found font object references
     *
     * @param SetaPDF_Core_Type_Dictionary $fonts
     */
    protected function _remFonts(SetaPDF_Core_Type_Dictionary $fonts)
    {
        foreach ($fonts AS $fontIndirectObject) {
            $key = $fontIndirectObject->getObjectId() . '-' . $fontIndirectObject->getGen();
            if (isset($this->fonts[$key]))
                continue;

            $this->fonts[$key] = $fontIndirectObject;
        }
    }

    /**
     * Resolves the fonts of a page or xobject
     *
     * @param SetaPDF_Core_Document_Page|SetaPDF_Core_XObject_Form $object
     */
    protected function _resolveFonts($object)
    {
        $fonts = $object->getCanvas()->getResources(true, false, SetaPDF_Core_Resource::TYPE_FONT);
        if ($fonts) {
            $this->_remFonts($fonts);
        }

        $xObjects = $object->getCanvas()->getResources(true, false, SetaPDF_Core_Resource::TYPE_X_OBJECT);
        if (!$xObjects)
            return;

        foreach ($xObjects AS $xObjectIndirectObject) {
            $dict = $xObjectIndirectObject->ensure()->getValue();
            if ($dict->getValue('Subtype')->getValue() !== 'Form') {
                continue;
            }

            $xObject = SetaPDF_Core_XObject::get($xObjectIndirectObject);
            $this->_resolveFonts($xObject);
        }
    }

    /**
     * Checks if a font program is embedded
     *
     * @param SetaPDF_Core_Font $font
     *
     * @return bool
     * @throws SetaPDF_Exception_NotImplemented
     */
    public function isFontEmbedded(SetaPDF_Core_Font $font)
    {
        $dict = $font->getIndirectObject($this->_document)->ensure();

        switch ($font->getType()) {
            case 'Type1':
            case 'TrueType':
            case 'MMType1':
                $fontDescriptor = $dict->getValue('FontDescriptor');
                if (null === $fontDescriptor)
                    return false;

                $fontDescriptor = $fontDescriptor->ensure();

                foreach (array('FontFile', 'FontFile2', 'FontFile3') AS $key) {
                    $fontFile = $fontDescriptor->getValue($key);
                    if ($fontFile && $fontFile->ensure() instanceof SetaPDF_Core_Type_Stream)
                        return true;
                }

                return false;

            case 'Type0':
                $descendantFonts = $dict->getValue('DescendantFonts');
                if (null === $descendantFonts)
                    return false;

                $descendantFonts = $descendantFonts->ensure();
                // PDF supports only a single descendant, which shall be a CIDFont.
                $cidfont = $descendantFonts->offsetGet(0);
                if (!$cidfont)
                    return false;

                $cidfont = $cidfont->ensure();

                $fontDescriptor = $cidfont->getValue('FontDescriptor');
                if (null === $fontDescriptor)
                    return false;

                $fontDescriptor = $fontDescriptor->ensure();

                foreach (array('FontFile', 'FontFile2', 'FontFile3') AS $key) {
                    $fontFile = $fontDescriptor->getValue($key);
                    if ($fontFile && $fontFile->ensure() instanceof SetaPDF_Core_Type_Stream)
                        return true;
                }

                return false;

            case 'Type3':
                throw new SetaPDF_Exception_NotImplemented('Type3 fonts are not supported.');
        }

    }
}

$fontInspector = new FontInspector($_GET['f']);
$fontObjects = $fontInspector->resolveFonts();

echo '<h1>' . basename($_GET['f']) . '</h1>';
foreach ($fontObjects AS $fontObject) {
    try {
        $font = SetaPDF_Core_Font::get($fontObject);
    } catch (Exception $e) {
        echo $e->getMessage();
        continue;
    }

    echo 'Font name: <b>' . $font->getFontName() . '</b> (' . $font->getType() . ')<br />';
    echo 'Embedded: ' . ($fontInspector->isFontEmbedded($font) ? 'yes' : 'no');
    echo '<br /><br />';
}
