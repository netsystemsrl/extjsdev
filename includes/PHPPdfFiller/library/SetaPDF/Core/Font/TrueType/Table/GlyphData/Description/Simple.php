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
 * A class representing a simple glyph description.
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_TrueType_Table_GlyphData_Description_Simple extends SetaPDF_Core_Font_TrueType_Table_GlyphData_Description
{
    /**
     * If set, the point is on the curve; otherwise, it is off the curve.
     *
     * @var int
     */
    const ON_CURVE_POINT = 0x01;

    /**
     * If set, the corresponding x-coordinate is 1 byte long. If not set, it is two bytes long.
     * For the sign of this value, see the description of the X_IS_SAME_OR_POSITIVE_X_SHORT_VECTOR flag.
     *
     * @var int
     */
    const X_SHORT_VECTOR = 0x02;

    /**
     * If set, the corresponding y-coordinate is 1 byte long. If not set, it is two bytes long.
     * For the sign of this value, see the description of the Y_IS_SAME_OR_POSITIVE_Y_SHORT_VECTOR flag.
     *
     * @var int
     */
    const Y_SHORT_VECTOR = 0x04;

    /**
     * If set, the next byte (read as unsigned) specifies the number of additional times this flag is to be repeated —
     * that is, the number of additional logical flag entries inserted after this entry. In this way, the number of
     * flags listed can be smaller than the number of points in the glyph description.
     *
     * @var int
     */
    const REPEAT_FLAG = 0x08;

    /**
     * This flag has two meanings, depending on how the X_SHORT_VECTOR flag is set. If X_SHORT_VECTOR is set,
     * this bit describes the sign of the value, with 1 equalling positive and 0 negative. If X_SHORT_VECTOR
     * is not set and this bit is set, then the current x-coordinate is the same as the previous x-coordinate.
     * If X_SHORT_VECTOR is not set and this bit is also not set, the current x-coordinate is a signed 16-bit delta
     * vector.
     *
     * @var int
     */
    const X_IS_SAME_OR_POSITIVE_X_SHORT_VECTOR = 0x10;

    /**
     * This flag has two meanings, depending on how the Y_SHORT_VECTOR flag is set. If Y_SHORT_VECTOR is set, this bit
     * describes the sign of the value, with 1 equalling positive and 0 negative. If Y_SHORT_VECTOR is not set and this
     * bit is set, then the current y-coordinate is the same as the previous y-coordinate. If Y_SHORT_VECTOR is not set
     * and this bit is also not set, the current y-coordinate is a signed 16-bit delta vector.
     *
     * @var int
     */
    const Y_IS_SAME_OR_POSITIVE_Y_SHORT_VECTOR = 0x20;

    /**
     * @inheritdoc
     */
    public function getInstructionSize()
    {
        $numContours = $this->_glyph->getNumberOfContours();

        $offset = ($numContours) * 2;

        return SetaPDF_Core_BitConverter::formatFromUInt16($this->_readBytes(2, $offset));
    }

    /**
     * Returns the number of points in the glyph.
     *
     * @return int
     */
    public function getPointCount()
    {
        $numContours = $this->_glyph->getNumberOfContours();

        if ($numContours == 0) {
            return 0;
        }

        // skip all endPtsOfContours but one
        $offset = ($numContours - 1) * 2;

        return SetaPDF_Core_BitConverter::formatFromUInt16($this->_readBytes(2, $offset)) + 1;
    }
}