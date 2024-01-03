<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Flags.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * A class representing named annotation flags
 *
 * See PDF 32000-1:2008 - 12.5.3, Table 165
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_Page_Annotation_Flags
{
    /**
     * Annotation flag defined in PDF 32000-1:2008 - 12.5.3 / Table 165
     *
     * @var integer
     */
    const INVISIBLE       = 0x01; // bit 1

    /**
     * Annotation flag defined in PDF 32000-1:2008 - 12.5.3 / Table 165
     *
     * @var integer
     */
    const HIDDEN          = 0x02; // 2

    /**
     * Annotation flag defined in PDF 32000-1:2008 - 12.5.3 / Table 165
     *
     * @var integer
     */
    const PRINTS          = 0x04; // 3

    /**
     * Annotation flag defined in PDF 32000-1:2008 - 12.5.3 / Table 165
     *
     * @var integer
     */
    const NO_ZOOM         = 0x08; // 4

    /**
     * Annotation flag defined in PDF 32000-1:2008 - 12.5.3 / Table 165
     *
     * @var integer
     */
    const NO_ROTATE       = 0x10; // 5

    /**
     * Annotation flag defined in PDF 32000-1:2008 - 12.5.3 / Table 165
     *
     * @var integer
     */
    const NO_VIEW         = 0x20; // 6

    /**
     * Annotation flag defined in PDF 32000-1:2008 - 12.5.3 / Table 165
     *
     * @var integer
     */
    const READ_ONLY       = 0x40; // 7

    /**
     * Annotation flag defined in PDF 32000-1:2008 - 12.5.3 / Table 165
     *
     * @var integer
     */
    const LOCKED          = 0x80; // 8

    /**
     * Annotation flag defined in PDF 32000-1:2008 - 12.5.3 / Table 165
     *
     * @var integer
     */
    const TOGGLE_NO_VIEW  = 0x100; // 9

    /**
     * Annotation flag defined in PDF 32000-1:2008 - 12.5.3 / Table 165
     *
     * @var integer
     */
    const LOCKED_CONTENTS = 0x200; // bit 10

    /**
     * Prohibit object initiation by defining the constructor to be private.
     *
     * @internal
     */
    private function __construct()
    {
    }
}