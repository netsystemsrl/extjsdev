using FileHelpers;

namespace CedHouseSuite.Tracciati.AgenziaEntrate.CU.CU_2021
{
    [FixedLengthRecord(FixedMode.ExactLength)]
    public class RecordD : IRecordContenuto
    {        

        [FieldFixedLength(1)]
        public readonly string TipoRecord = "D";

        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string CodiceFiscaleDichiarante = "";

        [FieldFixedLength(8), FieldAlign(AlignMode.Right, '0')]
        public int ProgressivoModulo = 1;

        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string CodiceFiscalePercipiente = "";

        [FieldFixedLength(5), FieldAlign(AlignMode.Right, '0')]
        public int ProgressivoCertificazione = 1;

        [FieldFixedLength(17), FieldAlign(AlignMode.Right, '0')]
        public string ProtocolloNumero1 = "";

        [FieldFixedLength(6), FieldAlign(AlignMode.Right, '0')]
        public string ProtocolloNumero2 = "";

        [FieldFixedLength(14), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Utente70to83 = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        public string TipoOperazione = "";

        [FieldFixedLength(4), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler85to88 = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Right, '0')]
        public readonly string CbConferma = "1";        

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
            var ret = new RecordD();
            ret.CodiceFiscaleDichiarante = CodiceFiscaleDichiarante;
            ret.ProgressivoModulo = ProgressivoModulo + 1;
            ret.ProgressivoCertificazione = ProgressivoCertificazione;

            return ret;
        }       
    }
}