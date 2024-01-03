<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Parser
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: RawPdf.php 1105 2017-09-13 12:40:06Z jan.slabon $
 */

/**
 * A PDF parser for standard tokens.
 *
 * This class doesn't work with object instances but only returns simple array structures
 * with raw extraced PDF data.
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Parser
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Parser_RawPdf
{
    /**
     * A PDF type constant.
     *
     * @var integer
     */
    const TYPE_ARRAY = 1;

    /**
     * A PDF type constant.
     *
     * @var integer
     */
    const TYPE_BOOLEAN = 2;

    /**
     * A PDF type constant.
     *
     * @var integer
     */
    const TYPE_DICTIONARY = 3;

    /**
     * A PDF type constant.
     *
     * @var integer
     */
    const TYPE_HEX_STRING = 4;

    /**
     * A PDF type constant.
     *
     * @var integer
     */
    const TYPE_INDIRECT_OBJECT = 5;

    /**
     * A PDF type constant.
     *
     * @var integer
     */
    const TYPE_INDIRECT_REFERENCE = 6;

    /**
     * A PDF type constant.
     *
     * @var integer
     */
    const TYPE_NAME = 7;

    /**
     * A PDF type constant.
     *
     * @var integer
     */
    const TYPE_NULL = 8;

    /**
     * A PDF type constant.
     *
     * @var integer
     */
    const TYPE_NUMERIC = 9;

    /**
     * A PDF type constant.
     *
     * @var integer
     */
    const TYPE_STRING = 10;

    /**
     * A PDF type constant.
     *
     * @var integer
     */
    const TYPE_TOKEN = 11;

    /**
     * The reader class
     *
     * @var SetaPDF_Core_Reader_ReaderInterface
     */
    protected $_reader;

    /**
     * The tokenizer
     *
     * @var SetaPDF_Core_Tokenizer
     */
    protected $_tokenizer;

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Reader_ReaderInterface $reader
     */
    public function __construct(SetaPDF_Core_Reader_ReaderInterface $reader)
    {
        $this->_reader = $reader;
        $this->_tokenizer = new SetaPDF_Core_Tokenizer($this->_reader);
    }

    /**
     * Released memory and resources.
     */
    public function cleanUp()
    {
        $this->_tokenizer->cleanUp();
        $this->_tokenizer = null;
        $this->_reader = null;
    }

    /**
     * Set the reader object.
     *
     * @param SetaPDF_Core_Reader_ReaderInterface $reader
     */
    public function setReader(SetaPDF_Core_Reader_ReaderInterface $reader)
    {
        $this->_reader = $reader;

        /* Because reader is passed by reference we have to forward this
         * set-call to the tokenizer as well.
         * This issue is only reproducible by serializing and
         * deserializing a document object (Mantis #585).
         */
        $this->_tokenizer->setReader($reader);
    }

    /**
     * Get the reader object.
     *
     * @return SetaPDF_Core_Reader_ReaderInterface
     */
    public function getReader()
    {
        return $this->_reader;
    }

    /**
     * Get the tokenizer object.
     *
     * @return SetaPDF_Core_Tokenizer
     */
    public function getTokenizer()
    {
        return $this->_tokenizer;
    }

    /**
     * Get the next token.
     *
     * @return string
     */
    protected function _getNextToken()
    {
        $token = $this->_tokenizer->readToken();

        /**
         * We jump over a comment.
         * That type is not a real PDF object and will simple ignored.
         */
        if ('%' == $token) {
            $this->_reader->readLine();
            return $this->_getNextToken();
        }

        return $token;
    }

    /**
     * Reset the reader to a specific position.
     *
     * @param integer $pos
     */
    public function reset($pos = 0)
    {
        $this->_reader->reset($pos);
        $this->_tokenizer->clearStack();
    }

    /**
     * Skips tokens until a special token is found.
     *
     * This method can be used to e.g. jump over binary inline image data.
     *
     * @param string $token
     * @return bool
     */
    public function skipUntilToken($token)
    {
        $nextToken = $this->_getNextToken();
        while ($nextToken !== false && $nextToken !== $token) {
            $nextToken = $this->_getNextToken();
        }

        if ($nextToken)
            return true;

        return false;
    }

    /**
     * Read a value.
     *
     * @return array|false
     * @throws SetaPDF_Core_Parser_Pdf_InvalidTokenException
     * @throws SetaPDF_Core_Exception
     * @throws UnexpectedValueException
     */
    public function readValue()
    {
        if (false === ($token = $this->_getNextToken())) {
            return false;
        }

        return $this->_readValue($token);
    }

    /**
     * Read a value based on a token.
     *
     * @param string|null $token
     * @return array|false
     * @throws SetaPDF_Core_Parser_Pdf_InvalidTokenException
     * @throws SetaPDF_Core_Exception
     * @throws UnexpectedValueException
     */
    private function _readValue($token)
    {
        switch ($token) {
            case '(':
                $pos = $startPos = $this->_reader->getOffset();

                $openBrackets = 1;
                do {
                    $buffer = $this->_reader->getBuffer(false);
                    for ($length = strlen($buffer); $openBrackets != 0 && $pos < $length; $pos++) {
                        switch ($buffer[$pos]) {
                            case '(':
                                $openBrackets++;
                                break;
                            case ')':
                                $openBrackets--;
                                break;
                            case '\\':
                                $pos++;
                        }
                    }
                } while ($openBrackets !== 0 && $this->_reader->increaseLength());

                $result = substr($buffer, $startPos, $openBrackets + $pos - $startPos - 1);
                $this->_reader->setOffset($pos);

                return array(self::TYPE_STRING, $result);

            case '<';
                $bufferOffset = $this->_reader->getOffset();

                while (true) {
                    $buffer = $this->_reader->getBuffer(false);
                    $pos = strpos($buffer, '>', $bufferOffset);
                    if (false === $pos) {
                        if (!$this->_reader->increaseLength()) {
                            return false;
                        }
                        continue;
                    }

                    $result = substr($buffer, $bufferOffset, $pos - $bufferOffset);
                    $this->_reader->setOffset($pos + 1);

                    return array(self::TYPE_HEX_STRING, $result);
                }
                break;

            case '<<';
                $entries = array();

                while (($token = $this->_getNextToken()) !== '>>') {
                    if (($key = $this->_readValue($token)) === false) {
                        return false;
                    }

                    // Ensure the first value to be a Name object
                    if ($key[0] !== self::TYPE_NAME) {
                        $this->skipUntilToken('>>');
                        break;
                    }

                    if (($value = $this->readValue()) === false) {
                        return false;
                    }

                    // Catch missing value
                    if ($value[0] === self::TYPE_TOKEN && $value[1] == '>>') {
                        $entries[$key[1]] = array(self::TYPE_NULL);
                        break;
                    }

                    $entries[$key[1]] = $value;
                }

                return array(self::TYPE_DICTIONARY, $entries);

            case '[';
                $result = array();

                // Recurse into this function until we reach the end of the array.
                while (($token = $this->_getNextToken()) !== ']') {
                    if ($token === false || ($value = $this->_readValue($token)) === false) {
                        return false;
                    }

                    $result[] = $value;
                }

                return array(self::TYPE_ARRAY, $result);

            case '/':
                /* It is possible to contact the tokenizer directly, because
                 * the stack will only hold integers until the last element
                 */
                if ($this->_tokenizer->isCurrentByteRegularCharacter()) {
                    return array(self::TYPE_NAME, $this->_getNextToken());
                } else {
                    return array(self::TYPE_NAME, '');
                }

            default:
                if (!is_numeric($token)) {
                    switch ($token) {
                        case 'true':
                        case 'false':
                            return array(self::TYPE_BOOLEAN, 'true' === $token);

                        case 'null':
                            return array(self::TYPE_NULL);

                        default:
                            return array(self::TYPE_TOKEN, $token);

                    }

                } else {
                    return array(self::TYPE_NUMERIC, $token);
                }
        }
    }

    /**
     * Converts an array structure into an object structure.
     *
     * @param $data
     * @return SetaPDF_Core_Type_Array|SetaPDF_Core_Type_Boolean|SetaPDF_Core_Type_Dictionary|SetaPDF_Core_Type_HexString|SetaPDF_Core_Type_Name|SetaPDF_Core_Type_Null|SetaPDF_Core_Type_Numeric|SetaPDF_Core_Type_String|SetaPDF_Core_Type_Token
     */
    public function convertToObject($data)
    {
        switch ($data[0]) {
            case self::TYPE_NUMERIC:
                return new SetaPDF_Core_Type_Numeric($data[1]);

            case self::TYPE_TOKEN:
                return new SetaPDF_Core_Type_Token($data[1]);

            case self::TYPE_ARRAY:
                $entries = array_map(array($this, 'convertToObject'), $data[1]);
                return new SetaPDF_Core_Type_Array($entries);

            case self::TYPE_STRING:
                return new SetaPDF_Core_Type_String($data[1], true);

            case self::TYPE_HEX_STRING:
                return new SetaPDF_Core_Type_HexString($data[1], false);

            case self::TYPE_NAME:
                return new SetaPDF_Core_Type_Name($data[1], true);

            case self::TYPE_DICTIONARY:
                $entries = array();
                foreach ($data[1] AS $key => $value) {
                    $entries[] = new SetaPDF_Core_Type_Dictionary_Entry(
                        new SetaPDF_Core_Type_Name($key, true),
                        $this->convertToObject($value)
                    );
                }

                return new SetaPDF_Core_Type_Dictionary($entries);

            case self::TYPE_BOOLEAN:
                return new SetaPDF_Core_Type_Boolean($data[1]);

            case self::TYPE_NULL:
                return new SetaPDF_Core_Type_Null();
        }
    }
}