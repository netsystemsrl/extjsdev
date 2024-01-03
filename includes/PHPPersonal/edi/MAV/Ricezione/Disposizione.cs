using System.Collections.Generic;
using CedHouseSuite.Model.Mav;

namespace CedHouseSuite.Tracciati.Mav.Ricezione
{
    public sealed class Disposizione
    {
        public Disposizione(DisposizioneMav dMav, int numeroProgressivo)
        {
            Record14 = new Record14();
            Record20 = new Record20();
            Record30 = new Record30();
            Record40 = new Record40();
            Record50 = new Record50();
            Record51 = new Record51();
            Record70 = new Record70();
            ListaRecord59 = new List<Record59>();            
        }        

        public Record14 Record14 { get; set; }
        public Record20 Record20 { get; set; }
        public Record30 Record30 { get; set; }
        public Record40 Record40 { get; set; }
        public Record50 Record50 { get; set; }
        public Record51 Record51 { get; set; }
        public Record70 Record70 { get; set; }
        
        public List<Record59> ListaRecord59 { get; set; }

        public int GetNumeroRecord()
        {
            if (ListaRecord59.Count > 0)
                return 6 + ListaRecord59.Count;
                                                    
            return 7;
        }
    }
}
