<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: EmbeddedFileStream.php 1186 2018-01-24 13:55:21Z timo.scholz $
 */

/**
 * Class representing an embedded file stream
 *
 * @see PDF 32000-1:2008 - 7.11.4 Embedded file streams
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_EmbeddedFileStream
{
    /**
     * Constanst for the "Size" key in a embedded file parameter dictionary.
     *
     * @var string
     */
    const PARAM_SIZE = 'Size';

    /**
     * Constanst for the "CreationDate" key in a embedded file parameter dictionary.
     *
     * @var string
     */
    const PARAM_CREATION_DATE = 'CreationDate';

    /**
     * Constanst for the "ModDate" key in a embedded file parameter dictionary.
     *
     * @var string
     */
    const PARAM_MODIFICATION_DATE = 'ModDate';

    /**
     * Constanst for the "CheckSum" key in a embedded file parameter dictionary.
     *
     * The checksum shall be calculated by applying the standard MD5 message-digest algorithm to the bytes of the
     * embedded file stream.
     *
     * @var string
     */
    const PARAM_CHECK_SUM = 'CheckSum';

    /**
     * The indirect object
     *
     * @var SetaPDF_Core_Type_IndirectObject
     */
    protected $_indirectObject;

    /**
     * Create an embedded file stream.
     *
     * @param SetaPDF_Core_Document $document
     * @param SetaPDF_Core_Reader_ReaderInterface|string $pathOrReader A reader instance or a path to a file.
     * @param array $params See {@link SetaPDF_Core_EmbeddedFileStream::setParams() setParams()} method.
     * @param null|string $mimeType The subtype of the embedded file. Shall conform to the MIME media type names defined
     *                              in Internet RFC 2046
     * @return SetaPDF_Core_EmbeddedFileStream
     */
    static public function create(
        SetaPDF_Core_Document $document,
        $pathOrReader,
        array $params = [],
        $mimeType = null
    )
    {
        if (!$pathOrReader instanceof SetaPDF_Core_Reader_ReaderInterface) {
            if (!isset($params[self::PARAM_CREATION_DATE])) {
                $d = new DateTime();
                $params[self::PARAM_CREATION_DATE] = $d->setTimestamp(filectime($pathOrReader));
            }

            if (!isset($params[self::PARAM_MODIFICATION_DATE])) {
                $d = new DateTime();
                $params[self::PARAM_MODIFICATION_DATE] = $d->setTimestamp(filemtime($pathOrReader));
            }

            $reader = new SetaPDF_Core_Reader_File($pathOrReader);
        } else {
            $reader = $pathOrReader;

            if (!isset($params[self::PARAM_CREATION_DATE])) {
                $params[self::PARAM_CREATION_DATE] = new DateTime();
            }

            if (!isset($params[self::PARAM_MODIFICATION_DATE])) {
                $params[self::PARAM_MODIFICATION_DATE] = new DateTime();
            }
        }

        $dict = new SetaPDF_Core_Type_Dictionary([
            'Type' => new SetaPDF_Core_Type_Name('EmbeddedFile'),
            'Filter' => new SetaPDF_Core_Type_Name('FlateDecode')
        ]);

        $stream = new SetaPDF_Core_Type_Stream($dict);
        $reader->copyTo($stream);

        $instance = new self($document->createNewObject($stream));

        $params[self::PARAM_SIZE] = $reader->getTotalLength();
        $instance->setParams($params);
        if (null !== $mimeType) {
            $instance->setMimeType($mimeType);
        }

        return $instance;
    }

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Type_IndirectObjectInterface $indirectObject
     */
    public function __construct(SetaPDF_Core_Type_IndirectObjectInterface $indirectObject)
    {
        if ($indirectObject instanceof SetaPDF_Core_Type_IndirectReference) {
            $indirectObject = $indirectObject->getValue();
        }

        /**
         * @var SetaPDF_Core_Type_IndirectObject $indirectObject
         */
        $this->_indirectObject = $indirectObject;
    }

    /**
     * Get the indirect object.
     *
     * @return SetaPDF_Core_Type_IndirectObject
     */
    public function getIndirectObject()
    {
        return $this->_indirectObject;
    }

    /**
     * Get the stream dictionary.
     *
     * @return SetaPDF_Core_Type_Dictionary
     */
    protected function _getDictionary()
    {
        return $this->getIndirectObject()->ensure()->getValue();
    }

    /**
     * Get the subtype of the embedded file.
     *
     * @return null|string
     */
    public function getMimeType()
    {
        $dict = $this->_getDictionary();
        if (!$dict->offsetExists('Subtype')) {
            return null;
        }

        return $dict->getValue('Subtype')->getValue();
    }

    /**
     * Set the mime type (or subtype) of the embedded file stream.
     *
     * @param string|null $mimeType
     */
    public function setMimeType($mimeType)
    {
        $dict = $this->_getDictionary();
        if (null === $mimeType) {
            $dict->offsetUnset('Subtype');
            return;
        }

        $dict->offsetSet('Subtype', new SetaPDF_Core_Type_Name($mimeType));
    }

    /**
     * Get the entries and data of the embedded file parameter dictionary.
     *
     * @return array
     */
    public function getParams()
    {
        $params = $this->_getDictionary()->getValue('Params');
        if (null == $params) {
            return [];
        }

        $params = $params->ensure();

        $result = [];
        foreach ($params AS $key => $value) {
            $value = $value->ensure();
            switch ($key) {
                case self::PARAM_CREATION_DATE:
                case self::PARAM_MODIFICATION_DATE:
                    $result[$key] = SetaPDF_Core_DataStructure_Date::stringToDateTime($value->getValue());
                    break;
                case self::PARAM_SIZE:
                    $result[$key] = (int)$value->getValue();
                    break;
                case self::PARAM_CHECK_SUM:
                    $result[$key] = $value->getValue();
                    break;
            }
        }

        return $result;
    }

    /**
     * Set the entries in the embedded file parameter dictionary.
     *
     * @param array $params See class constants self::PARAMS_* for possible keys.
     * @param bool $reset Defines whether to remove all previously set entries or not.
     * @see SetaPDF_Core_EmbeddedFileStream::PARAM_CHECK_SUM
     * @see SetaPDF_Core_EmbeddedFileStream::PARAM_CREATION_DATE
     * @see SetaPDF_Core_EmbeddedFileStream::PARAM_MODIFICATION_DATE
     * @see SetaPDF_Core_EmbeddedFileStream::PARAM_SIZE
     */
    public function setParams(array $params, $reset = true)
    {
        $dict = $this->_getDictionary();
        if (count($params) === 0) {
            $dict->offsetUnset('Params');
            return;
        }

        if ($reset || !$dict->offsetExists('Params')) {
            $dict->offsetSet('Params', new SetaPDF_Core_Type_Dictionary());
        }

        $paramsDict = $dict->getValue('Params')->ensure(true);

        foreach ($params AS $key => $value) {
            switch ($key) {
                case self::PARAM_CREATION_DATE:
                case self::PARAM_MODIFICATION_DATE:
                    $value = new SetaPDF_Core_DataStructure_Date($value);
                    $paramsDict[$key] = $value->getValue();
                    break;
                case self::PARAM_SIZE:
                    $paramsDict[$key] = new SetaPDF_Core_Type_Numeric($value);
                    break;
                case self::PARAM_CHECK_SUM:
                    $paramsDict[$key] = new SetaPDF_Core_Type_String($value);
                    break;
            }
        }
    }

    /**
     * Get the stream content.
     *
     * @return string
     */
    public function getStream()
    {
        return $this->getIndirectObject()->ensure()->getStream();
    }
}