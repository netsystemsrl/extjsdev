<?php
  
  require_once("index.php");
  $crawler = new Crawler();
  $crawler->debug = false;
  $crawler->maxRetry = 0;
 
  echo('<pre>'); 
  
  // [✅] Settare il comune per la ricerca delle visure catastali
  $provincie = $crawler->getProvincie();
  $crawler->setProvincia("REGGIO EMILIA Territorio"); // Oppure "REGGIO EMILIA Territorio-RE"

  // [✅] Elenco dei comuni su cui fare scelta
  $comuni = $crawler->getComuni();
  $crawler->comuneIndirizzo = $comuni["REGGIO NELL'EMILIA"]; // "H223#REGGIO NELL'EMILIA#0#0";
  
  
  // [✅] Elenco vie dato nome
  $crawler->viaIndirizzo = "ottobre";
  $crawler->ParolaIntera = false;
  $Indirizzi = $crawler->getIndirizzi();
  echo "Indirizzi trovati: \n";
  var_dump($Indirizzi);
  
  
  // ne trovo 2
  
  // [✅] Elenco di indirizzi completi esistenti con il civico
  $crawler->numIndirizzo = $Indirizzi['VIA RIVOLUZIONE D` OTTOBRE'];// "5607##VIA RIVOLUZIONE D` OTTOBRE"
  $crawler->dalCivico = "11";   // okkio che possono essere null o alfanumerici
  $crawler->alCivico = "13";
  $ImmobiliA = $crawler->getImmobili();
  var_dump($ImmobiliA);
  
  
  // [✅] Elenco di indirizzi completi esistenti con il civico
  $crawler->numIndirizzo = $Indirizzi["VIA RIVOLUZIONE D'OTTOBRE"];// "207275486##VIA RIVOLUZIONE D'OTTOBRE"
  $crawler->dalCivico = "11";
  $crawler->alCivico = "13";
  $ImmobiliB = $crawler->getImmobili();
  var_dump($ImmobiliB);
  // in $immmobili trovo tutto
  
  
  goto fine;
 
  // ---- Esempio di ricerca di un elaborato planimetrico ----
  $crawler->comuneIndirizzo = $comuni["MONTECCHIO EMILIA"]; // "F463#MONTECCHIO EMILIA#0#0";
  $crawler->foglio = 17;
  $crawler->particella["particella1"] = 224;
  $crawler->particella["particella2"] = null;
  
  $crawler->elaborato = true;
  $crawler->formatoFogli = "A3"; // o "A4"
  
  $crawler->elencoSubalterni = true;
  $crawler->formatoStampa = "PDF"; //o "DAT"
  
  $Elaborati = $crawler->getElaborati();
  
  $crawler->numeroElaboratoPlanimetrico = 1; //(il più in alto e quindi il più nuovo)
  $elaborato = $crawler->getElaborato();
  
  
  // in elaborato trovo i link ai file da prire o i file interi da salvare ove voglio
  fine:
  if ($crawler->isLogged) {
    $crawler->logOut();
  }