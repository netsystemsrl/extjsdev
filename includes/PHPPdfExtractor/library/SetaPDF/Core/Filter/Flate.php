<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Filter
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Flate.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Class for handling zlib/deflate compression
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Filter
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Filter_Flate extends SetaPDF_Core_Filter_Predictor
{
    /**
     * Checks whether the zlib extension is loaded.
     *
     * Used for testing purpose.
     *
     * @return boolean
     * @internal
     */
    protected function _extensionLoaded()
    {
        return extension_loaded('zlib');
    }

    /**
     * Decodes a flate compressed string.
     *
     * @param string $data The input string
     * @return string
     * @throws SetaPDF_Core_Filter_Exception
     */
    public function decode($data)
    {
        // TODO: better error handling ($php_errormsg)
        if ($this->_extensionLoaded()) {
            $oData = $data;
            $data = @((strlen($data) > 0) ? gzuncompress($data) : '');
            if (false === $data) {
                // Try this fallback
                $tries = 1;
                while ($tries < 10 && ($data === false || strlen($data) < (strlen($oData) - $tries - 1))) {
                    $data = @(gzinflate(substr($oData, $tries)));
                    $tries++;
                }

                if (false === $data) {
                    throw new SetaPDF_Core_Filter_Exception(
                        'Error while decompressing stream.',
                        SetaPDF_Core_Filter_Exception::DECOMPRESS_ERROR
                    );
                }
            }
        } else {
            throw new SetaPDF_Core_Filter_Exception(
                'To handle FlateDecode filter, enable zlib support in PHP.',
                SetaPDF_Core_Filter_Exception::NO_ZLIB
            );
        }

        return parent::decode($data);
    }

    /**
     * Encodes a string with flate compression.
     *
     * @param string $data The input string
     * @return string
     * @throws SetaPDF_Core_Filter_Exception
     */
    public function encode($data)
    {
        $data = parent::encode($data);

        if ($this->_extensionLoaded()) {
            $data = gzcompress($data);
        } else {
            throw new SetaPDF_Core_Filter_Exception(
                'To handle FlateDecode filter, enable zlib support in PHP.',
                SetaPDF_Core_Filter_Exception::NO_ZLIB
            );
        }

        return $data;
    }
}