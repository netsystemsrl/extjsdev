<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: FileSpecification.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class representing a file specification
 *
 * @see PDF 32000-1:2008 - 7.11.2 File Specification Strings
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_FileSpecification
{
    /**
     * Default file system constant
     *
     * @var null
     */
    const FILE_SYSTEM_UNDEFINED = null;

    /**
     * URL file system contant
     *
     * @var string
     */
    const FILE_SYSTEM_URL = 'URL';

    /**
     * The dictionary
     *
     * @var SetaPDF_Core_Type_Dictionary
     */
    protected $_dictionary;

    /**
     * Create a file specification with an embedded file stream.
     *
     * @param SetaPDF_Core_Document $document
     * @param SetaPDF_Core_Reader_ReaderInterface|string $pathOrReader A reader instance or a path to a file.
     * @param string $filename The filename in UTF-8 encoding.
     * @param array $fileStreamParams See {@link SetaPDF_Core_EmbeddedFileStream::setParams() setParams()} method.
     * @param null|string $mimeType The subtype of the embedded file. Shall conform to the MIME media type names defined
     *                              in Internet RFC 2046
     * @return SetaPDF_Core_FileSpecification
     */
    static public function createEmbedded(
        SetaPDF_Core_Document $document,
        $pathOrReader,
        $filename,
        array $fileStreamParams = [],
        $mimeType = null
    ) {
        $embeddedFileStream = SetaPDF_Core_EmbeddedFileStream::create(
            $document, $pathOrReader, $fileStreamParams, $mimeType
        );

        // let's prepare a win-ansi filename
        $tmpFileName = SetaPDF_Core_Encoding::convert($filename, 'UTF-8', SetaPDF_Core_Encoding::WIN_ANSI . '//TRANSLIT');
        // we replace the default substitute character with a questionmark
        $tmpFileName = str_replace("\x1A", '?', $tmpFileName);

        $fileSpec = new self($tmpFileName);
        $fileSpec->setEmbeddedFileStream($embeddedFileStream);
        $fileSpec->setUnicodeFileSpecification($filename);
        $fileSpec->setEmbeddedFileStream($embeddedFileStream, true);

        return $fileSpec;
    }

    /**
     * Creates a file specification dictionary.
     *
     * @param string $fileSpecificationString
     * @return SetaPDF_Core_Type_Dictionary
     */
    static public function createDictionary($fileSpecificationString)
    {
        return new SetaPDF_Core_Type_Dictionary(array(
            'Type' => new SetaPDF_Core_Type_Name('Filespec', true),
            'F' => new SetaPDF_Core_Type_String($fileSpecificationString)
        ));
    }

    /**
     * The constructor.
     *
     * If the parameter cannot be evaluated to a dictionary it will be passed to the
     * {@link SetaPDF_Core_FileSpecification::createDictionary() createDictionary} method to create an appropriate
     * dictionary.
     *
     * @param string|SetaPDF_Core_Type_IndirectObjectInterface|SetaPDF_Core_Type_Dictionary|SetaPDF_Core_Type_StringValue $fileSpecification
     * @see createDictionary()
     */
    public function __construct($fileSpecification)
    {
        if ($fileSpecification instanceof SetaPDF_Core_Type_IndirectObjectInterface) {
            $fileSpecification = $fileSpecification->ensure();
        }

        if (!$fileSpecification instanceof SetaPDF_Core_Type_Dictionary) {
            if ($fileSpecification instanceof SetaPDF_Core_Type_StringValue) {
                $fileSpecification = $fileSpecification->getValue();
            }
            $fileSpecification = self::createDictionary($fileSpecification);
        }

        $this->_dictionary = $fileSpecification;
    }

    /**
     * Get the dictionary.
     *
     * @return SetaPDF_Core_Type_Dictionary
     */
    public function getDictionary()
    {
        return $this->_dictionary;
    }

    /**
     * Get the file specification value.
     *
     * @return string|null
     */
    public function getFileSpecification()
    {
        if (!$this->_dictionary->offsetExists('F'))
            return null;

        return $this->_dictionary->getValue('F')->ensure(true)->getValue();
    }

    /**
     * Set the file specification value.
     *
     * @param string|null $fileSpecification
     */
    public function setFileSpecification($fileSpecification)
    {
        if (null === $fileSpecification) {
            $this->_dictionary->offsetUnset('F');
            return;
        }

        $this->_dictionary->offsetSet('F', new SetaPDF_Core_Type_String($fileSpecification));
    }

    /**
     * Get the unicode text file specification value.
     *
     * @param string $encoding
     * @return string|null
     */
    public function getUnicodeFileSpecification($encoding = 'UTF-8')
    {
        if (!$this->_dictionary->offsetExists('UF')) {
            return null;
        }

        $value = $this->_dictionary->getValue('UF')->ensure(true)->getValue();

        return SetaPDF_Core_Encoding::convertPdfString($value, $encoding);
    }

    /**
     * Set the unicode text file specification value.
     *
     * @param string|null $fileSpecification
     * @param string $encoding
     */
    public function setUnicodeFileSpecification($fileSpecification, $encoding = 'UTF-8')
    {
        if (null === $fileSpecification) {
            $this->_dictionary->offsetUnset('UF');
            return;
        }

        $this->_dictionary->offsetSet('UF', new SetaPDF_Core_Type_String(
            SetaPDF_Core_Encoding::toPdfString($fileSpecification, $encoding)
        ));
    }

    /**
     * Get the volatile flag.
     *
     * @return boolean
     */
    public function getVolatile()
    {
        if (!$this->_dictionary->offsetExists('V')) {
            return false;
        }

        return $this->_dictionary->getValue('V')->ensure(true)->getValue();
    }

    /**
     * Set the volatile flag.
     *
     * @param boolean|null $volatile
     */
    public function setVolatile($volatile)
    {
        if (null === $volatile) {
            $this->_dictionary->offsetUnset('V');
            return;
        }

        $this->_dictionary->offsetSet('V', new SetaPDF_Core_Type_Boolean($volatile));
    }

    /**
     * Get name of the file system.
     *
     * @return null|string
     */
    public function getFileSystem()
    {
        if (!$this->_dictionary->offsetExists('FS')) {
            return null;
        }

        return $this->_dictionary->getValue('FS')->ensure(true)->getValue();
    }

    /**
     * Set the file system name.
     *
     * @param null|string $fileSystem
     */
    public function setFileSystem($fileSystem)
    {
        if (null === $fileSystem) {
            $this->_dictionary->offsetUnset('FS');
            return;
        }

        $this->_dictionary->offsetSet('FS', new SetaPDF_Core_Type_Name($fileSystem));
    }

    /**
     * Set the descriptive text associated with the file specification.
     *
     * @param string|null $desc
     * @param string $encoding
     */
    public function setDescription($desc, $encoding = 'UTF-8')
    {
        if (null === $desc) {
            $this->_dictionary->offsetUnset('Desc');
            return;
        }

        $this->_dictionary->offsetSet(
            'Desc',
            new SetaPDF_Core_Type_String(SetaPDF_Core_Encoding::toPdfString($desc, $encoding))
        );
    }

    /**
     * Get the descriptive text associated with the file specification.
     *
     * @param string $encoding
     * @return null|string
     */
    public function getDescription($encoding = 'UTF-8')
    {
        if (!$this->_dictionary->offsetExists('Desc')) {
            return null;
        }

        return SetaPDF_Core_Encoding::convertPdfString(
            $this->_dictionary->getValue('Desc')->ensure()->getValue(),
            $encoding
        );
    }

    /**
     * Get the embedded file stream object.
     *
     * @param boolean $unicode If true use the UF key. Otherwise the F key.
     * @return null|SetaPDF_Core_EmbeddedFileStream
     */
    public function getEmbeddedFileStream($unicode = false)
    {
        if (!$this->_dictionary->offsetExists('EF')) {
            return null;
        }

        /**
         * @var SetaPDF_Core_Type_Dictionary $dict
         */
        $dict = $this->_dictionary->getValue('EF')->ensure();

        $key = $unicode ? 'UF' : 'F';
        if ($dict->offsetExists($key)) {
            /**
             * @var SetaPDF_Core_Type_IndirectObjectInterface $object
             */
            $object = $dict->getValue($key);
            return new SetaPDF_Core_EmbeddedFileStream($object);
        }

        return null;
    }

    /**
     * Set the embedded file stream object.
     *
     * @param SetaPDF_Core_EmbeddedFileStream $embeddedFileStream
     * @param bool $unicode If true use the UF key. Otherwise the F key.
     */
    public function setEmbeddedFileStream(SetaPDF_Core_EmbeddedFileStream $embeddedFileStream, $unicode = false)
    {
        if (!$this->_dictionary->offsetExists('EF')) {
            $this->_dictionary->offsetSet('EF', new SetaPDF_Core_Type_Dictionary());
        }

        $dict = $this->_dictionary->getValue('EF')->ensure();

        $key = $unicode ? 'UF' : 'F';
        $dict[$key] = $embeddedFileStream->getIndirectObject();
    }

    /**
     * Get the collection item data.
     *
     * @return null|SetaPDF_Core_Type_Dictionary
     */
    public function getCollectionItem()
    {
        if (!$this->_dictionary->offsetExists('CI')) {
            return null;
        }

        /**
         * @var SetaPDF_Core_Type_Dictionary $dictionary
         */
        $dictionary = $this->_dictionary->getValue('CI')->ensure(true);

        return $dictionary;
    }

    /**
     * Set the collection item data.
     *
     * @param SetaPDF_Core_Type_Dictionary|null $item
     */
    public function setCollectionItem(SetaPDF_Core_Type_Dictionary $item = null)
    {
        if (null === $item) {
            $this->_dictionary->offsetUnset('CI');
            return;
        }

        $this->_dictionary->offsetSet('CI', $item);
    }
}