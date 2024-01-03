<?php
/**
 * This file is part of the SetaPDF-Extractor Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: PageFilterInterface.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * The interface for filter instances that requires a page object.
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @subpackage SetaPDF_Extractor_Filter
 * @license    https://www.setasign.com/ Commercial
 */
interface SetaPDF_Extractor_Filter_PageFilterInterface extends SetaPDF_Extractor_Filter_FilterInterface
{
    /**
     * Set the current page object for the specific filter.
     *
     * @param SetaPDF_Core_Document_Page $page
     * @return void
     */
    public function setPage(SetaPDF_Core_Document_Page $page = null);
}