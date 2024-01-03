<?php
/**
 * This file is part of the SetaPDF-Extractor Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Glyph.php 1079 2017-08-14 15:00:15Z timo.scholz $
 */

/**
 * Extraction strategy for single glyphs.
 *
 * The result of this strategy is not sorted.
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @subpackage SetaPDF_Extractor_Strategy
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Extractor_Strategy_Glyph extends SetaPDF_Extractor_Strategy_Plain
{
    /**
     * Get all resoved glyphs.
     *
     * @param string $stream
     * @param SetaPDF_Core_Type_Dictionary $resources
     * @return SetaPDF_Extractor_Result_Collection
     */
    public function getResult($stream, SetaPDF_Core_Type_Dictionary $resources)
    {
        $items = $this->process($stream, $resources);

        $glyphs = new SetaPDF_Extractor_Result_Collection();
        foreach ($items AS $item) {
            $glyphs[] = new SetaPDF_Extractor_Result_Glyph($item);
        }

        return $glyphs;
    }

    /**
     * @internal
     */
    protected function _init()
    {
        // do nothing
    }

    /**
     * Callback that is called if a text should be shown.
     *
     * @param string $arguments
     * @param mixed $operator
     */
    public function _onTextShow($arguments, $operator)
    {
        $text = $this->getGraphicState()->text();

        switch ($operator) {
            case "'":
                $text->moveToStartOfNextLine();
                $this->_showText($arguments[0]->getValue());
                break;
            case '"':
                $text->setWordSpacing($arguments[1]->getValue());
                $text->setCharacterSpacing($arguments[2]->getValue());
                $this->_showText($arguments[0]->getValue());
                break;
            case 'Tj':
                $this->_showText($arguments[0]->getValue());
                break;
            case 'TJ':
                $this->_showTextStrings($arguments[0]->toPhp());
                break;
        }
    }

    /**
     * Method that shows text.
     *
     * @param $string
     */
    protected function _showText($string)
    {
        $text = $this->getGraphicState()->text();

        if ($string === '') {
            return;
        }

        /**
         * @var SetaPDF_Core_Font $font
         */
        $font = $text->getFont();
        $start = $end = $text->getTextMatrix();
        $ctm = $this->getGraphicState()->getCurrentTransformationMatrix();
        foreach ($font->splitCharCodes($string) AS $no => $charCode) {
            $w0 = $font->getGlyphWidthByCharCode($charCode);

            //$w1 = 0;
            if ($font instanceof SetaPDF_Core_Font_Type3) {
                $fontMatrix = $font->getFontMatrix();
                $v          = new SetaPDF_Core_Geometry_Vector($w0);
                $v          = $v->multiply($fontMatrix);
                $w0         = $v->getX();
            } else {
                $w0 /= 1000;
            }

            $fontSize = $text->getFontSize();
            $scaling = $text->getScaling();
            $wordSpacing = $text->getWordSpacing();
            $characterSpacing = $text->getCharacterSpacing();

            // [...]Word spacing [...] shall apply only to the ASCII SPACE character(20h).
            if ($charCode === "\x20") {
                $tx = ($w0 * $fontSize + $wordSpacing) * $scaling / 100;
            } else {
                $tx = ($w0 * $fontSize) * $scaling / 100;
            }
            $ty = 0;//$w1 * $this->getFontSize();

            $m = new SetaPDF_Core_Geometry_Matrix(1, 0, 0, 1, $tx, $ty);
            $end = $m->multiply($start);

            $item = new SetaPDF_Extractor_TextItem(
                $charCode,
                $font,
                $fontSize,
                $characterSpacing,
                $wordSpacing,
                $scaling,
                $start->multiply($ctm),
                $end->multiply($ctm),
                $this->_textCount . '.' . $no
            );

            if ($filterId = $this->_accept($item)) {
                if ($filterId !== true) {
                    $item->setFilterId($filterId);
                }

                $this->_items[] = $item;
            }

            if ($characterSpacing != 0) {
                $tx = $characterSpacing * $text->getScaling() / 100;
                $m = new SetaPDF_Core_Geometry_Matrix(1, 0, 0, 1, $tx, 0);
                $end = $m->multiply($end);
            }

            $start = $end;
        }

        $text->setTextMatrix($end);
    }

    /**
     * Callback that is called if text strings should be shown.
     *
     * @param array $textStrings
     */
    public function _showTextStrings($textStrings)
    {
        $text = $this->getGraphicState()->text();

        if (!is_array($textStrings))
            $textStrings = array($textStrings);

        foreach ($textStrings AS $textString) {
            if (is_float($textString) || is_int($textString)) {
                if ($textString == 0) {
                    continue;
                }

                $tx = ((-$textString / 1000) * $text->getFontSize()) * $text->getScaling() / 100;
                $ty = 0;

                $m = new SetaPDF_Core_Geometry_Matrix(1, 0, 0, 1, $tx, $ty);

                $text->setTextMatrix($m->multiply($text->getTextMatrix()));

            } else {
                $this->_showText($textString);
            }
        }
    }
}