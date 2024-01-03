<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Canvas.php 1185 2018-01-24 13:45:38Z timo.scholz $
 */

/**
 * A class representing a Canvas
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Canvas
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Canvas extends SetaPDF_Core_Canvas_Simple
    implements SetaPDF_Core_Canvas_StreamProxyInterface
{
    const GS_SYNC_CURRENT_TRANSFORMATION_MATRIX = 1;
    const GS_SYNC_TEXT = 2;
    const GS_SYNC_COLOR = 4;

    /**
     * The writer
     *
     * @var SetaPDF_Core_Canvas_StreamProxyInterface
     */
    protected $_streamProxy;

    /**
     * Draw helper instance
     *
     * @var SetaPDF_Core_Canvas_Draw
     */
    protected $_draw;

    /**
     * Path helper instance
     *
     * @var SetaPDF_Core_Canvas_Path
     */
    protected $_path;

    /**
     * Text helper instance
     *
     * @var SetaPDF_Core_Canvas_Text
     */
    protected $_text;

    /**
     * A helper instance for marked content
     * 
     * @var SetaPDF_Core_Canvas_MarkedContent
     */
    protected $_markedContent;

    /**
     * A graphic state instance
     *
     * @var SetaPDF_Core_Canvas_GraphicState
     */
    protected $_graphicState;
    
    /**
     * Cached written content
     * 
     * @var string
     */
    protected $_cache = '';
    
    /**
     * Should the output be cached or not
     * 
     * @var boolean
     */
    protected $_cacheOutput = false;

    /**
     * Sync level
     *
     * @var int
     */
    protected $_graphicStateSync = self::GS_SYNC_CURRENT_TRANSFORMATION_MATRIX;
    
    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Canvas_ContainerInterface $canvasContainer The canvas container
     */
    public function __construct(SetaPDF_Core_Canvas_ContainerInterface $canvasContainer)
    {
        parent::__construct($canvasContainer);
        $this->_streamProxy = $canvasContainer->getStreamProxy();
    }

    /**
     * Release objects to free memory and cycled references.
     *
     * After calling this method the instance of this object is unusable!
     *
     * @return void
     */
    public function cleanUp()
    {
        $this->_streamProxy = null;
        $this->_canvasContainer = null;

        if (null !== $this->_draw) {
            $this->_draw->cleanUp();
            $this->_draw = null;
        }

        if (null !== $this->_path) {
            $this->_path->cleanUp();
            $this->_path = null;
        }

        if (null !== $this->_text) {
            $this->_text->cleanUp();
            $this->_text = null;
        }
        
        if (null !== $this->_markedContent) {
            $this->_markedContent->cleanUp();
            $this->_markedContent = null;
        }
    }

    /**
     * Get the bitmask that defines which values should be synced with the graphic state object.
     *
     * @see graphicState()
     * @return int
     */
    public function getGraphicStateSync()
    {
        return $this->_graphicStateSync;
    }

    /**
     * Set the bitmask defining, which values should be synced with the graphic state object.
     *
     * @param integer $graphicStateSync
     */
    public function setGraphicStateSync($graphicStateSync)
    {
        $this->_graphicStateSync = $graphicStateSync;
    }

    /**
     * Get the draw helper.
     *
     * @return SetaPDF_Core_Canvas_Draw
     */
    public function draw()
    {
        if (null === $this->_draw) {
            $this->_draw = new SetaPDF_Core_Canvas_Draw($this);
        }

        return $this->_draw;
    }

    /**
     * Get the path helper.
     *
     * @return SetaPDF_Core_Canvas_Path
     */
    public function path()
    {
        if (null === $this->_path) {
            $this->_path = new SetaPDF_Core_Canvas_Path($this);
        }

        return $this->_path;
    }

    /**
     * Get the text helper.
     *
     * @return SetaPDF_Core_Canvas_Text
     */
    public function text()
    {
        if (null === $this->_text) {
            $this->_text = new SetaPDF_Core_Canvas_Text($this);
        }

        return $this->_text;
    }
    
    /**
     * Get the marked content helper.
     * 
     * @return SetaPDF_Core_Canvas_MarkedContent
     */
    public function markedContent()
    {
        if (null === $this->_markedContent) {
            $this->_markedContent = new SetaPDF_Core_Canvas_MarkedContent($this);
        }
    
        return $this->_markedContent;
    }

    /**
     * Return the graphic state object if no graphic state is defined an new instance will be initialized.
     *
     * @return SetaPDF_Core_Canvas_GraphicState
     */
    public function graphicState()
    {
        if (null === $this->_graphicState) {
            $this->_graphicState = new SetaPDF_Core_Canvas_GraphicState();
        }

        return $this->_graphicState;
    }
    
    /**
     * Get the height of the canvas.
     *
     * @return float
     */
    public function getHeight()
    {
        return $this->_canvasContainer->getHeight();
    }

    /**
     * Get the width of the canvas.
     *
     * @return float
     */
    public function getWidth()
    {
        return $this->_canvasContainer->getWidth();
    }

    /**
     * Clears the complete canvas content.
     */
    public function clear()
    {
        $this->_streamProxy->clear();
    }

    /**
     * Get the whole byte stream of the canvas.
     *
     * @see SetaPDF_Core_Canvas_StreamProxyInterface::getStream()
     * @return string
     */
    public function getStream()
    {
        return $this->_streamProxy->getStream();
    }

    /**
     * Writes bytes to the canvas content stream.
     *
     * @param string $bytes The bytes to write
     * @see SetaPDF_Core_WriteInterface::write()
     */
    public function write($bytes)
    {
        $this->_streamProxy->write($bytes);
        
        if (true === $this->_cacheOutput) {
            $this->_cache .= $bytes;
        }
    }

    /**
     * Get the stream proxy.
     *
     * @return SetaPDF_Core_Canvas_StreamProxyInterface
     */
    public function getStreamProxy()
    {
        return $this->_streamProxy;
    }

    /**
     * Start caching.
     *
     * The output of write() will be cached.
     *
     * This will also clear the cache.
     */
    public function startCache()
    {
        $this->_cacheOutput = true;
        $this->_cache = '';
    }

    /**
     * Stop caching the output of write().
     *
     * This will also clear the cache.
     */
    public function stopCache()
    {
        $this->_cacheOutput = false;
        $this->_cache = '';
    }

    /**
     * Returns the cache.
     *
     * @return string
     */
    public function getCache()
    {
        return $this->_cache;
    }

    /**
     * Add a resource to the pages/xobjects resources dictionary.
     *
     * @param string|SetaPDF_Core_Resource $type The resource type (Font, XObject, ExtGState,...) or an implementation of SetaPDF_Core_Resource
     * @param SetaPDF_Core_Resource|SetaPDF_Core_Type_IndirectObjectInterface $object The resource to add
     * @param SetaPDF_Core_Document $document The document instance
     * @return string The name of the added resource.
     * @throws InvalidArgumentException
     */
    public function addResource($type, $object = null, SetaPDF_Core_Document $document = null)
    {
        if ($type instanceof SetaPDF_Core_Resource) {
            $object = $type->getIndirectObject($document);
            $type = $type->getResourceType();
        }
        
        if ($object instanceof SetaPDF_Core_Resource)
            $object = $object->getIndirectObject($document);

        if (!($object instanceof SetaPDF_Core_Type_IndirectObjectInterface)) {
            throw new InvalidArgumentException('$object has to be an instance of SetaPDF_Core_Type_IndirectObjectInterface or SetaPDF_Core_Resource');
        }

        $resources = $this->getResources(true, true, $type);
        
        foreach ($resources AS $name => $resourceValue) {
            if ($resourceValue instanceof SetaPDF_Core_Type_IndirectObjectInterface && 
                $resourceValue->getObjectIdent() === $object->getObjectIdent()
            ) {
                return $name;
            }
        }

        switch ($type) {
            case SetaPDF_Core_Resource::TYPE_FONT:
                $prefix = 'F';
                break;
            case SetaPDF_Core_Resource::TYPE_X_OBJECT:
                $prefix = 'I';
                break;
            case SetaPDF_Core_Resource::TYPE_EXT_G_STATE:
                $prefix = 'GS';
                break;
            case SetaPDF_Core_Resource::TYPE_COLOR_SPACE:
                $prefix = 'CS';
                break;
            case SetaPDF_Core_Resource::TYPE_PATTERN:
                $prefix = 'P';
                break;
            case SetaPDF_Core_Resource::TYPE_SHADING:
                $prefix = 'SH';
                break;
            case SetaPDF_Core_Resource::TYPE_PROPERTIES:
                $prefix = 'PR';
                break;
            case SetaPDF_Core_Resource::TYPE_PROC_SET:
                throw new InvalidArgumentException('Invalid resource type (' . $type . ')');
            default:
                $prefix = 'X';
        }

        $i = 0;
        while ($resources->offsetExists(($name = $prefix . ++$i))) ;

        $resources->offsetSet($name, $object);

        return $name;
    }

    /**
     * Set a resource for the canvas.
     *
     * @param string $type The resource type (Font, XObject, ExtGState,...) or an implementation of SetaPDF_Core_Resource
     * @param string $name The name of the resource
     * @param SetaPDF_Core_Resource|SetaPDF_Core_Type_IndirectObjectInterface $object
     * @param SetaPDF_Core_Document $document
     * @throws InvalidArgumentException
     * @return string
     */
    public function setResource($type, $name, $object, SetaPDF_Core_Document $document = null)
    {
        if ($object instanceof SetaPDF_Core_Resource) {
            $object = $object->getIndirectObject($document);
        }

        if (!($object instanceof SetaPDF_Core_Type_IndirectObjectInterface)) {
            throw new InvalidArgumentException('$object has to be an instance of SetaPDF_Core_Type_IndirectObjectInterface or SetaPDF_Core_Resource');
        }

        $resources = $this->getResources(true, true, $type);
        $resources->offsetSet($name, $object);

        return $name;
    }

  /** Setting Colors **/

    /**
     * Set the color.
     *
     * @param SetaPDF_Core_DataStructure_Color|int[]|int|string $color The color
     * @param boolean $stroking Do stroking?
     * @return SetaPDF_Core_Canvas
     */
    public function setColor($color, $stroking = true)
    {
        if ($color instanceof SetaPDF_Core_DataStructure_Color) {
            $color->draw($this, $stroking);
        } else {
            SetaPDF_Core_DataStructure_Color::writePdfStringByComponents($this, $color, $stroking);
        }

        return $this;
    }

    /**
     * Set the stroking color.
     *
     * @param SetaPDF_Core_DataStructure_Color|int[]|int|string $color The stroking color
     * @return SetaPDF_Core_Canvas
     */
    public function setStrokingColor($color)
    {
        return $this->setColor($color, true);
    }

    /**
     * Set the non-stroking color.
     *
     * @param SetaPDF_Core_DataStructure_Color|int[]|int|string $color The non-stroking color
     * @return SetaPDF_Core_Canvas
     */
    public function setNonStrokingColor($color)
    {
        return $this->setColor($color, false);
    }

    /**
     * Set the current color space.
     *
     * @param SetaPDF_Core_ColorSpace|SetaPDF_Core_Type_Name|string $colorSpace The color space
     * @param bool $stroking Do stroking?
     * @return SetaPDF_Core_Canvas
     */
    public function setColorSpace($colorSpace, $stroking = true)
    {
        if (!$colorSpace instanceof SetaPDF_Core_ColorSpace) {
            if (!$colorSpace instanceof SetaPDF_Core_Type_Name)
                $colorSpace = new SetaPDF_Core_Type_Name($colorSpace);

            $colorSpace = SetaPDF_Core_ColorSpace::createByDefinition($colorSpace);
        }

        if ($colorSpace instanceof SetaPDF_Core_Resource) {
            $value = $this->addResource(SetaPDF_Core_Resource::TYPE_COLOR_SPACE, $colorSpace->getIndirectObject());
        } else {
            $value = $colorSpace->getPdfValue()->getValue();
        }

        SetaPDF_Core_Type_Name::writePdfString($this, $value);
        $this->write($stroking ? ' CS' : ' cs');

        return $this;
    }

    /**
     * Set the stroking color space.
     *
     * @param SetaPDF_Core_ColorSpace|SetaPDF_Core_Type_Name|string $colorSpace The color space
     * @return SetaPDF_Core_Canvas
     */
    public function setStrokingColorSpace($colorSpace)
    {
        return $this->setColorSpace($colorSpace, true);
    }

    /**
     * Set the non-stroking color space.
     *
     * @param SetaPDF_Core_ColorSpace|SetaPDF_Core_Type_Name|string $colorSpace The color space
     * @return SetaPDF_Core_Canvas
     */
    public function setNonStrokingColorSpace($colorSpace)
    {
        return $this->setColorSpace($colorSpace, false);
    }

  /** Graphic state **/

    /**
     * Set a named graphic state.
     *
     * @param SetaPDF_Core_Resource_ExtGState $graphicState The graphic state
     * @param SetaPDF_Core_Document $document
     * @return SetaPDF_Core_Canvas
     * @throws InvalidArgumentException
     */
    public function setGraphicState(
        SetaPDF_Core_Resource_ExtGState $graphicState,
        SetaPDF_Core_Document $document = null
    )
    {
        $name = $this->addResource($graphicState, null, $document);
        SetaPDF_Core_Type_Name::writePdfString($this, $name, true);
        $this->write(' gs');

        return $this;
    }

    /**
     * Open a new graphic state and copy the entire graphic state onto the stack of the new graphic state.
     *
     * @return SetaPDF_Core_Canvas
     */
    public function saveGraphicState()
    {
        $this->write("\nq");

        if ($this->getGraphicStateSync() & self::GS_SYNC_CURRENT_TRANSFORMATION_MATRIX) {
            $this->graphicState()->save();
        }

        return $this;
    }

    /**
     * Restore the last graphic state and pop all matrices of the current graphic state out of the matrix stack.
     *
     * @return SetaPDF_Core_Canvas
     */
    public function restoreGraphicState()
    {
        $this->write("\nQ");

        if ($this->getGraphicStateSync() & self::GS_SYNC_CURRENT_TRANSFORMATION_MATRIX) {
            $this->graphicState()->restore();
        }

        return $this;
    }

    /**
     * Returns the user space coordinates of the transformation matrix.
     *
     * @param int $x x-coordinate
     * @param int $y y-coordinate
     * @deprecated Use toUserSpace() instead.
     * @see toUserSpace()
     * @return array ('x' => $x, 'y' => $y)
     */
    public function getUserSpaceXY($x, $y)
    {
        $vector = new SetaPDF_Core_Geometry_Vector($x, $y);
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
        return $this->graphicState()->toUserSpace($vector);
    }

    /**
     * Add a transformation matrix to the matrix stack of the current graphic state.
     *
     * @see PDF-Reference PDF 32000-1:2008 8.3.4 Transformation Matrices
     * @param int|float $a A
     * @param int|float $b B
     * @param int|float $c C
     * @param int|float $d D
     * @param int|float $e E
     * @param int|float $f F
     * @return SetaPDF_Core_Canvas
     */
    public function addCurrentTransformationMatrix($a, $b, $c, $d, $e, $f)
    {
        SetaPDF_Core_Type_Numeric::writePdfString($this, $a);
        SetaPDF_Core_Type_Numeric::writePdfString($this, $b);
        SetaPDF_Core_Type_Numeric::writePdfString($this, $c);
        SetaPDF_Core_Type_Numeric::writePdfString($this, $d);
        SetaPDF_Core_Type_Numeric::writePdfString($this, $e);
        SetaPDF_Core_Type_Numeric::writePdfString($this, $f);
        $this->write(' cm');

        if ($this->getGraphicStateSync() & self::GS_SYNC_CURRENT_TRANSFORMATION_MATRIX) {
            $this->graphicState()->addCurrentTransformationMatrix($a, $b, $c, $d, $e, $f);
        }

        return $this;
    }

    /**
     * Rotate the transformation matrix by $angle degrees at the origin defined by $x and $y.
     *
     * @param int|float $x X-coordinate of rotation point
     * @param int|float $y Y-coordinate of rotation point
     * @param float $angle Angle to rotate in degrees
     * @return SetaPDF_Core_Canvas
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
     * Normalize the graphic state in view to an outer rotation (e.g. page rotation).
     *
     * @param number $rotation
     * @param SetaPDF_Core_DataStructure_Rectangle $box
     * @return bool
     */
    public function normalizeRotation($rotation, SetaPDF_Core_DataStructure_Rectangle $box)
    {
        if ($rotation != 0) {
            switch ($rotation) {
                case -270:
                case 90:
                    $this->translate($box->getWidth(), 0);
                    break;
                case -180:
                case 180:
                    $this->translate($box->getWidth(), $box->getHeight());
                    break;
                case 270:
                case -90:
                    $this->translate(0, $box->getHeight());
                    break;
            }

            $this->rotate($box->llx, $box->lly, $rotation);

            return true;
        }

        return false;
    }

    /**
     * Normalize the graphic state in view to an outer rotation (e.g. page rotation) and shifted origin.
     *
     * @param number $rotation
     * @param SetaPDF_Core_DataStructure_Rectangle $box
     * @return bool
     */
    public function normalizeRotationAndOrigin($rotation, SetaPDF_Core_DataStructure_Rectangle $box)
    {
        $rotated = $this->normalizeRotation($rotation, $box);
        $translated = false;
        if ($box->getLlx() != 0 || $box->getLly() != 0) {
            $this->translate($box->llx, $box->lly);
            $translated = true;
        }
        return $rotated || $translated;
    }

    /**
     * Scale the transformation matrix by the factor $scaleX and $scaleY.
     *
     * @param int|float $scaleX Scale factor on X
     * @param int|float $scaleY Scale factor on Y
     * @return SetaPDF_Core_Canvas
     */
    public function scale($scaleX, $scaleY)
    {
        return $this->addCurrentTransformationMatrix($scaleX, 0, 0, $scaleY, 0, 0);
    }

    /**
     * Move the transformation matrix by $shiftX and $shiftY on x-axis and y-axis.
     *
     * @param int|float $shiftX Points to move on x-axis
     * @param int|float $shiftY Points to move on y-axis
     * @return SetaPDF_Core_Canvas
     */
    public function translate($shiftX, $shiftY)
    {
        return $this->addCurrentTransformationMatrix(1, 0, 0, 1, $shiftX, $shiftY);
    }

    /**
     * Skew the transformation matrix.
     *
     * @param float $angleX Angle to x-axis in degrees
     * @param float $angleY Angle to y-axis in degrees
     * @param int $x Points to stretch on x-axis
     * @param int $y Point to stretch on y-axis
     * @return SetaPDF_Core_Canvas
     */
    public function skew($angleX, $angleY, $x = 0, $y = 0)
    {
        $tX = tan(deg2rad($angleX));
        $tY = tan(deg2rad($angleY));

        return $this->addCurrentTransformationMatrix(1, $tX, $tY, 1, -$tY * $y, -$tX * $x);
    }

    /**
     * Draw an external object.
     *
     * If a form XObject instance is passed, it will be added to the resources automatically.
     *
     * @param string $name The name or a form XObject instance.
     * @throws InvalidArgumentException
     * @return SetaPDF_Core_Canvas
     */
    public function drawXObject($name)
    {
        if ($name instanceof SetaPDF_Core_XObject)
            $name = $this->addResource(SetaPDF_Core_Resource::TYPE_X_OBJECT, $name);

        $xObjects = $this->getResources(true, false, SetaPDF_Core_Resource::TYPE_X_OBJECT);
        if (false === $xObjects || !$xObjects->offsetExists($name)) {
            throw new InvalidArgumentException('Unknown XObject: ' . $name);
        }

        SetaPDF_Core_Type_Name::writePdfString($this, $name, true);
        $this->write(' Do');

        return $this;
    }
}