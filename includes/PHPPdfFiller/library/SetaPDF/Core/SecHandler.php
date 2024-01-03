<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage SecHandler
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: SecHandler.php 1360 2019-08-16 10:06:25Z jan.slabon $
 */

/**
 * Main class for PDF security handlers
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage SecHandler
 * @license    https://www.setasign.com/ Commercial
 */
abstract class SetaPDF_Core_SecHandler
{
    /**
     * Standard Security Handler
     *
     * @var string
     */
    const STANDARD = 'standard';

    /**
     * Public Key Security Handler
     *
     * @var string
     */
    const PUB_KEY = 'publicKey';

    /**
     * Encryption constant
     *
     * @var string
     */
    const ARCFOUR = 4;

    /**
     * Encryption constant
     *
     * @var string
     */
    const ARCFOUR_40 = 12; // 8 | 4

    /**
     * Encryption constant
     *
     * @var string
     */
    const ARCFOUR_128 = 20; // 16 | 4

    /**
     * Encryption constant
     *
     * @var string
     */
    const AES = 32;

    /**
     * Encryption constant
     *
     * @var string
     */
    const AES_128 = 96; // 64 | 32

    /**
     * Encryption constant
     *
     * @var string
     */
    const AES_256 = 160; // 128 | 32

    /**
     * Permission constant.
     *
     * For handlers of revision 2: Print the document.
     *
     * Handlers of a revision of 3 or greater: Print the document (possibly not at the highest quality level, depending
     * on whether {@link SetaPDF_Core_SecHandler::PERM_DIGITAL_PRINT} is also set).
     *
     * @see PDF 32000-1:2008 - Table 22 - User access permissions
     * @var integer
     */
    const PERM_PRINT = 4; // 3

    /**
     * Permission constant.
     *
     * Modify the contents of the document by operations other than those controlled by
     * {@link SetaPDF_Core_SecHandler::PERM_ANNOT}, {@link SetaPDF_Core_SecHandler::PERM_FILL_FORM} and
     * {@link SetaPDF_Core_SecHandler::PERM_ASSEMBLE}.
     *
     * @see PDF 32000-1:2008 - Table 22 - User access permissions
     * @var integer
     */
    const PERM_MODIFY = 8; // 4

    /**
     * Permission constant.
     *
     * For handlers of revision 2: Copy or otherwise extract text and graphics from the document, including extracting
     * text and graphics (in support of accessibility to users with disabilities or for other purposes).
     *
     * For handlers of revision 3 or greater: Copy or otherwise extract text and graphics from the document by
     * operations other than that controlled by bit {@link SetaPDF_Core_SecHandler::PERM_ACCESSIBILITY}.
     *
     * @see PDF 32000-1:2008 - Table 22 - User access permissions
     * @var integer
     */
    const PERM_COPY = 16; // 5

    /**
     * Permission constant.
     *
     * Add or modify text annotations, fill in interactive form fields, and, if {@link SetaPDF_Core_SecHandler::PERM_MODIFY}
     * is also set, create or modify interactive form fields (including signature fields).
     *
     * @see PDF 32000-1:2008 - Table 22 - User access permissions
     * @var integer
     */
    const PERM_ANNOT = 32; // 6

    /**
     * Permission constant.
     *
     * For handlers of revision 3 or greater: Fill in existing interactive form fields (including signature fields),
     * even if {@link SetaPDF_Core_SecHandler::PERM_ANNOT} is not set.
     *
     * @see PDF 32000-1:2008 - Table 22 - User access permissions
     * @var integer
     */
    const PERM_FILL_FORM = 256; // 9

    /**
     * Permission constant.
     *
     * For handlers of revision 3 or greater: Extract text and graphics (in support of accessibility to users with
     * disabilities or for other purposes).
     *
     * @see PDF 32000-1:2008 - Table 22 - User access permissions
     * @var integer
     */
    const PERM_ACCESSIBILITY = 512; // 10

    /**
     * Permission constant.
     *
     * For handlers of revision 3 or greater: Assemble the document (insert, rotate, or delete pages and create
     * bookmarks or thumbnail images), even if {@link SetaPDF_Core_SecHandler::PERM_MODIFY} is not set.
     *
     * @see PDF 32000-1:2008 - Table 22 - User access permissions
     * @var integer
     */
    const PERM_ASSEMBLE = 1024; // 11

    /**
     * Permission constant.
     *
     * Print the document to a representation from which a faithful digital copy of the PDF content could be generated.
     * When this is not set (and {@link SetaPDF_Core_SecHandler::PERM_PRINT} is set), printing is limited to a low-level
     * representation of the appearance, possibly of degraded quality.
     *
     * @see PDF 32000-1:2008 - Table 22 - User access permissions
     * @var integer
     */
    const PERM_DIGITAL_PRINT = 2048; // 12

    /**
     * User auth mode
     *
     * @var string
     */
    const USER = 'user';

    /**
     * Owner auth mode
     *
     * @var string
     */
    const OWNER = 'owner';

    /**
     * The encryption engine to use (mcrypt or openssl).
     *
     * @var string
     */
    static public $engine = 'openssl';

    /**
     * Checks a permission against the security handler of a document.
     *
     * @param SetaPDF_Core_Document $document The document instance
     * @param integer $permission Permission to check
     * @param null|string $message Custom error message
     * @return bool
     * @throws SetaPDF_Core_SecHandler_Exception if no rights are granted for the permission.
     */
    static public function checkPermission(SetaPDF_Core_Document $document, $permission, $message = null)
    {
        if (
            $document->hasSecHandler() &&
            false === $document->getSecHandler()->getPermission($permission)
        ) {
            if (null === $message) {
                switch ($permission) {
                    case self::PERM_ACCESSIBILITY:
                        $message = 'You are not allowed to extract text and graphics in support of '
                                 . 'accessibility to users with disabilities or for other purposes.';
                        break;
                    case self::PERM_ANNOT:
                        $message = 'You are not allowed to add or modify text annotations and fill in interactive form fields.';
                        break;
                    case self::PERM_ASSEMBLE:
                        $message = 'You are not allowed to assemble the document.';
                        break;
                    case self::PERM_COPY:
                        $message = 'You are not allowed to copy or otherwise extract text and graphics from the document.';
                        break;
                    case self::PERM_DIGITAL_PRINT:
                        $message = 'You are not allowed to print the document to a representation, from '
                                 . 'which a faithful digital copy of the PDF content could be generated.';
                        break;
                    case self::PERM_FILL_FORM:
                        $message = 'You are not allowed to fill in existing interactive form fields.';
                        break;
                    case self::PERM_PRINT:
                        $message = 'You are not allowed to print the document.';
                        break;
                    case self::PERM_MODIFY:
                        $message = 'You are not allowed to modify contents of this document.';
                        break;
                }
            }

            throw new SetaPDF_Core_SecHandler_Exception(
                $message,
                SetaPDF_Core_SecHandler_Exception::NOT_ALLOWED
            );
        }

        return true;
    }

    /**
     * Returns a standard predefined security handler.
     *
     * The type parameter will define things like algorithm and key length.
     * Additionally the type could be an encryption dictionary,
     * which will setup the desired security handler.
     *
     * @param SetaPDF_Core_Document $document
     * @param SetaPDF_Core_Type_Dictionary $encryptionDictionary
     * @return SetaPDF_Core_SecHandler_SecHandlerInterface
     * @throws SetaPDF_Core_Exception
     * @throws SetaPDF_Exception_NotImplemented
     */
    static public function factory(SetaPDF_Core_Document $document, SetaPDF_Core_Type_Dictionary $encryptionDictionary)
    {
        $filter = $encryptionDictionary->offsetGet('Filter');
        if (null === $filter) {
            throw new SetaPDF_Core_Exception("Missing filter key in encryption dictionary.");
        }

        $filterName = $filter->ensure()->getValue();

        switch ($filterName) {
            case 'Standard':
                // cloning is needed, because the encryption dictionary will be written
                // as one of the first objects at all
                $handler = new SetaPDF_Core_SecHandler_Standard($document, clone $encryptionDictionary);
                return $handler;

                break;
            case 'Adobe.PubSec':
                $handler = new SetaPDF_Core_SecHandler_PublicKey($document, clone $encryptionDictionary);
                return $handler;

                break;
            default:
                throw new SetaPDF_Exception_NotImplemented(
                    sprintf('Encryption filter (%s) not supported yet.', $filterName)
                );
        }
    }

    /**
     * Encrypts or decrypts data using the RC4/Arcfour algorithm.
     *
     * @param string $key
     * @param string $data
     * @return string
     */
    static public function arcfour($key, $data)
    {
        if (self::$engine === 'mcrypt' && function_exists('mcrypt_decrypt')) {
            return mcrypt_decrypt(MCRYPT_ARCFOUR, $key, $data, MCRYPT_MODE_STREAM, '');

        } elseif (self::$engine === 'openssl' && function_exists('openssl_encrypt')) {
            return openssl_encrypt($data, 'RC4-40', $key,  OPENSSL_RAW_DATA, '');
        }

        static $_lastRc4Key = null, $_lastRc4KeyValue = null;

        if ($_lastRc4Key !== $key) {
            $k = str_repeat($key, 256 / strlen($key) + 1);
            $rc4 = range(0, 255);
            $j = 0;
            for ($i = 0; $i < 256; $i++) {
                $rc4[$i] = $rc4[$j = ($j + ($t = $rc4[$i]) + ord($k[$i])) % 256];
                $rc4[$j] = $t;
            }
            $_lastRc4Key = $key;
            $_lastRc4KeyValue = $rc4;

        } else {
            $rc4 = $_lastRc4KeyValue;
        }

        $len = strlen($data);
        $newData = '';
        $a = 0;
        $b = 0;
        for ($i = 0; $i < $len; $i++) {
            $b = ($b + ($t = $rc4[$a = ($a + 1) % 256])) % 256;
            $rc4[$a] = $rc4[$b];
            $rc4[$b] = $t;
            $newData .= chr(ord($data[$i]) ^ $rc4[($rc4[$a] + $rc4[$b]) % 256]);
        }

        return $newData;
    }

    /**
     * Encrypts data using AES 128 bit algorithm.
     *
     * @param string $key
     * @param string $data
     * @return string
     */
    static public function aes128Encrypt($key, $data)
    {
        if (self::$engine === 'mcrypt') {
            $ivSize = mcrypt_get_iv_size(MCRYPT_RIJNDAEL_128, MCRYPT_MODE_CBC);
            $iv = mcrypt_create_iv($ivSize, MCRYPT_RAND);
            // pad the original string
            $pad = 16 - (strlen($data) % 16);
            $data = $data . str_repeat(chr($pad), $pad);

            $data = mcrypt_encrypt(MCRYPT_RIJNDAEL_128, $key, $data, MCRYPT_MODE_CBC, $iv);

            return $iv . $data;

        } else if (self::$engine === 'openssl' && version_compare(phpversion(), '5.4', '>=')) {
            // Alternative solution via OpenSSL (>= PHP 5.4)
            $ivSize = openssl_cipher_iv_length('AES-128-CBC');
            $iv     = openssl_random_pseudo_bytes($ivSize);
            // pad the original string
            $pad  = 16 - (strlen($data) % 16);
            $data = $data . str_repeat(chr($pad), $pad);

            $data = openssl_encrypt($data, 'AES-128-CBC', $key, OPENSSL_RAW_DATA | OPENSSL_ZERO_PADDING, $iv);

            return $iv . $data;
        }

        throw new BadMethodCallException('Unknown/unsupported engine defined: ' . self::$engine);
    }

    /**
     * Encrypts data using AES 256 bit algorithm.
     *
     * @param string $key
     * @param string $data
     * @return string
     */
    static public function aes256Encrypt($key, $data)
    {
        if (self::$engine === 'mcrypt') {
            return self::aes128Encrypt($key, $data);
        }

        if (self::$engine === 'openssl' && version_compare(phpversion(), '5.4', '>=')) {
            // Alternative solution via OpenSSL (>= PHP 5.4)
            $ivSize = openssl_cipher_iv_length('AES-256-CBC');
            $iv     = openssl_random_pseudo_bytes($ivSize);
            // pad the original string
            $pad  = 16 - (strlen($data) % 16);
            $data = $data . str_repeat(chr($pad), $pad);

            $data = openssl_encrypt($data, 'AES-256-CBC', $key, OPENSSL_RAW_DATA | OPENSSL_ZERO_PADDING, $iv);

            return $iv . $data;
        }

        throw new BadMethodCallException('Unknown/unsupported engine defined: ' . self::$engine);
    }

    /**
     * Decrypts data using AES 128 bit algorithm.
     *
     * @param string $key
     * @param string $data
     * @return string
     */
    static public function aes128Decrypt($key, $data)
    {
        if (strlen($data) < 16) {
            throw new InvalidArgumentException('Cannot decrypt string with a length lower than 16 bytes.');
        }

        $iv = substr($data, 0, 16);
        $data = substr($data, 16);

        if ($data === '' || $data === false) {
            return '';
        }

        if (self::$engine === 'mcrypt') {
            $data = mcrypt_decrypt(MCRYPT_RIJNDAEL_128, $key, $data, MCRYPT_MODE_CBC, $iv);

        } else if (self::$engine === 'openssl' && version_compare(phpversion(), '5.4', '>=')) {
            $data = openssl_decrypt($data, 'AES-128-CBC', $key,  OPENSSL_RAW_DATA | OPENSSL_ZERO_PADDING, $iv);

        } else {
            throw new BadMethodCallException('Unknown/unsupported engine defined: ' . self::$engine);
        }

        return substr($data, 0, -ord($data[strlen($data) - 1]));
    }

    /**
     * Decrypts data using AES 256 bit algorithm.
     *
     * @param string $key
     * @param string $data
     * @return string
     */
    static public function aes256Decrypt($key, $data)
    {
        if (strlen($data) < 16) {
            throw new InvalidArgumentException('Cannot decrypt string with a length lower than 16 bytes.');
        }

        if (self::$engine === 'mcrypt') {
            return self::aes128Decrypt($key, $data);
        }

        if (self::$engine === 'openssl' && version_compare(phpversion(), '5.4', '>=')) {
            $iv = substr($data, 0, 16);
            $data = substr($data, 16);

            if ($data === '' || $data === false) {
                return '';
            }

            // Alternative solution via OpenSSL (>= PHP 5.4)
            $data = openssl_decrypt($data, 'AES-256-CBC', $key,  OPENSSL_RAW_DATA | OPENSSL_ZERO_PADDING, $iv);

        } else {
            throw new BadMethodCallException('Unknown/unsupported engine defined: ' . self::$engine);
        }

        return substr($data, 0, -ord($data[strlen($data) - 1]));
    }
}