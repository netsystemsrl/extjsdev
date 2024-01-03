<?php
/**
 * This file is part of the SetaPDF-Extractor Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: WordGroups.php 1186 2018-01-24 13:55:21Z timo.scholz $
 */

/**
 * This class represents word groups
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @subpackage SetaPDF_Extractor_Result
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Extractor_Result_WordGroups extends SetaPDF_Extractor_Result_Collection
{
    /**
     * Implementation of the ArrayAccess interface.
     *
     * @see http://php.net/manual/arrayaccess.offsetset.php
     * @param null|integer $key
     * @param SetaPDF_Extractor_Result_Words $value
     * @throws InvalidArgumentException
     */
    public function offsetSet($key, $value)
    {
        if (
            !$value instanceof SetaPDF_Extractor_Result_Words
        ) {
            throw new InvalidArgumentException(
                'Only items of SetaPDF_Extractor_Result_Words are allowed.'
            );
        }

        parent::offsetSet($key, $value);
    }
}