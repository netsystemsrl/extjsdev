<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: FontProgram.php 1186 2018-01-24 13:55:21Z timo.scholz $
 */

/**
 * This class represents the "fpgm" table in a sub-setting context.
 *
 * See {@link https://www.microsoft.com/typography/otspec/fpgm.htm} for more details.
 *
 * @method SetaPDF_Core_Font_TrueType_Table_FontProgram getOriginalTable()
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_TrueType_Subset_Table_FontProgram extends SetaPDF_Core_Font_TrueType_Subset_Table
{
    /**
     * The constructor.
     *
     * This table will be copied without changes.
     *
     * @param SetaPDF_Core_Font_TrueType_Table_FontProgram $table
     */
    public function __construct(SetaPDF_Core_Font_TrueType_Table_FontProgram $table)
    {
        parent::__construct($table);
    }
}