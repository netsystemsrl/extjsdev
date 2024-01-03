<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Path.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * A canvas helper class for path operators
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Canvas
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Canvas_Path extends SetaPDF_Core_Canvas_StandardOperators
{
    /**
     * Line cap style
     *
     * @var integer
     */
    const LINE_CAP_BUTT = 0;

    /**
     * Line cap style
     *
     * @var integer
     */
    const LINE_CAP_ROUND = 1;

    /**
     * Line cap style
     *
     * @var integer
     */
    const LINE_CAP_PROJECTING_SQUARE = 2;

    /**
     * Line join type
     *
     * @var integer
     */
    const LINE_JOIN_MITER = 0;

    /**
     * Line join type
     *
     * @var integer
     */
    const LINE_JOIN_ROUND = 1;

    /**
     * Line join type
     *
     * @var integer
     */
    const LINE_JOIN_BEVEL = 2;

    /**
     * Set the miter limit.
     *
     * @param float $miterLimit
     * @return SetaPDF_Core_Canvas_Path
     */
    public function setMiterLimit($miterLimit = 10.0)
    {
        SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $miterLimit);
        $this->_canvas->write(' M');

        return $this;
    }

    /**
     * Set the dash pattern.
     *
     * @param array $dashesAndGaps
     * @param integer $phase
     * @return SetaPDF_Core_Canvas_Path
     */
    public function setDashPattern(array $dashesAndGaps = array(), $phase = 0)
    {
        SetaPDF_Core_Type_Array::writePdfString($this->_canvas, $dashesAndGaps);
        SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $phase);
        $this->_canvas->write(' d');

        return $this;
    }

    /**
     * Set the line join type.
     *
     * @param integer $lineJoin
     * @return SetaPDF_Core_Canvas_Path
     */
    public function setLineJoin($lineJoin = self::LINE_JOIN_MITER)
    {

        SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $lineJoin);
        $this->_canvas->write(' j');

        return $this;
    }

    /**
     * Set the line width.
     *
     * @param float $lineWidth
     * @return SetaPDF_Core_Canvas_Path
     */
    public function setLineWidth($lineWidth = 1.0)
    {
        SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $lineWidth);
        $this->_canvas->write(' w');

        return $this;
    }

    /**
     * Set the line cap style.
     *
     * @param integer $lineCap
     * @return SetaPDF_Core_Canvas_Path
     */
    public function setLineCap($lineCap = self::LINE_CAP_BUTT)
    {
        SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $lineCap);
        $this->_canvas->write(' J');

        return $this;
    }

  /** Path Construction methods **/

    /**
     * Begin a new subpath at a specific position.
     *
     * @param float $x
     * @param float $y
     * @return SetaPDF_Core_Canvas_Path
     */
    public function moveTo($x, $y)
    {
        SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $x);
        SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $y);
        $this->_canvas->write(' m');

        return $this;
    }

    /**
     * Append a straight line segment.
     *
     * @param float $x
     * @param float $y
     * @return SetaPDF_Core_Canvas_Path
     */
    public function lineTo($x, $y)
    {
        SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $x);
        SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $y);
        $this->_canvas->write(' l');

        return $this;
    }

    /**
     * Append a rectangle to the current path as a complete subpath.
     *
     * @param float $x
     * @param float $y
     * @param float $width
     * @param float $height
     * @return SetaPDF_Core_Canvas_Path
     */
    public function rect($x, $y, $width, $height)
    {
        SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $x);
        SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $y);
        SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $width);
        SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $height);
        $this->_canvas->write(' re');

        return $this;
    }

    /**
     * Append a cubic Bézier curve to the current path.
     *
     * @param float $x1
     * @param float $y1
     * @param float $x2
     * @param float $y2
     * @param float|string|null $x3 Also used as control parameter to define the coincide point
     * @param float|null $y3
     * @return SetaPDF_Core_Canvas_Path
     */
    public function curveTo($x1, $y1, $x2, $y2, $x3 = null, $y3 = null)
    {
        SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $x1);
        SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $y1);
        SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $x2);
        SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $y2);

        if (null !== $x3 && is_numeric($x3) && null !== $y3 && is_numeric($y3)) {
            SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $x3);
            SetaPDF_Core_Type_Numeric::writePdfString($this->_canvas, $y3);
            $this->_canvas->write(' c');

        } else {
            // Check for coincide point -> 3 == {x3,y3}
            $this->_canvas->write($x3 == '3' ? ' v' : ' y');
        }

        return $this;
    }

  /** Path-Painting methods **/

    /**
     * Stroke the path.
     *
     * @return SetaPDF_Core_Canvas_Path
     */
    public function stroke()
    {
        $this->_canvas->write(' S');

        return $this;
    }

    /**
     * Close and stroke the path.
     *
     * @return SetaPDF_Core_Canvas_Path
     */
    public function closeAndStroke()
    {
        $this->_canvas->write(' s');

        return $this;
    }

    /**
     * Close the current subpath by appending a straight line segment from the current point to the starting point of the subpath.
     *
     * @return $this
     */
    public function close()
    {
        $this->_canvas->write(' h');

        return $this;
    }

    /**
     * Close, fill and stroke the path.
     *
     * @return SetaPDF_Core_Canvas_Path
     */
    public function closeFillAndStroke()
    {
        $this->_canvas->write(' b');

        return $this;
    }

    /**
     * Close, fill and stroke the path using even-odd rule.
     *
     * @return SetaPDF_Core_Canvas_Path
     */
    public function closeFillAndStrokeEvenOdd()
    {
        $this->_canvas->write(' b*');

        return $this;
    }

    /**
     * Fill and stroke the path.
     *
     * @return SetaPDF_Core_Canvas_Path
     */
    public function fillAndStroke()
    {
        $this->_canvas->write(' B');

        return $this;
    }

    /**
     * Fill and stroke the path using even-odd rule.
     *
     * @return SetaPDF_Core_Canvas_Path
     */
    public function fillAndStrokeEvenOdd()
    {
        $this->_canvas->write(' B*');

        return $this;
    }

    /**
     * Fill the path.
     *
     * @return SetaPDF_Core_Canvas_Path
     */
    public function fill()
    {
        $this->_canvas->write(' f');

        return $this;
    }

    /**
     * Fill the path using even-odd rule.
     *
     * @return SetaPDF_Core_Canvas_Path
     */
    public function fillEvenOdd()
    {
        $this->_canvas->write(' f*');

        return $this;
    }

    /**
     * End the path object without filling or stroking it.
     *
     * @return SetaPDF_Core_Canvas_Path
     */
    public function endPath()
    {
        $this->_canvas->write(' n');

        return $this;
    }

    /**
     * Clip the current path.
     *
     * @return SetaPDF_Core_Canvas_Path
     */
    public function clip()
    {
        $this->_canvas->write(' W');

        return $this;
    }

    /**
     * Clip the current path using even-odd rule.
     *
     * @return SetaPDF_Core_Canvas_Path
     */
    public function clipEvenOdd()
    {
        $this->_canvas->write(' W*');

        return $this;
    }
}