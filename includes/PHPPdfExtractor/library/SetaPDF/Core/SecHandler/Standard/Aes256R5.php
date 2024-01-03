<?php 
/**
 * This file is part of the SetaPDF-Core Component
 * 
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage SecHandler
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Aes256R5.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Generator class for AES 256 bit security handler (revision 5 - DEPRECTAED IN ISO/DIS 32000-2)
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage SecHandler
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_SecHandler_Standard_Aes256R5 extends SetaPDF_Core_SecHandler_Standard
{
    /**
     * Factory method for AES 256 bit security handler. (revision 5 - DEPRECTAED IN ISO/DIS 32000-2)
     * 
     * @param SetaPDF_Core_Document $document
     * @param string $ownerPassword The owner password in UTF-8 encoding
     * @param string $userPassword The user password in UTF-8 encoding
     * @param integer $permissions
     * @param boolean $encryptMetadata
     * @throws SetaPDF_Core_SecHandler_Exception
     * @return SetaPDF_Core_SecHandler_Standard_Aes256R5
     */
    static public function factory(
        SetaPDF_Core_Document $document,
        $ownerPassword,
        $userPassword = '',
        $permissions = 0,
        $encryptMetadata = true
    )
    {
        $encryptionDict = new SetaPDF_Core_Type_Dictionary();
        $encryptionDict->offsetSet('Filter', new SetaPDF_Core_Type_Name('Standard', true));
        
        $encryptionDict->offsetSet('R', new SetaPDF_Core_Type_Numeric(5));
        $encryptionDict->offsetSet('V', new SetaPDF_Core_Type_Numeric(5));
        $encryptionDict->offsetSet('O', new SetaPDF_Core_Type_String());
        $encryptionDict->offsetSet('U', new SetaPDF_Core_Type_String());
        $encryptionDict->offsetSet('Length', new SetaPDF_Core_Type_Numeric(256));
        
        $cf = new SetaPDF_Core_Type_Dictionary();
        $stdCf = new SetaPDF_Core_Type_Dictionary();
        $stdCf->offsetSet('CFM', new SetaPDF_Core_Type_Name('AESV3', true));
        $stdCf->offsetSet('AuthEvent', new SetaPDF_Core_Type_Name('DocOpen', true));
        $stdCf->offsetSet('Length', new SetaPDF_Core_Type_Numeric(32));
        $cf->offsetSet('StdCF', $stdCf);
        $encryptionDict->offsetSet('CF', $cf);
        $encryptionDict->offsetSet('StrF', new SetaPDF_Core_Type_Name('StdCF', true));
        $encryptionDict->offsetSet('StmF', new SetaPDF_Core_Type_Name('StdCF', true));
        
        $encryptionDict->offsetSet('UE', new SetaPDF_Core_Type_String());
        $encryptionDict->offsetSet('OE', new SetaPDF_Core_Type_String());
        $encryptionDict->offsetSet('Perms', new SetaPDF_Core_Type_String());

        $permissions = self::ensurePermissions($permissions, 5);
        $encryptionDict->offsetSet('P', new SetaPDF_Core_Type_Numeric($permissions));
        
        $encryptionDict->offsetSet('EncryptMetadata', new SetaPDF_Core_Type_Boolean($encryptMetadata));
        
        $instance = new self($document, $encryptionDict);
        
        $instance->_encryptionKey = $instance->_computeEncryptionKey(null);
        
        $uValue = $instance->_computeUValue($userPassword);
        $encryptionDict->offsetGet('U')->getValue()->setValue($uValue);
	    
        // 2. Compute the 32-byte SHA-256 hash of the password concatenated with the User
        //    Key Salt. Using this hash as the key, encrypt the file encryption key using
        //    AES-256 in CBC mode with no padding and an initialization vector of zero.
        //    The resulting 32-byte string is stored as the UE key.
	    $keySalt = substr($uValue, 40);
	    $key = hash('sha256', $userPassword . $keySalt, true);

        if (SetaPDF_Core_SecHandler::$engine === 'mcrypt') {
            $ivSize = mcrypt_get_iv_size(MCRYPT_RIJNDAEL_128, MCRYPT_MODE_CBC);
            $ueValue = mcrypt_encrypt(MCRYPT_RIJNDAEL_128, $key, $instance->_encryptionKey, MCRYPT_MODE_CBC, str_repeat("\0", $ivSize));
        } else if (SetaPDF_Core_SecHandler::$engine === 'openssl' && version_compare(phpversion(), '5.4', '>=')) {
            $ivSize = openssl_cipher_iv_length('AES-256-CBC');
            $ueValue = openssl_encrypt(
                $instance->_encryptionKey,
                'AES-256-CBC',
                $key,
                OPENSSL_RAW_DATA | OPENSSL_ZERO_PADDING,
                str_repeat("\0", $ivSize)
            );
        } else {
            throw new BadMethodCallException(
                'Unknown/unsupported engine defined: ' . SetaPDF_Core_SecHandler::$engine
            );
        }

        $encryptionDict->offsetGet('UE')->getValue()->setValue($ueValue);
	    
        $oValue = $instance->_computeOValue($userPassword, $ownerPassword);
        $encryptionDict->offsetGet('O')->getValue()->setValue($oValue);
	    // 2. Compute the 32-byte SHA-256 hash of the password concatenated with the Owner
	    //    Key Salt and then concatenated with the 48-byte U string as generated in
	    //    Algorithm 3.8. Using this hash as the key, encrypt the file encryption key
	    //    using AES-256 in CBC mode with no padding and an initialization vector of
	    //    zero. The resulting 32-byte string is stored as the OE key.
	    $keySalt = substr($oValue, 40);
	    $key = hash('sha256', $ownerPassword . $keySalt . $uValue, true);

        if (SetaPDF_Core_SecHandler::$engine === 'mcrypt') {
            $ivSize  = mcrypt_get_iv_size(MCRYPT_RIJNDAEL_128, MCRYPT_MODE_CBC);
            $oeValue = mcrypt_encrypt(MCRYPT_RIJNDAEL_128, $key, $instance->_encryptionKey, MCRYPT_MODE_CBC, str_repeat("\0", $ivSize));

        } else if (SetaPDF_Core_SecHandler::$engine === 'openssl' && version_compare(phpversion(), '5.4', '>=')) {
            $ivSize = openssl_cipher_iv_length('AES-256-CBC');
            $oeValue = openssl_encrypt(
                $instance->_encryptionKey,
                'AES-256-CBC',
                $key,
                OPENSSL_RAW_DATA | OPENSSL_ZERO_PADDING,
                str_repeat("\0", $ivSize)
            );
        } else {
            throw new BadMethodCallException(
                'Unknown/unsupported engine defined: ' . SetaPDF_Core_SecHandler::$engine
            );
        }

        $encryptionDict->offsetGet('OE')->getValue()->setValue($oeValue);
	    
        // 1. Extend the permissions (contents of the P integer) to 64 bits by setting
        //    the upper 32 bits to all 1’s. (This allows for future extension without
        //    changing the format.)
        $perms = substr(pack('V', $permissions), 0, 4)
               . "\xFF\xFF\xFF\xFF"
               . ($encryptMetadata ? 'T' : 'F') // 8
               . 'adb'   // 9-11
               . 'SeTa'; // 12-15: 4 random bytes

        if (SetaPDF_Core_SecHandler::$engine === 'mcrypt') {
            $ivSize     = mcrypt_get_iv_size(MCRYPT_RIJNDAEL_128, MCRYPT_MODE_ECB);
            $permsValue = mcrypt_encrypt(MCRYPT_RIJNDAEL_128, $instance->_encryptionKey, $perms, MCRYPT_MODE_ECB, str_repeat("\0", $ivSize));

        } else if (SetaPDF_Core_SecHandler::$engine === 'openssl' && version_compare(phpversion(), '5.4', '>=')) {
            $ivSize = openssl_cipher_iv_length('AES-256-ECB');
            $permsValue = openssl_encrypt(
                $perms,
                'AES-256-ECB',
                $instance->_encryptionKey,
                OPENSSL_RAW_DATA | OPENSSL_ZERO_PADDING,
                str_repeat("\0", $ivSize)
            );
        } else {
            throw new BadMethodCallException(
                'Unknown/unsupported engine defined: ' . SetaPDF_Core_SecHandler::$engine
            );
        }

	    $encryptionDict->offsetGet('Perms')->getValue()->setValue($permsValue);
	    
	    $instance->_auth = true;
	    $instance->_authMode = SetaPDF_Core_SecHandler::OWNER;
	    
	    return $instance;
    }
}