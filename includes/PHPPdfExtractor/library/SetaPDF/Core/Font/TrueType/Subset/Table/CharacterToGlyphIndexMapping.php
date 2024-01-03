<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: CharacterToGlyphIndexMapping.php 1186 2018-01-24 13:55:21Z timo.scholz $
 */

/**
 * This class represents the "cmap" table in a sub-setting context.
 *
 * See {@link https://www.microsoft.com/typography/otspec/cmap.htm} for more details.
 *
 * @method SetaPDF_Core_Font_TrueType_Table_CharacterToGlyphIndexMapping getOriginalTable()
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_TrueType_Subset_Table_CharacterToGlyphIndexMapping
    extends SetaPDF_Core_Font_TrueType_Subset_Table
{
    /**
     * The subtables.
     *
     * @var SetaPDF_Core_Font_TrueType_Subset_Table_CharacterToGlyphIndexMapping_SubTable[][]
     */
    protected $_subtables = [];

    /**
     * The contructor.
     *
     * @param SetaPDF_Core_Font_TrueType_Table_CharacterToGlyphIndexMapping $table
     */
    public function __construct(SetaPDF_Core_Font_TrueType_Table_CharacterToGlyphIndexMapping $table)
    {
        parent::__construct($table);
    }

    /**
     * Sets a subtable.
     *
     * @param int $platformId
     * @param int $encodingId
     * @param SetaPDF_Core_Font_TrueType_Subset_Table_CharacterToGlyphIndexMapping_SubTable $table
     */
    public function setSubTable(
        $platformId,
        $encodingId,
        SetaPDF_Core_Font_TrueType_Subset_Table_CharacterToGlyphIndexMapping_SubTable $table
    )
    {
        $this->_subtables[$platformId][$encodingId] = $table;
    }

    /**
     * Checks whether the table already contains the given subtable or not.
     *
     * @param int $plaformId
     * @param int $encodingId
     * @return bool
     */
    public function hasSubTable($plaformId, $encodingId)
    {
        return isset($this->_subtables[$plaformId][$encodingId]);
    }

    /**
     * Gets a subtable.
     *
     * @param int $platformId
     * @param int $encodingId
     * @return false|SetaPDF_Core_Font_TrueType_Subset_Table_CharacterToGlyphIndexMapping_SubTable
     */
    public function getSubTable($platformId, $encodingId)
    {
        if (isset($this->_subtables[$platformId][$encodingId])) {
            return $this->_subtables[$platformId][$encodingId];
        }

        return false;
    }

    /**
     * @inheritdoc
     */
    public function cleanUp()
    {
        foreach ($this->_subtables as $subtables) {
            foreach ($subtables as $subtable) {
                $subtable->cleanUp();
            }
        }
        unset($this->_subtables);
        parent::cleanUp();
    }

    /**
     * Gets the number of registered subtables.
     *
     * @return int
     */
    public function getNumTables()
    {
        $count = 0;
        foreach ($this->_subtables as $encodings) {
            $count += count($encodings);
        }

        return $count;
    }

    /**
     * @inheritdoc
     */
    public function write(SetaPDF_Core_Writer_WriterInterface $writer)
    {
        $numTables = $this->getNumTables();

        $offset = ($numTables * 8) + 4;

        $writer->write(SetaPDF_Core_BitConverter::formatToUInt16(0)); // version
        $writer->write(SetaPDF_Core_BitConverter::formatToUInt16($numTables));

        $encodingWriter = new SetaPDF_Core_Writer_String();
        $encodingWriter->start();
        foreach ($this->_subtables as $platformId => $encodings) {
            foreach ($encodings as $encodingId => $table) {
                $writer->write(SetaPDF_Core_BitConverter::formatToUInt16($platformId));
                $writer->write(SetaPDF_Core_BitConverter::formatToUInt16($encodingId));

                $tmpPos = $encodingWriter->getPos();
                $table->write($encodingWriter);
                $writer->write(
                    SetaPDF_Core_BitConverter::formatToUint32(
                         $offset + $tmpPos
                    )
                );
            }
        }
        $encodingWriter->finish();
        $writer->write($encodingWriter->getBuffer());
    }
}