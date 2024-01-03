using System;
using CedHouseSuite.Tracciati.Converters;
using FileHelpers;

namespace CedHouseSuite.Tracciati.Mav.Ricezione
{
    [FixedLengthRecord(FixedMode.ExactLength)]
    public sealed class Record10
    {
        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string Filler1;

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string TipoRecord;

        [FieldFixedLength(7)]
        [FieldAlign(AlignMode.Right, '0')]
        public int NumeroProgressivo; //Stesso valore presente nel record 14

        [FieldFixedLength(6)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string DataCreazione;

        [FieldFixedLength(6)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(DateTimeOptionalConverter), "ddMMyy", "      ")]
        public DateTime? DataValutaDestinatario;

        [FieldFixedLength(6)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string Filler23to28;

        [FieldFixedLength(5)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string Causale;

        [FieldFixedLength(13)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal Importo;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string Segno;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string Divisa; //Divisa: valorizzato con “E”

        [FieldFixedLength(9)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string Filler49;

        [FieldFixedLength(12)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string Riferimento;

        [FieldFixedLength(10)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string Filler70to79;

        [FieldFixedLength(12)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string NumeroContoMovimentato;

        [FieldFixedLength(29)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string Filler92to120;
    }
}