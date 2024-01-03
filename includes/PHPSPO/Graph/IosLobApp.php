<?php

/**
 * Generated by phpSPO model generator 2020-05-26T22:12:31+00:00 
 */
namespace Office365\Graph;

use Office365\Runtime\ClientObject;
use Office365\Runtime\ResourcePath;
class IosLobApp extends ClientObject
{
    /**
     * @return string
     */
    public function getBundleId()
    {
        if (!$this->isPropertyAvailable("BundleId")) {
            return null;
        }
        return $this->getProperty("BundleId");
    }
    /**
     * @var string
     */
    public function setBundleId($value)
    {
        $this->setProperty("BundleId", $value, true);
    }
    /**
     * @return string
     */
    public function getVersionNumber()
    {
        if (!$this->isPropertyAvailable("VersionNumber")) {
            return null;
        }
        return $this->getProperty("VersionNumber");
    }
    /**
     * @var string
     */
    public function setVersionNumber($value)
    {
        $this->setProperty("VersionNumber", $value, true);
    }
    /**
     * @return string
     */
    public function getBuildNumber()
    {
        if (!$this->isPropertyAvailable("BuildNumber")) {
            return null;
        }
        return $this->getProperty("BuildNumber");
    }
    /**
     * @var string
     */
    public function setBuildNumber($value)
    {
        $this->setProperty("BuildNumber", $value, true);
    }
    /**
     * @return IosDeviceType
     */
    public function getApplicableDeviceType()
    {
        if (!$this->isPropertyAvailable("ApplicableDeviceType")) {
            return null;
        }
        return $this->getProperty("ApplicableDeviceType");
    }
    /**
     * @var IosDeviceType
     */
    public function setApplicableDeviceType($value)
    {
        $this->setProperty("ApplicableDeviceType", $value, true);
    }
    /**
     * @return IosMinimumOperatingSystem
     */
    public function getMinimumSupportedOperatingSystem()
    {
        if (!$this->isPropertyAvailable("MinimumSupportedOperatingSystem")) {
            return null;
        }
        return $this->getProperty("MinimumSupportedOperatingSystem");
    }
    /**
     * @var IosMinimumOperatingSystem
     */
    public function setMinimumSupportedOperatingSystem($value)
    {
        $this->setProperty("MinimumSupportedOperatingSystem", $value, true);
    }
}