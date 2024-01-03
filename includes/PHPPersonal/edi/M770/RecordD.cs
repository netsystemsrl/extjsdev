using FileHelpers;

namespace CedHouseSuite.Tracciati.AgenziaEntrate.M770.M770_2022
{
    [FixedLengthRecord(FixedMode.ExactLength)]
    public class RecordD
    {
        public RecordD()
        {
        }

        [FieldFixedLength(1)]
        public readonly string TipoRecord = "D";

        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string CodiceFiscaleDichiarante = "";

        [FieldFixedLength(8), FieldAlign(AlignMode.Right, '0')]
        public int ProgressivoModulo = 1;

        [FieldFixedLength(3), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Utente26to28 = "";

        //[FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        //public string TipoOperazione = "";

        [FieldFixedLength(25), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler29to53 = "";

        [FieldFixedLength(20), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Utente54to73 = "";

        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public readonly string IdentificativoProduttoreSoftware = Costanti.PIVA_PRODUTTORE_SOFTWARE;

        [FieldFixedLength(1800), FieldAlign(AlignMode.Left, ' ')]
        public string Contenuto = "";

        [FieldFixedLength(8), FieldAlign(AlignMode.Left, ' ')]
        public string Filler1890to1897 = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Terminatore = "A";
    }
}