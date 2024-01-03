<?php
/**
 * This file is part of the SetaPDF-Extractor Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: TextItem.php 1070 2017-07-13 11:59:19Z jan.slabon $
 */

/**
 * A text item.
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Extractor_TextItem implements SetaPDF_Extractor_Result_CompareableInterface
{
    /**
     * The raw PDF string.
     *
     * @var string
     */
    protected $_rawString = '';

    /**
     * The resulting string in a specific encoding.
     *
     * @var string[]
     */
    protected $_string = array();

    /**
     * The font object used by this text item.
     *
     * @var SetaPDF_Core_Font
     */
    protected $_font;

    /**
     * The font size.
     *
     * @var float
     */
    protected $_fontSize;

    /**
     * The character spacing value.
     *
     * @var float
     */
    protected $_characterSpacing;

    /**
     * The word spacing value.
     * @var float
     */
    protected $_wordSpacing;

    /**
     * The scaling value.
     *
     * @var float
     */
    protected $_scaling;

    /**
     * The current transformation matrix when the text item starts.
     *
     * @var SetaPDF_Core_Geometry_Matrix
     */
    protected $_start;

    /**
     * The baseline start vector.
     *
     * @var SetaPDF_Core_Geometry_Vector
     */
    protected $_baselineStart;

    /**
     * The current transformation matrix when the text item ends.
     *
     * @var SetaPDF_Core_Geometry_Matrix
     */
    protected $_end;

    /**
     * The baseline end vector.
     *
     * @var SetaPDF_Core_Geometry_Vector
     */
    protected $_baselineEnd;

    /**
     * An item identifier.
     *
     * @var string
     */
    protected $_no;

    /**
     * The orientation of this text item.
     *
     * @var float
     */
    protected $_orientation;

    /**
     * The bounds of this text item.
     *
     * @var SetaPDF_Extractor_Result_Bounds
     */
    protected $_bounds;

    /**
     * The upper left point/vector of this text item.
     *
     * @var SetaPDF_Core_Geometry_Vector
     */
    protected $_ul;

    /**
     * The space width of the font used by this text item.
     *
     * @var float
     */
    protected $_spaceWidth;

    /**
     * The filter id which accepted this item.
     *
     * @var null|string
     */
    protected $_filterId;

    /**
     * The constructor.
     *
     * @param $rawString
     * @param SetaPDF_Core_Font $font
     * @param $fontSize
     * @param $characterSpacing
     * @param $wordSpacing
     * @param $scaling
     * @param SetaPDF_Core_Geometry_Matrix $start
     * @param SetaPDF_Core_Geometry_Matrix $end
     * @param $no
     */
    public function __construct(
        $rawString,
        SetaPDF_Core_Font $font,
        $fontSize,
        $characterSpacing,
        $wordSpacing,
        $scaling,
        SetaPDF_Core_Geometry_Matrix $start,
        SetaPDF_Core_Geometry_Matrix $end,
        $no
    )
    {
        $this->_rawString = $rawString;
        $this->_font = $font;
        $this->_fontSize = $fontSize;
        $this->_characterSpacing = $characterSpacing;
        $this->_wordSpacing = $wordSpacing;
        $this->_scaling = $scaling;
        $this->_start = $start;
        $this->_end = $end;
        $this->_no = $no;
    }

    /**
     * Release memory and cycled references
     */
    public function cleanUp()
    {
        $this->_font = null;
        $this->_start = null;
        $this->_end = null;
    }

    /**
     * Get the text items font object.
     *
     * @return SetaPDF_Core_Font
     */
    public function getFont()
    {
        return $this->_font;
    }

    /**
     * Get the font size of this text item.
     *
     * The value is from the local graphic state and not a value in the user space.
     *
     * @return float
     */
    public function getFontSize()
    {
        return $this->_fontSize;
    }

    /**
     * Get the character spacing.
     *
     * The value is from the local graphic state and not a value in the user space.
     *
     * @return float
     */
    public function getCharacterSpacing()
    {
        return $this->_characterSpacing;
    }

    /**
     * Get the word spcaing defined in its graphic state.
     *
     * The value is from the local graphic state and not a value in the user space.
     *
     * @return float
     */
    public function getWordSpacing()
    {
        return $this->_wordSpacing;
    }

    /**
     * Get the scaling value.
     *
     * The value is from the local graphic state and not a value in the user space.
     *
     * @return float
     */
    public function getScaling()
    {
        return $this->_scaling;
    }

    /**
     * Get the transformation matrix which was defined when the text item started.
     *
     * @return SetaPDF_Core_Geometry_Matrix
     */
    public function getStartMatrix()
    {
        return $this->_start;
    }

    /**
     * Get the transformation matrix which was defined after the text item was shown.
     *
     * @return SetaPDF_Core_Geometry_Matrix
     */
    public function getEndMatrix()
    {
        return $this->_end;
    }

    /**
     * Get the base line start vector.
     *
     * @return SetaPDF_Core_Geometry_Vector
     */
    public function getBaseLineStart()
    {
        if (!isset($this->_baselineStart)) {
            $vector = new SetaPDF_Core_Geometry_Vector();
            $this->_baselineStart = $vector->multiply($this->_start);
        }

        return $this->_baselineStart;
    }

    /**
     * Get the base line end vector.
     *
     * @return SetaPDF_Core_Geometry_Vector
     */
    public function getBaseLineEnd()
    {
        if (!isset($this->_baselineEnd)) {
            $vector = new SetaPDF_Core_Geometry_Vector();
            $this->_baselineEnd = $vector->multiply($this->_end);
        }

        return $this->_baselineEnd;
    }

    /**
     * Get a font bounding box vector.
     *
     * @param $name
     * @return SetaPDF_Core_Geometry_Vector
     * @throws SetaPDF_Core_Exception
     */
    protected function _getFontBBoxVector($name)
    {
        $calculated = false;
        $fontBBox = $this->_font->getFontBBox();
        if (array_sum($fontBBox) === 0) {
            $fontBBox = $this->_font->getFontBBox(true);
            $calculated = true;
        }

        if ($this->_font instanceof SetaPDF_Core_Font_Type3) {
            $vector = new SetaPDF_Core_Geometry_Vector(0, $fontBBox[$name] * $this->_fontSize);
            return $vector->multiply($this->_font->getFontMatrix());
        } else {
            // if the font box looks uncommon, try to recalculate it
            if (!$calculated && abs($fontBBox[$name] / 1000) > 2) {
                try {
                    $fontBBox = $this->_font->getFontBBox(true);
                } catch (Exception $e) {
                    // impossible or not implemented
                }
            }

            return new SetaPDF_Core_Geometry_Vector(0, $fontBBox[$name] / 1000 * $this->_fontSize);
        }
    }

    /**
     * Get the lower left vector.
     *
     * @return SetaPDF_Core_Geometry_Vector
     */
    public function getLl()
    {
        return $this->_getFontBBoxVector(1)->multiply($this->_start);
    }

    /**
     * Get the upper left vector.
     *
     * @return SetaPDF_Core_Geometry_Vector
     */
    public function getUl()
    {
        if ($this->_ul === null) {
            $this->_ul = $this->_getFontBBoxVector(3)->multiply($this->_start);
        }

        return $this->_ul;
    }

    /**
     * Get the upper right vector.
     *
     * @return SetaPDF_Core_Geometry_Vector
     */
    public function getUr()
    {
        return $this->_getFontBBoxVector(3)->multiply($this->_end);
    }

    /**
     * Get lower right vector.
     *
     * @return SetaPDF_Core_Geometry_Vector
     */
    public function getLr()
    {
        return $this->_getFontBBoxVector(1)->multiply($this->_end);
    }

    /**
     * Get the bounds of this text item.
     *
     * @return SetaPDF_Extractor_Result_Bounds
     */
    public function getBounds()
    {
        if (!isset($this->_bounds)) {
            $this->_bounds = new SetaPDF_Extractor_Result_Bounds(
                $this->getLl()->toPoint(), $this->getUl()->toPoint(), $this->getUr()->toPoint(), $this->getLr()->toPoint()
            );
        }

        return $this->_bounds;
    }

    /**
     * Get the width of the space character in user space.
     *
     * @return float
     * @throws SetaPDF_Core_Exception
     */
    public function getUserSpaceSpaceWidth()
    {
        if (!isset($this->_spaceWidth)) {
            $missingWidth = $this->_font->getMissingWidth();
            $width = $this->_font->getGlyphWidth("\x00\x20");

            if ($width == 0 || abs($width - $missingWidth) <= SetaPDF_Core::FLOAT_COMPARISON_PRECISION) {
                // fallback: let's create a fuzzy value through the font bounding box values
                $fontBBox = $this->_font->getFontBBox();
                $width = abs($fontBBox[2] - $fontBBox[0]);
                // nope... that seems to be a corrupted bounding box
                if ($width > 2000 || $width == 0) {
                    $width = $this->_font->getAvgWidth(true) / 2;
                } else {
                    $width *= .3;
                }
            }

            $angle = (float)$this->getOrientation();
            if ($angle != 0) {
                $c = cos(-$angle);
                $s = sin(-$angle);

                $m1 = new SetaPDF_Core_Geometry_Matrix();
                $orientationMatrix = $m1->multiply(new SetaPDF_Core_Geometry_Matrix($c, $s, -$s, $c, 0, 0));
                $matrix = $this->_start->multiply($orientationMatrix);
            } else {
                $matrix = $this->_start;
            }

            $vectorA = new SetaPDF_Core_Geometry_Vector();
            $vectorA = $vectorA->multiply($matrix);
            if ($this->_font instanceof SetaPDF_Core_Font_Type3) {
                $vectorB = new SetaPDF_Core_Geometry_Vector($width * $this->_fontSize * $this->_scaling / 100);
                $vectorB = $vectorB->multiply($this->_font->getFontMatrix());
            } else {
                $vectorB = new SetaPDF_Core_Geometry_Vector(($width / 1000 * $this->_fontSize) * $this->_scaling / 100);
            }

            $this->_spaceWidth = $vectorB->multiply($matrix)->subtract($vectorA)->getX();
        }

        return $this->_spaceWidth;
    }

    /**
     * Get the text item identification.
     *
     * @return string
     */
    public function getNo()
    {
        return $this->_no;
    }

    /**
     * Get the raw string.
     *
     * @return string
     */
    public function getRawString()
    {
        return $this->_rawString;
    }

    /**
     * Get the string in a specific encoding.
     *
     * @param string $encoding
     * @return string
     */
    public function getString($encoding = 'UTF-8')
    {
        if (!isset($this->_string[$encoding])) {
            $this->_string[$encoding] = $this->_font->getCharsByCharCodes($this->_rawString, $encoding, false);
        }

        return $this->_string[$encoding];
    }

    /**
     * Get the orientation of the text item.
     *
     * @return float
     */
    public function getOrientation()
    {
        if (!isset($this->_orientation)) {
            $start = $this->getBaseLineStart();
            $end = $this->getBaseLineEnd();

            $orientationVector = $end->subtract($start);
            if ($orientationVector->getLength() == 0) {
                $orientationVector = new SetaPDF_Core_Geometry_Vector(1, 0, 0);
            }

            // http://en.wikipedia.org/wiki/Atan2 : [...]The atan2 function is useful in many applications involving
            // vectors in Euclidean space, such as finding the direction from one point to another. A principal use
            // is in computer graphics rotations, for converting rotation matrix representations into Euler angles.
            $this->_orientation = atan2($orientationVector->getY(), $orientationVector->getX());
        }

        return $this->_orientation;
    }

    /**
     * Sets the filter id by which this item was accepted.
     *
     * @param string $filterId
     */
    public function setFilterId($filterId)
    {
        $this->_filterId = $filterId;
    }

    /**
     * Get the filter id by which this item was accepted.
     *
     * @return null|string
     */
    public function getFilterId()
    {
        return $this->_filterId;
    }
}