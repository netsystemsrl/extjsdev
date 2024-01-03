<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Info.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class for handling the documents info dictionary
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_Info
{
    /**
     * Value for the Trapped property
     *
     * @see setTrapped()
     * @var string
     */
    const TRAPPED_TRUE = 'True';

    /**
     * Value for the Trapped property
     *
     * @see setTrapped()
     * @var string
     */
    const TRAPPED_FALSE = 'False';

    /**
     * Value for the Trapped property
     *
     * @see setTrapped()
     * @var string
     */
    const TRAPPED_UNKNOWN = 'Unknown';

    /**
     * The document instance
     *
     * @var SetaPDF_Core_Document
     */
    protected $_document;

    /**
     * Defines if the XMP metadata should be synced or not
     *
     * @var bool
     */
    protected $_syncMetadata = false;

    /**
     * The XMP metadata instance
     *
     * @var DOMDocument
     */
    protected $_metadata;

    /**
     * The XMP helper instance
     *
     * @var SetaPDF_Core_XmpHelper
     */
    protected $_xmp;

    public $xmlAliases = [
        'http://ns.adobe.com/xap/1.0/' => 'xmp',
        'http://purl.org/dc/elements/1.1/' => 'dc',
        'http://ns.adobe.com/pdf/1.3/' => 'pdf',
        'http://ns.adobe.com/pdfx/1.3/' => 'pdfx',
        'http://ns.adobe.com/xap/1.0/rights/' => 'xmpRights',
        'http://ns.adobe.com/photoshop/1.0/' => 'photoshop',
        'http://www.aiim.org/pdfa/ns/id/' => 'pdfaid'
    ];

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Document $document
     */
    public function __construct(SetaPDF_Core_Document $document)
    {
        $this->_document = $document;
    }

    /**
     * Get the document instance.
     *
     * @return SetaPDF_Core_Document
     * @internal
     */
    public function getDocument()
    {
        return $this->_document;
    }

    /**
     * Release memory.
     */
    public function cleanUp()
    {
//        $this->_metadata = null;
        $this->_xmp = null;
    }

    /**
     * Get the document's title.
     *
     * @param string $encoding The output encoding
     * @return string|null
     */
    public function getTitle($encoding = 'UTF-8')
    {
        return $this->_getStringValue('Title', $encoding);
    }

    /**
     * Set the document's title.
     *
     * @param string $title The document's title
     * @param string $encoding The input encoding
     * @return SetaPDF_Core_Document_Info Returns the SetaPDF_Core_Document_Info object for method chaining.
     */
    public function setTitle($title, $encoding = 'UTF-8')
    {
        $this->_setStringValue('Title', $title, $encoding);

        if ($this->getSyncMetadata() !== false) {
            $this->_syncTitle();
        }

        return $this;
    }

    /**
     * Syncs title with XMP metadata package.
     */
    public function _syncTitle()
    {
        $title = $this->getTitle();
        $this->updateXmp('http://purl.org/dc/elements/1.1/', 'title', $title === null ? false : $title);
    }

    /**
     * Get the name of the person who created the document.
     *
     * @param string $encoding The output encoding
     * @return string
     */
    public function getAuthor($encoding = 'UTF-8')
    {
        return $this->_getStringValue('Author', $encoding);
    }

    /**
     * Set the name of the person who created the document.
     *
     * @param string $author The name of the person who created the document
     * @param string $encoding The input encoding
     * @return SetaPDF_Core_Document_Info Returns the SetaPDF_Core_Document_Info object for method chaining.
     */
    public function setAuthor($author, $encoding = 'UTF-8')
    {
        $this->_setStringValue('Author', $author, $encoding);

        if ($this->getSyncMetadata() !== false) {
            $this->_syncAuthor();
        }

        return $this;
    }

    /**
     * Syncs author with XMP metadata package.
     */
    protected function _syncAuthor()
    {
        $author = $this->getAuthor();
        $author = $author === null ? false : $this->_extractParts($author);

        $this->updateXmp(
            'http://purl.org/dc/elements/1.1/',
            'creator', // <-- creator vs. author is correct!
            $author
        );
    }

    /**
     * Get the subject of the document.
     *
     * @param string $encoding The output encoding
     * @return string
     */
    public function getSubject($encoding = 'UTF-8')
    {
        return $this->_getStringValue('Subject', $encoding);
    }

    /**
     * Set the subject of the document.
     *
     * @param string $subject The subject of the document
     * @param string $encoding The input encoding
     * @return SetaPDF_Core_Document_Info Returns the SetaPDF_Core_Document_Info object for method chaining.
     */
    public function setSubject($subject, $encoding = 'UTF-8')
    {
        $this->_setStringValue('Subject', $subject, $encoding);

        if ($this->getSyncMetadata() !== false) {
            $this->_syncSubject();
        }

        return $this;
    }

    /**
     * Syncs subject with XMP metadata package.
     */
    protected function _syncSubject()
    {
        $subject = $this->getSubject();
        $this->updateXmp(
            'http://purl.org/dc/elements/1.1/',
            'description', // <-- subject vs. description is correct!
            $subject === null ? false : $subject
        );
    }

    /**
     * Get keywords associated with the document.
     *
     * @param string $encoding The output encoding
     * @return string
     */
    public function getKeywords($encoding = 'UTF-8')
    {
        return $this->_getStringValue('Keywords', $encoding);
    }

    /**
     * Set keywords associated with the document.
     *
     * @param string $keywords The keywords associated with the document.
     * @param string $encoding The input encoding
     * @return SetaPDF_Core_Document_Info Returns the SetaPDF_Core_Document_Info object for method chaining.
     */
    public function setKeywords($keywords, $encoding = 'UTF-8')
    {
        $this->_setStringValue('Keywords', $keywords, $encoding);

        if ($this->getSyncMetadata() !== false) {
            $this->_syncKeywords();
        }

        return $this;
    }

    /**
     * Syncs keywords with XMP metadata package.
     */
    protected function _syncKeywords()
    {
        $keywords = $this->getKeywords();
        $keywords = null === $keywords ? false : $this->_extractParts($keywords);

        $this->updateXmp(
            'http://ns.adobe.com/pdf/1.3/',
            'Keywords',
            $keywords ? join(', ', $keywords) : $keywords
        );

        $this->updateXmp('http://purl.org/dc/elements/1.1/', 'subject', $keywords);
    }

    /**
     * Extracts single elements from a string and converts them into an array.
     *
     * @param $value
     * @return array|bool
     */
    private function _extractParts($value)
    {
        if (trim($value) === '')
            return false;

        $currentIndex = 0;
        $parts = [$currentIndex => ''];
        $currentPart =& $parts[$currentIndex];
        $open = false;

        for ($i = 0, $length = strlen($value); $i < $length; $i++) {
            switch ($value[$i]) {
                case '"':
                    $currentIndex++;
                    $parts[$currentIndex] = '';
                    $currentPart          =& $parts[$currentIndex];
                    $open                 = !$open;
                    continue 2;
                case ',':
                /** @noinspection PhpMissingBreakStatementInspection */
                case ';':
                    if ($open === false) {
                        $currentIndex++;
                        $parts[$currentIndex] = '';
                        $currentPart          =& $parts[$currentIndex];
                        continue 2;
                    }
                default:
                    $currentPart .= $value[$i];
            }
        }

        $parts = array_map('trim', $parts);
        $parts = array_filter($parts);

        return $parts;
    }

    /**
     * Get the name of the product that created the original document from which it was converted.
     *
     * @param string $encoding The output encoding
     * @return string
     */
    public function getCreator($encoding = 'UTF-8')
    {
        return $this->_getStringValue('Creator', $encoding);
    }

    /**
     * Set the name of the product that created the original document from which it was converted.
     *
     * @param string $creator The creator
     * @param string $encoding The input encoding
     * @return SetaPDF_Core_Document_Info Returns the SetaPDF_Core_Document_Info object for method chaining.
     */
    public function setCreator($creator, $encoding = 'UTF-8')
    {
        $this->_setStringValue('Creator', $creator, $encoding);

        if ($this->getSyncMetadata() !== false) {
            $this->_syncCreator();
        }

        return $this;
    }

    /**
     * Syncs creator with XMP metadata package.
     */
    protected function _syncCreator()
    {
        $creator = $this->getCreator();
        $this->updateXmp('http://ns.adobe.com/xap/1.0/', 'CreatorTool', $creator === null ? false : $creator);
    }

    /**
     * Get the name of the product that converted the original document to PDF.
     *
     * @param string $encoding The output encoding.
     * @return string
     */
    public function getProducer($encoding = 'UTF-8')
    {
        return $this->_getStringValue('Producer', $encoding);
    }

    /**
     * Set the name of the product that converted the original document to PDF.
     *
     * @param string $producer The name of the producer
     * @param string $encoding The input encoding
     * @return SetaPDF_Core_Document_Info Returns the SetaPDF_Core_Document_Info object for method chaining.
     */
    public function setProducer($producer, $encoding = 'UTF-8')
    {
        $this->_setStringValue('Producer', $producer, $encoding);

        if ($this->getSyncMetadata() !== false) {
            $this->_syncProducer();
        }

        return $this;
    }

    /**
     * Syncs producer with XMP metadata package.
     */
    protected function _syncProducer()
    {
        $producer = $this->getProducer();
        $this->updateXmp('http://ns.adobe.com/pdf/1.3/', 'Producer', $producer === null ? false : $producer);
    }

    /**
     * Get the date and time the document was created.
     *
     * @param boolean $asString
     * @return null|string|SetaPDF_Core_DataStructure_Date
     */
    public function getCreationDate($asString = true)
    {
        $dictionary = $this->getDictionary();
        if (null === $dictionary ||
            !$dictionary->offsetExists('CreationDate')
        )
            return null;

        if (true === $asString) {
            return $dictionary->getValue('CreationDate')->ensure()->getValue();
        }

        return new SetaPDF_Core_DataStructure_Date($dictionary->getValue('CreationDate')->ensure());
    }

    /**
     * Set the date and time the document was created.
     *
     * @param string|DateTime|SetaPDF_Core_DataStructure_Date $date
     * @return SetaPDF_Core_Document_Info Returns the SetaPDF_Core_Document_Info object for method chaining.
     */
    public function setCreationDate($date)
    {
        SetaPDF_Core_SecHandler::checkPermission($this->_document, SetaPDF_Core_SecHandler::PERM_MODIFY);

        $dictionary = $this->getDictionary($date !== null);

        if ($dictionary === null)
            return $this;

        if ($date === null) {
            $dictionary->offsetUnset('CreationDate');
        } else {
            if (!($date instanceof SetaPDF_Core_DataStructure_Date)) {
                try {
                    $date = new SetaPDF_Core_DataStructure_Date($date);
                } catch (Exception $e) {
                    $date = new SetaPDF_Core_DataStructure_Date(new SetaPDF_Core_Type_String($date));
                }
            }

            $dictionary->offsetSet('CreationDate', $date->getValue());
        }

        if ($this->getSyncMetadata() !== false) {
            $this->_syncCreationDate();
        }

        return $this;
    }

    /**
     * Syncs creation date with XMP metadata package.
     */
    protected function _syncCreationDate()
    {
        $creationDate = $this->getCreationDate(false);

        $this->updateXmp(
            'http://ns.adobe.com/xap/1.0/',
            'CreateDate',
            $creationDate === null
                ? false
                : $creationDate->getAsDateTime()->format('c')
        );
    }

    /**
     * Get the date and time the document was most recently modified.
     *
     * @param bool $asString If set to true the string value will get returned. Otherwise a
     *                       {@link SetaPDF_Core_DataStructure_Date} object.
     * @return null|string|SetaPDF_Core_DataStructure_Date
     */
    public function getModDate($asString = true)
    {
        $dictionary = $this->getDictionary();
        if (null === $dictionary ||
            !$dictionary->offsetExists('ModDate')
        )
            return null;

        if (true === $asString) {
            return $dictionary->getValue('ModDate')->ensure()->getValue();
        }

        return new SetaPDF_Core_DataStructure_Date($dictionary->getValue('ModDate')->ensure());
    }

    /**
     * Set the date and time the document was most recently modified.
     *
     * @param string|DateTime|SetaPDF_Core_DataStructure_Date $date The modification date
     * @return SetaPDF_Core_Document_Info Returns the SetaPDF_Core_Document_Info object for method chaining.
     */
    public function setModDate($date)
    {
        $dictionary = $this->getDictionary($date !== null);

        if ($dictionary === null)
            return $this;

        if ($date === null) {
            $dictionary->offsetUnset('ModDate');
        } else {
            if (!($date instanceof SetaPDF_Core_DataStructure_Date)) {
                try {
                    $date = new SetaPDF_Core_DataStructure_Date($date);
                } catch (Exception $e) {
                    $date = new SetaPDF_Core_DataStructure_Date(new SetaPDF_Core_Type_String($date));
                }
            }

            $dictionary->offsetSet('ModDate', $date->getValue());
        }

        if ($this->getSyncMetadata() !== false) {
            $this->_syncModDate();
        }

        return $this;
    }

    /**
     * Syncs modification date with XMP metadata package.
     */
    protected function _syncModDate()
    {
        $modDate = $this->getModDate(false);

        $this->updateXmp(
            'http://ns.adobe.com/xap/1.0/',
            'ModifyDate',
            $modDate === null
                ? false
                : $modDate->getAsDateTime()->format('c')
        );
    }

    /**
     * Get information whether the document has been modified to include trapping information.
     *
     * @param boolean $default If set to true and no entry is defined the default value is returned
     * @return string
     */
    public function getTrapped($default = true)
    {
        $dictionary = $this->getDictionary();
        if (null === $dictionary ||
            !$dictionary->offsetExists('Trapped')
        ) {
            return $default ? self::TRAPPED_UNKNOWN : null;
        }
        
        return $dictionary->getValue('Trapped')->ensure()->getValue();
    }

    /**
     * Set information whether the document has been modified to include trapping information.
     *
     * Pass null to remove this entry from the info dictionary.
     *
     * @param string $trapped The trapped value. See SetaPDF_Core_Document_Info::TRAPPED_XXX constants.
     * @return SetaPDF_Core_Document_Info Returns the SetaPDF_Core_Document_Info object for method chaining.
     */
    public function setTrapped($trapped)
    {
        SetaPDF_Core_SecHandler::checkPermission($this->_document, SetaPDF_Core_SecHandler::PERM_MODIFY);

        $dictionary = $this->getDictionary($trapped !== null);
        if ($dictionary === null)
            return $this;

        if ($trapped === null) {
            $dictionary->offsetUnset('Trapped');
        } else {
            $dictionary->offsetSet('Trapped', new SetaPDF_Core_Type_Name($trapped));
        }

        if ($this->getSyncMetadata() !== false) {
            $this->_syncTrapped();
        }

        return $this;
    }

    /**
     * Syncs the XMP metadata package
     */
    protected function _syncTrapped()
    {
        $trapped = $this->getTrapped(false);
        if ($trapped === null) {
            $this->updateXmp(
                'http://ns.adobe.com/pdf/1.3/', 'Trapped', 'Unknown'
            );
        } else {
            $this->updateXmp(
                'http://ns.adobe.com/pdf/1.3/', 'Trapped', $trapped ? 'True' : 'False'
            );
        }
    }

    /**
     * Get a custom metadata value.
     *
     * @param string $name The name of the custom metadata value
     * @param string $encoding The output encoding
     * @return null|string
     */
    public function getCustomMetadata($name, $encoding = 'UTF-8')
    {
        return $this->_getStringValue($name, $encoding);
    }

    /**
     * Set custom metadata.
     *
     * Pass $value as null to remove this entry from the info dictionary.
     *
     * @param string $name The name of the custom metadata
     * @param string $value The string value of the custom metadata
     * @param string $encoding The input encoding
     * @throws InvalidArgumentException
     * @return SetaPDF_Core_Document_Info Returns the SetaPDF_Core_Document_Info object for method chaining.
     */
    public function setCustomMetadata($name, $value, $encoding = 'UTF-8')
    {
        switch ($name) {
            case 'Title':
            case 'Author':
            case 'Subject':
            case 'Keywords':
            case 'Creator':
            case 'Producer':
            case 'CreationDate':
            case 'ModDate':
            case 'Trapped':
                throw new InvalidArgumentException(sprintf('Key (%s) cannot be used as custom metadata.', $name));
        }

        $this->_setStringValue($name, $value, $encoding);

        if ($this->getSyncMetadata() !== false) {
            $this->_syncCustomMetadata($name);
        }

        return $this;
    }

    /**
     * Syncs custom metadata with the XMP metadata package.
     *
     * @param string $name The name of the custom metadata
     */
    public function _syncCustomMetadata($name)
    {
        $value = $this->getCustomMetadata($name);
        $this->updateXmp('http://ns.adobe.com/pdfx/1.3/', $name, null === $value ? false : $value);
    }

    /**
     * Get all data from the info dictionary.
     *
     * @param string $encoding The output encoding
     * @return array An key/value array of all metadata.
     */
    public function getAll($encoding = 'UTF-8')
    {
        $data = [];

        $dictionary = $this->getDictionary();
        if (null === $dictionary) {
            return $data;
        }

        foreach ($dictionary AS $name => $value) {
            switch ($name) {
                case 'CreationDate':
                case 'ModDate':
                case 'Trapped':
                    $method = 'get' . $name;
                    $data[$name] = $this->$method();
                    continue 2;
                default:
                    $value = $value->ensure();
                    if ($value instanceof SetaPDF_Core_Type_StringValue)
                        $data[$name] = SetaPDF_Core_Encoding::convertPdfString($value->getValue(), $encoding);
                    else
                        $data[$name] = $value->toPhp();
            }
        }

        return $data;
    }

    /**
     * Set all data via an array parameter.
     *
     * This method decides if a value is a custom metadata or a standard value and
     * will forward it to the desired method.
     *
     * @param array $data An key/value array of metadata
     * @param string $encoding The input encoding
     */
    public function setAll(array $data, $encoding = 'UTF-8')
    {
        foreach ($data AS $name => $value) {
            $method = 'set' . ucfirst($name);
            if (method_exists($this, $method)) {
                $this->$method($value, $encoding);
            } else {
                $this->setCustomMetadata($name, $value, $encoding);
            }
        }
    }

    /**
     * Get all custom metadata.
     *
     * @param string $encoding The output encoding
     * @return array
     */
    public function getAllCustomMetadata($encoding = 'UTF-8')
    {
        $data = [];
        $dictionary = $this->getDictionary();
        if (null === $dictionary) {
            return $data;
        }

        $keys = $this->_getAllCustomMetadataKeys();
        foreach ($keys AS $name) {
            $value = $dictionary->getValue($name)->ensure();
            if ($value instanceof SetaPDF_Core_Type_StringValue)
                $data[$name] = SetaPDF_Core_Encoding::convertPdfString($value->getValue(), $encoding);
            else
                $data[$name] = $value->toPhp();
        }

        return $data;
    }

    /**
     * Get all custom metadata keys
     *
     * @return array
     */
    protected function _getAllCustomMetadataKeys()
    {
        $keys = [];
        $dictionary = $this->getDictionary();
        if (null === $dictionary) {
            return $keys;
        }

        foreach ($dictionary AS $name => $value) {
            switch ($name) {
                case 'Title':
                case 'Author':
                case 'Subject':
                case 'Keywords':
                case 'Creator':
                case 'Producer':
                case 'CreationDate':
                case 'ModDate':
                case 'Trapped':
                    continue 2;
                default:
                    $keys[] = $name;
            }
        }

        return $keys;
    }

    /**
     * Get and/or creates the info dictionary.
     *
     * @param boolean $create Defines if the dictionary should be created if it is not available
     * @return null|SetaPDF_Core_Type_Dictionary The dictionary for low level access or null if none is available.
     */
    public function getDictionary($create = false)
    {
        $trailer = $this->getDocument()->getTrailer();

        if (!$trailer->offsetExists('Info')) {
            if (false === $create)
                return null;

            $object = $this->getDocument()->createNewObject(new SetaPDF_Core_Type_Dictionary());
            $trailer->offsetSet('Info', $object);
        }

        return $trailer->offsetGet('Info')->ensure();
    }

    /**
     * Alias for getDictionary().
     *
     * @param boolean $create Defines if the dictionary should be created if it is not available
     * @return null|SetaPDF_Core_Type_Dictionary The dictionary for low level access or null if none is available.
     * @deprecated
     */
    public function getInfoDictionary($create = false)
    {
        return $this->getDictionary($create);
    }

    /**
     * Get a string value from the info dictionary.
     *
     * @param string $name
     * @param string $encoding
     * @return null|string
     */
    protected function _getStringValue($name, $encoding)
    {
//        $name = SetaPDF_Core_Type_Name::escape($name);

        $dictionary = $this->getDictionary();

        if ($dictionary === null || !$dictionary->offsetExists($name))
            return null;

        $value = $dictionary->getValue($name)->ensure()->getValue();
        if (!is_string($value)) {
            return null;
        }

        return SetaPDF_Core_Encoding::convertPdfString($value, $encoding);
    }

    /**
     * Set a string value in the info dictionary.
     *
     * @param string $name
     * @param string $value
     * @param string $encoding
     */
    protected function _setStringValue($name, $value, $encoding)
    {
        SetaPDF_Core_SecHandler::checkPermission($this->_document, SetaPDF_Core_SecHandler::PERM_MODIFY);

        $dictionary = $this->getDictionary($value !== null);

        if ($dictionary === null)
            return;

        if ($value === null) {
            $dictionary->offsetUnset($name);

        } else {

            $dictionary->offsetSet(new SetaPDF_Core_Type_Name($name), new SetaPDF_Core_Type_String(
                SetaPDF_Core_Encoding::toPdfString($value, $encoding)
            ));
        }
    }

    /**
     * Defines if the XMP metadata should be synced automatically.
     *
     * If this is set, the changes are made to a DOMDocument instance temporary.
     * A call of {@link syncMetadata()} is required to write the changes to the metadata entry in the documents
     * catalog dictionary.
     *
     * @param bool $syncMetadata The flag status
     * @return SetaPDF_Core_Document_Info Returns the SetaPDF_Core_Document_Info object for method chaining.
     */
    public function setSyncMetadata($syncMetadata = true)
    {
        $this->_syncMetadata = (boolean)$syncMetadata;

        return $this;
    }

    /**
     * Gets whether XMP metadata should be synced automatically.
     *
     * @return bool
     */
    public function getSyncMetadata()
    {
        return $this->_syncMetadata;
    }

    /**
     * Passes the changes to the XMP metadata package.
     */
    public function syncMetadata()
    {
        $this->_document->getCatalog()->setMetadata($this->getXmp()->getPackage());
    }

    /**
     * Get the XMP helper instance.
     *
     * @return SetaPDF_Core_XmpHelper
     */
    public function getXmp()
    {
        if ($this->_xmp === null) {
            $this->_xmp = new SetaPDF_Core_XmpHelper($this->getMetadata());
        }

        return $this->_xmp;
    }

    /**
     * Get the metadata DOMDocument instance.
     *
     * @return DOMDocument Returns a DOMDocument instance of the XMP metadata package.
     */
    public function getMetadata()
    {
        if ($this->_metadata === null) {
            $this->_metadata = new DOMDocument();
            $metadata = $this->_document->getCatalog()->getMetadata();
            if ($metadata !== null) {
                // remove XMP packet wrapper (could be malformed e.g. by Foxit Phantom 8.x)
                $metadata = trim(preg_replace("/<\?xpacket.*\?>/", '', $metadata));
                if ($metadata) {
                    $this->_metadata->loadXML($metadata, LIBXML_NOERROR);
                    $error = libxml_get_last_error();
                    // let's recreate the metadata if an error occurs
                    if ($error !== false) {
                        $metadata = null;
                    }
                }
            }

            $this->_metadata->formatOutput = true;

            if ($metadata === null) {
                $this->updateXmp('http://purl.org/dc/elements/1.1/', 'format', 'application/pdf');

                $this->_syncTitle();
                $this->_syncProducer();
                $this->_syncSubject();
                $this->_syncAuthor();
                $this->_syncCreator();

                try {
                    $this->_syncCreationDate();
                } catch (OutOfRangeException $e) {}

                try {
                    $this->_syncModDate();
                } catch (OutOfRangeException $e) {}

                $this->_syncTrapped();
                $this->_syncKeywords();
                foreach ($this->_getAllCustomMetadataKeys() AS $name) {
                    $this->_syncCustomMetadata($name);
                }
            }
        }

        return $this->_metadata;
    }

    /**
     * Updates a single field in the XMP package.
     *
     * @param string $namespace The namespace of the element
     * @param string $tagName The tag name
     * @param bool|string|array $value The value
     */
    public function updateXmp($namespace, $tagName, $value)
    {
        // make sure that the aliases are in sync for backwards compatibility
        $xmp = $this->getXmp();
        foreach ($this->xmlAliases as $ns => $xmlAlias) {
            $xmp->xmlAliases[$ns] = $xmlAlias;
        }

        $xmp->set($namespace, $tagName, $value);
        if ($tagName !== 'MetadataDate') {
            $this->getXmp()->set('http://ns.adobe.com/xap/1.0/', 'MetadataDate', date('c'));
        }
    }
}