<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage SecHandler
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Recipient.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Class representing a recipient of a public-key encrypted PDF document.
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage SecHandler
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_SecHandler_PublicKey_Recipient
{
    /**
     * The permissions for this recipient.
     *
     * @var int
     */
    protected $_permissions = 0;

    /**
     * The certificate/public key for this recipient.
     *
     * @var mixed
     * @see http://php.net/manual/en/openssl.certparams.php
     */
    protected $_certificate;

    /**
     * The constructor.
     *
     * @param mixed $certificate The certificate of the recipient. See {@link http://php.net/manual/en/openssl.certparams.php} for further details.
     * @param int $permissions
     */
    public function __construct($certificate, $permissions = 0)
    {
        $this->setPermissions($permissions);
        $this->_certificate = $certificate;
    }

    /**
     * Set the permissions for this recipient.
     *
     * @param int $permissions
     */
    public function setPermissions($permissions)
    {
        $this->_permissions = $permissions &
            (
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
    }

    /**
     * Get the permissions for this recipient.
     *
     * @return int
     */
    public function getPermissions()
    {
        return $this->_permissions;
    }

    /**
     * Get the certificate.
     *
     * @return mixed
     */
    public function getCertificate()
    {
        return $this->_certificate;
    }
}