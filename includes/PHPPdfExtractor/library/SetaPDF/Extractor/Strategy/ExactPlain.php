<?php
/**
 * This file is part of the SetaPDF-Extractor Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: ExactPlain.php 1110 2017-10-12 10:18:42Z timo.scholz $
 */

/**
 * Extraction strategy for plain text by using single glyphs for rebuilding the text.
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @subpackage SetaPDF_Extractor_Strategy
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Extractor_Strategy_ExactPlain extends SetaPDF_Extractor_Strategy_Glyph
{
    protected $_ignoreSpaceCharacter = false;

    /**
     * Get the plain text from a stream.
     *
     * @param string $stream
     * @param SetaPDF_Core_Type_Dictionary $resources
     * @return string
     */
    public function getResult($stream, SetaPDF_Core_Type_Dictionary $resources)
    {
        return SetaPDF_Extractor_Strategy_Plain::getResult($stream, $resources);
    }

    /**
     * Defines whether a space character should be fetched or not.
     *
     * If this is set to true (default), the strategy will use the found space character as a delemitter.
     * If this is set to false, the strategy will calculate a delemitter by the distance of 2 charachters/glyphs.
     *
     * @param boolean $ignoreSpaceCharacter
     */
    public function setIgnoreSpaceCharacter($ignoreSpaceCharacter)
    {
        $this->_ignoreSpaceCharacter = (boolean)$ignoreSpaceCharacter;
    }

    /**
     * Gets whether a space character should be fetched or not.
     *
     * @return boolean
     */
    public function getIgnoreSpaceCharacter()
    {
        return $this->_ignoreSpaceCharacter;
    }

    /**
     * Proxy method that forwards the call to a {@link SetaPDF_Extractor_Filter_FilterInterface filter} instance if available.
     *
     * This strategy filters space characters automatically if specified (see {@link setIgnoreSpaceCharacter()}.
     *
     * @param SetaPDF_Extractor_TextItem $textItem
     * @see setFilter()
     * @see setIgnoreSpaceCharacter()
     * @return bool|string
     */
    protected function _accept(SetaPDF_Extractor_TextItem $textItem)
    {
        if ($this->_ignoreSpaceCharacter) {
            // ignore spaces
            $string = $textItem->getString();
            if ($string === "\x20" ||           // SPACE
                $string === "\xc2\xa0" ||       // NO-BREAK SPACE
                ord($string[0]) < 32 ||         // control characters
                $string === "\xE2\x80\x8b"      // ZERO WIDTH SPACE
            ) {
                return false;
            }
        }

        return parent::_accept($textItem);
    }

    /**
     * Get an instance of the same strategy for processing an other stream (e.g. a Form XObject stream).
     *
     * @param SetaPDF_Core_Canvas_GraphicState $gs
     * @return static
     */
    protected function _getSubInstance(SetaPDF_Core_Canvas_GraphicState $gs)
    {
        /**
         * @var static $strategy
         */
        $strategy = parent::_getSubInstance($gs);
        $strategy->_ignoreSpaceCharacter = $this->_ignoreSpaceCharacter;

        return $strategy;
    }
}