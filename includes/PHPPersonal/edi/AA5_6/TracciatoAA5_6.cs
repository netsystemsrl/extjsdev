using System;
using System.Collections.Generic;
using CedHouseSuite.Model.AgenziaEntrate.AA5_6;
using FileHelpers;

namespace CedHouseSuite.Tracciati.AgenziaEntrate.AA5_6._2022
{
    public class TracciatoAA5_6 : ITracciatoAA5_6
    {
        public RecordA RecordA { get; set; }

        public RecordB RecordB { get; set; }

        public RecordZ RecordZ { get; set; }

        private ModelloAA datiModello;

        public TracciatoAA5_6()
        {
            Reset();
        }

        public void Reset()
        {
            RecordA = new RecordA();
            RecordB = new RecordB();
            RecordZ = new RecordZ();

        }

        private void CompilaRecordA()
        {
            RecordA.Data_Preparazione_File = datiModello.DataPresentazione;

            if (datiModello.Intermediario)
            {
                RecordA.CodiceFiscaleResponsabile = datiModello.CFIntermediario;
            }
            else
            {
                RecordA.CodiceFiscaleResponsabile = datiModello.CodiceFiscale;
            }
        }

        private void CompilaRecordB()
        {
            RecordB.CodiceFiscaleIdentificativo = datiModello.CodiceFiscale;
            RecordB.TipoDichiarazione = datiModello.operazione-1;
            RecordB.DataDichiarazione = datiModello.Data;
            RecordB.CodiceFiscale = RecordB.CodiceFiscaleIdentificativo;
            if (RecordB.TipoDichiarazione==1)
            {
                RecordB.Denominazione = datiModello.BDenominazione;
                RecordB.NaturaGiuridica = datiModello.BNatura;
                RecordB.CodiceAttività = datiModello.BAtecoCod;
                RecordB.SedeLegale.Indirizzo = datiModello.BIndirizzo;
                RecordB.SedeLegale.Provincia = datiModello.BProvincia;
                RecordB.SedeLegale.Cap =
                    RecordB.SedeLegale.Provincia.Equals("EE", StringComparison.InvariantCultureIgnoreCase)
                        ? string.Empty
                        : datiModello.BCap;
                RecordB.SedeLegale.Comune = datiModello.BComune;
                RecordB.Rappresentante.CodiceFiscale = datiModello.CCodiceFiscale;
                RecordB.Rappresentante.CodiceCarica = datiModello.CCarica;
                RecordB.Rappresentante.Nome =!string.IsNullOrWhiteSpace(datiModello.CCodiceFiscale) ? String.Empty : datiModello.CNome;
                RecordB.Rappresentante.Cognome = !string.IsNullOrWhiteSpace(datiModello.CCodiceFiscale) ? String.Empty : datiModello.CDenominazione;
                RecordB.Rappresentante.DataNascita = !string.IsNullOrWhiteSpace(datiModello.CCodiceFiscale) ? null : datiModello.CDataNascita;
                RecordB.Rappresentante.ComuneNascita = !string.IsNullOrWhiteSpace(datiModello.CCodiceFiscale) ? String.Empty : datiModello.CComune;
                RecordB.Rappresentante.ProvinciaNascita = !string.IsNullOrWhiteSpace(datiModello.CCodiceFiscale) ? String.Empty : datiModello.CProvincia;
                RecordB.Rappresentante.Sesso = !string.IsNullOrWhiteSpace(datiModello.CCodiceFiscale) ? String.Empty : datiModello.CSesso;

            }

            RecordB.DataPresentazione = datiModello.DataPresentazione?.ToString("ddMMyyyy") ?? string.Empty;
            RecordB.CFPresentazione = datiModello.CodiceFiscaleAD;
            if (datiModello.Intermediario)
            {
                RecordB.CFIntermediario = datiModello.CFIntermediario;
                RecordB.DataImpegno = datiModello.DataImpegnoATrasmettere;
                RecordB.ImpegnoATrasmettere = ((int)datiModello.TipoPredisposizione).ToString();
            }



        }
        private void CompilaRecordZ()
        {
            //il record Z al momento non ha niente di compilato dinamicamente
        }

        public void Compila(ModelloAA modello)
        {
           datiModello = modello;
           CompilaRecordA();
           CompilaRecordB();
           CompilaRecordZ();
        }

        public void Compila(List<ModelloAA> modelli)
        {
            throw new NotImplementedException("metodo non implementato");
        }



        public void GeneraFile(string nomeFile)
        {
            FixedFileEngine engine = null;

            engine = new FixedFileEngine(typeof(RecordA));
            engine.WriteFile(nomeFile, new[] { RecordA });
            engine = new FixedFileEngine(typeof(RecordB));
            engine.AppendToFile(nomeFile, new[] { RecordB });
            engine = new FixedFileEngine(typeof(RecordZ));
            engine.AppendToFile(nomeFile, RecordZ);
        }
    }
}