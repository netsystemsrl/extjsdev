using FileHelpers;

namespace CedHouseSuite.Tracciati.Mav.Invio
{
    [FixedLengthRecord(FixedMode.ExactLength)]
    public sealed class Record40
    {
        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1 = "";

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string TipoRecord = "40"; //Contenuto fisso “40”

        [FieldFixedLength(7)]
        [FieldAlign(AlignMode.Right, '0')]
        public int NumeroProgressivo = 0; //Stesso valore presente nel record 14

        [FieldFixedLength(30)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string Indirizzo = ""; //Via, numero civico e/o nome della frazione

        [FieldFixedLength(5)]
        [FieldAlign(AlignMode.Right, '0')]
        public string Cap = ""; //Codice di avviamento postale

        [FieldFixedLength(25)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string ComuneSiglaProvincia = ""; //Comune e sigla della provincia

        [FieldFixedLength(28)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CompletamentoIndirizzo = ""; //Campo per completamento indirizzo

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CodicePaese = ""; //Codice paese

        [FieldFixedLength(20)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string Filler101To120 = "";
    }
}
