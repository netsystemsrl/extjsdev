<?php
//caso1

// Data di esempio
$date = "2023-04-19";

// Convertire la data in timestamp
$timestamp = strtotime($date);

// Ottenere il primo giorno della settimana corrente
$first_day = strtotime("next Monday", $timestamp) - 604800;

// Formattare il risultato come data
$first_day_date = date("Y-m-d", $first_day);

// Stampare il risultato
echo "caso1 - Il primo giorno della settimana corrente è: $first_day_date <br>";

//caso2

// Ottenere il timestamp corrente
$timestamp = time();

// Ottenere il primo giorno della settimana corrente
$first_day = strtotime("next Monday", $timestamp);

// Formattare il risultato come data
$first_day_date = date("Y-m-d", $first_day);

// Stampare il risultato
echo "caso2 - Il primo giorno della settimana prossima è: $first_day_date <br>";

//caso3

// Data di partenza diversa dal momento attuale
$start_date = now();

// Convertire la data in una stringa
$date = date("Y-m-d", $start_date);

// Convertire la stringa in timestamp
$timestamp = strtotime($date);

// Ottenere il primo giorno della settimana corrente
$first_day = strtotime("next Monday", $timestamp) - 604800;

// Formattare il risultato come data
$first_day_date = date("Y-m-d", $first_day);

// Stampare il risultato
echo "caso3 - Il primo giorno della settimana corrente è: $first_day_date <br>";

