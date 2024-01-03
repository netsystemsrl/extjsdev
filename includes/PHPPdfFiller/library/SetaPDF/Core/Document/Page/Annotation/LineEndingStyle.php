<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: LineEndingStyle.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Constants class for line ends.
 *
 * See PDF 32000-1:2008 - Table 176
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_Page_Annotation_LineEndingStyle
{
    /**
     * A square filled with the annotation’s interior color, if any
     *
     * @var string
     */
    const SQUARE = 'Square';

    /**
     * A circle filled with the annotation’s interior color, if any
     *
     * @var string
     */
    const CIRCLE = 'Circle';

    /**
     * A diamond shape filled with the annotation’s interior color, if any
     *
     * @var string
     */
    const DIAMOND = 'Diamond';

    /**
     * Two short lines meeting in an acute angle to form an open arrowhead
     *
     * @var string
     */
    const OPEN_ARROW = 'OpenArrow';

    /**
     * Two short lines meeting in an acute angle as in the OpenArrow style and connected by a third line to
     * form a triangular closed arrowhead filled with the annotation’s interior color, if any
     *
     * @var string
     */
    const CLOSED_ARROW = 'ClosedArrow';

    /**
     * No line ending
     *
     * @var string
     */
    const NONE = 'None';

    /**
     * A short line at the endpoint perpendicular to the line itself
     *
     * @var string
     */
    const BUTT = 'Butt';

    /**
     * Two short lines in the reverse direction from OpenArrow
     *
     * @var string
     */
    const REVERSED_OPEN_ARROW = 'ROpenArrow';

    /**
     * A triangular closed arrowhead in the reverse direction from ClosedArrow
     *
     * @var string
     */
    const REVERSED_CLOSED_ARROW = 'RClosedArrow';

    /**
     * A short line at the endpoint approximately 30 degrees clockwise from perpendicular to the line itself
     *
     * @var string
     */
    const SLASH = 'Slash';

    /**
     * @internal
     */
    private function __construct()
    {}

    /**
     * Get all allowed line endings.
     *
     * @return array
     */
    static public function getAll()
    {
        return [
            self::SQUARE,
            self::CIRCLE,
            self::DIAMOND,
            self::OPEN_ARROW,
            self::CLOSED_ARROW,
            self::NONE,
            self::BUTT,
            self::REVERSED_OPEN_ARROW,
            self::REVERSED_CLOSED_ARROW,
            self::SLASH
        ];
    }
}