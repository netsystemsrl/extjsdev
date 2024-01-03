<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Uri.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class representing an URI action
 *
 * Resolve a uniform resource identifier.
 * See PDF 32000-1:2008 - 12.6.4.7
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_Action_Uri extends SetaPDF_Core_Document_Action
{
    /**
     * Create an URI Action dictionary.
     *
     * @param string|SetaPDF_Core_Type_String $uri
     * @return SetaPDF_Core_Type_Dictionary
     * @throws InvalidArgumentException
     */
    static public function createActionDictionary($uri)
    {
        if (is_scalar($uri)) {
            $uri = new SetaPDF_Core_Type_String($uri);
        }

        if (!($uri instanceof SetaPDF_Core_Type_StringValue)) {
            throw new InvalidArgumentException('The $uri parameter has to be a PDF string.');
        }

        $dictionary = new SetaPDF_Core_Type_Dictionary();
        $dictionary->offsetSet('S', new SetaPDF_Core_Type_Name('URI', true));
        $dictionary->offsetSet('URI', $uri);

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

        if (!$dictionary->offsetExists('S') || $dictionary->getValue('S')->ensure()->getValue() !== 'URI') {
            throw new InvalidArgumentException('The S entry in a URI action shall be "URI".');
        }

        if (!$dictionary->offsetExists('URI') ||
            !($dictionary->offsetGet('URI')->ensure() instanceof SetaPDF_Core_Type_StringValue)
        ) {
            throw new InvalidArgumentException('Missing or incorrect type of URI entry in URI action dictionary.');
        }

        parent::__construct($objectOrDictionary);
    }

    /**
     * Get the URI.
     *
     * @return string
     */
    public function getUri()
    {
        return $this->_actionDictionary->getValue('URI')->ensure(true)->getValue();
    }

    /**
     * Set the URI.
     *
     * @param string $uri
     */
    public function setUri($uri)
    {
        $this->_actionDictionary->getValue('URI')->ensure(true)->setValue($uri);
    }

    // TODO: Implement methods for "IsMap" key 
}