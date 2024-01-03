using FileHelpers;

namespace CedHouseSuite.Tracciati.AgenziaEntrate.UNICO.SC_2022
{
    [FixedLengthRecord(FixedMode.ExactLength)]
    public class RecordB
    {
        public RecordB()
        {
        }

        [FieldFixedLength(1)]
        public readonly string TipoRecord = "B";

        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string CodiceFiscaleDichiarante = "";

        [FieldFixedLength(8), FieldAlign(AlignMode.Right, '0')]
        public int ProgressivoModulo = 1;

        [FieldFixedLength(3), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Utente26to28 = "";

        [FieldFixedLength(25), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler29to53 = "";

        [FieldFixedLength(20), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Utente54to73 = "";

        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public readonly string IdentificativoProduttoreSoftware = Costanti.PIVA_PRODUTTORE_SOFTWARE;

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string CbFlagConferma = "1";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string Redditi = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string AddizionaleIRES = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string Iva = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string Trust = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string QuadroVO = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string QuadroAC = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string StudiDiSettore = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string Parametri = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        public string Filler1 = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        public string Filler2 = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        public string Filler3 = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string IvaBase = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string DichiarazioneCorrettiva = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string DichiarazioneIntegrativaAFavore = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string DichiarazioneIntegrativa = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string DichiarazioneIntegrativaDpr322 = "0";

        [FieldFixedLength(24), FieldAlign(AlignMode.Left, ' ')]
        public readonly string FillerCognome = "";

        [FieldFixedLength(20), FieldAlign(AlignMode.Left, ' ')]
        public readonly string FillerNome = "";

        [FieldFixedLength(60), FieldAlign(AlignMode.Left, ' ')]
        public string Denominazione = "";

        [FieldFixedLength(11), FieldAlign(AlignMode.Left, ' ')]
        public string PartitaIva = "";

        [FieldFixedLength(1676), FieldAlign(AlignMode.Left, ' ')]
        public readonly string FillerComposito222to1897 = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Terminatore = "A";
    }
}