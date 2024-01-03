using FileHelpers;

namespace CedHouseSuite.Tracciati.AgenziaEntrate.DetrazioniFiscali.CIR_2022
{
    [FixedLengthRecord(FixedMode.ExactLength)]
    public class RecordZ
    {
        [FieldFixedLength(1)]
        public readonly string TipoRecord = "Z";

        [FieldFixedLength(14), FieldAlign(AlignMode.Left, ' ')]
        public readonly string FillerDa2a15 = "";

        [FieldFixedLength(9), FieldAlign(AlignMode.Right, '0')]
        public int NumeroRecordB = 0;

        [FieldFixedLength(9), FieldAlign(AlignMode.Right, '0')]
        public int NumeroRecordC = 0;

        [FieldFixedLength(1864), FieldAlign(AlignMode.Left, ' ')]
        public readonly string FillerDa34a1897 = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Terminatore = "A";
    }
}