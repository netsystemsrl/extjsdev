using FileHelpers;

namespace CedHouseSuite.Tracciati.Mav.Invio
{
    [FixedLengthRecord(FixedMode.ExactLength)]
    public sealed class Record51
    {
        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1 = "";

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string TipoRecord = "51"; //Contenuto fisso “51”

        [FieldFixedLength(7)]
        [FieldAlign(AlignMode.Right, '0')]
        public int NumeroProgressivo = 0; //Stesso valore presente nel record 14

        [FieldFixedLength(10)]
        [FieldAlign(AlignMode.Right, '0')]
        public int NumeroDisposizione = 1; //Numero della disposizione assegnato dal creditore. 
        //Tale numero viene sempre restituito tal quale sia nel caso della 
        //comunicazione degli esiti, sia nel caso di rendicontazione di emissione. 
        //Può quindi essere utilizzato dal cliente presentatore, unitamente al 
        //codice cliente debitore del record 14, per riabbinare il “pagato” o l’”emesso” 
        //al MAV presentato per aggiornare automaticamente i propri archivi.

        [FieldFixedLength(54)]
        [FieldAlign(AlignMode.Left, ' ')]
        //public readonly string Filler21To74 = "";
        public  string Filler21To74 = "";

        [FieldFixedLength(12)]
        [FieldAlign(AlignMode.Right, '0')]
       // public int CodiceIdentificativoUnivoco = 0;
       // p.valli 28/05/2019 - 12 caratteri non puo essere int
        public long CodiceIdentificativoUnivoco = 0;

        [FieldFixedLength(34)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler87To120 = "";
    }
}
