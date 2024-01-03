using System;
using System.Collections.Generic;
using System.Linq;
using CedHouseSuite.Model.Mav;
using FileHelpers;

namespace CedHouseSuite.Tracciati.Mav.Invio
{
    public sealed class TracciatoMav
    {

        public RecordIM Testata { get; set; }
        public RecordEF Coda { get; set; }
        public List<Disposizione> Disposizioni { get; set; }

        public TracciatoMav()
        {
            Testata = new RecordIM();
            Coda = new RecordEF();
            Disposizioni = new List<Disposizione>();
        }

        public void CreaMav(InvioMav invioMav, bool only_valid=false)
        {
            Testata.SiaMittente = invioMav.SiaMittente;
            Testata.AbiRicevente = invioMav.AbiRicevente;
            Testata.DataCreazione = invioMav.DataCreazione;
            Testata.NomeSupporto = invioMav.NomeSupporto;

            int numeroDisposizione = 1;


            // modifica 13/12/2019 p.valli
            //foreach (var dMav in invioMav.Disposizioni.OrderBy(x => x.Soggetto.Denominazione).ThenBy(x => x.DataScadenza))
            //    Disposizioni.Add(new Disposizione(dMav, numeroDisposizione++, invioMav.Condominio.UtilizzaEmailInInvioMav));


            var invioMav_disposizioni = invioMav.Disposizioni.ToList();
            if (only_valid)
            {
                // per la banca di Sondrio 
                // genero il file solo per quelle disposizioni che hanno un codice bollettino valido
                invioMav_disposizioni = invioMav_disposizioni.Where(d => (!string.IsNullOrEmpty(d.CodiceBollettino) && Convert.ToInt64(d.CodiceBollettino) > 0 && d.CodiceBollettino.Length == 17)).ToList();
            }

            foreach (var dMav in invioMav_disposizioni.OrderBy(x => x.Soggetto.Denominazione).ThenBy(x => x.DataScadenza))
                Disposizioni.Add(new Disposizione(dMav, numeroDisposizione++, invioMav.Condominio.UtilizzaEmailInInvioMav));

            Coda.SiaMittente = invioMav.SiaMittente;
            Coda.AbiRicevente = invioMav.AbiRicevente;
            Coda.DataCreazione = invioMav.DataCreazione;
            Coda.NomeSupporto = invioMav.NomeSupporto;
            Coda.NumeroDisposizioni = Disposizioni.Count;
            Coda.TotImportiNegativi = invioMav_disposizioni.Sum(x => x.Importo);
            Coda.NumeroRecord = 2 + Disposizioni.Sum(x => x.GetNumeroRecord());
        }

        public void GeneraFile(string nomeFile)
        {
            FixedFileEngine engine = null;

            engine = new FixedFileEngine(typeof(RecordIM));
            engine.WriteFile(nomeFile, new[] { Testata });

            foreach (Disposizione d in Disposizioni)
            {
                engine = new FixedFileEngine(typeof(Record14));
                engine.AppendToFile(nomeFile, d.Record14);

                engine = new FixedFileEngine(typeof(Record20));
                engine.AppendToFile(nomeFile, d.Record20);

                engine = new FixedFileEngine(typeof(Record30));
                engine.AppendToFile(nomeFile, d.Record30);

                engine = new FixedFileEngine(typeof(Record40));
                engine.AppendToFile(nomeFile, d.Record40);

                if (d.ListaRecord59.Count == 0)
                {
                    engine = new FixedFileEngine(typeof(Record50));
                    engine.AppendToFile(nomeFile, d.Record50);

                    engine = new FixedFileEngine(typeof(Record51));
                    engine.AppendToFile(nomeFile, d.Record51);
                }
                else
                {
                    engine = new FixedFileEngine(typeof(Record51));
                    engine.AppendToFile(nomeFile, d.Record51);


                    engine = new FixedFileEngine(typeof(Record59));
                    if (d.ListaRecord59.Count > 20)
                        engine.AppendToFile(nomeFile, d.ListaRecord59.Take(20));
                    else
                        engine.AppendToFile(nomeFile, d.ListaRecord59);

                }


                engine = new FixedFileEngine(typeof(Record70));
                engine.AppendToFile(nomeFile, d.Record70);
            }

            engine = new FixedFileEngine(typeof(RecordEF));
            engine.AppendToFile(nomeFile, Coda);
        }
    }
}
