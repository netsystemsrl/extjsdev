<?php
/**
 * This demo shows how to check for text on pages in a pdf document.
 */
error_reporting(E_ALL | E_STRICT);
header("Content-Type: text/html; charset=utf-8");

// list some files
$files = glob('../../_files/*.pdf');
$files = array_merge($files, glob('../../../_files/pdfs/misc/*.pdf'));
$files = array_merge($files, glob('./*.pdf'));

foreach ($files AS $path) {
    $name = basename($path);

    echo '<a href="CheckForText.php?f=' . urlencode($path) . '">';
    echo  htmlspecialchars($name);
    echo '</a><br />';
}

echo '<br />';
if (!isset($_GET['f']) || !in_array($_GET['f'], $files)) {
    die();
}

// load and register the autoload function
require_once('../../../../../library/SetaPDF/Autoload.php');

/**
 * Class TextFoundException
 */
class TextFoundException extends Exception {}

/**
 * Class TextProcessor
 */
class TextProcessor
{
    /**
     * The content stream.
     *
     * @var string
     */
    protected $_stream;

    /**
     * The stream ressources dictionary.
     *
     * @var SetaPDF_Core_Type_Dictionary $_resources
     */
    protected $_resources;

    /**
     * The content parser instance.
     *
     * @var SetaPDF_Core_Parser_Content
     */
    protected $_contentParser;

    /**
     * The constructor
     *
     * The parameter are the content stream and its resources dictionary.
     *
     * DocumentProcessor constructor.
     * @param string $stream
     * @param SetaPDF_Core_Type_Dictionary $resources
     */
    function __construct($stream, SetaPDF_Core_Type_Dictionary $resources)
    {
        $this->_stream = $stream;
        $this->_resources = $resources;
    }

    /**
     * Processes the content stream.
     *
     * Returns true if there is any text in the stream, otherwise false
     *
     * @return bool
     */
    public function hasText()
    {
        try {
            $this->_processStream();
            return false;
        } catch (TextFoundException $e) {
            return true;
        }
    }

    /**
     * Process the content stream internal.
     *
     * @return void
     */
    protected function _processStream()
    {
        $parser = $this->_getContentParser();
        $parser->process();
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
            $this->_contentParser->registerOperator(array('Tj', 'TJ', '"', "'"), array($this, '_onTextFound'));
            $this->_contentParser->registerOperator('Do', array($this, '_onFormXObject'));
        }

        return $this->_contentParser;
    }

    /**
     * Callback for the content parser which is called if a "Do" operator/token is found.
     *
     * @param $arguments
     * @param $operator
     */
    public function _onFormXObject($arguments, $operator)
    {
        $xObjects = $this->_resources->getValue(SetaPDF_Core_Resource::TYPE_X_OBJECT);
        if (null === $xObjects) {
            return;
        }

        $xObjects = $xObjects->ensure();
        $xObject = $xObjects->getValue($arguments[0]->getValue());
        $xObject = SetaPDF_Core_XObject::get($xObject);

        if ($xObject instanceof SetaPDF_Core_XObject_Form) {
            /* In that case we need to create a new instance of the processor and process
             * the form xobjects stream.
             */
            $stream = $xObject->getStreamProxy()->getStream();
            $resources = $xObject->getCanvas()->getResources(false);
            if (false === $resources) {
                return;
            }
            $processor = new self($stream, $resources);
            $processor->_processStream();
        }
    }

    /**
     * Callback for the content parser which is called if any text token was found.
     *
     * @param array $arguments
     * @param string $operator
     *
     * @throws TextFoundException
     */
    public function _onTextFound($arguments, $operator)
    {
        throw new TextFoundException();
    }
}


// load a document instance
$document = SetaPDF_Core_Document::loadByFilename(realpath($_GET['f']));
// get access to the pages object
$pages = $document->getCatalog()->getPages();

// walk through the pages
for ($i = 1; $i <= count($pages); $i++) {
    $canvas = $pages->getPage($i)->getCanvas();

    // create an text processor instance
    $processor = new TextProcessor($canvas->getStream(), $canvas->getResources(true));

    // check for text
    if ($processor->hasText()) {
        echo 'Page ' . $i . ' has text!';
    } else {
        echo 'Page ' . $i . ' has no text!';
    }

    echo '</br>';
}
