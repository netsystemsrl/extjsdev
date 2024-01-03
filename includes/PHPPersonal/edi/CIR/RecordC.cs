using System;
using CedHouseSuite.Tracciati.Converters;
using FileHelpers;

namespace CedHouseSuite.Tracciati.AgenziaEntrate.DetrazioniFiscali.CIR_2022
{
    [FixedLengthRecord(FixedMode.ExactLength)]
    public class RecordC : IRecordContenuto
    {
        [FieldFixedLength(1)]
        public readonly string TipoRecord = "C";

        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string CFIncaricato = "";

        [FieldFixedLength(8), FieldAlign(AlignMode.Right, '0')]
        public int ProgressivoModulo = 1;

        [FieldFixedLength(3), FieldAlign(AlignMode.Left, ' ')]
        public string SpazioDisposizioneUtente = "";

        [FieldFixedLength(25), FieldAlign(AlignMode.Left, ' ')]
        public string Filler29to53 = "";

        [FieldFixedLength(20), FieldAlign(AlignMode.Left, ' ')]
        public string SpazioUtente = "";

        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public readonly string IdentificativoSoftwareProduttore = Costanti.PIVA_PRODUTTORE_SOFTWARE;

        [FieldFixedLength(1808), FieldAlign(AlignMode.Left, ' ')]
        public string Contenuto = "";

        //[FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        //public readonly string Filler1898to1898 = "";
        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Terminatore = "A";

        //[FieldFixedLength(2), FieldAlign(AlignMode.Left, ' ')]
        //public readonly string Filler1899to1900 = "";

        public string CampiNonPosizionali
        {
            get { return Contenuto; }
            set { Contenuto = value; }
        }

        //[FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        //public readonly string Terminatore = "A";

        public object NewRecord()
        {
            var ret = new RecordC();
            ret.CFIncaricato = CFIncaricato;
            ret.ProgressivoModulo = ProgressivoModulo;
            return ret;
        }
    }
}