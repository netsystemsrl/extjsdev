<?php

interface SetaPDF_Core_Font_FontInterface extends
    SetaPDF_Core_Font_Glyph_Collection_CollectionInterface,
    SetaPDF_Core_Resource
{
    /**
     * Returns the distance from baseline of highest ascender (Typographic ascent).
     *
     * @return float
     */
    public function getAscent();

    /**
     * Returns the distance from baseline of lowest descender (Typographic descent).
     *
     * @return float
     */
    public function getDescent();

    /**
     * Get the final character codes of a character string.
     *
     * @param string $chars The character string
     * @param string $encoding The output encoding
     * @return array
     */
    public function getCharCodes($chars, $encoding = 'UTF-16BE');

    /**
     * Get the width of a glyph by its char code.
     *
     * @param string $charCode
     * @return float|bool
     */
    public function getGlyphWidthByCharCode($charCode);

    /**
     * Returns the font bounding box.
     *
     * @return array Format is [llx lly urx ury]
     */
    public function getFontBBox();

    /**
     * Split a string of char codes into single char codes.
     *
     * @param string $charCodes
     * @return array
     */
    public function splitCharCodes($charCodes);

    /**
     * Get the font name.
     *
     * @return string
     */
    public function getFontName();
}