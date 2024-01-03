<?php
/**
 * This file is part of the SetaPDF-FormFiller Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_FormFiller
 * @subpackage Field
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Text.php 1371 2019-08-27 09:05:29Z jan.slabon $
 */

/**
 * A text field
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_FormFiller
 * @subpackage Field
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_FormFiller_Field_Text
    extends SetaPDF_FormFiller_Field_AbstractField
    implements SetaPDF_FormFiller_Field_FieldInterface
{
    /**
     * Constant saying that no text overflows the visible area
     *
     * @var integer
     */
    const OVERFLOWS_NONE = 0;

    /**
     * Constant saying that text overflows vertically
     *
     * @var integer
     */
    const OVERFLOWS_VERTICALLY = 1;

    /**
     * Constant saying that text overflows horizontally
     *
     * @var integer
     */
    const OVERFLOWS_HORIZONTALLY = 2;

    /**
     * @var SetaPDF_FormFiller_Field_AdditionalActions
     */
    protected $_additionalActions;

    /**
     * Data to be used for translation of the initial x/y coordinates of the field appearance.
     *
     * @var array
     */
    protected $_textTranslateData = ['x' => .0, 'y' => .0];

    /**
     * Flag indicating that the text overflows the visible area of the field.
     *
     * @var integer|null
     */
    protected $_textOverflow = null;

    /**
     * Defines whether observing text overflow is enabled or not
     *
     * @var boolean
     */
    protected $_observeTextOverflow = false;

    /**
     * A callback that may change the appearance value (e.g. format a number)
     *
     * @var callback
     */
    protected $_appearanceValueCallback;

    /**
     * Release cycled references and release memory.
     *
     * @return void
     */
    public function cleanUp()
    {
        parent::cleanUp();
        if (null !== $this->_additionalActions) {
            $this->_additionalActions->cleanUp();
            $this->_additionalActions = null;
        }
    }

    /**
     * Check if the visible text overflows the visible area.
     *
     * @return null|integer If the annotation was not rendered null is returned. Otherwise 1 if the text overflows
     *                      vertically or 2 if the text overflows horizontally. 3 for both.
     */
    public function getTextOverflow()
    {
        return $this->_textOverflow;
    }

    /**
     * Set whether observing text overflow is enabled or not.
     *
     * @param boolean $observeTextOverflow
     */
    public function setObserveTextOverflow($observeTextOverflow)
    {
        $this->_observeTextOverflow = (boolean)$observeTextOverflow;
        if (false == $observeTextOverflow) {
            $this->_textOverflow = null;
        }
    }

    /**
     * Get whether observing text overflow is enabled or not.
     *
     * @return boolean
     */
    public function getObserveTextOverflow()
    {
        return $this->_observeTextOverflow;
    }

    /**
     * Purges the value accoring to field properties like "multiline" or "max-length".
     *
     * @param string $value Value in UTF-16BE encoding
     * @return string
     */
    protected function _purgeValue($value)
    {
        $multiline = $this->isMultiline();
        if (false === $multiline) {
            $value = str_replace([
                // replace line breaks and tab with spaces
                "\x00\x0d\x00\x0a",
                "\x00\x0d",
                "\x00\x0a",
                // tab to space
                "\x00\x09"
            ], "\x00\x20", $value);
        } else {
            // normalize line breaks and convert tabs to spaces
            $value = str_replace("\x00\x09", "\x00\x20", SetaPDF_Core_Text::normalizeLineBreaks($value));
        }

        $maxLength = $this->getMaxLength();
        if ($maxLength) {
            $value = SetaPDF_Core_Encoding::substr($value, 0, $maxLength, 'UTF-16BE');
        }

        return $value;
    }

    /**
     * Returns the default value of the field.
     *
     * This value is used if the form is reset.
     *
     * @param string $encoding
     * @return null|string
     * @see SetaPDF_FormFiller_Field_FieldInterface::getDefaultValue()
     */
    public function getDefaultValue($encoding = 'UTF-8')
    {
        $dv = SetaPDF_Core_Type_Dictionary_Helper::resolveAttribute($this->_fieldDictionary, 'DV');
        if (!$dv) {
            return null;
        }

        return SetaPDF_Core_Encoding::convertPdfString($dv->getValue(), $encoding);
    }

    /**
     * Set the default value of the field.
     *
     * @param null|string $value
     * @param string $encoding
     */
    public function setDefaultValue($value, $encoding = 'UTF-8')
    {
        $this->_checkPermission(SetaPDF_Core_SecHandler::PERM_MODIFY);

        if (null === $value) {
            $dict = SetaPDF_Core_Type_Dictionary_Helper::resolveDictionaryByAttribute($this->_fieldDictionary, 'DV');
            if ($dict) {
                $dict->offsetUnset('DV');
            }

            $this->_fields->forwardValueToRelated($value, $this, $encoding, 'setDefaultValue');
            return;
        }

        $originalValue = $value;

        // Convert value to UTF-16BE
        $value = SetaPDF_Core_Encoding::convert($value, $encoding, 'UTF-16BE');
        $value = $this->_purgeValue($value);

        $currentValue = $this->getDefaultValue('UTF-16BE');
        if ($currentValue === $value && false === $this->_fields->isForwardValueActive()) {
            return;
        }

        $value = "\xFE\xFF" . $value;

        $tObject = SetaPDF_Core_Type_Dictionary_Helper::resolveDictionaryByAttribute($this->_fieldDictionary, 'T');
        $tObject->offsetSet('DV', new SetaPDF_Core_Type_String($value));

        $this->_fields->forwardValueToRelated($originalValue, $this, $encoding, 'setDefaultValue');
    }

    /**
     * Get the field value.
     *
     * @param string $encoding The output encoding
     * @return string
     * @see SetaPDF_FormFiller_Field_FieldInterface::getValue()
     */
    public function getValue($encoding = 'UTF-8')
    {
        /* We have to get the V entry from the dictionary holding the T entry, because
         * some documents have corrupted /V entries in their terminal fields (the
         * entries in a Kids array)
         * 
         * This way, we make sure, that the V entry is bound to the dictionary in
         * which the name (T) is defined.
         */
        $tObject = SetaPDF_Core_Type_Dictionary_Helper::resolveDictionaryByAttribute($this->_fieldDictionary, 'T');
        if (!$tObject->offsetExists('V')) {
            return '';
        }

        $value = $tObject->offsetGet('V')->ensure()->getValue();

        return SetaPDF_Core_Encoding::convertPdfString($value, $encoding);
    }

    /**
     * Set the field value.
     *
     * If the fields multiline flag is set (see {@link isMultiline()}) the method accepts a string of several lines.
     *
     * All common line delemitters are possible: \r\n, \n or \r
     *
     * Internally they get normalized. So if you need to compare a value of the {@link getValue()} method keep this in
     * mind.
     *
     * @param string $value The text field value
     * @param string $encoding The input encoding
     * @return void
     */
    public function setValue($value, $encoding = 'UTF-8')
    {
        $this->_checkPermission();

        $originalValue = $value;
        // Convert value to UTF-16BE
        $value = SetaPDF_Core_Encoding::convert($value, $encoding, 'UTF-16BE');
        $value = $this->_purgeValue($value);

        $currentValue = $this->getValue('UTF-16BE');
        if ($currentValue === $value && false === $this->_fields->isForwardValueActive()) {
            return;
        }

        $value = "\xFE\xFF" . $value;

        $tObject = SetaPDF_Core_Type_Dictionary_Helper::resolveDictionaryByAttribute($this->_fieldDictionary, 'T');
        $tObject->offsetSet('V', new SetaPDF_Core_Type_String($value));

        $this->recreateAppearance();

        $this->_fields->forwardValueToRelated($originalValue, $this, $encoding);
    }

    /**
     * Set the appearance value callback (to e.g. format a number).
     *
     * The callback will be called with 2 arguments:
     *  1. A reference to the field instance
     *  2. The requested encoding
     *
     * It needs to return a value in the specified encoding (internal calls need UTF-16BE throughout).
     *
     * @param callback $callback
     */
    public function setAppearanceValueCallback($callback)
    {
        $this->_appearanceValueCallback = $callback;
    }

    /**
     * Get the appearance value.
     *
     * @param string $encoding
     * @return string
     */
    public function getAppearanceValue($encoding = 'UTF-8')
    {
        if (!is_callable($this->_appearanceValueCallback)) {
            return $this->getValue($encoding);
        }

        return call_user_func($this->_appearanceValueCallback, $this, $encoding);
    }

    /**
     * Recreate or creates the Appearance of the form field.
     *
     * @return void
     */
    public function recreateAppearance()
    {
        $observeTextOverflow = $this->getObserveTextOverflow();

        if ($observeTextOverflow) {
            $this->_textOverflow = self::OVERFLOWS_NONE;
        }

        // Render the border and background
        $canvas = parent::_recreateAppearance();
        $value = $this->getAppearanceValue('UTF-16BE');

        if ($value) {
            // Password-Field?
            if ($this->isPasswordField()) {
                $value = str_repeat("\x00\x2A", SetaPDF_Core_Encoding::strlen($value, 'UTF-16BE'));
            }

            $annotation = $this->getAnnotation();
            $appearanceCharacteristics = $annotation->getAppearanceCharacteristics();
            $borderStyle = $annotation->getBorderStyle();

            $borderWidth = 0;
            $_borderStyle = SetaPDF_Core_Document_Page_Annotation_BorderStyle::SOLID;

            if ($borderStyle) {
                $_borderStyle = $borderStyle->getStyle();
                $borderWidth = $borderStyle->getWidth();
            }

            if ($borderWidth == 0 && $appearanceCharacteristics && $appearanceCharacteristics->getBorderColor() !== null) {
                $borderWidth = 1;
            }

            $borderDoubled = (
                $_borderStyle === SetaPDF_Core_Document_Page_Annotation_BorderStyle::BEVELED ||
                $_borderStyle === SetaPDF_Core_Document_Page_Annotation_BorderStyle::INSET
            );

            $offset = max(1, $borderWidth * ($borderDoubled ? 2 : 1));

            $width = $annotation->getWidth();
            $height = $annotation->getHeight();

            $font = $this->getAppearanceFont();

            $lineHeightFactor = $this->getLineHeightFactor();

            $left = $this->_textTranslateData['x']
                + ($borderWidth == 0
                    ? 2
                    : $borderWidth * ($borderDoubled ? 4 : 2)
                );

            $maxWidth = $width - max(1, $borderWidth) * ($borderDoubled ? 8 : 4);

            // Calculate Font Size
            $fontSize = $this->getAppearanceFontSize();
            if (0 == $fontSize) {
                if ($this->isMultiline()) {
                    // Prepare the lines array
                    $lines = SetaPDF_Core_Text::getLines($value);

                    // Calculate the maximum size
                    $fontSize = ($height - $borderWidth * 2)
                              / count($lines)
                              / $lineHeightFactor;

                    if ($fontSize > 4) {
                        // Maximum is set to 12 for multiline text fields
                        if ($fontSize > 12)
                            $fontSize = 12;

                        /**
                         * IDEA: Is it possible to take the line height as a basis?
                         */

                        $stepSize = 0.15;

                        for (; $fontSize > 4; $fontSize -= $stepSize) {
                            $tmpLines = SetaPDF_Core_Text::getLines($value, $maxWidth, $font, $fontSize);

                            if ((count($tmpLines) * $fontSize * $lineHeightFactor) <
                                (($height - $borderWidth * 2) - $fontSize * $lineHeightFactor)
                            ) {
                                break;
                            }
                        }
                        $lines = $tmpLines;
                    } else {
                        $fontSize = 4;
                    }
                } else {
                    // 1.4 was resolved by simply testing...
                    $maxSize = ($height
                            - ($borderWidth > 0 && !$this->isCombField()
                                ? $borderWidth * ($borderDoubled ? 4 : 2)
                                : 0
                            )) / 1.4;
                    $glyphWidth = $font->getGlyphsWidth($value) / 1000;
                    $fontSize = min($maxWidth / ($glyphWidth ? $glyphWidth : 1), $maxSize);
                    $fontSize = round($fontSize, 4);
                }

                $fontSize = max($fontSize, 4);
            }

            $leading = $fontSize * $lineHeightFactor;

            $canvas->write('/Tx BMC');
            $canvas->saveGraphicState();
            // Clip
            $canvas->path()->rect(
                $offset,
                $offset,
                $width - $offset * 2,
                $height - $offset * 2
            )->clip()->endPath();

            $canvas->text()
                ->begin()
                ->setFont($font, $fontSize);

            $colorSpace = $this->getAppearanceTextColorSpace();
            if ($colorSpace !== null) {
                $canvas->setNonStrokingColorSpace($colorSpace);
            }

            $this->getAppearanceTextColor()->draw($canvas, false);

            if ($this->isMultiline()) {
                $borderOffset = max(2, $borderWidth * ($borderDoubled ? 4 : 2));
                if (
                    $leading >= ($height - $borderOffset) ||
                    ($leading >= ($height - $borderWidth * ($borderDoubled ? 8 : 4)))
                ) {
                    $top = $this->_textTranslateData['y'] + $borderOffset;
                    // this is strange but gives the best results
                    if ($font instanceof SetaPDF_Core_Font_Standard) {
                        $top -= $fontSize * $font->getDescent() / 1000;
                    } else {
                        $top -= $fontSize * $font->getFontBBox()[1] / 1000;
                    }
                } else {
                    $top = $this->_textTranslateData['y'] + $height;
                    $top -= $borderOffset;
                    $top -= $leading;
                }
            } else {
                $top = $this->_textTranslateData['y'] + $height / 2;
                $top -= $leading / 2;
                // this is strange but gives the best results
                if ($font instanceof SetaPDF_Core_Font_Standard) {
                    $top -= ($fontSize * $font->getDescent() / 1000);
                } else {
                    $top -= ($fontSize * $font->getFontBBox()[1] / 1000);
                }
            }

            // Comb 
            $maxLength = $this->getMaxLength();
            if ($this->isCombField() && $maxLength) {
                $combWidth = ($width) / $maxLength;

                $left = $this->_textTranslateData['x']; # 0.75; // Some characters are still "jumping"...
                $len = SetaPDF_Core_Encoding::strlen($value, 'UTF-16BE');

                // Align
                $q = SetaPDF_Core_Type_Dictionary_Helper::resolveAttribute($this->_fieldDictionary, 'Q');
                if ($q && ($maxLength - $len != 0)) {
                    switch ($q->ensure()->getValue()) {
                        case 1: // center
                            $steps = floor(($maxLength / 2) - ($len / 2));
                            $left += $steps * $combWidth;
                            break;
                        case 2: // right
                            $left += ($maxLength - $len) * $combWidth;
                            break;
                    }
                }

                $canvas->write(sprintf(" %.4F %.4F Td\n", $left, $top));

                $prevTmpLeft = $this->_textTranslateData['x'];

                $charCodes = $font->getCharCodes($value);
                for ($i = 0; $i < $len; $i++) {
                    $charCode = $charCodes[$i];
                    $tmpLeft = ($combWidth
                            - ($font->getGlyphWidthByCharCode($charCode) / 1000  * $fontSize))
                        / 2;

                    $_tmpLeft = $tmpLeft;
                    if ($i > 0) {
                        $tmpLeft += ($combWidth - $prevTmpLeft);
                    }

                    $canvas->write(sprintf(' %.4F %.4F Td', $tmpLeft, 0));
                    SetaPDF_Core_Type_String::writePdfString($canvas, $charCode);
                    $canvas->write('Tj');

                    $prevTmpLeft = $_tmpLeft;
                }

                // Draw inner border
                // Color, Border Width,... are already by parent method
                $borderColor = $appearanceCharacteristics
                    ? $appearanceCharacteristics->getBorderColor()
                    : null;

                if ($borderColor && (
                        $_borderStyle === SetaPDF_Core_Document_Page_Annotation_BorderStyle::SOLID ||
                        $_borderStyle === SetaPDF_Core_Document_Page_Annotation_BorderStyle::DASHED
                    )) {
                    for ($i = 1, $c = $this->getMaxLength() - 1; $i <= $c; $i++) {
                        $canvas->draw()->line(
                            $combWidth * $i,
                            $height - $borderWidth,
                            $combWidth * $i,
                            $borderWidth / 2
                        );
                    }
                }

                // Normal
            } else {
                // Align
                $q = SetaPDF_Core_Type_Dictionary_Helper::resolveAttribute($this->_fieldDictionary, 'Q');

                if ($this->isMultiline()) {
                    if (!isset($lines)) {
                        $lines = SetaPDF_Core_Text::getLines(
                            $value,
                            $maxWidth,
                            $font,
                            $fontSize
                        );
                    }

                    // Position
                    $canvas->write(
                        sprintf(" 0 %.4F Td", $top) .
                        sprintf(" %.4F TL", $leading)
                    );

                    $lineLeft = $left;
                    $prevLineLeft = 0;
                    foreach ($lines AS $line) {
                        if ($q && $line) {
                            // Trim white spaces from the right side
                            $lineLen = SetaPDF_Core_Encoding::strlen($line, 'UTF-16BE');
                            while (1) {
                                $lastChar = SetaPDF_Core_Encoding::substr($line, $lineLen - 1, 1, 'UTF-16BE');
                                switch ($lastChar) {
                                    case "\x00\x20":
                                        $lineLen--;
                                        $line = SetaPDF_Core_Encoding::substr($line, 0, $lineLen, 'UTF-16BE');
                                        continue 2;
                                }

                                break;
                            }

                            // calculate the total string width
                            $stringWidth = $font->getGlyphsWidth($line) / 1000 * $fontSize;

                            switch ($q->ensure()->getValue()) {
                                case 1: // center
                                    $lineLeft = ($width / 2) - ($stringWidth / 2);
                                    break;
                                case 2: // right
                                    $lineLeft =
                                        $width
                                        - $stringWidth
                                        - ($borderWidth == 0
                                            ? 2
                                            : $borderWidth * ($borderDoubled ? 4 : 2)
                                        );
                                    break;
                            }
                        }

                        $charCodes = $font->getCharCodes($line);
                        $charCodeString = join('', $charCodes);
                        if (($lineLeft - $prevLineLeft) != 0)
                            $canvas->write(sprintf(" %.4F 0 Td\n", $lineLeft - $prevLineLeft));
                        $prevLineLeft = $lineLeft;
                        SetaPDF_Core_Type_String::writePdfString($canvas, $charCodeString);
                        $canvas->write(' Tj T*');
                    }

                    if ($observeTextOverflow) {
                        if (($top + ($fontSize * $font->getAscent() / 1000)) >
                            ($height - max(1, $borderWidth) * ($borderDoubled ? 4 : 2))
                        ) {
                            $this->_textOverflow |= self::OVERFLOWS_VERTICALLY;

                        } else {
                            $bottom = $top - ($leading * (count($lines) - 1))
                                    + ($fontSize * $font->getFontBBox()[1] / 1000);
                            if ($bottom < max(1, $borderWidth) * ($borderDoubled ? 4 : 2)) {
                                $this->_textOverflow |= self::OVERFLOWS_VERTICALLY;
                            }
                        }
                    }

                } else {
                    if ($q) {
                        // calculate the total string width
                        $stringWidth = $font->getGlyphsWidth($value) / 1000 * $fontSize;

                        /**
                         * The left offset should never be lower than the initial offset.
                         * So at the end a text, which is longer than the available space
                         * will be left aligned.
                         */
                        switch ($q->ensure()->getValue()) {
                            case 1: // center
                                $left = max($left, ($width / 2) - ($stringWidth / 2));
                                break;
                            case 2: // right
                                $left = max
                                (
                                    $left,
                                    $width
                                    - $stringWidth
                                    - ($borderWidth == 0
                                        ? 2
                                        : $borderWidth * ($borderDoubled ? 4 : 2)
                                    )
                                );
                                break;
                        }
                    }

                    if ($observeTextOverflow) {
                        // calculate the total string width
                        if (!isset($stringWidth)) {
                            $stringWidth = $font->getGlyphsWidth($value) / 1000 * $fontSize;
                        }

                        // new max width, because the right margin is not taken to calculate
                        $maxWidth = $width - max(1, $borderWidth) * ($borderDoubled ? 4 : 2);
                        if ($stringWidth > $maxWidth) {
                            $this->_textOverflow |= self::OVERFLOWS_HORIZONTALLY;
                        }

                        $bottom = $top + ($fontSize * $font->getDescent() / 1000);
                        if ($bottom < (max(1, $borderWidth) * ($borderDoubled ? 4 : 2))) {
                            $this->_textOverflow |= self::OVERFLOWS_VERTICALLY;
                        }
                    }

                    $canvas->write(sprintf(" %.4F %.4F Td\n", $left, $top));

                    $charCodes = $font->getCharCodes($value);
                    $charCodeString = join('', $charCodes);
                    SetaPDF_Core_Type_String::writePdfString($canvas, $charCodeString);
                    $canvas->write(" Tj\n");
                }
            }

            $canvas->text()->end();
            $canvas->restoreGraphicState();
            $canvas->write(' EMC');
        }
    }

    /**
     * Get the max length property if available.
     *
     * @return boolean|integer
     */
    public function getMaxLength()
    {
        $v = SetaPDF_Core_Type_Dictionary_Helper::resolveAttribute($this->_fieldDictionary, 'MaxLen');
        if (!$v) {
            return false;
        }

        $maxLength = $v->getValue();

        return $maxLength > 0 ? $maxLength : false;
    }

    /**
     * Set the max length property.
     *
     * Changing this flag will reset the value to a value that fits into the given maximal length.
     *
     * @param integer $maxLength
     * @return void
     */
    public function setMaxLength($maxLength)
    {
        $currentMaxLength = $this->getMaxLength();

        $dict = SetaPDF_Core_Type_Dictionary_Helper::resolveDictionaryByAttribute($this->_fieldDictionary, 'MaxLen');
        if (!$dict) {
            $dict = $this->_fieldDictionary;
        }

        $dict->offsetSet('MaxLen', new SetaPDF_Core_Type_Numeric($maxLength));

        if ($maxLength < $currentMaxLength) {
            $this->setValue($this->getValue('UTF-16BE'), 'UTF-16BE');
        }
    }

    /* Additional text field flags */

    /**
     * Check if the multiline flag is set.
     *
     * @return boolean
     */
    public function isMultiline()
    {
        return $this->isFieldFlagSet(SetaPDF_FormFiller_Field_Flags::MULTILINE);
    }

    /**
     * Set the multiline flag.
     *
     * Changing this flag will re-create the field appearance.
     *
     * @param bool|true $multiline
     * @throws SetaPDF_FormFiller_Field_Exception
     */
    public function setMultiline($multiline = true)
    {
        if ($this->isCombField()) {
            throw new SetaPDF_FormFiller_Field_Exception(
                'Multiline flag cannot be set as long as the Comb flag is set.'
            );
        }

        $currentMultiline = $this->isMultiline();

        if ($currentMultiline == $multiline)
            return;

        $this->setFieldFlags(SetaPDF_FormFiller_Field_Flags::MULTILINE, $multiline);
        $this->recreateAppearance();
    }

    /**
     * Check if the comb field flag is set.
     *
     * @return boolean
     */
    public function isCombField()
    {
        return $this->isFieldFlagSet(SetaPDF_FormFiller_Field_Flags::COMB);
    }

    /**
     * Set the comb field flag.
     *
     * Changing this flag will re-create the field appearance.
     *
     * @param boolean $comb
     * @return void
     * @throws SetaPDF_FormFiller_Field_Exception
     */
    public function setCombField($comb = true)
    {
        if (false === $this->getMaxLength() || $this->isMultiline() || $this->isPasswordField()) {
            throw new SetaPDF_FormFiller_Field_Exception(
                'Comb flag can only be set, if the field has a MaxLength defined and the Multiline, ' .
                'Password, and FileSelect flags are clear.'
            );
        }

        $currentComb = $this->isCombField();

        if ($currentComb == $comb)
            return;

        $this->setFieldFlags(SetaPDF_FormFiller_Field_Flags::COMB, $comb);
        $this->recreateAppearance();
    }

    /**
     * Check if the password field flag is set.
     *
     * @return boolean
     */
    public function isPasswordField()
    {
        return $this->isFieldFlagSet(SetaPDF_FormFiller_Field_Flags::PASSWORD);
    }

    /**
     * Set the password field flag.
     *
     * Changing this flag will re-create the field appearance.
     *
     * @param boolean $password
     * @return void
     * @throws SetaPDF_FormFiller_Field_Exception
     */
    public function setPasswordField($password = true)
    {
        if ($this->isMultiline() || !$this->isDoNotSpellCheckSet() || $this->isCombField()) {
            throw new SetaPDF_FormFiller_Field_Exception(
                'Password fields needs to have the "do not spell check", not the "multiline" ' .
                'and not the "comb field" flag set.'
            );
        }

        $currentPasswordField = $this->isPasswordField();

        if ($currentPasswordField == $password)
            return;

        $this->setFieldFlags(SetaPDF_FormFiller_Field_Flags::PASSWORD, $password);
        $this->recreateAppearance();
    }

    /**
     * Check if the "do not spell check" flag is set.
     *
     * @return boolean
     */
    public function isDoNotSpellCheckSet()
    {
        return $this->isFieldFlagSet(SetaPDF_FormFiller_Field_Flags::DO_NOT_SPELL_CHECK);
    }

    /**
     * Set the "do not spell check" flag.
     *
     * @param boolean $doNotSpellCheck
     * @return void
     * @throws SetaPDF_FormFiller_Field_Exception
     */
    public function setDoNotSpellCheck($doNotSpellCheck = true)
    {
        if ($this->isPasswordField() && $doNotSpellCheck !== true) {
            throw new SetaPDF_FormFiller_Field_Exception(
                'The "do not spell check" flag needs to be true for a password field.'
            );
        }

        $this->setFieldFlags(SetaPDF_FormFiller_Field_Flags::DO_NOT_SPELL_CHECK, $doNotSpellCheck);
    }

    /**
     * Check if the "do not scroll" flag is set.
     *
     * @return boolean
     */
    public function isDoNotScrollSet()
    {
        return $this->isFieldFlagSet(SetaPDF_FormFiller_Field_Flags::DO_NOT_SCROLL);
    }

    /**
     * Set the "do not scroll" flag.
     *
     * @param boolean $doNotScroll
     * @return void
     */
    public function setDoNotScroll($doNotScroll = true)
    {
        $this->setFieldFlags(SetaPDF_FormFiller_Field_Flags::DO_NOT_SCROLL, $doNotScroll);
    }

    /**
     * Gets the additional actions object instance for this field.
     *
     * @return SetaPDF_FormFiller_Field_AdditionalActions
     */
    public function getAdditionalActions()
    {
        if (null === $this->_additionalActions) {
            $this->_additionalActions = new SetaPDF_FormFiller_Field_AdditionalActions($this);
        }

        return $this->_additionalActions;
    }

    /**
     * Set translate data for the text appearance.
     *
     * @param integer $x The value by which the text should be translated on the abscissa.
     * @param integer $y The value by which the text should be translated on the ordinate.
     */
    public function setTextTranslate($x = 0, $y = 0)
    {
        $this->_textTranslateData = ['x' => (float)$x, 'y' => (float)$y];
    }
}