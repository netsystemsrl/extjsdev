using FileHelpers;

namespace CedHouseSuite.Tracciati.Mav.Ricezione
{
    [FixedLengthRecord(FixedMode.ExactLength)]
    public sealed class Record16
    {
        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string Filler1 = "";

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string TipoRecord = "16"; // Contenuto fisso “16”

        [FieldFixedLength(7)]
        [FieldAlign(AlignMode.Right, '0')]
        public int NumeroProgressivo;

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CodicePaese;

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Left, '0')]        
        public string CheckDigit;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string Cin;

        [FieldFixedLength(5)]
        [FieldAlign(AlignMode.Right, '0')]        
        public string Abi;

        [FieldFixedLength(5)]
        [FieldAlign(AlignMode.Right, '0')]
        public string Cab;

        [FieldFixedLength(12)]
        [FieldAlign(AlignMode.Right, '0')]
        public string ContoCorrente;

        [FieldFixedLength(83)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string Filler38To120;

    }
}
