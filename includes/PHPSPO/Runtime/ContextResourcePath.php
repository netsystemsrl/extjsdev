<?php


namespace Office365\Runtime;


class ContextResourcePath extends ResourcePath
{

    public function __construct(ClientRuntimeContext $context)
    {
        parent::__construct($context);
    }


    /**
     * @return string
     */
    public function toString()
    {
        return null;
    }
}