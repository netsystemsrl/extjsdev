<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Text.php 1185 2018-01-24 13:45:38Z timo.scholz $
 */

/**
 * A class representing a text graphic state.
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Canvas
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Canvas_GraphicState_Text
{
    /**
     * Data name constant
     *
     * @var string
     */
    const TEXT_MATRIX = 'textMatrix';

    /**
     * Data name constant
     *
     * @var string
     */
    const LINE_MATRIX = 'lineMatrix';

    /**
     * Data name constant
     *
     * @var string
     */
    const CHARACTER_SPACING = 'characterSpacing';

    /**
     * Data name constant
     *
     * @var string
     */
    const WORD_SPACING = 'wordSpacing';

    /**
     * Data name constant
     *
     * @var string
     */
    const SCALING = 'scaling';

    /**
     * Data name constant
     *
     * @var string
     */
    const LEADING = 'leading';

    /**
     * Data name constant
     *
     * @var string
     */
    const FONT = 'font';

    /**
     * Data name constant
     *
     * @var string
     */
    const FONT_SIZE = 'fontSize';

    /**
     * Data name constant
     *
     * @var string
     */
    const RENDERING_MODE = 'renderingMode';

    /**
     * Data name constant
     *
     * @var string
     */
    const RISE = 'rise';

    /**
     * The main graphic state from which this text graphic state is inherited/created from.
     *
     * @var SetaPDF_Core_Canvas_GraphicState
     */
    protected $_graphicState;

    /**
     * The graphic state instance of this text state.
     *
     * @var array
     */
    protected $_stack;

    /**
     * The data of the text graphic state.
     *
     * @var array
     */
    protected $_data = array();

    /**
     * Callbacks which should be executed when a specific value is set.
     *
     * @var callback[]
     */
    protected $_callbacks = array();

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Canvas_GraphicState $graphicState
     * @param array $stack A reference to the graphic state stack array.
     */
    public function __construct(SetaPDF_Core_Canvas_GraphicState $graphicState, &$stack)
    {
        $this->_graphicState = $graphicState;
        $this->_stack = &$stack;
    }

    /**
     * Release cycled references.
     */
    public function cleanUp()
    {
        $this->_stack = null;
    }

    /**
     * Registers a callback that should be executed if a specifc value is set.
     *
     * @param string $valueName
     * @param callback $callback
     */
    public function registerCallback($valueName, $callback)
    {
        if (!is_callable($callback)) {
            throw new InvalidArgumentException('Given callback (' . $valueName . ') is not callable.');
        }

        $this->_callbacks[$valueName] = $callback;
    }

    /**
     * Un-registers a callback.
     *
     * @see registerCallback()
     * @param string $valueName
     */
    public function unregisterCallback($valueName)
    {
        unset($this->_callbacks[$valueName]);
    }

    /**
     * Get the current state of the stack.
     *
     * @return mixed
     */
    protected function &_getCurrent()
    {
        return $this->_stack[count($this->_stack) - 1];
    }

    /**
     * Get a value by walking through the graphic stack.
     *
     * @param string $name
     * @param $default
     * @return mixed
     */
    protected function _getValue($name, $default)
    {
        for ($i = count($this->_stack) - 1; $i >= 0; $i--) {
            $state = $this->_stack[$i];
            if (isset($state['text']) && isset($state['text'][$name])) {
                return $state['text'][$name];
            }
        }

        return $default;
    }

    /**
     * Sets a value in the current graphic stack.
     *
     * @param string $name
     * @param mixed $value
     */
    protected function _setValue($name, $value)
    {
        $current =& $this->_getCurrent();
        if (null !== $value) {
            $current['text'][$name] = $value;
        } else {
            unset($current['text'][$name]);
        }

        if (isset($this->_callbacks[$name])) {
            call_user_func($this->_callbacks[$name], $value);
        }
    }

    /**
     * Begins a text object in the graphic state.
     *
     * @return $this
     */
    public function begin()
    {
        $this->_setValue(self::TEXT_MATRIX, new SetaPDF_Core_Geometry_Matrix());
        $this->_setValue(self::LINE_MATRIX, new SetaPDF_Core_Geometry_Matrix());

        return $this;
    }

    /**
     * Ends a text object in the graphic state.
     *
     * @return $this
     */
    public function end()
    {
        $this->_setValue(self::TEXT_MATRIX, null);
        $this->_setValue(self::LINE_MATRIX, null);

        return $this;
    }

    /**
     * Gets the current text transformation matrix.
     *
     * @throws BadMethodCallException
     * @return null|SetaPDF_Core_Geometry_Matrix
     */
    public function getTextMatrix()
    {
        $matrix = $this->_getValue(self::TEXT_MATRIX, false);

        if (false === $matrix) {
            throw new BadMethodCallException('A text matrix is only available if the text object has begun.');
        }

        return $matrix;
    }

    /**
     * Gets the current line transformation matrix.
     *
     * @throws BadMethodCallException
     * @return null|SetaPDF_Core_Geometry_Matrix
     */
    public function getLineMatrix()
    {
        $matrix = $this->_getValue(self::LINE_MATRIX, false);

        if (false === $matrix) {
            throw new BadMethodCallException('A line matrix is only available if the text object has begun.');
        }

        return $matrix;
    }

    /**
     * Sets the current character spacing value.
     *
     * @param float $characterSpacing
     * @return $this
     */
    public function setCharacterSpacing($characterSpacing)
    {
        $this->_setValue(self::CHARACTER_SPACING, (float)$characterSpacing);

        return $this;
    }

    /**
     * Gets the current character spacing value.
     *
     * @return integer|float
     */
    public function getCharacterSpacing()
    {
        return $this->_getValue(self::CHARACTER_SPACING, 0);
    }

    /**
     * Sets the current word spacing value.
     *
     * @param float $wordSpacing
     * @return $this
     */
    public function setWordSpacing($wordSpacing)
    {
        $this->_setValue(self::WORD_SPACING, (float)$wordSpacing);

        return $this;
    }

    /**
     * Gets the current word spacing value.
     *
     * @return integer|float
     */
    public function getWordSpacing()
    {
        return $this->_getValue(self::WORD_SPACING, 0);
    }

    /**
     * Sets the current scaling value.
     *
     * @param float $scaleing
     * @return $this
     */
    public function setScaling($scaleing)
    {
        $this->_setValue(self::SCALING, (float)$scaleing);

        return $this;
    }

    /**
     * Gets the current scaling value.
     *
     * @return mixed
     */
    public function getScaling()
    {
        return $this->_getValue(self::SCALING, 100);
    }

    /**
     * Sets the current leading value.
     *
     * @param float $leading
     * @return $this
     */
    public function setLeading($leading)
    {
        $this->_setValue(self::LEADING, (float)$leading);

        return $this;
    }

    /**
     * Gets the current leading value.
     *
     * @return mixed
     */
    public function getLeading()
    {
        return $this->_getValue(self::LEADING, 0);
    }

    /**
     * Sets the current font and size.
     *
     * @param SetaPDF_Core_Font_FontInterface $font
     * @param float $size
     * @return $this
     */
    public function setFont(SetaPDF_Core_Font_FontInterface $font, $size)
    {
        $this->_setValue(self::FONT, $font);
        $this->_setValue(self::FONT_SIZE, (float)$size);

        return $this;
    }

    /**
     * Gets the current font instance.
     *
     * @return SetaPDF_Core_Font_FontInterface|boolean
     */
    public function getFont()
    {
        return $this->_getValue(self::FONT, false);
    }

    /**
     * Gets the current font size.
     *
     * @return float|boolean
     */
    public function getFontSize()
    {
        return $this->_getValue(self::FONT_SIZE, false);
    }

    /**
     * Sets the current rendering mode.
     *
     * @param integer $renderingMode
     * @return $this
     */
    public function setRenderingMode($renderingMode)
    {
        $this->_setValue(self::RENDERING_MODE, (int)$renderingMode);

        return $this;
    }

    /**
     * Get the current rendering mode value.
     *
     * @return integer
     */
    public function getRenderingMode()
    {
        return $this->_getValue(self::RENDERING_MODE, SetaPDF_Core_Canvas_Text::RENDERING_MODE_FILL);
    }

    /**
     * Sets the text rise value.
     *
     * @param float $rise
     * @return $this
     */
    public function setRise($rise)
    {
        $this->_setValue(self::RISE, (float)$rise);

        return $this;
    }

    /**
     * Gets the current text rise value.
     *
     * @return float|integer
     */
    public function getRise()
    {
        return $this->_getValue(self::RISE, 0);
    }

    /**
     * Move to the next line.
     *
     * The "'" operator.
     *
     * @param float $x
     * @param float $y
     * @param bool $setLeading
     * @return $this
     */
    public function moveToNextLine($x, $y, $setLeading = false)
    {
        $matrix = new SetaPDF_Core_Geometry_Matrix(1, 0, 0, 1, $x, $y);
        $matrix = $matrix->multiply($this->getLineMatrix());

        $this->setTextMatrix($matrix);
        $this->setLineMatrix($matrix);

        if ($setLeading) { // TD
            $this->setLeading($y * -1);
        }

        return $this;
    }

    /**
     * Move to the start of the next line.
     *
     * The "T*" operator.
     *
     * @return SetaPDF_Core_Canvas_GraphicState_Text
     */
    public function moveToStartOfNextLine()
    {
        return $this->moveToNextLine(0, -$this->getLeading());
    }

    /**
     * Sets the current text matrix.
     *
     * @param float|SetaPDF_Core_Geometry_Matrix $aOrMatrix
     * @param float|null $b
     * @param float|null $c
     * @param float|null $d
     * @param float|null $e
     * @param float|null $f
     *
     * @return $this
     */
    public function setTextMatrix($aOrMatrix, $b = null, $c = null, $d = null, $e = null, $f = null)
    {
        if ($aOrMatrix instanceof SetaPDF_Core_Geometry_Matrix) {
            $matrix = $aOrMatrix;
        } else {
            $matrix = new SetaPDF_Core_Geometry_Matrix($aOrMatrix, $b, $c, $d, $e, $f);
        }

        $this->_setValue(self::TEXT_MATRIX, clone $matrix);

        return $this;
    }

    /**
     * Sets the current line matrix.
     *
     * @param float|SetaPDF_Core_Geometry_Matrix $aOrMatrix
     * @param float|null $b
     * @param float|null $c
     * @param float|null $d
     * @param float|null $e
     * @param float|null $f
     *
     * @return $this
     */
    public function setLineMatrix($aOrMatrix, $b = null, $c = null, $d = null, $e = null, $f = null)
    {
        if ($aOrMatrix instanceof SetaPDF_Core_Geometry_Matrix) {
            $matrix = $aOrMatrix;
        } else {
            $matrix = new SetaPDF_Core_Geometry_Matrix($aOrMatrix, $b, $c, $d, $e, $f);
        }

        $this->_setValue(self::LINE_MATRIX, clone $matrix);

        return $this;
    }

    /**
     * Method that is invoked when a text should be shown.
     *
     * @param string $text
     * @return $this
     */
    protected function _showText($text)
    {
        if (isset($this->_callbacks['beforeShowText'])) {
            call_user_func($this->_callbacks['beforeShowText'], $text);
        }

        if ($text === '') {
            return $this;
        }

        $font = $this->getFont();

        if (false === $font) {
            return $this;
        }

        $charCodes = $font->splitCharCodes($text);
        $charCount = count($charCodes);
        $spaceCount = 0;
        $w0 = 0;

        foreach ($charCodes as $charCode) {
            if ($charCode === "\x20") {
                ++$spaceCount;
            }

            $w0 += $font->getGlyphWidthByCharCode($charCode);
        }

        //$w1 = 0;
        if ($font instanceof SetaPDF_Core_Font_Type3) {
            $fontMatrix = $font->getFontMatrix();
            $v = new SetaPDF_Core_Geometry_Vector($w0);
            $v = $v->multiply($fontMatrix);
            $w0 = $v->getX();
        } else {
            $w0 /= 1000;
        }

        $characterSpacing = $this->getCharacterSpacing();

        $tx = ($w0 * $this->getFontSize()
                + ($characterSpacing * ($charCount - 1))
                + ($this->getWordSpacing() * $spaceCount)
            ) * $this->getScaling() / 100;
        $ty = 0;//$w1 * $this->getFontSize();


        $m = new SetaPDF_Core_Geometry_Matrix(1, 0, 0, 1, $tx, $ty);
        $this->_setValue(self::TEXT_MATRIX, $m->multiply($this->getTextMatrix()));

        if (isset($this->_callbacks['afterShowText'])) {
            call_user_func($this->_callbacks['afterShowText'], $text);
        }

        if ($characterSpacing != 0) {
            $m = new SetaPDF_Core_Geometry_Matrix(1, 0, 0, 1, $characterSpacing * $this->getScaling() / 100, $ty);
            $this->_setValue(self::TEXT_MATRIX, $m->multiply($this->getTextMatrix()));
        }

        return $this;
    }

    /**
     * Shows a text string.
     *
     * @param string $text
     * @return SetaPDF_Core_Canvas_GraphicState_Text
     */
    public function showText($text)
    {
        return $this->_showText($text);
    }

    /**
     * Moves to the start of the next line and shows a text string.
     *
     * @param string $text
     * @param float|null $wordSpacing
     * @param float|null $charSpacing
     * @return $this
     */
    public function moveToNextLineAndShowText($text, $wordSpacing = null, $charSpacing = null)
    {
        if ($wordSpacing !== null && $charSpacing !== null) {
            $this->setWordSpacing($wordSpacing);
            $this->setCharacterSpacing($charSpacing);
        }

        $this->moveToStartOfNextLine();
        $this->_showText($text);

        return $this;
    }

    /**
     * Shows text strings.
     *
     * @param string|string[] $textStrings
     */
    public function showTextStrings($textStrings)
    {
        if (!is_array($textStrings))
            $textStrings = array($textStrings);

        foreach ($textStrings AS $textString) {
            if (is_float($textString) || is_int($textString)) {
                $tx = ((-$textString / 1000) * $this->getFontSize()) * $this->getScaling() / 100;
                $ty = 0;

                $m = new SetaPDF_Core_Geometry_Matrix(1, 0, 0, 1, $tx, $ty);

                $this->_setValue(self::TEXT_MATRIX, $m->multiply($this->getTextMatrix()));

            } else {
                $this->_showText($textString);
            }
        }
    }

    /**
     * Converts a vectors values to the user space coordinate system.
     *
     * @param SetaPDF_Core_Geometry_Vector $vector
     * @return SetaPDF_Core_Geometry_Vector
     */
    public function toUserSpace(SetaPDF_Core_Geometry_Vector $vector = null)
    {
        if (null === $vector) {
            $vector = new SetaPDF_Core_Geometry_Vector(0, 0, 1);
        }

        return $vector->multiply($this->getTextMatrix()
            ->multiply($this->_graphicState->getCurrentTransformationMatrix())
        );
    }

    /**
     * Get a font bounding box vector.
     *
     * @param $index
     * @return SetaPDF_Core_Geometry_Vector
     * @throws SetaPDF_Core_Exception
     */
    private function _getFontBBoxVector($index)
    {
        $font = $this->getFont();
        $fontBBox = $font->getFontBBox();
        if ($font instanceof SetaPDF_Core_Font_Type3) {
            $vector = new SetaPDF_Core_Geometry_Vector(0, $fontBBox[$index] * $this->getFontSize());
            $vector = $vector->multiply($font->getFontMatrix());
            return $vector;
        } else {
            return new SetaPDF_Core_Geometry_Vector(0, $fontBBox[$index] / 1000 * $this->getFontSize());
        }
    }

    /**
     * Get the bottom bearing line value in user space coordinate system.
     *
     * @return SetaPDF_Core_Geometry_Vector
     * @throws SetaPDF_Core_Exception
     */
    public function getBottomUserSpace()
    {
        return $this->toUserSpace($this->_getFontBBoxVector(1));
    }

    /**
     * Get the top bearing line value in user space coordinate system.
     *
     * @return SetaPDF_Core_Geometry_Vector
     * @throws SetaPDF_Core_Exception
     */
    public function getTopUserSpace()
    {
        return $this->toUserSpace($this->_getFontBBoxVector(3));
    }

    /**
     * Converts a vectors values to the text space coordinate system.
     *
     * @param SetaPDF_Core_Geometry_Vector $vector
     * @return SetaPDF_Core_Geometry_Vector
     */
    public function toTextSpace(SetaPDF_Core_Geometry_Vector $vector = null)
    {
        if (null === $vector) {
            $vector = new SetaPDF_Core_Geometry_Vector(0, 0, 1);
        }

        return $vector->multiply($this->getTextMatrix());
    }
}