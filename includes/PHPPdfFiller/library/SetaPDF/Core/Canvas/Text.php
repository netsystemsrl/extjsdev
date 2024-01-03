<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Text.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * A canvas helper class for text operators
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Canvas
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Canvas_Text extends SetaPDF_Core_Canvas_StandardOperators
{
    /**
     * Rendering mode
     *
     * @var integer
     */
    const RENDERING_MODE_FILL = 0;

    /**
     * Rendering mode
     *
     * @var integer
     */
    const RENDERING_MODE_STROKE = 1;

    /**
     * Rendering mode
     *
     * @var integer
     */
    const RENDERING_MODE_FILL_AND_STROKE = 2;

    /**
     * Rendering mode
     *
     * @var integer
     */
    const RENDERING_MODE_INVISIBLE = 3;

    /**
     * Rendering mode
     *
     * @var integer
     */
    const RENDERING_MODE_FILL_AND_CLIP = 4;

    /**
     * Rendering mode
     *
     * @var integer
     */
    const RENDERING_MODE_STROKE_AND_CLIP = 5;

    /**
     * Rendering mode
     *
     * @var integer
     */
    const RENDERING_MODE_FILL_STROKE_AND_CLIP = 6;

    /**
     * Rendering mode
     *
     * @var integer
     */
    const RENDERING_MODE_CLIP = 7;


  /** Text State methods **/

    /**
     * Set the char spacing.
     *
     * @param float $charSpacing
     * @return SetaPDF_Core_Canvas_Text
     */
    public function setCharacterSpacing($charSpacing = 0.)
    {
        SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $charSpacing);
        $this->_canvas->write(' Tc');

        if ($this->_canvas->getGraphicStateSync() & SetaPDF_Core_Canvas::GS_SYNC_TEXT) {
            $this->_canvas->graphicState()->text()->setCharacterSpacing($charSpacing);
        }

        return $this;
    }

    /**
     * Alias for setCharacterSpacing()
     *
     * @see setCharacterSpacing()
     * @param float $charSpacing
     * @deprecated
     * @return SetaPDF_Core_Canvas_Text
     */
    public function setCharSpacing($charSpacing = 0.)
    {
        return $this->setCharacterSpacing($charSpacing);
    }

    /**
     * Set the word spacing.
     *
     * You shall notice that this word spacing property affects the character which is assigned to "\x20" of a font
     * which uses a single byte encoding. When e.g. using subset fonts this setting will end in unwanted results.
     *
     * @param float $wordSpacing
     * @return SetaPDF_Core_Canvas_Text
     */
    public function setWordSpacing($wordSpacing = 0.)
    {
        SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $wordSpacing);
        $this->_canvas->write(' Tw');

        if ($this->_canvas->getGraphicStateSync() & SetaPDF_Core_Canvas::GS_SYNC_TEXT) {
            $this->_canvas->graphicState()->text()->setWordSpacing($wordSpacing);
        }

        return $this;
    }

    /**
     * Set the horizontal scaling.
     *
     * @param float $scaling
     * @return SetaPDF_Core_Canvas_Text
     */
    public function setScaling($scaling = 100.)
    {
        SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $scaling);
        $this->_canvas->write(' Tz');

        if ($this->_canvas->getGraphicStateSync() & SetaPDF_Core_Canvas::GS_SYNC_TEXT) {
            $this->_canvas->graphicState()->text()->setScaling($scaling);
        }

        return $this;
    }

    /**
     * Set the leading.
     *
     * @param float $leading
     * @return SetaPDF_Core_Canvas_Text
     */
    public function setLeading($leading = 0.)
    {
        SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $leading);
        $this->_canvas->write(' TL');

        if ($this->_canvas->getGraphicStateSync() & SetaPDF_Core_Canvas::GS_SYNC_TEXT) {
            $this->_canvas->graphicState()->text()->setLeading($leading);
        }

        return $this;
    }

    /**
     * Set the font.
     *
     * @param string|SetaPDF_Core_Font_FontInterface $name
     * @param float $size
     * @return SetaPDF_Core_Canvas_Text
     * @throws SetaPDF_Core_Font_Exception
     * @throws SetaPDF_Core_Type_IndirectReference_Exception
     * @throws SetaPDF_Exception_NotImplemented
     */
    public function setFont($name, $size = 12.)
    {
        $font = null;
        if ($name instanceof SetaPDF_Core_Font_FontInterface) {
            $font = $name;
            $name = $this->_canvas->addResource($name);
        }

        /**
         * @var $fonts SetaPDF_Core_Type_Dictionary
         */
        $fonts = $this->_canvas->getResources(true, false, 'Font');
        if (false === $fonts || !$fonts->offsetExists($name)) {
            throw new InvalidArgumentException('Unknown font: ' . $name);
        }

        SetaPDF_Core_Type_Name::writePdfString($this->_canvas, $name, true);
        SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $size);
        $this->_canvas->write(' Tf');

        if ($this->_canvas->getGraphicStateSync() & SetaPDF_Core_Canvas::GS_SYNC_TEXT) {
            if (null === $font) {
                $reference = $fonts->getValue($name);
                $font = SetaPDF_Core_Font::get($reference);
            }

            $this->_canvas->graphicState()->text()->setFont($font, $size);
        }

        return $this;
    }

    /**
     * Set the rendering mode.
     *
     * The available rendering modes are also available through class constants such as
     * SetaPDF_Core_Canvas_Text::RENDERING_MODE_CLIP.
     *
     * @see PDF reference 32000-1:2008 9.3.6 Text Rendering Mode
     * @param integer $renderingMode
     * @return SetaPDF_Core_Canvas_Text
     */
    public function setRenderingMode($renderingMode = 0)
    {
        SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $renderingMode);
        $this->_canvas->write(' Tr');

        if ($this->_canvas->getGraphicStateSync() & SetaPDF_Core_Canvas::GS_SYNC_TEXT) {
            $this->_canvas->graphicState()->text()->setRenderingMode($renderingMode);
        }

        return $this;
    }

    /**
     * Set text rise.
     *
     * @param float $rise
     * @return SetaPDF_Core_Canvas_Text
     */
    public function setRise($rise = 0.)
    {
        SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $rise);
        $this->_canvas->write(' Ts');

        if ($this->_canvas->getGraphicStateSync() & SetaPDF_Core_Canvas::GS_SYNC_TEXT) {
            $this->_canvas->graphicState()->text()->setRise($rise);
        }

        return $this;
    }

    /**
     * Alias for setRise()
     *
     * @param float $textRise
     * @return SetaPDF_Core_Canvas_Text
     * @see setRise()
     * @deprecated
     */
    public function setTextRise($textRise = 0.)
    {
        return $this->setRise($textRise);
    }

  /** Text Object operator methods **/

    /**
     * Begin a text object.
     *
     * @return SetaPDF_Core_Canvas_Text
     */
    public function begin()
    {
        $this->_canvas->write(' BT');

        if ($this->_canvas->getGraphicStateSync() & SetaPDF_Core_Canvas::GS_SYNC_TEXT) {
            $this->_canvas->graphicState()->text()->begin();
        }

        return $this;
    }

    /**
     * Alias for begin()
     *
     * @return SetaPDF_Core_Canvas_Text
     * @see begin()
     * @deprecated
     */
    public function beginText()
    {
        return $this->begin();
    }

    /**
     * End a text object.
     *
     * @return SetaPDF_Core_Canvas_Text
     */
    public function end()
    {
        $this->_canvas->write(' ET');

        if ($this->_canvas->getGraphicStateSync() & SetaPDF_Core_Canvas::GS_SYNC_TEXT) {
            $this->_canvas->graphicState()->text()->end();
        }

        return $this;
    }

    /**
     * Alias for end()
     *
     * @return SetaPDF_Core_Canvas_Text
     * @see end()
     * @deprecated
     */
    public function endText()
    {
        return $this->end();
    }



    /** Text-positioning operator methods **/

    /**
     * Move to the next line.
     *
     * @param float $x
     * @param float $y
     * @param boolean $setLeading
     * @return SetaPDF_Core_Canvas_Text
     */
    public function moveToNextLine($x, $y, $setLeading = false)
    {
        SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $x);
        SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $y);
        $this->_canvas->write($setLeading ? ' TD' : ' Td');

        if ($this->_canvas->getGraphicStateSync() & SetaPDF_Core_Canvas::GS_SYNC_TEXT) {
            $this->_canvas->graphicState()->text()->moveToNextLine($x, $y, $setLeading);
        }

        return $this;
    }

    /**
     * Move to the start of the next line.
     *
     * @return SetaPDF_Core_Canvas_Text
     */
    public function moveToStartOfNextLine()
    {
        $this->_canvas->write(' T*');

        if ($this->_canvas->getGraphicStateSync() & SetaPDF_Core_Canvas::GS_SYNC_TEXT) {
            $this->_canvas->graphicState()->text()->moveToStartOfNextLine();
        }

        return $this;
    }

    /**
     * Set the text matrix.
     *
     * @param float $a
     * @param float $b
     * @param float $c
     * @param float $d
     * @param float $e
     * @param float $f
     * @return SetaPDF_Core_Canvas_Text
     */
    public function setTextMatrix($a, $b, $c, $d, $e, $f)
    {
        SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $a);
        SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $b);
        SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $c);
        SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $d);
        SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $e);
        SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $f);

        $this->_canvas->write(' Tm');

        if ($this->_canvas->getGraphicStateSync() & SetaPDF_Core_Canvas::GS_SYNC_TEXT) {
            $this->_canvas->graphicState()->text()->setTextMatrix($a, $b, $c, $d, $e, $f);
        }

        return $this;
    }

  /** Text-Showing operator methods **/

    /**
     * Show text.
     *
     * @param string|string[] $text
     * @return SetaPDF_Core_Canvas_Text
     */
    public function showText($text)
    {
        if (is_array($text)) {
            $text = join('', $text);
        }

        SetaPDF_Core_Type_String::writePdfString($this->_canvas, $text);
        $this->_canvas->write(' Tj');

        if ($this->_canvas->getGraphicStateSync() & SetaPDF_Core_Canvas::GS_SYNC_TEXT) {
            $this->_canvas->graphicState()->text()->showText($text);
        }

        return $this;
    }

    /**
     * Move to the next line and show text.
     *
     * @param string|string[] $text
     * @param float $wordSpacing
     * @param float $charSpacing
     * @return SetaPDF_Core_Canvas_Text
     */
    public function moveToNextLineAndShowText($text, $wordSpacing = null, $charSpacing = null)
    {
        if (is_array($text)) {
            $text = join('', $text);
        }

        SetaPDF_Core_Type_String::writePdfString($this->_canvas, $text);
        if ($wordSpacing !== null && $charSpacing !== null) {
            SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $wordSpacing);
            SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $charSpacing);
            $this->_canvas->write(' "');
        } else {
            $this->_canvas->write(" '");
        }

        if ($this->_canvas->getGraphicStateSync() & SetaPDF_Core_Canvas::GS_SYNC_TEXT) {
            $this->_canvas->graphicState()->text()->moveToNextLineAndShowText($text, $wordSpacing, $charSpacing);
        }

        return $this;
    }

    /**
     * Shows text strings.
     *
     * @param array|string $textStrings
     * @return SetaPDF_Core_Canvas_Text
     */
    public function showTextStrings($textStrings)
    {
        if (!is_array($textStrings))
            $textStrings = [$textStrings];

        SetaPDF_Core_Type_Array::writePdfString($this->_canvas, $textStrings);
        $this->_canvas->write(' TJ');

        if ($this->_canvas->getGraphicStateSync() & SetaPDF_Core_Canvas::GS_SYNC_TEXT) {
            $this->_canvas->graphicState()->text()->showTextStrings($textStrings);
        }

        return $this;
    }
}