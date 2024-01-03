<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Launch.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class representing a Launch action
 *
 * Launch an application, usually to open a file.
 * See PDF 32000-1:2008 - 12.6.4.5
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_Action_Launch extends SetaPDF_Core_Document_Action
{
    /**
     * Create a Launch Action dictionary.
     *
     * @param string $fileSpecification
     * @param null|boolean $newWindow
     * @return SetaPDF_Core_Type_Dictionary
     * @throws InvalidArgumentException
     */
    static public function createActionDictionary($fileSpecification, $newWindow = null)
    {
        if ($fileSpecification instanceof SetaPDF_Core_FileSpecification) {
            $fileSpecification = $fileSpecification->getDictionary();
        }

        if (!$fileSpecification instanceof SetaPDF_Core_Type_Dictionary) {
            $fileSpecification = SetaPDF_Core_FileSpecification::createDictionary($fileSpecification);
        }

        $dictionary = new SetaPDF_Core_Type_Dictionary();
        $dictionary->offsetSet('S', new SetaPDF_Core_Type_Name('Launch', true));
        $dictionary->offsetSet('F', $fileSpecification);

        if ($newWindow !== null) {
            $dictionary->offsetSet('NewWindow', new SetaPDF_Core_Type_Boolean($newWindow));
        }

        return $dictionary;
    }

    /**
     * The constructor.
     *
     * @param string|SetaPDF_Core_Type_Dictionary|SetaPDF_Core_Type_IndirectObjectInterface $objectOrDictionary
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
                array('SetaPDF_Core_Document_Action_Launch', 'createActionDictionary'),
                $args
            );
            unset($args);
        }

        if (!$dictionary->offsetExists('S') || $dictionary->getValue('S')->getValue() !== 'Launch') {
            throw new InvalidArgumentException('The S entry in a launch action shall be "Launch".');
        }

        parent::__construct($objectOrDictionary);
    }

    /**
     * Get the file specification.
     *
     * @return string
     */
    public function getFileSpecification()
    {
        $f = $this->_actionDictionary->getValue('F')->ensure(true);
        if ($f instanceof SetaPDF_Core_Type_StringValue) {
            $this->_actionDictionary->setValue('F', new SetaPDF_Core_Type_Dictionary(array(
                'Type' => new SetaPDF_Core_Type_Name('Filespec', true),
                'F' => new SetaPDF_Core_Type_String($f->getValue()))
            ));
        }

        return new SetaPDF_Core_FileSpecification(
            $this->_actionDictionary->getValue('F')->ensure(true)
        );
    }

    /**
     * Set the file specification.
     *
     * @param string $fileSpecification
     */
    public function setFileSpecification($fileSpecification)
    {
        if (!$fileSpecification instanceof SetaPDF_Core_FileSpecification) {
            $fileSpecification = new SetaPDF_Core_FileSpecification($fileSpecification);
        }

        $this->_actionDictionary->offsetSet('F', $fileSpecification->getDictionary());
    }

    /**
     * Get the NewWindow flag specifying whether to open the destination document in a new window.
     *
     * @return null|boolean
     */
    public function getNewWindow()
    {
        if (!$this->_actionDictionary->offsetExists('NewWindow')) {
            return null;
        }

        return $this->_actionDictionary->getValue('NewWindow')->ensure(true)->getValue();
    }

    /**
     * Set the NewWindow flag specifying whether to open the destination document in a new window.
     *
     * @param boolean $newWindow
     */
    public function setNewWindow($newWindow)
    {
        if (null === $newWindow) {
            $this->_actionDictionary->offsetUnset('NewWindow');
            return;
        }

        $this->_actionDictionary->offsetSet('NewWindow', new SetaPDF_Core_Type_Boolean($newWindow));
    }
}