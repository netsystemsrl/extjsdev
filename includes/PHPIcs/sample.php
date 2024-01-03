<?php
	error_reporting(E_ALL); 
	ini_set('display_startup_errors', 1);
	ini_set('display_errors', 1);
	error_reporting(-1);
/* 
 * Libreria per la creazione di calendari .ics (Apple e Google calendar per dirne alcuni)
 * Allego il file ics.php per la creazione
 * Autore del binomio: portapipe
 * Codice su Github Gist: https://gist.github.com/portapipe/25306c4260409ea023d1fb2b3f9fbecb
*/

//Modifica i dati seguenti in base alle tue esigenze
$setup = array(
  //Titolo del caledario (nel caso ci si iscriva)
	"title"=>"Cal Esempio",
  //Autore del calendario
	"author"=>"portapipe",
  //Descrizione del calendario
       "description"=>"Il mio calendario di esempio",
  //Nome del file (default 'calendar')
       "filename"=>"ilMioCalendario"
);

//Ripeti da qui:
$eventi = array();
$time = '10:00:00';
$eventi[] = array(
			//'uid' =>  '123', NON SERVE, E' AUTOMATICO MA E' PREDISPOSTO
			'summary' => 'Esempio di calendario',
			'description' => 'Questo evento sarà sempre appena terminato',
			'start' => new DateTime('2021-06-12 03:00:00'),
			'end' => new DateTime('2021-06-12 03:30:00'),
			'url' => 'http://google.it',
			'location' => 'Milano, Italia'
		);
//a qui per creare un nuovo evento (cambiando solo i dati).


$eventi[] = array(
				'summary' => 'Sarà sempre tra un\'ora',
				'description' => 'Questo evento sarà sempre tra un\'ora!',
				'start' => new DateTime('2021-06-12 14:00:00'),
				'end' => new DateTime('2021-06-12 14:30:00'),
				'location' => 'Via Torino 14, Milano, Italia',
				'url' => 'http://portapipe.wordpress.com'
			);

/* DA QUI NON E' NECESSARIO MODIFICARE */
include("ics.php");	
$time = time();
$e = array();
foreach($eventi as $v){
	$e[] = new CalendarEvent($v);
}
$calendar = new Calendar($setup);
$calendar->events = $e;
$calendar->generateDownload();

?>