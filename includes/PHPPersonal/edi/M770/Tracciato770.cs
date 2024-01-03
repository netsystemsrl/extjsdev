using System;
using System.Collections.Generic;
using System.Linq;
using CedHouseSuite.Common.Extensions;
using CedHouseSuite.Model.AgenziaEntrate.M770;
using CedHouseSuite.Model.AgenziaEntrate.M770.A2022;
using FileHelpers;

namespace CedHouseSuite.Tracciati.AgenziaEntrate.M770.M770_2022
{
    public class Comunicazione
    {
        public RecordB RecordB { get; set; }

        public List<RecordD> RecordsD { get; set; }

        public Comunicazione()
        {
            RecordB = new RecordB();
            RecordsD = new List<RecordD>();
        }

        public void Compila(Modello770_2022 mod770)
        {
            #region RecordB

            RecordB.CodiceFiscaleDichiarante = mod770.Condominio.CodiceFiscale.SafeUpper();
            RecordB.ProgressivoModulo = 1;
            RecordB.CbFlagConferma = "1";
            RecordB.CbDichiarazioneCorrettiva = mod770.DichiarazioneCorrettiva ? "1" : "0";
            RecordB.CbDichiarazioneIntegrativa = mod770.DichiarazioneIntegrativa ? "1" : "0";
            RecordB.Denominazione = mod770.Condominio.Denominazione.SafeUpper();
            RecordB.CodiceAttivita = mod770.Condominio.CodiceAttivita.SafeUpper();
            RecordB.NaturaGiuridica = mod770.Condominio.NaturaGiuridica.SafeUpper();
            RecordB.IndirizzoEmail = mod770?.CondominioModello?.Studio?.EmailComunicazioniPEC?.SafeUpper() ?? "";

            RecordB.Stato = mod770.Condominio.Stato.SafeUpper();
            RecordB.Situazione = mod770.Condominio.Situazione.SafeUpper();

            RecordB.TipologiaInvio = mod770.DichiarazioneParziale ? "2" : "1";


            RecordB.CbProspettoST = mod770.NumeroRigheST > 0 ? "1" : "0";
            RecordB.CbProspettoSX = mod770.ProspettoSX.Compilato ? "1" : "0";


            
            RecordB.CbAutonomo =  "1" ;

            if (mod770.DichiarazioneParziale)
            {
                RecordB.AltroIncaricato_CodiceFiscale = mod770.CodiceFiscaleAltroSoggetto;
                RecordB.GS_1_CbDipendente = "1";
            }

            RecordB.CbFirmaDelDichiarante = "1";

            RecordB.Firmatario_CodiceFiscale = mod770.Amministratore.CodiceFiscale.SafeUpper();
            RecordB.Firmatario_CodiceCarica = mod770.Amministratore.CodiceCarica.SafeUpper();
            RecordB.Firmatario_DataCarica = mod770.Amministratore.DataCarica;

            RecordB.Firmatario_Cognome = mod770.Amministratore.Cognome.SafeUpper();
            RecordB.Firmatario_Nome = mod770.Amministratore.Nome.SafeUpper();
            RecordB.Firmatario_Sesso = mod770.Amministratore.Sesso.SafeUpper();
            RecordB.Firmatario_DataNascita = mod770.Amministratore.DataNascita;
            RecordB.Firmatario_ComuneNascita = mod770.Amministratore.ComuneNascita.SafeUpper();
            RecordB.Firmatario_SiglaProvinciaNascita = mod770.Amministratore.ProvinciaNascita.SafeUpper();
            RecordB.Firmatario_CodiceFiscaleEnteDichiarante = mod770.Amministratore.CodiceFiscaleEnte.SafeUpper();

            RecordB.Firmatario_DataAperturaFallimento = mod770.Amministratore.DataAperturaFallimento;

            RecordB.CbInvioTelematicoIntermediario = mod770.InvioAvvisoTelematicoIntermediario ? "1" : "0";
            if (mod770.InvioAvvisoTelematicoIntermediario)
                RecordB.CbRicezioneAvvisoTelematico = mod770.RicezioneAvvisoTelematico ? "1" : "0";

            RecordB.Intermediario_CodiceFiscale = mod770.CodiceFiscaleIntermediario.SafeUpper();
            RecordB.Intermediario_ImpegnoTrasmissione = mod770.InvioImpegno.SafeUpper();
            RecordB.Intermediario_DataImpegno = mod770.DataImpegno;
            //RecordB.Intermediario_IscrizioneCAF = mod770.NumeroIscrizioneAlboCaf.SafeUpper();
            RecordB.Intermediario_CbFirma = "1";

            RecordB.Conformita_CodiceFiscaleRappresentanteCAF = mod770.VistoCodiceFiscaleResponsabileCaf.SafeUpper();
            RecordB.Conformita_CodiceFiscaleCAF = mod770.VistoCodiceFiscaleCaf.SafeUpper();
            RecordB.Conformita_CodiceFiscaleProfessionista = mod770.VistoCodiceFiscaleProfessionista.SafeUpper();
            RecordB.Conformita_CbFirma = mod770.VistoFirma ? "1" : "0";
            RecordB.ProtocolloDichiarazioneGestSep = mod770.ProtocolloDichiarazioneGestSep  ;

            #endregion RecordB

            #region SX

            if (mod770.ProspettoSX.Compilato)
            {
                var rec = new RecordD();
                var sx = mod770.ProspettoSX;

                rec.CodiceFiscaleDichiarante = mod770.Condominio.CodiceFiscale.SafeUpper();
                rec.ProgressivoModulo = 1;

                
                if (Math.Round(sx.SX1_1, 2) != 0)
                    accodaRecordD(rec, "SX001001", $"{Math.Round(sx.SX1_1, 2),16:0.00}");

                if (Math.Round(sx.SX1_2, 2) != 0)
                    accodaRecordD(rec, "SX001002", $"{Math.Round(sx.SX1_2, 2),16:0.00}");                

                if (Math.Round(sx.SX1_3, 2) != 0)
                    accodaRecordD(rec, "SX001003", $"{Math.Round(sx.SX1_3, 2),16:0.00}");

                if (Math.Round(sx.SX1_5, 2) != 0)
                    accodaRecordD(rec, "SX001006", $"{Math.Round(sx.SX1_5, 2),16:0.00}");

                if (Math.Round(sx.SX4_1, 2) != 0)
                    accodaRecordD(rec, "SX004001", $"{Math.Round(sx.SX4_1, 2),16:0.00}");

                if (Math.Round(sx.SX4_2, 2) != 0)
                    accodaRecordD(rec, "SX004002", $"{Math.Round(sx.SX4_2, 2),16:0.00}");

                if (Math.Round(sx.SX4_3, 2) != 0)
                    accodaRecordD(rec, "SX004003", $"{Math.Round(sx.SX4_3, 2),16:0.00}");

                if (Math.Round(sx.SX4_4, 2) != 0)
                    accodaRecordD(rec, "SX004004", $"{Math.Round(sx.SX4_4, 2),16:0.00}");

                if (Math.Round(sx.SX4_5, 2) != 0)
                    accodaRecordD(rec, "SX004005", $"{Math.Round(sx.SX4_5, 2),16:0.00}");

                if (Math.Round(sx.SX4_6, 2) != 0)
                    accodaRecordD(rec, "SX004006", $"{Math.Round(sx.SX4_6, 2),16:0.00}");

                //if (Math.Round(sx.SX4_7, 2) != 0)
                //    accodaRecordD(rec, "SX004007", $"{Math.Round(sx.SX4_7, 2),16:0.00}");

                if (sx.SX4_5 > 0)                                    
                    accodaRecordD(rec, "SX033002", $"{Math.Round(sx.SX33_Credito, 2),16:0.00}");                                                        

                if (!string.IsNullOrWhiteSpace(rec.Contenuto))
                    RecordsD.Add(rec);
            }

            #endregion SX           

            #region ST

            if (mod770.RigheST.Any())
            {
                RecordD recordD = null;
                int index = 2;
                int progST = 1;
                int numST = 0;

                foreach (var riga in mod770.RigheST.OrderBy(x => x.Anno).ThenBy(x => x.Mese))
                {
                    numST++;
                    if (numST % 12 == 1)
                    {
                        recordD = new RecordD();
                        RecordsD.Add(recordD);

                        recordD.CodiceFiscaleDichiarante = mod770.Condominio.CodiceFiscale.SafeUpper();
                        recordD.ProgressivoModulo = progST++;
                        index = 2;
                    }

                    recordD = accodaRecordD(recordD, $"ST{index:000}001", $"{$"{riga.Mese:00}{riga.Anno:0000}",16}");

                    if (Math.Round(riga.RitenuteOperate, 2) != 0)
                        recordD = accodaRecordD(recordD, $"ST{index:000}002", $"{Math.Round(riga.RitenuteOperate, 2),16}");


                    if (Math.Round(riga.CreditiScomputo, 2) != 0)
                        recordD = accodaRecordD(recordD, $"ST{index:000}006", $"{Math.Round(riga.CreditiScomputo, 2),16}");

                    if (Math.Round(riga.ImportoVersato, 2) != 0)
                        recordD = accodaRecordD(recordD, $"ST{index:000}007", $"{Math.Round(riga.ImportoVersato, 2),16}");

                    if (Math.Round(riga.Interessi, 2) != 0)
                        recordD = accodaRecordD(recordD, $"ST{index:000}008", $"{Math.Round(riga.Interessi, 2),16}");

                    if (riga.Ravvedimento)
                        recordD = accodaRecordD(recordD, $"ST{index:000}009", $"{"1",16}");

                    if (!string.IsNullOrWhiteSpace(riga.Note))
                        recordD = accodaRecordD(recordD, $"ST{index:000}010", $"{riga.Note,-16}");

                    if (!string.IsNullOrWhiteSpace(riga.CodiceTributo))
                        recordD = accodaRecordD(recordD, $"ST{index:000}011", $"{riga.CodiceTributo,-16}");
                    

                    if (riga.DataVersamento.HasValue)
                        recordD = accodaRecordD(recordD, $"ST{index:000}014", $"{riga.DataVersamento.Value,16:ddMMyyyy}");

                    index++;
                }
            }


            #endregion ST        
        }

        public RecordD accodaRecordD(RecordD rec, string chiave, string valore)
        {
            if (rec.Contenuto.Length + 24 > 1800)
            {
                var newRec = new RecordD();
                newRec.CodiceFiscaleDichiarante = rec.CodiceFiscaleDichiarante;
                newRec.ProgressivoModulo = rec.ProgressivoModulo;
                RecordsD.Add(newRec);

                rec = newRec;
            }

            rec.Contenuto += chiave + valore;

            return rec;
        }
    }

    public class Tracciato770 : ITracciato770
    {
        public RecordA RecordA { get; set; }

        public List<Comunicazione> Comunicazioni { get; set; }

        public RecordZ RecordZ { get; set; }

        public Tracciato770()
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

        public void Compila(Modello770Base modello)
        {
            if (!(modello is Modello770_2022))
                throw new Exception("Generatore utilizzato errato");

            var m = modello as Modello770_2022;

            var lst = new List<Modello770_2022>();
            lst.Add(m);
            Compila(lst);
        }

        public void Compila(List<Modello770Base> modelli)
        {
            if (modelli.Any(x => !(x is Modello770_2022)))
                throw new Exception("Generatore utilizzato errato");

            var list = new List<Modello770_2022>();
            foreach (Modello770_2022 m in modelli)
            {
                list.Add(m);
            }

            Compila(list);
        }

        public void Compila(List<Modello770_2022> modelli)
        {
            if (modelli.Count == 0)
                return;

            if (modelli.Select(x => x.CodiceFiscaleIntermediario).Distinct().Count() > 1)
                throw new Exception("Codice fiscale intermediario non uniforme sui modelli selezionati");

            #region RecordA

            RecordA.CodiceFiscaleFornitore = modelli.First().CodiceFiscaleIntermediario;
            RecordA.ProgressivoInvio = 0;
            RecordA.TotaleInvii = 0;

            #endregion RecordA

            foreach (var mod770 in modelli)
            {
                var com = new Comunicazione();
                com.Compila(mod770);

                Comunicazioni.Add(com);
            }

            #region RecordZ

            RecordZ.NumRecordB = Comunicazioni.Count;
            RecordZ.NumRecordD = Comunicazioni.Sum(x => x.RecordsD.Count);            

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

                if (c.RecordsD.Count > 0)
                {
                    engine = new FixedFileEngine(typeof(RecordD));
                    c.RecordsD.ForEach(r => engine.AppendToFile(nomeFile, r));
                }

            }

            engine = new FixedFileEngine(typeof(RecordZ));
            engine.AppendToFile(nomeFile, RecordZ);
        }
    }
}