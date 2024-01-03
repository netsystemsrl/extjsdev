<?php

abstract class SetaPDF_Core_Font_TrueType_Table_GlyphData_Description
{
    /**
     * The glyph
     *
     * @var SetaPDF_Core_Font_TrueType_Table_GlyphData_Glyph
     */
    protected $_glyph;

    /**
     * The glyph description offset
     *
     * @var int
     */
    protected $_offset;

    /**
     * The glyph description length
     *
     * @var int
     */
    protected $_length;

    /**
     * SetaPDF_Core_Font_TrueType_Table_GlyphData_Description constructor.
     *
     * @param SetaPDF_Core_Font_TrueType_Table_GlyphData_Glyph $glyphData
     * @param int $offset
     * @param int $length
     */
    public function __construct(SetaPDF_Core_Font_TrueType_Table_GlyphData_Glyph $glyph, $offset, $length)
    {
        $this->_glyph = $glyph;
        $this->_offset = $offset;
        $this->_length = $length;
    }

    /**
     * @param int $length
     * @param int $offset
     * @return string
     */
    protected function _readBytes($length, $offset)
    {
        // TODO: Refactor to read from whole glyph data
        $record = $this->_glyph->getGlyphData()->getRecord();
        $reader = $record->getFile()->getReader();
        $offset = $record->getOffset() + $this->_offset + $offset;

        return $reader->readBytes($length, $offset);
    }

    /**
     * Returns the size of the instructions.
     *
     * @return int
     */
    public abstract function getInstructionSize();

    /**
     * Returns the raw glyph description.
     *
     * @return string
     */
    public function getRawData()
    {
        $record = $this->_glyph->getGlyphData()->getRecord();
        $reader = $record->getFile()->getReader();

        return $reader->readBytes(
            $this->_length,
            $record->getOffset() + $this->_offset
        );
    }

    /**
     * Release memory.
     */
    public function cleanUp()
    {
        $this->_glyphData = null;
    }
}