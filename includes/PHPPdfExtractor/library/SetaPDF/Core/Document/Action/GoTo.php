<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: GoTo.php 1090 2017-08-25 06:30:07Z jan.slabon $
 */

/**
 * Class representing a Go-To action
 *
 * Go to a destination in the current document.
 * See PDF 32000-1:2008 - 12.6.4.2
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_Action_GoTo extends SetaPDF_Core_Document_Action
{
    /**
     * Create a Go-To Action dictionary.
     *
     * @param string|SetaPDF_Core_Type_Array|SetaPDF_Core_Type_Name|SetaPDF_Core_Type_String|SetaPDF_Core_Document_Destination $destination
     * @return SetaPDF_Core_Type_Dictionary
     * @throws InvalidArgumentException
     */
    static public function createActionDictionary($destination)
    {
        if (is_scalar($destination)) {
            $destination = new SetaPDF_Core_Type_String($destination);
        } elseif ($destination instanceof SetaPDF_Core_Document_Destination) {
            $destination = $destination->getDestinationArray();
        }

        if (!($destination instanceof SetaPDF_Core_Type_Array) &&
            !($destination instanceof SetaPDF_Core_Type_Name) &&
            !($destination instanceof SetaPDF_Core_Type_StringValue)
        ) {
            throw new InvalidArgumentException('The $destination parameter has to be a PDF string, name or destination array.');
        }

        $dictionary = new SetaPDF_Core_Type_Dictionary();
        $dictionary->offsetSet('S', new SetaPDF_Core_Type_Name('GoTo', true));
        $dictionary->offsetSet('D', $destination);

        return $dictionary;
    }

    /**
     * The constructor.
     *
     * @param bool|int|float|string|SetaPDF_Core_Type_Dictionary|SetaPDF_Core_Type_IndirectObjectInterface|SetaPDF_Core_Document_Destination $objectOrDictionary
     * @throws InvalidArgumentException
     */
    public function __construct($objectOrDictionary)
    {
        $dictionary = $objectOrDictionary instanceof SetaPDF_Core_Type_AbstractType
            ? $objectOrDictionary->ensure(true)
            : $objectOrDictionary;

        if (!($dictionary instanceof SetaPDF_Core_Type_Dictionary)) {
            $dictionary = $objectOrDictionary = self::createActionDictionary($dictionary);
        }

        if (!$dictionary->offsetExists('S') || $dictionary->getValue('S')->getValue() !== 'GoTo') {
            throw new InvalidArgumentException('The S entry in a go-to action shall be "GoTo".');
        }

        if (!$dictionary->offsetExists('D') &&
            !($dictionary->offsetExists('D')->ensure() instanceof SetaPDF_Core_Type_Array) &&
            !($dictionary->offsetExists('D')->ensure() instanceof SetaPDF_Core_Type_Name) &&
            !($dictionary->offsetExists('D')->ensure() instanceof SetaPDF_Core_Type_StringValue)
        ) {
            throw new InvalidArgumentException('Missing or incorrect type of D entry in go-to action dictionary.');
        }

        parent::__construct($objectOrDictionary);
    }

    /**
     * Get the destination object.
     *
     * @param SetaPDF_Core_Document $document
     * @throws BadMethodCallException
     * @return boolean|SetaPDF_Core_Document_Destination
     */
    public function getDestination(SetaPDF_Core_Document $document = null)
    {
        $dest = $this->_actionDictionary->offsetGet('D')->ensure();
        if ($dest instanceof SetaPDF_Core_Type_StringValue || $dest instanceof SetaPDF_Core_Type_Name) {
            if ($document === null) {
                throw new BadMethodCallException('To resolve a named destination the $document parameter has to be set.');
            }

            return SetaPDF_Core_Document_Destination::findByName($document, $dest->getValue());
        }

        return new SetaPDF_Core_Document_Destination($dest);
    }

    /**
     * Set the destination.
     *
     * @param string|SetaPDF_Core_Type_Array|SetaPDF_Core_Type_Name|SetaPDF_Core_Type_String|SetaPDF_Core_Document_Destination $destination
     * @throws InvalidArgumentException
     */
    public function setDestination($destination)
    {
        if (is_scalar($destination)) {
            $destination = new SetaPDF_Core_Type_String($destination);
        } elseif ($destination instanceof SetaPDF_Core_Document_Destination) {
            $destination = $destination->getDestinationArray();
        }

        if (!($destination instanceof SetaPDF_Core_Type_Array) &&
            !($destination instanceof SetaPDF_Core_Type_Name) &&
            !($destination instanceof SetaPDF_Core_Type_StringValue)
        ) {
            throw new InvalidArgumentException('The $destination parameter has to be a PDF string, name or destination array.');
        }

        $this->_actionDictionary->offsetSet('D', $destination);
    }
}