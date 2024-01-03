<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Writer
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Http.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * A writer class for HTTP delivery
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Writer
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Writer_Http
    extends SetaPDF_Core_Writer_String
{
    /**
     * Encodes the file name for the http header.
     *
     * @param string $filename
     * @return string
     */
    public static function encodeFilenameForHttpHeader($filename)
    {
        // simulate basename()
        preg_match('~[^/\\\\]*$~D', $filename, $matches);
        $filename = str_replace('"', '_', end($matches));

        // see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition
        // see https://tools.ietf.org/html/rfc5987#section-4.2
        return sprintf('filename="%s"', utf8_decode($filename)) . '; ' .
            sprintf("filename*=utf-8''%s", rawurlencode($filename));
    }

    /**
     * The document filename
     *
     * @var string
     */
    protected $_filename = 'document.pdf';

    /**
     * Flag saying that the file should be displayed inline or not
     *
     * @var boolean
     */
    protected $_inline = false;

    /**
     * The constructor.
     *
     * @param string $filename The document filename in UTF-8 encoding
     * @param boolean $inline Defines if the document should be displayed inline or if a download should be forced
     */
    public function __construct($filename = 'document.pdf', $inline = false)
    {
        $this->_filename = $filename;
        $this->_inline = $inline;
    }

    /**
     * This method is called when the writing process is finished.
     *
     * It sends the HTTP headers and send the buffer to the client.
     *
     * @throws SetaPDF_Core_Writer_Exception
     */
    public function finish()
    {
        if (PHP_SAPI != 'cli' && headers_sent($filename, $line)) {
            throw new SetaPDF_Core_Writer_Exception(
                sprintf('Headers already been send in %s on line %s', $filename, $line)
            );
        }

        if (ob_get_length() > 0) {
            // Check at least for UTF-8 BOM and white spaces
            if (preg_match('/^(\xEF\xBB\xBF)?\s*$/', ob_get_contents())) {
                ob_clean();
            } else {
                throw new SetaPDF_Core_Writer_Exception(
                    "Some data has already been output. PDF couldn't be send."
                );
            }
        }

        header('Content-Type: application/pdf');
        if (true === $this->_inline) {
            header('Content-Disposition: inline; ' . self::encodeFilenameForHttpHeader($this->_filename));
        } else {
            header('Content-Disposition: attachment; ' . self::encodeFilenameForHttpHeader($this->_filename));
        }

        header('Expires: 0');
        header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
        header('Pragma: public');
        header('Content-Length: ' . $this->getPos());
        header('Accept-Ranges: none');

        echo $this->getBuffer();
        flush();

        parent::finish();
    }
}