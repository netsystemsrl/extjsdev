<?php
/**
 * This file is part of the SetaPDF-Extractor Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Plain.php 1116 2017-10-26 13:03:53Z jan.slabon $
 */

/**
 * Extraction strategy for plain text.
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @subpackage SetaPDF_Extractor_Strategy
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Extractor_Strategy_Plain
    extends SetaPDF_Extractor_Strategy_AbstractStrategy
{
    /**
     * The text items.
     *
     * @var SetaPDF_Extractor_TextItem[]
     */
    protected $_items = array();

    /**
     * The graphic state instance.
     *
     * @var SetaPDF_Core_Canvas_GraphicState
     */
    protected $_graphicState;

    /**
     * The stream resources dictionary.
     *
     * @var SetaPDF_Core_Type_Dictionary
     */
    protected $_resources;

    /**
     * Used matrixes.
     *
     * @var SetaPDF_Core_Geometry_Matrix[]
     */
    protected $_lastMatrix = array(
        'start' => null,
        'end' => null
    );

    /**
     * A text item counter.
     *
     * @var int
     */
    protected $_textCount = 0;

    /**
     * @var SetaPDF_Core_Parser_Content
     */
    protected $_contentParser;

    /**
     * The sorter instance.
     *
     * @var SetaPDF_Extractor_Sorter
     */
    protected $_sorter;

    /**
     * A factor to calculate whether a distance can be seen as a character separator.
     *
     * The fonts space character width is devided by this factor to define the minimum
     * space for a character separator.
     *
     * @var float
     */
    public $spaceWidthFactor = 2.;

    /**
     * Set a sorter instance.
     *
     * @param SetaPDF_Extractor_Sorter $sorter
     */
    public function setSorter(SetaPDF_Extractor_Sorter $sorter)
    {
        $this->_sorter = $sorter;
    }

    /**
     * Get the sorter instance.
     *
     * If none was set a {@link SetaPDF_Extractor_Sorter_Baseline base line} sorter is created automatically.
     *
     * @return SetaPDF_Extractor_Sorter|SetaPDF_Extractor_Sorter_Baseline
     */
    public function getSorter()
    {
        if (null === $this->_sorter) {
            $this->_sorter = new SetaPDF_Extractor_Sorter_Baseline();
        }

        return $this->_sorter;
    }

    /**
     * Get the plain text from a stream.
     *
     * @param string $stream
     * @param SetaPDF_Core_Type_Dictionary $resources
     * @return string|array
     */
    public function getResult($stream, SetaPDF_Core_Type_Dictionary $resources)
    {
        $items = $this->process($stream, $resources);

        $sorter = $this->getSorter();
        $lines = $sorter->groupByLines($items);
        $result = '';
        $results = array();
        $prevItem = null;
        $lastFilterId = null;

        /**
         * @var $item SetaPDF_Extractor_TextItem
         * @var $prevItem SetaPDF_Extractor_TextItem
         */

        foreach ($lines AS $items) {
            $prevItem = null;
            $orientation = null;
            $orientationMatrix = new SetaPDF_Core_Geometry_Matrix();

            foreach ($items AS $item) {
                $start = $item->getBaseLineStart();
                $string = $item->getString();

                if ($result && $item->getFilterId() !== $lastFilterId) {
                    if (!isset($results[$lastFilterId])) {
                        $results[$lastFilterId] = '';
                    }

                    $results[$lastFilterId] .= "\n" . $result;
                    $result = '';
                }

                if ($prevItem && $result) {
                    $prevEnd = $prevItem->getBaseLineEnd();
                    $whiteSpaceA = $prevItem->getUserSpaceSpaceWidth();
                    $whiteSpaceB = $item->getUserSpaceSpaceWidth();
                    $whiteSpace = ($whiteSpaceA + $whiteSpaceB) / 2;

                    if ($orientation != 0) {
                        $prevEnd = $prevEnd->multiply($orientationMatrix);
                        $start = $start->multiply($orientationMatrix);
                    }

                    // if a single invisible glyph covers the previous glpyh it should be ignored
                    if (strlen($string) === 1 &&
                        // do this logic only if the space character is fixed and not resolved by other logics
                        $item->getFont()->getGlyphWidth("\x00\x20") != 0
                        && abs(
                            $item->getFont()->getGlyphWidth("\x00\x20") -
                            $item->getFont()->getMissingWidth()
                        ) > SetaPDF_Core::FLOAT_COMPARISON_PRECISION
                        &&
                        (
                        $string === "\x20" ||           // SPACE
                        $string === "\xc2\xa0" ||       // NO-BREAK SPACE
                        ord($string) < 32            // control characters
                    )) {
                        $joiningLength = $prevEnd->subtract($start)->getLength();
                        if ($joiningLength > 0) {
                            $end = $item->getBaseLineEnd();
                            if ($orientation != 0) {
                                $end = $end->multiply($orientationMatrix);
                            }

                            $width = $end->subtract($start)->getLength();
                            if ($width == 0) {
                                continue;
                            }

                            $percent = $joiningLength / $width;
                            if ($percent > .55) {
                                continue;
                            }
                        }
                    }

                    if ($prevEnd->getX() < $start->getX() &&
                        abs($prevEnd->getX() - $start->getX()) >= ($whiteSpace / $this->spaceWidthFactor)
                    )
                    {
                        $result .= ' ';
                    } elseif (!$sorter->isOnSameLine($prevItem, $item)) {
                        $result .= "\n";
                    }

                } else {
                    $orientation = (float)$item->getOrientation();
                    if ($orientation != 0) {
                        $c = cos(-$orientation);
                        $s = sin(-$orientation);

                        $m1 = new SetaPDF_Core_Geometry_Matrix();
                        $orientationMatrix = $m1->multiply(new SetaPDF_Core_Geometry_Matrix($c, $s, -$s, $c, 0, 0));
                    }
                }

                $result .= preg_replace('/[\x00-\x1F]/u', ' ', $string);

                $prevItem = $item;
                $lastFilterId = $item->getFilterId();
            }

            $result .= "\n";
        }

        if ($lastFilterId !== null || count($results) > 0) {
            if (!isset($results[$lastFilterId])) {
                $results[$lastFilterId] = '';
            }

            $results[$lastFilterId] .= "\n" . $result;
            $result = '';
        }


        if (count($results) > 0) {
            return array_map(array($this, '_cleanResult'), $results);
        }

        return $this->_cleanResult($result);
    }

    /**
     * Callback to clean up the resulting text.
     *
     * @param $result
     * @return string
     */
    public function _cleanResult($result)
    {
        $result = preg_replace("/[\r]/", "\n", $result);
        $result = preg_replace('/[ \xa0]+\n/u', "\n", $result); // non-breaking space
        $result = preg_replace('/[ \xa0]{2,}/u', ' ', $result);
        $result = preg_replace('/[\xa0]/u', ' ', $result);
        $result = preg_replace("/[\n]{2,}/", "\n", $result);
        $result = preg_replace("/[\n] /", "\n", $result);

        return trim($result);
    }
    
    /**
     * Processes a stream through the plain text strategy.
     *
     * @param string $stream
     * @param SetaPDF_Core_Type_Dictionary $resources
     * @return SetaPDF_Extractor_TextItem[]
     */
    public function process($stream, SetaPDF_Core_Type_Dictionary $resources)
    {
        if (null === $this->getGraphicState()) {
            throw new BadMethodCallException(
                'No graphic state defined. Pass a graphic state object prior calling this method.'
            );
        }

        $this->_resources = $resources;

        $this->_items = array();

        if ($this->_cleanStreamCallback !== null) {
            $stream = call_user_func($this->_cleanStreamCallback, $stream);
        }

        $this->_contentParser = $this->_getParser($stream);

        $this->_init();

        $this->_contentParser->process();

        $this->_contentParser->cleanUp();
        unset($this->_contentParser);

        return $this->_items;
    }

    /**
     * Inits the graphic state callbacks
     *
     * @internal
     */
    protected function _init()
    {
        $this->_registerGsCallbacks();
    }

    /**
     * Set the graphic state.
     *
     * @param SetaPDF_Core_Canvas_GraphicState $graphicState
     */
    public function setGraphicState(SetaPDF_Core_Canvas_GraphicState $graphicState)
    {
        $this->_graphicState = $graphicState;
    }

    /**
     * Get the graphic state.
     *
     * @return SetaPDF_Core_Canvas_GraphicState
     */
    public function getGraphicState()
    {
        return $this->_graphicState;
    }

    /**
     * Registers callbacks in the graphic state.
     *
     * @internal
     */
    protected function _registerGsCallbacks()
    {
        $graphicState = $this->getGraphicState();
        $graphicState->text()->registerCallback(
            'beforeShowText', array($this, '_onBeforeShowText')
        );
        $graphicState->text()->registerCallback(
            'afterShowText', array($this, '_onAfterShowText')
        );
    }

    /**
     * Creates the content stream parser.
     *
     * @param string $stream
     * @return SetaPDF_Core_Parser_Content
     */
    protected function _getParser($stream)
    {
        $parser = new SetaPDF_Core_Parser_Content($stream);

        $callbacks = array(
            '_onBeginOrEndText' => array('BT', 'ET'),
            '_onGraphicStateChange' => array('q', 'Q'),
            '_onCurrentTransformationMatrix' => array('cm'),

            // Text state operators
            '_onTextState' => array('Tc', 'Tw', 'Tz', 'TL', 'Tf', 'Tr' /* rendering mode */, 'Ts' /* rise */),

            // Text-Positioning Operators
            '_onTextPosition' => array('Td', 'TD', 'Tm', 'T*'),

            // Text-Showing Operators
            '_onTextShow' => array(
                'Tj', "'", // string
                '"', // aw ac string
                'TJ', // array: (string) number (string)(string) number
            ),

            '_onFormXObject' => array(
                'Do'
            ),
            '_onInlineImage' => array(
                'BI'
            )
        );

        foreach ($callbacks AS $method => $operators) {
            $parser->registerOperator(
                $operators,
                array($this, $method)
            );
        }

        return $parser;
    }

    /**
     * Callback for begin or end text operators (BT/ET).
     *
     * @param array $arguments
     * @param string $operator
     */
    public function _onBeginOrEndText($arguments, $operator)
    {
        if ($operator === 'BT') {
            $this->getGraphicState()->text()->begin();
            $this->_textCount++;
        } else {
            $this->getGraphicState()->text()->end();
        }
    }

    /**
     * Callback for graphic state changes operators (q/Q).
     *
     * @param array $arguments
     * @param string $operator
     */
    public function _onGraphicStateChange($arguments, $operator)
    {
        if ('q' === $operator) {
            $this->getGraphicState()->save();
        } else {
            $this->getGraphicState()->restore();
        }
    }

    /**
     * Callback for ctm changes (cm).
     *
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
     * Callback for text state operators.
     *
     * All states has to be passed to the current graphic state as defined in
     * PDF 32000-1:2008, Table 52 on page 121.
     *
     * @param array $arguments
     * @param string $operator
     * @throws SetaPDF_Extractor_Exception
     */
    public function _onTextState($arguments, $operator)
    {
        $text = $this->getGraphicState()->text();
        // Tc, Tw, Tz, TL, Tf, Tr (rendering moder), Ts (rise)
        switch ($operator) {
            case 'Tc':
                $text->setCharacterSpacing($arguments[0]->getValue());
                break;
            case 'Tw':
                $text->setWordSpacing($arguments[0]->getValue());
                break;
            case 'Tz':
                $text->setScaling($arguments[0]->getValue());
                break;
            case 'TL':
                $text->setLeading($arguments[0]->getValue());
                break;
            case 'Tf':
                $fontName = $arguments[0]->getValue();
                $fonts = $this->_resources->getValue(SetaPDF_Core_Resource::TYPE_FONT);
                if (null !== $fonts) {
                    /**
                     * @var $fonts SetaPDF_Core_Type_Dictionary
                     */
                    $fonts = $fonts->ensure();
                    $fontReference = $fonts->getValue($fontName);
                    if (null !== $fontReference) {
                        try {
                            $font = SetaPDF_Core_Font::get($fontReference);
                            $text->setFont($font, $arguments[1]->getValue());
                        } catch (Exception $e) {
                            // ignore silently unsupported fonts
                        }
                    }/* else {
                        // ignore invalid font references in this strategy.
                        // throw new SetaPDF_Extractor_Exception('Unable to resolve font: "' . $fontName . '"');
                    }*/
                }
                break;
            case 'Tr':
                $text->setRenderingMode($arguments[0]->getValue());
                break;
            case 'Ts':
                $text->setRise($arguments[0]->getValue());
                break;
        }
    }

    /**
     * Callback for text position operators.
     *
     * @param array $arguments
     * @param string $operator
     */
    public function _onTextPosition($arguments, $operator)
    {
        $text = $this->getGraphicState()->text();
        switch ($operator) {
            case 'Td':
            case 'TD':
                $text->moveToNextLine(
                    $arguments[0]->getValue(), $arguments[1]->getValue(),
                    $operator === 'TD'
                );
                break;
            case 'Tm':
                $text->setTextMatrix(
                    $arguments[0]->getValue(), $arguments[1]->getValue(),
                    $arguments[2]->getValue(), $arguments[3]->getValue(),
                    $arguments[4]->getValue(), $arguments[5]->getValue()
                );

                $text->setLineMatrix(
                    $arguments[0]->getValue(), $arguments[1]->getValue(),
                    $arguments[2]->getValue(), $arguments[3]->getValue(),
                    $arguments[4]->getValue(), $arguments[5]->getValue()
                );
                break;
            case 'T*':
                $text->moveToStartOfNextLine();
                break;
        }
    }

    /**
     * Callback for text show operators.
     *
     * @param array $arguments
     * @param string $operator
     */
    public function _onTextShow($arguments, $operator)
    {
        $text = $this->getGraphicState()->text();
        switch ($operator) {
            case "'":
                $text->moveToNextLineAndShowText($arguments[0]->getValue());
                break;
            case '"':
                $text->moveToNextLineAndShowText(
                    $arguments[0]->getValue(), $arguments[1]->getValue(), $arguments[2]->getValue()
                );
                break;
            case 'Tj':
                $text->showText($arguments[0]->getValue());
                break;
            case 'TJ':
                $text->showTextStrings($arguments[0]->toPhp());
                break;
        }
    }

    /**
     * Callback for painting a specified XObject.
     *
     * @param array $arguments
     * @param string $operator
     * @throws SetaPDF_Exception_NotImplemented
     */
    public function _onFormXObject($arguments, $operator)
    {
        $xObjects = $this->_resources->getValue(SetaPDF_Core_Resource::TYPE_X_OBJECT);
        if (null === $xObjects) {
            return;
        }

        /**
         * @var $xObjects SetaPDF_Core_Type_Dictionary
         */
        $xObjects = $xObjects->ensure();
        $xObject = $xObjects->getValue($arguments[0]->getValue());
        if (!($xObject instanceof SetaPDF_Core_Type_IndirectReference)) {
            return;
        }

        $xObject = SetaPDF_Core_XObject::get($xObject);
        if ($xObject instanceof SetaPDF_Core_XObject_Form) {
            $stream = $xObject->getStreamProxy()->getStream();
            $resources = $xObject->getCanvas()->getResources(false);
            if (false === $resources) {
                $resources = $this->_resources;
            }

            $gs = $this->getGraphicState();
            $gs->save();

            $matrix = $xObject->getMatrix(true);
            if ($matrix) {
                $gs->addCurrentTransformationMatrix(
                    $matrix[0], $matrix[1], $matrix[2], $matrix[3], $matrix[4], $matrix[5]
                );
            }

            $strategy = $this->_getSubInstance($gs);
            $items = $strategy->process($stream, $resources);

            foreach ($items AS $item) {
                $this->_items[] = $item;
            }

            $gs->restore();
            // remap callbacks to this instance
            $this->_textCount = $strategy->_textCount;
            $this->_init();

        } else {
            $xObject->cleanUp();
        }
    }

    /**
     * Callback for inline image operator
     *
     * @param array $arguments
     * @param string $operator
     */
    public function _onInlineImage($arguments, $operator)
    {
        $this->_contentParser->skipUntil('EI');
    }

    /**
     * Saves the last matrix by a specific type.
     *
     * @param string $type
     */
    protected function _saveLastMatrix($type)
    {
        $text = $this->getGraphicState()->text();

        $this->_lastMatrix[$type] = $text->getTextMatrix()
            ->multiply($this->getGraphicState()->getCurrentTransformationMatrix());
    }

    /**
     * Callback that is called before a show text operation is invoked.
     */
    public function _onBeforeShowText()
    {
        $this->_saveLastMatrix('start');
    }

    /**
     * Callback that is called after a show text operation was invoked.
     *
     * @param string $rawString
     */
    public function _onAfterShowText($rawString)
    {
        if (strlen($rawString) === 0) {
            return;
        }

        $this->_saveLastMatrix('end');

        $text = $this->getGraphicState()->text();

        $item = new SetaPDF_Extractor_TextItem(
            $rawString, $text->getFont(), $text->getFontSize(),
            $text->getCharacterSpacing(),
            $text->getWordSpacing(),
            $text->getScaling(),
            $this->_lastMatrix['start'],
            $this->_lastMatrix['end'],
            $this->_textCount
        );

        if ($filterId = $this->_accept($item)) {
            if ($filterId !== true) {
                $item->setFilterId($filterId);
            }
            $this->_items[] = $item;
        }
    }
}