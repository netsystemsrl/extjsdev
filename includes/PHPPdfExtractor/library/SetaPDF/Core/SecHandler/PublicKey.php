<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage SecHandler
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: PublicKey.php 1059 2017-06-09 09:30:10Z jan.slabon $
 */

/**
 * Security handler class handling public key encryption features.
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage SecHandler
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_SecHandler_PublicKey extends SetaPDF_Core_SecHandler_AbstractHandler
    implements SetaPDF_Core_SecHandler_SecHandlerInterface
{
    /**
     * Permission constant.
     *
     * When set permits change of encryption and enables all other permissions.
     *
     * @see PDF 32000-1:2008 - Table 24 - Public-Key security handler user access permissions
     * @var integer
     */
    const PERM_OWNER = 2;

    /**
     * An array of temporary filenames which needs to be deleted on destruction.
     *
     * @var array
     */
    private $_tempFiles = array();

    /**
     * An array holding authentication data.
     *
     * @var array
     */
    protected $_authData = array(
        'perm' => 0
    );

    /**
     * The cipher id that is passed to openssl_pkcs7_encrypt().
     *
     * @var int
     * @see http://php.net/manual/en/openssl.ciphers.php
     */
    protected $_cipherId = OPENSSL_CIPHER_RC2_40;

    /**
     * Set the cipher id, that will be passed to openssl_pkcs7_encrypt().
     *
     * ISO/DIS 32000-2: 7.6.5.3 Public-key encryption algorithms:
     * <cite>
     * The algorithms that shall be used to encrypt the enveloped data in the PKCS#7 object are: RC4 with key
     * lengths up to 256-bits, DES, Triple DES, RC2 with key lengths up to 128 bits, 128-bit AES in Cipher Block
     * Chaining (CBC) mode, 192-bit AES in CBC mode, 256-bit AES in CBC mode.
     * </cite>
     *
     * @param $cipherId
     * @see http://php.net/manual/en/openssl.ciphers.php
     */
    public function setCipherId($cipherId)
    {
        $this->_cipherId = $cipherId;
    }

    /**
     * Get the cipher id, that will be passed to openssl_pkcs7_encrypt().
     *
     * @return int
     * @see http://php.net/manual/en/openssl.ciphers.php
     */
    public function getCipherId()
    {
        return $this->_cipherId;
    }

    /**
     * Removes temporary files.
     */
    protected function _cleanUp()
    {
        foreach ($this->_tempFiles AS $tempFile) {
            @unlink($tempFile);
        }
    }

    /**
     * Prepares the PKCS#7 envelopes.
     *
     * @param SetaPDF_Core_SecHandler_PublicKey_Recipient[] $recipients
     * @param string $seed
     * @return string[]
     * @throws Exception
     */
    protected function _prepareEnvelopes(array $recipients, $seed)
    {
        $envelopes = array();

        try {
            // There shall be only one PKCS#7 object per unique set of access permissions
            $permissionGroups = array();
            foreach ($recipients AS $recipient) {
                if (!($recipient instanceof SetaPDF_Core_SecHandler_PublicKey_Recipient)) {
                    throw new SetaPDF_Core_SecHandler_Exception(
                        'Recipient needs to be an instance of SetaPDF_Core_SecHandler_PublicKey_Recipient.'
                    );
                }

                if (!isset($permissionGroups[$recipient->getPermissions()])) {
                    $permissionGroups[$recipient->getPermissions()] = array();
                }

                $permissionGroups[$recipient->getPermissions()][] = $recipient;
            }

            foreach ($permissionGroups AS $permissions => $recipients) {
                /**
                 * @var SetaPDF_Core_SecHandler_PublicKey_Recipient $recipient
                 */
                $envelopeData = $seed . $this->_preparePermission($permissions);

                $tmpFileIn = SetaPDF_Core_Writer_TempFile::createTempPath();
                $this->_tempFiles[] = $tmpFileIn;
                file_put_contents($tmpFileIn, $envelopeData);

                $tmpFileOut = SetaPDF_Core_Writer_TempFile::createTempPath();
                $this->_tempFiles[] = $tmpFileOut;


                $certificates = array();
                foreach ($recipients AS $recipient) {
                    $certificates[] = $recipient->getCertificate();
                }

                $stat = openssl_pkcs7_encrypt(
                    $tmpFileIn, $tmpFileOut, $certificates, array(), PKCS7_BINARY, $this->getCipherId()
                );

                if (false === $stat) {
                    $errorMsgs = array();
                    while ($errorMsg = openssl_error_string()) {
                        $errorMsgs[] = $errorMsg;
                    }

                    throw new SetaPDF_Core_SecHandler_Exception('OpenSSL error: ' . join(', ', $errorMsgs));
                }

                $data = file_get_contents($tmpFileOut);
                $data = preg_split("/(\r\n\r\n|\n\n|\r\r)/", $data, 2);
                $data = base64_decode(trim($data[1]));

                if ('' === $data) {
                    throw new SetaPDF_Core_SecHandler_Exception(
                        'Error while extracting the encrypted content of the smime message'
                    );
                }

                $envelopes[] = $data;
            }
        } catch (Exception $e) {
            $this->_cleanUp();
            throw $e;
        }

        $this->_cleanUp();

        return $envelopes;
    }

    /**
     * Computes the encryption key.
     *
     * @param string[] $envelopes
     * @param string $seed
     * @param bool|true $encryptMetadata
     * @return string
     */
    protected function _computeEncryptionKey(array $envelopes, $seed, $encryptMetadata = true)
    {
        $data = $seed . join('', $envelopes) . ($encryptMetadata ? '' : "\xFF\xFF\xFF\xFF");
        if ($this->_stringAlgorithm[0] === SetaPDF_Core_SecHandler::AES_256) {
            return substr(hash('sha256', $data, true), 0, $this->_keyLength);
        } else {

            return substr(sha1($data, true), 0, $this->_keyLength);
        }
    }

    /**
     * Prepares permission flag.
     *
     * @param int $permissions
     * @return string
     */
    protected function _preparePermission($permissions)
    {
        // bit 1 is required to allow opening...
        // 61633 = bit 1, bit 7, bit 8, bit 13 to 16
        // 0xFFFF0000 = bit 17 - 32
        $permissions = 61633 | 0xFFFF0000 | $permissions;
        $permissions = SetaPDF_Core_Type_Numeric::ensure32BitInteger($permissions);
        return pack('N', $permissions);
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
            SetaPDF_Core_SecHandler_PublicKey::PERM_OWNER |
            SetaPDF_Core_SecHandler::PERM_PRINT |
            SetaPDF_Core_SecHandler::PERM_MODIFY |
            SetaPDF_Core_SecHandler::PERM_COPY |
            SetaPDF_Core_SecHandler::PERM_ANNOT |
            SetaPDF_Core_SecHandler::PERM_FILL_FORM |
            SetaPDF_Core_SecHandler::PERM_ACCESSIBILITY |
            SetaPDF_Core_SecHandler::PERM_ASSEMBLE |
            SetaPDF_Core_SecHandler::PERM_DIGITAL_PRINT
        );

        if ($this->getAuthMode() === SetaPDF_Core_SecHandler::OWNER) {
            return $all;
        }

        if ($this->_authData['perm'] & SetaPDF_Core_SecHandler_PublicKey::PERM_OWNER) {
            return $all;
        }

        return $this->_authData['perm'] & $all;
    }

    /**
     * Authenticate to the security handler with a certificate and private key.
     *
     * @param mixed $recipientCert See parameter $recipcert of
     *                             {@link http://php.net/openssl_pkcs7_decrypt openssl_pkcs7_decrypt()}.
     * @param mixed $recipientKey See parameter $recipkey of
     *                             {@link http://php.net/openssl_pkcs7_decrypt openssl_pkcs7_decrypt()}.
     * @return bool
     * @throws SetaPDF_Core_SecHandler_Exception
     * @throws Exception
     */
    public function auth($recipientCert = null, $recipientKey = null)
    {
        try {
            if (null === $recipientCert) {
                throw new SetaPDF_Core_SecHandler_Exception('Authentication only possible with a certificate.');
            }

            $dict = $this->_encryptionDictionary;
            $subFilter = $dict->getValue('SubFilter')->getValue();

            switch ($subFilter) {
                case 'adbe.pkcs7.s3':
                case 'adbe.pkcs7.s4':
                    $recipients = $dict->getValue('Recipients')->ensure();
                    $encryptMetadata = true;
                    break;
                case 'adbe.pkcs7.s5':
                    /**
                     * @var $cf SetaPDF_Core_Type_Dictionary
                     * @var $defaultCryptFilter SetaPDF_Core_Type_Dictionary
                     */
                    $cf = $dict->getValue('CF')->ensure();
                    $defaultCryptFilter = $cf->getValue('DefaultCryptFilter')->ensure();
                    $recipients = $defaultCryptFilter->getValue('Recipients')->ensure();
                    $encryptMetadata = $defaultCryptFilter->offsetExists('EncryptMetadata')
                        ? $defaultCryptFilter->getValue('EncryptMetadata')->getValue()
                        : true;
                    break;
                default:
                    throw new SetaPDF_Core_SecHandler_Exception(
                        sprintf('Unsupported SubFilter "%s"', $subFilter)
                    );
            }

            if (!$recipients instanceof SetaPDF_Core_Type_Array) {
                throw new SetaPDF_Core_SecHandler_Exception('Unexpected recipients data type.');
            }


            $header = "MIME-Version: 1.0\nContent-Disposition: attachment; filename=\"smime.p7m\"\nContent-Type: "
                . "application/x-pkcs7-mime; smime-type=enveloped-data; name=\"smime.p7m\"\nContent-Transfer-Encoding: "
                . "base64\n\n";

            foreach ($recipients AS $recipient) {
                $tmpFileIn = SetaPDF_Core_Writer_TempFile::createTempPath();
                $mime = $header . chunk_split(base64_encode($recipient->getValue()), 76, "\n") . "\n\n";
                file_put_contents($tmpFileIn, $mime);

                $tmpFileOut = SetaPDF_Core_Writer_TempFile::createTempPath();
                $this->_tempFiles[] = $tmpFileIn;
                $this->_tempFiles[] = $tmpFileOut;

                if (null === $recipientKey) {
                    $stat = openssl_pkcs7_decrypt($tmpFileIn, $tmpFileOut, $recipientCert);
                } else {
                    $stat = openssl_pkcs7_decrypt($tmpFileIn, $tmpFileOut, $recipientCert, $recipientKey);
                }

                if ($stat) {
                    $envelopeData = file_get_contents($tmpFileOut);
                    $seed = substr($envelopeData, 0, 20);
                    $perm = unpack('Nperm', substr($envelopeData, 20, 24));
                    $perm = $perm['perm'];

                    $this->_encryptionKey = $this->_computeEncryptionKey($recipients->toPhp(), $seed, $encryptMetadata);
                    $this->_authData['perm'] = $perm;
                    $this->_authMode = ($perm & self::PERM_OWNER)
                        ? SetaPDF_Core_SecHandler::OWNER
                        : SetaPDF_Core_SecHandler::USER;

                    $this->_auth = true;

                    return true;
                }
            }
        } catch (Exception $e) {
            $this->_cleanUp();
            throw $e;
        }

        $this->_cleanUp();

        return false;
    }
}