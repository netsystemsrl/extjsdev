<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: JavaScript.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Class representing a JavaScript action
 *
 * Execute a JavaScript script.
 * See PDF 32000-1:2008 - 12.6.4.16
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_Action_JavaScript extends SetaPDF_Core_Document_Action
{
    /**
     * Create a JavaScript Action dictionary.
     *
     * @param string|SetaPDF_Core_Type_String|SetaPDF_Core_Type_HexString|SetaPDF_Core_Type_Stream $javaScript
     * @return SetaPDF_Core_Type_Dictionary
     * @throws InvalidArgumentException
     */
    static public function createActionDictionary($javaScript)
    {
        if (is_scalar($javaScript)) {
            $javaScript = new SetaPDF_Core_Type_String($javaScript);
        }

        if (!($javaScript instanceof SetaPDF_Core_Type_StringValue) &&
            !($javaScript instanceof SetaPDF_Core_Type_Stream)
        ) {
            throw new InvalidArgumentException(
                sprintf('Incorrect object type (%s) for JS entry in JavaScript action dictionary.' . get_class($javaScript))
            );
        }

        $dictionary = new SetaPDF_Core_Type_Dictionary();
        $dictionary->offsetSet('S', new SetaPDF_Core_Type_Name('JavaScript', true));
        $dictionary->offsetSet('JS', $javaScript);

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

        if (!$dictionary->offsetExists('S') || $dictionary->getValue('S')->getValue() !== 'JavaScript') {
            throw new InvalidArgumentException('The S entry in a JavaScript action shall be "JavaScript".');
        }

        if (!$dictionary->offsetExists('JS')) {
            throw new InvalidArgumentException('Missing JS entry in JavaScript action dictionary.');
        }

        $js = $dictionary->getValue('JS')->ensure();
        if (!($js instanceof SetaPDF_Core_Type_StringValue) &&
            !($js instanceof SetaPDF_Core_Type_Stream)
        ) {
            throw new InvalidArgumentException(
                sprintf('Incorrect object type (%s) for JS entry in JavaScript action dictionary.' . get_class($js))
            );
        }

        parent::__construct($objectOrDictionary);
    }

    /**
     * Get the JavaScript code.
     *
     * @return string
     */
    public function getJavaScript()
    {
        $js = $this->_actionDictionary->getValue('JS')->ensure();

        if ($js instanceof SetaPDF_Core_Type_Stream) {
            return $js->getStream();
        }

        return $js->getValue();
    }

    /**
     * Set the JavaScript code.
     *
     * @param string $javaScript
     */
    public function setJavaScript($javaScript)
    {
        $js = $this->_actionDictionary->getValue('JS')->ensure();

        if ($js instanceof SetaPDF_Core_Type_Stream) {
            $js->setStream($javaScript);
            return;
        }

        $js->setValue($javaScript);
    }
}