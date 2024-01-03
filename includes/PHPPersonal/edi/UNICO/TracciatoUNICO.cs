using System;
using System.Collections.Generic;
using System.Linq;
using CedHouseSuite.Common.Extensions;
using CedHouseSuite.Common.Utils;
using CedHouseSuite.Model.AgenziaEntrate.AC;
using CedHouseSuite.Model.Anagrafiche;
using CedHouseSuite.Model.Studi;
using FileHelpers;

namespace CedHouseSuite.Tracciati.AgenziaEntrate.UNICO.SC_2022
{
    public class TracciatoUNICO : ITracciatoUNICO
    {
        public RecordA RecordA { get; set; }

        public RecordB RecordB { get; set; }

        public List<RecordC> RecordsC { get; set; }

        public RecordZ RecordZ { get; set; }

        public TracciatoUNICO()
        {
            RecordA = new RecordA();
            RecordB = new RecordB();
            RecordsC = new List<RecordC>();
            RecordZ = new RecordZ();
        }

        private string GetCodiceFornuitura(ModelloAcTipoPdf tipoPdf)
        {
            switch (tipoPdf)
            {
                case ModelloAcTipoPdf.PF:
                    return "RPF22";
                case ModelloAcTipoPdf.SC:
                    return "RSC22";
                case ModelloAcTipoPdf.SP:
                    return "RSP22";
                default:
                    return "RSC22";
            }
        }

        public void Compila(StudioAmministratori studio, List<ModelloAc> modelliAc, ModelloAcTipoPdf tipoPdf)
        {
            RecordA.CodiceFiscaleFornitore = "00000000000"; //qui ci andrebbe il codice fiscale del caf
            RecordA.ProgressivoInvio = 0;
            RecordA.NumeroTotaleInvii = 0;
            RecordA.CodiceFornitura = GetCodiceFornuitura(tipoPdf);

            RecordB.CodiceFiscaleDichiarante = StringUtils.FirstNotNullNotEmpty(studio.CodiceFiscale, studio.PartitaIva);
            RecordB.Denominazione = studio.DenominazioneFiscale;
            RecordB.QuadroAC = "1";

            foreach (var ac in modelliAc.OrderBy(x => x.Denominazione))
            {
                var r = new RecordC();
                CompilaParametriComuni(r, ac);
                RecordsC.Add(r);

                int idx = 4;
                foreach (var f in ac.Righe)
                {
                    if (!string.IsNullOrWhiteSpace(StringUtils.FirstNotNullNotEmpty(f.CodiceFiscale, f.PartitaIva)))
                        r = accodaRecordC(ac, r, string.Format("AC{0:000}001", idx), string.Format("{0,-16}", StringUtils.FirstNotNullNotEmpty(f.CodiceFiscale, f.PartitaIva).SafeUpper()));

                    if (!string.IsNullOrWhiteSpace(f.CognomeDenominazione))
                        r = accodaRecordC(ac, r, string.Format("AC{0:000}002", idx), string.Format("{0,-16}", f.CognomeDenominazione.SafeUpper()));

                    if (!string.IsNullOrWhiteSpace(f.Nome))
                        r = accodaRecordC(ac, r, string.Format("AC{0:000}003", idx), string.Format("{0,-16}", f.Nome.SafeUpper()));

                    if (f.Sesso != Sesso.Nessuno)
                        r = accodaRecordC(ac, r, string.Format("AC{0:000}004", idx), string.Format("{0,-16}", f.Sesso == Sesso.Maschio ? "M" : "F"));

                    if (f.DataNascita.HasValue)
                        r = accodaRecordC(ac, r, string.Format("AC{0:000}005", idx), string.Format("{0,16:ddMMyyyy}", f.DataNascita));

                    if (!string.IsNullOrWhiteSpace(f.ComuneNascita))
                        r = accodaRecordC(ac, r, string.Format("AC{0:000}006", idx), string.Format("{0,-16}", f.ComuneNascita.SafeUpper()));

                    if (!string.IsNullOrWhiteSpace(f.ProvinciaNascita))
                        r = accodaRecordC(ac, r, string.Format("AC{0:000}007", idx), string.Format("{0,-16}", f.ProvinciaNascita.SafeUpper()));


                    r = accodaRecordC(ac, r, string.Format("AC{0:000}008", idx), string.Format("{0,16}", Math.Truncate(f.Importo)));

                    idx++;

                    if (idx > 8)
                    {
                        r = new RecordC();
                        CompilaParametriComuni(r, ac);
                        RecordsC.Add(r);
                        idx = 4;
                    }
                }
            }

            RecordZ.NumRecordC = RecordsC.Count;
        }

        public void GeneraFile(string nomeFile)
        {
            FixedFileEngine engine = null;

            engine = new FixedFileEngine(typeof(RecordA));
            engine.WriteFile(nomeFile, new[] { RecordA });

            engine = new FixedFileEngine(typeof(RecordB));
            engine.AppendToFile(nomeFile, new[] { RecordB });

            if (RecordsC.Count > 0)
            {
                engine = new FixedFileEngine(typeof(RecordC));
                RecordsC.ForEach(r => engine.AppendToFile(nomeFile, r));
            }

            engine = new FixedFileEngine(typeof(RecordZ));
            engine.AppendToFile(nomeFile, RecordZ);
        }

        private void CompilaParametriComuni(RecordC r, ModelloAc ac)
        {
            r.CodiceFiscaleDichiarante = RecordB.CodiceFiscaleDichiarante;
            r.ProgressivoModulo = RecordsC.MaxOrDefault(x => x.ProgressivoModulo, 0) + 1;

            r = accodaRecordC(ac, r, "AC001001", string.Format("{0,-16}", ac.CodiceFiscale.SafeUpper()));
            r = accodaRecordC(ac, r, "AC001002", string.Format("{0,-16}", ac.Denominazione.SafeUpper()));

            if (!string.IsNullOrWhiteSpace(ac.CodiceComune))
            {
                r = accodaRecordC(ac, r, "AC002001", string.Format("{0,-16}", ac.CodiceComune.SafeUpper()));
                r = accodaRecordC(ac, r, "AC002002", string.Format("{0,-16}", ac.TipoCatasto.SafeUpper()));
                r = accodaRecordC(ac, r, "AC002003", string.Format("{0,-16}", ac.TipoImmobile.SafeUpper()));

                if (!string.IsNullOrWhiteSpace(ac.DocumentoCatastale))
                    r = accodaRecordC(ac, r, "AC002004", string.Format("{0,-16}", ac.DocumentoCatastale.SafeUpper()));

                r = accodaRecordC(ac, r, "AC002005", string.Format("{0,-16}", ac.Foglio.SafeUpper()));

                if (!string.IsNullOrWhiteSpace(ac.ParticellaA))
                    r = accodaRecordC(ac, r, "AC002A06", string.Format("{0,-16}", ac.ParticellaA.SafeUpper()));

                if (!string.IsNullOrWhiteSpace(ac.ParticellaB))
                    r = accodaRecordC(ac, r, "AC002B06", string.Format("{0,-16}", ac.ParticellaB.SafeUpper()));

                if (!string.IsNullOrWhiteSpace(ac.Subalterno))
                    r = accodaRecordC(ac, r, "AC002007", string.Format("{0,-16}", ac.Subalterno.SafeUpper()));
            }

            if (ac.DataDomandaAccatastamento.HasValue)
                r = accodaRecordC(ac, r, "AC003001", string.Format("{0,16:ddMMyyyy}", ac.DataDomandaAccatastamento));

            if (!string.IsNullOrWhiteSpace(ac.NumeroDomandaAccatastamento))
                r = accodaRecordC(ac, r, "AC003002", string.Format("{0,-16}", ac.NumeroDomandaAccatastamento.SafeUpper()));

            if (!string.IsNullOrWhiteSpace(ac.ProvinciaDomandaAccatastamento))
                r = accodaRecordC(ac, r, "AC003003", string.Format("{0,-16}", ac.ProvinciaDomandaAccatastamento.SafeUpper()));
        }

        public RecordC accodaRecordC(ModelloAc ac, RecordC rec, string chiave, string valore)
        {
            if (rec.Contenuto.Length + 24 > 1800)
            {
                var newRec = new RecordC();
                CompilaParametriComuni(newRec, ac);
                RecordsC.Add(newRec);
                rec = newRec;
            }

            rec.accodaTestoLungo(chiave, valore);

            return rec;
        }
    }
}