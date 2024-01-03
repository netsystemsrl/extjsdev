<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Type
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: IndirectReference.php 1118 2017-11-09 16:35:30Z jan.slabon $
 */

/**
 * Class representing an indirect reference
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Type
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Type_IndirectReference
    extends SetaPDF_Core_Type_AbstractType
    implements SetaPDF_Core_Type_IndirectObjectInterface
{
    /**
     * The owner instance
     *
     * @var SetaPDF_Core_Type_Owner
     */
    protected $_owner;

    /**
     * The initial object id
     *
     * @var int
     */
    protected $_objectId = null;

    /**
     * The initial generation number
     *
     * @var integer
     */
    protected $_gen = 0;

    /**
     * The object identifier
     *
     * @var string
     */
    protected $_objectIdent;

    /** @noinspection PhpMissingParentConstructorInspection */
    /**
     * The constructor.
     *
     * @param integer|SetaPDF_Core_Type_IndirectObject $objectId
     * @param integer|null $gen
     * @param SetaPDF_Core_Type_Owner $owner
     * @throws InvalidArgumentException
     */
    public function __construct($objectId, $gen = 0, SetaPDF_Core_Type_Owner $owner = null)
    {
        unset($this->_observed);

        if ($objectId instanceof SetaPDF_Core_Type_IndirectObjectInterface) {
            $this->_objectId = $objectId->getObjectId();
            $this->_gen = $objectId->getGen();

            $ownerPdfDocument = $objectId->getOwnerPdfDocument();
            $owner = $ownerPdfDocument;
        } else {
            $this->_objectId = (int)$objectId;
            $this->_gen = (int)$gen;

            if (!($owner instanceof SetaPDF_Core_Type_Owner)) {
                throw new InvalidArgumentException('$owner has to be an instance of SetaPDF_Core_Type_Owner');
            }

            $ownerPdfDocument = $owner->getOwnerPdfDocument();
            if (!($ownerPdfDocument instanceof SetaPDF_Core_Document)) {
                throw new InvalidArgumentException(
                    '$owner needs to return a SetaPDF_Core_Document in its getPdfDocument() method.'
                );
            }
        }

        $this->_owner = $owner;

        // Is this object or a reference already known?
        $this->_objectIdent = $ownerPdfDocument->getInstanceIdent()
            . '-' . $this->_objectId
            . '-' . $this->_gen;

    }

    /**
     * Clone the object recursively in the context of a document.
     *
     * @param SetaPDF_Core_Document $document
     * @throws SetaPDF_Core_Type_IndirectReference_Exception
     * @return SetaPDF_Core_Type_AbstractType
     */
    public function deepClone(SetaPDF_Core_Document $document)
    {

        if ($document->getInstanceIdent() === $this->getOwnerPdfDocument()->getInstanceIdent())
            return clone $this;

        $clone = clone $this;

        try {
            $object = $this->getOwnerPdfDocument()->resolveIndirectObject($this->_objectId, $this->_gen);
        } catch (SetaPDF_Core_Document_ObjectNotDefinedException $e) {
            return new SetaPDF_Core_Type_Null();
        }

        $objectData = $document->getIdForObject($clone);
        $clone->_objectId = $objectData[0];
        $clone->_gen = $objectData[1];

        $object->deepClone($document);
        $clone->_owner = $document;

        return $clone;
    }

    /**
     * Automatically resolves the indirect reference to the object.
     *
     * The $forceObservation is used to forward/handle the observer pattern.
     *
     * If it is set to true or this object is observed already the resolved object will get observed automatically.
     *
     * If the parameter is set to false, the document is detached from the resolved object,
     * so that it is only possible to use this object as a read only object.
     *
     * @param boolean $forceObservation If this is set to true, the resolved object will be observed automatically
     * @return SetaPDF_Core_Type_AbstractType
     * @throws SetaPDF_Core_Type_IndirectReference_Exception
     */
    public function ensure($forceObservation = null)
    {
        $document = $this->getOwnerPdfDocument();
        if (null === $document) {
            throw new SetaPDF_Core_Type_IndirectReference_Exception(
                'Automated resolving of object chains are only possible if a document is attached to the value.'
            );
        }

        try {
            $value = $document->resolveIndirectObject($this->_objectId, $this->_gen);
        } catch (SetaPDF_Core_Document_ObjectNotDefinedException $e) {
            throw new SetaPDF_Core_Type_IndirectReference_Exception(
                sprintf('Object could not be resolved (%s, %s)', $this->getObjectId(), $this->getGen())
            );
        }

        if (
            !$value->isObserved() && (
                false !== $forceObservation && isset($this->_observed) ||
                true === $forceObservation && null !== $document
            )
        ) {
            $value->observe();
        }

        // TODO: This is never used at all and will collide with object streams.
        if ($forceObservation === false) {
            $value->detach($this->getOwnerPdfDocument());
        }

        return $value->ensure($forceObservation);
    }

    /**
     * Returns the initial object id.
     *
     * @return integer
     */
    public function getObjectId()
    {
        return $this->_objectId;
    }

    /**
     * Returns the initial generation number.
     *
     * @return integer
     */
    public function getGen()
    {
        return $this->_gen;
    }

    /**
     * Returns the owner document.
     *
     * @return SetaPDF_Core_Document
     */
    public function getOwnerPdfDocument()
    {
        return $this->_owner->getOwnerPdfDocument();
    }

    /**
     * Get the owner object of this indirect object.
     *
     * @return SetaPDF_Core_Type_Owner
     */
    public function getOwner()
    {
        return $this->_owner;
    }

    /**
     * Get the Object Identifier.
     *
     * This identifier has nothing to do with the object numbers
     * of a PDF document. They will be used to map an object to
     * document related object numbers.
     *
     * @return string
     */
    public function getObjectIdent()
    {
        return $this->_objectIdent;
    }

    /**
     * Set the indirect object value.
     *
     * @param SetaPDF_Core_Type_IndirectObject $value
     * @throws InvalidArgumentException
     */
    public function setValue($value)
    {
        if (!($value instanceof SetaPDF_Core_Type_IndirectObject)) {
            throw new InvalidArgumentException('Parameter should be an object of type SetaPDF_Core_Type_IndirectObject.');
        }

        $this->_objectId = $value->getObjectId();
        $this->_gen = $value->getGen();

        if (isset($this->_observed))
            $this->notify();
    }

    /**
     * Get the indirect object.
     *
     * @return null|SetaPDF_Core_Type_IndirectObject
     * @throws SetaPDF_Core_Type_IndirectReference_Exception
     */
    public function getValue()
    {
        $document = $this->getOwnerPdfDocument();
        if (null === $document) {
            throw new SetaPDF_Core_Type_IndirectReference_Exception(
                'Automated resolving of object chains are only possible if a document is attached to the value.'
            );
        }

        try {
            return $document->resolveIndirectObject($this->_objectId, $this->_gen);
        } catch (SetaPDF_Core_Document_ObjectNotDefinedException $e) {
            return null;
        }
    }

    /**
     * Returns the type as a formatted PDF string.
     *
     * @param SetaPDF_Core_Document $pdfDocument
     * @return string
     */
    public function toPdfString(SetaPDF_Core_Document $pdfDocument)
    {
        try {
            $id = $pdfDocument->addIndirectObjectReferenceWritten($this);

            return ' ' . $id[0] . ' ' . $id[1] . ' R';
            // If the reference refers to a null object
        } catch (SetaPDF_Core_Document_ObjectNotFoundException $e) {
            return ' null';
        }
    }

    /**
     * Writes the type as a formatted PDF string to the document.
     *
     * @param SetaPDF_Core_Document $pdfDocument
     */
    public function writeTo(SetaPDF_Core_Document $pdfDocument)
    {
        $pdfDocument->write($this->toPdfString($pdfDocument));
    }

    /**
     * Release objects/memory.
     *
     * @see SetaPDF_Core_Type_AbstractType::cleanUp()
     */
    public function cleanUp()
    {
        if (!isset($this->_observed)) {
            $this->_owner = null;
        }
    }

    /**
     * Converts the PDF data type to a PHP data type and returns it.
     *
     * @see SetaPDF_Core_Type_AbstractType::toPhp()
     * @return array
     */
    public function toPhp()
    {
        return array(
            'objectId' => $this->_objectId,
            'generation' => $this->_gen
        );
    }
}