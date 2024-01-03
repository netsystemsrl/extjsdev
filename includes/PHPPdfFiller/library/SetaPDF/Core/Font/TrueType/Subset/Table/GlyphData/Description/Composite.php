<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Composite.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * This class represents the description of a composite glyph in a sub-setting context.
 *
 * See {@link https://www.microsoft.com/typography/otspec/glyf.htm#compositeGlyphDescription} for more details.
 *
 * @method SetaPDF_Core_Font_TrueType_Table_GlyphData_Description_Composite getOrigin()
 * @property SetaPDF_Core_Font_TrueType_Table_GlyphData_Description_Composite $_description
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_TrueType_Subset_Table_GlyphData_Description_Composite
    extends SetaPDF_Core_Font_TrueType_Subset_Table_GlyphData_Description
{
    /**
     * Writes the description and update the glyph ids.
     *
     * @param SetaPDF_Core_Writer_WriterInterface $writer
     */
    public function write(SetaPDF_Core_Writer_WriterInterface $writer)
    {
        $rawData = $this->_description->getRawComponentsData();

        foreach ($rawData['components'] as $raw) {
            $writer->write(
                // flags
                $raw[0] .
                // append the updated glyphId
                SetaPDF_Core_BitConverter::formatToUInt16(
                    $this->_glyf->getNewGlyphId(
                        SetaPDF_Core_BitConverter::formatFromUInt16($raw[1])
                    )
                ) .
                // additional data
                $raw[2]
            );
        }

        $writer->write($rawData['instructions']);
    }
}
