<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Type
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Stream.php 1062 2017-06-20 12:55:44Z jan.slabon $
 */

/**
 * Class representing a stream object
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Type
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Type_Stream
    extends SetaPDF_Core_Type_AbstractType
    implements SplObserver, SetaPDF_Core_Canvas_StreamProxyInterface
{
    /**
     * The dictionary of the stream object
     *
     * @var SetaPDF_Core_Type_Dictionary
     */
    protected $_value;

    /**
     * The stream content
     *
     * @var string
     */
    protected $_stream = '';

    /**
     * The unfiltered stream content
     *
     * @var string
     */
    protected $_unfilteredStream = null;

    /**
     * Flag saying that the current stream data is filtered or not
     *
     * @var boolean
     */
    protected $_filtered = false;

    /**
     * The original owning object
     *
     * Needed if the stream is encrypted
     *
     * @var SetaPDF_Core_Type_IndirectObject
     */
    protected $_owningObject;

    /**
     * Flag saying that the stream is encrypted or not
     *
     * @var boolean
     */
    protected $_encrypted = false;

    /**
     * Flag saying that this stream should by pass the security handler
     *
     * @var boolean
     */
    protected $_bypassSecHandler = false;

    /** @noinspection PhpMissingParentConstructorInspection */
    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Type_Dictionary $value
     * @param string $stream
     * @param SetaPDF_Core_Type_IndirectObject $owningObject
     */
    public function __construct(
        SetaPDF_Core_Type_Dictionary $value = null,
        $stream = '',
        SetaPDF_Core_Type_IndirectObject $owningObject = null
    )
    {
        unset($this->_observed);

        if (null !== $value)
            $this->_value = $value;
        else
            $this->_value = new SetaPDF_Core_Type_Dictionary();

        $this->_stream = (string)$stream;

        $this->_filtered = true;

        if (null !== $owningObject) {
            $this->_encrypted = true;
            $this->_owningObject = $owningObject;
        } else {
            unset($this->_encrypted, $this->_owningObject);
        }
    }

    /**
     * Implementation of __wakeup.
     *
     * @internal
     */
    public function __wakeup()
    {
        if ($this->_encrypted === false)
            unset($this->_encrypted);

        if ($this->_owningObject === null)
            unset($this->_owningObject);

        parent::__wakeup();
    }

    /**
     * Implementation of __clone().
     *
     * @see SetaPDF_Core_Type_AbstractType::__clone()
     * @internal
     */
    public function __clone()
    {
        $this->_value = clone $this->_value;
        parent::__clone();
    }

    /**
     * Clone the object recursively in the context of a document.
     *
     * @param SetaPDF_Core_Document $document
     * @return SetaPDF_Core_Type_AbstractType
     */
    public function deepClone(SetaPDF_Core_Document $document)
    {
        $clone = clone $this;
        $clone->_value = $clone->_value->deepClone($document);

        return $clone;
    }

    /**
     * Add an observer to the object.
     *
     * Implementation of the Observer Pattern.
     *
     * @param SplObserver $observer
     */
    public function attach(SplObserver $observer)
    {
        $isObserved = isset($this->_observed);
        parent::attach($observer);

        if (false === $isObserved) {
            $this->_value->attach($this);
        }
    }

    /**
     * Triggered if a value of this object is changed. Forward this to the object.
     *
     * @param SplSubject $SplSubject
     */
    public function update(SplSubject $SplSubject)
    {
        if (isset($this->_observed))
            $this->notify();
    }

    /**
     * Set the PDF dictionary for this stream object.
     *
     * @param SetaPDF_Core_Type_Dictionary $value The value
     * @see SetaPDF_Core_Type_AbstractType::setValue()
     * @throws InvalidArgumentException
     */
    public function setValue($value)
    {
        // TODO: Check if Filter is changed
        if (!($value instanceof SetaPDF_Core_Type_Dictionary)) {
            throw new InvalidArgumentException('Parameter should be an object of SetaPDF_Core_Type_Dictionary.');
        }

        $this->_value = $value;
        if (isset($this->_observed)) {
            $this->_value->attach($this);
            $this->notify();
        }
    }

    /**
     * Get the dictionary of this stream.
     *
     * @return SetaPDF_Core_Type_Dictionary
     */
    public function getValue()
    {
        return $this->_value;
    }

    /**
     * Set the stream content.
     *
     * @param string $stream
     */
    public function setStream($stream)
    {
        if ($stream === $this->_stream)
            return;

        $this->_stream = (string)$stream;

        $this->_filtered = false;
        unset($this->_encrypted, $this->_owningObject);

        if (isset($this->_observed))
            $this->notify();
    }

    /**
     * Get the plain stream content.
     *
     * @param boolean $filtered
     * @return string
     */
    public function getStream($filtered = false)
    {
        $stream = $this->_decrypt();

        // remove filter
        if ($filtered === false && true === $this->_filtered) {
            return $this->_applyFilter($stream, false, isset($this->_owningObject) ? $this->_owningObject->getOwnerPdfDocument() : null);
        }

        return $stream;
    }

    /**
     * Append a stream to the existing stream.
     *
     * @param string $bytes
     */
    public function appendStream($bytes)
    {
        $this->setStream($this->getStream() . $bytes);
    }

    /**
     * Alias for SetaPDF_Core_Type_Stream::appendStream.
     *
     * @param string $bytes
     */
    public function write($bytes)
    {
        $this->appendStream($bytes);
    }

    /**
     * Clears the stream.
     */
    public function clear()
    {
        $this->setStream('');
    }

    /**
     * Set the bypass security handler flag.
     *
     * @param boolean $bypassSecHandler
     */
    public function setBypassSecHandler($bypassSecHandler = true)
    {
        $this->_bypassSecHandler = (boolean)$bypassSecHandler;

        // If defined to bypass the security handler decrypt if necessary
        if (true === $this->_bypassSecHandler && isset($this->_encrypted) && false === $this->hasCryptFilter()) {
            $this->setStream($this->_decrypt());
            $this->_filtered = true;
        }
    }

    /**
     * Decrypts the stream (if needed).
     *
     * @return string
     */
    protected function _decrypt()
    {
        if (isset($this->_encrypted) && false === $this->hasCryptFilter()) {
            $secHandler = $this->_owningObject->getOwnerPdfDocument()->getSecHandlerIn();
            return $secHandler->decryptStream($this->_stream, $this->_owningObject);
        }

        return $this->_stream;
    }

    /**
     * Unfilter the stream.
     */
    public function unfilterStream()
    {
        if (true === $this->_filtered) {
            /**
             * Don't send changes to observers
             * It's only the state that changed - the content is still the same.
             */
            $observed = isset($this->_observed);
            if ($observed)
                unset($this->_observed);

            $this->setStream($this->getStream());

            if ($observed)
                $this->_observed = true;
        }
    }


    /**
     * Checks if an Crypt is defined for this stream.
     */
    public function hasCryptFilter()
    {
        $value = $this->getValue();
        if (!$value->offsetExists('Filter')) {
            return false;
        }

        $filters = $value->getValue('Filter')->ensure();
        if (!$filters instanceof SetaPDF_Core_Type_Array) {
            $filters = array($filters);
        } else {
            $filters = $filters->getValue();
        }

        foreach ($filters AS $filter) {
            if ($filter->getValue() === 'Crypt')
                return true;
        }

        return false;
    }

    /**
     * Applies filter to the stream.
     *
     * @param string $stream
     * @param boolean $encode
     * @param SetaPDF_Core_Document $pdfDocument The document, on which the stream will get used. This value is only needed for a crypt filter (to be implemented!)
     * @return mixed
     * @throws SetaPDF_Exception
     * @throws SetaPDF_Exception_NotImplemented
     */
    protected function _applyFilter($stream, $encode = false, SetaPDF_Core_Document $pdfDocument = null)
    {
        $filters = array();
        $value = $this->getValue();
        if ($value->offsetExists('Filter')) {
            $filters = $value->getValue('Filter')->ensure();
            if (!$filters instanceof SetaPDF_Core_Type_Array) {
                $filters = array($filters);
            } else {
                $filters = $filters->getValue();
            }
        }

        $decodeParams = array();

        if ($value->offsetExists('DecodeParms')) {
            $decodeParams = $value->getValue('DecodeParms')->ensure();
            if (!$decodeParams instanceof SetaPDF_Core_Type_Array) {
                $decodeParams = array($decodeParams);
            } else {
                $decodeParams = $decodeParams->getValue();
            }
        }

        $method = $encode ? 'encode' : 'decode';
        if ($method === 'encode') {
            $filters = array_reverse($filters);
            $decodeParams = array_reverse($decodeParams);
        }

        foreach ($filters AS $key => $filter) {
            if (!$filter instanceof SetaPDF_Core_Type_Name) {
                continue;
            }

            $decodeParam = isset($decodeParams[$key]) ? $decodeParams[$key] : null;

            $filterName = $filter->getValue();
            switch ($filterName) {
                case 'FlateDecode':
                case 'Fl':
                case 'LZWDecode':
                case 'LZW':
                    if ('LZWDecode' === $filterName || 'LZW' === $filterName) {
                        $filterClass = 'SetaPDF_Core_Filter_Lzw';
                    } else {
                        $filterClass = 'SetaPDF_Core_Filter_Flate';
                    }

                    if (null !== $decodeParam && $decodeParam instanceof SetaPDF_Core_Type_Dictionary) {
                        $predictor = $decodeParam->offsetExists('Predictor')
                            ? $decodeParam->getValue('Predictor')->getValue()
                            : null;

                        $colors = $decodeParam->offsetExists('Colors')
                            ? $decodeParam->getValue('Colors')->getValue()
                            : null;

                        $bitsPerComponent = $decodeParam->offsetExists('BitsPerComponent')
                            ? $decodeParam->getValue('BitsPerComponent')->getValue()
                            : null;

                        $columns = $decodeParam->offsetExists('Columns')
                            ? $decodeParam->getValue('Columns')->getValue()
                            : null;

                        $filterObject = new $filterClass($predictor, $colors, $bitsPerComponent, $columns);
                    } else {
                        $filterObject = new $filterClass();
                    }

                    $stream = $filterObject->$method($stream);
                    break;

                case 'ASCII85Decode':
                case 'A85':
                    $filterObject = new SetaPDF_Core_Filter_Ascii85();
                    $stream = $filterObject->$method($stream);
                    break;

                case 'ASCIIHexDecode':
                case 'AHx':
                    $filterObject = new SetaPDF_Core_Filter_AsciiHex();
                    $stream = $filterObject->$method($stream);
                    break;

                case 'RunLengthDecode':
                case 'RL':
                    $filterObject = new SetaPDF_Core_Filter_RunLength();
                    $stream = $filterObject->$method($stream);
                    break;

                case 'Crypt':
                    // Filter is "Identity"
                    if (null === $decodeParam || !$decodeParam->offsetExists('Crypt'))
                        break;

                    if ($decodeParam->offsetExists('Name')) {
                        $name = $decodeParam->getValue('Name')->getValue();
                        // Filter is "Identity"
                        if ($name === 'Identity')
                            break;
                    }

                    /**
                     * If the name is not "Identity" it should be
                     * forwarded to the security handler.
                     *
                     * see 7.3.10 Crypt Filter for some interesting notes:
                     * If a stream specifies a crypt filter, then the security handler does
                     * not apply "Algorithm 1: Encryption of data using the RC4 or AES algorithms"
                     * in 7.6.2, "General Encryption Algorithm," to the key prior to decrypting
                     * the stream. Instead, the security handler shall decrypt the stream using
                     * the key as is. Sub-clause 7.4, "Filters,"explains how a stream specifies
                     * filters.
                     */
                    throw new SetaPDF_Exception_NotImplemented(
                        'Support for Crypt filters other than "Identity" is not implemented yet.'
                    );
                    break;

                default:
                    throw new SetaPDF_Exception(sprintf(
                        'Unsupported filter "%s".', $filterName
                    ));
            }
        }

        return $stream;
    }

    /**
     * Pre-Process the stream for the output in a specific PDF document.
     *
     * @param SetaPDF_Core_Document $pdfDocument
     * @return mixed|string
     */
    protected function _preProcess(SetaPDF_Core_Document $pdfDocument)
    {
        $stream = $this->_stream;

        // Apply filter (if necessary)
        if (false === $this->_filtered) {
            $stream = $this->_applyFilter($stream, true, $pdfDocument);
        }

        if (false === $this->hasCryptFilter()) {
            $secHandler = $pdfDocument->getSecHandler();

            if (!isset($this->_encrypted)) {
                if ($secHandler && false === $this->_bypassSecHandler) {
                    $stream = $secHandler->encryptStream($stream, $pdfDocument->getCurrentObject());
                }
            } else {
                $owningDocument = $this->_owningObject->getOwnerPdfDocument();
                $currentObjectData = $pdfDocument->getCurrentObjectData();
                $secHandlerIn = $owningDocument->getSecHandlerIn();

                // If it's another document, decrypt it
                if (!(
                    $pdfDocument->getInstanceIdent() == $owningDocument->getInstanceIdent()
                        &&
                        $this->_owningObject->getObjectId() === $currentObjectData[0] &&
                        null !== $secHandler &&
                        $secHandlerIn->getEncryptionKey() === $secHandler->getEncryptionKey()
                )
                ) {
                    $stream = $this->_decrypt();
                    if (null !== $secHandler) {
                        $stream = $secHandler->encryptStream($stream, $pdfDocument->getCurrentObject());
                    }
                }
            }
        }

        $length = strlen($stream);

        if (
            $this->_value->offsetExists('Length') &&
            $pdfDocument->getSaveMethod() !== SetaPDF_Core_Document::SAVE_METHOD_REWRITE_ALL
        ) {
            $value = $this->_value->offsetGet('Length')->ensure(true);
            if ($value instanceof SetaPDF_Core_Type_Numeric) {
                $value->setValue($length);
                return $stream;
            }
        }

        $this->_value->offsetSet('Length', new SetaPDF_Core_Type_Numeric($length));

        return $stream;
    }

    /**
     * Returns the type as a formatted PDF string.
     *
     * @param SetaPDF_Core_Document $pdfDocument
     * @return string
     */
    public function toPdfString(SetaPDF_Core_Document $pdfDocument)
    {
        $stream = $this->_preProcess($pdfDocument);
        return
            $this->_value->toPdfString($pdfDocument)
            . "\nstream\n"
            . $stream
            . "\nendstream";
    }

    /**
     * Writes the type as a formatted PDF string to the document.
     *
     * @param SetaPDF_Core_Document $pdfDocument
     */
    public function writeTo(SetaPDF_Core_Document $pdfDocument)
    {
        $stream = $this->_preProcess($pdfDocument);
        $this->_value->writeTo($pdfDocument);
        $pdfDocument->write("\nstream\n" . $stream . "\nendstream");
    }

    /**
     * Release objects/memory.
     *
     * @see SetaPDF_Core_Type_AbstractType::cleanUp()
     */
    public function cleanUp()
    {
        if (!isset($this->_observed)) {
            $this->_value->detach($this);
            $this->_value->cleanUp();

            // $this->_stream = '';
            unset($this->_owningObject);
        }
    }

    /**
     * Converts the PDF data type to a PHP data type and returns it.
     *
     * @return array
     */
    public function toPhp()
    {
        return array(
            'dictionary' => $this->_value->toPhp(),
            'stream' => $this->getStream()
        );
    }
}