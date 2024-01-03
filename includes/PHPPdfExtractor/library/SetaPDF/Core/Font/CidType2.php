<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: CidType2.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Class representing a Type 2 CID font
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_CidType2 extends SetaPDF_Core_Font_Cid
{
    /**
     * Get the mapping from CIDs to glyph indices.
     *
     * @return string
     */
    public function getCidToGidMap()
    {
        if (!$this->_dictionary->offsetExists('CIDToGIDMap')) {
            return 'Identity';
        }

        $value = $this->_dictionary->offsetGet('CIDToGIDMap')->ensure();

        if ($value instanceof SetaPDF_Core_Type_Stream) {
            return $value->getStream();
        } else {
            return $value->getValue();
        }
    }
}