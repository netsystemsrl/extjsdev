<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Document.php 1104 2017-09-13 12:36:07Z jan.slabon $
 */

/**
 * A class representing a PDF document
 *
 * This class represents a PDF document in all SetaPDF components.
 * It offers the main functionalities for managing objects, cross
 * reference tables and writers of the document instance.
 *
 * It also tracks changes of objects and security handlers.
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document
    implements SplObserver, SetaPDF_Core_WriteInterface, SetaPDF_Core_Type_Owner
{
    /**
     * State constant
     *
     * @var string
     */
    const STATE_NONE = 'none';

    /**
     * State constant
     *
     * @var string
     */
    const STATE_WRITING_BODY = 'writingBody';

    /**
     * State constant
     *
     * @var string
     */
    const STATE_WRITING_XREF = 'writingXRef';

    /**
     * State constant
     *
     * @var string
     */
    const STATE_SAVED = 'saved';

    /**
     * State constant
     *
     * @var string
     */
    const STATE_FINISHED = 'finished';

    /**
     * State constant
     *
     * @var string
     */
    const STATE_CLEANED_UP = 'cleanedUp';

    /**
     * Save method constant defining an incremental update
     *
     * @var string
     */
    const SAVE_METHOD_UPDATE = 1;

    /**
     * Save method constant defining a rewrite by resolving objects starting at the root object
     *
     * @var string
     */
    const SAVE_METHOD_REWRITE = 0;

    /**
     * Save method constant defining a rewrite by writing all available objects
     *
     * @var string
     */
    const SAVE_METHOD_REWRITE_ALL = -1;

    /**
     * A counter for generating unique instance identifications
     *
     * @var integer
     */
    static protected $_instanceCounter = 0;

    /**
     * A random prefix for generating unique instance identifications
     *
     * @var string
     */
    static protected $_instanceIdentPrefix = null;

    /**
     * Incremental update or rewrite the document
     *
     * @see SetaPDF_Core_Document::save()
     * @var integer
     */
    protected $_saveMethod = self::SAVE_METHOD_REWRITE;

    /**
     * A flag defining the state of the document object instance
     *
     * @var string
     */
    protected $_state = self::STATE_NONE;

    /**
     * PDF version
     *
     * @see SetaPDF_Core_Document::setPdfVersion()
     * @var string
     */
    protected $_pdfVersion = '1.3';

    /**
     * An instance of a cross reference
     *
     * If the document is created of an existing one
     * this will be an instance of SetaPDF_Core_Parser_CrossReferenceTable
     *
     * @var SetaPDF_Core_Document_CrossReferenceTable
     */
    protected $_xref;

    /**
     * Defines if the cross reference table will be compressed
     *
     * @see SetaPDF_Core_Document::setCompressXref()
     * @var boolean
     */
    protected $_compressXref = false;

    /**
     * Current/max object id
     *
     * @var integer
     */
    protected $_maxObjId = 0;

    /**
     * Newly created or resolved objects
     *
     * @var array
     */
    protected $_objects = array();

    /**
     * Array for information about object streams
     *
     * @var array
     */
    protected $_objectStreams = array();

    /**
     * The parser object used for parsing object streams
     *
     * @var SetaPDF_Core_Parser_Pdf
     */
    protected $_objectStreamsParser;

    /**
     * The trailer dictionary
     *
     * @var SetaPDF_Core_Type_Dictionary
     */
    protected $_trailer;

    /**
     * Flag defining if the trailer was touched/changed
     *
     * @var boolean
     */
    protected $_trailerChanged = false;

    /**
     * Changed objects
     *
     * @var array
     */
    protected $_changedObjects;

    /**
     * Referenced objects
     *
     * This array holds information about objects to which
     * references were written. Needed to create deep
     * copies of an object from one to another document
     *
     * @var array
     */
    protected $_referencedObjects = array();

    /**
     * Blocked referenced objects
     *
     * This array holds objects which should NOT be automatically
     * resolved.
     *
     * @var array
     */
    protected $_blockedReferencedObjects = array();

    /**
     * A relation between objects and ids
     *
     * @var array
     */
    protected $_objectsToIds = array();

    /**
     * The writer instance
     *
     * @see SetaPDF_Core_Document::setWriter()
     * @see SetaPDF_Core_Document::__construct()
     * @var SetaPDF_Core_Writer_WriterInterface
     */
    protected $_writer = null;

    /**
     * The parser object of the existing document
     *
     * @var SetaPDF_Core_Parser_Pdf
     */
    protected $_parser;

    /**
     * The indirect object which is currently written
     *
     * @var SetaPDF_Core_Type_IndirectObject
     */
    protected $_currentObject;

    /**
     * The object id and generation number of the currently written object
     *
     * @var array
     */
    protected $_currentObjectData;

    /**
     * The security handler of the existing document
     *
     * @var SetaPDF_Core_SecHandler_SecHandlerInterface
     */
    protected $_secHandlerIn;

    /**
     * The security handler of the new document
     *
     * @var SetaPDF_Core_SecHandler_SecHandlerInterface
     */
    protected $_secHandler;

    /**
     * Identification of a document instance
     *
     * @var string
     */
    protected $_instanceIdent;

    /**
     * Documents catalog instance
     *
     * @var SetaPDF_Core_Document_Catalog
     */
    protected $_catalog;

    /**
     * The documents info object instance
     *
     * @var SetaPDF_Core_Document_Info
     */
    protected $_info;

    /**
     * Flag saying that objects should be cleaned up automatically
     *
     * @var boolean
     */
    protected $_cleanUpObjects = true;

    /**
     * A method/function which should be called to fill the document body
     *
     * @var callback
     */
    protected $_fileBodyMethod = null;

    /**
     * Defining whether the PDF objects should be written at once or object by object
     *
     * @var boolean
     */
    protected $_directWrite = false;

    /**
     * Flag saying that write callbacks are in use
     *
     * @var boolean
     */
    protected $_useWriteCallbacks = false;

    /**
     * Array of write callbacks
     *
     * @var array
     */
    protected $_writeCallbacks = array();

    /**
     * The none permanent file identifier
     *
     * @var string
     */
    protected $_newFileIdentifier = null;

    /**
     * Defines if referenced objects should be cached or not
     *
     * @var boolean
     */
    protected $_cacheReferencedObjects = false;

    /**
     * An array of callbacks that should be called before the save method is executed.
     *
     * @var array
     */
    protected $_beforeSaveCallbacks = array();

    /**
     * Creates an instance of a document based on an existing PDF.
     *
     * @param SetaPDF_Core_Reader_ReaderInterface $reader A reader instance
     * @param SetaPDF_Core_Writer_WriterInterface $writer A writer instance
     * @param string $className The class name to initiate
     * @return SetaPDF_Core_Document Returns a SetaPDF_Core_Document instance
     * @throws SetaPDF_Core_Parser_CrossReferenceTable_Exception|Exception
     */
    static public function load
    (
        SetaPDF_Core_Reader_ReaderInterface $reader,
        SetaPDF_Core_Writer_WriterInterface $writer = null,
        $className = 'SetaPDF_Core_Document'
    )
    {
        /**
         * @var self $instance
         */
        $instance = new $className($writer);
        $instance->_parser = new SetaPDF_Core_Parser_Pdf($reader);
        $instance->_parser->setOwner($instance);

        try {
            $instance->_xref = new SetaPDF_Core_Parser_CrossReferenceTable($instance->_parser);
        } catch (SetaPDF_Core_Parser_CrossReferenceTable_Exception $e) {
            try {
                $instance->_xref = new SetaPDF_Core_Parser_CorruptedCrossReferenceTable($instance->_parser);
                $instance->_xref->ensureTrailer();
            } catch (Exception $e) {
                $instance->cleanUp();
                throw $e;
            }
        }

        $instance->_trailer = clone $instance->_xref->getTrailer();
        $instance->_maxObjId = $instance->_xref->getSize() - 1; // $instance->_trailer['Size']->getValue()->getValue();
        $instance->setCompressXref($instance->_xref->isCompressed() === SetaPDF_Core_Parser_CrossReferenceTable::COMPRESSED_ALL);

        // Encryption handling
        if ($instance->_trailer->offsetExists('Encrypt')) {
            $encryptDict = $instance->_trailer->offsetGet('Encrypt')->getValue()->ensure(true);

            if ($encryptDict instanceof SetaPDF_Core_Type_Dictionary) {
                // Mark string elements as not encrypted
                foreach ($encryptDict AS $value) {
                    if ($value instanceof SetaPDF_Core_Type_StringValue) {
                        $value->setBypassSecHandler(true);
                    }
                }

                $instance->_secHandlerIn = SetaPDF_Core_SecHandler::factory($instance, $encryptDict);

                if ($instance->_secHandlerIn instanceof SetaPDF_Core_SecHandler_SecHandlerInterface) {
                    $instance->_parser->setPassOwningObjectToChilds();

                    // Set the out secHandler to the same as the input document
                    $instance->_secHandler = $instance->_secHandlerIn;
                }
            }
        }

        // Later, because the security handler will need a clean version of it.
        $instance->_trailer->attach($instance);

        // PdfVersion
        $version = $instance->_parser->getPdfVersion();
        $instance->_pdfVersion = $version;

        // Check Root-Entry for new PDF version
        if ($instance->_trailer->offsetExists('Root')) {
            $root = $instance->_trailer->offsetGet('Root')->getValue()->ensure();
            if (
                $root instanceof SetaPDF_Core_Type_Dictionary &&
                $root->offsetExists('Version')
            ) {
                $instance->_pdfVersion = $root->offsetGet('Version')->getValue()->getValue();
            }
        }

        $instance->_saveMethod = self::SAVE_METHOD_UPDATE;

        return $instance;
    }

    /**
     * Initiate an instance by a filename.
     *
     * @param string $filename The path to the pdf file
     * @param SetaPDF_Core_Writer_WriterInterface $writer A writer instance
     * @param string $className The class name to initiate
     * @return SetaPDF_Core_Document
     */
    static public function loadByFilename
    (
        $filename,
        SetaPDF_Core_Writer_WriterInterface $writer = null,
        $className = 'SetaPDF_Core_Document'
    )
    {
        $reader = new SetaPDF_Core_Reader_File($filename);
        return self::load($reader, $writer, $className);
    }

    /**
     * Initiate an instance by a pdf string.
     *
     * @param string $string Content of the pdf
     * @param SetaPDF_Core_Writer_WriterInterface $writer A writer instance
     * @param string $className The class name to initiate
     * @return SetaPDF_Core_Document
     */
    static public function loadByString
    (
        $string,
        SetaPDF_Core_Writer_WriterInterface $writer = null,
        $className = 'SetaPDF_Core_Document'
    )
    {
        $reader = new SetaPDF_Core_Reader_String($string);
        return self::load($reader, $writer, $className);
    }

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Writer_WriterInterface $writer The writer to which the document should be written
     */
    public function __construct(SetaPDF_Core_Writer_WriterInterface $writer = null)
    {
        if (null === self::$_instanceIdentPrefix) {
            self::$_instanceIdentPrefix = md5(microtime() . mt_rand());
        }

        $this->setWriter($writer);
        $this->_xref = new SetaPDF_Core_Document_CrossReferenceTable();
        $this->_changedObjects = array();
        $this->_trailer = new SetaPDF_Core_Type_Dictionary();
        $this->_trailer->offsetSet(null, new SetaPDF_Core_Type_Dictionary_Entry(
            new SetaPDF_Core_Type_Name('Size', true),
            new SetaPDF_Core_Type_Numeric($this->_xref->getSize())
        ));

        $this->_instanceIdent = self::$_instanceIdentPrefix
            . '-'
            . self::$_instanceCounter++;
    }

    /**
     * Reset the prefix to force a recreation.
     *
     * @return void
     * @internal
     */
    public function __wakeup()
    {
        // Force to recreate a prefix
        if (null !== self::$_instanceIdentPrefix)
            self::$_instanceIdentPrefix = null;
    }

    /**
     * Implement magic methods for getting helper objects.
     *
     * You can use the methods from SetaPDF_Core_Document_Catalog::getDocumentMagicMethods().
     *
     * Additional you can use "getFormFiller", "getMerger", "getSigner" and "getStamper" if you want to
     * receive instances of these components.
     *
     * @see http://www.php.net/manual/language.oop5.overloading.php#object.call
     * @see SetaPDF_Core_Document_Catalog::getDocumentMagicMethods()
     * @param string $method The method name
     * @param array $arguments The arguments
     * @return mixed
     * @throws BadMethodCallException
     */
    public function __call($method, $arguments)
    {
        switch ($method) {
            // Catalog
            case in_array($method, SetaPDF_Core_Document_Catalog::getDocumentMagicMethods()):
                return call_user_func_array(array($this->getCatalog(), $method), $arguments);
                break;

            /**
             * Get a specific component for this document
             */
            case strpos($method, 'get') === 0:
                $className = 'SetaPDF_' . substr($method, 3);
                if (class_exists($className)) {
                    return new $className($this);
                }
                break;
        }

        throw new BadMethodCallException(sprintf(
            'Called unknown method (%s) on %s', $method, __CLASS__
        ));
    }

    /**
     * Set the writer object.
     *
     * A writer instance can only be set prior the first call to {@link SetaPDF_Core_Document::save() save()} or
     * after a {@link SetaPDF_Core_Document::finish() finish()} call.
     *
     * @param SetaPDF_Core_Writer_WriterInterface $writer The new writer object
     * @throws BadMethodCallException
     * @return SetaPDF_Core_Document
     */
    public function setWriter(SetaPDF_Core_Writer_WriterInterface $writer = null)
    {
        if (
            $this->_state !== SetaPDF_Core_Document::STATE_FINISHED &&
            $this->_writer instanceof SetaPDF_Core_Writer_WriterInterface &&
            $this->_writer->getStatus() != SetaPDF_Core_Writer::INACTIVE
        ) {
            throw new BadMethodCallException(
                'It is not possible to change the writer after starting output.'
            );
        }

        $this->_writer = $writer;

        return $this;
    }

    /**
     * Get current writer object.
     *
     * @return SetaPDF_Core_Writer_WriterInterface|null
     */
    public function getWriter()
    {
        return $this->_writer;
    }

    /**
     * Get the parser object.
     *
     * @return SetaPDF_Core_Parser_Pdf|null
     */
    public function getParser()
    {
        return $this->_parser;
    }

    /**
     * Return the current object state.
     *
     * @return string
     */
    public function getState()
    {
        return $this->_state;
    }

    /**
     * Returns the trailer dictionary.
     *
     * @return SetaPDF_Core_Type_Dictionary
     */
    public function getTrailer()
    {
        return $this->_trailer;
    }

    /**
     * Returns the PDF version of the document.
     *
     * @return string
     */
    public function getPdfVersion()
    {
        return $this->_pdfVersion;
    }

    /**
     * Set the PDF version of the document.
     *
     * @param string $pdfVersion The pdf version
     * @return void
     */
    public function setPdfVersion($pdfVersion)
    {
        $this->_pdfVersion = is_float($pdfVersion) ? sprintf('%.1F', $pdfVersion) : $pdfVersion;

        if ($this->_saveMethod === self::SAVE_METHOD_UPDATE) {
            $this->getCatalog()->setVersion($this->_pdfVersion);
        }
    }

    /**
     * Set the minimal PDF version.
     *
     * @param string $minPdfVersion The minimal pdf version
     */
    public function setMinPdfVersion($minPdfVersion)
    {
        if (version_compare($this->_pdfVersion, $minPdfVersion, '<')) {
            $this->setPdfVersion($minPdfVersion);
        }
    }

    /**
     * Get the catalog object.
     *
     * @return SetaPDF_Core_Document_Catalog
     */
    public function getCatalog()
    {
        if (null === $this->_catalog)
            $this->_catalog = new SetaPDF_Core_Document_Catalog($this);

        return $this->_catalog;
    }

    /**
     * Get the documents info object.
     *
     * @return SetaPDF_Core_Document_Info
     */
    public function getInfo()
    {
        if (null === $this->_info)
            $this->_info = new SetaPDF_Core_Document_Info($this);

        return $this->_info;
    }

    /**
     * Implementation of the observer pattern.
     *
     * This method is automatically called if an observed object
     * was changed.
     *
     * @param SplSubject $subject The SplSubject notifying the observer of an update.
     * @return void
     */
    public function update(SplSubject $subject)
    {
        if ($subject instanceof SetaPDF_Core_Type_IndirectObject) {
            $objectData = $this->getIdForObject($subject);
            if (!isset($this->_changedObjects[$objectData[0]])) {
                $this->_changedObjects[$objectData[0]] = $subject;
            }

        } elseif ($subject === $this->_trailer) {
            $this->_trailerChanged = true;
        }
    }

    /**
     * Define whether the cross reference should be compressed or not.
     *
     * By default the SetaPDF-Core component writes the cross-reference in the standard format or in the format which
     * is defined in the source document, if any available.
     *
     * @param boolean $compressXref Pass true to enforce that the cross reference will be compressed. Pass false to
     *                              enforce a standard uncompressed cross reference table.
     * @return void
     * @throws BadMethodCallException
     */
    public function setCompressXref($compressXref)
    {
        if ($this->_state !== self::STATE_NONE) {
            throw new BadMethodCallException(
                'It is not possible to change the compression of the xref table after an initial save call.'
            );
        }

        $this->_compressXref = (boolean)$compressXref;
        if (true === $this->_compressXref) {
            $this->setMinPdfVersion('1.5');
        }
    }

    /**
     * Get the cross reference object.
     *
     * @return SetaPDF_Core_Document_CrossReferenceTable
     */
    public function getXref()
    {
        return $this->_xref;
    }

    /**
     * Set the behavior if the cleanUp()-methods of objects get called automatically.
     *
     * @param boolean $cleanUpObjects The flag status
     */
    public function setCleanUpObjects($cleanUpObjects)
    {
        $this->_cleanUpObjects = (boolean)$cleanUpObjects;
    }

    /**
     * Define if referenced objects should be cached or not.
     *
     * @param boolean $cacheReferencedObjects The flag status
     */
    public function setCacheReferencedObjects($cacheReferencedObjects)
    {
        $this->_cacheReferencedObjects = (boolean)$cacheReferencedObjects;
    }

    /**
     * Says that referenced objects get cached or not.
     *
     * @return boolean
     */
    public function getCacheReferencedObjects()
    {
        return $this->_cacheReferencedObjects;
    }

    /**
     * Cache written object references.
     *
     * This method is called if an indirect object reference is written.
     * This makes sure that the class knows about maybe unwritten objects.
     *
     * @param SetaPDF_Core_Type_IndirectObjectInterface $indirectObject The indirect object
     * @return array
     * @throws SetaPDF_Core_Document_ObjectNotFoundException
     */
    public function addIndirectObjectReferenceWritten(SetaPDF_Core_Type_IndirectObjectInterface $indirectObject)
    {
        $objectIdent = $indirectObject->getObjectIdent();

        if (isset($this->_blockedReferencedObjects[$objectIdent])) {
            throw new SetaPDF_Core_Document_ObjectNotFoundException(
                'Object reference blocked.'
            );
        }

        $data = $this->getIdForObject($indirectObject);

        /* We have to "remember" referenced objects in following cases (AND):
         * a) The object has not been changed
         * b) The object is not already "remembered"
         * c) The object was not written in THIS document
         * d) The document is completely rewritten/build from scratch
         *     OR
         *    The object is from an foreign document instance
         */
        if (
            !isset($this->_changedObjects[$data[0]])
            && !isset($this->_referencedObjects[$objectIdent])
            && !$this->_xref->isOffsetUpdated($data[0])
            && (
                $this->_saveMethod <= self::SAVE_METHOD_REWRITE
                ||
                $indirectObject->getOwnerPdfDocument()->getInstanceIdent() !== $this->getInstanceIdent()
            )
        ) {
            $this->_referencedObjects[$objectIdent] = array(
                $indirectObject->getObjectId(),
                $indirectObject->getGen(),
                $indirectObject->getOwnerPdfDocument()
            );
        }

        return $data;
    }

    /**
     * This prohibit that a reference to this objects will be written.
     *
     * Objects defined via this method will not automatically be resolved if
     * an reference to them was written.
     *
     * @param SetaPDF_Core_Type_IndirectObjectInterface $indirectObject The indirect object
     * @see addIndirectObjectReferenceWritten()
     */
    public function blockReferencedObject(SetaPDF_Core_Type_IndirectObjectInterface $indirectObject)
    {
        $objectIdent = $indirectObject->getObjectIdent();
        $this->_blockedReferencedObjects[$objectIdent] = true;
    }

    /**
     * Remove a blocked object.
     *
     * @see blockReferencedObject()
     * @param SetaPDF_Core_Type_IndirectObjectInterface $indirectObject The indirect object
     */
    public function unBlockReferencedObject(SetaPDF_Core_Type_IndirectObjectInterface $indirectObject)
    {
        $objectIdent = $indirectObject->getObjectIdent();
        if (isset($this->_blockedReferencedObjects[$objectIdent]))
            unset($this->_blockedReferencedObjects[$objectIdent]);
    }

    /**
     * Return the object id and generation number for an indirect object or reference.
     *
     * This method makes sure that objects are nearly independent of their original
     * document and the matching between document, object and their ids is handled at
     * one place: in this method.
     *
     * @param SetaPDF_Core_Type_IndirectObjectInterface $indirectObject The indirect object
     * @return array
     */
    public function getIdForObject(SetaPDF_Core_Type_IndirectObjectInterface $indirectObject)
    {
        $objectIdent = $indirectObject->getObjectIdent();
        if (isset($this->_objectsToIds[$objectIdent])) {
            return $this->_objectsToIds[$objectIdent];
        }

        if ($this->_instanceIdent === $indirectObject->getOwnerPdfDocument()->getInstanceIdent()) {
            $data = array($indirectObject->getObjectId(), $indirectObject->getGen());
        } else {
            $this->getXref()->updateSize(++$this->_maxObjId);
            $data = array($this->_maxObjId, 0);
        }

        $this->_objectsToIds[$objectIdent] = $data;

        return $data;
    }

    /**
     * Resolves an indirect object.
     *
     * @param integer $objectId The object id
     * @param integer|null $generation The generation number. Could be also "null" to
     *          find an object with an unknown generation number with the xref parser
     * @param boolean $cache Should the object be cached?
     * @throws SetaPDF_Core_Document_ObjectNotDefinedException|SetaPDF_Core_Document_ObjectNotFoundException
     * @return SetaPDF_Core_Type_IndirectObject
     */
    public function resolveIndirectObject($objectId, $generation = 0, $cache = true)
    {
        $key = $objectId . '|' . $generation;

        if (isset($this->_objects[$key])) {
            return $this->_objects[$key];
        }

        if (!($this->_xref instanceof SetaPDF_Core_Parser_CrossReferenceTable_CrossReferenceTableInterface)) {
            throw new SetaPDF_Core_Document_ObjectNotDefinedException(
                sprintf('Object not defined (%s, %s).', $objectId, $generation)
            );
        }

        // ensure the cache key after resolving the found object
        $objectGeneration = null;
        $offset = $this->_xref->getParserOffsetFor($objectId, $generation, $objectGeneration);

        $key = $objectId . '|' . $objectGeneration;
        if (isset($this->_objects[$key])) {
            return $this->_objects[$key];
        }

        // If no offset found or if this object is not in use
        if (false === $offset) {
            throw new SetaPDF_Core_Document_ObjectNotDefinedException(
                sprintf('Object not defined (%s, %s).', $objectId, $generation)
            );
        }

        if (is_int($offset[0])) {
            $this->_parser->reset($offset[0]);
            try {
                $object = $this->_parser->readValue('SetaPDF_Core_Type_IndirectObject');
            } catch (SetaPDF_Core_Parser_Pdf_InvalidTokenException $e) {
                throw new SetaPDF_Core_Document_ObjectNotFoundException(
                    sprintf('Could not resolve object (%s, %s)', $objectId, $generation),
                    0,
                    $e
                );
            }

        } else {
            $streamKey = $offset[0][0] . '|' . $offset[0][1];

            if (!array_key_exists($streamKey, $this->_objectStreams)) {
                try {
                    $streamObject = $this->resolveIndirectObject($offset[0][0], $offset[0][1]);
                } catch (SetaPDF_Core_Document_ObjectNotDefinedException $e) {
                    throw new SetaPDF_Core_Document_ObjectNotFoundException(
                        sprintf('Cannot resolve object (%s, %s)', $offset[0][0], $offset[0][1])
                    );
                }

                // @var SetaPDF_Core_Type_IndirectObject $streamObject
                $streamObject->observe();

                $this->_objectStreams[$streamKey] = $streamObject;
                $streamObject->ensure(true)->setOwner($streamObject);
            }

            $objectStream = $this->_objectStreams[$streamKey]->ensure();
            $object = $objectStream->resolveIndirectObject($objectId);
            /* The following objects shall not be stored in an object stream:
             *  [...]
             *  - Objects with a generation number other than zero
             *  [...]
             *
             * Sadly there are documents on the road which exactly to this.
             * So we have to ignore the generation number in that case.
             */
            $generation = null;
        }

        // This checks if the resolved object is really the object we need
        if ($objectId != $object->getObjectId() ||
            $generation !== null && $generation != $object->getGen()
        ) {
            throw new SetaPDF_Core_Document_ObjectNotFoundException(
                sprintf('Found object (%s, %s) is not the expected one (%s, %s).',
                    $object->getObjectId(), $object->getGen(), $objectId, $generation
                )
            );
        }

        /**
         * On some PHP versions uncached objects (if they are needed or not)
         * increases the script runtime extremely. Seen on:
         *     - Win2003 / WAMP, PHP 5.2.1 (Apachefriends))
         */
        if (true === $cache) {
            $key = $objectId . '|' . $object->getGen();
            $this->_objects[$key] = $object;
        }

        return $object;
    }

    /**
     * Releases an indirect object from the internal object cache.
     * 
     * @param SetaPDF_Core_Type_IndirectObject $object
     * @return boolean
     */
    public function releaseObject(SetaPDF_Core_Type_IndirectObject $object)
    {
        $objectData = $this->getIdForObject($object);
        if (isset($this->_changedObjects[$objectData[0]])) {
            return false;
        }

        $key = $objectData[0] . '|' . $objectData[1];
        unset($this->_objectsToIds[$object->getObjectIdent()]);

        $object->detach($this);
        $object->cleanUp();
        unset($this->_objects[$key]);

        return true;
    }

    /**
     * Create a new indirect object.
     *
     * @param SetaPDF_Core_Type_AbstractType $value The value of the new indirect object
     * @return SetaPDF_Core_Type_IndirectObject
     */
    public function createNewObject(SetaPDF_Core_Type_AbstractType $value = null)
    {
        if (!($value instanceof SetaPDF_Core_Type_IndirectObject)) {
            $this->getXref()->updateSize(++$this->_maxObjId);
            $objectId = $this->_maxObjId;
            $object = new SetaPDF_Core_Type_IndirectObject($value, $this, $objectId, 0);

            // TODO: Remove this!
            $object->attach($this);

        } else {

            /* TODO: This logic may be obsolete.
             * Actually it only occurs in very rare situations:
             * - E.g. With the merger by repeating a page with form fields several times
             */
            if (($key = array_search($value, $this->_objects, true)) !== false) {
                return $this->_objects[$key];
            }

            $objectData = $this->getIdForObject($value);

            $this->_objects[$objectData[0] . '|' . $objectData[1]] = $value;
            $this->_changedObjects[$objectData[0]] = $value;

            // TODO: Remove this!
            $value->attach($this);

            return $value;
        }

        $this->_objects[$objectId . '|0'] = $object;
        $this->_changedObjects[$objectId] = $object;

        return $object;
    }

    /**
     * Checks if an indirect object is already registered for/in this document instance.
     *
     * @param SetaPDF_Core_Type_IndirectObjectInterface $indirectObject The indirect object to check
     *
     * @return bool
     */
    public function objectRegistered(SetaPDF_Core_Type_IndirectObjectInterface $indirectObject)
    {
        $objectIdent = $indirectObject->getObjectIdent();
        if (!isset($this->_objectsToIds[$objectIdent])) {
            return false;
        }

        $objectData = $this->_objectsToIds[$objectIdent];
        if (isset($this->_objects[$objectData[0] . '|' . $objectData[1]]))
            return $objectData;

        return false;
    }

    /**
     * Clones an indirect object.
     *
     * @param SetaPDF_Core_Type_IndirectObject $indirectObject The indirect object to clone
     * @return SetaPDF_Core_Type_IndirectObject
     */
    public function cloneIndirectObject(SetaPDF_Core_Type_IndirectObject $indirectObject)
    {
        // remember old object id
        $objectIdent = $indirectObject->getObjectIdent();

        $object = $this->createNewObject(clone $indirectObject->getValue());
        // map the old id to the new one
        $this->_objectsToIds[$objectIdent] = array($object->getObjectId(), $object->getGen());

        return $object;
    }

    /**
     * Makes sure that an object is ensured through this document (if possible).
     *
     * @param SetaPDF_Core_Type_IndirectObjectInterface $indirectObject The indirect object to ensure
     * @return SetaPDF_Core_Type_IndirectObjectInterface
     */

    public function ensureObject(SetaPDF_Core_Type_IndirectObjectInterface $indirectObject)
    {
        $objectData = $this->getIdForObject($indirectObject);

        if (isset($this->_objects[$objectData[0] . '|' . $objectData[1]]))
            return $this->_objects[$objectData[0] . '|' . $objectData[1]];

        return $indirectObject;
    }

    /**
     * Delete an indirect object.
     *
     * @param SetaPDF_Core_Type_IndirectObjectInterface $object The indirect object to delete
     */
    public function deleteObject(SetaPDF_Core_Type_IndirectObjectInterface $object)
    {
        $objectData = $this->getIdForObject($object);

        $this->_xref->deleteObject($objectData[0]);

        if (isset($this->_changedObjects[$objectData[0]])) {
            unset($this->_changedObjects[$objectData[0]]);
        }

        $object->detach($this);
        if ($this->_cleanUpObjects) {
            $object->cleanUp();
        }
    }

    /**
     * Deletes an indirect object by its object id and generation number.
     *
     * @param integer $objectId The object id of the object
     * @param integer $generation The generation id of the object
     */
    public function deleteObjectById($objectId, $generation = 0)
    {
        $this->deleteObject($this->resolveIndirectObject($objectId, $generation, false));
    }

    /**
     * Checks whether a security handler is attached to this document.
     *
     * @return boolean
     */
    public function hasSecHandler()
    {
        return null !== $this->_secHandler;
    }

    /**
     * Alias for hasSecHandler().
     *
     * @deprecated
     * @return bool
     */
    public function hasSecurityHandler()
    {
        return $this->hasSecHandler();
    }

    /**
     * Returns the security handler of the original document.
     *
     * @return null|SetaPDF_Core_SecHandler_SecHandlerInterface
     */
    public function getSecHandlerIn()
    {
        return $this->_secHandlerIn;
    }

    /**
     * Set the security handler for this document.
     *
     * @param SetaPDF_Core_SecHandler_SecHandlerInterface $secHandler The new secHandler
     * @return void
     * @throws BadMethodCallException|SetaPDF_Core_SecHandler_Exception
     */
    public function setSecHandler(SetaPDF_Core_SecHandler_SecHandlerInterface $secHandler = null)
    {
        if ($this->getSecHandlerIn() && $this->getSecHandlerIn()->getAuthMode() != SetaPDF_Core_SecHandler::OWNER) {
            throw new SetaPDF_Core_SecHandler_Exception(
                'It is not allowed to remove the existing security handler with this credentials.',
                SetaPDF_Core_SecHandler_Exception::NOT_ALLOWED
            );
        }

        if ($this->_state !== self::STATE_NONE) {
            throw new BadMethodCallException(
                'It is not possible to orr change the security handler after an initial save call.'
            );
        }

        if (null !== $secHandler && $secHandler->getDocument()->getInstanceIdent() !== $this->getInstanceIdent()) {
            throw new InvalidArgumentException(
                'The passed security handler is already attached to another document instance.'
            );
        }

        $this->_secHandler = $secHandler;

        // adjust pdf version
        if (null !== $secHandler) {
            $pdfVersion = $secHandler->getPdfVersion();
            $this->setMinPdfVersion($pdfVersion);
        }
    }

    /**
     * Get the security handler for the output document.
     *
     * @return SetaPDF_Core_SecHandler_SecHandlerInterface|SetaPDF_Core_SecHandler_Standard
     */
    public function getSecHandler()
    {
        return $this->_secHandler;
    }

    /**
     * Defines whether the PDF objects should be written individually (true) or after assembling a single string (false).
     *
     * @param bool $directWrite
     */
    public function setDirectWrite($directWrite)
    {
        $this->_directWrite = (boolean)$directWrite;
    }

    /**
     * Gets whether the PDF objects should be written individually (true) or after assembling a single string (false).
     *
     * @return bool
     */
    public function getDirectWrite()
    {
        return $this->_directWrite;
    }

    /**
     * Writes content to the attached writer.
     *
     * @param string $s
     * @return mixed
     * @throws SetaPDF_Core_Exception
     */
    public function write($s)
    {
        if (null !== $this->_writer)
            return $this->_writer->write($s);

        throw new SetaPDF_Core_Exception(
            'No writer object known!'
        );
    }

    /**
     * Adds a callback that will get executed before the save method is processed.
     *
     * @see removeBeforeSaveCallback()
     * @param $name
     * @param $callback
     * @return bool
     */
    public function addBeforeSaveCallback($name, $callback)
    {
        if (is_callable($callback)) {
            $this->_beforeSaveCallbacks[$name] = $callback;
            return true;
        }

        return false;
    }

    /**
     * Removes a callback that was added before.
     *
     * @see addBeforeSaveCallback()
     * @param $name
     * @return bool
     */
    public function removeBeforeSaveCallback($name)
    {
        if (isset($this->_beforeSaveCallbacks[$name])) {
            unset($this->_beforeSaveCallbacks[$name]);
            return true;
        }

        return false;
    }

    /**
     * Saves the document.
     *
     * The PDF format offers a way to add changes to a document by simply appending the changes to
     * the end of the file. This method is called incremental update and has the advantage that it
     * is very fast, because only changed objects have to be written. This behavior is the default
     * one, when calling the save()-method. Sadly it makes it easy to revert the document to the
     * previous state by simply cutting the bytes of the last revision.
     *
     * The parameter of the save()-method allows you to define that the document should be rebuild
     * from scratch by resolving the complete object structure. Just pass SetaPDF_Core_Document::SAVE_METHOD_REWRITE
     * to it. This task is very performance intensive, because the complete document have to be parsed,
     * interpreted and rewritten.
     *
     * Additionally it is possible to rewrite the whole document with all available objects. The benefit of this
     * solution is that it will keep compressed object streams intact: SetaPDF_Core_Document::SAVE_METHOD_REWRITE_ALL.
     * The disadvantage ist, that unused objects may be copied/written, too.
     *
     * @param boolean|integer $method Update or rewrite the document
     * @return SetaPDF_Core_Document
     * @throws InvalidArgumentException
     * @throws SetaPDF_Core_Exception
     * @throws BadMethodCallException
     */
    public function save($method = true)
    {
        if ($method !== self::SAVE_METHOD_UPDATE &&
            $method !== self::SAVE_METHOD_REWRITE &&
            $method !== self::SAVE_METHOD_REWRITE_ALL
        ) {
            $method = $method ? self::SAVE_METHOD_UPDATE : self::SAVE_METHOD_REWRITE;
        }

        if (self::STATE_FINISHED === $this->_state) {
            throw new BadMethodCallException(
                'This instance is in a finished state and cannot be saved again.'
            );
        }

        if (self::STATE_SAVED === $this->_state && $method !== self::SAVE_METHOD_UPDATE) {
            throw new InvalidArgumentException(
                'It is not possible to save a document again if incremental updates are not activated ' .
                '($update == true || $update == SetaPDF_Core_Document::SAVE_METHOD_UPDATE).'
            );
        }

        foreach ($this->_beforeSaveCallbacks AS $name => $callback) {
            call_user_func_array($callback, array($this, $name));
        }

        if (null === $this->_writer) {
            throw new SetaPDF_Core_Exception(
                'No writer object known!'
            );
        }

        if ($this->_writer->getStatus() != SetaPDF_Core_Writer::ACTIVE) {
            $this->_writer->start();
        }

        // Check for encryption and different security handlers
        if (
            null === $this->_secHandlerIn && null !== $this->_secHandler ||
            null !== $this->_secHandlerIn && null === $this->_secHandler ||
            null !== $this->_secHandler &&
            null !== $this->_secHandlerIn &&
            $this->_secHandler->getEncryptionKey() !== $this->_secHandlerIn->getEncryptionKey()
        ) {
            // Updating a document with different security handlers is not possible
            $method = ($method <= self::SAVE_METHOD_REWRITE) ? $method : self::SAVE_METHOD_REWRITE;

            if (null !== $this->_secHandler) {
                // Update Encrypt object if needed
                // It's cloned in the security handler to avoid a cleanUp before 
                if ($this->_trailer->offsetExists('Encrypt')) {
                    $encrypt = $this->_trailer->offsetGet('Encrypt')->getValue();
                    $objectData = $this->getIdForObject($encrypt);
                    $encryptObj = $this->resolveIndirectObject($objectData[0], $objectData[1]);
                    $encryptObj->setValue($this->_secHandler->getEncryptionDictionary());
                } else {
                    $encryptObj = $this->createNewObject($this->_secHandler->getEncryptionDictionary());
                }

                $this->_trailer->offsetSet('Encrypt', $encryptObj);
            } else {
                if ($this->_trailer->offsetExists('Encrypt')) {
                    $encrypt = $this->_trailer->offsetGet('Encrypt')->getValue()->getValue();
                    $this->deleteObject($encrypt);
                    $this->_trailer->offsetUnset('Encrypt');
                }
            }

            // Mark metadata stream if needed
            if ($this->_trailer->offsetExists('Root')) {
                $root = $this->_trailer->offsetGet('Root')->getValue()->ensure(true);
                if ($root->offsetExists('Metadata')) {
                    $encryptMetadata = $this->_secHandler !== null && $this->_secHandler->getEncryptMetadata();
                    $metadata = $root->offsetGet('Metadata')->getValue()->ensure();
                    $metadata->unfilterStream();

                    $value = $metadata->getValue();
                    if (!$value->offsetExists('Filter')) {
                        $value->offsetSet(null, new SetaPDF_Core_Type_Dictionary_Entry(
                            new SetaPDF_Core_Type_Name('Filter', true),
                            new SetaPDF_Core_Type_Array()
                        ));
                    }
                    $filters = $value->offsetGet('Filter');

                    if (!($filters->getValue() instanceof SetaPDF_Core_Type_Array)) {
                        $filters->setValue(new SetaPDF_Core_Type_Array(array($filters->getValue())));
                    }

                    $filterValues = $filters->getValue();
                    foreach ($filterValues AS $key => $filter) {
                        if ($filter->getValue() === 'Crypt')
                            $filterValues->offsetUnset($key);
                    }

                    if ($this->_secHandler !== null && !$encryptMetadata) {
                        $filterValues->offsetSet(null, new SetaPDF_Core_Type_Name('Crypt', true));
                    }
                }
            }
        }


        // Turn off "update" if needed
        if (
            self::SAVE_METHOD_UPDATE === $method &&
            self::STATE_NONE === $this->_state &&
            (
                ($this->_xref instanceof SetaPDF_Core_Parser_CrossReferenceTable &&
                    (
                        (
                            $this->_xref->isCompressed() === SetaPDF_Core_Parser_CrossReferenceTable::COMPRESSED_ALL
                        ) !== $this->_compressXref
                        ||
                            $this->_xref->getStartOffset() !== 0
                    )
                )
                ||
                ($this->_xref instanceof SetaPDF_Core_Parser_CorruptedCrossReferenceTable)
            )
        ) {
            $method = self::SAVE_METHOD_REWRITE;
        }

        if (self::SAVE_METHOD_UPDATE === $method &&
            ($this->_parser instanceof SetaPDF_Core_Parser_Pdf || self::STATE_SAVED == $this->_state)
        ) {
            $this->_saveMethod = self::SAVE_METHOD_UPDATE;
            if ($this->_state != self::STATE_SAVED) {
                $reader = $this->_parser->getReader();
                $reader->copyTo($this->_writer);
                $this->_writer->write("\n");
            }

            if ($this->_writeFileBody() || $this->_trailerChanged) {
                $this->writeReferencedObjects();

                $this->_updateFileIdentifier();
                $prevPointerToXref = $this->_xref->getPointerToXref();
                $this->_writeCrossReferenceTable();
                $this->_trailer['Prev'] = new SetaPDF_Core_Type_Numeric($prevPointerToXref);
                $this->_writeTrailer();
            }
        } else {
            $this->_saveMethod = ($method <= self::SAVE_METHOD_REWRITE) ? $method : self::SAVE_METHOD_REWRITE;

            // if there's no update we could remove the version entry from the root entry
            if ($this->getCatalog()->getVersion() !== null)
                $this->getCatalog()->setVersion(null);

            $this->_writeFileHeader();
            $this->_writeFileBody();

            $objectsResolved = false;
            // start at the trailer and resolve all objects step by step
            if ($this->_parser instanceof SetaPDF_Core_Parser_Pdf) {
                $rootExists = $this->_trailer->offsetExists('Root') &&
                    ($this->_trailer->offsetGet('Root')->getValue()->ensure() instanceof SetaPDF_Core_Type_Dictionary);

                // If no root entry is found, copy object by object
                if (!$rootExists || $this->_saveMethod === self::SAVE_METHOD_REWRITE_ALL) {
                    if ($this->_xref instanceof SetaPDF_Core_Parser_CrossReferenceTable) {
                        $outdatedXrefObjects = $this->_xref->getCompressedXrefObjects();
                    }

                    $maxObjId = $this->_xref->getSize();
                    for ($i = 1; $i < $maxObjId; $i++) {
                        // in that case the object is already written in _writeFileBody()
                        if ($this->_xref->isOffsetUpdated($i) || isset($outdatedXrefObjects[$i])) {
                            continue;
                        }

                        $this->_writeObject($this, $i, null, false);
                    }

                    $objectsResolved = true;
                }
            }

            if (!$objectsResolved) {
                foreach ($this->_trailer AS $key => $entry) {
                    if ($entry instanceof SetaPDF_Core_Type_IndirectReference) {
                        // don't set the encrypt value if resulting document is not encrypted
                        if ($key === 'Encrypt' && null === $this->_secHandler)
                            continue;

                        if (null !== ($object = $entry->getValue())) {
                            $this->addIndirectObjectReferenceWritten($object);
                        }
                    }
                }

                $this->writeReferencedObjects();

                /* Make sure that changed objects are written as well.
                 * This is needed if a stream changed its length value in a
                 * referenced object.
                 */
                $this->writeChangedObjects();
            }

            $this->_trailer->offsetUnset('Prev');

            $this->_updateFileIdentifier();
            $this->_writeCrossReferenceTable();
            $this->_writeTrailer();
        }

        $this->_trailerChanged = false;

        $this->_state = self::STATE_SAVED;

        return $this;
    }

    /**
     * Get the current used save method.
     *
     * This method can be used by objects at writing time to evaluate if it is possible to edit referencing values or
     * not.
     *
     * @return integer
     */
    public function getSaveMethod()
    {
        return $this->_saveMethod;
    }

    /**
     * Writes an object to the resulting document but evaluates first if a write is neccesarry.
     *
     * @param SetaPDF_Core_Document $document
     * @param integer $objectId
     * @param integer $generation
     * @param boolean $cache
     */
    protected function _writeObject(SetaPDF_Core_Document $document, $objectId, $generation, $cache)
    {
        try {
            $object = $document->resolveIndirectObject($objectId, $generation, $cache);
            // A reference to a NULL object ...skip it
        } catch (SetaPDF_Core_Document_ObjectNotDefinedException $e) {
            return;
        } catch (SetaPDF_Core_Document_ObjectNotFoundException $e) {
            return;
        }

        /* An unchanged object stream is found, so let's write this instead of the single object
         * We've no way to check for additional referenced objects and cut the path at this point
         * which makes it only possible to use this logic if the SAVE_METHOD_REWRITE_ALL save method
         * is used.
         */
        if ($this->_compressXref && $this->_saveMethod === self::SAVE_METHOD_REWRITE_ALL) {
            if (
                $object->getOwner() instanceof SetaPDF_Core_Type_ObjectStream
                && $object->getOwnerPdfDocument()->getInstanceIdent() === $this->getInstanceIdent()
                && $object->getOwner()->isValid()
            ) {
                $objectStream = $object->getOwner();
                $outerObject = $objectStream->getOwner();

                $data = $this->getIdForObject($outerObject);
                foreach (array_keys($objectStream->getOffsets()) AS $index => $objectId) {
                    $this->_xref->setOffsetFor($objectId, 0, array($data[0], $index));
                }

                return;
            } elseif (
                $object->ensure() instanceof SetaPDF_Core_Type_ObjectStream
                && false === $object->ensure()->isValid()
            )
            {
                return;
            }
        }

        $this->writeObject($object);
    }

    /**
     * Forwards a finish signal to the attached writer.
     *
     * @return SetaPDF_Core_Document
     */
    public function finish()
    {
        if ($this->_writer !== null &&
            $this->_writer->getStatus() === SetaPDF_Core_Writer::ACTIVE
        ) {
            $this->_writer->finish();
        }

        if (null !== $this->_parser) {
            $this->_parser->cleanUp();
            $this->_parser = null;
        }

        $this->_state = self::STATE_FINISHED;

        return $this;
    }

    /**
     * Writes the file header.
     *
     * @return void
     */
    protected function _writeFileHeader()
    {
        $this->write('%PDF-' . $this->_pdfVersion . "\n");
        $this->write("%\xE2\xE3\xCF\xD3\n");
    }

    /**
     * Set the callback method/function which will write the file body.
     *
     * @param callback $callback
     */
    public function setFileBodyMethod($callback)
    {
        $this->_fileBodyMethod = $callback;
    }

    /**
     * Main method which writes the file body.
     *
     * This method should extended/overwritten to implement
     * individual logic if the document should be build at runtime.
     *
     * @return boolean If body was written
     */
    protected function _writeFileBody()
    {
        $this->_state = self::STATE_WRITING_BODY;

        if (is_callable($this->_fileBodyMethod)) {
            return call_user_func_array($this->_fileBodyMethod, array($this));
        } else {
            return $this->writeChangedObjects();
        }
    }

    /**
     * Write the cross reference table.
     *
     * @return void
     */
    protected function _writeCrossReferenceTable()
    {
        $this->_state = self::STATE_WRITING_XREF;

        // compressed xref stream
        if ($this->_compressXref) {
            $prevPointerToXref = $this->_xref->getPointerToXref();

            // Create compressed xref stream
            $xrefStreamObject = $this->createNewObject();
            $objectData = $this->getIdForObject($xrefStreamObject);

            // Add to the list of offsets
            $this->_xref->setOffsetFor($objectData[0], $objectData[1], $this->_writer->getPos());

            // Take the trailer as the basis
            $value = clone $this->_trailer;
            $this->_cleanUpTrailer($value);

            if ($this->_saveMethod === self::SAVE_METHOD_UPDATE)
                $value['Prev'] = new SetaPDF_Core_Type_Numeric($prevPointerToXref);

            $streamObject = $this->_xref->getCompressedStream(
                $value, $this->_writer->getPos(), $this->_saveMethod === self::SAVE_METHOD_UPDATE
            );

            $xrefStreamObject->setValue($streamObject);
            $streamObject->setBypassSecHandler();

            $this->_currentObject = $xrefStreamObject;
            $this->_currentObjectData = $objectData;

            // We do not use the _writeObject method, because it will
            // read the object to the xref table
            if ($this->_directWrite) {
                $xrefStreamObject->writeTo($this);
            } else {
                $this->write($xrefStreamObject->toPdfString($this));
            }
            // Remove the new object from the _changedObjects array
            unset($this->_changedObjects[$objectData[0]]);

            // default "old style" xref table
        } else {
            $this->_xref->writeNormal($this->_writer, $this->_saveMethod === self::SAVE_METHOD_UPDATE);
            $this->_trailer->offsetGet('Size')
                ->getValue()->setValue($this->_xref->getSize());
        }
    }

    /**
     * Update or create a file identifier.
     *
     * @return string The new file identifier
     */
    protected function _updateFileIdentifier()
    {
        $newId = $this->_newFileIdentifier;

        if (null === $newId) {
            $newId = md5(microtime(true), true);
            $newId = md5($newId . __FILE__, true);
            $newId = md5($newId . mt_rand(), true);

            if ($this->_trailer->offsetExists('Info')) {
                $info = $this->_trailer->getValue('Info')->ensure();
                foreach ($info AS $key => $value) {
                    if ($value instanceof SetaPDF_Core_Type_StringValue)
                        $newId = md5($newId . $key . $value->getValue(), true);
                }
            }
        }

        if (!$this->_trailer->offsetExists('ID')) {
            $this->_trailer['ID'] = new SetaPDF_Core_Type_Array(array(
                new SetaPDF_Core_Type_HexString($newId, true),
                new SetaPDF_Core_Type_HexString($newId, true)
            ));

        } else {
            $id = $this->_trailer->offsetGet('ID')->getValue();
            $id[1] = new SetaPDF_Core_Type_HexString($newId, true);
        }

        foreach ($this->_trailer['ID']->getValue() AS $id) {
            $id->setBypassSecHandler();
        }

        return $newId;
    }

    /**
     * Get a file identifier.
     *
     * @param boolean $permanent
     * @param boolean $create
     * @return string
     */
    public function getFileIdentifier($permanent = false, $create = true)
    {
        if (!$this->_trailer->offsetExists('ID')) {
            if ($create) {
                return $this->_updateFileIdentifier();
            }
            return null;
        }

        $id = $this->_trailer['ID']->getValue();
        $value = $id[$permanent ? 0 : 1];

        return $value->getValue();
    }

    /**
     * Set a custom non-permanent file identifier.
     *
     * @param string $newFileIdentifier
     */
    public function setNewFileIdentifier($newFileIdentifier)
    {
        $this->_newFileIdentifier = (string)$newFileIdentifier;
    }

    /**
     * Cleans up trailer entries.
     *
     * @param SetaPDF_Core_Type_Dictionary $trailer
     * @return void
     */
    protected function _cleanUpTrailer(SetaPDF_Core_Type_Dictionary $trailer)
    {
        if ($this->_saveMethod <= self::SAVE_METHOD_REWRITE || !$this->_compressXref) {
            // This entry points to a byte offset, which is wrong,
            // if the document is rewritten
            $trailer->offsetUnset('XRefStm');
        }

        if (null === $this->_secHandler) {
            $trailer->offsetUnset('Encrypt');
        }
    }

    /**
     * Write the trailer dictionary and the pointer top the initial xref table.
     *
     * @return void
     */
    protected function _writeTrailer()
    {
        // only needed if the xref is not compressed
        if (!$this->_compressXref) {
            $trailer = clone $this->_trailer;
            $this->_cleanUpTrailer($trailer);

            $this->write("trailer\n");

            // disable security handler temporarily
            $secHandler = $this->_secHandler;
            $this->_secHandler = null;

            if ($this->_directWrite) {
                $trailer->writeTo($this);
            } else {
                $this->write($trailer->toPdfString($this));
            }

            $this->_secHandler = $secHandler;

            $this->write("\n");
        }

        $this->write("startxref\n" . $this->_xref->getPointerToXref() . "\n%%EOF\n");
    }

    /**
     * Write changed objects.
     *
     * @return boolean was an object written?
     */
    public function writeChangedObjects()
    {
        $objectsWritten = false;
        while (null !== ($object = array_pop($this->_changedObjects))) {
            $this->writeObject($object);
            $objectsWritten = true;
        }

        return $objectsWritten;
    }

    /**
     * Write referenced objects.
     */
    public function writeReferencedObjects()
    {
        while (($objectData = array_pop($this->_referencedObjects)) !== null) {
            $this->_writeObject($objectData[2], $objectData[0], $objectData[1], $objectData[2]->getCacheReferencedObjects());
        }
    }

    /**
     * Writes an object to the resulting document.
     *
     * This method should only called in the _writeFileBody()-method
     * or in the callback method of it.
     *
     * @param SetaPDF_Core_Type_IndirectObject $object
     */
    public function writeObject(SetaPDF_Core_Type_IndirectObject $object)
    {
        $data = $this->getIdForObject($object);
        // $data[0] = objectId
        // $data[1] = generation
        $this->_xref->setOffsetFor($data[0], $data[1], $this->_writer->getPos());

        $this->_currentObject = $object;
        $this->_currentObjectData = $data;

        if ($this->_directWrite) {
            $object->writeTo($this);
        } else {
            $this->_writer->write($object->toPdfString($this));
        }

        $this->_currentObject = null;

        if ($object->getOwnerPdfDocument()->_cleanUpObjects
            && !($object->getValue() instanceof SetaPDF_Core_Type_ObjectStream)
        ) {
            $object->detach($this);
            $object->cleanUp();
        }

        if (isset($this->_changedObjects[$data[0]]))
            unset($this->_changedObjects[$data[0]]);
    }

    /**
     * Method called when a PDF type will be written.
     *
     * This method could be used to manipulate a value just before it will get written to the writer object.
     *
     * @param SetaPDF_Core_Type_AbstractType $value
     * @return SetaPDF_Core_Type_AbstractType
     */
    public function handleWriteCallback(SetaPDF_Core_Type_AbstractType $value)
    {
        if (false === $this->_useWriteCallbacks)
            return $value;

        $typeName = get_class($value);
        if (!isset($this->_writeCallbacks[$typeName]))
            return $value;

        foreach ($this->_writeCallbacks[$typeName] AS $callback) {
            call_user_func_array($callback, array($this, $value));
        }

        return $value;
    }

    /**
     * Register a write callback.
     *
     * @param callback $callback
     * @param string $type
     * @param string $name
     */
    public function registerWriteCallback($callback, $type, $name)
    {
        if (!isset($this->_writeCallbacks[$type]))
            $this->_writeCallbacks[$type] = array();

        $this->_writeCallbacks[$type][$name] = $callback;
        $this->_useWriteCallbacks = true;
    }

    /**
     * Un-Register a write callback.
     *
     * @param string $type
     * @param string $name
     */
    public function unRegisterWriteCallback($type, $name)
    {
        if (isset($this->_writeCallbacks[$type][$name]))
            unset($this->_writeCallbacks[$type][$name]);

        $this->_useWriteCallbacks = count($this->_writeCallbacks) > 0;
    }

    /**
     * Returns the currently written object.
     *
     * @return SetaPDF_Core_Type_IndirectObject
     */
    public function getCurrentObject()
    {
        return $this->_currentObject;
    }

    /**
     * Returns the currently written object data.
     *
     * @return array
     */
    public function getCurrentObjectData()
    {
        return $this->_currentObjectData;
    }

    /**
     * Get the object of the currently written/handled object.
     *
     * @return SetaPDF_Core_Document
     */
    public function getCurrentObjectDocument()
    {
        if (null !== $this->_currentObject) {
            return $this->_currentObject->getOwnerPdfDocument();
        }

        return $this;
    }

    /**
     * Get the instance identifier of this document.
     *
     * @return string
     */
    public function getInstanceIdent()
    {
        return $this->_instanceIdent;
    }

    /**
     * Release objects.
     *
     * @return void
     */
    protected function _releaseObjects()
    {
        while (($object = array_pop($this->_objects)) !== null) {
            $object->detach($this);
            $object->cleanUp();
        }
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
        if (self::STATE_CLEANED_UP === $this->_state) {
            return;
        }

        $this->_releaseObjects();

        $this->_referencedObjects = array();
        $this->_objectsToIds = array();

        $this->finish();

        $this->_trailer->detach($this);
        // only clean up if the trailer is not shared between instances
        if (!$this->_trailer->isObserved()) {
            $this->_trailer->cleanUp();
        }
        $this->_trailer = null;

        if (null !== $this->_catalog) {
            $this->_catalog->cleanUp();
            $this->_catalog = null;
        }

        if (null !== $this->_info) {
            $this->_info->cleanUp();
            $this->_info = null;
        }

        if (null !== $this->_writer) {
            $this->_writer->cleanUp();
            $this->_writer = null;
        }

        $this->_xref->cleanUp();
        $this->_xref = null;

        if (null !== $this->_parser) {
            $this->_parser->cleanUp();
            $this->_parser = null;
        }

        if ($this->_objectStreamsParser instanceof SetaPDF_Core_Parser_Pdf) {
            $this->_objectStreamsParser->cleanUp();
        }

        $this->_objectStreams = array();

        SetaPDF_Core_Font::freeCache($this);
        SetaPDF_Core_XObject::freeCache($this);
        SetaPDF_Core_ColorSpace_IccBased::freeCache($this);

        // TODO: clean up security handlers - remove cycle references

        $this->_fileBodyMethod = null;

        $this->_writeCallbacks = array();

        $this->_state = self::STATE_CLEANED_UP;
    }

    /**
     * Implementation of the SetaPDF_Core_Type_Owner interface.
     *
     * @return $this
     */
    public function getOwnerPdfDocument()
    {
        return $this;
    }
}