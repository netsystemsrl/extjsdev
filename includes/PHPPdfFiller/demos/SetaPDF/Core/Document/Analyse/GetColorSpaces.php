<?php
/**
 * This script extracts all color related information from an existing PDF file.
 *
 * The script make use of the SetaPDF_Core_Parser_Content which encapsulate a content stream,
 * process it and call registered callback methods on specific operators.
 *
 * The helper classes are used to handle recursive parsing of PDF structures (Pages/Form XObjects).
 */
error_reporting(E_ALL | E_STRICT);
header("Content-Type: text/html; charset=utf-8");

// list some files
$files = glob('../../_files/*.pdf');
$files = array_merge($files, glob('../../../_files/pdfs/*.pdf'));
$files = array_merge($files, glob('../../../_files/pdfs/tektown/*.pdf'));

foreach ($files AS $path) {
    echo '<a href="GetColorSpaces.php?f=' . urlencode($path) . '">' . htmlspecialchars(basename($path)) . '</a><br />';
}

if (!isset($_GET['f']) || !in_array($_GET['f'], $files)) {
    die();
}

// load and register the autoload function
require_once('../../../../../library/SetaPDF/Autoload.php');

/**
 * Class StreamProcessor
 *
 * This class offer the desired callback methods for the content stream parser
 */
class StreamProcessor
{
    /**
     * @var ColorInspector
     */
    protected $_colorInspector;

    /**
     * @var SetaPDF_Core_Canvas
     */
    protected $_canvas;

    /**
     * @var SetaPDF_Core_Parser_Content
     */
    protected $_parser;

    /**
     * The constructor
     *
     * @param SetaPDF_Core_Canvas $canvas
     * @param ColorInspector $colorInspector
     */
    public function __construct(SetaPDF_Core_Canvas $canvas, ColorInspector $colorInspector)
    {
        $this->_canvas = $canvas;
        $this->_colorInspector = $colorInspector;
    }

    /**
     * Callback for standard color operators
     *
     * @param array $args
     * @param string $operator
     */
    public function _color(array $args, $operator)
    {
        $color = SetaPDF_Core_DataStructure_Color::createByComponents($args);

        $info = 'Standard color operator (' . $operator . ') in content stream.';
        switch (true) {
            case $color instanceof SetaPDF_Core_DataStructure_Color_Rgb:
                $this->_colorInspector->addFoundColor('DeviceRGB', $color, $info);
                return;
            case $color instanceof SetaPDF_Core_DataStructure_Color_Gray:
                $this->_colorInspector->addFoundColor('DeviceGray', $color, $info);
                return;
            case $color instanceof SetaPDF_Core_DataStructure_Color_Cmyk:
                $this->_colorInspector->addFoundColor('DeviceCMYK', $color, $info);
                return;
        }
    }

    /**
     * Callback for color space operators
     *
     * @param array $args
     * @param string $operator
     */
    public function _colorSpace(array $args, $operator)
    {
        $colorSpace = $args[0];
        $colorSpaces = $this->_canvas->getResources(true, false, SetaPDF_Core_Resource::TYPE_COLOR_SPACE);
        if ($colorSpaces && $colorSpaces->offsetExists($colorSpace->getValue())) {
            $colorSpace = $colorSpaces->getValue($colorSpace->getValue());
        }

        $colorSpace = SetaPDF_Core_ColorSpace::createByDefinition($colorSpace);

        $info = 'Color space operator (' . $operator . ') in content stream.';
        $this->_resolveColorSpace($colorSpace, $info);
    }

    /**
     * Helper method to recursily resolve color space and their alternate color spaces
     *
     * @param SetaPDF_Core_ColorSpace $colorSpace
     * @param $info
     */
    protected function _resolveColorSpace(SetaPDF_Core_ColorSpace $colorSpace, $info)
    {
        $this->_colorInspector->addFoundColor($colorSpace->getFamily(), $colorSpace, $info);

        switch (true) {
            case $colorSpace instanceof SetaPDF_Core_ColorSpace_Separation:
                $alternate = $colorSpace->getAlternateColorSpace();
                $info = 'Alternate color space for Separation color space.';
                $this->_resolveColorSpace($alternate, $info);
                break;

            case $colorSpace instanceof SetaPDF_Core_ColorSpace_DeviceN:
                $alternate = $colorSpace->getAlternateColorSpace();
                $info = 'Alternate color space for DeviceN color space.';
                $this->_resolveColorSpace($alternate, $info);
                break;

            case $colorSpace instanceof SetaPDF_Core_ColorSpace_Indexed:
                $base = $colorSpace->getBase();
                $info = 'Base color space for Indexed color space.';
                $this->_resolveColorSpace($base, $info);
                break;

            case $colorSpace instanceof SetaPDF_Core_ColorSpace_IccBased:
                $stream = $colorSpace->getIccProfileStream();
                $alternate = $stream->getAlternate();
                if ($alternate) {
                    $info = 'Alternate color space for ICC profile color space.';
                    $this->_resolveColorSpace($alternate, $info);
                }

                /* See ICC.1:2010 - Table 19 (ICC1v43_2010-12.pdf)
                 */
                $info = 'Color space signature extracted from ICC profile.';
                $colorSpace = $stream->getParser()->getColorSpace();
                $this->_colorInspector->addFoundColor(trim($colorSpace), $stream, $info);
                break;
        }
    }

    /**
     * Callback for painting a XObject
     *
     * @param $args
     */
    public function _paintXObject($args)
    {
        $name = $args[0]->getValue();
        $xObjects = $this->_canvas->getResources(true, false, SetaPDF_Core_Resource::TYPE_X_OBJECT);

        if ($xObjects === false) {
            return;
        }

        $xObjectIndirectObject = $xObjects->getValue($name);
        if (!($xObjectIndirectObject instanceof SetaPDF_Core_Type_IndirectReference)) {
            return;
        }

        $xObject = SetaPDF_Core_XObject::get($xObjectIndirectObject);
        if ($xObject instanceof SetaPDF_Core_XObject_Image) {
            $dict = $xObject->getIndirectObject()->ensure()->getValue();
            if ($dict->offsetExists('ImageMask') && $dict->getValue('ImageMask')->ensure()->getValue() == true) {
                return;
            }

            $colorSpace = $xObject->getColorSpace();
            $info = 'Color space of an image used in a content stream.';
            $this->_resolveColorSpace($colorSpace, $info);

        } elseif ($xObject instanceof SetaPDF_Core_XObject_Form) {

            /* We got a Form XObject - start recusrive processing
             */
            $streamProcessor = new self($xObject->getCanvas(), $this->_colorInspector);
            $streamProcessor->process();
        }
    }

    /**
     * Callback for inline image operator
     *
     * @param $args
     */
    public function _startInlineImageData($args)
    {
        $dict = new SetaPDF_Core_Type_Dictionary();

        for ($i = 0; $i < count($args); $i += 2) {
            $dict[$args[$i]] = $args[$i + 1];
        }

        $colorSpace = $dict->offsetExists('CS') ? $dict->getValue('CS') : $dict->getValue('ColorSpace');
        if (null === $colorSpace) {
            return;
        }

        $colorSpace = $colorSpace->getValue();

        switch ($colorSpace) {
            case 'G':
                $colorSpace = 'DeviceGray';
                break;
            case 'RGB':
                $colorSpace = 'DeviceRGB';
                break;
            case 'CMYK':
                $colorSpace = 'DeviceCMYK';
                break;
            case 'I':
                $colorSpace = 'Indexed';
                break;
        }

        $info = 'Color space of an inline image in content stream.';
        $this->_colorInspector->addFoundColor($colorSpace, SetaPDF_Core_ColorSpace::createByDefinition($colorSpace), $info);
    }

    /**
     * Process the content stream
     */
    public function process()
    {
        $this->_parser = new SetaPDF_Core_Parser_Content($this->_canvas->getStream());

        /* Register colorspace operators
         * f.g. -> /DeviceRGB CS   % Set DeviceRGB colour space
         */
        $this->_parser->registerOperator(
            array('CS', 'cs'),
            array($this, '_colorSpace')
        );

        /* Register default color space operators
         */
        $this->_parser->registerOperator(
            array('G', 'g', 'RG', 'rg', 'K', 'k'),
            array($this, '_color')
        );

        /* Register draw operator for XObjects
         */
        $this->_parser->registerOperator('Do', array($this, '_paintXObject'));

        /* Inline image
         */
        $this->_parser->registerOperator('ID', array($this, '_startInlineImageData'));

        $this->_parser->process();
    }
}

/**
 * Class ColorInspector
 */
class ColorInspector
{
    /**
     * @var SetaPDF_Core_Document
     */
    protected $_document;

    /**
     * All found color definitions
     *
     * @var array
     */
    protected $_colors = array();

    /**
     * Information about the currently processed "location"
     *
     * @var string
     */
    protected $_currentLocation;

    /**
     * The constructor
     *
     * @param SetaPDF_Core_Document $document
     */
    public function __construct(SetaPDF_Core_Document $document)
    {
        $this->_document = $document;
    }

    /**
     * Get all used colors
     *
     * @param bool $processAnnotations Set to false to ignore color definitions in annotation appearance streams
     * @param null|integer $maxPages The maximum of pages to process
     * @return array
     */
    public function getColors($processAnnotations = true, $maxPages = null)
    {
        $pages = $this->_document->getCatalog()->getPages();

        $pageCount = $pages->count();
        $maxPages = $maxPages === null ? $pageCount : min($maxPages, $pageCount);

        for ($pageNo = 1; $pageNo <= $maxPages; $pageNo++) {
            $this->_currentLocation = 'Page ' . $pageNo;

            $page = $pages->getPage($pageNo);
            $canvas = $page->getCanvas();
            $streamProcessor = new StreamProcessor($canvas, $this);
            $streamProcessor->process();

            if (false == $processAnnotations)
                continue;

            $annotations = $page->getAnnotations();
            $allAnnotations = $annotations->getAll();
            foreach ($allAnnotations AS $annotation) {
                $dict = $annotation->getDictionary();
                $ap = $dict->getValue('AP');
                if (null === $ap)
                    continue;

                $this->_currentLocation = 'Annotation (' . $dict->getValue('Subtype')->getValue() . ') on Page ' . $pageNo;

                foreach ($ap AS $type => $value) {
                    $object = $value->ensure();
                    if ($object instanceof SetaPDF_Core_Type_Stream) {
                        $streamProcessor = new StreamProcessor($annotation->getAppearance($type)->getCanvas(), $this);
                        $streamProcessor->process();

                    } elseif ($object instanceof SetaPDF_Core_Type_Dictionary) {
                        foreach ($object AS $subType => $subValue) {
                            $subOject = $subValue->ensure();
                            if ($subOject instanceof SetaPDF_Core_Type_Stream) {
                                $streamProcessor = new StreamProcessor($annotation->getAppearance($type, $subType)->getCanvas(), $this);
                                $streamProcessor->process();
                            }
                        }
                    }
                }
            }
        }

        return $this->_colors;
    }

    /**
     * A method which will register found color definitions.
     *
     * @param $colorSpace
     * @param null $data
     * @param null $info
     */
    public function addFoundColor($colorSpace, $data = null, $info = null)
    {
        $this->_colors[] = array(
            'colorSpace' => $colorSpace,
            'data' => $data,
            'info' => $info,
            'location' => $this->_currentLocation,
        );
    }
}

echo '<h1>' . basename($_GET['f']) . '</h1>';

$document = SetaPDF_Core_Document::loadByFilename($_GET['f']);
$inspector = new ColorInspector($document);
$colors = $inspector->getColors();

echo "<pre>";
if (count($colors) === 0) {
    echo 'No color definitions found.';
    exit();
}

$allColorSpaces = array();
foreach ($colors AS $color) {
    $allColorSpaces[$color['colorSpace']] = $color['colorSpace'];
}

echo 'Color space(s) found: ' . join(', ', $allColorSpaces);
echo '<br /><br />';

foreach ($colors AS $color) {
    echo $color['colorSpace'] . ': ';
    echo get_class($color['data']) . '<br />';

    echo '    ' . $color['location'] . '<br />';
    echo '    ' . $color['info'] . '<br />';
}
