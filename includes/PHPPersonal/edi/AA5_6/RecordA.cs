using System;
using CedHouseSuite.Tracciati.Converters;
using FileHelpers;

namespace CedHouseSuite.Tracciati.AgenziaEntrate.AA5_6._2022
{
    [FixedLengthRecord(FixedMode.ExactLength)]
    public class RecordA
    {
        [FieldFixedLength(1)]
        private readonly string TipoRecord = "A";

        [FieldFixedLength(6)]
        private readonly string Filler = "000000";

        [FieldFixedLength(8), FieldAlign(AlignMode.Left, '0'), FieldConverter(typeof(DateTimeOptionalConverter), "ddMMyyyy", "")]
        public DateTime? Data_Preparazione_File = null;

        [FieldFixedLength(5)]
        private readonly string CodiceFornitura = "AA508";

        [FieldFixedLength(2)]
        private readonly string Filler2 = "00";

        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string CodiceFiscaleResponsabile = "";

        [FieldFixedLength(591), FieldAlign(AlignMode.Left, ' ')]
        private readonly string Filler3 = "";
        [FieldFixedLength(1068), FieldAlign(AlignMode.Left, ' ')]
        private readonly string Filler4 = "";
        [FieldFixedLength(200), FieldAlign(AlignMode.Left, ' ')]
        private readonly string Filler5 = "";
        [FieldFixedLength(1603), FieldAlign(AlignMode.Left, ' ')]
        private readonly string Filler6 = "";
        [FieldFixedLength(3), FieldAlign(AlignMode.Left, ' ')]
        private readonly string ControlChars = "F" + '\u000D' + '\u000A';
    }
}