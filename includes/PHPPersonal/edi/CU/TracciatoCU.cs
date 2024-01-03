using System;
using System.Collections.Generic;
using System.Linq;
using CedHouseSuite.BusinessObjects.AgenziaEntrate.CU;
using CedHouseSuite.BusinessObjects.AgenziaEntrate.CU.CU2022;
using CedHouseSuite.Common.Extensions;
using FileHelpers;

namespace CedHouseSuite.Tracciati.AgenziaEntrate.CU.CU_2021
{
    public class Comunicazione
    {
        public RecordB RecordB { get; set; }

        public List<IRecordContenuto> Records { get; set; }

        public Comunicazione()
        {
            RecordB = new RecordB();
            Records = new List<IRecordContenuto>();
        }

        public void Compila(CedHouseSuite.BusinessObjects.AgenziaEntrate.CU.CU2022.CU_2022 item)
        {
            #region RecordB

            RecordB.CodiceFiscaleDichiarante = item.Sostituto.CodiceFiscale.SafeUpper();
            RecordB.ProgressivoModulo = 1;
            RecordB.CbFlagAnnullamento = item.Annullamento ? "1" : "0";
            RecordB.CbFlagSostituzione = item.Sostituzione ? "1" : "0";
            RecordB.CasellaCasiParticolari = item.Firmatario.CasiParticolari ? "1" : "0";
            RecordB.Denominazione = item.Sostituto.Denominazione.SafeUpper();
            RecordB.IndirizzoEmail = item.Sostituto.Email.SafeUpper();
            RecordB.TelefonoFax = item.Sostituto.Telefono;

            RecordB.Firmatario_CodiceFiscale = item.Firmatario.CodiceFiscale.SafeUpper();
            //DEVE ESSERE ASSENTE IN PRESENZA DEL CAMPO 37 RECORD B
            if (!item.Firmatario.CasiParticolari)
                RecordB.Firmatario_CodiceCarica = item.Firmatario.CodiceCarica.SafeUpper();
            RecordB.Firmatario_Cognome = item.Firmatario.Cognome.SafeUpper();
            RecordB.Firmatario_Nome = item.Firmatario.Nome.SafeUpper();
            RecordB.Firmatario_CodiceFiscaleSocieta = item.Firmatario.CodiceFiscaleSocieta.SafeUpper();

            RecordB.NumeroCertificazioni_Autonomo = item.Certificazioni.Count;

            RecordB.Intermediario_CodiceFiscale = item.PresentazioneTelematica.CodiceFiscaleIntermediario.SafeUpper();
            RecordB.Intermediario_ImpegnoTrasmissione = item.PresentazioneTelematica.Impegno.ToString();
            RecordB.Intermediario_DataImpegno = item.PresentazioneTelematica.DataImpegno;
            #endregion RecordB

            var pc = 1;
            foreach (var c in item.Certificazioni)
            {
                var rD = new RecordD();
                Records.Add(rD);

                rD.CodiceFiscaleDichiarante = RecordB.CodiceFiscaleDichiarante;
                rD.CodiceFiscalePercipiente = c.CodiceFiscale.SafeUpper();
                rD.ProgressivoCertificazione = pc++;

                if (c.TipoOperazione.HasValue)
                {
                    rD.TipoOperazione = c.TipoOperazione.Value == TipoOperazione.Annullamento ? "A" : "S";
                    rD.ProtocolloNumero1 = c.IdentificativoInvio;
                    rD.ProtocolloNumero2 = c.ProgressivoCertificazione;
                }

                rD = accodaValoreMultiploRecord(rD, "DA001001", item.Sostituto.CodiceFiscale.SafeUpper());
                rD = accodaValoreMultiploRecord(rD, "DA001002", item.Sostituto.Denominazione.SafeUpper());
                rD = accodaValoreMultiploRecord(rD, "DA001004", item.Sostituto.Comune.SafeUpper());
                rD = accodaValoreMultiploRecord(rD, "DA001005", item.Sostituto.Provincia.SafeUpper());
                rD = accodaValoreRecord(rD, "DA001006", string.Format("{0,-16}", item.Sostituto.Cap.SafeUpper()));
                rD = accodaValoreMultiploRecord(rD, "DA001007", item.Sostituto.Indirizzo.SafeUpper());
                rD = accodaValoreMultiploRecord(rD, "DA001008", item.Sostituto.Telefono.SafeUpper());
                rD = accodaValoreMultiploRecord(rD, "DA001009", item.Sostituto.Email.SafeUpper());
                rD = accodaValoreRecord(rD, "DA001010", string.Format("{0,-16}", item.Sostituto.CodiceAttivita.SafeUpper()));
                rD = accodaValoreRecord(rD, "DA001011", string.Format("{0,-16}", "001"));
                if (item.Firmatario.CasiParticolari)
                    rD = accodaValoreRecord(rD, "DA001012", string.Format("{0,-16}", RecordB.Firmatario_CodiceFiscaleSocieta));

                rD = accodaValoreRecord(rD, "DA002001", string.Format("{0,-16}", c.CodiceFiscale.SafeUpper()));
                rD = accodaValoreMultiploRecord(rD, "DA002002", c.Cognome.SafeUpper());
                rD = accodaValoreMultiploRecord(rD, "DA002003", c.Nome.SafeUpper());
                rD = accodaValoreRecord(rD, "DA002004", string.Format("{0,-16}", c.Sesso.SafeUpper()));
                rD = accodaValoreRecord(rD, "DA002005", string.Format("{0,16:ddMMyyyy}", c.DataNascita));
                rD = accodaValoreMultiploRecord(rD, "DA002006", c.ComuneNascita.SafeUpper());
                rD = accodaValoreMultiploRecord(rD, "DA002007", c.ProvinciaNascita.SafeUpper());

                rD = accodaValoreRecord(rD, "DA002030", string.Format("{0,-16}", c.CodiceFiscaleRappresentante.SafeUpper()));
                rD = accodaValoreRecord(rD, "DA003001", string.Format("{0,16:ddMMyyyy}", item.DataCertificazione));
                rD = accodaValoreRecord(rD, "DA003002", string.Format("{0,16}", "1"));

                if (c.TipoOperazione == null || c.TipoOperazione.Value == TipoOperazione.Sostituzione)
                {
                    // pezza di armando 05/03/2020 --> se ci sono solo i campi rm (regime minimi) sposto i dati da rm a normali
                    if (c.AltreSommeNSRRM != 0 && c.AltreSommeNSR == 0)
                    {
                        c.AltreSommeNSR = c.AltreSommeNSRRM;
                        c.AltreSommeNSRRM = 0;
                        c.AltreSommeNSRCodice = c.AltreSommeNSRCodiceRM;
                        c.AltreSommeNSRCodiceRM = 0;
                    }

                    if (c.AltreSommeNSRRM == 0 && c.AltreSommeNSR == 0 || c.AltreSommeNSR != 0)
                    {

                        var rH = new RecordH();
                        Records.Add(rH);

                        rH.CodiceFiscaleDichiarante = RecordB.CodiceFiscaleDichiarante;
                        rH.CodiceFiscalePercipiente = c.CodiceFiscale.SafeUpper();
                        rH.ProgressivoCertificazione = rD.ProgressivoCertificazione;

                        rH = accodaValoreRecordTest(rH, "AU001001", string.Format("{0,-16}", c.Causale.SafeUpper()), !string.IsNullOrWhiteSpace(c.Causale));

                        var causaliConAno = new string[] { "G", "H", "I" };
                        if (causaliConAno.Contains(c.Causale.SafeUpper()) || c.Anticipazione)
                            rH = accodaValoreRecordTest(rH, "AU001002", string.Format("{0,16}", c.AnnoRiferimento), c.AnnoRiferimento.GetValueOrDefault(0) != 0);

                        rH = accodaValoreRecord(rH, "AU001003", string.Format("{0,16}", c.Anticipazione ? "1" : "0"));
                        rH = accodaValoreRecordTest(rH, "AU001004", string.Format("{0,16}", c.AmmontareLordoCorrisposto), Math.Round(c.AmmontareLordoCorrisposto, 2) != 0);
                        rH = accodaValoreRecordTest(rH, "AU001005", string.Format("{0,16}", c.SommeNSRRegimeConvenzionale), Math.Round(c.SommeNSRRegimeConvenzionale, 2) != 0);
                        rH = accodaValoreRecordTest(rH, "AU001006", string.Format("{0,16}", c.AltreSommeNSRCodice), Math.Round(c.AltreSommeNSR, 2) != 0);
                        rH = accodaValoreRecordTest(rH, "AU001007", string.Format("{0,16}", c.AltreSommeNSR), Math.Round(c.AltreSommeNSR, 2) != 0);
                        rH = accodaValoreRecordTest(rH, "AU001008", string.Format("{0,16}", c.Imponibile), Math.Round(c.Imponibile, 2) != 0);
                        rH = accodaValoreRecordTest(rH, "AU001009", string.Format("{0,16}", c.RitenuteAcconto), Math.Round(c.RitenuteAcconto, 2) != 0);
                        rH = accodaValoreRecordTest(rH, "AU001010", string.Format("{0,16}", c.RitenuteImposta), Math.Round(c.RitenuteImposta, 2) != 0);
                        rH = accodaValoreRecordTest(rH, "AU001011", string.Format("{0,16}", c.RitenuteSospese), Math.Round(c.RitenuteSospese, 2) != 0);
                        rH = accodaValoreRecordTest(rH, "AU001012", string.Format("{0,16}", c.AddRegAcconto), Math.Round(c.AddRegAcconto, 2) != 0);
                        rH = accodaValoreRecordTest(rH, "AU001013", string.Format("{0,16}", c.AddRegImposta), Math.Round(c.AddRegImposta, 2) != 0);
                        rH = accodaValoreRecordTest(rH, "AU001014", string.Format("{0,16}", c.AddRegSospesa), Math.Round(c.AddRegSospesa, 2) != 0);
                        rH = accodaValoreRecordTest(rH, "AU001015", string.Format("{0,16}", c.AddComAcconto), Math.Round(c.AddComAcconto, 2) != 0);
                        rH = accodaValoreRecordTest(rH, "AU001016", string.Format("{0,16}", c.AddComImposta), Math.Round(c.AddComImposta, 2) != 0);
                        rH = accodaValoreRecordTest(rH, "AU001017", string.Format("{0,16}", c.AddComSospesa), Math.Round(c.AddComSospesa, 2) != 0);
                        rH = accodaValoreRecordTest(rH, "AU001018", string.Format("{0,16}", c.ImponibileAnniPrecedenti), Math.Round(c.ImponibileAnniPrecedenti, 2) != 0);
                        rH = accodaValoreRecordTest(rH, "AU001019", string.Format("{0,16}", c.RitenuteAnniPrecedenti), Math.Round(c.RitenuteAnniPrecedenti, 2) != 0);
                        rH = accodaValoreRecordTest(rH, "AU001020", string.Format("{0,16}", c.SpeseRimborsate), Math.Round(c.SpeseRimborsate, 2) != 0);
                        rH = accodaValoreRecordTest(rH, "AU001021", string.Format("{0,16}", c.RitenuteRimborsate), Math.Round(c.RitenuteRimborsate, 2) != 0);
                    }
                    if (c.AltreSommeNSRRM > 0)
                    {
                        var rH1 = new RecordH();
                        Records.Add(rH1);

                        rH1.ProgressivoModulo = 2;
                        rH1.CodiceFiscaleDichiarante = RecordB.CodiceFiscaleDichiarante;
                        rH1.CodiceFiscalePercipiente = c.CodiceFiscale.SafeUpper();
                        rH1.ProgressivoCertificazione = rD.ProgressivoCertificazione;


                        var causaliConAno1 = new string[] { "G", "H", "I" };
                        if (causaliConAno1.Contains(c.Causale.SafeUpper()) || c.Anticipazione)
                            rH1 = accodaValoreRecordTest(rH1, "AU001002", string.Format("{0,16}", c.AnnoRiferimento), c.AnnoRiferimento.GetValueOrDefault(0) != 0);

                        rH1 = accodaValoreRecord(rH1, "AU001003", string.Format("{0,16}", c.Anticipazione ? "1" : "0"));
                        rH1 = accodaValoreRecordTest(rH1, "AU001005", string.Format("{0,16}", c.SommeNSRRegimeConvenzionale), Math.Round(c.SommeNSRRegimeConvenzionale, 2) != 0);
                        rH1 = accodaValoreRecordTest(rH1, "AU001006", string.Format("{0,16}", c.AltreSommeNSRCodiceRM), Math.Round(c.AltreSommeNSRRM, 2) != 0);
                        rH1 = accodaValoreRecordTest(rH1, "AU001007", string.Format("{0,16}", c.AltreSommeNSRRM), Math.Round(c.AltreSommeNSRRM, 2) != 0);
                    }
                }
            }
        }

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

    public class TracciatoCU : ITracciatoCU
    {
        public RecordA RecordA { get; set; }

        public List<Comunicazione> Comunicazioni { get; set; }

        public RecordZ RecordZ { get; set; }

        public TracciatoCU()
        {
            RecordA = new RecordA();
            RecordZ = new RecordZ();
            Comunicazioni = new List<Comunicazione>();
        }

        public void Reset()
        {
            RecordA = new RecordA();
            RecordZ = new RecordZ();
            Comunicazioni = new List<Comunicazione>();
        }

        public void Compila(CUBaseObject modello)
        {
            if (!(modello is CedHouseSuite.BusinessObjects.AgenziaEntrate.CU.CU2022.CU_2022))
                throw new Exception("Generatore utilizzato errato");

            var m = modello as CedHouseSuite.BusinessObjects.AgenziaEntrate.CU.CU2022.CU_2022;

            var lst = new List<CedHouseSuite.BusinessObjects.AgenziaEntrate.CU.CU2022.CU_2022>();
            lst.Add(m);
            Compila(lst);
        }

        public void Compila(List<CUBaseObject> modelli)
        {
            if (modelli.Any(x => !(x is BusinessObjects.AgenziaEntrate.CU.CU2022.CU_2022)))
                throw new Exception("Generatore utilizzato errato");

            var list = new List<CedHouseSuite.BusinessObjects.AgenziaEntrate.CU.CU2022.CU_2022>();
            foreach (CedHouseSuite.BusinessObjects.AgenziaEntrate.CU.CU2022.CU_2022 m in modelli)
            {
                list.Add(m);
            }

            Compila(list);
        }

        public void Compila(List<CedHouseSuite.BusinessObjects.AgenziaEntrate.CU.CU2022.CU_2022> modelli)
        {
            if (modelli.Count == 0)
                return;

            if (modelli.Select(x => x.PresentazioneTelematica.CodiceFiscaleIntermediario).Distinct().Count() > 1)
                throw new Exception("Codice fiscale intermediario non uniforme sui modelli selezionati");

            #region RecordA

            RecordA.CodiceFiscaleFornitore = modelli.First().PresentazioneTelematica.CodiceFiscaleIntermediario;

            #endregion RecordA

            foreach (var cu in modelli)
            {
                var com = new Comunicazione();
                com.Compila(cu);

                Comunicazioni.Add(com);
            }

            #region RecordZ

            RecordZ.NumRecordB = Comunicazioni.Count;
            RecordZ.NumRecordC = 0;
            RecordZ.NumRecordD = Comunicazioni.Sum(x => x.Records.Count(r => r is RecordD));
            RecordZ.NumRecordG = 0;
            RecordZ.NumRecordH = Comunicazioni.Sum(x => x.Records.Count(r => r is RecordH));

            #endregion RecordZ
        }

        public void GeneraFile(string nomeFile)
        {
            FixedFileEngine engine = null;

            engine = new FixedFileEngine(typeof(RecordA));
            engine.WriteFile(nomeFile, new[] { RecordA });

            foreach (var c in Comunicazioni)
            {
                engine = new FixedFileEngine(typeof(RecordB));
                engine.AppendToFile(nomeFile, c.RecordB);

                if (c.Records.Count > 0)
                {
                    foreach (var rc in c.Records)
                    {
                        engine = new FixedFileEngine(rc.GetType());
                        engine.AppendToFile(nomeFile, rc);
                    }
                }
            }

            engine = new FixedFileEngine(typeof(RecordZ));
            engine.AppendToFile(nomeFile, RecordZ);
        }
    }
}