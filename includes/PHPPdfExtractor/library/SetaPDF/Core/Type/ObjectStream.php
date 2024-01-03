<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Type
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: ObjectStream.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Class representing an object stream object.
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Type
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Type_ObjectStream extends SetaPDF_Core_Type_Stream
implements SetaPDF_Core_Type_Owner
{
    /**
     * The stream parser instance.
     *
     * @var SetaPDF_Core_Parser_Pdf
     */
    private $_parser;

    /**
     * An array of object offsets in the stream keyed by object ids.
     *
     * @var array
     */
    private $_objectOffsets = array();

    /**
     * The document instance to which this object stream belongs to.
     *
     * @var SetaPDF_Core_Type_Owner
     */
    private $_owner;

    /**
     * Defines if a inner object had triggered a change to invalid the state of this object stream.
     *
     * @var bool
     */
    private $_valid = true;

    /**
     * Release memory/cycled references.
     */
    public function cleanUp()
    {
        if (null !== $this->_parser) {
            $this->_parser->cleanUp();
            $this->_parser = null;
        }
        parent::cleanUp();
    }

    /**
     * Set the owner instance.
     *
     * @param SetaPDF_Core_Type_Owner $owner
     */
    public function setOwner(SetaPDF_Core_Type_Owner $owner)
    {
        $this->_owner = $owner;
    }

    /**
     * Get the owner instance.
     *
     * @return SetaPDF_Core_Type_Owner
     */
    public function getOwner()
    {
        return $this->_owner;
    }

    /**
     * Get the document instance.
     *
     * @return SetaPDF_Core_Document
     */
    public function getOwnerPdfDocument()
    {
        return $this->_owner->getOwnerPdfDocument();
    }

    /**
     * Get the stream parser.
     *
     * @return SetaPDF_Core_Parser_Pdf
     */
    protected function _getParser()
    {
        if (null === $this->_parser ) {
            $dict = $this->getValue();
            $firstPos = $dict->getValue('First')->getValue();
            $this->_parser = new SetaPDF_Core_Parser_Pdf(
                new SetaPDF_Core_Reader_String(substr($this->getStream(), $firstPos))
            );
            $this->_parser->setOwner($this);
        }

        return $this->_parser;
    }

    /**
     * Get the offset value for a specific object id.
     *
     * @param integer $objectId
     * @return integer
     * @throws SetaPDF_Core_Document_ObjectNotFoundException
     */
    protected function _getObjectOffset($objectId)
    {
        $offsets = $this->getOffsets();

        if (!isset($offsets[$objectId])) {
            throw new SetaPDF_Core_Document_ObjectNotFoundException(
                sprintf('Position of object (%s) not found.', $objectId)
            );
        }

        return $offsets[$objectId];
    }

    /**
     * Get the offsets of all objects in this object stream.
     *
     * @return array
     */
    public function getOffsets()
    {
        if (count($this->_objectOffsets) === 0) {
            $dict = $this->getValue();
            $firstPos = $dict->getValue('First')->getValue();
            $objectCount = $dict->getValue('N')->getValue();

            $stream = $this->getStream();
            $pairs = rtrim(substr($stream, 0, $firstPos));
            $pairs = preg_split('/\s/', $pairs, $objectCount * 2, PREG_SPLIT_NO_EMPTY);

            $this->_objectOffsets = array();
            for ($i = 0; $i < count($pairs); $i += 2) {
                $this->_objectOffsets[(int)$pairs[$i]] = (int)$pairs[$i + 1];
            }
        }

        return $this->_objectOffsets;
    }

    /**
     * Resolves an indirect object in this object stream.
     *
     * @param integer $objectId
     * @return SetaPDF_Core_Type_IndirectObject
     * @throws SetaPDF_Core_Document_ObjectNotFoundException
     * @throws SetaPDF_Core_Exception
     */
    public function resolveIndirectObject($objectId)
    {
        $objectId = (int)$objectId;
        $parser = $this->_getParser();
        $parser->reset($this->_getObjectOffset($objectId));
        $value = $parser->readValue();

        $object = new SetaPDF_Core_Type_IndirectObject($value, $this, $objectId, 0);
        
        return $object;
    }

    /**
     * Triggered if a value of this object is changed. Forward this to the document in that case.
     *
     * A stream can only be observed by an indirect object.
     *
     * So let's check the observers for this type and forward it to its owning document instance
     * until we manage creation of object streams.
     *
     * @param SplSubject $SplSubject
     */
    public function update(SplSubject $SplSubject)
    {
        if (!isset($this->_observed)) {
            return;
        }

        if ($SplSubject instanceof SetaPDF_Core_Type_IndirectObject && $SplSubject->getOwner() === $this) {
            $this->_valid = false;
            $observers = $this->_observers;
            foreach ($observers AS $observer) {
                if ($observer instanceof SetaPDF_Core_Type_IndirectObject) {
                    $observer->getOwner()->update($SplSubject);
                } /* should never be reached
                else {
                    $observer->update($this);
                }*/
            }
        } else {
            $this->notify();
        }
    }

    /**
     * Checks wheter an object of this objects stream was changed or not.
     *
     * @return bool
     */
    public function isValid()
    {
        return $this->_valid;
    }
}