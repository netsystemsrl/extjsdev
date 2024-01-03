<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Writer
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Http.php 1144 2017-12-13 09:43:09Z jan.slabon $
 */

/**
 * A writer class for HTTP delivery
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Writer
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Writer_Http
    extends SetaPDF_Core_Writer_String
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
     * @param string $filename The path to which the writer should write to
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

        // TODO: basename is local aware!
        $filename = basename($this->_filename);
        $filename = str_replace(array('"'), '_', $filename);

        Header('Content-Type: application/pdf');
        if (true === $this->_inline) {
            Header('Content-Disposition: inline; filename="' . $filename . '"');
        } else {
            Header('Content-Disposition: attachment; filename="' . $filename . '"');
        }

        Header('Expires: 0');
        Header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
        Header('Pragma: public');
        Header('Content-Length: ' . $this->getPos());
        Header('Accept-Ranges: none');

        echo $this->getBuffer();
        flush();

        parent::finish();
    }
}