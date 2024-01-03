<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: IndexToLocation.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * This class represents the "loca" table in a sub-setting context.
 *
 * See {@link https://www.microsoft.com/typography/otspec/loca.htm} for more details.
 *
 * @method SetaPDF_Core_Font_TrueType_Table_IndexToLocation getOriginalTable()
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_TrueType_Subset_Table_IndexToLocation extends SetaPDF_Core_Font_TrueType_Subset_Table
{
    /**
     * The glyph locations.
     *
     * @var int[]
     */
    private $_locations = [];

    /**
     * The table format.
     *
     * @var int
     */
    private $_format = 0;

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Font_TrueType_Table_IndexToLocation $table
     */
    public function __construct(SetaPDF_Core_Font_TrueType_Table_IndexToLocation $table)
    {
        parent::__construct($table);
    }

    /**
     * @inheritdoc
     */
    public function cleanUp()
    {
        parent::cleanUp();
        $this->_locations = null;
    }

    /**
     * Set the location format.
     *
     * 0 for short offsets (Offset16), 1 for long (Offset32).
     *
     * @see SetaPDF_Core_Font_TrueType_Subset_Table_Header::setIndexToLocFormat()
     * @param int $value
     */
    public function setFormat($value)
    {
        $this->_format = $value;
    }

    /**
     * Set the glyph locations.
     *
     * @param int[] $data
     */
    public function setLocations(array $data)
    {
        $this->_locations = $data;
    }

    /**
     * @inheritdoc
     */
    public function write(SetaPDF_Core_Writer_WriterInterface $writer)
    {
        if ($this->_format === 0) {
            foreach ($this->_locations as $value) {
                $writer->write(SetaPDF_Core_BitConverter::formatToUInt16($value / 2));
            }
        } else {
            foreach ($this->_locations as $value) {
                $writer->write(SetaPDF_Core_BitConverter::formatToUInt32($value));
            }
        }
    }
}