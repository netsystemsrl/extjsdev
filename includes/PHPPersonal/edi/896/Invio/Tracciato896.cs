using System.Collections.Generic;
using System.Linq;
using CedHouseSuite.Common.Extensions;
using CedHouseSuite.Model.Anagrafiche;
using CedHouseSuite.Model.Mav;
using CedHouseSuite.Model.TD896;
using FileHelpers;

namespace CedHouseSuite.Tracciati.TD896.Invio
{
    public sealed class Tracciato896
    {
        [DelimitedRecord("\t")]
        [IgnoreEmptyLines()]
        [IgnoreFirst()]
        private class CsvRow
        {
            public string progr { get; set; }
            public string data_pagamento { get; set; }
            public string importo { get; set; }
            public string causale { get; set; }
            public string codice_debitore { get; set; }
            public string descrizione_debitore { get; set; }
            public string indirizzo_debitore { get; set; }
            public string cap { get; set; }
            public string comune { get; set; }
            public string provincia { get; set; }
        }

        private Invio896 _invio;

        public Tracciato896(Invio896 invio)
        {
            _invio = invio;
        }
        
        public void GeneraFile(string nomeFile)
        {

            var fixCaratteri = (_invio.Condominio.GetModalitaCaratteriCbi() == ModalitaCaratteriCBI.UsaSoloCaratteriConsigliati);

            const string HEADER = "PROGR\tDATA PAGAMENTO\tIMPORTO\tCAUSALE\tCODICE DEBITORE\tDESCRIZIONE DEBITORE\tINDIRIZZO DEBITORE\tCAP\tCOMUNE\tPROVINCIA";
            FileHelperEngine engine = new FileHelperEngine(typeof(CsvRow));
            engine.HeaderText = HEADER;
            List<CsvRow> csv = new List<CsvRow>();
            int progressivo = 1;
            foreach (var disp in _invio.Disposizioni.OrderBy(x => x.Soggetto.Denominazione).ThenBy(x => x.DataScadenza))
            {
                var csvRow = new CsvRow();
                csvRow.progr = progressivo.ToString();
                csvRow.data_pagamento = disp.DataScadenza.ToString("ddMMyy");
                csvRow.importo = disp.Importo.ToString("0.00");
                csvRow.causale = disp.DescrizioneDelDebito.SafeLeft(110).SafeTrim().ToUpper();
                csvRow.codice_debitore = disp.Codice;

                var soggetto = disp.Soggetto;
                if (soggetto != null)
                {
                    csvRow.descrizione_debitore = soggetto.Denominazione.ToUpper();
                    System.Diagnostics.Debug.Write(soggetto.Denominazione.ToUpper() + " - ");
                    var indirizzo = soggetto.Indirizzo;
                    if (indirizzo != null)
                    {
                        csvRow.indirizzo_debitore = indirizzo.TracciatiViaCivico.ToUpper();
                        csvRow.cap = indirizzo.Cap;
                        csvRow.comune = indirizzo.Comune.ToUpper();
                        csvRow.provincia = indirizzo.SiglaProvincia.ToUpper();
                    }
                }

                csv.Add(csvRow);
                progressivo++;
            }

            engine.WriteFile(nomeFile, csv);
            
        }
    }
}
