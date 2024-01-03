<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: ImportData.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Class representing a import-data action
 *
 * Import field values from a file.
 * See PDF 32000-1:2008 - 12.7.5.4 Import-Data Action
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_Action_ImportData extends SetaPDF_Core_Document_Action
{
    /**
     * Create a Named Action dictionary.
     *
     * @param string| $fileSpecification
     * @return SetaPDF_Core_Type_Dictionary
     * @throws InvalidArgumentException
     */
    static public function createActionDictionary($fileSpecification)
    {
        $dictionary = new SetaPDF_Core_Type_Dictionary();
        $dictionary->offsetSet('S', new SetaPDF_Core_Type_Name('ImportData', true));

        if (!$fileSpecification instanceof SetaPDF_Core_FileSpecification)
            $fileSpecification = new SetaPDF_Core_FileSpecification($fileSpecification);

        $dictionary->offsetSet('F', $fileSpecification->getDictionary());

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
            $dictionary = $objectOrDictionary = self::createActionDictionary($dictionary);
        }

        if (!$dictionary->offsetExists('S') || $dictionary->getValue('S')->getValue() !== 'ImportData') {
            throw new InvalidArgumentException('The S entry in a import-data action shall be "ImportData".');
        }

        if (!$dictionary->offsetExists('F')) {
            throw new InvalidArgumentException('Missing or incorrect type of F entry in import-data action dictionary.');
        }

        parent::__construct($objectOrDictionary);
    }

    /**
     * Get the file specification object.
     *
     * @return SetaPDF_Core_FileSpecification
     */
    public function getFileSpecification()
    {
        if (!$this->_actionDictionary->offsetExists('F'))
            return null;

        return new SetaPDF_Core_FileSpecification($this->_actionDictionary->getValue('F')->ensure(true));
    }

    /**
     * Seta a file specification object.
     *
     * @param string|SetaPDF_Core_FileSpecification $fileSpecification
     */
    public function setFileSpecification($fileSpecification)
    {
        if (!$fileSpecification instanceof SetaPDF_Core_FileSpecification)
            $fileSpecification = new SetaPDF_Core_FileSpecification($fileSpecification);

        $this->_actionDictionary->offsetSet('F', $fileSpecification->getDictionary());
    }
}