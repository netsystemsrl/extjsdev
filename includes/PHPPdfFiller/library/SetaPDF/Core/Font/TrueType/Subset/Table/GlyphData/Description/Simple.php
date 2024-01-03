<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Simple.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * This class represents the description of a simple glyph in a sub-setting context.
 *
 * See {@link https://www.microsoft.com/typography/otspec/glyf.htm#simpleGlyphDescription} for more details.
 *
 * @method SetaPDF_Core_Font_TrueType_Table_GlyphData_Description_Simple getOrigin()
 * @property SetaPDF_Core_Font_TrueType_Table_GlyphData_Description_Simple $_description
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_TrueType_Subset_Table_GlyphData_Description_Simple
    extends SetaPDF_Core_Font_TrueType_Subset_Table_GlyphData_Description
{
    /**
     * @inheritdoc
    */
    public function write(SetaPDF_Core_Writer_WriterInterface $writer)
    {
        $writer->write($this->_description->getRawData());
    }
}