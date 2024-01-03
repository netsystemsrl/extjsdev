<?php
/**
 * This file is part of the SetaPDF-Extractor Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Word.php 1178 2018-01-23 11:03:55Z jan.slabon $
 */

/**
 * Extraction strategy for single words.
 *
 * The result of this strategy is sorted from top-left to bottom-right.
 *
 * Each word is represented by an instance of SetaPDF_Extractor_Result_Word or SetaPDF_Extractor_Result_WordWithGlyphs.
 *
 * This class allows you to receive a words boundary through the getBounds() method of the word instance.
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @subpackage SetaPDF_Extractor_Strategy
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Extractor_Strategy_Word extends SetaPDF_Extractor_Strategy_Glyph
{
    /**
     * Detail level constant.
     *
     * Default detail level resulting in instances of {@link SetaPDF_Extractor_Result_Word}.
     *
     * @var string
     */
    const DETAIL_LEVEL_DEFAULT = 'default';

    /**
     * Detail level constant.
     *
     * Extended detail level resulting in instances of {@link SetaPDF_Extractor_Result_WordWithGlyphs}.
     *
     * @var string
     */
    const DETAIL_LEVEL_GLYPHS = 'glyphs';

    /**
     * The detail level.
     *
     * @var string
     */
    protected $_detailLevel = self::DETAIL_LEVEL_DEFAULT;

    /**
     * Additional UTF-8 sequences that should be handled as word characters
     *
     * In outdated PHP 5.2 version this property could be used to extend the character classes.
     *
     * "\x2D"  'HYPHEN-MINUS' (U+002D)
     * "\xE2\x80\x90" 'HYPHEN' (U+2010)
     * "\xE2\x88\x92" 'MINUS SIGN' (U+2212)
     * "\xE2\x80\x94" 'EM DASH' (U+2014)
     * "\xE2\x80\x91" 'NON-BREAKING HYPHEN' (U+2011)
     * "\xC2\xB2" 'SUPERSCRIPT TWO' (U+00B2)
     * "\xC2\xAD" 'SOFT HYPHEN' (U+00AD)
     *
     * @var string
     */
    static public $characters = "\x2D\xE2\x80\x90\xE2\x88\x92\xE2\x80\x94\xE2\x80\x91\xC2\xB2\xC2\xAD";

    /**
     * Helper method to split a string into words.
     *
     * This helper allows you to split a string into words with the same logic that is used
     * to resolve words by text items resolved from a PDF document.
     *
     * @param $text
     * @param string $encoding
     *
     * @return array
     */
    static public function getWords($text, $encoding = 'UTF-8')
    {
        if ('UTF-8' !== $encoding) {
            $text = SetaPDF_Core_Encoding::convert($text, $encoding, 'UTF-8');
        }

        // normalize line breaks
        $text = strtr($text, array(
            "\x0d\x0a" => "\x0a",
            "\x0d" => "\x0a",

            // tab to space
            "\x09" => "\x20",
        ));

        $lines = explode("\x0a", $text);
        $words = array();

        foreach ($lines AS $items) {
            $items = SetaPDF_Core_Encoding::strSplit($items);
            $prevItem = null;
            $prevString = null;
            $wordItems = array();

            foreach ($items AS $c => $item) {
                $string = $item;

                if ($string === "\x20" ||           // SPACE
                    $string === "\xc2\xa0" ||       // NO-BREAK SPACE
                    ord($string[0]) < 32            // control characters
                ) {
                    if (count($wordItems) > 0) {
                        $words[] = join('', $wordItems);
                        $wordItems = array();
                    }
                    $prevItem = null;
                    continue;
                } elseif ($string === "\xE2\x80\x8b") { // ZERO WIDTH SPACE
                    continue;
                }

                $nonWordCharacter = self::_isNonWordCharacter($string);

                if ($prevItem !== null) {
                    $newWord = false;

                    if ($nonWordCharacter) {
                        switch (true) {
                            case true:
                                // if the previous AND current string are "non word" characters, they should be kept together
                                if (self::_isNonWordCharacter($prevString)) {
                                    $newWord = false;
                                    break;
                                } else {
                                    // if it's decimal separator and the next and previous string is a number keep them together
                                    if ($string === '.' || $string === ',') {
                                        // check if next is a number
                                        $nextItem = isset($items[$c + 1]) ? $items[$c + 1] : false;
                                        if (!$nextItem) {
                                            $newWord = true;
                                            break;
                                        }

                                        if (!preg_match("/\d/", $nextItem)) {
                                            $newWord = true;
                                            break;
                                        }

                                        // check if previous is a number
                                        if (!preg_match("/\d/", $prevItem)) {
                                            $newWord = true;
                                            break;
                                        }
                                        break;
                                    }

                                    $newWord = true;
                                }
                        }

                    } elseif (!$nonWordCharacter && count($wordItems) > 0) {
                        if (self::_isNonWordCharacter($wordItems[0])) {
                            $newWord = true;
                        }
                    }

                    if ($newWord) {
                        $words[] = join('', $wordItems);
                        $wordItems = array();
                    }
                }

                $wordItems[] = $item;
                $prevItem = $item;
                $prevString = $string;
            }

            if (count($wordItems)) {
                $words[] = join('', $wordItems);
                unset($wordItems);
            }
        }

        return $words;
    }

    /**
     * Set the detail level of the result.
     *
     * @param string $detailLevel
     */
    public function setDetailLevel($detailLevel)
    {
        $this->_detailLevel = $detailLevel;
    }

    /**
     * Get the detail level of the expected result.
     *
     * @return string
     */
    public function getDetailLevel()
    {
        return $this->_detailLevel;
    }

    /**
     * Process all text items of a line.
     *
     * @param SetaPDF_Extractor_TextItem[] $items
     * @return array
     */
    protected function _processLine(array $items)
    {
        $sorter = $this->getSorter();

        /**
         * @var $prevItem SetaPDF_Extractor_TextItem
         */
        $prevItem = null;
        $prevString = null;
        $wordItems = [];
        $words = [];

        foreach ($items AS $c => $item) {
            $string = $item->getString();

            if (
                $string === "\x20" ||           // SPACE
                $string === "\xc2\xa0" ||       // NO-BREAK SPACE
                ord($string[0]) < 32            // control characters
            ) {
                // if this invisible glyph covers the previous glpyh it should be ignored
                if ($prevItem !== null) {
                    $start = $item->getBaseLineStart();
                    $end = $item->getBaseLineEnd();
                    $prevEnd = $prevItem->getBaseLineEnd();

                    $orientation = $item->getOrientation();
                    if ($orientation != 0) {
                        $c = cos(-$orientation);
                        $s = sin(-$orientation);

                        $m1 = new SetaPDF_Core_Geometry_Matrix();
                        $matrix = $m1->multiply(new SetaPDF_Core_Geometry_Matrix($c, $s, -$s, $c, 0, 0));

                        $start = $start->multiply($matrix);
                        $end   = $end->multiply($matrix);
                        $prevEnd = $prevEnd->multiply($matrix);
                    }

                    $joiningLength = $prevEnd->subtract($start)->getLength();
                    if ($joiningLength > 0) {
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

                if (count($wordItems) > 0) {
                    $words[] = $wordItems;
                    $wordItems = [];
                }
                $prevItem = null;
                continue;
            } elseif ($string === "\xE2\x80\x8b") { // ZERO WIDTH SPACE
                continue;
            }

            $nonWordCharacter = self::_isNonWordCharacter($string);

            if ($prevItem !== null) {
                $joining = $sorter->itemsJoining($prevItem, $item, $this->spaceWidthFactor);
                $newWord = !$joining;

                if (!$newWord && $nonWordCharacter) {
                    switch (true) {
                        case true:
                            // if the previous AND current string are "non word" characters, they should be kept together
                            if (self::_isNonWordCharacter($prevString)) {
                                $newWord = false;
                                break;
                            } else {
                                // if it's decimal separator and the next and previous string is a number keep them together
                                if ($string === '.' || $string === ',') {
                                    // check if next is a number
                                    $nextItem = isset($items[$c + 1]) ? $items[$c + 1] : null;
                                    if (null === $nextItem) {
                                        $newWord = true;
                                        break;
                                    }

                                    if (
                                        !preg_match("/\d/", $nextItem->getString()) ||
                                        !$sorter->itemsJoining($item, $nextItem, $this->spaceWidthFactor))
                                    {
                                        $newWord = true;
                                        break;
                                    }

                                    // check if previous is a number
                                    if (!preg_match("/\d/", $prevItem->getString())) {
                                        $newWord = true;
                                        break;
                                    }
                                    break;
                                }

                                $newWord = true;
                            }
                    }

                } elseif ($joining && !$nonWordCharacter && count($wordItems) > 0) {
                    if (self::_isNonWordCharacter($wordItems[0]->getString())) {
                        $newWord = true;
                    }
                }

                if ($newWord) {
                    $words[] = $wordItems;
                    $wordItems = [];
                }
            }

            $wordItems[] = $item;
            $prevItem = $item;
            $prevString = $string;
        }

        if (count($wordItems)) {
            $words[] = $wordItems;
        }

        return $words;
    }

    /**
     * Get all resolved words.
     *
     * @param string $stream
     * @param SetaPDF_Core_Type_Dictionary $resources
     * @return SetaPDF_Extractor_Result_Words
     */
    public function getResult($stream, SetaPDF_Core_Type_Dictionary $resources)
    {
        $items = $this->process($stream, $resources);

        $sorter = $this->getSorter();
        $lines = $sorter->groupByLines($items);

        $words = [];

        /**
         * @var $item SetaPDF_Extractor_TextItem
         */
        foreach ($lines AS $items) {
            foreach ($this->_processLine($items) as $word) {
                $words[] = $word;
            }
        }

        $results = new SetaPDF_Extractor_Result_Words();

        foreach ($words AS $word) {
            $glyphs = [];
            // TODO: Eleminate Glyph instance here... would save memory if standard word class is used.
            foreach ($word AS $item) {
                $glyphs[] = new SetaPDF_Extractor_Result_Glyph($item);
            }
            
            $results[] = $this->_createWord($glyphs);
        }

        return $results;
    }

    /**
     * Creates a new word instance using the glyphs.
     *
     * @param SetaPDF_Extractor_Result_Glyph[] $glyphs
     * @return SetaPDF_Extractor_Result_WordWithGlyphs|SetaPDF_Extractor_Result_Word
     */
    protected function _createWord($glyphs)
    {
        $wordClassName = $this->getDetailLevel() === self::DETAIL_LEVEL_GLYPHS
            ? 'SetaPDF_Extractor_Result_WordWithGlyphs'
            : 'SetaPDF_Extractor_Result_Word';

        return new $wordClassName($glyphs);
    }

    /**
     * Checks whether the character is a non word character.
     *
     * @param string  $character
     * @return bool
     */
    static protected function _isNonWordCharacter($character)
    {
        // some characters are handled as word-characters which shouldn't
        switch ($character) {
            case '_':
                return true;
        }

        return !preg_match('/[\w\p{L}' . self::$characters . ']/u', $character);
    }
}
