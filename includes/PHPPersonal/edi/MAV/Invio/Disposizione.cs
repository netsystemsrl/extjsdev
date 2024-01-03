using System;
using System.Collections.Generic;
using System.Linq;
using CedHouseSuite.Common.Enums;
using CedHouseSuite.Common.Extensions;
using CedHouseSuite.Model.Anagrafiche;
using CedHouseSuite.Model.Mav;
using CedHouseSuite.Model.Studi;

namespace CedHouseSuite.Tracciati.Mav.Invio
{
    public sealed class Disposizione
    {
        private readonly bool _utilizzaEmail;

        public Disposizione(DisposizioneMav dMav, int numeroProgressivo, bool utilizzaEmail)
        {
            _utilizzaEmail = utilizzaEmail;

            Record14 = new Record14();
            Record20 = new Record20();
            Record30 = new Record30();
            Record40 = new Record40();
            Record50 = new Record50();
            Record51 = new Record51();
            Record70 = new Record70();
            ListaRecord59 = new List<Record59>();

            CompilaDisposizione(dMav, numeroProgressivo);
        }

        private void CompilaDisposizione(DisposizioneMav dMav, int numeroProgressivo)
        {
            var fixCaratteri = dMav.InvioMav.Condominio.GetModalitaCaratteriCbi() == ModalitaCaratteriCBI.UsaSoloCaratteriConsigliati;

            Record14.NumeroProgressivo = numeroProgressivo;
            Record20.NumeroProgressivo = numeroProgressivo;
            Record30.NumeroProgressivo = numeroProgressivo;
            Record40.NumeroProgressivo = numeroProgressivo;
            Record50.NumeroProgressivo = numeroProgressivo;
            Record51.NumeroProgressivo = numeroProgressivo;
            Record70.NumeroProgressivo = numeroProgressivo;

            // p.valli 18/06/2019
//#if DEBUG || ALPHA
            string codiceBollettino = dMav.CodiceBollettino;
            if (!string.IsNullOrEmpty(codiceBollettino) && codiceBollettino.Length == 17)
            {
                string codiceIdentificativo = codiceBollettino.Substring(5, 12);
                Record51.CodiceIdentificativoUnivoco = Convert.ToInt64(codiceIdentificativo);
            }
//#endif

            Record14.DataPagamento = dMav.DataScadenza;
            Record14.Importo = dMav.Importo;
            Record14.AbiBanca = dMav.InvioMav.AbiRicevente;
            Record14.CabBanca = dMav.InvioMav.CabRicevente;
            Record14.NumeroConto = dMav.InvioMav.NumeroContoRicevente;
            Record14.SiaOrdinante = dMav.InvioMav.SiaMittente;
            Record14.TipoCodiceClienteDebitore = "4"; // 4 = codice cliente
            Record14.CodiceClienteDebitore = dMav.Codice;


            var descrizioneCreditore = fixCaratteri ? CbiUtils.RimuoviCaratteriNonConsigliati(dMav.InvioMav.DescrizioneCreditore) : dMav.InvioMav.DescrizioneCreditore;
            Record20.DescrizioneCreditoreRiga1 = descrizioneCreditore.SafeSubstring(0, 24);
            Record20.DescrizioneCreditoreRiga2 = descrizioneCreditore.SafeSubstring(24, 24);
            Record20.DescrizioneCreditoreRiga3 = descrizioneCreditore.SafeSubstring(48, 24);
            Record20.DescrizioneCreditoreRiga4 = descrizioneCreditore.SafeSubstring(72, 24);

            var denominazionePostale = fixCaratteri ? CbiUtils.RimuoviCaratteriNonConsigliati(dMav.Soggetto.DenominazionePostale) : dMav.Soggetto.DenominazionePostale;
            Record30.DescrizioneDebitore1 = denominazionePostale.SafeSubstring(0, 30);
            Record30.DescrizioneDebitore2 = denominazionePostale.SafeSubstring(30, 30);


            // aggiunto 30/07/2020 su richiesta di F. Vigna
            string cf_pi = dMav.Soggetto.CodiceFiscale;
            //if (string.IsNullOrEmpty(cf_pi)) cf_pi = dMav.Soggetto.PartitaIva;
            if (!string.IsNullOrEmpty(cf_pi))
            {
                Record30.CodiceFiscale = cf_pi;
            }


             var indirizzo = string.Format("{0} {1}", dMav.Soggetto.IndirizzoPerCorrispondenza.TracciatiViaCivico, dMav.Soggetto.IndirizzoPerCorrispondenza.Localita).Trim();
            indirizzo = fixCaratteri ? CbiUtils.RimuoviCaratteriNonConsigliati(indirizzo) : indirizzo;
            Record40.Indirizzo = indirizzo.SafeSubstring(0, 30);
            Record40.CompletamentoIndirizzo = indirizzo.SafeSubstring(30, 28);
            Record40.Cap = dMav.Soggetto.IndirizzoPerCorrispondenza.Cap;

            var comune = string.Format("{0} {1}", dMav.Soggetto.IndirizzoPerCorrispondenza.Comune, dMav.Soggetto.IndirizzoPerCorrispondenza.SiglaProvincia).Trim();
            comune = fixCaratteri ? CbiUtils.RimuoviCaratteriNonConsigliati(comune) : comune;
            Record40.ComuneSiglaProvincia = comune;

            var descrizioneDebito = fixCaratteri ? CbiUtils.RimuoviCaratteriNonConsigliati(dMav.DescrizioneDelDebito) : dMav.DescrizioneDelDebito;
            var aggiungiEmail = _utilizzaEmail && dMav.Soggetto.ModalitaComunicazioni.HasFlag(ModalitaComunicazioni.Email) && dMav.Soggetto.Contatti.Any(x => x.Tipologia == TipoContatto.Email && x.EmailMav);

            if (descrizioneDebito.Length <= 80 && !aggiungiEmail)
            {
                Record50.RiferimentiAlDebito1 = descrizioneDebito.SafeSubstring(0, 40);
                Record50.RiferimentiAlDebito2 = descrizioneDebito.SafeSubstring(40, 40);
            }
            else
            {
                if (aggiungiEmail)
                {
                    //var Amministratore = new StudioAmministratori();
                    if (dMav.Soggetto.Intestatari.FirstOrDefault().Gestione.Condominio.Amministratore.Studio.PartitaIva == "09348121006" && 
                        dMav.InvioMav.AbiRicevente == "05696")
                    {
                        var email = dMav.Soggetto.Contatti.First(x => x.Tipologia == TipoContatto.Email && x.EmailMav);
                        var strutturaEml = email.Riferimento;
                        //aggiungiamo un Record59 aggiuntivo con l'indirizzo email del soggetto
                        Record51.NumeroProgressivo = numeroProgressivo;
                        Record51.Filler21To74 = strutturaEml.SafeSubstring(0, 54);
                    }
                    else
                    {
                        var email = dMav.Soggetto.Contatti.First(x => x.Tipologia == TipoContatto.Email && x.EmailMav);
                        var strutturaEml = string.Format("EML{0}", email.Riferimento);
                        //aggiungiamo un Record59 aggiuntivo con l'indirizzo email del soggetto
                        var r59 = new Record59();
                        r59.NumeroProgressivo = numeroProgressivo;
                        r59.RiferimentiAlDebito1 = strutturaEml.SafeSubstring(0, 55);
                        r59.RiferimentiAlDebito2 = strutturaEml.SafeSubstring(55, 55);
                        ListaRecord59.Add(r59);
                    }
                }

                while (descrizioneDebito.Length > 0)
                {
                    var r59 = new Record59();
                    r59.NumeroProgressivo = numeroProgressivo;
                    r59.RiferimentiAlDebito1 = descrizioneDebito.SafeSubstring(0, 55);
                    r59.RiferimentiAlDebito2 = descrizioneDebito.SafeSubstring(55, 55);
                    ListaRecord59.Add(r59);

                    descrizioneDebito = descrizioneDebito.SafeSubstring(110, descrizioneDebito.Length);
                }
            }

            switch (dMav.InvioMav.TipoBollettino)
            {
                case TipoMav.Bancario:
                    Record70.TipoBollettino = "B";
                    break;
                case TipoMav.Postale:
                    Record70.TipoBollettino = "P";
                    break;
                case TipoMav.Predefinito:
                    Record70.TipoBollettino = "";
                    break;

            }
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
