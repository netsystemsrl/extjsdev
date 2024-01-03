<?php
/**
 * An example that shows you how to extract image positions, sizes and resolution data.
 *
 * For demonstration purpose the results will be added to the PDF document
 * by square annotations.
 */
error_reporting(E_ALL | E_STRICT);

// list some files
$files = glob('../../_files/*.pdf');
$files = array_merge($files, glob('../../../_files/pdfs/*.pdf'));
$files = array_merge($files, glob('../../../_files/pdfs/tektown/*.pdf'));

if (!isset($_GET['f']) || !in_array($_GET['f'], $files)) {
    header("Content-Type: text/html; charset=utf-8");
    foreach ($files AS $path) {
        echo '<a href="GetImageSizes.php?f=' . urlencode($path) . '">' . htmlspecialchars(basename($path)) . '</a><br />';
    }

    die();
}

// load and register the autoload function
require_once('../../../../../library/SetaPDF/Autoload.php');

/**
 * Class ImageProcessor
 */
class ImageProcessor
{
    /**
     * The graphic state.
     *
     * @var SetaPDF_Core_Canvas_GraphicState
     */
    protected $_graphicState;

    /**
     * The content stream.
     *
     * @var string
     */
    protected $_stream;

    /**
     * The stream resources dictionary.
     *
     * @var SetaPDF_Core_Type_Dictionary
     */
    protected $_resources;

    /**
     * The content parser instance.
     *
     * @var SetaPDF_Core_Parser_Content
     */
    protected $_contentParser;

    /**
     * Switch the width and height values.
     *
     * @var bool
     */
    protected $_switchWidthAndHeight = false;

    /**
     * The result data.
     *
     * @var array
     */
    protected $_result = array();

    /**
     * The constructor.
     *
     * The parameter are the content stream and its resources dictionary.
     *
     * @param string $stream
     * @param SetaPDF_Core_Type_Dictionary $resources
     * @param boolean $switchWidthAndHeight
     * @param SetaPDF_Core_Canvas_GraphicState|null $graphicState
     */
    public function __construct(
        $stream,
        SetaPDF_Core_Type_Dictionary $resources,
        $switchWidthAndHeight = false,
        SetaPDF_Core_Canvas_GraphicState $graphicState = null
    )
    {
        $this->_stream = $stream;
        $this->_resources = $resources;
        $this->_switchWidthAndHeight = $switchWidthAndHeight;
        $this->_graphicState = $graphicState === null ? new SetaPDF_Core_Canvas_GraphicState() : $graphicState;
    }

    /**
     * Get the graphic state.
     *
     * @return null|SetaPDF_Core_Canvas_GraphicState
     */
    public function getGraphicState()
    {
        return $this->_graphicState;
    }

    /**
     * Process the content stream and return the resolved data.
     *
     * @return array
     */
    public function process()
    {
        $parser = $this->_getContentParser();
        $parser->process();

        return $this->_result;
    }

    /**
     * A method to receive the content parser instance.
     *
     * @return SetaPDF_Core_Parser_Content
     */
    protected function _getContentParser()
    {
        if (null === $this->_contentParser) {
            $this->_contentParser = new SetaPDF_Core_Parser_Content($this->_stream);
            $this->_contentParser->registerOperator(array('q', 'Q'), array($this, '_onGraphicStateChange'));
            $this->_contentParser->registerOperator('cm', array($this, '_onCurrentTransformationMatrix'));
            $this->_contentParser->registerOperator('Do', array($this, '_onFormXObject'));
        }

        return $this->_contentParser;
    }

    /**
     * Callback for the content parser which is called if a graphic state token (q/Q)is found.
     *
     * @param array $arguments
     * @param string $operator
     */
    public function _onGraphicStateChange($arguments, $operator)
    {
        if ($operator === 'q') {
            $this->getGraphicState()->save();
        } else {
            $this->getGraphicState()->restore();
        }
    }

    /**
     * Callback for the content parser which is called if a "cm" token is found.
     * @param array $arguments
     * @param string $operator
     */
    public function _onCurrentTransformationMatrix($arguments, $operator)
    {
        $this->getGraphicState()->addCurrentTransformationMatrix(
            $arguments[0]->getValue(), $arguments[1]->getValue(),
            $arguments[2]->getValue(), $arguments[3]->getValue(),
            $arguments[4]->getValue(), $arguments[5]->getValue()
        );
    }

    /**
     * Callback for the content parser which is called if a "Do" operator/token is found.
     *
     * @param array $arguments
     * @param string $operator
     *
     * @throws SetaPDF_Exception_NotImplemented
     */
    public function _onFormXObject($arguments, $operator)
    {
        $xObjects = $this->_resources->getValue(SetaPDF_Core_Resource::TYPE_X_OBJECT);
        if (null === $xObjects) {
            return;
        }

        $xObjects = $xObjects->ensure();
        $xObject = $xObjects->getValue($arguments[0]->getValue());

        if (!($xObject instanceof SetaPDF_Core_Type_IndirectReference)) {
            return;
        }

        $xObject = SetaPDF_Core_XObject::get($xObject);

        if ($xObject instanceof SetaPDF_Core_XObject_Form) {
            /* In that case we need to create a new instance of the processor and process
             * the form xobjects stream.
             */
            $stream = $xObject->getStreamProxy()->getStream();
            $resources = $xObject->getCanvas()->getResources(false);
            if (false === $resources)
                return;

            $gs = $this->getGraphicState();
            $gs->save();
            $dict = $xObject->getIndirectObject()->ensure()->getValue();
            $matrix = $dict->getValue('Matrix');
            if ($matrix) {
                $matrix = $matrix->ensure()->toPhp();
                $gs->addCurrentTransformationMatrix(
                    $matrix[0], $matrix[1], $matrix[2], $matrix[3], $matrix[4], $matrix[5]
                );
            }

            $processor = new self($stream, $resources, $this->_switchWidthAndHeight, $gs);

            foreach ($processor->process() AS $image) {
                $this->_result[] = $image;
            }

            $gs->restore();

        } else {
            // we have an image object, calculate it's outer points in user space
            $gs = $this->getGraphicState();
            $ll = $gs->toUserSpace(new SetaPDF_Core_Geometry_Vector(0, 0, 1));
            $ul = $gs->toUserSpace(new SetaPDF_Core_Geometry_Vector(0, 1, 1));
            $ur = $gs->toUserSpace(new SetaPDF_Core_Geometry_Vector(1, 1, 1));
            $lr = $gs->toUserSpace(new SetaPDF_Core_Geometry_Vector(1, 0, 1));

            // ...and match some further information
            $width  = abs($this->_switchWidthAndHeight ? $ur->subtract($ll)->getY() : $ur->subtract($ll)->getX());
            $height = abs($this->_switchWidthAndHeight ? $ur->subtract($ll)->getX() : $ur->subtract($ll)->getY());

            $this->_result[] = array(
                'll' => $ll->toPoint(),
                'ul' => $ul->toPoint(),
                'ur' => $ur->toPoint(),
                'lr' => $lr->toPoint(),
                'width' => $width,
                'height' => $height,
                'resolutionX' => $xObject->getWidth() / $width * 72,
                'resolutionY' => $xObject->getHeight() / $height * 72,
                'pixelWidth' => $xObject->getWidth(),
                'pixelHeight' => $xObject->getHeight()
            );
        }
    }
}

// load a document instance
$document = SetaPDF_Core_Document::loadByFilename($_GET['f']);
// get access to the pages object
$pages = $document->getCatalog()->getPages();

// a array of colors
$colors = array(
    array(0, 1, 0),
    array(0, 0, 1),
    array(1, 1, 0),
    array(0, 1, 1),
    array(1, 0, 1),
    array(1, 0, 0),
    array(1, 0, 1)
);

// walk through the pages
for ($pageNo = 1; $pageNo <= $pages->count(); $pageNo++) {
    $page = $pages->getPage($pageNo);
    $canvas = $page->getCanvas();

    // create an image processor instance
    $imageProcessor = new ImageProcessor(
        $canvas->getStream(),
        $canvas->getResources(true),
        ($page->getRotation() / 90) % 2 > 0
    );
    // process the content stream
    $images = $imageProcessor->process();

    // for demonstration purpose we add annotations to the found images
    $annotations = $page->getAnnotations();

    foreach ($images AS $image) {
        $rect = SetaPDF_Core_DataStructure_Rectangle::byArray(array(
            $image['ll']->getX(), $image['ll']->getY(),
            $image['ur']->getX(), $image['ur']->getY(),
        ));

        $annotation = new SetaPDF_Core_Document_Page_Annotation_Square($rect);

        $annotation->setColor(current($colors));
        $annotation->setContents(print_r($image, true));
        $annotations->add($annotation);

        if (next($colors) === false) {
            reset($colors);
        }
    }
}

// save and finish
$document->setWriter(new SetaPDF_Core_Writer_Http('images.pdf', true));
$document->save()->finish();

