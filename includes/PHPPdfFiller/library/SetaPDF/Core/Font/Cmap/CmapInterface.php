<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: CmapInterface.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Interface for CMAPs.
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
interface SetaPDF_Core_Font_Cmap_CmapInterface
{
    /**
     * Do a reverse lookup.
     *
     * @param string $dest
     * @return bool|mixed
     */
    public function reverseLookup($dest);

    /**
     * Do a reverse CID lookup.
     *
     * @param string $dest
     * @return bool|mixed
     */
    public function reverseCidLoopkup($dest);

    /**
     * Lookup a unicode value.
     *
     * @param string $src
     * @return bool|number|string
     */
    public function lookup($src);

    /**
     * Lookup for a CID.
     *
     * @param string $src
     * @return bool|number|string
     */
    public function lookupCid($src);
}