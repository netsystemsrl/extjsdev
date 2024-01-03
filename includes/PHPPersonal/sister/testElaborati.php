<?php

  $date = shell_exec('date "+%D %H:%M:%S"');
  echo "<h2>$date</h2>";

  require_once("index.php");
  
  echo "Process on port:\n". print_r(shell_exec("lsof -i:9515")). "\n";
  
  $killProcess = shell_exec("fuser -k 8080/tcp 2>&1");
  echo "Kill process command: \n";
  print_r($killProcess);
  
  $crawler = new Crawler();
  $crawler->debug = false;
  $crawler->maxRetry = 0;
  
  echo('<pre>');
  
  
  // ---- Esempio di ricerca di un elaborato planimetrico ----
  //$crawler->comuneIndirizzo = $comuni["MONTECCHIO EMILIA"]; // "F463#MONTECCHIO EMILIA#0#0";
  
  $crawler->setProvincia("REGGIO EMILIA Territorio-RE");
  $crawler->comuneIndirizzo = "F463#MONTECCHIO EMILIA#0#0";
  
  $crawler->foglio = 17;
  $crawler->particella["particella1"] = 224;
  $crawler->particella["particella2"] = null;
  
  $crawler->elaborato = true;
  $crawler->formatoFogli = "A3"; // o "A4"
  
  $crawler->elencoSubalterni = true;
  $crawler->formatoStampa = "DAT"; //o "DAT"
  $crawler->numeroElaboratoPlanimetrico = 1; //(il più in alto e quindi l'ultimo restituito dall'Agenzia)
  $ricercaElaborati = $crawler->search("planimetrico");
  echo "Ricerca elaborati: $ricercaElaborati\n <hr>";
  
  echo "\n\n\n";
  $crawler->numeroElaboratoPlanimetrico = 1; // scarica solo il primo elaborato
  echo "Elaborati: \n";
  $Elaborati = $crawler->getElaborati();
  var_dump($Elaborati);
  echo "<hr>";
  return;
  
  $crawler->numeroElaboratoPlanimetrico = null; // scarica tutti gli elaborati
  $elaborato = $crawler->getElaborati();
  
  
  // in elaborato trovo i link ai file da prire o i file interi da salvare ove voglio
  fine:
  if ($crawler->isLogged) {
    $crawler->logOut();
  }
  
  echo('</pre>');