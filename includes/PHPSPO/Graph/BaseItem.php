<?php

/**
 * Generated by phpSPO model generator 2020-05-25T05:58:15+00:00 
 */
namespace Office365\Graph;


use Office365\Runtime\ResourcePath;
class BaseItem extends Entity
{
    /**
     * @return string
     */
    public function getDescription()
    {
        if (!$this->isPropertyAvailable("Description")) {
            return null;
        }
        return $this->getProperty("Description");
    }
    /**
     * @var string
     */
    public function setDescription($value)
    {
        $this->setProperty("Description", $value, true);
    }
    /**
     * @return string
     */
    public function getETag()
    {
        if (!$this->isPropertyAvailable("ETag")) {
            return null;
        }
        return $this->getProperty("ETag");
    }
    /**
     * @var string
     */
    public function setETag($value)
    {
        $this->setProperty("ETag", $value, true);
    }
    /**
     * @return string
     */
    public function getName()
    {
        if (!$this->isPropertyAvailable("Name")) {
            return null;
        }
        return $this->getProperty("Name");
    }
    /**
     * @var string
     */
    public function setName($value)
    {
        $this->setProperty("Name", $value, true);
    }
    /**
     * @return string
     */
    public function getWebUrl()
    {
        if (!$this->isPropertyAvailable("WebUrl")) {
            return null;
        }
        return $this->getProperty("WebUrl");
    }
    /**
     * @var string
     */
    public function setWebUrl($value)
    {
        $this->setProperty("WebUrl", $value, true);
    }
    /**
     * @return User
     */
    public function getCreatedByUser()
    {
        if (!$this->isPropertyAvailable("CreatedByUser")) {
            $this->setProperty("CreatedByUser", new User($this->getContext(), new ResourcePath("CreatedByUser", $this->getResourcePath())));
        }
        return $this->getProperty("CreatedByUser");
    }
    /**
     * @return User
     */
    public function getLastModifiedByUser()
    {
        if (!$this->isPropertyAvailable("LastModifiedByUser")) {
            $this->setProperty("LastModifiedByUser", new User($this->getContext(), new ResourcePath("LastModifiedByUser", $this->getResourcePath())));
        }
        return $this->getProperty("LastModifiedByUser");
    }
    /**
     * @return IdentitySet
     */
    public function getCreatedBy()
    {
        if (!$this->isPropertyAvailable("CreatedBy")) {
            return null;
        }
        return $this->getProperty("CreatedBy");
    }
    /**
     * @var IdentitySet
     */
    public function setCreatedBy($value)
    {
        $this->setProperty("CreatedBy", $value, true);
    }
    /**
     * @return IdentitySet
     */
    public function getLastModifiedBy()
    {
        if (!$this->isPropertyAvailable("LastModifiedBy")) {
            return null;
        }
        return $this->getProperty("LastModifiedBy");
    }
    /**
     * @var IdentitySet
     */
    public function setLastModifiedBy($value)
    {
        $this->setProperty("LastModifiedBy", $value, true);
    }
    /**
     * @return ItemReference
     */
    public function getParentReference()
    {
        if (!$this->isPropertyAvailable("ParentReference")) {
            return null;
        }
        return $this->getProperty("ParentReference");
    }
    /**
     * @var ItemReference
     */
    public function setParentReference($value)
    {
        $this->setProperty("ParentReference", $value, true);
    }
}