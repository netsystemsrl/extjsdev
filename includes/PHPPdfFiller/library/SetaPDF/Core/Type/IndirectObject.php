<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Type
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: IndirectObject.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class representing an indirect object
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Type
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Type_IndirectObject
    extends SetaPDF_Core_Type_AbstractType
    implements SplObserver, SetaPDF_Core_Type_IndirectObjectInterface, SetaPDF_Core_Type_Owner
{
    /**
     * The value of the indirect object
     *
     * @var SetaPDF_Core_Type_AbstractType
     */
    protected $_value;

    /**
     * The initial object id
     *
     * @var int
     */
    protected $_objectId;

    /**
     * The initial generation number
     *
     * @var integer
     */
    protected $_gen = 0;

    /**
     * The owner object
     *
     * @var SetaPDF_Core_Type_Owner
     */
    protected $_owner;

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
     * @param null|SetaPDF_Core_Type_AbstractType $value
     * @param SetaPDF_Core_Type_Owner $owner
     * @param integer $objectId
     * @param integer $gen
     * @throws InvalidArgumentException
     */
    public function __construct(
        SetaPDF_Core_Type_AbstractType $value = null,
        SetaPDF_Core_Type_Owner $owner = null,
        $objectId = 0,
        $gen = 0
    )
    {
        unset($this->_observed);

        if (null !== $value) {
            $this->setValue($value);
        }

        if ($objectId <= 0) {
            throw new InvalidArgumentException('Object Id must be numeric and greater than 0');
        }
        $this->_objectId = (int)$objectId;
        $this->_gen = (int)$gen;

        $ownerPdfDocument = $owner->getOwnerPdfDocument();
        if (!($ownerPdfDocument instanceof SetaPDF_Core_Document)) {
            throw new InvalidArgumentException(
                '$owner needs to return a SetaPDF_Core_Document in its getPdfDocument() method.'
            );
        }

        $this->_owner = $owner;

        // Is this object or a reference already known?
        $this->_objectIdent = $ownerPdfDocument->getInstanceIdent()
            . '-' . $this->_objectId
            . '-' . $this->_gen;
    }

    /**
     * Implementation of __clone().
     *
     * This has to be used with care, because a single object can only be used one time per document.
     * You only should use this, if you want to extract an object of an existing document and
     * reuse it changed in another one.
     *
     * The internal object-, generation number and document references are kept.
     *
     * At the end several objects will have the same object identifier!!
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
        $ownerPdfDocument = $this->getOwnerPdfDocument();
        if ($document->getInstanceIdent() === $ownerPdfDocument->getInstanceIdent())
            return $this;

        $objectData = $document->objectRegistered($this);
        if (false !== $objectData) {
            $object = $document->resolveIndirectObject($objectData[0], $objectData[1]);
            if ($object->getOwnerPdfDocument()->getInstanceIdent() === $document->getInstanceIdent())
                return $object;
        }

        $clone = clone $this;
        $objectData = $document->getIdForObject($clone);
        $clone->_objectId = $objectData[0];
        $clone->_gen = $objectData[1];
        $clone->_owner = $document;
        $document->createNewObject($clone);
        $clone->_value = $clone->_value->deepClone($document);

        return $clone;
    }

    /**
     * Implementation of __sleep().
     *
     * We also return observers for this object because it is needed if the object is unserialized as part
     * of a document.
     *
     * @see SetaPDF_Core_Type_AbstractType::__sleep()
     * @internal
     */
    public function __sleep()
    {
        return array_keys(get_object_vars($this));
    }

    /**
     * Implementation of __wakeup-
     *
     * Forward/reinit observation after unserialization.
     *
     * @see SetaPDF_Core_Type_AbstractType::__wakeup()
     * @internal
     */
    public function __wakeup()
    {
        if ($this->_observed !== false) {
            // to force re-observation
            $this->_value->attach($this);
        } else {
            unset($this->_observed);
        }
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
     * Observe the object if an owner document is attached.
     */
    public function observe()
    {
        if (null !== $this->_owner) {
            $this->attach($this->_owner);
        }

        return $this;
    }

    /**
     * Add an observer to the object.
     *
     * Implementation of the Observer Pattern. This overwritten method forwards the attach()-call
     * to the value of the indirect object.
     *
     * @param SplObserver $observer
     */
    public function attach(SplObserver $observer)
    {
        $isObserved = isset($this->_observed);
        parent::attach($observer);

        if (false === $isObserved && $this->_value instanceof SetaPDF_Core_Type_AbstractType) {
            $this->_value->attach($this);
        }
    }

    /**
     * Triggered if a value of this object is changed.
     *
     * Forward this to other observing objects.
     *
     * @param SplSubject $SplSubject
     */
    public function update(SplSubject $SplSubject)
    {
        if (isset($this->_observed))
            $this->notify();
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
     * Sets the value of the PDF type.
     *
     * @param SetaPDF_Core_Type_AbstractType $value
     * @throws InvalidArgumentException
     */
    public function setValue($value)
    {
        if (!($value instanceof SetaPDF_Core_Type_AbstractType)) {
            throw new InvalidArgumentException('Parameter should be a value of SetaPDF_Core_Type_AbstractType');
        }

        /** indirect objects are reduce to a reference */
        if ($value instanceof SetaPDF_Core_Type_IndirectObject)
            $value = new SetaPDF_Core_Type_IndirectReference($value, null, $this->getOwnerPdfDocument());

        /** observe */
        if (null !== $this->_value && isset($this->_observed)) {
            $this->_value->detach($this);
        }

        $this->_value = $value;

        if (isset($this->_observed)) {
            $this->_value->attach($this);
            $this->notify();
        }
    }

    /**
     * Gets the PDF value.
     *
     * @return SetaPDF_Core_Type_AbstractType
     */
    public function getValue()
    {
        return $this->_value;
    }

    /**
     * Ensures the access to the value.
     *
     * This method automatically forwards the request to the value.
     *
     * @param boolean|null $forceObservation
     * @return SetaPDF_Core_Type_AbstractType
     */
    public function ensure($forceObservation = null)
    {
        return $this->_value->ensure($forceObservation);
    }

    /**
     * Returns the type as a formatted PDF string.
     *
     * @param SetaPDF_Core_Document $pdfDocument
     * @return string
     */
    public function toPdfString(SetaPDF_Core_Document $pdfDocument)
    {
        $id = $pdfDocument->getIdForObject($this);
        return $id[0] . ' ' . $id[1] . " obj\n"
            . (null !== $this->_value ? $this->_value->toPdfString($pdfDocument) : 'null')
            . "\nendobj\n";
    }

    /**
     * Writes the type as a formatted PDF string to the document.
     *
     * @param SetaPDF_Core_Document $pdfDocument
     */
    public function writeTo(SetaPDF_Core_Document $pdfDocument)
    {
        $id = $pdfDocument->getIdForObject($this);
        $pdfDocument->write($id[0] . ' ' . $id[1] . " obj\n");
        if (null !== $this->_value) {
            $this->_value->writeTo($pdfDocument);
        } else {
            $pdfDocument->write('null');
        }
        $pdfDocument->write("\nendobj\n");
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

            if (null !== $this->_value) {
                $this->_value->detach($this);
                $this->_value->cleanUp();
            }
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
            'generation' => $this->_gen,
            'value' => $this->_value->toPhp()
        );
    }
}