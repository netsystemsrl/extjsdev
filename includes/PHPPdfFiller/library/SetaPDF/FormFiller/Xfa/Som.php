<?php
/**
 * This file is part of the SetaPDF-FormFiller Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_FormFiller
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Som.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * The helper class working with SOM expressions.
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_FormFiller
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_FormFiller_Xfa_Som
{
    /**
     * Prepares a SOM expression for further usage.
     *
     * @param string $som
     * @return array
     */
    static public function prepareSomExpression($som)
    {
        #$som = SetaPDF_FormFiller_Xfa_Som::evaluateSomShortcuts($som);

        $newPath = $elements = array();

        $elements = preg_split("/(?<!\\\)\./", $som);

        /* We index some names, so it is easier to remove them if we need to search only
         * in the data packet.
         */
        foreach ($elements AS $element) {
            if (strpos($element, '[') === 0) {
                $newPath[count($newPath) - 1][1] = trim($element, '[]');
            } else {
                $filter = '*';
                $start = strpos($element, '[');
                if ($start !== false) {
                    $end = strpos($element, ']');
                    $filter = substr($element, $start + 1, $end - $start - 1);
                    if (is_numeric($filter))
                        $filter = (int)$filter;
                    $element = substr($element, 0, $start);
                }

                $element = self::unescape($element);
                $newPath[] = array($element, $filter);
            }
        }

        return $newPath;
    }

    /**
     * Translates SOM shortcuts in a SOM expression to their full names.
     *
     * @param string $som
     * @param string $dataRoot Relative root path
     * @return array|string
     * @throws SetaPDF_FormFiller_Exception
     */
    static public function evaluateSomShortcuts($som, $dataRoot = 'xfa.datasets.data')
    {
        if (strpos($som, '!') === 0) {
            return 'xfa.datasets.' . substr($som, 1);
        }

        if (strpos($som, '$') !== 0) {
            return $som;
        }

        $elements = explode('.', $som, 2);

        switch ($elements[0]) {
            // Selecting Descendants At Any Level ".."
            case '':
                return array('');
            case '$':
                $elements[0] = $dataRoot;
                break;
            case '$data':
                $elements[0] = 'xfa.datasets.data';
                break;
            case '$template':
                $elements[0] = 'xfa.template';
                break;
            case '$connectionSet':
                $elements[0] = 'xfa.connectionSet';
                break;
            case '$xfa':
                $elements[0] = 'xfa';
                break;
            default:
                throw new SetaPDF_FormFiller_Exception(
                    'Unsupported SOM shortcut: ' . $elements[0]
                );
        }

        return join('.', $elements);
    }

    /**
     * Escapes dots in a SOM expression.
     *
     * @param array|string $som
     * @return array|mixed
     */
    static public function escape($som)
    {
        if (is_array($som)) {
            foreach ($som AS $key => $value) {
                $som[$key] = self::escape($value);
            }

            return $som;
        }

        return str_replace('.', '\\.', $som);
    }

    /**
     * Unescapes characters in a SOM expression.
     *
     * @param array|string $som
     * @return array|string
     */
    static public function unescape($som)
    {
        if (is_array($som)) {
            foreach ($som AS $key => $value) {
                $som[$key] = self::escape($value);
            }

            return $som;
        }

        $out = '';
        for ($count = 0, $n = strlen($som); $count < $n; $count++) {
            if ($som[$count] != '\\') {
                $out .= $som[$count];
            } else {
                $out .= $som[++$count];
            }
        }

        return $out;
    }

    /**
     * Filters a node list by given filter values.
     *
     * Actually only numeric offsets or a wildcard filter are available.
     *
     * @param array|DOMNodeList $nodeList
     * @param mixed $filter
     * @return array
     * @throws SetaPDF_FormFiller_Exception
     */
    protected function _filterNode($nodeList, $filter)
    {
        if (
            is_array($nodeList) && count($nodeList) === 0 ||
            $nodeList instanceof DOMNameList && $nodeList->length === 0
        ) {
            return array();
        }

        if (is_numeric($filter)) {
            if (!isset($nodeList[$filter])) {
                return array();
            }
            return array($nodeList[$filter]);
        }

        if ('*' === $filter) {
            $result = array();
            foreach ($nodeList AS $node) {
                $result[] = $node;
            }

            return $result;
        }

        // predicate
        throw new SetaPDF_FormFiller_Exception(
            'Som expressions with such predicate match are not supported: ' . $filter
        );
    }

    /**
     * Evaluates a SOM expression in the given context and returs the matched node(s).
     *
     * @param string $som
     * @param DOMElement|DOMElement[] $context
     * @return DOMElement|DOMElement[]|bool
     * @throws Exception
     */
    public function evaluate($som, $context)
    {
        $som = self::prepareSomExpression($som);
        if (!is_array($context))
            $context = array($context);

        $document = $context[0]->ownerDocument;

        $xpath = new DOMXPath($document);
        $xpath->registerNamespace('xfa', 'http://www.xfa.org/schema/xfa-data/1.0/');

        for ($n = 0, $pathCount = count($som); $n < $pathCount; $n++) {
            $deep = false;
            $nodeInfo = $som[$n];
            $name = $nodeInfo[0];
            $filter = $nodeInfo[1];

            // A direct attribute match: .#name
            if (strlen($name) > 0 && $name[0] === '#') {
                foreach ($context AS $_context) {
                    if (!$_context instanceof DOMNode) {
                        return false;
                    }

                    $attributeName = ltrim($name, '#');

                    if ($_context->hasAttributes()) {
                        $attribute = $_context->getAttributeNode($attributeName);
                        if ($attribute !== false) {
                            return $attribute;
                        }
                    }
                }

                return false;
            }

            switch ($name) {
                case 'parent':
                    $context = array($context[0]->parentNode);
                    break;
                case '*':
                    $newContext = array();
                    foreach ($context AS $_context) {
                        if (!$_context instanceof DOMNode) {
                            return false;
                        }
                        $result = $xpath->query('child::*', $_context);
                        $newContext = array_merge($newContext, $this->_filterNode($result, '*'));
                    }
                    $context = $newContext;
                    break;
                // Selecting Descendants At Any Level
                /** @noinspection PhpMissingBreakStatementInspection */
                case '':
                    $nodeInfo = $som[++$n];
                    $deep = true;
                    $name = $nodeInfo[0];
                    $filter = $nodeInfo[1];

                default:
                    $result = array();
                    foreach ($context AS $_context) {
                        if (!$_context instanceof DOMNode) {
                            return false;
                        }

                        if (strpos($_context->namespaceURI, 'http://www.xfa.org/schema/xfa-template') === 0) {
                            // Template DOM -> ignore unnamed nodes
                            if ($deep) {
                                $_result = $xpath->query('.//*[@name="' . $name . '"]', $_context);
                            } else {
                                $_result = array();
                                $this->_evaluateDirectMatch($name, $_context, $_result);
                            }

                        } else {
                            if ($deep) {
                                $_result = $xpath->query('.//' . $name . '|' . './/*[@name="' . $name . '"]', $_context);
                            } else {
                                $_result = $xpath->query($name . '|' . '*[@name="' . $name . '"]', $_context);
                            }
                        }

                        foreach ($_result AS $node) {
                            $result[] = $node;
                        }
                    }

                    // $lastContext = $context;

                    $context = $this->_filterNode($result, $filter);

                    /* Match via attribute in this method? Shouldn't be the case, because
                     * of the priority in the matching sequences (direct match, scope match,...)
                     * Anyhow sometimes e.g. a "direct bound" field matches an attribute if
                     * no value node is found.
                    if (count($context) == 0 && ($pathCount - 1) == $n) {
                        foreach ($lastContext AS $_context) {
                            if (!$_context instanceof DOMNode) {
                                continue;
                            }

                            if ($_context->hasAttributes()) {
                                $attribute = $_context->getAttributeNode($name);
                                if ($attribute !== false) {
                                    $context[] = $attribute;
                                }
                            }
                        }

                        $context = $this->_filterNode($context, '*');
                    }*/
            }
        }

        $count = count($context);
        if ($count === 1) {
            return $context[0];
        } elseif ($count === 0) {
            return false;
        }

        return $context;
    }

    /**
     * Evaluates a direct match by ignoring invisible/unnamed nodes.
     *
     * @param string $name
     * @param DOMElement $context
     * @param array $result
     */
    protected function _evaluateDirectMatch($name, DOMElement $context, array &$result)
    {
        $childNodes = $context->childNodes;

        foreach ($childNodes AS $childNode) {
            if (!$childNode instanceof DOMElement) {
                continue;
            }

            if (!$childNode->hasAttribute('name') ||
                $childNode->hasAttribute('scope') && $childNode->getAttribute('scope') == 'none' ||
                $childNode->tagName == 'area'
            ) {
                $this->_evaluateDirectMatch($name, $childNode, $result);
            } else if ($childNode->getAttribute('name') == $name) {
                $result[] = $childNode;
            }
        }
    }
}