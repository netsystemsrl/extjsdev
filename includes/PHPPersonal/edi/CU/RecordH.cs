using FileHelpers;

namespace CedHouseSuite.Tracciati.AgenziaEntrate.CU.CU_2021
{
    [FixedLengthRecord(FixedMode.ExactLength)]
    public class RecordH : IRecordContenuto
    {

        [FieldFixedLength(1)]
        public readonly string TipoRecord = "H";

        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string CodiceFiscaleDichiarante = "";

        [FieldFixedLength(8), FieldAlign(AlignMode.Right, '0')]
        public int ProgressivoModulo = 1;

        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string CodiceFiscalePercipiente = "";

        [FieldFixedLength(5), FieldAlign(AlignMode.Right, '0')]
        public int ProgressivoCertificazione = 0;

        [FieldFixedLength(17), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler47to63 = "";        

        [FieldFixedLength(6), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Utente64to69 = "";       

        [FieldFixedLength(20), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler70to89 = "";        

        [FieldFixedLength(1800), FieldAlign(AlignMode.Left, ' ')]
        public string Contenuto = "";

        [FieldFixedLength(8), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1890to1897 = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Terminatore = "A";


        public string CampiNonPosizionali
        {
            get { return Contenuto; }
            set { Contenuto = value; }
        }

        public object NewRecord()
        {
            var ret = new RecordH();
            ret.CodiceFiscaleDichiarante = CodiceFiscaleDichiarante;
            ret.ProgressivoModulo = 1;
            ret.ProgressivoCertificazione = ProgressivoCertificazione;

            return ret;
        }
    }
}