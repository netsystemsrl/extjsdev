<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Writer
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: HttpStream.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * A writer class for immediately HTTP delivery without sending a Length header
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Writer
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Writer_HttpStream extends SetaPDF_Core_Writer_Echo
{
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
     * @param string $filename The document filename  in UTF-8 encoding
     * @param boolean $inline Defines if the document should be displayed inline or if a download should be forced
     */
    public function __construct($filename = 'document.pdf', $inline = false)
    {
        $this->_filename = $filename;
        $this->_inline = $inline;
    }

    /**
     * This method is called when the writing process is started.
     *
     * It sends the HTTP headers.
     */
    public function start()
    {
        if (PHP_SAPI != 'cli' && headers_sent($filename, $line)) {
            throw new SetaPDF_Core_Writer_Exception(
                sprintf('Headers already been send in %s on line %s.', $filename, $line)
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
            header('Content-Disposition: inline; ' . SetaPDF_Core_Writer_Http::encodeFilenameForHttpHeader($this->_filename));
        } else {
            header('Content-Disposition: attachment; ' . SetaPDF_Core_Writer_Http::encodeFilenameForHttpHeader($this->_filename));
        }

        header('Expires: 0');
        header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
        header('Pragma: public');
        header('Accept-Ranges: none');
    }
}