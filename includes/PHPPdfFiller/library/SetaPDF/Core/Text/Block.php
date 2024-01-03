<?php
/**
 * This file is part of the SetaPDF-Stamper Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Text
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Block.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class representing a text block which can be drawn onto a canvas object
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Text
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Text_Block
{
    /**
     * An array for caching calculation results
     *
     * @var array
     */
    protected $_dataCache = array();

    /**
     * A callback which is called if the internal data cache is cleared
     *
     * @var callback
     */
    protected $_dataCacheClearCallback;

    /**
     * The font to use
     *
     * @var SetaPDF_Core_Font_FontInterface
     */
    protected $_font;

    /**
     * The font size
     *
     * @var float|integer
     */
    protected $_fontSize = 12;

    /**
     * The text in user defined encoding
     *
     * @var string
     */
    protected $_text;

    /**
     * The encoding of the text
     *
     * @var string
     */
    protected $_encoding = 'UTF-8';

    /**
     * The text string in UTF-16BE encoding for internal usage
     *
     * @var string
     */
    protected $_internalText;

    /**
     * The text alignment
     *
     * @var string
     */
    protected $_align = SetaPDF_Core_Text::ALIGN_LEFT;

    /**
     * A specific width of this text stamp
     *
     * @var number
     */
    protected $_width = null;

    /**
     * The rendering mode
     *
     * @var integer
     */
    protected $_renderingMode = SetaPDF_Core_Canvas_Text::RENDERING_MODE_FILL;

    /**
     * The line height
     *
     * @var null|number
     */
    protected $_lineHeight = null;

    /**
     * The text color
     *
     * @var null|SetaPDF_Core_DataStructure_Color
     */
    protected $_textColor = null;

    /**
     * The color of the text outline
     *
     * @var null|SetaPDF_Core_DataStructure_Color
     */
    protected $_outlineColor = null;

    /**
     * The color of the text underline.
     *
     * If the color is defined as null, we will use the text color instead.
     *
     * @var null|SetaPDF_Core_DataStructure_Color
     */
    protected $_underlineColor = null;

    /**
     * Flag saying whether to draw the underline or not.
     *
     * @var bool
     */
    protected $_underline = false;

    /**
     * The outline width
     *
     * @var number
     */
    protected $_outlineWidth = 1.;

    /**
     * The character spacing value
     *
     * @var number
     */
    protected $_charSpacing = 0;

    /**
     * Word spacing value
     *
     * @var number
     */
    protected $_wordSpacing = 0;

    /**
     * The background color
     *
     * @var null|SetaPDF_Core_DataStructure_Color
     */
    protected $_backgroundColor = null;

    /**
     * The border color
     *
     * @var null|SetaPDF_Core_DataStructure_Color
     */
    protected $_borderColor = null;

    /**
     * The border width
     *
     * @var number
     */
    protected $_borderWidth = 0;

    /**
     * Padding top value
     *
     * @var number
     */
    protected $_paddingTop = 0;

    /**
     * Padding right value
     *
     * @var number
     */
    protected $_paddingRight = 0;

    /**
     * Padding bottom value
     *
     * @var number
     */
    protected $_paddingBottom = 0;

    /**
     * Padding left value
     *
     * @var number
     */
    protected $_paddingLeft = 0;

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Font_FontInterface $font
     * @param number $fontSize
     */
    public function __construct(SetaPDF_Core_Font_FontInterface $font, $fontSize = null)
    {
        $this->setFont($font, $fontSize);
    }

    /**
     * Release resources / cycled references.
     */
    public function cleanUp()
    {
        $this->_font = null;
    }

    /**
     * Sets a callback function which is called if the internal cache is cleared.
     *
     * @param callback $callback
     */
    public function setDataCacheClearCallback($callback)
    {
        $this->_dataCacheClearCallback = $callback;
    }

    /**
     * Clears the internal data cache.
     */
    protected function _clearDataCache()
    {
        $this->_dataCache = array();
        if (is_callable($this->_dataCacheClearCallback)) {
            call_user_func($this->_dataCacheClearCallback);
        }
    }

    /**
     * Set the font object and size.
     *
     * @param SetaPDF_Core_Font_FontInterface $font
     * @param number $fontSize
     */
    public function setFont(SetaPDF_Core_Font_FontInterface $font, $fontSize = null)
    {
        $this->_font = $font;
        if ($fontSize !== null)
            $this->_fontSize = $fontSize;
        $this->_clearDataCache();
    }

    /**
     * Set the font size.
     *
     * If -1 is passed the font size is calculated based on the available {@link setWidth() width} and the text content.
     *
     * @param number $fontSize
     */
    public function setFontSize($fontSize)
    {
        if ($fontSize !== $this->_fontSize)
            $this->_clearDataCache();

        $this->_fontSize = $fontSize;
    }

    /**
     * Get the font object.
     *
     * @return SetaPDF_Core_Font_FontInterface
     */
    public function getFont()
    {
        return $this->_font;
    }

    /**
     * Get the font size.
     *
     * If the font size was initially set to -1 this method will calculate the font size based on the available
     * {@link setWidth() width} and the text content.
     *
     * @return number
     */
    public function getFontSize()
    {
        if ($this->_fontSize == -1) {
            if (null === $this->_width) {
                throw new BadMethodCallException('A width has to be set if the font size is set to auto (-1).');
            }

            if (isset($this->_dataCache['autoFontSize'])) {
                return $this->_dataCache['autoFontSize'];
            }

            $lines = SetaPDF_Core_Text::getLines($this->_internalText);

            $fontSize = 0.1;
            $stepSize = 0.15;

            while (true) {
                $width = $this->_getTextWidth($fontSize, $lines);
                if ($width >= $this->_width) {
                    $this->_dataCache['autoFontSize'] = $fontSize - $stepSize;
                    return $this->_dataCache['autoFontSize'];
                }

                $fontSize += $stepSize;
            }
        }

        return $this->_fontSize;
    }

    /**
     * Set the text.
     *
     * @param string $text
     * @param string $encoding The encoding of $text
     */
    public function setText($text, $encoding = 'UTF-8')
    {
        $internalText = SetaPDF_Core_Text::normalizeLineBreaks(
            SetaPDF_Core_Encoding::convert($text, $encoding, 'UTF-16BE')
        );

        if ($internalText !== $this->_internalText)
            $this->_clearDataCache();

        $this->_text = (string)$text;

        $this->_encoding = $encoding;
        $this->_internalText = $internalText;
    }

    /**
     * Get the text.
     *
     * @param string $encoding
     * @return string
     */
    public function getText($encoding = 'UTF-8')
    {
        if ($encoding === $this->_encoding)
            return $this->_text;

        return SetaPDF_Core_Encoding::convert($this->_text, $this->_encoding, $encoding);
    }

    /**
     * Set the text alignment.
     *
     * @param string $align
     */
    public function setAlign($align)
    {
        if ($align !== $this->_align)
            $this->_clearDataCache();

        $this->_align = $align;

        if ($align === SetaPDF_Core_Text::ALIGN_JUSTIFY) {
            $this->setWordSpacing(0);
        }
    }

    /**
     * Get the text alignment.
     *
     * @return string
     */
    public function getAlign()
    {
        return $this->_align;
    }

    /**
     * Set the line height / leading.
     *
     * @param float|integer|null $lineHeight
     */
    public function setLineHeight($lineHeight)
    {
        if ($lineHeight !== $this->_lineHeight)
            $this->_clearDataCache();

        $this->_lineHeight = $lineHeight;
    }

    /**
     * Get the line height / leading.
     *
     * If no explicit line height is defined this method will return a line height
     * based on the lly and ury values of the font bounding box.
     *
     * @return number
     */
    public function getLineHeight()
    {
        if (null === $this->_lineHeight) {
            $fontBBox = $this->_font->getFontBBox();
            return $this->getFontSize() * ($fontBBox[3] - $fontBBox[1]) / 1000;
        }

        return $this->_lineHeight;
    }

    /**
     * Set the underline color.
     *
     * @see SetaPDF_Core_DataStructure_Color::createByComponents()
     * @param SetaPDF_Core_DataStructure_Color|SetaPDF_Core_Type_Array|array|number|null $color
     */
    public function setUnderlineColor($color)
    {
        if ($color !== null && !$color instanceof SetaPDF_Core_DataStructure_Color)
            $color = SetaPDF_Core_DataStructure_Color::createByComponents($color);

        $this->_underlineColor = $color;
    }

    /**
     * Get the underline color.
     *
     * If no underline color is defined the text color is returned.
     *
     * @return SetaPDF_Core_DataStructure_Color
     */
    public function getUnderlineColor()
    {
        if (null === $this->_underlineColor)
            return $this->getTextColor();

        return $this->_underlineColor;
    }

    /**
     * Set whether to draw an underline or not.
     *
     * If you want an underline color that differs from the text color use {@see setUnderlineColor()}.
     *
     * @param bool $underline
     */
    public function setUnderline($underline)
    {
        $this->_underline = (boolean)$underline;
    }

    /**
     * Gets whether to draw an underline or not.
     *
     * @return bool
     */
    public function getUnderline()
    {
        return $this->_underline;
    }

    /**
     * Set the text color.
     *
     * @see SetaPDF_Core_DataStructure_Color::createByComponents()
     * @param SetaPDF_Core_DataStructure_Color|SetaPDF_Core_Type_Array|array|number|string $color
     */
    public function setTextColor($color)
    {
        if (!$color instanceof SetaPDF_Core_DataStructure_Color)
            $color = SetaPDF_Core_DataStructure_Color::createByComponents($color);

        if ($color !== $this->_textColor)
            $this->_clearDataCache();

        $this->_textColor = $color;
    }

    /**
     * Get the text color object.
     *
     * If no text color is defined a greyscale black color will be returned.
     *
     * @return SetaPDF_Core_DataStructure_Color
     */
    public function getTextColor()
    {
        if (null === $this->_textColor)
            $this->_textColor = new SetaPDF_Core_DataStructure_Color_Gray(0);

        return $this->_textColor;
    }

    /**
     * Set the texts outline color.
     *
     * Only used with a specific text rendering mode.
     *
     * @see SetaPDF_Core_DataStructure_Color::createByComponents()
     * @see setRenderingMode()
     * @param SetaPDF_Core_DataStructure_Color|SetaPDF_Core_Type_Array|array|number $color
     */
    public function setOutlineColor($color)
    {
        if (!$color instanceof SetaPDF_Core_DataStructure_Color)
            $color = SetaPDF_Core_DataStructure_Color::createByComponents($color);

        if ($color !== $this->_outlineColor)
            $this->_clearDataCache();

        $this->_outlineColor = $color;
    }

    /**
     * Get the texts outline color object.
     *
     * If no outline color is defined the a greyscale black color will be returned.
     * The outline color is only used at specific rendering modes.
     *
     * @see setRenderingMode()
     * @return SetaPDF_Core_DataStructure_Color
     */
    public function getOutlineColor()
    {
        if (null === $this->_outlineColor)
            $this->_outlineColor = new SetaPDF_Core_DataStructure_Color_Gray(0);

        return $this->_outlineColor;
    }

    /**
     * Set the outline width.
     *
     * The outline width is only used at specific rendering modes.
     *
     * @param float $outlineWidth
     */
    public function setOutlineWidth($outlineWidth)
    {
        $this->_outlineWidth = (float)$outlineWidth;
    }

    /**
     * Get the outline width.
     *
     * The outline width is only used at specific rendering modes.
     *
     * @return float
     */
    public function getOutlineWidth()
    {
        return $this->_outlineWidth;
    }

    /**
     * Set the background color.
     *
     * @see SetaPDF_Core_DataStructure_Color::createByComponents()
     * @param SetaPDF_Core_DataStructure_Color|SetaPDF_Core_Type_Array|array|number|null $color
     */
    public function setBackgroundColor($color)
    {
        if (!$color instanceof SetaPDF_Core_DataStructure_Color && $color !== null)
            $color = SetaPDF_Core_DataStructure_Color::createByComponents($color);

        if ($color !== $this->_backgroundColor)
            $this->_clearDataCache();

        $this->_backgroundColor = $color;
    }

    /**
     * Get the background color object.
     *
     * @return null|SetaPDF_Core_DataStructure_Color
     */
    public function getBackgroundColor()
    {
        return $this->_backgroundColor;
    }

    /**
     * Set the border color.
     *
     * @see SetaPDF_Core_DataStructure_Color::createByComponents()
     * @param SetaPDF_Core_DataStructure_Color|SetaPDF_Core_Type_Array|array|number|null $color
     */
    public function setBorderColor($color)
    {
        if (!$color instanceof SetaPDF_Core_DataStructure_Color && $color !== null)
            $color = SetaPDF_Core_DataStructure_Color::createByComponents($color);

        if ($color !== $this->_borderColor)
            $this->_clearDataCache();

        $this->_borderColor = $color;
    }

    /**
     * Get the border color object.
     *
     * If no border color is defined the a greyscale black color will be returned.
     *
     * @return null|SetaPDF_Core_DataStructure_Color
     */
    public function getBorderColor()
    {
        if (null === $this->_borderColor)
            $this->_borderColor = new SetaPDF_Core_DataStructure_Color_Gray(0);

        return $this->_borderColor;
    }

    /**
     * Set the border width.
     *
     * @param number $borderWidth
     */
    public function setBorderWidth($borderWidth)
    {
        if ($borderWidth != $this->_borderWidth)
            $this->_clearDataCache();

        $this->_borderWidth = (float)$borderWidth;
    }

    /**
     * Get the border width.
     *
     * @return number
     */
    public function getBorderWidth()
    {
        return $this->_borderWidth;
    }

    /**
     * Set the width of the text block.
     *
     * @param number $width
     */
    public function setWidth($width)
    {
        if ($width != $this->_width)
            $this->_clearDataCache();

        $this->_width = $width;
    }

    /**
     * Get the width of the stamp object.
     *
     * This method returns the complete width of the text block. To get only the width of the
     * text use the {@link getTextWidth()} method.
     *
     * The value set in {@link setWidth()} may be differ to the one returned by this method
     * because of padding values.
     *
     * @return number
     */
    public function getWidth()
    {
        return $this->getTextWidth() + ($this->getPaddingLeft() + $this->getPaddingRight());
    }

    /**
     * Get the width of the longest text line.
     *
     * @return number
     */
    public function getTextWidth()
    {
        if ($this->_width !== null)
            return $this->_width;

        if (!isset($this->_dataCache['textWidth'])) {
            $this->_dataCache['textWidth'] = $this->_getTextWidth($this->getFontSize(), $this->_getLines());
        }

        return $this->_dataCache['textWidth'];
    }

    /**
     * Get the text width by an array of text lines.
     *
     * @param $fontSize
     * @param array $lines
     * @return int|mixed
     */
    private function _getTextWidth($fontSize, array $lines)
    {
        $textWidth = 0;
        foreach ($lines AS $line) {
            $spacing = 0;
            if ($this->_wordSpacing != 0) {
                $spaces = substr_count($line, "\x00\x20");
                $spacing += $spaces * $this->_wordSpacing;
            }

            if ($this->_charSpacing != 0) {
                $spacing += (SetaPDF_Core_Encoding::strlen($line, 'UTF-16BE') - 1) * $this->_charSpacing;
            }

            $textWidth = max($textWidth, ($this->_font->getGlyphsWidth($line) / 1000 * $fontSize) + $spacing);
        }

        return $textWidth;
    }

    /**
     * Set the rendering mode.
     *
     * @see SetaPDF_Core_Canvas_Text::setRenderingMode()
     * @param integer $renderingMode
     */
    public function setRenderingMode($renderingMode = 0)
    {
        $this->_renderingMode = (int)$renderingMode;
    }

    /**
     * Get the defined rendering mode.
     *
     * @see SetaPDF_Core_Canvas_Text::setRenderingMode()
     * @return number
     */
    public function getRenderingMode()
    {
        return $this->_renderingMode;
    }

    /**
     * Set the padding.
     *
     * @param number $padding
     */
    public function setPadding($padding)
    {
        $this->setPaddingTop($padding);
        $this->setPaddingRight($padding);
        $this->setPaddingBottom($padding);
        $this->setPaddingLeft($padding);
    }

    /**
     * Set the top padding.
     *
     * @param number $paddingTop
     */
    public function setPaddingTop($paddingTop)
    {
        if ($paddingTop != $this->_paddingTop)
            $this->_clearDataCache();

        $this->_paddingTop = (float)$paddingTop;
    }

    /**
     * Get the top padding.
     *
     * @return number
     */
    public function getPaddingTop()
    {
        return $this->_paddingTop;
    }

    /**
     * Set the right padding.
     *
     * @param number $paddingRight
     */
    public function setPaddingRight($paddingRight)
    {
        if ($paddingRight != $this->_paddingRight)
            $this->_clearDataCache();

        $this->_paddingRight = (float)$paddingRight;
    }

    /**
     * Get the right padding.
     *
     * @return number
     */
    public function getPaddingRight()
    {
        return $this->_paddingRight;
    }

    /**
     * Set the bottom padding.
     *
     * @param number $paddingBottom
     */
    public function setPaddingBottom($paddingBottom)
    {
        if ($paddingBottom != $this->_paddingBottom)
            $this->_clearDataCache();

        $this->_paddingBottom = (float)$paddingBottom;
    }

    /**
     * Get the bottom padding.
     *
     * @return number
     */
    public function getPaddingBottom()
    {
        return $this->_paddingBottom;
    }

    /**
     * Set the left padding.
     *
     * @param number $paddingLeft
     */
    public function setPaddingLeft($paddingLeft)
    {
        if ($paddingLeft != $this->_paddingLeft)
            $this->_clearDataCache();

        $this->_paddingLeft = (float)$paddingLeft;
    }

    /**
     * Get the left padding.
     *
     * @return number
     */
    public function getPaddingLeft()
    {
        return $this->_paddingLeft;
    }

    /**
     * Set the character spacing value.
     *
     * @param number $charSpacing
     */
    public function setCharSpacing($charSpacing)
    {
        if ($charSpacing != $this->_charSpacing)
            $this->_clearDataCache();

        $this->_charSpacing = (float)$charSpacing;
    }

    /**
     * Get the character spacing value.
     *
     * @return number
     */
    public function getCharSpacing()
    {
        return $this->_charSpacing;
    }

    /**
     * Set the word spacing value.
     *
     * @param number $wordSpacing
     */
    public function setWordSpacing($wordSpacing)
    {
        if ($wordSpacing != $this->_wordSpacing)
            $this->_clearDataCache();

        $this->_wordSpacing = (float)$wordSpacing;

        if ($this->getAlign() === SetaPDF_Core_Text::ALIGN_JUSTIFY && $wordSpacing != 0) {
            $this->setAlign(SetaPDF_Core_Text::ALIGN_LEFT);
        }
    }

    /**
     * Get the word spacing value.
     *
     * @return number
     */
    public function getWordSpacing()
    {
        return $this->_wordSpacing;
    }

    /**
     * Get the text as lines and caches the result.
     *
     * @return array
     */
    protected function _getLines()
    {
        if (!isset($this->_dataCache['lines'])) {
            $this->_dataCache['lines'] = SetaPDF_Core_Text::getLines(
                $this->_internalText, $this->_width, $this->_font, $this->getFontSize(),
                $this->_charSpacing, $this->_wordSpacing
            );
        }

        return $this->_dataCache['lines'];
    }

    /**
     * Get the line count of the text block.
     *
     * @return integer
     */
    public function getLineCount()
    {
        return count($this->_getLines());
    }

    /**
     * Get the height of this text block.
     *
     * Calculation is done by number of lines, line-height and top and bottom padding values.
     *
     * @see SetaPDF_Stamper_Stamp::getHeight()
     * @return number
     */
    public function getHeight()
    {
        return $this->getTextHeight() + $this->getPaddingTop() + $this->getPaddingBottom();
    }

    /**
     * Get the height of the text.
     *
     * @return number
     */
    public function getTextHeight()
    {
        return $this->getLineCount() * $this->getLineHeight();
    }

    /**
     * Draws the text block onto a canvas.
     *
     * @param SetaPDF_Core_Canvas $canvas
     * @param number $x The lower left x-value of the text block
     * @param number $y The lower left y-value of the text block
     */
    public function draw(SetaPDF_Core_Canvas $canvas, $x, $y)
    {
        $canvas->saveGraphicState();

        $this->_drawBorderAndBackground($canvas, $x, $y);
        $this->_drawRenderingMode($canvas);
        $this->_drawText($canvas, $x, $y);

        $canvas->restoreGraphicState();
    }

    /**
     * Get the correct x-value for the text string to start writing.
     *
     * @param number $x
     * @return number
     */
    protected function _fixX($x)
    {
        return $x + $this->getPaddingLeft();
    }

    /**
     * Get the correct y-value for the text string to start writing.
     *
     * @param number $y
     * @return number
     */
    protected function _fixY($y)
    {
        $y += $this->getHeight();

        $fontBBox = $this->_font->getFontBBox();
        $ury = $this->getFontSize() * $fontBBox[1] / 1000;
        $lly = $this->getFontSize() * $fontBBox[3] / 1000;

        $y -= $ury;
        $y -= ($this->getLineHeight() - ($ury - $lly)) / 2;
        $y -= $this->getPaddingTop();

        return $y;
    }

    /**
     * Draws the text onto the canvas.
     *
     * @param SetaPDF_Core_Canvas $canvas
     * @param number $x The lower left x-value of the text block
     * @param number $y The lower left y-value of the text block
     */
    protected function _drawText(SetaPDF_Core_Canvas $canvas, $x, $y)
    {
        $x = $this->_fixX($x);
        $y = $this->_fixY($y);

        $lines = $this->_getLines();
        $underlines = [];

        $text = $canvas->text();
        $text->begin()
            ->setFont($this->_font, $this->getFontSize())
            ->setLeading($this->getLineHeight())
            ->moveToNextLine($x, $y);

        $currentY = $y;

        $lineLeft = $prevLineLeft = 0;
        $textWidth = $this->getTextWidth();

        $wordSpacing = $this->_wordSpacing;
        $text->setCharacterSpacing($this->_charSpacing);

        $lastLineNo = count($lines) - 1;
        foreach ($lines AS $lineNo => $line) {
            $spaces = substr_count($line, "\x00\x20");

            if ($this->_align !== SetaPDF_Core_Text::ALIGN_LEFT && $line) {
                // Trim white spaces from the right side
                $lineLen = SetaPDF_Core_Encoding::strlen($line, 'UTF-16BE');
                while (SetaPDF_Core_Encoding::substr($line, $lineLen - 1, 1, 'UTF-16BE') === "\x00\x20") {
                    $lineLen--;
                    $spaces--;
                    $line = SetaPDF_Core_Encoding::substr($line, 0, $lineLen, 'UTF-16BE');
                }
            }

            if ($this->_align === SetaPDF_Core_Text::ALIGN_JUSTIFY && $line) {
                // Trim white spaces from the left side
                $lineLen = SetaPDF_Core_Encoding::strlen($line, 'UTF-16BE');
                while (SetaPDF_Core_Encoding::substr($line, 0, 1, 'UTF-16BE') === "\x00\x20" && $spaces > 0) {
                    $lineLen--;
                    $spaces--;
                    $line = SetaPDF_Core_Encoding::substr($line, 1, $lineLen, 'UTF-16BE');
                }
            }

            if (($this->_align !== SetaPDF_Core_Text::ALIGN_LEFT && $line) || $this->_underline) {
                $glyphWidth = $this->_font->getGlyphsWidth($line) / 1000;
                // calculate the total string width
                $stringWidth = $glyphWidth * $this->getFontSize();

                if ($this->_charSpacing != 0) {
                    $stringWidth += ($this->_charSpacing * (SetaPDF_Core_Encoding::strlen($line, 'UTF-16BE') - 1));
                }

                if ($this->_wordSpacing != 0) {
                    $stringWidth += ($this->_wordSpacing * $spaces);
                }

                switch ($this->_align) {
                    case SetaPDF_Core_Text::ALIGN_CENTER:
                        $lineLeft = ($textWidth / 2) - ($stringWidth / 2);
                        break;
                    case SetaPDF_Core_Text::ALIGN_RIGHT:
                        $lineLeft = $textWidth - $stringWidth;
                        break;
                    case SetaPDF_Core_Text::ALIGN_JUSTIFY:
                        if ($lastLineNo === $lineNo) {
                            $wordSpacing = 0;
                            break;
                        }

                        if ($spaces > 0) {
                            $wordSpacing = ($textWidth - $stringWidth) / $spaces;
                        } else {
                            $wordSpacing = 0;
                        }
                }
            }

            $charCodes = $this->_font->getCharCodes($line);

            if (($lineLeft - $prevLineLeft) != 0) {
                $text->moveToNextLine($lineLeft - $prevLineLeft, 0);
            }

            $prevLineLeft = $lineLeft;

            if ($this->_underline) {
                $width = $stringWidth;
            }

            if ($wordSpacing && $spaces > 0) {
                $spaceCharCode = $this->_font->getCharCodes("\x00\x20")[0];
                $buffer = [];
                $stringBuffer = '';
                foreach ($charCodes as $charCode) {
                    if ($charCode === $spaceCharCode) {
                        if ($stringBuffer != '') {
                            $buffer[] = $stringBuffer;
                            $stringBuffer = '';
                        }

                        $buffer[] = -$wordSpacing * 1000 / $this->_fontSize;
                        if ($this->_underline) {
                            $width += $wordSpacing;
                        }
                    }

                    $stringBuffer .= $charCode;
                }

                if ($stringBuffer != '') {
                    $buffer[] = $stringBuffer;
                }

                $text->showTextStrings($buffer);
            } else {
                $text->showText($charCodes);
            }

            if ($this->_underline && count($charCodes) > 0) {
                $underlines[] = [
                    $lineLeft + $x,
                    $currentY + ($this->_font->getUnderlinePosition() / 1000 * $this->_fontSize),
                    $width,
                    -($this->_font->getUnderlineThickness() / 1000 * $this->_fontSize)
                ];
            }

            $text->moveToStartOfNextLine();
            $currentY -= $this->getLineHeight();
        }
        $text->end();

        if ($this->_underline) {
            $canvas->setNonStrokingColor($this->getUnderlineColor());
            foreach ($underlines as $underline) {
                list($_x, $_y, $w, $h) = $underline;
                $canvas->draw()->rect($_x, $_y, $w, $h, SetaPDF_Core_Canvas_Draw::STYLE_FILL);
            }
            $canvas->setNonStrokingColor($this->getTextColor());
        }
    }

    /**
     * Adds rendering mode specific data onto the canvas.
     *
     * @param SetaPDF_Core_Canvas $canvas
     */
    protected function _drawRenderingMode(SetaPDF_Core_Canvas $canvas)
    {
        if ($this->_renderingMode !== SetaPDF_Core_Canvas_Text::RENDERING_MODE_FILL)
            $canvas->text()->setRenderingMode($this->_renderingMode);

        switch ($this->_renderingMode) {
            case SetaPDF_Core_Canvas_Text::RENDERING_MODE_FILL:
            case SetaPDF_Core_Canvas_Text::RENDERING_MODE_FILL_AND_CLIP:
                $canvas->setNonStrokingColor($this->getTextColor());
                break;
            case SetaPDF_Core_Canvas_Text::RENDERING_MODE_STROKE:
            case SetaPDF_Core_Canvas_Text::RENDERING_MODE_STROKE_AND_CLIP:
                $canvas->path()->setLineWidth($this->getOutlineWidth());
                $canvas->setStrokingColor($this->getOutlineColor());
                break;
            case SetaPDF_Core_Canvas_Text::RENDERING_MODE_FILL_AND_STROKE:
            case SetaPDF_Core_Canvas_Text::RENDERING_MODE_FILL_STROKE_AND_CLIP:
                $canvas->path()->setLineWidth($this->getOutlineWidth());
                $canvas->setNonStrokingColor($this->getTextColor());
                $canvas->setStrokingColor($this->getOutlineColor());
                break;
        }
    }

    /**
     * Draws the border and background onto the canvas.
     *
     * @param SetaPDF_Core_Canvas $canvas
     * @param number $x The lower left x-value of the text block
     * @param number $y The lower left y-value of the text block
     */
    protected function _drawBorderAndBackground(SetaPDF_Core_Canvas $canvas, $x, $y)
    {
        $borderWidth = $this->getBorderWidth();
        $drawStyle = 0;
        if ($borderWidth > 0) {
            $canvas->path()->setLineWidth($borderWidth);
            $canvas->setStrokingColor($this->getBorderColor());
            $drawStyle |= SetaPDF_Core_Canvas_Draw::STYLE_DRAW;
        }

        $backgroundColor = $this->getBackgroundColor();
        if ($backgroundColor !== null) {
            $canvas->setNonStrokingColor($backgroundColor);
            $drawStyle |= SetaPDF_Core_Canvas_Draw::STYLE_FILL;
        }

        if ($drawStyle > 0) {
            $canvas->draw()->rect($x, $y, $this->getWidth(), $this->getHeight(), $drawStyle);
        }
    }
}