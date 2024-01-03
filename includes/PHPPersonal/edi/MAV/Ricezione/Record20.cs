using FileHelpers;

namespace CedHouseSuite.Tracciati.Mav.Ricezione
{
    [FixedLengthRecord(FixedMode.ExactLength)]
    public sealed class Record20
    {
        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1 = "";

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string TipoRecord = "20"; //Contenuto fisso “20”

        [FieldFixedLength(7)]
        [FieldAlign(AlignMode.Right, '0')]
        public int NumeroProgressivo = 0; //Stesso valore presente nel record 14

        [FieldFixedLength(24)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string DescrizioneCreditoreRiga1 = ""; //Descrizione del creditore (obbligatoria)

        [FieldFixedLength(24)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string DescrizioneCreditoreRiga2 = ""; //Descrizione del creditore (obbligatoria)

        [FieldFixedLength(24)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string DescrizioneCreditoreRiga3 = ""; //Descrizione del creditore (obbligatoria)

        [FieldFixedLength(24)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string DescrizioneCreditoreRiga4 = ""; //Descrizione del creditore (obbligatoria)

        [FieldFixedLength(14)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler107To120 = "";
    }
}
