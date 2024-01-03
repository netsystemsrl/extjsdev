<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: GoToR.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Class representing a remote go-to action.
 *
 * Go to a destination in another PDF file instead of the current file.
 * See PDF 32000-1:2008 - 12.6.4.3
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_Action_GoToR extends SetaPDF_Core_Document_Action
{
    /**
     * Create a remote go-to Action dictionary.
     *
     * @param string|SetaPDF_Core_Type_Array|SetaPDF_Core_Type_Name|SetaPDF_Core_Type_String $destination
     * @param string|SetaPDF_Core_FileSpecification|SetaPDF_Core_Type_Dictionary $file The path to the file, a file
     *                                                                                 specification or a dictionary
     *                                                                                 representing a file specification.
     * @return SetaPDF_Core_Type_Dictionary
     * @throws InvalidArgumentException
     */
    static public function createActionDictionary($destination, $file)
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
        $dictionary->offsetSet('S', new SetaPDF_Core_Type_Name('GoToR', true));
        $dictionary->offsetSet('D', $destination);

        if (!($file instanceof SetaPDF_Core_FileSpecification)) {
            $file = new SetaPDF_Core_FileSpecification($file);
        }
        $dictionary->offsetSet('F', $file->getDictionary());

        return $dictionary;
    }

    /**
     * The constructor.
     *
     * @param bool|int|float|string|SetaPDF_Core_Type_Dictionary|SetaPDF_Core_Type_IndirectObjectInterface $objectOrDictionary
     * @throws InvalidArgumentException
     */
    public function __construct($objectOrDictionary)
    {
        $dictionary = $objectOrDictionary instanceof SetaPDF_Core_Type_AbstractType
            ? $objectOrDictionary->ensure(true)
            : $objectOrDictionary;

        if (!($dictionary instanceof SetaPDF_Core_Type_Dictionary)) {
            $args = func_get_args();
            $dictionary = $objectOrDictionary = call_user_func_array(
                array('SetaPDF_Core_Document_Action_GoToR', 'createActionDictionary'),
                $args
            );
            unset($args);
        }

        if (!$dictionary->offsetExists('S') || $dictionary->getValue('S')->getValue() !== 'GoToR') {
            throw new InvalidArgumentException('The S entry in a go-to action shall be "GoToR".');
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

    /**
     * Set the flag specifying whether to open the destination document in a new window.
     *
     * @param boolean|null $newWindow Wether to open the destination in a new window or not. To use the reader
     *                                preferences remove this flag by passing "null".
     */
    public function setNewWindow($newWindow)
    {
        if (null === $newWindow) {
            $this->_actionDictionary->offsetUnset('NewWindow');
            return;
        }

        $this->_actionDictionary['NewWindow'] = new SetaPDF_Core_Type_Boolean($newWindow);
    }

    /**
     * Get the flag specifying whether to open the destination document in a new window.
     *
     * @return boolean|null A boolean value if specified. Otherwise "null".
     */
    public function getNewWindow()
    {
        if (!$this->_actionDictionary->offsetExists('NewWindow')) {
            return null;
        }

        return $this->_actionDictionary['NewWindow']->ensure()->getValue();
    }

    /**
     * Set the file in which the destination shall be located.
     *
     * @param SetaPDF_Core_FileSpecification|string $file
     */
    public function setFile($file)
    {
        if (!$file instanceof SetaPDF_Core_FileSpecification) {
            $file = new SetaPDF_Core_FileSpecification($file);
        }

        $this->_actionDictionary['F'] = $file->getDictionary();
    }

    /**
     * Get the file in which the destination shall be located.
     *
     * @return bool|SetaPDF_Core_FileSpecification
     */
    public function getFile()
    {
        if (!$this->_actionDictionary->offsetExists('F')) {
            return false;
        }

        return new SetaPDF_Core_FileSpecification($this->_actionDictionary['F']->ensure());
    }
}