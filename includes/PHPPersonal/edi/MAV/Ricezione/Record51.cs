using System;
using CedHouseSuite.Tracciati.Converters;
using FileHelpers;

namespace CedHouseSuite.Tracciati.Mav.Ricezione
{
    [FixedLengthRecord(FixedMode.ExactLength)]
    public sealed class Record51
    {
        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1 = "";

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string TipoRecord = "51"; //Contenuto fisso “51”

        [FieldFixedLength(7)]
        [FieldAlign(AlignMode.Right, '0')]
        public int NumeroProgressivo = 0; //Stesso valore presente nel record 14

        [FieldFixedLength(10)]
        [FieldAlign(AlignMode.Right, '0')]
        // public long NumeroDisposizione = 0;
        // modifica 14/01/2020 p.valli - necessaria per leggere i files di Banca Sondrio
        public string NumeroDisposizione = "";

        [FieldFixedLength(54)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string Filler21To74 = "";

        [FieldFixedLength(12)]
        [FieldAlign(AlignMode.Right, '0')]
        public long? CodiceIdentificativoUnivoco = 0;

        [FieldFixedLength(5)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal? Importo = 0;

        [FieldFixedLength(6)]
        public string DataValutaString;

        [FieldFixedLength(12)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string RiferimentoRecordRiepilogativo = "";

        [FieldFixedLength(6)]
        public string DataEffettivaPagamentoString;

        [FieldFixedLength(5)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string Filler116To120 = "";
    }
}
