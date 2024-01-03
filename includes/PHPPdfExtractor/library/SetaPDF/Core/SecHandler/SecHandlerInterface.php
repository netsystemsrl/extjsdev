<?php
/**
 * This file is part of the SetaPDF-Core Component
 * 
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage SecHandler
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: SecHandlerInterface.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Security handler interface
 * 
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage SecHandler
 * @license    https://www.setasign.com/ Commercial
 */
interface SetaPDF_Core_SecHandler_SecHandlerInterface
{
    /**
     * Returns the document instance of this security handler.
     *
     * @return SetaPDF_Core_Document
     */
    public function getDocument();

    /**
     * Returns the encryption dictionary.
     * 
     * @return SetaPDF_Core_Type_Dictionary
     */
    public function getEncryptionDictionary();
    
    /**
     * Encrypts stream data through the desired security handler.
     * 
     * @param string $data
     * @param mixed $param 
     */
    public function encryptStream($data, $param = null);
    
    /**
     * Encrypts string data through the desired security handler.
     * 
     * @param string $data
     * @param mixed $param 
     */
    public function encryptString($data, $param = null);
    
    /**
     * Decrypts stream data through the desired security handler.
     * 
     * @param string $data
     * @param null|array|SetaPDF_Core_Type_IndirectObject $param An array of possible arguments
     */
    public function decryptStream($data, $param = null);
    
    /**
     * Decrypts string data through the desired security handler.
     * 
     * @param string $data
     * @param null|array|SetaPDF_Core_Type_IndirectObject $param An array of possible arguments
     */
    public function decryptString($data, $param = null);
    
    /**
     * Authenticate to the document with given credentials.
     * 
     * @param mixed $data Credentials data
     * @return boolean Authentication was successful or not
     */
    public function auth($data = null);
    
    /**
     * Returns the status if the handler is authenticated and ready to encrypt and decrypt strings or streams.
     * 
     * @return boolean
     */
    public function isAuth();
    
    /**
     * Queries if a permission is granted.
     * 
     * @param integer $permission
     */
    public function getPermission($permission);
    
    /**
     * Returns current permissions.
     * 
     * @return integer
     */
    public function getPermissions();
    
    /**
     * Returns the needed PDF version for this security handler.
     * 
     * @return string
     */
    public function getPdfVersion();
    
    /**
     * Returns true if the metadata are/will be encrypted.
     * 
     * @return boolean
     */
    public function getEncryptMetadata();

    /**
     * Get the auth mode.
     *
     * @return string
     */
    public function getAuthMode();

    /**
     * Get the encryption key if known/authenticated.
     *
     * @return string
     * @throws SetaPDF_Core_SecHandler_Exception
     */
    public function getEncryptionKey();
}