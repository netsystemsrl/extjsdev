using System;
using CedHouseSuite.Tracciati.Converters;
using FileHelpers;

namespace CedHouseSuite.Tracciati.Mav.Ricezione
{
    [FixedLengthRecord(FixedMode.ExactLength)]
    public sealed class Record14
    {
        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string Filler1 = "";

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string TipoRecord = "14"; //Contenuto fisso “14”

        [FieldFixedLength(7)]
        [FieldAlign(AlignMode.Right, '0')]
        public int NumeroProgressivo = 0; //Numero della disposizione all’interno del flusso. Inizia da 1 ed è progressivo di 1. Il numero deve essere uguale per tutti i record della stessa disposizione

        [FieldFixedLength(12)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string Filler11to22 = "";

        [FieldFixedLength(6)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(ConverterKind.Date, "ddMMyy")]
        public DateTime DataScadenza; //Data di scadenza della disposizione, indicata nel formato GGMMAA

        [FieldFixedLength(5)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string Causale = ""; //Assume valore fisso “07000”

        [FieldFixedLength(13)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal Importo = 0; //Importo della disposizione (si vedano le note di pagina 4)

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string Segno = "-"; //Assume valore fisso “-”

        #region Coordinate della banca esattrice

        [FieldFixedLength(5)]
        [FieldAlign(AlignMode.Right, '0')]
        public string AbiBanca; //Codice ABI della bancaesattrice

        [FieldFixedLength(5)]
        [FieldAlign(AlignMode.Right, '0')]
        public string CabBanca; //CAB della banca esattrice        

        [FieldFixedLength(12)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler58To69 = "";

        #endregion

        #region Coordinate banca assuntrice

        [FieldFixedLength(5)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string AbiAssuntrice;

        [FieldFixedLength(5)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CabAssuntrice;

        [FieldFixedLength(12)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string NumeroConto;

        #endregion

        #region Azienda Creditrice
        [FieldFixedLength(5)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string SiaCreditrice;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string TipoCodiceClienteDebitore; //Può assumere i seguenti valori: 1 (utenza), 2 (matricola), 3 (codice fiscale), 4 (codice cliente), 
        //5 (codice fornitore), 6 (portafoglio commerciale), 9 (altri). Deve essere valorizzato soltanto se è stato indicato anche il campo precedente

        [FieldFixedLength(16)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CodiceClienteDebitore; 
        #endregion


        [FieldFixedLength(6)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string Filler114To119 = "";

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string Divisa = "E"; //Divisa: valorizzare con “E”
    }
}
