<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: GraphicState.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * A canvas helper class for graphicState operators
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Canvas
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Canvas_GraphicState
{
    /**
     * The maximum nesting level of the graphic states (default = 28).
     *
     * @var integer
     * @see PDF 32000-1:2008 - C.2 Architectural limits
     */
    static protected $_maxGraphicStateNestingLevel = 28;

    /**
     * Stack of all opened or closed graphic states.
     *
     * @var array
     */
    protected $_stack = array();

    /**
     * Text state helper
     *
     * @var SetaPDF_Core_Canvas_GraphicState_Text
     */
    protected $_text;

    /**
     * Set the maximum nesting level of graphic states.
     *
     * @param integer $maxGraphicStateNestingLevel
     */
    static public function setMaxGraphicStateNestingLevel($maxGraphicStateNestingLevel)
    {
        self::$_maxGraphicStateNestingLevel = (int)$maxGraphicStateNestingLevel;
    }

    /**
     * Get the maximum nesting level of graphic states.
     *
     * @return integer
     */
    static public function getMaxGraphicStateNestingLevel()
    {
        return self::$_maxGraphicStateNestingLevel;
    }

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Geometry_Matrix $matrix
     */
    public function __construct(SetaPDF_Core_Geometry_Matrix $matrix = null)
    {
        $this->_stack[] = array(
            'matrix' => $matrix === null ? new SetaPDF_Core_Geometry_Matrix() : $matrix
        );
    }

    /**
     * Get the current state of the stack.
     *
     * @return mixed
     */
    protected function &_getCurrent()
    {
        return $this->_stack[count($this->_stack) - 1];
    }

    /**
     * Add a transformation matrix to the stack of the current graphic state.
     *
     * @see PDF-Reference PDF 32000-1:2008 8.3.4 Transformation Matrices
     * @param int|float $a
     * @param int|float $b
     * @param int|float $c
     * @param int|float $d
     * @param int|float $e
     * @param int|float $f
     * @return SetaPDF_Core_Canvas_GraphicState
     */
    public function addCurrentTransformationMatrix($a, $b, $c, $d, $e, $f)
    {
        $matrix = new SetaPDF_Core_Geometry_Matrix($a, $b, $c, $d, $e, $f);

        $current =& $this->_getCurrent();
        $current['matrix'] = $matrix->multiply($current['matrix']);

        return $this;
    }

    /**
     * Get the current transformation matrix.
     *
     * @return SetaPDF_Core_Geometry_Matrix
     */
    public function getCurrentTransformationMatrix()
    {
        $current =& $this->_getCurrent();
        return $current['matrix'];
    }

    /**
     * Open a new graphic state and copy the entire graphic state onto the stack of the new graphic state.
     *
     * @throws BadMethodCallException
     * @return SetaPDF_Core_Canvas_GraphicState
     */
    public function save()
    {
        if (count($this->_stack) === self::getMaxGraphicStateNestingLevel()) {
            throw new BadMethodCallException('Too many graphic states open!');
        }

        $current =& $this->_getCurrent();
        $matrix = clone $current['matrix'];

        $this->_stack[] = array('matrix' => $matrix);

        return $this;
    }

    /**
     * Restore the last graphic state and pop all matrices of the current graphic state out of the matrix stack.
     *
     * @throws BadMethodCallException
     * @return SetaPDF_Core_Canvas_GraphicState
     */
    public function restore()
    {
        array_pop($this->_stack);

        if(count($this->_stack) === 0) {
            throw new BadMethodCallException("Graphic state is empty!");
        }

        return $this;
    }

    /**
     * Rotate the graphic state by $angle degrees at the origin defined by $x and $y.
     *
     * @param int|float $x X-coordinate of rotation point
     * @param int|float $y Y-coordinate of rotation point
     * @param float $angle Angle to rotate in degrees
     * @return SetaPDF_Core_Canvas_GraphicState
     */
    public function rotate($x, $y, $angle)
    {
        if ($angle == 0)
            return $this;

        $angle = deg2rad($angle);
        $c = cos($angle);
        $s = sin($angle);

        $this->addCurrentTransformationMatrix($c, $s, -$s, $c, $x, $y);

        return $this->translate(-$x, -$y);
    }

    /**
     * Scale the graphic state by the factor $scaleX and $scaleY.
     *
     * @param int|float $scaleX Scale factor on X
     * @param int|float $scaleY Scale factor on Y
     * @return SetaPDF_Core_Canvas_GraphicState
     */
    public function scale($scaleX, $scaleY)
    {
        return $this->addCurrentTransformationMatrix($scaleX, 0, 0, $scaleY, 0, 0);
    }

    /**
     * Move the graphic state by $shiftX and $shiftY on x-axis and y-axis.
     *
     * @param int|float $shiftX Points to move on x-axis
     * @param int|float $shiftY Points to move on y-axis
     * @return SetaPDF_Core_Canvas_GraphicState
     */
    public function translate($shiftX, $shiftY)
    {
        return $this->addCurrentTransformationMatrix(1, 0, 0, 1, $shiftX, $shiftY);
    }

    /**
     * Skew the graphic state.
     *
     * @param float $angleX Angle to x-axis in degrees
     * @param float $angleY Angle to y-axis in degrees
     * @param int $x Points to stretch on x-axis
     * @param int $y Point to stretch on y-axis
     * @return SetaPDF_Core_Canvas_GraphicState
     */
    public function skew($angleX, $angleY, $x = 0, $y = 0)
    {
        $tX = tan(deg2rad($angleX));
        $tY = tan(deg2rad($angleY));

        return $this->addCurrentTransformationMatrix(1, $tX, $tY, 1, -$tY * $y, -$tX * $x);
    }

    /**
     * Returns the user space coordinates.
     *
     * @param int|float $x
     * @param int|float $y
     * @return array array with ('x' => $x, 'y' => $y)
     */
    public function getUserSpaceXY($x, $y)
    {
        $vector = new SetaPDF_Core_Geometry_Vector($x, $y, 1);
        $result = $this->toUserSpace($vector);

        return array('x' => $result->getX(), 'y' => $result->getY());
    }

    /**
     * Returns the user space coordinates vector.
     *
     * @param SetaPDF_Core_Geometry_Vector $vector
     * @return SetaPDF_Core_Geometry_Vector
     */
    public function toUserSpace(SetaPDF_Core_Geometry_Vector $vector)
    {
        return $vector->multiply($this->getCurrentTransformationMatrix());
    }

    /**
     * Returns the text state helper.
     *
     * @return SetaPDF_Core_Canvas_GraphicState_Text
     */
    public function text()
    {
        if (null === $this->_text) {
            $this->_text = new SetaPDF_Core_Canvas_GraphicState_Text($this, $this->_stack);
        }

        return $this->_text;
    }
}