<?php
/**
 * This file is part of the SetaPDF-FormFiller Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_FormFiller
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Bridge.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * The helper class for processing XFA data and template data.
 *
 * This class matches data nodes to template nodes and creates data nodes if they are not available.
 *
 * The class actually only supports the default "mergeMode": "consumeData" mode.
 *
 * So the logic for updating a field by its AcroForm name will be:
 * - Check if a data node is already found for this specific field.
 *   - if not, start the data parsing process which mappes all find value nodes to specific
 *     fields if they don't have a bind-value.
 *   - direct matches have a higher priority than scope matches.
 * - The process have to be done twice in case a direct match had overwritten a scope matched relation.
 * - If the field still have no data node attached to it create a node (tree) for it and attach it.
 *   (only if the match attribute of the bind-value is not set to "none".)
 * - Update the node if available.
 *
 * Updating by changed XML data:
 * - remove all bounded data nodes from all available fields
 * - start the data parsing process and attach the nodes to the fields.
 * - Iterate over all fields (XML) and set their values in their corresponding
 *   AcroForm fields. (omit recursivity)
 *
 * TODO:
 * - “Extended Mapping Rules” on page 508. (XFA Specification - 3.3)
 * - XSLT Transformations (see page 545 - XFA Specification - 3.3)
 * - Resolve mergeMode-attribute from root node (introduced in XFA 3.1, so maybee obsolete atm)
 * - Handling of "picture" clauses (see page 156 / 1150 - XFA Specification - 3.3)
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_FormFiller
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_FormFiller_Xfa_Bridge
{
    /**
     * The template node.
     *
     * @var DOMElement
     */
    protected $_template;

    /**
     * The data node.
     *
     * @var DOMElement
     */
    protected $_data;

    /**
     * A hash map for relation between a field node and its corresponding AcroForm representation.
     *
     * The keys are the field names used in the AcroForm field. The value is the field node itself.
     *
     * @var array
     */
    protected $_acroFormFieldNamesToTemplateNodes;

    /**
     * The current found binding from an accestor node.
     *
     * @var string
     */
    protected $_currentBinding;

    /**
     * The data node for a template node.
     *
     * @var SplObjectStorage
     */
    protected $_dataNodeByTemplateNode;

    /**
     * The default data path by a field node.
     *
     * @var SplObjectStorage
     */
    protected $_dataPathByField;

    /**
     * Fieldnames by field nodes.
     *
     * @var SplObjectStorage
     */
    protected $_fieldToFieldName;

    /**
     * The dataRef bindings of field nodes.
     *
     * @var SplObjectStorage
     */
    protected $_dataRefBinding;

    /**
     * Global bindungs by field nodes.
     *
     * @var SplObjectStorage
     */
    protected $_globalBinding;

    /**
     * None bindings by field nodes.
     *
     * @var SplObjectStorage
     */
    protected $_noneBinding;

    /**
     * The current index of the data nodes in the data root element.
     *
     * @var integer
     */
    protected $_currentRootIndex;

    /**
     * Flag indicating if the data were processed or not.
     *
     * @var bool
     */
    protected $_dataProcessed = false;

    /**
     * The constructor
     *
     * @param DOMElement $template
     * @param DOMElement $data
     */
    public function __construct(DOMElement $template, DOMElement $data)
    {
        $this->_template = $template;
        $this->_data = $data;

        $this->_parseTemplate();
    }

    /**
     * Release memory and cycled references.
     */
    public function cleanUp()
    {
        $this->_template = null;
        $this->_data = null;

        $this->_acroFormFieldNamesToTemplateNodes = null;
        $this->_dataNodeByTemplateNode = null;
        $this->_dataPathByField = null;
        $this->_fieldToFieldName = null;
        $this->_dataRefBinding = null;
        $this->_globalBinding = null;
        $this->_noneBinding = null;
    }

    /**
     * Parses the template and evaluates direct and global bindings.
     */
    protected function _parseTemplate()
    {
        // reset data
        $this->_acroFormFieldNamesToTemplateNodes = array();
        $this->_dataNodeByTemplateNode = new SplObjectStorage();
        $this->_dataPathByField = new SplObjectStorage();
        $this->_fieldToFieldName = new SplObjectStorage();
        $this->_dataRefBinding = new SplObjectStorage();
        $this->_globalBinding = new SplObjectStorage();
        $this->_noneBinding = new SplObjectStorage();
        $this->_dataProcessed = false;

        $this->_processTemplate($this->_template);
        // try to get the value via a bind element
        foreach ($this->_dataRefBinding AS $node) {
            $this->_evaluateDataRefBindings($node);
        }

        foreach ($this->_globalBinding AS $node) {
            $this->_evaluateGlobalBindings($node);
        }
    }

    /**
     * Processes a template node recursively.
     *
     * This method resolves the field names representing the AcroForm fields in the PDF structure
     * and ensures direct data pathes.
     *
     * @param DOMNode $node
     * @param array $path
     * @param array $dataPathCache
     * @param string $currentDataPath
     */
    private function _processTemplate(
        DOMNode $node,
        array $path = array(),
        array &$dataPathCache = array(),
        $currentDataPath = ''
    ) {
        $bind = false;

        if ($node instanceof DOMElement &&
            ($node->tagName == 'field' || $node->tagName == 'exclGroup')
        ) {
            $name = $originalName = $node->getAttribute('name');
            $name = str_replace('.', '\.', $name);

            $index = 0;

            $dataPath = trim($currentDataPath . '.' . $name . '[' . $index . ']', '.');
            while (isset($dataPathCache[$dataPath])) {
                $index++;
                $dataPath = trim($currentDataPath . '.' . $name . '[' . $index . ']', '.');;
            }

            $dataPathCache[$dataPath] = true;
            $name = $name . '[' . $index . ']';

            $path[] = $name;
            $fieldName = join('.', $path);

            // check for unsupported field types:
            // exObject == flash field
            $exObjectNodes = $node->getElementsByTagName('exObject');
            if ($exObjectNodes->length > 0) {
                return;
            }

            $this->_acroFormFieldNamesToTemplateNodes[$fieldName] = $node;

            $this->_fieldToFieldName->attach($node, $fieldName);

            $this->_dataPathByField->attach($node, $dataPath);

            // direct "bind"
            $xpath = new DOMXPath($node->ownerDocument);
            $xpath->registerNamespace('tpl', $node->namespaceURI);

            $match = $xpath->query("tpl:bind[@match]", $node);
            if ($match->length > 0) {
                $match = $match->item(0);
                $matchValue = $match->getAttribute('match');

                switch ($matchValue) {
                    case 'none':
                        $this->_noneBinding->attach($node, $fieldName);
                        break;
                    case 'global':
                        $this->_globalBinding->attach($node, $originalName);
                        break;
                    case 'dataRef':
                        $dataRef = $match;
                        break;
                }
            }

            if (isset($dataRef)) {
                $dataRoot = $this->_currentBinding !== null
                    ? $this->_currentBinding['to']
                    : $currentDataPath;

                $binding = SetaPDF_FormFiller_Xfa_Som::evaluateSomShortcuts($dataRef->getAttribute('ref'), $dataRoot);
            } elseif ($this->_currentBinding !== null) {
                // a binding in a parent <subform>
                $binding = $this->_currentBinding['to'] . '.'
                    . trim(substr($dataPath, strlen($this->_currentBinding['dataPath'])), '.');
            }

            if (isset($binding)) {
                $this->_dataRefBinding->attach($node, $binding);
            }

            return;
        }

        if ($node instanceof DOMElement && (
                $node->tagName == 'subform' || $node->tagName == 'area' ||
                $node->tagName == 'pageSet' || $node->tagName == 'pageArea' ||
                $node->tagName == 'draw'
            )) {
            $namedElement = $node->hasAttribute('name');
            $tagName = '#' . str_replace('.', '\.', $node->tagName);
            if ($namedElement) {
                $name = $node->getAttribute('name');
            } else {
                $name = $tagName;
            }

            $name = str_replace('.', '\.', $name);

            $index = 0;

            // increment by tag name (behaviour of Acrobat/Adobe Reader)
            $dataPath = trim($currentDataPath . '.' . $tagName . '[' . $index . ']', '.');
            while (isset($dataPathCache[$dataPath])) {
                $index++;
                $dataPath = trim($currentDataPath . '.' . $tagName . '[' . $index . ']', '.');
            }

            $dataPathCache[$dataPath] = true;

            if ($node->tagName == 'subform') {
                $xpath = new DOMXPath($node->ownerDocument);
                $xpath->registerNamespace('tpl', $node->namespaceURI);
                $bind = $xpath->query("tpl:bind[@match='dataRef']", $node);
                if ($bind->length > 0) {
                    $dataRoot = $this->_currentBinding !== null
                        ? $this->_currentBinding['to']
                        : $currentDataPath;

                    $bind = SetaPDF_FormFiller_Xfa_Som::evaluateSomShortcuts($bind->item(0)->getAttribute('ref'), $dataRoot);
                } else {
                    $bind = null;
                }
            }

            // if named we need to increment by the name of the element
            if ($namedElement) {
                $index = 0;

                // Real name
                $dataPath = trim($currentDataPath . '.' . $name . '[' . $index . ']', '.');;
                while (isset($dataPathCache[$dataPath])) {
                    $index++;
                    $dataPath = trim($currentDataPath . '.' . $name . '[' . $index . ']', '.');;
                }

                if ($tagName == '#subform' || $tagName == '#draw') {
                    $dataPathCache[$dataPath] = true;
                    $currentDataPath = $dataPath;
                }
            }

            if ($bind) {
                $this->_currentBinding = array(
                    'dataPath' => $currentDataPath,
                    'to' => $bind
                );
            }

            $name = $name . '[' . $index . ']';
            $path[] = $name;
        }

        if ($node->hasChildNodes()) {
            foreach ($node->childNodes AS $childNode) {
                $this->_processTemplate($childNode, $path, $dataPathCache, $currentDataPath);
            }
        }

        if ($bind)
            $this->_currentBinding = null;
    }

    /**
     * Get all template nodes by their corresponding name used in the AcroForm representation.
     *
     * @return DOMElement[]
     */
    public function getAcroFormFieldNamesToTemplateNodes()
    {
        return $this->_acroFormFieldNamesToTemplateNodes;
    }

    /**
     * Get a fields node from the template packet.
     *
     * @param string $fieldName
     * @return bool|DOMElement
     */
    public function getTemplateNode($fieldName)
    {
        if (isset($this->_acroFormFieldNamesToTemplateNodes[$fieldName])) {
            return $this->_acroFormFieldNamesToTemplateNodes[$fieldName];
        }

        return false;
    }

    /**
     * Gets a data node by a field name.
     *
     * This method returns the matching data node (DOMElement or DOMAttributeNode) object
     * which is matched to the given field.
     * If no data node is found it will create a new data node. If the field is defined to
     * bind to nothing (match="none") the method will return false.
     *
     * If an unknown fieldname is passed the method will throw an InvalidArgumentException
     * exception.
     *
     * @param string $name
     * @param boolean $create Defines if a data node should be created if it cannot be found.
     * @see getAcroFormFieldNamesToTemplateNodes()
     * @return bool|DOMElement
     * @throws InvalidArgumentException
     */
    public function getDataNodeByFieldName($name, $create = true)
    {
        if (!isset($this->_acroFormFieldNamesToTemplateNodes[$name])) {
            throw new InvalidArgumentException('No field "' . $name . '" found in XFA template structure.');
        }

        $fieldNode = $this->_acroFormFieldNamesToTemplateNodes[$name];

        if ($this->_noneBinding->contains($fieldNode)) {
            return false;
        }

        if ($this->_dataNodeByTemplateNode->contains($fieldNode)) {
            return $this->_dataNodeByTemplateNode[$fieldNode];
        }

        /* Let's process all data in "consumeData" mode (which is its default)
         */
        if ($this->_dataProcessed === false) {
            $this->_currentRootIndex = 0;
            $pathes = array();
            foreach ($this->_data->childNodes AS $child) {
                if ($child instanceof DOMElement) {
                    $this->_processData($child, array(), $pathes, 'direct');
                    $this->_currentRootIndex++;
                }
            }

            $this->_currentRootIndex = 0;
            $pathes = array();
            foreach ($this->_data->childNodes AS $child) {
                if ($child instanceof DOMElement) {
                    $this->_processData($child, array(), $pathes, 'scope');
                    $this->_currentRootIndex++;
                }
            }

            $this->_currentRootIndex = 0;
            $pathes = array();
            foreach ($this->_data->childNodes AS $child) {
                if ($child instanceof DOMElement) {
                    $this->_processDataAttributes($child, array(), $pathes, 'direct');
                    $this->_currentRootIndex++;
                }
            }

            $this->_currentRootIndex = 0;
            $pathes = array();
            foreach ($this->_data->childNodes AS $child) {
                if ($child instanceof DOMElement) {
                    $this->_processDataAttributes($child, array(), $pathes, 'scope');
                    $this->_currentRootIndex++;
                }
            }

            $this->_currentRootIndex = null;
            $this->_dataProcessed = true;
        }

        if ($this->_dataNodeByTemplateNode->contains($fieldNode)) {
            return $this->_dataNodeByTemplateNode[$fieldNode];
        }

        if ($create) {
            return $this->_createDataNode($fieldNode);
        }

        return false;
    }

    /**
     * Checks a field node for a global binding.
     *
     * @param $fieldNode
     * @return bool
     */
    public function isGlobalBinding($fieldNode)
    {
        if (is_string($fieldNode)) {
            $fieldNode = $this->getTemplateNode($fieldNode);
        }

        return $this->_globalBinding->contains($fieldNode);
    }

    /**
     * Get field names or nodes which are bound to the same data node.
     *
     * @param string|DOMElement $fieldNode
     * @param bool $asNames Defines whether the method should return the names or field nodes.
     * @return array|DOMElement[] An array of field names or fields (DOMElements).
     */
    public function getSameBoundFields($fieldNode, $asNames = false)
    {
        if (is_string($fieldNode)) {
            $fieldNode = $this->getTemplateNode($fieldNode);
        }

        $result = array();

        if ($this->_globalBinding->contains($fieldNode)) {
            $globalPath = $this->_globalBinding[$fieldNode];
            foreach ($this->_globalBinding AS $_fieldNode) {
                if ($fieldNode === $_fieldNode) {
                    continue;
                }

                if ($globalPath === $this->_globalBinding->getInfo()) {
                    $result[] = $_fieldNode;
                }
            }
        }

        if ($this->_dataRefBinding->contains($fieldNode)) {
            $directPath = $this->_dataRefBinding[$fieldNode];
            foreach ($this->_dataRefBinding AS $_fieldNode) {
                if ($fieldNode === $_fieldNode) {
                    continue;
                }

                if ($directPath === $this->_dataRefBinding->getInfo()) {
                    $result[] = $_fieldNode;
                }
            }
        }

        if ($asNames) {
            foreach ($result AS $key => $_fieldNode) {
                $result[$key] = array_search($_fieldNode, $this->_acroFormFieldNamesToTemplateNodes, true);
            }
        }

        return $result;
    }

    /**
     * Processes the data and bind the nodes to the template/field nodes.
     *
     * @param DOMNode $node
     * @param array $path
     * @param array $pathes
     * @param string $method
     */
    protected function _processData(
        DOMNode $node,
        array $path = array(),
        array &$pathes = array(),
        $method = 'direct'
    ) {
        if ($node instanceof DOMElement) {
            $name = $node->tagName;

            $currentPath = join('.', $path);

            $index = 0;
            while (isset($pathes[$currentPath . '.' . $name. '[' . $index . ']'])) {
                $index++;
            }

            $path[] = $name. '[' . $index . ']';

            $this->_bindDataNode(SetaPDF_FormFiller_Xfa_Som::escape($path), $node, $method);

            $pathes[join('.', $path)] = true;
        }

        if ($node->hasChildNodes()) {
            foreach ($node->childNodes AS $child) {
                if ($child instanceof DOMElement) {
                    $this->_processData($child, $path, $pathes, $method);
                }
            }
        }
    }

    /**
     * Process attributes to unbind tempalte/field nodes.
     *
     * @param DOMNode $node
     * @param array $path
     * @param array $pathes
     * @param string $method
     */
    protected function _processDataAttributes(
        DOMNode $node,
        array $path = array(),
        array &$pathes = array(),
        $method = 'direct'
    ) {
        $hasChildNodes = $node->hasChildNodes();
        if ($node instanceof DOMElement) {

            $name = $node->tagName;

            $currentPath = join('.', $path);

            $index = 0;
            while (isset($pathes[trim($currentPath . '.' . $name. '[' . $index . ']', '.')])) {
                $index++;
            }

            // Attributes are only resolved in data nodes. (by specification but not by Acrobat!)
            $isDataNode = true;
            if ($hasChildNodes) {
                foreach ($node->childNodes AS $child) {
                    if ($child instanceof DOMElement) {
                        $isDataNode = false;
                        break;
                    }
                }
            }

            $currentPath = !$isDataNode ? trim($currentPath . '.' . $name. '[' . $index . ']', '.') : $currentPath;

            foreach ($node->attributes AS $attribute) {

                $_index = 0;
                while (isset($pathes[trim($currentPath . '.' . $attribute->name . '[' . $_index . ']', '.')])) {
                    $_index++;
                }

                if (!$isDataNode) {
                    // if this is not a data value node (data group) the path is prefixed with the current tag nane/index
                    $this->_bindDataNode(
                        array_merge($path, array($name. '[' . $index . ']', $attribute->name . '[' . $_index . ']')),
                        $attribute,
                        $method,
                        false
                    );
                } else {
                    // otherwise the same path as of the current tag is used.
                    $this->_bindDataNode(
                        array_merge($path, array($attribute->name . '[' . $_index . ']')),
                        $attribute,
                        $method,
                        false
                    );
                }

                $pathes[trim($currentPath . '.' . $attribute->name . '[' . $_index . ']', '.')] = true;
            }

            $path[] = $name . '[' . $index . ']';
            $pathes[trim(join('.', $path), '.')] = true;
        }

        if ($hasChildNodes) {
            foreach ($node->childNodes AS $child) {
                if ($child instanceof DOMElement) {
                    $this->_processDataAttributes($child, $path, $pathes, $method);
                }
            }
        }
    }

    /**
     * Tries to bind a data node to a field node.
     *
     * Both "direct match" and "scope match" are evaluated.
     *
     * @param array $path
     * @param DOMNode $dataNode
     * @param string $method
     * @param boolean $allowOverwrite
     * @return boolean
     */
    protected function _bindDataNode(array $path, DOMNode $dataNode, $method, $allowOverwrite = true)
    {
        $fieldNode = null;

        // Direct matches seems to be allowed to overwrite an existing binding
        if ('direct' !== $method && $this->_isBind($dataNode)) {
            return true;
        }

        if ('direct' === $method) {
            // Direct Match
            $fieldNode = $this->_doDirectMatch($path);
            if (false === $fieldNode) {
                return false;
            }

            $fieldNodes = $this->_filtertBindings($fieldNode, $allowOverwrite);
            $fieldNodes = $this->_ensureDataValue($fieldNodes, $dataNode);
            if (count($fieldNodes) > 0) {
                $this->_dataNodeByTemplateNode->attach($fieldNodes[0], $dataNode);
                return true;
            }
        } else {

            // scope match
            $path[0] = '*[0]';
            // remove index from last path item
            $lastPath = $path[count($path) - 1];
            $lastPath = substr($lastPath, 0, strpos($lastPath, '['));
            $path[count($path) - 1] = $lastPath;

            $fieldNode = $this->_doScopeMatch($path);
            if (false === $fieldNode) {
                return false;
            }

            $fieldNodes = $this->_filtertBindings($fieldNode, false);
            $fieldNodes = $this->_ensureDataValue($fieldNodes, $dataNode);
            if (count($fieldNodes) > 0) {
                $this->_dataNodeByTemplateNode->attach($fieldNodes[0], $dataNode);
                return true;
            }
        }

        return false;
    }

    /**
     * Tries to find a field node by a "direct match".
     *
     * @param array $path
     * @return bool|DOMElement
     */
    private function _doDirectMatch(array $path)
    {
        $som = new SetaPDF_FormFiller_Xfa_Som();

        /* The highest-level subform and the data node representing the current record
         * are special; they are always bound even if their names don't match. In fact
         * it is common for the highest-level subform in a template to be unnamed, that
         * is to not have a name attribute. In the example assume that the data holds
         * just one record. This is a common arrangement.
         */
        $path[0] = '*[' . $this->_currentRootIndex . ']';

        $fieldNodes = $som->evaluate(join('.', $path), $this->_template);
        $result = $this->_filtertBindings($fieldNodes, $this->_currentRootIndex == 0);

        if (count($result)) {
            return $result[0];
        }

        return false;
    }

    /**
     * Tries to find a field node by a "scope match".
     *
     * Example from the XFA specification:
     *
     * Template:
     * <template …>
     *     <subform name="registration">
     *         <field name="first" …>… </field>
     *         <field name="last" …> … </field>
     *         <subform name="address">
     *             <field name="apt" …> … </field>
     *             <field name="street" …> … </field>
     *             <field name="city"…> … </field>
     *             <field name="country"…> … </field>
     *             <field name="postalcode"…> … </field>
     *         </subform>
     *     </subform>
     * </template>
     *
     * Data:
     * <?xml version="1.0"?>
     * <registration>
     *     <first>Jack</first>
     *     <last>Spratt</last>
     *     <apt></apt>
     *     <street>99 Candlestick Lane</street>
     *     <city>London</city>
     *     <country>UK</country>
     *     <postalcode>SW1</postalcode>
     * </registration>
     *
     * @param array $path
     * @return boolean|DOMElement
     */
    private function _doScopeMatch(array $path)
    {
        if (count($path) === 0)
            return false;

        $som = new SetaPDF_FormFiller_Xfa_Som();

        $newPath = join('..', $path);
        $fieldNodes = $som->evaluate($newPath, $this->_template);
        $result = $this->_filtertBindings($fieldNodes);

        if (count($result)) {
            return $result[0];
        }

        return false;
    }

    /**
     * This method filters field nodes which are already bound.
     *
     * @param DOMElement|DOMElement[] $fieldNodes
     * @param bool $isDirect
     * @return array
     */
    private function _filtertBindings($fieldNodes, $isDirect = false)
    {
        if (!is_array($fieldNodes)) {
            $fieldNodes = array($fieldNodes);
        }

        $result = array();
        foreach ($fieldNodes AS $fieldNode) {
            if (!$fieldNode instanceof DOMElement) {
                continue;
            }

            if (!$this->_noneBinding->contains($fieldNode) &&
                !$this->_dataRefBinding->contains($fieldNode) &&
                ($isDirect || !$this->_dataNodeByTemplateNode->contains($fieldNode))
            ) {
                $result[] = $fieldNode;
            }
        }

        return $result;
    }

    /**
     * This method evaluates a data ref binding of a field node.
     *
     * @param DOMElement $fieldNode
     * @return bool
     */
    protected function _evaluateDataRefBindings(DOMElement $fieldNode)
    {
        if (!$this->_dataRefBinding->contains($fieldNode)) {
            return false;
        }

        $dataPath = $this->_dataRefBinding[$fieldNode];
        #$dataPath = SetaPDF_FormFiller_Xfa_Som::evaluateSomShortcuts($dataPath);

        // make sure that the path points to the data packet
        if (strpos($dataPath, 'xfa.datasets.data.') === 0) {
            // remove path to data packet
            $dataPath = substr($dataPath, strlen('xfa.datasets.data.'));
        }

        // make sure that the path points to the data packet
        if (strpos($dataPath, 'data.') === 0) {
            // remove path to data packet
            $dataPath = substr($dataPath, strlen('data.'));
        }

        // direct match
        $som = new SetaPDF_FormFiller_Xfa_Som();
        $dataNode = $som->evaluate($dataPath, $this->_data);
        if ($dataNode) {
            $this->_dataNodeByTemplateNode->attach($fieldNode, $dataNode);
            return true;
        }

        // try wildcard in the root node if the match is not the root node:
        $dataPath = preg_split("/(?<!\\\)\./", $dataPath);
        // only if it's not only a root node.
        if (count($dataPath) === 1) {
            return false;
        }

        $dataPath[0] = '*[0]';
        $_dataPath = join('.', $dataPath);
        $dataNode = $som->evaluate($_dataPath, $this->_data);
        if ($dataNode) {
            $this->_dataNodeByTemplateNode->attach($fieldNode, $dataNode);
            return true;
        }

        // scope match
        $scopePath = join('..', $dataPath);
        $dataNode = $som->evaluate($scopePath, $this->_data);
        if ($dataNode) {
            $this->_dataNodeByTemplateNode->attach($fieldNode, $dataNode);
            return true;
        }

        // try via attribute match
        $dataPath = preg_split("/(?<!\\\)\./", $_dataPath);
        $last = array_pop($dataPath);
        $dataPath[] = '#' . $last;
        $dataPath = join('.', $dataPath);

        $dataNode = $som->evaluate($dataPath, $this->_data);
        if ($dataNode) {
            $this->_dataNodeByTemplateNode->attach($fieldNode, $dataNode);
            return true;
        }

        return false;
    }

    /**
     * This method evaluates a global binding, if exists, for a field node.
     *
     * @param DOMElement $fieldNode
     * @return bool
     */
    protected function _evaluateGlobalBindings(DOMElement $fieldNode)
    {
        if (!$this->_globalBinding->contains($fieldNode)) {
            return false;
        }

        $name = $this->_globalBinding[$fieldNode];

        $som = new SetaPDF_FormFiller_Xfa_Som();
        $dataNode = $som->evaluate('*[0]..' . $name . '', $this->_data);

        if (!$dataNode) {
            return false;
        }

        if (!is_array($dataNode)) {
            $dataNode = array($dataNode);
        }

        $finalDataNode = null;
        // fetch first data node which is not a dataGroup
        foreach ($dataNode as $_dataNode) {
            $fieldNodes = $this->_ensureDataValue(array($fieldNode), $_dataNode);
            if (count($fieldNodes) > 0) {
                $finalDataNode = $_dataNode;
                break;
            }
        }

        if (null !== $finalDataNode) {
            $this->_dataNodeByTemplateNode->attach($fieldNode, $finalDataNode);
            return true;
        }

        return false;
    }

    /**
     * Ensure that the field node and data node match to each other.
     *
     * This method filters the field nodes by the dataGroup attribute/property of the data node.
     *
     * @param array $fieldNodes
     * @param DOMNode $dataNode
     * @return array
     */
    protected function _ensureDataValue(array $fieldNodes, DOMNode $dataNode)
    {
        if ($dataNode instanceof DOMElement) {
            $dataNodeAttr = $dataNode->getAttributeNodeNS('http://www.xfa.org/schema/xfa-data/1.0/', 'dataNode');
            $isDataGroup = $dataNodeAttr && $dataNodeAttr->value == 'dataGroup';

            if (!$isDataGroup) {
                if ($dataNode->hasChildNodes()) {
                    $isDataValue = false;
                    foreach ($dataNode->childNodes AS $child) {
                        if ($child instanceof DOMText && trim($child->nodeValue) !== '') {
                            $isDataValue = true;
                            break;
                        }
                    }

                    $isDataGroup = !$isDataValue;
                }
            }

            // wenn es deine data group ist, dann müssen alle field nodes entfernt werden
            if ($isDataGroup) {
                $result = array();
                foreach ($fieldNodes AS $fieldNode) {
                    // Check for field
                    if ($fieldNode->tagName === 'field') {
                        // ...and that the field doesn't require a match to a dataGroup: a choice list + multiSelect
                        $domDocument = $fieldNode->ownerDocument;
                        $xpath = new DOMXPath($domDocument);
                        $xpath->registerNamespace('tpl', $fieldNode->namespaceURI);
                        $choiceLists = $xpath->query('tpl:ui/tpl:choiceList[@open="multiSelect"]', $fieldNode);
                        if ($choiceLists->length === 0)
                            continue;
                    }

                    $result[] = $fieldNode;
                }

                return $result;
            }
        }

        return $fieldNodes;
    }

    /**
     * Checks if a data node is already bound to a field node.
     *
     * @param DOMNode $dataNode
     * @return bool|DOMNode
     */
    protected function _isBind(DOMNode $dataNode)
    {
        /** @noinspection PhpUnusedLocalVariableInspection */
        foreach ($this->_dataNodeByTemplateNode AS $fieldNode) {
            $_dataNode = $this->_dataNodeByTemplateNode->getInfo();
            if ($_dataNode === $dataNode)
                return true;
        }

        return false;
    }

    /**
     * Creates of gets a data node by a field node.
     *
     * @param DOMElement $fieldNode
     * @return DOMElement
     */
    protected function _createDataNode(DOMElement $fieldNode)
    {
        // check for a global binding
        if ($this->_globalBinding->contains($fieldNode)) {
            /* Acutally we add global bindings to the root element.
             * Acrobat adds it to a (first?) matching field into the default structure.
             */
            $dataPath = $this->_globalBinding[$fieldNode];

        // check for direct binding
        } else if ($this->_dataRefBinding->contains($fieldNode)) {
            $dataPath = $this->_dataRefBinding[$fieldNode];

            // make sure that the path points to the data packet
            if (strpos($dataPath, 'xfa.datasets.data.') === 0) {
                // remove path to data packet
                $dataPath = substr($dataPath, strlen('xfa.datasets.data.'));
            }

        // default data path
        } else {
            $dataPath = $this->_dataPathByField[$fieldNode];
        }

        $parts = explode('.', $dataPath);

        $domDocument = $this->_data->ownerDocument;
        $xpath = new DOMXPath($domDocument);
        $currentNode = $this->_data;
        foreach ($parts AS $part) {
            $start = strpos($part, '[');
            if ($start === false) {
                $tagName = $part;
                $predicate = '';
            } else {
                $tagName = substr($part, 0, $start);
                $index = substr($part, $start + 1, -1);
                if ($index === '*') {
                    $predicate = '';
                } else {
                    $predicate = '[' . (intval($index) + 1) . ']';
                }
            }

            while (($xpath->query($tagName . $predicate, $currentNode)->length) === 0) {
                $_node = $domDocument->createElement($tagName);
                $currentNode->appendChild($_node);
            }

            $currentNode = $xpath->query($tagName . $predicate, $currentNode)->item(0);
        }

        // empty data node (if it was already available)
        while ($currentNode->hasChildNodes()) {
            $child = $currentNode->lastChild;
            $currentNode->removeChild($child);
        }

        // remove dataNode attribute to avoid conflicts with dataGroup values
        $currentNode->removeAttributeNS('http://www.xfa.org/schema/xfa-data/1.0/', 'dataNode');

        return $currentNode;
    }
}