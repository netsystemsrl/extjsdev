<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Stream.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class for handling a ICC profile stream
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_IccProfile_Stream
{
    /**
     * The indirect object of this stream
     *
     * @var SetaPDF_Core_Type_IndirectObjectInterface
     */
    protected $_indirectObject;

    /**
     * A ICC profile parser instance
     *
     * @var SetaPDF_Core_IccProfile_Parser
     */
    protected $_parser;

    /**
     * Creates an ICC profile stream.
     *
     * @param SetaPDF_Core_Document $document
     * @param SetaPDF_Core_Reader_Binary|string $iccProfile A path to a ICC profile or a reader object
     * @return SetaPDF_Core_IccProfile_Stream
     */
    static public function create(SetaPDF_Core_Document $document, $iccProfile)
    {
        $parser = new SetaPDF_Core_IccProfile_Parser($iccProfile);

        $dict = new SetaPDF_Core_Type_Dictionary();
        $dict['N'] = new SetaPDF_Core_Type_Numeric($parser->getNumberOfComponents());
        switch ($parser->getNumberOfComponents()) {
            case 1:
                $dict['Alternate'] = new SetaPDF_Core_Type_Name('DeviceGray', true);
                break;
            case 3:
                $dict['Alternate'] = new SetaPDF_Core_Type_Name('DeviceRGB', true);
                break;
            case 4:
                $dict['Alternate'] = new SetaPDF_Core_Type_Name('DeviceCMYK', true);
                break;
        }

        $dict['Filter'] = new SetaPDF_Core_Type_Name('FlateDecode', true);

        $stream = new SetaPDF_Core_Type_Stream($dict);
        $parser->getReader()->getReader()->copyTo($stream);

        $object = $document->createNewObject($stream);

        $instance = new self($object);
        $instance->_parser = $parser;

        return $instance;
    }

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Type_IndirectObjectInterface $indirectObject
     * @throws InvalidArgumentException
     */
    public function __construct(SetaPDF_Core_Type_IndirectObjectInterface $indirectObject)
    {
        $stream = $indirectObject->ensure(true);
        if (!$stream instanceof SetaPDF_Core_Type_Stream) {
            throw new InvalidArgumentException('Parameter should be an indirect object/reference to a stream object.');
        }

        $this->_indirectObject = $indirectObject;
    }

    /**
     * Release resources.
     */
    public function cleanUp()
    {
        $this->_indirectObject = null;
        $this->_parser = null;
    }

    /**
     * Get the indirect object.
     *
     * @return SetaPDF_Core_Type_IndirectObjectInterface
     */
    public function getIndirectObject()
    {
        return $this->_indirectObject;
    }

    /**
     * Get the stream object.
     *
     * @return SetaPDF_Core_Type_Stream
     */
    public function getStreamObject()
    {
        return $this->_indirectObject->ensure();
    }

    /**
     * Get the stream dictionary.
     *
     * @return SetaPDF_Core_Type_Dictionary
     */
    protected function _getDictionary()
    {
        return $this->getStreamObject()->getValue();
    }

    /**
     * Get the color component count.
     *
     * @return integer
     */
    public function getColorComponents()
    {
        return $this->_getDictionary()->getValue('N')->getValue();
    }

    /**
     * Get the alternate color space.
     *
     * @return null|SetaPDF_Core_ColorSpace|SetaPDF_Core_ColorSpace_DeviceCmyk|SetaPDF_Core_ColorSpace_DeviceGray|SetaPDF_Core_ColorSpace_DeviceRgb|SetaPDF_Core_ColorSpace_IccBased|SetaPDF_Core_ColorSpace_Separation
     */
    public function getAlternate()
    {
        $alternate = $this->_getDictionary()->getValue('Alternate');
        if (null === $alternate)
            return null;

        return SetaPDF_Core_ColorSpace::createByDefinition($alternate);
    }

    /**
     * Set the alternate color space.
     *
     * @param SetaPDF_Core_ColorSpace $colorSpace
     */
    public function setAlternate(SetaPDF_Core_ColorSpace $colorSpace = null)
    {
        $dict = $this->_getDictionary();
        if (null === $colorSpace) {
            $dict->offsetUnset('Alternate');
            return;
        }

        if ($colorSpace instanceof SetaPDF_Core_Resource) {
            $dict->offsetSet('Alternate', $colorSpace->getIndirectObject());
            return;
        }

        $dict->offsetSet('Alternate', $colorSpace->getPdfValue());
    }

    /**
     * Get a parser instance for this ICC profile stream.
     *
     * @return SetaPDF_Core_IccProfile_Parser
     */
    public function getParser()
    {
        if (null === $this->_parser) {
            $stringReader = new SetaPDF_Core_Reader_String($this->getStreamObject()->getStream());
            $reader = new SetaPDF_Core_Reader_Binary($stringReader);
            $this->_parser = new SetaPDF_Core_IccProfile_Parser($reader);
        }

        return $this->_parser;
    }
}