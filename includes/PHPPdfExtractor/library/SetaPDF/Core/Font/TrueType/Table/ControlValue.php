<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: ControlValue.php 1185 2018-01-24 13:45:38Z timo.scholz $
 */

/**
 * A class representing the Control Value Table (cvt ) in a TrueType file.
 * https://www.microsoft.com/typography/otspec/cvt.htm
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_TrueType_Table_ControlValue extends SetaPDF_Core_Font_TrueType_Table
{
    /**
     * The tag name of this class
     *
     * @var string
     */
    const TAG = SetaPDF_Core_Font_TrueType_Table_Tags::CVT;

    /**
     * Get the entry count in this table.
     *
     * @return int
     */
    public function getCount()
    {
        return $this->getRecord()->getLength() / 2;
    }

    /**
     * Get a value from this table.
     *
     * @param integer $index
     * @return integer
     */
    public function getValue($index)
    {
        $record = $this->getRecord();
        $reader = $record->getFile()->getReader();
        $offset = $record->getOffset();

        return $reader->readInt16($offset + $index * 2);
    }
}