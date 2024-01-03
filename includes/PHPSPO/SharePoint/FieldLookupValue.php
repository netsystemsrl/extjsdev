<?php
/**
 * Specifies the value of a lookup for a field within a list item
 */

namespace Office365\SharePoint;


use Office365\Runtime\ClientValue;

class FieldLookupValue extends ClientValue
{
    /**
     * Gets or sets the identifier (ID) of the list item that this instance of the lookup field is referring to.
     * @var int
     */
    public $LookupId;


    /**
     * Gets a summary of the list item that this instance of the lookup field is referring to.
     * @var string
     */
    public $LookupValue;

}