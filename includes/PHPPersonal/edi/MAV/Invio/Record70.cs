using FileHelpers;

namespace CedHouseSuite.Tracciati.Mav.Invio
{
    [FixedLengthRecord(FixedMode.ExactLength)]
    public sealed class Record70
    {
        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1 = "";

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string TipoRecord = "70"; //Contenuto fisso “70”

        [FieldFixedLength(7)]
        [FieldAlign(AlignMode.Right, '0')]
        public int NumeroProgressivo = 0; //Stesso valore presente nel record 14

        [FieldFixedLength(83)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler11To93 = "";

        //Può assumere i seguenti valori:
        //blank: il cliente chiede alla banca di comportarsi secondo gli accordi bilaterali stabiliti in fase di attivazione del servizio;
        //"P”: il cliente chiede alla banca di emettere un bollettino MAV standard postale;
        //"B”: il cliente chiede alla banca di emettere un bollettino MAV valido solo per il circuito bancario
        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string TipoBollettino = "";

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler95 = "";

        [FieldFixedLength(5)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CampoADisposizione = "";

        [FieldFixedLength(20)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string ChiaviDiControllo = "";
    }
}
