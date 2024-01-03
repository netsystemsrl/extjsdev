<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Named.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Class representing a Named action
 *
 * Execute an action predefined by the conforming reader.
 * See PDF 32000-1:2008 - 12.6.4.11
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_Action_Named extends SetaPDF_Core_Document_Action
{
    /**
     * Name defined in PDF 32000-1:2008
     *
     * @var string
     */
    const NEXT_PAGE = 'NextPage';

    /**
     * Name defined in PDF 32000-1:2008
     *
     * @var string
     */
    const PREV_PAGE = 'PrevPage';

    /**
     * Name defined in PDF 32000-1:2008
     *
     * @var string
     */
    const FIRST_PAGE = 'FirstPage';

    /**
     * Name defined in PDF 32000-1:2008
     *
     * @var string
     */
    const LAST_PAGE = 'LastPage';

    /* Acrobat specific */

    /**
     * Additional names used by Adobe Acrobat: Print
     *
     * @var string
     */
    const PRINT_DOCUMENT = 'Print';

    /**
     * Additional names used by Adobe Acrobat
     *
     * @var string
     */
    const GO_TO_PAGE = 'GoToPage';

    /**
     * Additional names used by Adobe Acrobat: Previous View
     *
     * @var string
     */
    const GO_BACK = 'GoBack';

    /**
     * Create a named action dictionary.
     *
     * @param string $name
     * @return SetaPDF_Core_Type_Dictionary
     * @throws InvalidArgumentException
     */
    static public function createActionDictionary($name)
    {
        $dictionary = new SetaPDF_Core_Type_Dictionary();
        $dictionary->offsetSet('S', new SetaPDF_Core_Type_Name('Named', true));
        $dictionary->offsetSet('N', new SetaPDF_Core_Type_Name($name));

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

        if (!$dictionary->offsetExists('S') || $dictionary->getValue('S')->getValue() !== 'Named') {
            throw new InvalidArgumentException('The S entry in a named action shall be "Named".');
        }

        if (!$dictionary->offsetExists('N') || !($dictionary->getValue('N') instanceof SetaPDF_Core_Type_Name)) {
            throw new InvalidArgumentException('Missing or incorrect type of N entry in named action dictionary.');
        }

        parent::__construct($objectOrDictionary);
    }

    /**
     * Get the name.
     *
     * @return string
     */
    public function getName()
    {
        return $this->_actionDictionary->getValue('N')->ensure(true)->getValue();
    }

    /**
     * Set the name.
     *
     * @param string $name
     */
    public function setName($name)
    {
        $this->_actionDictionary->getValue('N')->ensure(true)->setValue($name);
    }

}