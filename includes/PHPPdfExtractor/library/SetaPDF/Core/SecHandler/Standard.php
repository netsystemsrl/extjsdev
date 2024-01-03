<?php
/**
 * This file is part of the SetaPDF-Core Component
 * 
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage SecHandler
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Standard.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Security handler class handling standard encryption features
 * 
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage SecHandler
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_SecHandler_Standard extends SetaPDF_Core_SecHandler_AbstractHandler
    implements SetaPDF_Core_SecHandler_SecHandlerInterface
{
    /**
     * The padding string
     * 
     * @var string
     */
    static protected $_padding = "\x28\xBF\x4E\x5E\x4E\x75\x8A\x41\x64\x00\x4E\x56\xFF\xFA\x01\x08\x2E\x2E\x00\xB6\xD0\x68\x3E\x80\x2F\x0C\xA9\xFE\x64\x53\x69\x7A";

    /**
     * Ensures bits in the permission flag.
     *
     * @param $permissions
     * @param $revision
     * @return int
     * @throws SetaPDF_Core_SecHandler_Exception
     */
    static public function ensurePermissions($permissions, $revision)
    {
        if ($revision < 3) {
            $allowed = SetaPDF_Core_SecHandler::PERM_PRINT
                | SetaPDF_Core_SecHandler::PERM_MODIFY
                | SetaPDF_Core_SecHandler::PERM_COPY
                | SetaPDF_Core_SecHandler::PERM_ANNOT;
        } else {
            $allowed = SetaPDF_Core_SecHandler::PERM_PRINT
                | SetaPDF_Core_SecHandler::PERM_MODIFY
                | SetaPDF_Core_SecHandler::PERM_COPY
                | SetaPDF_Core_SecHandler::PERM_ANNOT
                | SetaPDF_Core_SecHandler::PERM_FILL_FORM
                | SetaPDF_Core_SecHandler::PERM_ACCESSIBILITY
                | SetaPDF_Core_SecHandler::PERM_ASSEMBLE
                | SetaPDF_Core_SecHandler::PERM_DIGITAL_PRINT;
        }

        if (($allowed & $permissions) != $permissions) {
            throw new SetaPDF_Core_SecHandler_Exception(
                sprintf('Permission flags (%s) are not allowed for this security handler (revision %s).', $permissions, $revision)
            );
        }

        // 61632 = bit 7, bit 8, bit 13 to 16
        // 0xFFFF0000 = bit 17 - 32
        $permissions = 61632 | 0xFFFF0000 | $permissions;
        if ($revision < 3) {
            // 3840 = bit 9 to 12 to 1 - we are < revision 3
            $permissions |= 3840;
        }

        return SetaPDF_Core_Type_Numeric::ensure32BitInteger($permissions);
    }

    /**
     * Get the revision of the security handler.
     *
     * @return mixed
     */
    public function getRevision()
    {
        return $this->_encryptionDictionary->getValue('R')->getValue();
    }

    /**
     * Authenticate against the security handler.
     * 
     * This method will try to auth first with the owner password.
     *
     * If this will fail it will try to auth to the user password.
     * 
     * @param string $data The password to authenticate with
     * @return boolean Authentication was successful or not
     */
    public function auth($data = null)
    {
        $data = (string)$data;
        if (false !== $this->authByOwnerPassword($data)) {
            return true;
            
        } elseif (false !== $this->authByUserPassword($data)) {
            return true;
        }
        
        $this->_auth = false;

        return false;
    }
    
    /**
     * Authenticate with the owner password.
     * 
     * @param string $password
     * @return boolean
     */
    public function authByOwnerPassword($password)
    {
        if (false !== ($encryptionKey = $this->_authByOwnerPassword($password))) {
            $this->_auth = true;
            $this->_encryptionKey = $encryptionKey;
            $this->_authMode = SetaPDF_Core_SecHandler::OWNER;
            return true;
        }
        
        return false;
    }
    
    /**
     * Authenticate with the user password.
     * 
     * @param string $password
     * @return boolean
     */
    public function authByUserPassword($password)
    {
        if (false !== ($encryptionKey = $this->_authByUserPassword($password))) {
            $this->_auth = true;
            $this->_encryptionKey = $encryptionKey;
            $this->_authMode = SetaPDF_Core_SecHandler::USER;
            return true;
        }
        
        return false;
    }
    
    /**
     * Internal method to authenticate with the user password.
     * 
     * @param string $userPassword
     * @return string|boolean The encryption key if the authentication was successful.<br/>
     *                        <b>False</b> if not.
     */
    protected function _authByUserPassword($userPassword = '')
    {
        $revision = $this->getRevision();
        if ($revision < 5) {
            // Algorithm 6: Authenticating the user password
            $encryptionKey = $this->_getEncryptionKeyByUserPassword($userPassword);
            
            $uValue = $this->_computeUValue($encryptionKey);
            $originalUValue = $this->_encryptionDictionary->offsetGet('U')->getValue()->getValue(true);
            
            if ($uValue == $originalUValue ||
                $revision >= 3 &&
                substr($uValue, 0, 16) == substr($originalUValue, 0, 16)
            ) {
                return $encryptionKey;
            }
            
        } elseif ($revision == 5 || $revision == 6) {
            // 1. The password string is generated from Unicode input by processing the input
            //    string with the SASLprep (IETF RFC 4013) profile of stringprep (IETF RFC 3454),
            //    and then converting to a UTF-8 representation.
            
            // 2. Truncate the UTF-8 representation to 127 bytes if it is longer than 127 bytes.
            if (strlen($userPassword) > 127)
                $userPassword = substr($userPassword, 0, 127);
            
            // The first 32 bytes are a hash value (explained below). The next 8 bytes are
            // called the Validation Salt. The final 8 bytes are called the Key Salt.
            $uValue = $this->_encryptionDictionary->offsetGet('U')->getValue()->getValue(true);
            
            // 4. Test the password against the user key by computing the SHA-256 hash of the 
            //    UTF-8 password concatenated with the 8 bytes of user Validation Salt. If the
            //    32 byte result matches the first 32 bytes of the U string, this is the user
            //    password.
            $validationSalt = substr($uValue, 32, 8);

            if ($revision == 6) {
                $hash = $this->_computeHashR6($userPassword . $validationSalt, $userPassword);
            } else {
                $hash = hash('sha256', $userPassword . $validationSalt, true);
            }

            if ($hash == substr($uValue, 0, 32)) {
                // Compute an intermediate user key by computing the SHA-256 hash of the UTF-8 password
                // concatenated with the 8 bytes of user Key Salt. The 32-byte result is the key used
                // to decrypt the 32-byte UE string using AES-256 in CBC mode with no padding and an
                // initialization vector of zero. The 32-byte result is the file encryption key.
                $keySalt = substr($uValue, 40, 8);
                if ($revision == 6) {
                    $tmpKey = $this->_computeHashR6($userPassword . $keySalt, $userPassword);
                } else {
                    $tmpKey = hash('sha256', $userPassword . $keySalt, true);
                }
                
                $ueValue = $this->_encryptionDictionary->offsetGet('UE')->getValue()->getValue(true);
                if (SetaPDF_Core_SecHandler::$engine === 'mcrypt') {
                    $ivSize = mcrypt_get_iv_size(MCRYPT_RIJNDAEL_128, MCRYPT_MODE_CBC);
                    $encryptionKey = mcrypt_decrypt(MCRYPT_RIJNDAEL_128, $tmpKey, $ueValue, MCRYPT_MODE_CBC, str_repeat("\0", $ivSize));

                } else if (SetaPDF_Core_SecHandler::$engine === 'openssl' && version_compare(phpversion(), '5.4', '>=')) {
                    $ivSize = openssl_cipher_iv_length('AES-256-CBC');
                    $encryptionKey = openssl_decrypt(
                        $ueValue,
                        'AES-256-CBC',
                        $tmpKey,
                        OPENSSL_RAW_DATA | OPENSSL_ZERO_PADDING,
                        str_repeat("\0", $ivSize)
                    );
                } else {
                    throw new BadMethodCallException(
                        'Unknown/unsupported engine defined: ' . SetaPDF_Core_SecHandler::$engine
                    );
                }
                
                // 5. Decrypt the 16-byte Perms string using AES-256 in ECB mode with an
                //    initialization vector of zero and the file encryption key as the key. Verify 
                //    that bytes 9-11 of the result are the characters ‘a’, ‘d’, ‘b’. Bytes 0-3 of the
                //    decrypted Perms entry, treated as a little-endian integer, are the user
                //    permissions. They should match the value in the P key.
                $perms = $this->_encryptionDictionary->offsetGet('Perms')->getValue()->getValue(true);

                if (SetaPDF_Core_SecHandler::$engine === 'mcrypt') {
                    $ivSize   = mcrypt_get_iv_size(MCRYPT_RIJNDAEL_128, MCRYPT_MODE_ECB);
                    $tmpPerms = mcrypt_decrypt(MCRYPT_RIJNDAEL_128, $encryptionKey, $perms, MCRYPT_MODE_ECB, str_repeat("\0", $ivSize));

                } else if (SetaPDF_Core_SecHandler::$engine === 'openssl' && version_compare(phpversion(), '5.4', '>=')) {
                    $ivSize = openssl_cipher_iv_length('AES-256-ECB');
                    $tmpPerms = openssl_decrypt(
                        $perms,
                        'AES-256-ECB',
                        $encryptionKey,
                        OPENSSL_RAW_DATA | OPENSSL_ZERO_PADDING,
                        str_repeat("\0", $ivSize)
                    );
                } else {
                    throw new BadMethodCallException(
                        'Unknown/unsupported engine defined: ' . SetaPDF_Core_SecHandler::$engine
                    );
                }
                
                if (
                    $tmpPerms[9]  == 'a' &&
                    $tmpPerms[10] == 'd' &&
                    $tmpPerms[11] == 'b'
                ) {
                    return $encryptionKey;
                } else {
                    return false;
                }
            }
        }
        
        return false;
    }

    /**
     * Internal method to authenticate with the owner password.
     * 
     * @param string $ownerPassword
     * @return string|boolean The encryption key if the authentication was successful.<br/>
     *                        <b>False</b> if not.
     * @throws SetaPDF_Exception_NotImplemented
     */
    protected function _authByOwnerPassword($ownerPassword = '')
    {
        $revision = $this->getRevision();
        if ($revision < 5) {
            // Algorithm 7: Authenticating the owner password
            // a) Compute an encryption key from the supplied password string, as described
            //    in steps (a) to (d) of "Algorithm 3: Computing the encryption dictionary’s
            //    O (owner password) value".
            $s = substr($ownerPassword . self::$_padding, 0, 32);
            $s = md5($s, true);
            if ($revision >= 3) {
                for ($i = 0; $i < 50; $i++)
            	    $s = md5($s, true);
            }
            
    	    $encryptionKey = substr($s, 0, $this->_keyLength);
    	    
    	    // b) (Security handlers of revision 2 only) Decrypt the value of the encryption
    	    //     dictionary’s O entry, using an RC4 encryption function with the encryption
    	    //     key computed in step (a).
    	    $originalOValue = $this->_encryptionDictionary->offsetGet('O')->getValue()->getValue(true);
    	    
    	    if (2 == $revision) {
    	        $userPassword = SetaPDF_Core_SecHandler::arcfour($encryptionKey, $originalOValue);
    
            // (Security handlers of revision 3 or greater) Do the following 20 times: Decrypt
            //  the value of the encryption dictionary’s O entry (first iteration) or the output
            // from the previous iteration (all subsequent iterations), using an RC4 encryption
            // function with a different encryption key at each iteration. The key shall be
            // generated by taking the original key (obtained in step (a)) and performing an XOR
            // (exclusive or)
    	    } elseif ($revision >= 3) {
    	        $userPassword = $originalOValue;
    	        
    	        $length = strlen($encryptionKey);
    	        for($i = 19; $i >= 0; $i--) {
    	        	$tmp = array();
    	        	for($j = 0; $j < $length; $j++) {
    					$tmp[$j] = ord($encryptionKey[$j]) ^ $i;
    					$tmp[$j] = chr($tmp[$j]);
    	        	}
    	        	$userPassword = SetaPDF_Core_SecHandler::arcfour(join('', $tmp), $userPassword);
    	        }
    	    }
    	    
    	    // c) The result of step (b) purports to be the user password. Authenticate this
    	    //    user password using "Algorithm 6: Authenticating the user password". If it
    	    //    is correct, the password supplied is the correct owner password.
    	    return $this->_authByUserPassword($userPassword);
    	    
        } elseif ($revision == 5 || $revision == 6) {
            
            // 1. The password string is generated from Unicode input by processing the input
            //    string with the SASLprep (IETF RFC 4013) profile of stringprep (IETF RFC 3454),
            //    and then converting to a UTF-8 representation.
            
            // 2. Truncate the UTF-8 representation to 127 bytes if it is longer than 127 bytes.
            if (strlen($ownerPassword) > 127)
                $ownerPassword = substr($ownerPassword, 0, 127);
            
            // The first 32 bytes are a hash value (explained below). The next 8 bytes are
            // called the Validation Salt. The final 8 bytes are called the Key Salt.
            $oValue = $this->_encryptionDictionary->offsetGet('O')->getValue()->getValue(true);
            $uValue = $this->_encryptionDictionary->offsetGet('U')->getValue()->getValue(true);
            
            // 3. Test the password against the owner key by computing the SHA-256 hash of the
            //    UTF-8 password concatenated with the 8 bytes of owner Validation Salt,
            //    concatenated with the 48-byte U string. If the 32-byte result matches the
            //    first 32 bytes of the O string, this is the owner password.
            $validationSalt = substr($oValue, 32, 8);
            if ($revision == 6) {
                $hash = $this->_computeHashR6($ownerPassword . $validationSalt . substr($uValue, 0, 48), $ownerPassword, substr($uValue, 0, 48));
            } else {
                $hash = hash('sha256', $ownerPassword . $validationSalt . substr($uValue, 0, 48), true);
            }

            if ($hash == substr($oValue, 0, 32)) {
                //    Compute an intermediate owner key by computing the SHA-256 hash of the UTF-8
                //    password concatenated with the 8 bytes of owner Key Salt, concatenated with
                //    the 48-byte U string. The 32-byte result is the key used to decrypt the
                //    32-byte OE string using AES-256 in CBC mode with no padding and
                //    an initialization vector of zero. The 32-byte result is the file encryption key.
                $keySalt = substr($oValue, 40, 8);
                if ($revision == 6) {
                    $tmpKey = $this->_computeHashR6($ownerPassword . $keySalt . substr($uValue, 0, 48), $ownerPassword, substr($uValue, 0, 48));
                } else {
                    $tmpKey = hash('sha256', $ownerPassword . $keySalt . substr($uValue, 0, 48), true);
                }
                
                $oeValue = $this->_encryptionDictionary->offsetGet('OE')->getValue()->getValue(true);

                if (SetaPDF_Core_SecHandler::$engine === 'mcrypt') {
                    $ivSize = mcrypt_get_iv_size(MCRYPT_RIJNDAEL_128, MCRYPT_MODE_CBC);
                    $encryptionKey = mcrypt_decrypt(MCRYPT_RIJNDAEL_128, $tmpKey, $oeValue, MCRYPT_MODE_CBC, str_repeat("\0", $ivSize));

                } elseif (SetaPDF_Core_SecHandler::$engine === 'openssl' && version_compare(phpversion(), '5.4', '>=')) {
                    $ivSize = openssl_cipher_iv_length('AES-256-CBC');
                    $encryptionKey = openssl_decrypt(
                        $oeValue,
                        'AES-256-CBC',
                        $tmpKey,
                        OPENSSL_RAW_DATA | OPENSSL_ZERO_PADDING,
                        str_repeat("\0", $ivSize)
                    );
                } else {
                    throw new BadMethodCallException(
                        'Unknown/unsupported engine defined: ' . SetaPDF_Core_SecHandler::$engine
                    );
                }

                // 5. Decrypt the 16-byte Perms string using AES-256 in ECB mode with an
                //    initialization vector of zero and the file encryption key as the key. Verify 
                //    that bytes 9-11 of the result are the characters ‘a’, ‘d’, ‘b’. Bytes 0-3 of the
                //    decrypted Perms entry, treated as a little-endian integer, are the user
                //    permissions. They should match the value in the P key.
                $perms = $this->_encryptionDictionary->offsetGet('Perms')->getValue()->getValue(true);

                if (SetaPDF_Core_SecHandler::$engine === 'mcrypt') {
                    $ivSize = mcrypt_get_iv_size(MCRYPT_RIJNDAEL_128, MCRYPT_MODE_ECB);
                    $tmpPerms = mcrypt_decrypt(MCRYPT_RIJNDAEL_128, $encryptionKey, $perms, MCRYPT_MODE_ECB, str_repeat("\0", $ivSize));

                } elseif (SetaPDF_Core_SecHandler::$engine === 'openssl' && version_compare(phpversion(), '5.4', '>=')) {
                    $ivSize = openssl_cipher_iv_length('AES-256-ECB');
                    $tmpPerms = openssl_decrypt(
                        $perms,
                        'AES-256-ECB',
                        $encryptionKey,
                        OPENSSL_RAW_DATA | OPENSSL_ZERO_PADDING,
                        str_repeat("\0", $ivSize)
                    );
                } else {
                    throw new BadMethodCallException(
                        'Unknown/unsupported engine defined: ' . SetaPDF_Core_SecHandler::$engine
                    );
                }

                if (
                    $tmpPerms[9]  == 'a' &&
                    $tmpPerms[10] == 'd' &&
                    $tmpPerms[11] == 'b'
                ) {
                    return $encryptionKey;
                } else {
                    return false;
                }
            }
            
            return false;
            
        } else {
            throw new SetaPDF_Exception_NotImplemented(
                sprintf('Revision %s not implemented yet.', $revision)
            );
        }
    }

    /**
     * Returns current permissions.
     * 
     * @return integer
     * @see SetaPDF_Core_SecHandler_SecHandlerInterface::getPermissions()
     */
    public function getPermissions()
    {
        $authMode = $this->getAuthMode();
        if (!$authMode) {
            return 0;
        }

        $all = (
            SetaPDF_Core_SecHandler::PERM_PRINT |
            SetaPDF_Core_SecHandler::PERM_MODIFY |
            SetaPDF_Core_SecHandler::PERM_COPY |
            SetaPDF_Core_SecHandler::PERM_ANNOT |
            SetaPDF_Core_SecHandler::PERM_FILL_FORM |
            SetaPDF_Core_SecHandler::PERM_ACCESSIBILITY |
            SetaPDF_Core_SecHandler::PERM_ASSEMBLE |
            SetaPDF_Core_SecHandler::PERM_DIGITAL_PRINT
        );

        if ($authMode === SetaPDF_Core_SecHandler::OWNER) {
            return $all;
        }

        $currentPerm = (int)(float)$this->_encryptionDictionary->getValue('P')->getValue();
        return $currentPerm & $all;
    }

	/**
     * Compute the encryption key based on a password.
     *
     * @param string $password
     * @return string
     * @throws SetaPDF_Exception_NotImplemented
     */
    protected function _computeEncryptionKey($password = '')
    {
        $revision = $this->getRevision();
        
        if ($revision <= 4) {
            // TODO: The password string is generated from OS codepage characters by first 
            // converting the string to PDFDocEncoding. If the input is Unicode, first convert
            // to a codepage encoding, and then to PDFDocEncoding for backward compatibility.
            
            
            // Algorithm 2: Computing an encryption key
            // a) Pad or truncate the password string to exactly 32 bytes.
            // b) Initialize the MD5 hash function and pass the result of step (a) as input to this function.
            $s = substr($password . self::$_padding, 0, 32);
            
            // c) Pass the value of the encryption dictionary’s O entry to the MD5 hash function.
            //    ("Algorithm 3: Computing the encryption dictionary’s O (owner password) value" shows how the O value is computed.)
            $s .= $this->_encryptionDictionary->offsetGet('O')->getValue()->getValue(true);
            
            // d) Convert the integer value of the P entry to a 32-bit unsigned binary number and pass these
            //    bytes to the MD5 hash function, low-order byte first.
            $pValue = $this->_encryptionDictionary->offsetGet('P')->getValue()->getValue();
            $pValue = (int)(float)$pValue;
            $s .= pack("V", $pValue);
            
            // e) Pass the first element of the file’s file identifier array (the value of the ID
            //    entry in the document’s trailer dictionary; see Table 15) to the MD5 hash function.
            $s .= $this->_document->getFileIdentifier(true);
            
            // f) (Security handlers of revision 4 or greater) If document metadata is not 
            //    being encrypted, pass 4 bytes with the value 0xFFFFFFFF to the MD5 hash function.
            if ($revision == 4 && $this->_encryptMetadata == false) {
                $s .= "\xFF\xFF\xFF\xFF";
            }
            
            // g) Finish the hash.
            $s = md5($s, true);
            
            // h) (Security handlers of revision 3 or greater) Do the following 50 times:
            //    Take the output from the previous MD5 hash and pass the first n bytes of
            //    the output as input into a new MD5 hash, where n is the number of bytes
            //    of the encryption key as defined by the value of the encryption dictionary’s
            //    Length entry.
            if (3 <= $revision) {
        	    for ($i = 0; $i < 50; $i++)
                	$s = md5(substr($s, 0, $this->_keyLength), true);
            }
            
            // i) Set the encryption key to the first n bytes of the output from the final
            //    MD5 hash, where n shall always be 5 for security handlers of revision 2 but,
            //    for security handlers of revision 3 or greater, shall depend on the value of
            //    the encryption dictionary’s Length entry.
            
            return substr($s, 0, $this->_keyLength); // key length is calculated automatically if it is missing (5)
            
        } elseif ($revision == 5 || $revision == 6) {
            return hash(
            	'sha256',
                $this->generateRandomBytes(128)
                . uniqid('sAlT') . microtime() . mt_rand()
                . $this->_document->getFileIdentifier(true) . __FILE__,
                true
            );
            
        } else {
            throw new SetaPDF_Exception_NotImplemented(
                sprintf('Revision %s not implemented yet.', $revision)
            );
        }
    }
    
    /**
     * Compute the O value.
     * 
     * @param string $userPassword
     * @param string $ownerPassword
     * @return string
     * @throws SetaPDF_Core_SecHandler_Exception
     */
    protected function _computeOValue($userPassword, $ownerPassword = '')
    {
        $revision = $this->getRevision();
        // Algorithm 3: Computing the encryption dictionary’s O (owner password) value
        if ($revision < 5) {
                
            // a) Pad or truncate the owner password string as described in step (a) of
            //    "Algorithm 2: Computing an encryption key". If there is no owner password,
            //    use the user password instead.
            if ('' === $ownerPassword)
                $ownerPassword = $userPassword;
            
            $s = substr($ownerPassword . self::$_padding, 0, 32);
              
            // b) Initialize the MD5 hash function and pass the result of step (a) as input to
            //    this function.
            $s = md5($s, true);
            
            // c) (Security handlers of revision 3 or greater) Do the following 50 times:
            //    Take the output from the previous MD5 hash and pass it as input into a new MD5 hash.
            if (3 <= $revision) {
                for ($i = 0; $i < 50; $i++)
            	    $s = md5($s, true);
            }
            
            // d) Create an RC4 encryption key using the first n bytes of the output from the
            //    final MD5 hash, where n shall always be 5 for security handlers of revision 2
            //    but, for security handlers of revision 3 or greater, shall depend on the value
            //    of the encryption dictionary’s Length entry.
            $encryptionKey = substr($s, 0, $this->_keyLength);
            
            // e) Pad or truncate the user password string as described in step (a) of
            //    "Algorithm 2: Computing an encryption key".
            $s = substr($userPassword . self::$_padding, 0, 32);
            
            // f) Encrypt the result of step (e), using an RC4 encryption function with 
            //    the encryption key obtained in step (d).
            $s = SetaPDF_Core_SecHandler::arcfour($encryptionKey, $s);
            
            // g) (Security handlers of revision 3 or greater) Do the following 19 times:
            //    Take the output from the previous invocation of the RC4 function and pass
            //    it as input to a new invocation of the function; use an encryption key
            //    generated by taking each byte of the encryption key obtained in step (d)
            //    and performing an XOR (exclusive or) operation between that byte and the
            //    single-byte value of the iteration counter (from 1 to 19).
            if (3 <= $revision) {
                for($i = 1; $i <= 19; $i++) {
    	        	$tmp = array();
    	        	for($j = 0; $j < $this->_keyLength; $j++) {
    					$tmp[$j] = ord($encryptionKey[$j]) ^ $i;
    					$tmp[$j] = chr($tmp[$j]);
    	        	} 
    	        	$s = SetaPDF_Core_SecHandler::arcfour(join('', $tmp), $s);
    	        }
            }
            
            // h) Store the output from the final invocation of the RC4 function as the value
            //    of the O entry in the encryption dictionary.
            return $s;
            
        } elseif ($revision == 5) {
            // 1. Generate 16 random bytes of data using a strong random number generator. The
            //    first 8 bytes are the Owner Validation Salt. The second 8 bytes are the Owner
            //    Key Salt. Compute the 32-byte SHA-256 hash of the password concatenated with
            //    the Owner Validation Salt and then concatenated with the 48-byte U string as
            //    generated in Algorithm 3.8. The 48-byte string consisting of the 32-byte hash
            //    followed by the Owner Validation Salt followed by the Owner Key Salt is stored
            //    as the O key.
            $rand = $this->generateRandomBytes(16);
            $validationSalt = substr($rand, 0, 8);
            $keySalt = substr($rand, 8, 8);
            $uValue = $this->_encryptionDictionary->offsetGet('U')->getValue()->getValue();

            $hash = hash('sha256', $ownerPassword . $validationSalt . $uValue, true);

            return $hash . $validationSalt . $keySalt;
        } elseif ($revision == 6) {
            // a) Generate 16 random bytes of data using a strong random number generator. The first 8 bytes are the
            //    Owner Validation Salt. The second 8 bytes are the Owner Key Salt.
            $rand = $this->generateRandomBytes(16);
            $validationSalt = substr($rand, 0, 8);
            $keySalt = substr($rand, 8, 8);
            //    Compute the 32-byte hash using
            //    algorithm 2.B with an input string consisting of the UTF-8 password concatenated with the Owner
            //    Validation Salt and then concatenated with the 48-byte U string as generated in Algorithm 8.
            $uValue = $this->_encryptionDictionary->offsetGet('U')->getValue()->getValue();
            $hash = $this->_computeHashR6($ownerPassword . $validationSalt . $uValue, $ownerPassword, substr($uValue, 0, 48));
            //    The 48-byte
            //    string consisting of the 32-byte hash followed by the Owner Validation Salt followed by the Owner Key
            //    Salt is stored as the "O" key.
            return $hash . $validationSalt . $keySalt;

        } else {
            
            throw new SetaPDF_Core_SecHandler_Exception(
                sprintf('Unsupported Revision: %s', $revision),
                SetaPDF_Core_SecHandler_Exception::UNSUPPORTED_REVISION
            );
        }
    }
    
    /**
     * Compute the U value.
     * 
     * @param string $encryptionKey
     * @return string
     * @throws SetaPDF_Core_SecHandler_Exception
     */
    protected function _computeUValue($encryptionKey)
    {
        $revision = $this->getRevision();
        // Algorithm 4: Computing the encryption dictionary’s U (user password)
        // value (Security handlers of revision 2)	        	
        if (2 == $revision) {
    	    return SetaPDF_Core_SecHandler::arcfour($encryptionKey, self::$_padding);
    	}
    	
        // Algorithm 5: Computing the encryption dictionary’s U (user password)
        // value (Security handlers of revision 3 or greater)
        elseif (
            3 == $revision || 4 == $revision
        ) {
            // a) Create an encryption key based on the user password string, as described
            //    in "Algorithm 2: Computing an encryption key".
            //    passed through $encryptionKey-parameter
            
            // b) Initialize the MD5 hash function and pass the 32-byte padding string shown
            //    in step (a) of "Algorithm 2: Computing an encryption key" as input to
            //    this function.
            $s = self::$_padding;
            
            // c) Pass the first element of the file’s file identifier array (the value of
            //    the ID entry in the document’s trailer dictionary; see Table 15) to the
            //    hash function and finish the hash.
            $s .= $this->_document->getFileIdentifier(true);
            $s = md5($s, true);
            
    		// d) Encrypt the 16-byte result of the hash, using an RC4 encryption function
    		//    with the encryption key from step (a).
    		$s = SetaPDF_Core_SecHandler::arcfour($encryptionKey, $s);
    		
    		// e) Do the following 19 times: Take the output from the previous invocation
    		//    of the RC4 function and pass it as input to a new invocation of the function;
    		//    use an encryption key generated by taking each byte of the original encryption
    		//    key obtained in step (a) and performing an XOR (exclusive or) operation 
    		//    between that byte and the single-byte value of the iteration counter (from 1 to 19).
            $length = strlen($encryptionKey);
    		for($i = 1; $i <= 19; $i++) {
	        	$tmp = array();
	        	for($j = 0; $j < $length; $j++) {
					$tmp[$j] = ord($encryptionKey[$j]) ^ $i;
					$tmp[$j] = chr($tmp[$j]);
	        	} 
	        	$s = SetaPDF_Core_SecHandler::arcfour(join('', $tmp), $s);
	        }
	        
	        // f) Append 16 bytes of arbitrary padding to the output from the final invocation
	        //    of the RC4 function and store the 32-byte result as the value of the U entry
	        //    in the encryption dictionary.
	        return $s . str_repeat("\0", 16);
	        
        } elseif (5 == $revision) {
            $userPassword = $encryptionKey;
            // 1. Generate 16 random bytes of data using a strong random number generator. The 
            //    first 8 bytes are the User Validation Salt. The second 8 bytes are the User Key
            //    Salt. Compute the 32-byte SHA-256 hash of the password concatenated with the 
            //    User Validation Salt. The 48-byte string consisting of the 32-byte hash followed
            //    by the User Validation Salt followed by the User Key Salt is stored as the U key.
            $rand = $this->generateRandomBytes(16);
            $validationSalt = substr($rand, 0, 8);
            $keySalt = substr($rand, 8, 16);
            $hash = hash('sha256', $userPassword . $validationSalt, true);

            return $hash . $validationSalt . $keySalt;

        } elseif (6 == $revision) {
            $userPassword = $encryptionKey;
            // a) Generate 16 random bytes of data using a strong random number generator. The first 8 bytes are the
            //    User Validation Salt. The second 8 bytes are the User Key Salt. Compute the 32-byte hash using algorithm
            //    2.B with an input string consisting of the UTF-8 password concatenated with the User Validation Salt. The
            //    48- byte string consisting of the 32-byte hash followed by the User Validation Salt followed by the User
            //    Key Salt is stored as the "U" key.
            $rand = $this->generateRandomBytes(16);
            $validationSalt = substr($rand, 0, 8);
            $keySalt = substr($rand, 8, 16);

            $hash = $this->_computeHashR6($userPassword . $validationSalt, $userPassword);

            return $hash . $validationSalt . $keySalt;

        } else {
            throw new SetaPDF_Core_SecHandler_Exception(
                sprintf('Unsupported Revision: %s', $revision),
                SetaPDF_Core_SecHandler_Exception::UNSUPPORTED_REVISION
            );
        }
    }
    
    /**
     * Get the encryption key by the user password.
     * 
     * @param string $password
     * @return string
     */
    protected function _getEncryptionKeyByUserPassword($password = '')
    {
        return $this->_computeEncryptionKey($password);
    }
}