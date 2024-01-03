using FileHelpers;

namespace CedHouseSuite.Tracciati.AgenziaEntrate.F24INTERMEDIARIO
{
    [FixedLengthRecord(FixedMode.ExactLength)]
    public sealed class RecordZ
    {
        public RecordZ()
        {
            TipoRecord = "Z";
            //TipoFornitore = "14";
            //Progressivo = "001";
            //Invii = "001";
            NumeroRecordM = "1";
            TipoRecordChiusura = "A";
        }



        [FieldFixedLength(1)]
        public readonly string TipoRecord;

        [FieldFixedLength(14)]
        public readonly string Filler1 = "";

        [FieldFixedLength(9)]
        [FieldAlign(AlignMode.Right, '0')]
        public int NumeroRecordV;

        [FieldFixedLength(9)]
        [FieldAlign(AlignMode.Right, '0')]
        public string NumeroRecordM;

        [FieldFixedLength(1864)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler34To1897 = "";

        [FieldFixedLength(1)]
        public readonly string TipoRecordChiusura;


        //[FieldFixedLength(13)]
        //[FieldAlign(AlignMode.Right, '0')]
        //[FieldConverter(typeof(TwoDecimalConverter))]
        //public decimal Importo;

        //[FieldFixedLength(7)]
        //[FieldAlign(AlignMode.Right, '0')]
        //public int ProtocolloDelega;

    }
}
