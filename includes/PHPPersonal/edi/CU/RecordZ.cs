using FileHelpers;

namespace CedHouseSuite.Tracciati.AgenziaEntrate.CU.CU_2021
{
    [FixedLengthRecord(FixedMode.ExactLength)]
    public class RecordZ
    {
        public RecordZ()
        {

        }

        [FieldFixedLength(1)]
        public readonly string TipoRecord = "Z";

        [FieldFixedLength(14), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler2to15 = "";

        [FieldFixedLength(9), FieldAlign(AlignMode.Right, '0')]
        public int NumRecordB = 0;

        [FieldFixedLength(9), FieldAlign(AlignMode.Right, '0')]
        public int NumRecordC = 0;

        [FieldFixedLength(9), FieldAlign(AlignMode.Right, '0')]
        public int NumRecordD = 0;        

        [FieldFixedLength(9), FieldAlign(AlignMode.Right, '0')]
        public int NumRecordG = 0;

        [FieldFixedLength(9), FieldAlign(AlignMode.Right, '0')]
        public int NumRecordH = 0;

        [FieldFixedLength(9), FieldAlign(AlignMode.Right, '0')]
        public int NumRecordL = 0;

        [FieldFixedLength(1828), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler70to1897 = "";        

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        public string Terminatore = "A";
    }
}