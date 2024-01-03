<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: XObject.php 1246 2018-10-23 07:22:37Z jan.slabon $
 */

/**
 * A helper class for an easy lightweight access to XMP data packages
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_XmpHelper
{
    /**
     * @var DOMDocument
     */
    protected $xml;

    public $xmlAliases = [
        'http://ns.adobe.com/xap/1.0/' => 'xmp',
        'http://purl.org/dc/elements/1.1/' => 'dc',
        'http://ns.adobe.com/pdf/1.3/' => 'pdf',
        'http://ns.adobe.com/pdfx/1.3/' => 'pdfx',
        'http://ns.adobe.com/xap/1.0/rights/' => 'xmpRights',
        'http://ns.adobe.com/photoshop/1.0/' => 'photoshop',
        'http://www.aiim.org/pdfa/ns/id/' => 'pdfaid'
    ];

    /**
     * Encodes a tag name as specified in the XMP Specification Part 3 - 2.2.1
     *
     * @param $tagName
     * @return string
     */
    static public function encodeTagName($tagName)
    {
        $tagName = preg_replace_callback('/[^\pL\pN\.\-_]/u', 'SetaPDF_Core_XmpHelper::_escapeTagChar', $tagName);

        return preg_replace_callback('/^[^\pL_ↂ]/u', 'SetaPDF_Core_XmpHelper::_escapeTagChar', $tagName);
    }

    /**
     * Call back for _encodeTagName()
     *
     * @see encodeTagName()
     * @param $matches
     * @return string
     */
    static private function _escapeTagChar($matches)
    {
        $char = $matches[0];

        $hex = SetaPDF_Core_Type_HexString::str2hex(
            SetaPDF_Core_Encoding::convert($char, 'UTF-8', 'UTF-16BE')
        );

        $parts = str_split($hex, 4);

        $result = '';
        foreach ($parts as $part) {
            // U+2182 followed by UTF-16 in hex
            $result .= "\xE2\x86\x82" . $part;
        }

        return $result;
    }

    /**
     * Decodes a tag name as specified in the XMP Specification Part 3 - 2.2.1
     *
     * @param $encodedTagName
     * @return string
     */
    static public function decodeTagName($encodedTagName)
    {
        return preg_replace_callback(
            '/(ↂ[a-zA-Z0-9]{4})+/u',
            function($tag) {
                return SetaPDF_Core_Encoding::convert(
                    SetaPDF_Core_Type_HexString::hex2str(str_replace('ↂ', '', $tag[0])),
                    'UTF-16BE',
                    'UTF-8'
                );
            },
            $encodedTagName
        );
    }

    /**
     * The constructor.
     *
     * @param DOMDocument $xml
     */
    public function __construct(DOMDocument $xml)
    {
        $this->xml = $xml;
    }

    /**
     * @return DOMDocument
     */
    public function getXml()
    {
        return $this->xml;
    }

    /**
     * Get the XMP data package.
     *
     * @return string
     */
    public function getPackage()
    {
        $root = $this->xml->getElementsByTagNameNS('adobe:ns:meta/', 'xmpmeta')->item(0);
        if ($root === null) {
            // Try to find the RDF and encapsulate it with a root node:
            $rdf = $this->xml->getElementsByTagNameNS('http://www.w3.org/1999/02/22-rdf-syntax-ns#', 'RDF')->item(0);
            if ($rdf === null) {
                throw new BadMethodCallException('No or invalid root node found.');
            }

            $rdf = $rdf->parentNode->removeChild($rdf);
            $root = $this->xml->createElementNS('adobe:ns:meta/', 'x:xmpmeta');
            $root->appendChild($rdf);
        }

        return
            '<?xpacket begin="' . "\xEF\xBB\xBF" . '" id="W5M0MpCehiHzreSzNTczkc9d"?>' . "\n" .
            $this->xml->saveXML($root) . "\n" .
            str_repeat(str_repeat(' ', 100) . "\n", 20) .
            '<?xpacket end="w"?>';
    }

    /**
     * Updates a single field in the XMP package.
     *
     * @param string $namespace The namespace of the element
     * @param string $tagName The tag name
     * @param bool|string|array $value The value
     */
    public function set($namespace, $tagName, $value)
    {
        $xml = $this->getXml();

        $tagName = self::encodeTagName($tagName);

        $elements = $xml->getElementsByTagNameNS($namespace, $tagName);
        if ($elements->length === 0) {
            if ($value === false)
                return;

            $description = $this->_findDescription($namespace);
            $element = $xml->createElementNS($namespace, $tagName);
            $description->appendChild($element);
        } else {
            $element = $elements->item(0);
        }

        if ($value === false) {
            // Remove node
            $element->parentNode->removeChild($element);
        } else {

            switch ($namespace) {
                case 'http://purl.org/dc/elements/1.1/':
                    $sub = 'Alt';
                    switch ($tagName) {
                        case 'creator':
                            $sub = 'Seq';
                            break;
                        case 'subject':
                            $sub = 'Bag';
                            break;
                        case 'format':
                            $value = htmlspecialchars($value, ENT_COMPAT, 'UTF-8'); // | ENT_HTML401
                            $value = str_replace(["\n", "\r"], ['&#xA;', ''], $value);
                            $element->nodeValue = $value;
                            break 2;
                    }

                    if (!is_array($value)) {
                        $value = [$value];
                    }

                    $xmlValue = $xml->createElementNS('http://www.w3.org/1999/02/22-rdf-syntax-ns#', $sub);

                    foreach ($value AS $_value) {
                        $_value = htmlspecialchars($_value, ENT_COMPAT, 'UTF-8'); // | ENT_HTML401
                        $_value = str_replace(["\n", "\r"], ['&#xA;', ''], $_value);

                        $li =  $xml->createElementNS('http://www.w3.org/1999/02/22-rdf-syntax-ns#', 'li', $_value);
                        if ($sub === 'Alt') {
                            $li->setAttribute('xml:lang', 'x-default');
                        }

                        $xmlValue->appendChild($li);
                    }

                    while ($element->hasChildNodes()) {
                        $element->removeChild($element->lastChild);
                    }

                    $element->appendChild($xmlValue);
                    break;

                default:
                    $value = htmlspecialchars($value, ENT_COMPAT, 'UTF-8'); // | ENT_HTML401
                    $value = str_replace(["\n", "\r"], ['&#xA;', ''], $value);
                    $element->nodeValue = $value;
            }
        }
    }

    /**
     * Finds or creates a Description tag with the desired namespace.
     *
     * @param string $namespace
     * @return DOMElement
     */
    protected function _findDescription($namespace)
    {
        $xml = $this->getXml();

        $xmpmeta = null;
        foreach ($xml->childNodes AS $_xmpmeta) {
            if ($_xmpmeta->nodeName === 'x:xmpmeta') {
                $xmpmeta = $_xmpmeta;
                break;
            }
        }

        if ($xmpmeta === null) {
            $xmpmeta = $xml->createElementNS('adobe:ns:meta/', 'x:xmpmeta');
            $xml->appendChild($xmpmeta);
        }

        $rdf = $xmpmeta->getElementsByTagName('RDF');
        if ($rdf->length === 0) {
            $rdf = $xml->createElementNS('http://www.w3.org/1999/02/22-rdf-syntax-ns#', 'rdf:RDF');
            $xmpmeta->appendChild($rdf);
        } else {
            $rdf = $rdf->item(0);
        }

        $descriptions = $rdf->getElementsByTagName('Description');
        foreach ($descriptions AS $description) {
            if ($description->lookupPrefix($namespace) !== null) {
                return $description;
            }
        }

        $description = $xml->createElementNS('http://www.w3.org/1999/02/22-rdf-syntax-ns#', 'Description');
        $prefix = $rdf->lookupPrefix('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
        // "[...]an empty string, which means that the XMP is physically local to the resource being described.[...]"
        $description->setAttribute($prefix . ':about', '');

        $alias = null;
        if (isset($this->xmlAliases[$namespace])) {
            $alias = $this->xmlAliases[$namespace];
            $description->setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:' . $alias, $namespace);
        }

        $rdf->appendChild($description);

        return $description;
    }
}