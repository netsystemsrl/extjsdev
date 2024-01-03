using FileHelpers;

namespace CedHouseSuite.Tracciati.AgenziaEntrate.AA5_6._2022
{
    [FixedLengthRecord(FixedMode.ExactLength)]
    public class RecordZ
    {
        public RecordZ()
        {

        }

        [FieldFixedLength(1)]
        private readonly string TipoRecord = "Z";

        [FieldFixedLength(14), FieldAlign(AlignMode.Left, ' ')]
        private readonly string Filler2to15 = "";
        [FieldFixedLength(3485), FieldAlign(AlignMode.Left, ' ')]
        private readonly string Filler = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        private readonly string ControlChars = "F" /*+ '\u000D' + '\u000A'*/;
    }
}