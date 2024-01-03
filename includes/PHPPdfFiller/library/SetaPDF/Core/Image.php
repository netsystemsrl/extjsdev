<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Image.php 1369 2019-08-27 07:16:24Z jan.slabon $
 */

/**
 * Base class for image handling
 * 
 * This class is responsible for getting the correct image type implementation for
 * a desired image type.
 * 
 * Actually PNG and JPEG classes exist. 
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Image
 * @license    https://www.setasign.com/ Commercial
 */
abstract class SetaPDF_Core_Image
{
    /**
     * Image type
     *
     * @var string
     */
    const TYPE_JPEG = 'jpeg';

    /**
     * Image type
     *
     * @var string
     */
    const TYPE_GIF = 'gif';

    /**
     * Image type
     *
     * @var string
     */
    const TYPE_JPEG2000 = 'jpeg2000';

    /**
     * Image type
     *
     * @var string
     */
    const TYPE_PNG = 'png';

    /**
     * Image type
     *
     * @var string
     */
    const TYPE_TIFF = 'tiff';

    /**
     * Image type
     *
     * @var string
     */
    const TYPE_UNKNOWN = 'unknown';

    /**
     * Binary Reader
     *
     * @var SetaPDF_Core_Reader_Binary
     */
    protected $_binaryReader;

    /**
     * Bits per component
     *
     * @var integer
     */
    protected $_bitsPerComponent = 8;

    /**
     * The pixel width
     *
     * @var integer
     */
    protected $_width;

    /**
     * The pixel height
     *
     * @var integer
     */
    protected $_height;

    /**
     * Dots-per-inch in the X direction
     *
     * @var integer
     */
    protected $_dpiX = 0;

    /**
     * Dots-per-inch in the Y direction
     *
     * @var integer
     */
    protected $_dpiY = 0;

    /**
     * The image type specific colorspace
     *
     * @var integer
     */
    protected $_colorSpace = -1;

    /**
     * Flag for color inversion
     *
     * @var boolean
     * todo Use it
     */
    protected $_inverted = false;

    /**
     * Get an image by a reader.
     *
     * @param SetaPDF_Core_Reader_ReaderInterface $reader The reader instance
     * @throws SetaPDF_Exception_NotImplemented If the image type is not supported (supported types: JPEG, PNG, JPEG2000).
     * @return SetaPDF_Core_Image
     */
    static public function get(SetaPDF_Core_Reader_ReaderInterface $reader)
    {
        $type = self::getType($reader);
        switch ($type) {
            case self::TYPE_JPEG:
                return new SetaPDF_Core_Image_Jpeg($reader);

            case self::TYPE_PNG:
                return new SetaPDF_Core_Image_Png($reader);
                
            case self::TYPE_JPEG2000:
                return new SetaPDF_Core_Image_Jpeg2000($reader);

            case self::TYPE_GIF:
                return new SetaPDF_Core_Image_Gif($reader);
                
            default:
                throw new SetaPDF_Exception_NotImplemented('Image type "' . $type . '" not implemented.');
        }
    }

    /**
     * Get an image by a path.
     *
     * @param string $path The path to the image
     * @return SetaPDF_Core_Image
     */
    static public function getByPath($path)
    {
        return self::get(new SetaPDF_Core_Reader_File($path));
    }

    /**
     * Get an image type by a reader.
     *
     * @param SetaPDF_Core_Reader_ReaderInterface $reader
     * @return string
     */
    static public function getType(SetaPDF_Core_Reader_ReaderInterface $reader)
    {
        $currentPos = $reader->getPos();
        $reader->reset(0, 12);
        $bytes = $reader->getBuffer();
        $type = self::TYPE_UNKNOWN;

        switch (true) {
            case strlen($bytes) > 2 && $bytes[0] === "\xFF" && $bytes[1] === "\xD8":
                $type = self::TYPE_JPEG;
                break;

            case strpos($bytes, "\x89" . 'PNG' . "\x0D\x0A\x1A\x0A") === 0:
                $type = self::TYPE_PNG;
                break;

            case strlen($bytes) > 5 && strpos($bytes, 'GIF') === 0 &&
                (
                    substr($bytes, 3, 3) === '87a' || substr($bytes, 3, 3) === '89a'
                ):
                $type = self::TYPE_GIF;
                break;

            case $bytes === "\x00\x00\x00\x0C\x6A\x50\x20\x20\x0D\x0A\x87\x0A":
                $type = self::TYPE_JPEG2000;
                break;

            case strlen($bytes) > 4 &&
                (
                    ($bytes[0] === 'M' && $bytes[1] === 'M' && $bytes[2] === "\x00" && $bytes[3] === "\x2A")
                    ||
                    ($bytes[0] === 'I' && $bytes[1] === 'I' && $bytes[2] === "\x2A" && $bytes[3] === "\x00")
                ):
                $type = self::TYPE_TIFF;
                break;
        }

        if ($currentPos !== 0) {
            $reader->reset($currentPos);
        }

        return $type;
    }

  /** Main object methods **/

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Reader_ReaderInterface $reader
     */
    public function __construct(SetaPDF_Core_Reader_ReaderInterface $reader = null)
    {
        if ($reader !== null) {
            $this->_binaryReader = new SetaPDF_Core_Reader_Binary($reader);
            $this->_process();
        }
    }

    /**
     * Processes the image data so all needed information is available.
     */
    abstract protected function _process();

    /**
     * Converts an image to an external object.
     *
     * @param SetaPDF_Core_Document $document
     * @return SetaPDF_Core_XObject_Image
     */
    abstract public function toXObject(SetaPDF_Core_Document $document);

    /**
     * Get the bits per component value.
     *
     * @return number
     */
    public function getBitsPerComponent()
    {
        return $this->_bitsPerComponent;
    }

    /**
     * Get the width.
     *
     * @param float $height Value for keeping the aspect ratio
     * @return number
     */
    public function getWidth($height = null)
    {
        if ($height === null) {
            return $this->_width;
        }

        return $height * $this->_width / $this->getHeight();
    }

    /**
     * Get the height.
     *
     * @param float $width Value for keeping the aspect ratio
     * @return number
     */
    public function getHeight($width = null)
    {
        if ($width === null) {
            return $this->_height;
        }

        return $width * $this->_height / $this->getWidth();
    }

    /**
     * Get the dots-per-inch in the X direction.
     *
     * @return number
     */
    public function getDpiX()
    {
        return $this->_dpiX;
    }

    /**
     * Get the dots-per-inch in the Y direction.
     *
     * @return number
     */
    public function getDpiY()
    {
        return $this->_dpiY;
    }

    /**
     * Get the image type specific colorspace.
     *
     * @return number
     */
    public function getColorSpace()
    {
        return $this->_colorSpace;
    }
}