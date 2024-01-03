using FileHelpers;

namespace CedHouseSuite.Tracciati.AgenziaEntrate.UNICO.SC_2022
{
    [FixedLengthRecord(FixedMode.ExactLength)]
    public class RecordC
    {
        public RecordC()
        {
        }

        [FieldFixedLength(1)]
        public readonly string TipoRecord = "C";

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

        [FieldFixedLength(1800), FieldAlign(AlignMode.Left, ' ')]
        public string Contenuto = "";

        [FieldFixedLength(8), FieldAlign(AlignMode.Left, ' ')]
        public readonly string FillerFinale = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Terminatore = "A";

        public void accodaTestoLungo(string codice, string valore)
        {
            if (!string.IsNullOrEmpty(valore))
            {
                if (valore.Length <= 16)
                {
                    Contenuto += codice;
                    Contenuto += string.Format("{0,-16}", valore);
                }
                else
                {
                    Contenuto += codice;
                    Contenuto += string.Format("{0,-16}", valore.Substring(0, 16));
                    valore = valore.Substring(16);

                    while (valore.Length > 15)
                    {
                        Contenuto += codice;
                        Contenuto += string.Format("{0,-16}", "+" + valore.Substring(0, 15));
                        valore = valore.Substring(15);
                    }
                    Contenuto += codice;
                    Contenuto += string.Format("{0,-16}", "+" + valore);
                }
            }
        }
    }
}