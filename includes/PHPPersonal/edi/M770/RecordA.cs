using FileHelpers;

namespace CedHouseSuite.Tracciati.AgenziaEntrate.M770.M770_2022
{
    [FixedLengthRecord(FixedMode.ExactLength)]
    public class RecordA
    {
        public RecordA()
        {

        }

        [FieldFixedLength(1)]
        public string TipoRecord = "A";

        [FieldFixedLength(14)]
        public readonly string Filler2to15 = "";

        [FieldFixedLength(5)]
        public readonly string CodiceFornitura = "77022";

        [FieldFixedLength(2)]
        public readonly string TipoFornitore = "10";

        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string CodiceFiscaleFornitore = "";

        [FieldFixedLength(483), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler39to521 = "";

        [FieldFixedLength(4), FieldAlign(AlignMode.Right, '0')]
        public int ProgressivoInvio = 1;

        [FieldFixedLength(4), FieldAlign(AlignMode.Right, '0')]
        public int TotaleInvii = 1;

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