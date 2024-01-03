<?php

/* 
 * Libreria per la creazione di calendari .ics (Apple e Google calendar per dirne alcuni)
 * Allego il file calendar.php per la creazione
 * Autore del binomio: portapipe
 * Codice su Github Gist: https://gist.github.com/portapipe/25306c4260409ea023d1fb2b3f9fbecb
*/

//Original code by pamelafox-coursera
class CalendarEvent {

    /**
     * 
     * The event ID
     * @var string
     */
    private $uid;

    /**
     * The event start date
     * @var DateTime
     */
    private $start;

    /**
     * The event end date
     * @var DateTime
     */
    private $end;

    /**
     * 
     * The event title
     * @var string
     */
    private $summary;

    /**
     * The event description
     * @var string
     */
    private $description;

    /**
     * The event location
     * @var string
     */
    private $location;

    public function __construct($parameters) {
        /*$parameters = array(
          'summary' => 'Untitled Event',
          'description' => '',
          'location' => ''
        );
        */
        if (isset($parameters['uid'])) {
            $this->uid = $parameters['uid'];
        } else {
            $this->uid = uniqid(rand(0, getmypid()));
        }
        $this->start = $parameters['start'];
        $this->end = $parameters['end'];
        $this->summary = $parameters['summary'];
        $this->description = (isset($parameters['description'])?$parameters['description']:'');
        $this->location = (isset($parameters['location'])?$parameters['location']:'');
        $this->url = (isset($parameters['url'])?$parameters['url']:'');
      return $this;
    }

    /**
     * Get the start time set for the even
     * @return string
     */
    private function formatDate($date) {   
        return $date->format("Ymd\THis\Z");
    }

    /* Escape commas, semi-colons, backslashes.
       http://stackoverflow.com/questions/1590368/should-a-colon-character-be-escaped-in-text-values-in-icalendar-rfc2445
     */
    private function formatValue($str) {
        return addcslashes($str, ",\\;");
    }

    public function generateString() {
        $created = new DateTime();
        $content = '';

		$id = md5(uniqid(mt_rand(), true));

        $content = "BEGIN:VEVENT\r\n"
                 . "UID:{$id}\r\n"//$this->uid
                 . "DTSTART:{$this->formatDate($this->start)}\r\n"
                 . "DTEND:{$this->formatDate($this->end)}\r\n"
                 . "DTSTAMP:{$this->formatDate($this->start)}\r\n"
                 . "CREATED:{$this->formatDate($created)}\r\n"
                 . "DESCRIPTION:{$this->formatValue($this->description)}\r\n"
                 . "LAST-MODIFIED:{$this->formatDate($this->start)}\r\n"
                 . "LOCATION:{$this->location}\r\n"
                 . "URL:{$this->url}\r\n"
                 . "URL;VALUE=URI:" . htmlspecialchars($this->url) ."\r\n"
                 . "SUMMARY:{$this->formatValue($this->summary)}\r\n"
                 . "SEQUENCE:0\r\n"
                 . "STATUS:CONFIRMED\r\n"
                 . "TRANSP:OPAQUE\r\n"
                 . "END:VEVENT\r\n";
        return $content;
    }

}


class Calendar {

    public $events;

    public $title = "";

    public $author = "";
    
    public $description = "";
    
    public $filename = "calendar";

    public function __construct($parameters) {
        /*
        $parameters = array(
          'events' => array(),
          'title' => 'Calendar',
          'author' => 'Calender Generator'
        );
        */
        $this->events = @$parameters['events'];
        $this->title  = $parameters['title'];
        
        if(isset($parameters['description']))
	        $this->description = $parameters['description'];
        
        if(isset($parameters['author']))
	        $this->author = $parameters['author'];
	        
        if(isset($parameters['filename']))
	        $this->filename = $parameters['filename'];
    }

    /**
     * 
     * Call this function to download the invite. 
     */
    public function generateDownload() {
        $generated = $this->generateString();
        header('Expires: Sat, 26 Jul 1997 05:00:00 GMT' ); //date in the past
        header('Last-Modified: ' . gmdate( 'D, d M Y H:i:s' ) . ' GMT' ); //tell it we just updated
        header('Cache-Control: no-store, no-cache, must-revalidate' ); //force revaidation
        header('Cache-Control: post-check=0, pre-check=0', false );
        header('Pragma: no-cache' ); 
        header('Content-type: text/calendar; charset=utf-8');
        header('Content-Disposition: inline; filename="'.$this->filename.'.ics"');
        header("Content-Description: File Transfer");
        header("Content-Transfer-Encoding: binary");
        header("Content-Length: " . strlen($generated));
        print $generated;
    }

    /**
     * 
     * The function generates the actual content of the ICS
     * file and returns it.
     * 
     * @return string|bool
     */
    public function generateString() {
        $content = "BEGIN:VCALENDAR\r\n"
                 . "PRODID:-//" . $this->author . "//NONSGML//EN\r\n"
                 . "VERSION:2.0\r\n"
                 . "CALSCALE:GREGORIAN\r\n"
                 . "METHOD:PUBLISH\r\n"
                 . "X-WR-CALNAME:" . $this->title . "\r\n"
                 . "X-WR-TIMEZONE:Europe/Rome\r\n"
				 . "X-WR-CALDESC:" . $this->description . "\r\n";

        foreach($this->events as $event) {
            $content .= $event->generateString();
        }
	    $content .= "END:VCALENDAR";
        return $content;
	}
}