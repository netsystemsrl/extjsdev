using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using CedHouseSuite.Common.Extensions;
using CedHouseSuite.Common.Segnalazioni;
using CedHouseSuite.Common.Utils;
using CedHouseSuite.Model.DetrazioniFiscali;
using CedHouseSuite.Tracciati.SerializerSettings;
using FileHelpers;
using Newtonsoft.Json;

namespace CedHouseSuite.Tracciati.AgenziaEntrate.DetrazioniFiscali.CIR_2022
{
    public class TracciatoCIR2022
    {
        public List<IRecordContenuto> Records;
        private char[] CARATTERI_DA_RIMUOVERE = new[] { '\'' };

        public RecordA RA { get; set; } = new RecordA();
        public RecordB RB { get; set; } = new RecordB();
        public List<RecordC> RC { get; set; } = new List<RecordC>();
        public RecordZ RZ { get; set; } = new RecordZ();
        public IDictionary<string, object> RJson { get; set; } = new ExpandoObject();
        public IDictionary<string, object> RCJson { get; set; } = new ExpandoObject();
        public IDictionary<string, object> RDJson { get; set; } = new ExpandoObject();

        public TracciatoCIR2022()
        {
            Records = new List<IRecordContenuto>();
        }

        public void FillJsonObject()
        {
            RJson.Add("#B001", "");
            RJson.Add("#B002", StringUtils.FirstNotNullNotEmpty(RA.CodiceFiscaleFornitore));
            RJson.Add("#B003", "00000001");
            RJson.Add("#B004", StringUtils.FirstNotNullNotEmpty(RA.TipoFornitore));
            RJson.Add("#B005", StringUtils.FirstNotNullNotEmpty(RB.CodiceFiscaleDichiarante));
            RJson.Add("#B006", RB.ProgressivoModulo.ToString());
            RJson.Add("#B007", StringUtils.FirstNotNullNotEmpty(RB.IdentificativoProduttoreSoftware));
            RJson.Add("#B008", RB.TipoSoggetto.ToString());
            RJson.Add("#B009", StringUtils.FirstNotNullNotEmpty(RB.CodiceFiscaleSoggettoBeneficiario));
            RJson.Add("#B010", StringUtils.FirstNotNullNotEmpty(RB.TelefonoSoggettoBeneficiario));
            RJson.Add("#B011", StringUtils.FirstNotNullNotEmpty(RB.EmailSoggettoBeneficiario));
            RJson.Add("#B012", StringUtils.FirstNotNullNotEmpty(RB.CFRappresentanteSoggettoBeneficiario));
            RJson.Add("#B013", RB.CodiceCaricaRappresentanteSoggettoBeneficiario.ToString());
            RJson.Add("#B014", StringUtils.FirstNotNullNotEmpty(RB.FirmaSoggettoBeneficiarioCB));
            RJson.Add("#B015", string.IsNullOrWhiteSpace(RB.CFCondominio) ? "00000000000" : RB.CFCondominio);
            RJson.Add("#B016", RB.CondominioMinimo.ToString());
            RJson.Add("#B017", StringUtils.FirstNotNullNotEmpty(RB.CFAmministratoreCondominoIncaricato));
            RJson.Add("#B018", StringUtils.FirstNotNullNotEmpty(RB.EmailAmministratoreCondominoIncaricato));
            RJson.Add("#B019", StringUtils.FirstNotNullNotEmpty(RB.FirmaAmministratoreCondominoIncaricatoCB));
            RJson.Add("#B020", StringUtils.FirstNotNullNotEmpty(RB.Intermediario_CodiceFiscale));
            RJson.Add("#B021", RB.Intermediario_DataImpegno.HasValue ? RB.Intermediario_DataImpegno.Value.ToString("ddMMyyyy") : "");
            RJson.Add("#B022", StringUtils.FirstNotNullNotEmpty(RB.Intermediario_CbFirma));
            RJson.Add("#B023", StringUtils.FirstNotNullNotEmpty(RB.CFResponsabileCAF));
            RJson.Add("#B024", StringUtils.FirstNotNullNotEmpty(RB.CFCAF));
            RJson.Add("#B025", StringUtils.FirstNotNullNotEmpty(RB.CFProfessionistaConformita));
            RJson.Add("#B026", StringUtils.FirstNotNullNotEmpty(RB.FirmaConformitaCB));
            RJson.Add("#B027", StringUtils.FirstNotNullNotEmpty(RB.CodiceRicevuta_ENEA));
            RJson.Add("#B028", StringUtils.FirstNotNullNotEmpty(RB.PolizzaAssicurativa_ENEA_CB));
            RJson.Add("#B029", StringUtils.FirstNotNullNotEmpty(RB.CodiceIdentificativo_RischioSismico));
            RJson.Add("#B030", StringUtils.FirstNotNullNotEmpty(RB.CodiceFiscaleProfessionista_RischioSismico));
            RJson.Add("#B031", StringUtils.FirstNotNullNotEmpty(RB.PolizzaAssicurativa_RischioSismico_CB));
            RJson.Add("#B032", StringUtils.FirstNotNullNotEmpty(RB.IdentificatoAnnullamentoSostituzioneComunicazione));
            RJson.Add("#B033", RB.ProgressivoAnnullamentoSostituzioneComunicazione.ToString());
            RJson.Add("#B034", StringUtils.FirstNotNullNotEmpty(RB.FlagAnnullamento_CB));
            RJson.Add("#B035", StringUtils.FirstNotNullNotEmpty(RB.TipologiaIntervento));
            RJson.Add("#B036", StringUtils.FirstNotNullNotEmpty(RB.SuperbonusIntervento_CB));
            RJson.Add("#B037", StringUtils.FirstNotNullNotEmpty(RB.SuperbonusIntervento_RestrizioniEdilizie_CB));
            RJson.Add("#B038", StringUtils.FirstNotNullNotEmpty(RB.UnitaImmobiliariCondominio));
            RJson.Add("#B039", RB.ImportoComplessivoSpesaSostenuta.ToString());
            RJson.Add("#B040", StringUtils.FirstNotNullNotEmpty(RB.AnnoSostenimentoSpesa_DA));
            RJson.Add("#B041", RB.InterventoPeriodo2020?.ToString() ?? "0");
            RJson.Add("#B042", RB.InterventoStatoAvanzamentoLavori.ToString());
            RJson.Add("#B043", StringUtils.FirstNotNullNotEmpty(RB.PrimaTrasmissioneIdentificativo));
            RJson.Add("#B044", StringUtils.FirstNotNullNotEmpty(RB.PrimaTrasmissioneProgressivo));
            RJson.Add("#B045", StringUtils.FirstNotNullNotEmpty(RB.PrimoAnnoSostenimentoSpesa_DA));
            RJson.Add("#B046", StringUtils.FirstNotNullNotEmpty(RB.EdiliziaLibera));
        }

        private string GetProgressivoModuloNumericoJSONFormattato(int progressivoModuloNumericoJSON)
        {
            return progressivoModuloNumericoJSON.ToString().PadLeft(8, '0');
        }

        public List<Segnalazione> Compila(CessioneCreditoRiqualificazioneEnergetica2022 cessione)
        {
            var ret = new List<Segnalazione>();

            RB.TipoSoggetto = 2;
            switch (RB.TipoSoggetto)
            {
                case 1:
                    //TODO - COMPILARE
                    RB.CodiceFiscaleSoggettoBeneficiario = "".SafeUpper();
                    RB.CodiceFiscaleDichiarante = RB.CodiceFiscaleSoggettoBeneficiario;

                    if (!string.IsNullOrWhiteSpace(RB.CodiceFiscaleSoggettoBeneficiario))
                    {
                        RB.TelefonoSoggettoBeneficiario = "".SafeUpper();
                        RB.EmailSoggettoBeneficiario = "".SafeUpper();
                        RB.FirmaSoggettoBeneficiarioCB = "";
                    }

                    if (StringUtils.IsPartitaIva(RB.CodiceFiscaleSoggettoBeneficiario))
                    {
                        RB.CFRappresentanteSoggettoBeneficiario = "".SafeUpper();
                        if (!string.IsNullOrWhiteSpace(RB.CFRappresentanteSoggettoBeneficiario))
                            RB.CodiceCaricaRappresentanteSoggettoBeneficiario = 1;
                    }
                    break;
                case 2:
                    //RB.CFCondominio e RB.CondominioMinimo sono campi alternativi, o uno o l'altro
                    if (cessione.CondominioMinimo)
                    {
                        RB.CondominioMinimo = cessione.CondominioMinimoTracciato;
                    }
                    else
                    {
                        RB.CFCondominio = cessione.CodiceFiscaleCondominio.SafeUpper();
                    }

                    RB.CFAmministratoreCondominoIncaricato = cessione.CodiceFiscaleAmministratoreOIncaricato.SafeUpper();
                    RB.EmailAmministratoreCondominoIncaricato = cessione.EMailAmministratoreOIncaricato.SafeUpper();
                    RB.FirmaAmministratoreCondominoIncaricatoCB = cessione.FirmaAmministratoreOIncaricatoString;


                    RB.CodiceFiscaleDichiarante = cessione.CondominioMinimo ? RB.CFAmministratoreCondominoIncaricato.SafeUpper() : RB.CFCondominio.SafeUpper();
                    //RB.CodiceFiscaleDichiarante = RB.CFAmministratoreCondominoIncaricato.SafeUpper();// : RB.CFCondominio.SafeUpper();
                    //RB.CodiceFiscaleDichiarante = RB.CondominioMinimo == 2 ? RB.CFAmministratoreCondominoIncaricato.SafeUpper() : RB.CFCondominio.SafeUpper();

                    break;
            }

            switch (cessione.TipologiaFornitore)
            {
                case "01":
                    if (RB.CodiceCaricaRappresentanteSoggettoBeneficiario != 2 && RB.CodiceCaricaRappresentanteSoggettoBeneficiario != 7)
                    {
                        RA.CodiceFiscaleFornitore = RB.CodiceFiscaleDichiarante;
                    }
                    else
                    {
                        RA.CodiceFiscaleFornitore = RB.CFRappresentanteSoggettoBeneficiario;
                    }
                    break;
                case "02":
                    RA.CodiceFiscaleFornitore = cessione.CodiceFiscaleAmministratoreOIncaricato.SafeUpper();
                    break;
                case "10":
                    RA.CodiceFiscaleFornitore = cessione.CodiceFiscaleIncaricato.SafeUpper();
                    break;
                default:
                    break;
            }

            List<int> codiciCaricheDaEscludere = new List<int>() { 2, 7 };

            var allow = true;

            if (codiciCaricheDaEscludere.Contains(RB.CodiceCaricaRappresentanteSoggettoBeneficiario))
            {
                if (RA.CodiceFiscaleFornitore == RB.CodiceFiscaleDichiarante || RA.CodiceFiscaleFornitore == RB.CFRappresentanteSoggettoBeneficiario)
                {
                    allow = false;
                }
            }

            if (RA.TipoFornitore == "10"
                && allow)
            {
                RB.Intermediario_CodiceFiscale = cessione.CodiceFiscaleIncaricato.SafeUpper();
                if (!string.IsNullOrWhiteSpace(RB.Intermediario_CodiceFiscale))
                {
                    RB.Intermediario_DataImpegno = cessione.DataImpegno;
                    RB.Intermediario_CbFirma = cessione.FirmaIncaricatoString;
                }
            }

            RB.IdentificatoAnnullamentoSostituzioneComunicazione = cessione.ProtocolloTelematicoIdentificativo;
            RB.ProgressivoAnnullamentoSostituzioneComunicazione = cessione.ProtocolloTelematicoProgressivo;
            RB.FlagAnnullamento_CB = cessione.AnnullamentoFlag;

            if (string.IsNullOrWhiteSpace(RB.FlagAnnullamento_CB) || RB.FlagAnnullamento_CB == "0")
            {
                RB.TipologiaIntervento = cessione.TipologiaInterventoDetrazioneString;

                RB.ImportoComplessivoSpesaSostenuta = cessione.ImportoComplessivaSpesaSostenuta;
                RB.AnnoSostenimentoSpesa_DA = cessione.AnnoSostenimentoSpesa.ToString();

                if ((Convert.ToInt32(cessione.TipologiaInterventoDetrazioneString) >= 4 && Convert.ToInt32(cessione.TipologiaInterventoDetrazioneString) <= 16
                    || Convert.ToInt32(cessione.TipologiaInterventoDetrazioneString) >= 19 && Convert.ToInt32(cessione.TipologiaInterventoDetrazioneString) <= 21
                    || Convert.ToInt32(cessione.TipologiaInterventoDetrazioneString) == 26
                    || Convert.ToInt32(cessione.TipologiaInterventoDetrazioneString) == 27) && (RB.AnnoSostenimentoSpesa_DA == "2021" && RB.InterventoPeriodo2020 == 2
                    || (Convert.ToInt32(RB.AnnoSostenimentoSpesa_DA) > 2020)))
                {
                    RB.SuperbonusIntervento_CB = cessione.InterventoSuperbonus ? "1" : "0";
                }

                if ((Convert.ToInt32(cessione.TipologiaInterventoDetrazioneString) >= 4 && Convert.ToInt32(cessione.TipologiaInterventoDetrazioneString) <= 12
                    || Convert.ToInt32(cessione.TipologiaInterventoDetrazioneString) == 16
                    || Convert.ToInt32(cessione.TipologiaInterventoDetrazioneString) >= 19 && Convert.ToInt32(cessione.TipologiaInterventoDetrazioneString) <= 21
                    || Convert.ToInt32(cessione.TipologiaInterventoDetrazioneString) == 26
                    || Convert.ToInt32(cessione.TipologiaInterventoDetrazioneString) == 27)
                    &&
                    (RB.AnnoSostenimentoSpesa_DA == "2021" && RB.InterventoPeriodo2020 == 2
                      || (Convert.ToInt32(RB.AnnoSostenimentoSpesa_DA) > 2020)))
                {
                    RB.SuperbonusIntervento_RestrizioniEdilizie_CB = cessione.ImmobileConRestrizioniEdilizie ? "1" : "0";
                }

                if (RB.AnnoSostenimentoSpesa_DA == "2021")
                    RB.InterventoPeriodo2020 = cessione.Periodo2020;

                // if (cessione.InterventoSuperbonus)
                RB.InterventoStatoAvanzamentoLavori = cessione.StatoAvanzamentoLavoriTracciato;

                //if (RB.InterventoStatoAvanzamentoLavori > 1)
                //{
                RB.PrimaTrasmissioneIdentificativo = cessione.ProtocolloTelematicoTrasmissionePrimaComunicazione;
                if (string.IsNullOrWhiteSpace(cessione.ProtocolloTelematicoTrasmissionePrimaComunicazioneProgressivo))
                {
                    RB.PrimaTrasmissioneProgressivo = cessione.ProtocolloTelematicoTrasmissionePrimaComunicazioneProgressivo;
                }
                else
                {
                    RB.PrimaTrasmissioneProgressivo = int.Parse(cessione.ProtocolloTelematicoTrasmissionePrimaComunicazioneProgressivo).ToString().PadLeft(6, '0'); //Serve per eliminare i zeri di troppo a sinistra
                }
                RB.PrimoAnnoSostenimentoSpesa_DA = cessione.PrimoAnnoSostenimentoSpesa.ToString();
                //}
            }

            if (Convert.ToInt32(cessione.TipologiaInterventoDetrazioneString) == 1
                || Convert.ToInt32(cessione.TipologiaInterventoDetrazioneString) == 2
                || ((Convert.ToInt32(cessione.TipologiaInterventoDetrazioneString) >= 4 && Convert.ToInt32(cessione.TipologiaInterventoDetrazioneString) <= 12 || Convert.ToInt32(cessione.TipologiaInterventoDetrazioneString) == 16 || Convert.ToInt32(cessione.TipologiaInterventoDetrazioneString) >= 19 && Convert.ToInt32(cessione.TipologiaInterventoDetrazioneString) <= 21)
                      && RB.SuperbonusIntervento_CB == "1"
                      && RB.SuperbonusIntervento_RestrizioniEdilizie_CB == "1")
                || Convert.ToInt32(cessione.TipologiaInterventoDetrazioneString) == 19
                || Convert.ToInt32(cessione.TipologiaInterventoDetrazioneString) == 20)
            {
                RB.CodiceRicevuta_ENEA = cessione.CodiceIdentificativoENEA.SafeUpper();
                if (!string.IsNullOrWhiteSpace(RB.CodiceRicevuta_ENEA))
                {
                    RB.PolizzaAssicurativa_ENEA_CB = cessione.PolizzaAssicurativa ? "1" : "0";
                }
            }

            List<int> tipologieRischioSismico = new List<int>() { 13, 14, 15, 26, 27 };
            if (tipologieRischioSismico.Contains(Convert.ToInt32(cessione.TipologiaInterventoDetrazioneString))
                || RB.SuperbonusIntervento_CB == "1"
                || RB.AnnoSostenimentoSpesa_DA == "2021" && RB.InterventoPeriodo2020 == 2 || (Convert.ToInt32(RB.AnnoSostenimentoSpesa_DA) > 2020))
            {
                RB.CodiceIdentificativo_RischioSismico = cessione.CodiceIdentificativoAsseverazione.SafeUpper().SafeReplace(CARATTERI_DA_RIMUOVERE);
                RB.CodiceFiscaleProfessionista_RischioSismico = cessione.CodiceFiscaleProfessionistaAsseverazioneRischioSismico.SafeUpper();
                RB.PolizzaAssicurativa_RischioSismico_CB = cessione.PolizzaAssicurativaRischioSismico ? "1" : "0";
            }

            //if (!string.IsNullOrWhiteSpace(RB.CodiceRicevuta_ENEA)
            //    || !string.IsNullOrWhiteSpace(RB.PolizzaAssicurativa_ENEA_CB)
            //    || !string.IsNullOrWhiteSpace(RB.CodiceIdentificativo_RischioSismico)
            //    || !string.IsNullOrWhiteSpace(RB.CodiceFiscaleProfessionista_RischioSismico)
            //    || !string.IsNullOrWhiteSpace(RB.PolizzaAssicurativa_RischioSismico_CB)
            //    )
            //{
            RB.CFResponsabileCAF = cessione.CodiceFiscaleResponsabileCAF.SafeUpper();
            RB.CFProfessionistaConformita = cessione.CodiceFiscaleProfessionista.SafeUpper();

            if (!string.IsNullOrWhiteSpace(RB.CFResponsabileCAF))
                RB.CFCAF = cessione.CodiceFiscaleCAF.SafeUpper();

            RB.FirmaConformitaCB = cessione.FirmaResponsabileCAFOProfessionistaString;
            //}

            List<string> checkInterventoEdiliziaLibera = new List<string>() { "1", "2", "18", "19", "20", "28" };
            if (!checkInterventoEdiliziaLibera.Contains(RB.TipologiaIntervento))
            {
                RB.EdiliziaLibera = cessione.EdiliziaLiberaString;
            }

            //QUADRO B - N ELEMENTI
            var unitaImmobiliari = cessione.GetUnitaImmobiliari();
            int progressivoModuloNumerico = 0;
            int progressivoModuloNumericoQuadroBJSON = 1;
            int progressivoModuloNumericoQuadroCJSON = 1;
            int progressivoModuloNumericoQuadroDJSON = 1;
            int identificativoUnitaImmobiliare = 0;

            if (RB.FlagAnnullamento_CB != "1" && string.IsNullOrWhiteSpace(RB.CodiceFiscaleSoggettoBeneficiario))
            {
                if ((!string.IsNullOrWhiteSpace(RB.CFCondominio) || RB.CondominioMinimo > 0))
                {
                    RB.UnitaImmobiliariCondominio = unitaImmobiliari.Count().ToString("N0");
                }
            }

            FillJsonObject();


            int indexFornitoreJSON = 0;
            int indexBeneficiarioJSON = 0;
            int indexUnitaImmobiliareJSON = 0;

            foreach (var unitaImmobiliare in unitaImmobiliari)
            {
                RecordC subRC = new RecordC();

                identificativoUnitaImmobiliare++;
                progressivoModuloNumerico++;
                subRC.ProgressivoModulo = progressivoModuloNumerico;
                string progressivoModulo = progressivoModuloNumerico.ToString().PadLeft(8, '0');

                //string indexUnitaImmobiliareJson = "001";
                //progressivoModuloNumericoQuadroBJSON++;
                //progressivoModuloNumericoQuadroCJSON++;
                //progressivoModuloNumericoQuadroDJSON++;
                //string progressivoModuloJSON = progressivoModuloNumericoQuadroBJSON.ToString().PadLeft(8, '0');

                RC.Add(subRC);

                subRC.CFIncaricato = RB.CodiceFiscaleDichiarante;

                if (RB.FlagAnnullamento_CB != "1")
                {
                    string codUnita = unitaImmobiliare.DatiCatastali.CodiceUnita ?? "";
                    if (codUnita.Length > 16)
                    {
                        string[] codUnitaSplitted = codUnita.Split(new char[] { '\\' });

                        string tempCodUnita = "";
                        for (int i = 0; i < (codUnitaSplitted.Length - 1); i++)
                        {
                            if (tempCodUnita.Length > 0)
                            {
                                tempCodUnita += "\\";
                            }
                            tempCodUnita += codUnitaSplitted[i];
                        }
                        tempCodUnita = tempCodUnita.Substring(0, (16 - codUnitaSplitted.Last().Length - 1));
                        tempCodUnita += "\\";
                        tempCodUnita += codUnitaSplitted.Last();
                        codUnita = tempCodUnita;
                    }

                    string valueBB001000 = RB.TipoSoggetto == 1 ? "1" : codUnita?.SafeUpper();

                    if (indexUnitaImmobiliareJSON == 10)
                    {
                        progressivoModuloNumericoQuadroBJSON++;
                        indexUnitaImmobiliareJSON = 1;
                    }
                    else
                        indexUnitaImmobiliareJSON++;

                    string indexUnitaImmobiliareStringJSON = indexUnitaImmobiliareJSON.ToString().PadLeft(3, '0');

                    RJson.Add($"BB{indexUnitaImmobiliareStringJSON}000{GetProgressivoModuloNumericoJSONFormattato(progressivoModuloNumericoQuadroBJSON)}", StringUtils.FirstNotNullNotEmpty(valueBB001000));
                    subRC = accodaValoreRecord(subRC, $"BB001000", string.Format("{0,-16}", valueBB001000));

                    RJson.Add($"BB{indexUnitaImmobiliareStringJSON}001{GetProgressivoModuloNumericoJSONFormattato(progressivoModuloNumericoQuadroBJSON)}", StringUtils.FirstNotNullNotEmpty(unitaImmobiliare.DatiCatastali.CodiceComune.SafeUpper()));
                    subRC = accodaValoreRecord(subRC, $"BB001001", string.Format("{0,-16}", unitaImmobiliare.DatiCatastali.CodiceComune.SafeUpper()));

                    RJson.Add($"BB{indexUnitaImmobiliareStringJSON}002{GetProgressivoModuloNumericoJSONFormattato(progressivoModuloNumericoQuadroBJSON)}", StringUtils.FirstNotNullNotEmpty(unitaImmobiliare.DatiCatastali.TipologiaImmobile));
                    subRC = accodaValoreRecord(subRC, $"BB001002", string.Format("{0,-16}", unitaImmobiliare.DatiCatastali.TipologiaImmobile));

                    RJson.Add($"BB{indexUnitaImmobiliareStringJSON}003{GetProgressivoModuloNumericoJSONFormattato(progressivoModuloNumericoQuadroBJSON)}", StringUtils.FirstNotNullNotEmpty(unitaImmobiliare.DatiCatastali.SezioneUrbanaComuneCatastale.SafeUpper()));
                    subRC = accodaValoreRecord(subRC, $"BB001003", string.Format("{0,-16}", unitaImmobiliare.DatiCatastali.SezioneUrbanaComuneCatastale.SafeUpper()));

                    RJson.Add($"BB{indexUnitaImmobiliareStringJSON}004{GetProgressivoModuloNumericoJSONFormattato(progressivoModuloNumericoQuadroBJSON)}", StringUtils.FirstNotNullNotEmpty(unitaImmobiliare.DatiCatastali.Foglio.SafeUpper()));
                    subRC = accodaValoreRecord(subRC, $"BB001004", string.Format("{0,-16}", unitaImmobiliare.DatiCatastali.Foglio.SafeUpper()));

                    RJson.Add($"BB{indexUnitaImmobiliareStringJSON}A05{GetProgressivoModuloNumericoJSONFormattato(progressivoModuloNumericoQuadroBJSON)}", StringUtils.FirstNotNullNotEmpty(unitaImmobiliare.DatiCatastali.ParticellaA.SafeUpper()));
                    RJson.Add($"BB{indexUnitaImmobiliareStringJSON}B05{GetProgressivoModuloNumericoJSONFormattato(progressivoModuloNumericoQuadroBJSON)}", StringUtils.FirstNotNullNotEmpty(cessione.ParticellaB.SafeUpper()));

                    RJson.Add($"BB{indexUnitaImmobiliareStringJSON}006{GetProgressivoModuloNumericoJSONFormattato(progressivoModuloNumericoQuadroBJSON)}", StringUtils.FirstNotNullNotEmpty(unitaImmobiliare.DatiCatastali.Subalterno.SafeUpper()));
                    subRC = accodaValoreRecord(subRC, $"BB001006", string.Format("{0,-16}", unitaImmobiliare.DatiCatastali.Subalterno.SafeUpper()));

                    subRC = accodaValoreRecord(subRC, $"BB001A05", string.Format("{0,-16}", unitaImmobiliare.DatiCatastali.ParticellaA.SafeUpper()));
                    //subRC = accodaValoreRecord(subRC, "BB001B05", string.Format("{0,-4}", cessione.ParticellaB.SafeUpper()));

                    int indexBeneficiario = 0;
                    string valueCC001002 = "";
                    List<string> identificativiBeneficiariSconto = new List<string>();

                    foreach (var beneficiario in unitaImmobiliare.Beneficiari)
                    {
                        indexBeneficiario++;

                        //string valueCC000002 = "";
                        //if (RB.TipoSoggetto == 1)
                        //{
                        //    string valueCC000000 = RB.TipoSoggetto == 1 ? "1" : cessione.IdentificativoSoggettoBeneficiario.SafeUpper();
                        //    subRC = accodaValoreRecord(subRC, "CC000000", string.Format("{0,-1}", valueCC000000.SafeUpper()));
                        //    valueCC000002 = item.TipologiaOpzione.SafeUpper();
                        //    subRC = accodaValoreRecord(subRC, "CC000002", string.Format("{0,16}", valueCC000002));

                        //    //alternativo al campo CC000005
                        //    if (item.AmmontareCreditoCedutoOScontatoBeneficiario > 0)
                        //        subRC = accodaValoreRecord(subRC, "CC000004", string.Format("{0,16}", CleanNumber(item.AmmontareCreditoCedutoOScontatoBeneficiario)));

                        //    //alternativo al campo CC000004
                        //    if (cessione.CreditoCedutoRateResidue > 0)
                        //    {
                        //        string valueCC000005 = CleanNumber(cessione.CreditoCedutoRateResidue);
                        //        subRC = accodaValoreRecord(subRC, "CC000005", string.Format("{0,16}", valueCC000005));
                        //        if (!string.IsNullOrWhiteSpace(valueCC000005))
                        //        {
                        //            subRC = accodaValoreRecord(subRC, "CC000006", string.Format("{0,-2}", cessione.NumeroRateResidue));
                        //            subRC = accodaValoreRecord(subRC, "CC000007", string.Format("{0,-16}", cessione.TerminePresentazioneComunicazione));
                        //        }
                        //    }

                        //    //IDENTIFICATIVO IMMOBILE - VALE 1 SE PRESENTE IL RIGO
                        //    subRC = accodaValoreRecord(subRC, "CC000999", "1");
                        //}

                        //QUADRO C - sezione 2 - SOGGETTI BENEFICIARI
                        if (RB.TipoSoggetto == 2)
                        {
                            if (indexBeneficiarioJSON == 10)
                            {
                                progressivoModuloNumericoQuadroCJSON++;
                                indexBeneficiarioJSON = 1;
                            }
                            else
                                indexBeneficiarioJSON++;

                            string indexBeneficiarioString = indexBeneficiario.ToString().PadLeft(3, '0');
                            string indexBeneficiarioStringJSON = indexBeneficiarioJSON.ToString().PadLeft(3, '0');

                            //IDENTIFICATIVO SOGGETTO BENEFICIARIO
                            string identificativoRigaDetrazione = beneficiario.CodiceFiscaleCondominoBeneficiario?.SafeUpper()?.Substring(0, 10) + string.Format("{0,3}", identificativoUnitaImmobiliare.ToString());
                            RCJson.Add($"CC{indexBeneficiarioStringJSON}000{GetProgressivoModuloNumericoJSONFormattato(progressivoModuloNumericoQuadroCJSON)}", identificativoRigaDetrazione);
                            subRC = accodaValoreRecord(subRC, $"CC0{string.Format("{0,2:00}", indexBeneficiario)}000", string.Format("{0,-16}", identificativoRigaDetrazione));

                            //CODICE FISCALE BENEFICIARIO
                            RCJson.Add($"CC{indexBeneficiarioStringJSON}001{GetProgressivoModuloNumericoJSONFormattato(progressivoModuloNumericoQuadroCJSON)}", StringUtils.FirstNotNullNotEmpty(beneficiario.CodiceFiscaleCondominoBeneficiario.SafeUpper()));
                            subRC = accodaValoreRecord(subRC, $"CC0{string.Format("{0,2:00}", indexBeneficiario)}001", string.Format("{0,-16}", beneficiario.CodiceFiscaleCondominoBeneficiario.SafeUpper()));

                            valueCC001002 = beneficiario.TipologiaOpzione.SafeUpper();

                            if (valueCC001002 == "A")
                            {
                                identificativiBeneficiariSconto.Add(identificativoRigaDetrazione);
                            }

                            RCJson.Add($"CC{indexBeneficiarioStringJSON}002{GetProgressivoModuloNumericoJSONFormattato(progressivoModuloNumericoQuadroCJSON)}", StringUtils.FirstNotNullNotEmpty(valueCC001002));
                            subRC = accodaValoreRecord(subRC, $"CC0{string.Format("{0,2:00}", indexBeneficiario)}002", string.Format("{0,-16}", valueCC001002));

                            RCJson.Add($"CC{indexBeneficiarioStringJSON}003{GetProgressivoModuloNumericoJSONFormattato(progressivoModuloNumericoQuadroCJSON)}", StringUtils.FirstNotNullNotEmpty(CleanNumber(beneficiario.SpesaSostenuta)));
                            subRC = accodaValoreRecord(subRC, $"CC0{string.Format("{0,2:00}", indexBeneficiario)}003", string.Format("{0,16}", CleanNumber(beneficiario.SpesaSostenuta)));

                            RCJson.Add($"CC{indexBeneficiarioStringJSON}004{GetProgressivoModuloNumericoJSONFormattato(progressivoModuloNumericoQuadroCJSON)}", StringUtils.FirstNotNullNotEmpty(CleanNumber(beneficiario.AmmontareCreditoCedutoOScontatoBeneficiario)));
                            subRC = accodaValoreRecord(subRC, $"CC0{string.Format("{0,2:00}", indexBeneficiario)}004", string.Format("{0,16}", CleanNumber(beneficiario.AmmontareCreditoCedutoOScontatoBeneficiario)));

                            //IDENTIFICATIVO IMMOBILE
                            RCJson.Add($"CC{indexBeneficiarioStringJSON}999{GetProgressivoModuloNumericoJSONFormattato(progressivoModuloNumericoQuadroCJSON)}", StringUtils.FirstNotNullNotEmpty(codUnita?.SafeUpper()));
                            subRC = accodaValoreRecord(subRC, $"CC0{string.Format("{0,2:00}", indexBeneficiario)}999", string.Format("{0,-16}", codUnita?.SafeUpper()));
                        }
                    }

                    int indexFornitore = 0;

                    for (int indexCessionario = 1; indexCessionario <= unitaImmobiliare.Cessionari.Count(); indexCessionario += 10)
                    {
                        var cessionariPaginaCorrente = unitaImmobiliare.Cessionari.Skip(indexCessionario - 1).Take(10).ToList();

                        if (indexCessionario > 10)
                        {
                            subRC = new RecordC();

                            //progressivoModuloJSON = progressivoModuloNumericoQuadroCJSON.ToString().PadLeft(8, '0');
                            //indexUnitaImmobiliareJson = "001";

                            progressivoModuloNumerico++;
                            subRC.ProgressivoModulo = progressivoModuloNumerico;
                            subRC.CFIncaricato = RB.CodiceFiscaleDichiarante;
                            indexFornitore = 0;

                            RC.Add(subRC);
                        }

                        foreach (var cessionario in cessionariPaginaCorrente)
                        {
                            if (indexFornitoreJSON == 10)
                            {
                                progressivoModuloNumericoQuadroDJSON++;
                                indexFornitoreJSON = 1;
                            }
                            else
                                indexFornitoreJSON++;

                            indexFornitore++;
                            string indexFornitoreString = indexFornitore.ToString().PadLeft(3, '0');
                            string indexFornitoreStringJSON = indexFornitoreJSON.ToString().PadLeft(3, '0');
                            var identificativoBeneficiarioCessione = cessionario.CodiceFiscaleCondominoBeneficiario?.SafeUpper()?.Substring(0, 10) + string.Format("{0,3}", identificativoUnitaImmobiliare.ToString());

                            RDJson.Add($"DD{indexFornitoreStringJSON}001{GetProgressivoModuloNumericoJSONFormattato(progressivoModuloNumericoQuadroDJSON)}", StringUtils.FirstNotNullNotEmpty(cessionario.CodiceFiscaleCessionarioOFornitoreSconto.SafeUpper()));
                            subRC = accodaValoreRecord(subRC, $"DD0{string.Format("{0,2:00}", indexFornitore)}001", string.Format("{0,-16}", cessionario.CodiceFiscaleCessionarioOFornitoreSconto.SafeUpper()));

                            RDJson.Add($"DD{indexFornitoreStringJSON}002{GetProgressivoModuloNumericoJSONFormattato(progressivoModuloNumericoQuadroDJSON)}", StringUtils.FirstNotNullNotEmpty(cessionario.DataEsercizioOpzione.ToString("ddMMyyyy").SafeUpper()));
                            subRC = accodaValoreRecord(subRC, $"DD0{string.Format("{0,2:00}", indexFornitore)}002", string.Format("{0,16}", cessionario.DataEsercizioOpzione.ToString("ddMMyyyy").SafeUpper()));

                            RDJson.Add($"DD{indexFornitoreStringJSON}003{GetProgressivoModuloNumericoJSONFormattato(progressivoModuloNumericoQuadroDJSON)}", StringUtils.FirstNotNullNotEmpty(CleanNumber(cessionario.AmmontareCreditoCedutoOScontatoCessionario)));
                            subRC = accodaValoreRecord(subRC, $"DD0{string.Format("{0,2:00}", indexFornitore)}003", string.Format("{0,16}", CleanNumber(cessionario.AmmontareCreditoCedutoOScontatoCessionario)));

                            //TIPOLOGIA CESSIONARIO VALE DA 1 A 3
                            //(RB.TipoSoggetto == 1 && valueCC000002 == "B") ||
                            if (RB.TipoSoggetto == 2) //&& valueCC001002 == "B"
                            {
                                string tipologiaCessionario = identificativiBeneficiariSconto.Contains(identificativoBeneficiarioCessione) ? "0" : (string.IsNullOrWhiteSpace(cessionario.TipologiaCessionarioString) ? "0" : cessionario.TipologiaCessionarioString);
                                RDJson.Add($"DD{indexFornitoreStringJSON}004{GetProgressivoModuloNumericoJSONFormattato(progressivoModuloNumericoQuadroDJSON)}", tipologiaCessionario);
                                subRC = accodaValoreRecord(subRC, $"DD0{string.Format("{0,2:00}", indexFornitore)}004", string.Format("{0,16}", tipologiaCessionario));
                            }
                            //else
                            //{
                            //    RDJson.Add($"DD{indexFornitoreString}004{progressivoModulo}", "0");
                            //    subRC = accodaValoreRecord(subRC, $"DD0{string.Format("{0,2:00}", indexFornitore)}004", string.Format("{0,16}", "0"));
                            //}
                            RDJson.Add($"DD{indexFornitoreStringJSON}999{GetProgressivoModuloNumericoJSONFormattato(progressivoModuloNumericoQuadroDJSON)}", identificativoBeneficiarioCessione);
                            subRC = accodaValoreRecord(subRC, $"DD0{string.Format("{0,2:00}", indexFornitore)}999", string.Format("{0,-16}", identificativoBeneficiarioCessione));
                        }
                    }
                }
            }

            foreach (var rcJson in RCJson)
                RJson.Add(rcJson);

            foreach (var rdJson in RDJson)
                RJson.Add(rdJson);

            //QUADRO C - sezione 1 - BENEFICIARI
            //int indexBeneficiario = 0;
            //string valueCC001002 = "";
            //foreach (var unitaImmobiliare in unitaImmobiliari)
            //{
            //    var beneficiari = cessione.GetBeneficiari(unitaImmobiliare.DatiCatastali.DatiCatastaliSerialized);
            //    foreach (var beneficiario in beneficiari)
            //    {
            //        indexBeneficiario++;

            //        //string valueCC000002 = "";
            //        //if (RB.TipoSoggetto == 1)
            //        //{
            //        //    string valueCC000000 = RB.TipoSoggetto == 1 ? "1" : cessione.IdentificativoSoggettoBeneficiario.SafeUpper();
            //        //    subRC = accodaValoreRecord(subRC, "CC000000", string.Format("{0,-1}", valueCC000000.SafeUpper()));
            //        //    valueCC000002 = item.TipologiaOpzione.SafeUpper();
            //        //    subRC = accodaValoreRecord(subRC, "CC000002", string.Format("{0,16}", valueCC000002));

            //        //    //alternativo al campo CC000005
            //        //    if (item.AmmontareCreditoCedutoOScontatoBeneficiario > 0)
            //        //        subRC = accodaValoreRecord(subRC, "CC000004", string.Format("{0,16}", CleanNumber(item.AmmontareCreditoCedutoOScontatoBeneficiario)));

            //        //    //alternativo al campo CC000004
            //        //    if (cessione.CreditoCedutoRateResidue > 0)
            //        //    {
            //        //        string valueCC000005 = CleanNumber(cessione.CreditoCedutoRateResidue);
            //        //        subRC = accodaValoreRecord(subRC, "CC000005", string.Format("{0,16}", valueCC000005));
            //        //        if (!string.IsNullOrWhiteSpace(valueCC000005))
            //        //        {
            //        //            subRC = accodaValoreRecord(subRC, "CC000006", string.Format("{0,-2}", cessione.NumeroRateResidue));
            //        //            subRC = accodaValoreRecord(subRC, "CC000007", string.Format("{0,-16}", cessione.TerminePresentazioneComunicazione));
            //        //        }
            //        //    }

            //        //    //IDENTIFICATIVO IMMOBILE - VALE 1 SE PRESENTE IL RIGO
            //        //    subRC = accodaValoreRecord(subRC, "CC000999", "1");
            //        //}

            //        //QUADRO C - sezione 2 - SOGGETTI BENEFICIARI
            //        if (RB.TipoSoggetto == 2)
            //        {
            //            //IDENTIFICATIVO SOGGETTO BENEFICIARIO - DEVE ESSERE UNIVOCO TRA TUTTI - POSSIAMO UTILIZZARE L'ID DEL SOGGETTO???
            //            subRC = accodaValoreRecord(subRC, $"CC0{string.Format("{0,2:00}", indexBeneficiario)}000", string.Format("{0,-16}", beneficiario.CodiceFiscaleCondominoBeneficiario.SafeUpper()));
            //            //CODICE FISCALE BENEFICIARIO
            //            subRC = accodaValoreRecord(subRC, $"CC0{string.Format("{0,2:00}", indexBeneficiario)}001", string.Format("{0,-16}", beneficiario.CodiceFiscaleCondominoBeneficiario.SafeUpper()));
            //            valueCC001002 = beneficiario.TipologiaOpzione.SafeUpper();
            //            subRC = accodaValoreRecord(subRC, $"CC0{string.Format("{0,2:00}", indexBeneficiario)}002", string.Format("{0,-16}", valueCC001002));
            //            subRC = accodaValoreRecord(subRC, $"CC0{string.Format("{0,2:00}", indexBeneficiario)}003", string.Format("{0,16}", CleanNumber(beneficiario.SpesaSostenuta)));
            //            subRC = accodaValoreRecord(subRC, $"CC0{string.Format("{0,2:00}", indexBeneficiario)}004", string.Format("{0,16}", CleanNumber(beneficiario.AmmontareCreditoCedutoOScontatoBeneficiario)));
            //            //IDENTIFICATIVO IMMOBILE
            //            subRC = accodaValoreRecord(subRC, $"CC0{string.Format("{0,2:00}", indexBeneficiario)}999", string.Format("{0,-16}", beneficiario.CodiceFiscaleCessionarioOFornitoreSconto.SafeUpper()));
            //        }
            //    }
            //}

            //QUADRO D - DATI FORNITORE
            //int indexFornitore = 0;
            //foreach (var unitaImmobiliare in unitaImmobiliari)
            //{
            //    var cessionari = cessione.GetCessionari(unitaImmobiliare.DatiCatastali.DatiCatastaliSerialized);
            //    foreach (var cessionario in cessionari)
            //    {
            //        indexFornitore++;

            //        subRC = accodaValoreRecord(subRC, $"DD0{string.Format("{0,2:00}", indexFornitore)}001", string.Format("{0,-16}", cessionario.CodiceFiscaleCessionarioOFornitoreSconto.SafeUpper()));
            //        subRC = accodaValoreRecord(subRC, $"DD0{string.Format("{0,2:00}", indexFornitore)}002", string.Format("{0,16}", cessionario.DataEsercizioOpzione.ToString("ddMMyyyy").SafeUpper()));
            //        subRC = accodaValoreRecord(subRC, $"DD0{string.Format("{0,2:00}", indexFornitore)}003", string.Format("{0,16}", CleanNumber(cessionario.AmmontareCreditoCedutoOScontatoCessionario)));
            //        //TIPOLOGIA CESSIONARIO VALE DA 1 A 3
            //        //(RB.TipoSoggetto == 1 && valueCC000002 == "B") ||
            //        if (RB.TipoSoggetto == 2 && valueCC001002 == "B")
            //            subRC = accodaValoreRecord(subRC, $"DD0{string.Format("{0,2:00}", indexFornitore)}004", string.Format("{0,16}", cessionario.TipologiaCessionarioString));
            //        else
            //            subRC = accodaValoreRecord(subRC, $"DD0{string.Format("{0,2:00}", indexFornitore)}004", string.Format("{0,16}", "0"));
            //        subRC = accodaValoreRecord(subRC, $"DD0{string.Format("{0,2:00}", indexFornitore)}999", string.Format("{0,-16}", cessionario.CodiceFiscaleCessionarioOFornitoreSconto.SafeUpper()));
            //    }
            //}

            RZ.NumeroRecordB++;
            RZ.NumeroRecordC = RC.Count(); //NON SI FA L'INCREMENTALE NEL CICLO, PERCHE' UN RECORD POTREBBE ESSERE INSERITO ANCHE IN DUE RECORD SEPARATI QUALORA I CAMPI NON POSIZIONALI FOSSERO TROPPI


            return ret;
        }

        public void GeneraFile(string nomeFile)
        {
            FixedFileEngine engine;

            engine = new FixedFileEngine(typeof(RecordA));
            engine.WriteFile(nomeFile, new[] { RA });

            engine = new FixedFileEngine(typeof(RecordB));
            engine.AppendToFile(nomeFile, new[] { RB });

            engine = new FixedFileEngine(typeof(RecordC));
            engine.AppendToFile(nomeFile, RC);

            engine = new FixedFileEngine(typeof(RecordZ));
            engine.AppendToFile(nomeFile, new[] { RZ });
        }

        public string GeneraJsonFile()
        {
            return JsonConvert.SerializeObject(RJson, new JsonSerializerSettings() { ContractResolver = new SubstituteNullWithEmptyStringContractResolver() });
        }

        private string CleanNumber(int value)
            => value.ToString("N0").Replace(".", "");

        //public List<DTReport> GetReportItems()
        //{
        //    return null; //todo - cosa bisogna inserire???
        //}

        public T accodaValoreMultiploRecord<T>(T rec, string chiave, string valore, bool forzaAccodamento = false) where T : IRecordContenuto
        {
            if (string.IsNullOrWhiteSpace(valore) && !forzaAccodamento)
                return rec;

            if (valore == null)
                valore = string.Empty;

            if (rec.CampiNonPosizionali.Length + 24 > 1800)
            {
                var newRec = (T)rec.NewRecord();
                Records.Add(newRec);

                rec = newRec;
            }

            if (valore.Length <= 16)
            {
                rec.CampiNonPosizionali += chiave + string.Format("{0,-16}", valore);
            }
            else
            {
                rec.CampiNonPosizionali += chiave + string.Format("{0,-16}", valore.Substring(0, 16));
                valore = valore.Substring(16);

                while (valore.Length > 15)
                {
                    if (rec.CampiNonPosizionali.Length + 24 > 1800)
                    {
                        var newRec = (T)rec.NewRecord();
                        Records.Add(newRec);

                        rec = newRec;
                    }
                    rec.CampiNonPosizionali += chiave + string.Format("+{0,-15}", valore.Substring(0, 15));
                    valore = valore.Substring(15);
                }

                if (rec.CampiNonPosizionali.Length + 24 > 1800)
                {
                    var newRec = (T)rec.NewRecord();
                    Records.Add(newRec);

                    rec = newRec;
                }

                rec.CampiNonPosizionali += chiave + string.Format("+{0,-15}", valore);
            }

            return rec;
        }

        public T accodaValoreRecord<T>(T rec, string chiave, string valore, bool forzaAccodamento = false) where T : IRecordContenuto
        {
            if (string.IsNullOrWhiteSpace(valore) && !forzaAccodamento)
                return rec;

            if (valore.Length > 16)
                throw new Exception("Valore troppo lungo, campo non ammesso");

            if (rec.CampiNonPosizionali.Length + 24 > 1800)
            {
                var newRec = (T)rec.NewRecord();
                Records.Add(newRec);
                rec = newRec;

                if (rec is RecordC)
                {
                    var rcRec = rec as RecordC;
                    RC.Add(rcRec);
                }

            }

            rec.CampiNonPosizionali += chiave + valore;

            return rec;
        }

        public T accodaValoreRecordTest<T>(T rec, string chiave, string valore, bool test, bool forzaAccodamento = false) where T : IRecordContenuto
        {
            if (!test && !forzaAccodamento)
                return rec;

            return accodaValoreRecord(rec, chiave, valore, forzaAccodamento);
        }
    }

    public interface IRecordContenuto
    {
        string CampiNonPosizionali { get; set; }
        object NewRecord();
    }
}