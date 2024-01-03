<?php

/**
 * Generated by phpSPO model generator 2020-05-26T22:12:31+00:00 
 */
namespace Office365\Graph;

use Office365\Runtime\ClientObject;
use Office365\Runtime\ResourcePath;
class SharedPCConfiguration extends ClientObject
{
    /**
     * @return bool
     */
    public function getAllowLocalStorage()
    {
        if (!$this->isPropertyAvailable("AllowLocalStorage")) {
            return null;
        }
        return $this->getProperty("AllowLocalStorage");
    }
    /**
     * @var bool
     */
    public function setAllowLocalStorage($value)
    {
        $this->setProperty("AllowLocalStorage", $value, true);
    }
    /**
     * @return bool
     */
    public function getDisableAccountManager()
    {
        if (!$this->isPropertyAvailable("DisableAccountManager")) {
            return null;
        }
        return $this->getProperty("DisableAccountManager");
    }
    /**
     * @var bool
     */
    public function setDisableAccountManager($value)
    {
        $this->setProperty("DisableAccountManager", $value, true);
    }
    /**
     * @return bool
     */
    public function getDisableEduPolicies()
    {
        if (!$this->isPropertyAvailable("DisableEduPolicies")) {
            return null;
        }
        return $this->getProperty("DisableEduPolicies");
    }
    /**
     * @var bool
     */
    public function setDisableEduPolicies($value)
    {
        $this->setProperty("DisableEduPolicies", $value, true);
    }
    /**
     * @return bool
     */
    public function getDisablePowerPolicies()
    {
        if (!$this->isPropertyAvailable("DisablePowerPolicies")) {
            return null;
        }
        return $this->getProperty("DisablePowerPolicies");
    }
    /**
     * @var bool
     */
    public function setDisablePowerPolicies($value)
    {
        $this->setProperty("DisablePowerPolicies", $value, true);
    }
    /**
     * @return bool
     */
    public function getDisableSignInOnResume()
    {
        if (!$this->isPropertyAvailable("DisableSignInOnResume")) {
            return null;
        }
        return $this->getProperty("DisableSignInOnResume");
    }
    /**
     * @var bool
     */
    public function setDisableSignInOnResume($value)
    {
        $this->setProperty("DisableSignInOnResume", $value, true);
    }
    /**
     * @return bool
     */
    public function getEnabled()
    {
        if (!$this->isPropertyAvailable("Enabled")) {
            return null;
        }
        return $this->getProperty("Enabled");
    }
    /**
     * @var bool
     */
    public function setEnabled($value)
    {
        $this->setProperty("Enabled", $value, true);
    }
    /**
     * @return integer
     */
    public function getIdleTimeBeforeSleepInSeconds()
    {
        if (!$this->isPropertyAvailable("IdleTimeBeforeSleepInSeconds")) {
            return null;
        }
        return $this->getProperty("IdleTimeBeforeSleepInSeconds");
    }
    /**
     * @var integer
     */
    public function setIdleTimeBeforeSleepInSeconds($value)
    {
        $this->setProperty("IdleTimeBeforeSleepInSeconds", $value, true);
    }
    /**
     * @return string
     */
    public function getKioskAppDisplayName()
    {
        if (!$this->isPropertyAvailable("KioskAppDisplayName")) {
            return null;
        }
        return $this->getProperty("KioskAppDisplayName");
    }
    /**
     * @var string
     */
    public function setKioskAppDisplayName($value)
    {
        $this->setProperty("KioskAppDisplayName", $value, true);
    }
    /**
     * @return string
     */
    public function getKioskAppUserModelId()
    {
        if (!$this->isPropertyAvailable("KioskAppUserModelId")) {
            return null;
        }
        return $this->getProperty("KioskAppUserModelId");
    }
    /**
     * @var string
     */
    public function setKioskAppUserModelId($value)
    {
        $this->setProperty("KioskAppUserModelId", $value, true);
    }
    /**
     * @return SharedPCAccountManagerPolicy
     */
    public function getAccountManagerPolicy()
    {
        if (!$this->isPropertyAvailable("AccountManagerPolicy")) {
            return null;
        }
        return $this->getProperty("AccountManagerPolicy");
    }
    /**
     * @var SharedPCAccountManagerPolicy
     */
    public function setAccountManagerPolicy($value)
    {
        $this->setProperty("AccountManagerPolicy", $value, true);
    }
}