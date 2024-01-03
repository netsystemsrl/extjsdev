<?php
  $date = shell_exec('date "+%D %H:%M:%S"');
  echo "<h2>$date</h2>";
  
  require_once("index.php");
  
  echo "Process on port:\n". print_r(shell_exec("lsof -i:9515 2>&1")). "\n";
  
  $killProcess = shell_exec("fuser -k 8080/tcp 2>&1");
  echo "Kill process command: \n";
  var_dump($killProcess);
  
  
  $crawler = new Crawler();
  $crawler->debug = false;
  $crawler->maxRetry = 0;
  
  echo('<pre>');
  
  
  /* [✅] Settare il comune per la ricerca delle visure catastali */
  //$provincie = $crawler->getProvincie();
  //var_dump($provincie);

  $crawler->setProvincia("REGGIO EMILIA Territorio-RE");
  //'REGGIO EMILIA Territorio' => string 'REGGIO EMILIA Territorio-RE'
  
  
  /* [✅] Elenco dei comuni su cui fare scelta */
  //$comuni = $crawler->getComuni();
  //var_dump($comuni);

  $crawler->comuneIndirizzo = "H223#REGGIO NELL'EMILIA#0#0";
  //'MONTECCHIO EMILIA' => string 'F463#MONTECCHIO EMILIA#0#0'
  //'REGGIO NELL'EMILIA' => string 'H223#REGGIO NELL'EMILIA#0#0'
  //$crawler->setComune("REGGIO NELL'EMILIA");
  
  
  /* [✅] Elenco vie dato nome */
  // $crawler->viaIndirizzo = "Raimondo Franchetti";
  $crawler->viaIndirizzo = "ottobre";
  $crawler->ParolaIntera = false;
  $Indirizzi = $crawler->getIndirizzi();
 
  echo "Indirizzi Trovati: \n"; 
  print_r($Indirizzi); 
  
  if (!count($Indirizzi)) {
    echo "ERRORE NON TROVATI \n\n\n\n";
    goto fine;
  }
  
  $crawler->numIndirizzo = $Indirizzi['VIA RIVOLUZIONE D` OTTOBRE'];// "5607##VIA RIVOLUZIONE D` OTTOBRE"
  $crawler->dalCivico = "11";   // okkio che possono essere null o alfanumerici
  $crawler->alCivico = "13";
  $ImmobiliA = $crawler->getImmobili();
  $IntestatariA = $crawler->getIntestatari();
  
 
  echo "Indirizzi ImmobiliA: \n"; 
  print_r($ImmobiliA);
  echo "<hr>";
  echo "Intestatari ImmobiliA: \n"; 
  var_dump($IntestatariA);  
  
  
  // [✅] Elenco di indirizzi completi esistenti con il civico
  $crawler->numIndirizzo = $Indirizzi["VIA RIVOLUZIONE D'OTTOBRE"];// "207275486##VIA RIVOLUZIONE D'OTTOBRE"
  $crawler->dalCivico = "11";
  $crawler->alCivico = "13";
  $ImmobiliB = $crawler->getImmobili();
  echo "Indirizzi ImmobiliB: \n"; 
  print_r($ImmobiliB);
  $IntestatariB = $crawler->getIntestatari();

  
  // in elaborato trovo i link ai file da prire o i file interi da salvare ove voglio
  fine:
  if ($crawler->isLogged) {
    $crawler->logOut();
  }
  
  echo('</pre>');
