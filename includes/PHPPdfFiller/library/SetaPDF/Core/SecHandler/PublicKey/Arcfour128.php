<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage SecHandler
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Arcfour128.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Generator class for RC4 40 bit public-key security handler
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage SecHandler
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_SecHandler_PublicKey_Arcfour128 extends SetaPDF_Core_SecHandler_PublicKey
{
    /**
     * Factory method for RC4 128 bit public-key security handler.
     *
     * @param SetaPDF_Core_Document $document
     * @param SetaPDF_Core_SecHandler_PublicKey_Recipient[]|SetaPDF_Core_SecHandler_PublicKey_Recipient $recipients
     * @throws SetaPDF_Core_SecHandler_Exception
     * @return SetaPDF_Core_SecHandler_PublicKey_Arcfour128
     */
    static public function factory(
        SetaPDF_Core_Document $document,
        $recipients
    )
    {
        if (!is_array($recipients)) {
            $recipients = array($recipients);
        }

        $encryptionDict = new SetaPDF_Core_Type_Dictionary();
        $encryptionDict->offsetSet('Filter', new SetaPDF_Core_Type_Name('Adobe.PubSec', true));
        
        $encryptionDict->offsetSet('V', new SetaPDF_Core_Type_Numeric(2));
        $encryptionDict->offsetSet('SubFilter', new SetaPDF_Core_Type_Name('adbe.pkcs7.s4', true));
        $encryptionDict->offsetSet('Length', new SetaPDF_Core_Type_Numeric(128));
        // Resolved from Acrobat but undocumentated and not consistent with other generators...
        // $encryptionDict->offsetSet('R', new SetaPDF_Core_Type_Numeric(131105));

        $_recipients = new SetaPDF_Core_Type_Array();
        $encryptionDict->offsetSet('Recipients', $_recipients);

        $instance = new self($document, $encryptionDict);
        $instance->setCipherId(OPENSSL_CIPHER_RC2_128);

        // create a 20byte seed
        $seed = $instance->generateRandomBytes(20);
        $envelopes = $instance->_prepareEnvelopes($recipients, $seed);

        $encryptionKey = $instance->_computeEncryptionKey($envelopes, $seed);

        foreach ($envelopes AS $envelope) {
            $_envelope =  new SetaPDF_Core_Type_String($envelope);
            $_envelope->setBypassSecHandler();
            $_recipients[] = $_envelope;
        }

	    $instance->_encryptionKey = $encryptionKey;
	    $instance->_auth = true;
	    $instance->_authMode = SetaPDF_Core_SecHandler::OWNER;
	    
	    return $instance;
    }
}