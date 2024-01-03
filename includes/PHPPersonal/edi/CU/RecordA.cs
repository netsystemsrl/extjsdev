using FileHelpers;

namespace CedHouseSuite.Tracciati.AgenziaEntrate.CU.CU_2021
{
    [FixedLengthRecord(FixedMode.ExactLength)]
    public class RecordA
    {
        [FieldFixedLength(1)]
        public string TipoRecord = "A";

        [FieldFixedLength(14)]
        public readonly string Filler2to15 = "";

        [FieldFixedLength(5)]
        public readonly string CodiceFornitura = "CUR22";

        /// <summary>
        /// Record 4
        /// </summary>
        [FieldFixedLength(2)]
        public readonly string TipoFornitore = "10";

        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string CodiceFiscaleFornitore = "";

        [FieldFixedLength(483), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler39to521 = "";

        [FieldFixedLength(4), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler522to525 = "";

        [FieldFixedLength(4), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler526to529 = "";

        [FieldFixedLength(100), FieldAlign(AlignMode.Left, ' ')]
        public string Utente530to629 = "";

        [FieldFixedLength(1068), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler630to1697 = "";

        [FieldFixedLength(200), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Riservato = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Terminatore = "A";
    }
}