using FileHelpers;

namespace CedHouseSuite.Tracciati.AgenziaEntrate.UNICO.SC_2022

{
    [FixedLengthRecord(FixedMode.ExactLength)]
    public class RecordA
    {
        public RecordA()
        {
        }

        [FieldFixedLength(1)]
        public readonly string TipoRecord = "A";

        [FieldFixedLength(14)]
        public readonly string Filler2to15 = string.Empty;

        [FieldFixedLength(5)]
        public string CodiceFornitura = "RSC18";

        [FieldFixedLength(2)]
        public readonly string TipoFornitore = "10";

        [FieldFixedLength(16)]
        public string CodiceFiscaleFornitore = string.Empty;

        [FieldFixedLength(483)]
        public readonly string Filler39to521 = string.Empty;

        [FieldFixedLength(4), FieldAlign(AlignMode.Right, '0')]
        public int ProgressivoInvio = 1;

        [FieldFixedLength(4), FieldAlign(AlignMode.Right, '0')]
        public int NumeroTotaleInvii = 1;

        [FieldFixedLength(100)]
        public readonly string CampoUtente530to629 = string.Empty;

        [FieldFixedLength(1068)]
        public readonly string Filler630to1697 = string.Empty;

        [FieldFixedLength(200)]
        public readonly string Filler1698to1897 = string.Empty;

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Terminatore = "A";
    }
}