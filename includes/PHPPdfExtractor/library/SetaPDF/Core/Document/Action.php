<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Action.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Class representing a PDF action
 *
 * See PDF 32000-1:2008 - 12.6
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_Action
{
    /**
     * The action dictionary
     *
     * @var SetaPDF_Core_Type_Dictionary
     */
    protected $_actionDictionary;

    /**
     * @var SetaPDF_Core_Type_IndirectObjectInterface
     */
    protected $_indirectReference;

    /**
     * Creates an action object by an action dictionary.
     *
     * @param SetaPDF_Core_Type_AbstractType $objectOrDictionary
     * @throws InvalidArgumentException
     * @return SetaPDF_Core_Document_Action
     */
    static public function byObjectOrDictionary(SetaPDF_Core_Type_AbstractType $objectOrDictionary)
    {
        /**
         * @var $dictionary SetaPDF_Core_Type_Dictionary
         */
        $dictionary = $objectOrDictionary->ensure(true);

        if (!$dictionary->offsetExists('S')) {
            throw new InvalidArgumentException('An action dictionary needs at least an S entry.');
        }

        $sValue = $dictionary->getValue('S')->ensure()->getValue();

        switch ($sValue) {
            case 'GoTo':
                return new SetaPDF_Core_Document_Action_GoTo($objectOrDictionary);

            case 'JavaScript':
                return new SetaPDF_Core_Document_Action_JavaScript($objectOrDictionary);

            case 'Named':
                return new SetaPDF_Core_Document_Action_Named($objectOrDictionary);

            case 'URI':
                return new SetaPDF_Core_Document_Action_Uri($objectOrDictionary);

            case 'Launch':
                return new SetaPDF_Core_Document_Action_Launch($objectOrDictionary);

            case 'SubmitForm':
                return new SetaPDF_Core_Document_Action_SubmitForm($objectOrDictionary);

            case 'ResetForm':
                return new SetaPDF_Core_Document_Action_ResetForm($objectOrDictionary);

            case 'ImportData':
                return new SetaPDF_Core_Document_Action_ImportData($objectOrDictionary);

            default:
                return new self($objectOrDictionary);
        }
    }

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Type_AbstractType $objectOrDictionary
     * @throws InvalidArgumentException
     */
    public function __construct(
        SetaPDF_Core_Type_AbstractType $objectOrDictionary
    )
    {
        if ($objectOrDictionary instanceof SetaPDF_Core_Type_IndirectObjectInterface)
            $this->_indirectReference = $objectOrDictionary;

        $objectOrDictionary = $objectOrDictionary->ensure();

        if (!$objectOrDictionary->offsetExists('S')) {
            throw new InvalidArgumentException('An action dictionary needs at least an S entry.');
        }

        $this->_actionDictionary = $objectOrDictionary;
    }

    /**
     * Set the indirect object of this annotation.
     *
     * @param SetaPDF_Core_Type_IndirectObjectInterface $indirectReference
     */
    public function setIndirectObject(SetaPDF_Core_Type_IndirectObjectInterface $indirectReference)
    {
        $this->_indirectReference = $indirectReference;
    }

    /**
     * Get the indirect object of this annotation or creates it in the specific document context.
     *
     * @param SetaPDF_Core_Document $document The document instance
     * @return SetaPDF_Core_Type_IndirectObjectInterface
     */
    public function getIndirectObject(SetaPDF_Core_Document $document = null)
    {
        if ($document !== null && $this->_indirectReference === null) {
            $this->_indirectReference = $document->createNewObject($this->getPdfValue());
        }

        return $this->_indirectReference;
    }

    /**
     * Gets the PDF value of the next entry.
     *
     * @return false|SetaPDF_Core_Type_Dictionary
     */
    public function getNext()
    {
        if (!$this->_actionDictionary->offsetExists('Next'))
            return false;

        return $this->_actionDictionary->getValue('Next')->ensure();
    }

    /**
     * Set the next action which should be executed after this one.
     *
     * @param SetaPDF_Core_Type_Dictionary|SetaPDF_Core_Document_Action $next
     */
    public function setNext($next)
    {
        if ($next instanceof self)
            $next = $next->getActionDictionary();

        if (!$this->_actionDictionary->offsetExists('Next')) {
            $this->_actionDictionary->offsetSet('Next', $next);
            return;
        }

        $this->_actionDictionary->offsetGet('Next')->setValue($next);
    }

    /**
     * Add an additional action to the next value of this action.
     *
     * @param SetaPDF_Core_Type_Dictionary|SetaPDF_Core_Document_Action $next
     */
    public function addNext($next)
    {
        if ($next instanceof self)
            $next = $next->getActionDictionary();

        $currentNext = $this->getNext();
        if ($currentNext && !($currentNext instanceof SetaPDF_Core_Type_Array)) {
            $currentNext = new SetaPDF_Core_Type_Array(array(clone $currentNext));
            $this->_actionDictionary->offsetGet('Next')->setValue($currentNext);
        }

        if (false === $currentNext) {
            $this->setNext($next);
            return;
        }

        $currentNext->push($next);
    }

    /**
     * Get the action dictionary.
     *
     * @return SetaPDF_Core_Type_Dictionary
     */
    public function getActionDictionary()
    {
        return $this->_actionDictionary;
    }

    /**
     * Get the PDF value of this action.
     *
     * @return SetaPDF_Core_Type_Dictionary
     */
    public function getPdfValue()
    {
        return $this->getActionDictionary();
    }

    /**
     * Get the action type specified in the S key.
     *
     * @return string
     */
    public function getType()
    {
        return $this->getActionDictionary()->getValue('S')->ensure()->getValue();
    }
}