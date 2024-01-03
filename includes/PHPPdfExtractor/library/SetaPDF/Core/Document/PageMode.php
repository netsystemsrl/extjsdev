<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: PageMode.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * A class holding page mode properties
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @see SetaPDF_Core_Document::setPageLayout()
 */
class SetaPDF_Core_Document_PageMode
{
    /**
     * Constant for page mode value
     *
     * Neither document outline nor thumbnail images visible
     *
     * @var string
     */
    const USE_NONE = 'UseNone';

    /**
     * Constant for page mode value
     *
     * Document outline visible
     *
     * @var string
     */
    const USE_OUTLINES = 'UseOutlines';

    /**
     * Constant for page mode value
     *
     * Thumbnail images visible
     *
     * @var string
     */
    const USE_THUMBS = 'UseThumbs';

    /**
     * Constant for page mode value
     *
     * Full-screen mode, with no menu bar, window controls, or any other window visible
     *
     * @var string
     */
    const FULL_SCREEN = 'FullScreen';

    /**
     * Constant for page mode value
     *
     * (PDF 1.5) Optional content group panel visible
     *
     * @var string
     */
    const USE_OC = 'UseOC';

    /**
     * Constant for page mode value
     *
     * (PDF 1.6) Attachments panel visible
     *
     * @var string
     */
    const USE_ATTACHMENTS = 'UseAttachments';
}