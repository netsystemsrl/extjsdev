<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage SecHandler
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: AbstractHandler.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Abstract security handler class for handling PDF encryption features.
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage SecHandler
 * @license    https://www.setasign.com/ Commercial
 */
abstract class SetaPDF_Core_SecHandler_AbstractHandler
{
    /**
     * The document to which this security handler is attached
     *
     * @var SetaPDF_Core_Document
     */
    protected $_document;

    /**
     * The key length in bytes
     *
     * This value is still needed if crypt filters are in use:
     *   - It is needed to compute the encryption key.
     *   - It is needed to compute the O value
     *  It is NOT documented which key length should be used for this things
     *  if a crypt filter is in use.
     *
     * @var integer
     */
    protected $_keyLength = 5;

    /**
     * The encryption key
     *
     * @var string
     */
    protected $_encryptionKey;

    /**
     * The encryption dictionary
     *
     * @var SetaPDF_Core_Type_Dictionary
     */
    protected $_encryptionDictionary;

    /**
     * Defines if this security handler is authenticated
     *
     * @var boolean
     */
    protected $_auth = false;

    /**
     * The auth mode
     *
     * Says who is authenticated: user or owner
     *
     * @var string|null
     */
    protected $_authMode = null;

    /**
     * Metadata are encrypted or not
     *
     * @var boolean
     */
    protected $_encryptMetadata = true;

    /**
     * The algorithm an key length to be used for en/decrypting strings
     *
     * @var array
     */
    protected $_stringAlgorithm = array(SetaPDF_Core_SecHandler::ARCFOUR, 5);

    /**
     * The algorithm an key length to be used for en/decrypting stream
     *
     * @var array
     */
    protected $_streamAlgorithm = array(SetaPDF_Core_SecHandler::ARCFOUR, 5);

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Document $document
     * @param SetaPDF_Core_Type_Dictionary $encryptionDictionary
     * @throws SetaPDF_Core_SecHandler_Exception
     */
    public function __construct
    (
        SetaPDF_Core_Document $document,
        SetaPDF_Core_Type_Dictionary $encryptionDictionary
    )
    {
        // TODO: Implement function to check for mcrypt, hash and desired algorithms

        $this->_document = $document;
        $this->_encryptionDictionary = $encryptionDictionary;

        // Mark string elements as not encrypted
        foreach ($this->_encryptionDictionary AS $value) {
            if ($value instanceof SetaPDF_Core_Type_StringValue) {
                $value->setBypassSecHandler(true);
            }
        }

        // define the standard key length
        if ($this->_encryptionDictionary->offsetExists('Length')) {
            $keyLength = $this->_encryptionDictionary->getValue('Length')->getValue();
        } else {
            $keyLength = 40;
        }

        $this->_keyLength = $keyLength / 8;

        // Crypt Filters / V == 4
        if ($this->_encryptionDictionary->offsetExists('CF')) {
            $streamFilterName = $this->_encryptionDictionary->getValue('StmF')->ensure()->getValue();
            /**
             * @var $cryptFilters SetaPDF_Core_Type_Dictionary
             * @var $streamFilter SetaPDF_Core_Type_Dictionary
             */
            $cryptFilters = $this->_encryptionDictionary->getValue('CF')->ensure();

            // TODO: This can be "Identity" which is a predefined crypt filter
            $streamFilter = $cryptFilters->getValue($streamFilterName)->ensure();

            $cryptFilterMethod = $streamFilter->getValue('CFM')->ensure()->getValue();
            $keyLength = $streamFilter->offsetExists('Length')
                ? $streamFilter->getValue('Length')->ensure()->getValue()
                : $this->_keyLength;

            switch ($cryptFilterMethod) {
                case 'V2':
                    $this->_streamAlgorithm = array(SetaPDF_Core_SecHandler::ARCFOUR, $keyLength);
                    break;
                case 'AESV2':
                    $this->_streamAlgorithm = array(SetaPDF_Core_SecHandler::AES_128, $keyLength);
                    break;
                case 'AESV3':
                    $this->_streamAlgorithm = array(SetaPDF_Core_SecHandler::AES_256, $keyLength);
                    break;
                default:
                    throw new SetaPDF_Core_SecHandler_Exception(
                        'Unsupported Crypt Filter Method: ' . $cryptFilterMethod,
                        SetaPDF_Core_SecHandler_Exception::UNSUPPORTED_CRYPT_FILTER_METHOD
                    );
            }

            /**
             * @var $stringFilter SetaPDF_Core_Type_Dictionary
             */
            $stringFilterName = $this->_encryptionDictionary->getValue('StrF')->ensure()->getValue();
            $stringFilter = $cryptFilters->getValue($stringFilterName)->ensure();

            $cryptFilterMethod = $stringFilter->getValue('CFM')->ensure()->getValue();
            $keyLength = $stringFilter->offsetExists('Length')
                ? $stringFilter->getValue('Length')->ensure()->getValue()
                : $this->_keyLength;

            switch ($cryptFilterMethod) {
                case 'V2':
                    $this->_stringAlgorithm = array(SetaPDF_Core_SecHandler::ARCFOUR, $keyLength);
                    break;
                case 'AESV2':
                    $this->_stringAlgorithm = array(SetaPDF_Core_SecHandler::AES_128, $keyLength);
                    break;
                case 'AESV3':
                    $this->_stringAlgorithm = array(SetaPDF_Core_SecHandler::AES_256, $keyLength);
                    break;
                default:
                    throw new SetaPDF_Core_SecHandler_Exception(
                        'Unsupported Crypt Filter Method: ' . $cryptFilterMethod,
                        SetaPDF_Core_SecHandler_Exception::UNSUPPORTED_CRYPT_FILTER_METHOD
                    );
            }

            // Standard
        } else {
            $this->_streamAlgorithm =
            $this->_stringAlgorithm = array(SetaPDF_Core_SecHandler::ARCFOUR, $this->_keyLength);
        }

        if ($this->_encryptionDictionary->offsetExists('EncryptMetadata')) {
            $this->_encryptMetadata = $this->_encryptionDictionary
                ->getValue('EncryptMetadata')->ensure()->getValue();
        }
    }

    /**
     * Returns the document instance of this security handler.
     *
     * @return SetaPDF_Core_Document
     */
    public function getDocument()
    {
        return $this->_document;
    }

    /**
     * Gets the encryption dictionary.
     *
     * @return SetaPDF_Core_Type_Dictionary
     */
    public function getEncryptionDictionary()
    {
        return $this->_encryptionDictionary;
    }

    /**
     * Get the stream algorithm data.
     *
     * @return array
     */
    public function getStreamAlgorithm()
    {
        return $this->_streamAlgorithm;
    }

    /**
     * Get the string algorithm data.
     *
     * @return array
     */
    public function getStringAlgorithm()
    {
        return $this->_stringAlgorithm;
    }

    /**
     * Encrypt a string.
     *
     * @param string $data
     * @param SetaPDF_Core_Type_IndirectObject $param
     * @return string
     * @throws SetaPDF_Core_SecHandler_Exception
     */
    public function encryptString($data, $param = null)
    {
        if ($this->isAuth()) {
            return $this->_crypt($data, $this->_stringAlgorithm, $param);
        }

        throw new SetaPDF_Core_SecHandler_Exception(
            'Security handler not authorized to encrypt strings or streams. Authenticate first!',
            SetaPDF_Core_SecHandler_Exception::NOT_AUTHENTICATED
        );
    }

    /**
     * Encrypt a stream.
     *
     * @param string $data
     * @param SetaPDF_Core_Type_IndirectObject $param
     * @return string
     * @throws SetaPDF_Core_SecHandler_Exception
     */
    public function encryptStream($data, $param = null)
    {
        if ($this->isAuth()) {
            return $this->_crypt($data, $this->_streamAlgorithm, $param);
        }

        throw new SetaPDF_Core_SecHandler_Exception(
            'Security handler not authorized to encrypt strings or streams. Authenticate first!',
            SetaPDF_Core_SecHandler_Exception::NOT_AUTHENTICATED
        );
    }

    /**
     * Decrypt a string.
     *
     * @param string $data
     * @param SetaPDF_Core_Type_IndirectObject $param
     * @return string
     * @throws SetaPDF_Core_SecHandler_Exception
     */
    public function decryptString($data, $param = null)
    {
        if ($this->isAuth()) {
            return $this->_crypt($data, $this->_stringAlgorithm, $param, false);
        }

        throw new SetaPDF_Core_SecHandler_Exception(
            'Security handler not authorized to decrypt strings or streams. Authenticate first!',
            SetaPDF_Core_SecHandler_Exception::NOT_AUTHENTICATED
        );
    }

    /**
     * Decrypt a stream.
     *
     * @param string $data
     * @param SetaPDF_Core_Type_IndirectObject $param
     * @return string
     * @throws SetaPDF_Core_SecHandler_Exception
     */
    public function decryptStream($data, $param = null)
    {
        if ($this->isAuth()) {
            return $this->_crypt($data, $this->_streamAlgorithm, $param, false);
        }

        throw new SetaPDF_Core_SecHandler_Exception(
            'Security handler not authorized to decrypt strings or streams. Authenticate first!',
            SetaPDF_Core_SecHandler_Exception::NOT_AUTHENTICATED
        );
    }

    /**
     * Get the auth method.
     *
     * @return string "user", "owner" or an empty string if not authenticated.
     */
    public function getAuthMode()
    {
        return $this->_authMode;
    }

    /**
     * Queries if a permission is granted.
     *
     * @param integer $permission
     * @return boolean
     */
    public function getPermission($permission)
    {
        if ($this->isAuth()) {
            $p = $this->getPermissions();
            return ($p & $permission) !== 0;
        }

        return false;
    }

    /**
     * Queries if the security handler is authenticated.
     *
     * If not it tries by calling auth() without a password.
     *
     * @return boolean
     */
    public function isAuth()
    {
        if (false === $this->_auth)
            $this->auth();

        return $this->_auth;
    }

    /**
     * Get the encryption key if known/authenticated.
     *
     * @return string
     * @throws SetaPDF_Core_SecHandler_Exception
     */
    public function getEncryptionKey()
    {
        if ($this->isAuth())
            return $this->_encryptionKey;


        throw new SetaPDF_Core_SecHandler_Exception(
            'Security handler not authenticated, so no encryption key is known. Authenticate first!',
            SetaPDF_Core_SecHandler_Exception::NOT_AUTHENTICATED
        );
    }

    /**
     * Returns true if the metadata are/will be encrypted.
     *
     * @return boolean
     */
    public function getEncryptMetadata()
    {
        return $this->_encryptMetadata;
    }

    /**
     * Encrypts or decrypts data using Algorithm 1 of the PDF specification.
     *
     * @param string $data
     * @param array $algorithm
     * @param SetaPDF_Core_Type_IndirectObject $param
     * @param boolean $encrypt
     * @return string
     * @throws SetaPDF_Core_SecHandler_Exception
     */
    protected function _crypt($data, $algorithm, $param = null, $encrypt = true)
    {
        // Algorithm 1: Encryption of data using the RC4 or AES algorithms

        // Use the 32-byte file encryption key for the AES-256 symmetric key algorithm, along
        // with the string or stream data to be encrypted.
        // Use the AES algorithm in Cipher Block Chaining (CBC) mode, which requires an
        // initialization vector. The block size parameter is set to 16 bytes, and the
        // initialization vector is a 16-byte random number that is stored as the first 16
        // bytes of the encrypted stream or string.
        // The output is the encrypted data to be stored in the PDF file.
        if (SetaPDF_Core_SecHandler::AES_256 === $algorithm[0]) {
            if (true === $encrypt)
                return SetaPDF_Core_SecHandler::Aes256Encrypt($this->_encryptionKey, $data);

            return SetaPDF_Core_SecHandler::Aes256Decrypt($this->_encryptionKey, $data);
        }

        // a) Obtain the object number and generation number from the object
        //    identifier of the string or stream to be encrypted (see 7.3.10,
        //    "Indirect Objects"). If the string is a direct object, use the
        //    identifier of the indirect object containing it.
        // b) For all strings and streams without crypt filter specifier; treating
        //    the object number and generation number as binary integers, extend
        //    the original n-byte encryption key to n + 5 bytes by appending the
        //    low-order 3 bytes of the object number and the low-order 2 bytes of
        //    the generation number in that order, low-order byte first.
        //    (n is 5 unless the value of V in the encryption dictionary is greater
        //    than 1, in which case n is the value of Length divided by 8.)
        // TODO: Check if this works for different documents!
        $objectData = $this->_document->getIdForObject($param);
        $key = $this->_encryptionKey . pack('VXVXX', $objectData[0], $objectData[1]);

        // If using the AES algorithm, extend the encryption key an additional 4 bytes
        // by adding the value “sAlT”, which corresponds to the hexadecimal values 0x73,
        // 0x41, 0x6C, 0x54. (This addition is done for backward compatibility and is not
        // intended to provide additional security.)
        if (SetaPDF_Core_SecHandler::AES_128 === $algorithm[0]) {
            $key .= "\x73\x41\x6c\x54";
        }

        // c) Initialize the MD5 hash function and pass the result of step (b) as input
        //    to this function.
        $s = md5($key, true);

        // d) Use the first (n + 5) bytes, up to a maximum of 16, of the output from the
        //    MD5 hash as the key for the RC4 or AES symmetric key algorithms, along with
        //    the string or stream data to be encrypted.
        $s = substr(substr($s, 0, $algorithm[1] + 5), 0, 16);

        if (SetaPDF_Core_SecHandler::ARCFOUR & $algorithm[0]) {
            return SetaPDF_Core_SecHandler::arcfour($s, $data);
        }
        // If using the AES algorithm, the Cipher Block Chaining (CBC) mode, which requires
        // an initialization vector, is used. The block size parameter is set to 16 bytes,
        // and the initialization vector is a 16-byte random number that is stored as the
        // first 16 bytes of the encrypted stream or string.
        elseif (SetaPDF_Core_SecHandler::AES_128 === $algorithm[0]) {
            if (true === $encrypt)
                return SetaPDF_Core_SecHandler::Aes128Encrypt($s, $data);

            return SetaPDF_Core_SecHandler::Aes128Decrypt($s, $data);
        }

        throw new SetaPDF_Core_SecHandler_Exception('Unknown algorithm (' . $algorithm[0] . ').');
    }

    /**
     * Computes a hash for security handler revision 6.
     *
     * @param string $data
     * @param string $inputPassword
     * @param string $userKey
     * @return string
     */
    protected function _computeHashR6($data, $inputPassword, $userKey = '')
    {
        // Take the SHA-256 hash of the original input to the algorithm and name the resulting 32 bytes, K.
        $hash = 'sha256';
        $k = hash($hash, $data, true);

        $i = 0;
        $e = '';

        // Perform the following steps (a)-(d) 64 times:
        while (true) {
            // for ($i = 0; $i < 64 || $i > 63 && ord($e[strlen($e) - 1]) > $i - 32; $i++) { // short vs. readable solution
            // [...]do the following, starting with round number 64:
            if ($i > 63) {
                /* e) Look at the very last byte of "E". If the value of that byte (taken as an unsigned integer) is greater than the
                 * (round number) - 32, repeat steps (a-d) again.
                 */
                $lastByteValue = ord($e[strlen($e) - 1]);
                if ($lastByteValue <= ($i - 32)) {
                    break;
                }
                /* f) Repeat from steps (a-e) until the value of the last byte is ≤ (round number) - 32.
                 */
            }

            /* a) Make a new string, "K1", consisting of 64 repetitions of the sequence: input password, "K", the 48-byte user
             * key. The 48 byte user key is only used when checking the owner password or creating the owner key. If
             * checking the user password or creating the user key, "K1" is the concatenation of the input password
             * and "K".
             */
            $k1 = str_repeat($inputPassword . $k . $userKey, 64);
            /*
             * b) Encrypt "K1" with the AES-128 (CBC, no padding) algorithm, using the first 16 bytes of "K" as the key and the
             * second 16 bytes of "K" as the initialization vector. The result of this encryption is "E".
             */
            if (SetaPDF_Core_SecHandler::$engine === 'mcrypt') {
                $e = mcrypt_encrypt(MCRYPT_RIJNDAEL_128, substr($k, 0, 16), $k1, MCRYPT_MODE_CBC, substr($k, 16, 16));
            } elseif (SetaPDF_Core_SecHandler::$engine === 'openssl' && version_compare(phpversion(), '5.4', '>=')) {
                $e = openssl_encrypt(
                    $k1,
                    'AES-128-CBC',
                    substr($k, 0, 16),
                    OPENSSL_RAW_DATA | OPENSSL_ZERO_PADDING,
                    substr($k, 16, 16)
                );
            } else {
                throw new BadMethodCallException(
                    'Unknown/unsupported engine defined: ' . SetaPDF_Core_SecHandler::$engine
                );
            }
            /* c) Taking the first 16 bytes of "E" as an unsigned big-endian integer, compute the remainder, modulo 3. If the
             * result is 0, the next hash used is SHA-256, if the result is 1, the next hash used is SHA-384, if the result is 2,
             * the next hash used is SHA-512.
             */
            for ($j = 0, $sum = 0; $j < 16; $j++) {
                $sum += ord($e[$j]);
            }

            switch ($sum % 3) {
                case 0:
                    $hash = 'sha256';
                    break;
                case 1:
                    $hash = 'sha384';
                    break;
                case 2:
                    $hash = 'sha512';
                    break;
            }

            /* d) Using the hash algorithm determined in step c, take the hash of "E". The result is a new value of "K", which
             * will be 32, 48, or 64 bytes in length.
             */
            $k = hash($hash, $e, true);
            $i++;
        }

        return substr($k, 0, 32);
    }

    /**
     * Generate random bytes.
     *
     * Internally the method tries to use PHPs internal available methods for pseudo-random bytes creation:
     * {@link http://php.net/random_bytes random_bytes()},
     * {@link http://php.net/openssl_random_pseudo_bytes openssl_random_pseudo_bytes()},
     * {@link http://php.net/mcrypt_create_iv mcrypt_create_iv()}. If none of these methods is available a random
     * string is generated by using {@link http://php.net/mt_rand mt_rand()}.
     *
     * @param $length
     * @return string
     */
    public function generateRandomBytes($length)
    {
        if (function_exists('random_bytes')) {
            return random_bytes($length);
        } elseif (function_exists('openssl_random_pseudo_bytes')) {
            return openssl_random_pseudo_bytes($length);
        } else {
            $res = '';
            while (strlen($res) < $length) {
                $res .= chr(mt_rand(0, 255));
            }

            return $res;
        }
    }

    /**
     * Get the PDF version, which is needed for the currently used encryption algorithm.
     *
     * @return string
     * @throws SetaPDF_Exception_NotImplemented
     */
    public function getPdfVersion()
    {
        $algoCode = $this->_encryptionDictionary->offsetGet('V')->getValue()->getValue();

        switch ($algoCode)
        {
            case 0: // undocumented
            case 1:
                return '1.3';

            case 2:
            case 3:
                return '1.4';

            case 4:
                if ($this->_encryptionDictionary->offsetExists('EFF'))
                    return '1.6';

                return '1.5';

            case 5:
                // TODO: R == 5 -> 1.7 + Extension, R == 6 -> 2.0
                return '1.7';

            default:
                throw new SetaPDF_Exception_NotImplemented(
                    sprintf('Algorithm with code %s not implemented.', $algoCode)
                );
        }
    }

    /**
     * Returns current permissions.
     *
     * @return integer
     * @see SetaPDF_Core_SecHandler_SecHandlerInterface::getPermissions()
     */
    public abstract function getPermissions();
}