using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Windows.Forms;
using CedHouseSuite.Common.Extensions;
using CedHouseSuite.Model.Pagamenti.F24;
using FileHelpers;


namespace CedHouseSuite.Tracciati.AgenziaEntrate.F24INTERMEDIARIO
{
    public class TracciatoF24EntratelIntermediario
    {

        public RecordA RecordA { get; set; } = new RecordA();
        public List<RecordM> RecordMCum { get; set; } = new List<RecordM>();
        public RecordM RecordM { get; set; } = new RecordM();
        public RecordV RecordV { get; set; } = new RecordV();
        public List<RecordV> RecordVCum { get; set; } = new List<RecordV>();

        public RecordZ RecordZ { get; set; } = new RecordZ();


        public void CreaF24(ModelloF24 m, char tipoIban)
        {
            
            //RecordA
            if (m.Condominio.Studio.PartitaIvaIntermediario.Length == 16)
            {
                RecordA.TipoFornitore = "04";
                RecordA.CognomeFisica = CbiUtils.RimuoviCaratteriNonConsigliati(m.Condominio.Studio.CognomeIntermediario).SafeUpper();
                RecordA.NomeFisica = CbiUtils.RimuoviCaratteriNonConsigliati(m.Condominio.Studio.NomeIntermediario).SafeUpper();
                RecordA.SessoFisica = CbiUtils.RimuoviCaratteriNonConsigliati(m.Condominio.Studio.SessoIntermediario).SafeUpper();
                RecordA.ProvinciaNascitaFisica = CbiUtils.RimuoviCaratteriNonConsigliati(m.Condominio.Studio.ProvinciaNascitaIntermediario).SafeUpper();
                var data = Regex.Replace(m.Condominio.Studio.DataDiNascitaIntermediario, "/", "");
                RecordA.DataNascitaFisica = CbiUtils.RimuoviCaratteriNonConsigliati(data).SafeUpper();
                RecordA.ComuneNascitaFisica = CbiUtils.RimuoviCaratteriNonConsigliati(m.Condominio.Studio.ComuneNascitaIntermediario).SafeUpper();


            }
            else
            {
                RecordA.DenominazioneNonFisica = CbiUtils.RimuoviCaratteriNonConsigliati(m.Condominio.Studio.DenominazioneIntermediario).SafeUpper();
                RecordA.ComuneNonFisica = CbiUtils.RimuoviCaratteriNonConsigliati(m.Condominio.Studio.ComuneNascitaIntermediario).SafeUpper();
                RecordA.ProvinciaNonFisica = CbiUtils.RimuoviCaratteriNonConsigliati(m.Condominio.Studio.ProvinciaNascitaIntermediario).SafeUpper();
                RecordA.IndirizzoNonFisica = CbiUtils.RimuoviCaratteriNonConsigliati(m.Condominio.Studio.IndirizzoIntermediario).SafeUpper();
                RecordA.CapNonFisica = CbiUtils.RimuoviCaratteriNonConsigliati(m.Condominio.Studio.CapIntermediario).SafeUpper();
            }
            RecordA.CodiceFiscale = CbiUtils.RimuoviCaratteriNonConsigliati(m.Condominio.Studio.PartitaIvaIntermediario).SafeUpper();
            if (m.Condominio.Studio.FlussoIntermediario == "0")
            {
                RecordA.FlagOrigine = CbiUtils.RimuoviCaratteriNonConsigliati("E").SafeUpper();
                RecordA.FlagAccettazione = CbiUtils.RimuoviCaratteriNonConsigliati(" ").SafeUpper();
            }
            else if (m.Condominio.Studio.FlussoIntermediario == "1")
            {
                RecordA.FlagOrigine = CbiUtils.RimuoviCaratteriNonConsigliati("Y").SafeUpper();
                RecordA.FlagAccettazione = CbiUtils.RimuoviCaratteriNonConsigliati("1").SafeUpper();
            }

            //RecordM
            RecordM.CodiceFiscale = CbiUtils.RimuoviCaratteriNonConsigliati(m.Condominio.CodiceFiscale).SafeUpper();
            RecordM.EsercizioCavallo = m.PeriodoImpostaCoincide ? 0 : 1; //?????
            RecordM.FlagVersante = 1; //?????????
            RecordM.CodiceFiscaleVersante = CbiUtils.RimuoviCaratteriNonConsigliati(m.Amministratore.CodiceFiscale).SafeUpper();
            RecordM.TipoVersante = 1;
            RecordM.CognomeVersante = CbiUtils.RimuoviCaratteriNonConsigliati(m.Amministratore.Cognome).SafeUpper();
            RecordM.NomeVersante = CbiUtils.RimuoviCaratteriNonConsigliati(m.Amministratore.Nome).SafeUpper();
            RecordM.SessoVersante = m.Amministratore.Sesso.GetValueOrDefault(Model.Anagrafiche.Sesso.Maschio) == Model.Anagrafiche.Sesso.Maschio ? "M" : "F";
            RecordM.DataNascitaVersante = m.Amministratore.DataNascita.HasValue ? $"{m.Amministratore.DataNascita:ddMMyyyy}" : "";
            RecordM.ComuneNascitaVersante = CbiUtils.RimuoviCaratteriNonConsigliati(m.Amministratore.ComuneNascita).SafeUpper();
            RecordM.ProvinciaNascitaVersante = CbiUtils.RimuoviCaratteriNonConsigliati(m.Amministratore.ProvinciaNascita).SafeUpper();

            RecordM.DenominazioneNonFisica = CbiUtils.RimuoviCaratteriNonConsigliati(m.Condominio.DescrizioneEstesa).SafeUpper();

            if (m.ImportoTotale > 0)
            {
                RecordM.Iban = tipoIban == 'C' ? m.ContoCorrente.IbanCbi : m.Condominio.Studio.IBANIntermediario; //solo se importo a debito
                //RecordM.SaldoDebito = m.ImportoTotale.ToString("0:#.##0,00", System.Globalization.CultureInfo.InvariantCulture);//.Replace(".", ",");
                RecordM.SaldoDebito = String.Format("{0:#,##0.00}", m.ImportoTotale);//.ToString("0:#.##0,00", System.Globalization.CultureInfo.InvariantCulture);//.Replace(".", ",");
            }
            else
            {
                RecordM.SaldoDebito = "0,00";
            }
            RecordM.DataVersamento = m.DataVersamento;
            if (RecordA.FlagOrigine == "Y" && RecordM.Iban != null)
            {
                RecordM.CodiceFiscaleTitolare = RecordA.CodiceFiscale;
            }
            else if (RecordA.FlagOrigine == "E" && RecordM.Iban != null)
            {
                RecordM.CodiceFiscaleTitolare = RecordM.CodiceFiscale;
            }
            else if (RecordM.TipoVersante == 2 || RecordM.TipoVersante == 3 || RecordM.TipoVersante == 7)
            {
                RecordM.CodiceFiscaleTitolare = RecordM.CodiceFiscaleVersante;
            }
            else if (RecordM.TipoVersante == 50 || RecordM.TipoVersante == 51 || RecordM.TipoVersante == 60 || RecordM.TipoVersante == 72)
            {
                RecordM.CodiceFiscaleTitolare = RecordM.CodiceFiscaleCoobbligato;
            }
            if (RecordM.CodiceFiscaleTitolare.Length == 16)
            {
                RecordM.TipoTitolareConto = "04";
            }
            else if(RecordM.CodiceFiscaleTitolare.Length == 11)
            {
                RecordM.TipoTitolareConto = "14";
            }
            //RecordV

            if (m.RigheErario.Count > 6)
            {
                var i = 0;
                var h = m.RigheErario.Count;
                do
                {


                    RecordV recordV = new RecordV();


                    recordV.CodiceFiscale = CbiUtils.RimuoviCaratteriNonConsigliati(m.Condominio.CodiceFiscale).SafeUpper();
                    recordV.Progressivo = 1; ////?????????
                                             //recordV.CodiceUfficio
                                             //recordV.CodiceAtto


                    //Erario

                    if (h > 0)
                    {
                        var r1 = m.RigheErario[i];
                        recordV.CodiceTributo1 = r1.CodiceTributo;
                        //recordV.NumeroCertificazione1 ?????
                        recordV.RateRegioneProv1 = r1.Rateazione;
                        recordV.AnnoRif1 = r1.AnnoRiferimento;
                        recordV.ImportoDebito1 = r1.ImportoDebito;
                        recordV.ImportoCredito1 = r1.ImportoCredito;
                    }

                    if (h > 1)
                    {
                        var r2 = m.RigheErario[i + 1];
                        recordV.CodiceTributo2 = r2.CodiceTributo;
                        //recordV.NumeroCertificazione1 ?????
                        recordV.RateRegioneProv2 = r2.Rateazione;
                        recordV.AnnoRif2 = r2.AnnoRiferimento;
                        recordV.ImportoDebito2 = r2.ImportoDebito;
                        recordV.ImportoCredito2 = r2.ImportoCredito;
                    }

                    if (h > 2)
                    {
                        var r3 = m.RigheErario[i + 2];
                        recordV.CodiceTributo3 = r3.CodiceTributo;
                        //recordV.NumeroCertificazione1 ?????
                        recordV.RateRegioneProv3 = r3.Rateazione;
                        recordV.AnnoRif3 = r3.AnnoRiferimento;
                        recordV.ImportoDebito3 = r3.ImportoDebito;
                        recordV.ImportoCredito3 = r3.ImportoCredito;
                    }

                    if (h > 3)
                    {
                        var r4 = m.RigheErario[i + 3];
                        recordV.CodiceTributo4 = r4.CodiceTributo;
                        //recordV.NumeroCertificazione1 ?????
                        recordV.RateRegioneProv4 = r4.Rateazione;
                        recordV.AnnoRif4 = r4.AnnoRiferimento;
                        recordV.ImportoDebito4 = r4.ImportoDebito;
                        recordV.ImportoCredito4 = r4.ImportoCredito;
                    }

                    if (h > 4)
                    {
                        var r5 = m.RigheErario[i + 4];
                        recordV.CodiceTributo5 = r5.CodiceTributo;
                        //recordV.NumeroCertificazione1 ?????
                        recordV.RateRegioneProv5 = r5.Rateazione;
                        recordV.AnnoRif5 = r5.AnnoRiferimento;
                        recordV.ImportoDebito5 = r5.ImportoDebito;
                        recordV.ImportoCredito5 = r5.ImportoCredito;
                    }

                    if (h > 5)
                    {
                        var r6 = m.RigheErario[i + 5];
                        recordV.CodiceTributo6 = r6.CodiceTributo;
                        //recordV.NumeroCertificazione1 ?????
                        recordV.RateRegioneProv6 = r6.Rateazione;
                        recordV.AnnoRif6 = r6.AnnoRiferimento;
                        recordV.ImportoDebito6 = r6.ImportoDebito;
                        recordV.ImportoCredito6 = r6.ImportoCredito;
                    }

                    if (h > 0)
                    {
                        if (m.RigheErario.Count > 6)
                        {
                            decimal TotaleCreditoErario = 0;
                            decimal TotaleDebitoErario = 0;
                            for (int j = i; j < i + 6; j++)
                            {
                                if (j < m.RigheErario.Count)
                                {
                                    TotaleCreditoErario = TotaleCreditoErario + m.RigheErario[j].ImportoCredito;
                                    TotaleDebitoErario = TotaleDebitoErario + m.RigheErario[j].ImportoDebito;

                                }

                            }
                            recordV.TotaleDebitoErario = TotaleDebitoErario;
                            recordV.TotaleCreditoErario = TotaleCreditoErario;
                            recordV.SegnoSaldoErario = recordV.TotaleDebitoErario - recordV.TotaleCreditoErario < 0 ? "N" : "P";
                            recordV.SaldoErario = Math.Abs(recordV.TotaleDebitoErario - recordV.TotaleCreditoErario);

                        }
                        else
                        {
                            recordV.TotaleDebitoErario = m.RigheErario.Sum(x => x.ImportoDebito);
                            recordV.TotaleCreditoErario = m.RigheErario.Sum(x => x.ImportoCredito);
                            recordV.SegnoSaldoErario = recordV.TotaleDebitoErario - recordV.TotaleCreditoErario < 0 ? "N" : "P";
                            recordV.SaldoErario = Math.Abs(recordV.TotaleDebitoErario - recordV.TotaleCreditoErario);

                        }


                    }

                    //INPS
                    if (m.RigheInps.Count > 0)
                    {
                        var r1 = m.RigheInps[0];
                        recordV.CodiceSedeInps1 = r1.CodiceSede;
                        recordV.CausaleContributoInps1 = r1.CausaleTributo;
                        recordV.MatricolaInps1 = r1.MatricolaInps;
                        recordV.PeriodoDaInps1 = string.Format("{0}{1}", r1.MeseInizio, r1.AnnoInizio);
                        recordV.PeriodoAInps1 = string.Format("{0}{1}", r1.MeseFine, r1.AnnoFine);
                        recordV.ImportoDebitoInps1 = r1.ImportoDebito;
                        recordV.ImportoCreditoInps1 = r1.ImportoCredito;
                    }

                    if (m.RigheInps.Count > 1)
                    {
                        var r2 = m.RigheInps[1];
                        recordV.CodiceSedeInps2 = r2.CodiceSede;
                        recordV.CausaleContributoInps2 = r2.CausaleTributo;
                        recordV.MatricolaInps2 = r2.MatricolaInps;
                        recordV.PeriodoDaInps2 = string.Format("{0}{1}", r2.MeseInizio, r2.AnnoInizio);
                        recordV.PeriodoAInps2 = string.Format("{0}{1}", r2.MeseFine, r2.AnnoFine);
                        recordV.ImportoDebitoInps2 = r2.ImportoDebito;
                        recordV.ImportoCreditoInps2 = r2.ImportoCredito;
                    }

                    if (m.RigheInps.Count > 2)
                    {
                        var r3 = m.RigheInps[2];
                        recordV.CodiceSedeInps3 = r3.CodiceSede;
                        recordV.CausaleContributoInps3 = r3.CausaleTributo;
                        recordV.MatricolaInps3 = r3.MatricolaInps;
                        recordV.PeriodoDaInps3 = string.Format("{0}{1}", r3.MeseInizio, r3.AnnoInizio);
                        recordV.PeriodoAInps3 = string.Format("{0}{1}", r3.MeseFine, r3.AnnoFine);
                        recordV.ImportoDebitoInps3 = r3.ImportoDebito;
                        recordV.ImportoCreditoInps3 = r3.ImportoCredito;
                    }

                    if (m.RigheInps.Count > 3)
                    {
                        var r4 = m.RigheInps[3];
                        recordV.CodiceSedeInps4 = r4.CodiceSede;
                        recordV.CausaleContributoInps4 = r4.CausaleTributo;
                        recordV.MatricolaInps4 = r4.MatricolaInps;
                        recordV.PeriodoDaInps4 = string.Format("{0}{1}", r4.MeseInizio, r4.AnnoInizio);
                        recordV.PeriodoAInps4 = string.Format("{0}{1}", r4.MeseFine, r4.AnnoFine);
                        recordV.ImportoDebitoInps4 = r4.ImportoDebito;
                        recordV.ImportoCreditoInps4 = r4.ImportoCredito;
                    }


                    if (m.RigheInps.Count > 0)
                    {
                        recordV.TotaleDebitoInps = m.RigheInps.Sum(x => x.ImportoDebito);
                        recordV.TotaleCreditoInps = m.RigheInps.Sum(x => x.ImportoCredito);
                        recordV.SegnoSaldoInps = recordV.TotaleDebitoInps - recordV.TotaleCreditoInps < 0 ? "N" : "P";
                        recordV.SaldoInps = Math.Abs(recordV.TotaleDebitoInps - recordV.TotaleCreditoInps);
                    }
                    //Regioni
                    if (m.RigheRegione.Count > 0)
                    {
                        var r1 = m.RigheRegione[0];
                        recordV.CodiceRegione1 = r1.CodiceRegione;
                        recordV.CodiceTributoRegione1 = r1.CodiceTributo;
                        recordV.RateazioneRegione1 = r1.MeseRiferimento;
                        recordV.AnnoRifRegione1 = r1.AnnoRiferimento;
                        recordV.ImportoDebitoRegione1 = r1.ImportoDebito;
                        recordV.ImportoCreditoRegione1 = r1.ImportoCredito;
                    }

                    if (m.RigheRegione.Count > 1)
                    {
                        var r2 = m.RigheRegione[1];
                        recordV.CodiceRegione2 = r2.CodiceRegione;
                        recordV.CodiceTributoRegione2 = r2.CodiceTributo;
                        recordV.RateazioneRegione2 = r2.MeseRiferimento;
                        recordV.AnnoRifRegione2 = r2.AnnoRiferimento;
                        recordV.ImportoDebitoRegione2 = r2.ImportoDebito;
                        recordV.ImportoCreditoRegione2 = r2.ImportoCredito;
                    }

                    if (m.RigheRegione.Count > 2)
                    {
                        var r3 = m.RigheRegione[2];
                        recordV.CodiceRegione3 = r3.CodiceRegione;
                        recordV.CodiceTributoRegione3 = r3.CodiceTributo;
                        recordV.RateazioneRegione3 = r3.MeseRiferimento;
                        recordV.AnnoRifRegione3 = r3.AnnoRiferimento;
                        recordV.ImportoDebitoRegione3 = r3.ImportoDebito;
                        recordV.ImportoCreditoRegione3 = r3.ImportoCredito;
                    }

                    if (m.RigheRegione.Count > 3)
                    {
                        var r4 = m.RigheRegione[3];
                        recordV.CodiceRegione4 = r4.CodiceRegione;
                        recordV.CodiceTributoRegione4 = r4.CodiceTributo;
                        recordV.RateazioneRegione4 = r4.MeseRiferimento;
                        recordV.AnnoRifRegione4 = r4.AnnoRiferimento;
                        recordV.ImportoDebitoRegione4 = r4.ImportoDebito;
                        recordV.ImportoCreditoRegione4 = r4.ImportoCredito;
                    }


                    if (m.RigheRegione.Count > 0)
                    {
                        recordV.TotaleDebitoRegioni = m.RigheRegione.Sum(x => x.ImportoDebito);
                        recordV.TotaleCreditoRegioni = m.RigheRegione.Sum(x => x.ImportoCredito);
                        recordV.SegnoSaldoRegioni = recordV.TotaleDebitoRegioni - recordV.TotaleCreditoRegioni < 0 ? "N" : "P";
                        recordV.SaldoRegioni = Math.Abs(recordV.TotaleDebitoRegioni - recordV.TotaleCreditoRegioni);
                    }

                    //IMU
                    //recordV.IdentificativoImu = ????????
                    if (m.RigheIci.Count > 0)
                    {
                        var r1 = m.RigheIci[0];
                        recordV.CodiceEnteImu1 = r1.CodiceEnte;
                        recordV.FlagRavvImu1 = r1.Ravvedimento ? 1 : 0;
                        recordV.FlagImmobiliImu1 = r1.ImmobiliVariati ? 1 : 0;
                        recordV.FlagAccontoImu1 = r1.Acconto ? 1 : 0;
                        recordV.FlagSaldoImu1 = r1.Saldo ? 1 : 0;
                        recordV.NumeroImmobiliImu1 = r1.NumeroFabbricati;
                        recordV.DetrazioneAbitazioneImu1 = r1.DetrazioneIci;
                        recordV.CodiceTributoImu1 = r1.CodiceTributo;
                        recordV.RateazioneImu1 = r1.MeseRiferimento; //??????????
                        recordV.AnnoRifImu1 = r1.AnnoRiferimento;
                        recordV.ImportoDebitoImu1 = r1.ImportoDebito;
                        recordV.ImportoCreditoImu1 = r1.ImportoCredito;
                    }

                    if (m.RigheIci.Count > 1)
                    {
                        var r2 = m.RigheIci[1];
                        recordV.CodiceEnteImu2 = r2.CodiceEnte;
                        recordV.FlagRavvImu2 = r2.Ravvedimento ? 1 : 0;
                        recordV.FlagImmobiliImu2 = r2.ImmobiliVariati ? 1 : 0;
                        recordV.FlagAccontoImu2 = r2.Acconto ? 1 : 0;
                        recordV.FlagSaldoImu2 = r2.Saldo ? 1 : 0;
                        recordV.NumeroImmobiliImu2 = r2.NumeroFabbricati;
                        recordV.DetrazioneAbitazioneImu2 = r2.DetrazioneIci;
                        recordV.CodiceTributoImu2 = r2.CodiceTributo;
                        recordV.RateazioneImu2 = r2.MeseRiferimento; //??????????
                        recordV.AnnoRifImu2 = r2.AnnoRiferimento;
                        recordV.ImportoDebitoImu2 = r2.ImportoDebito;
                        recordV.ImportoCreditoImu2 = r2.ImportoCredito;
                    }

                    if (m.RigheIci.Count > 2)
                    {
                        var r3 = m.RigheIci[2];
                        recordV.CodiceEnteImu3 = r3.CodiceEnte;
                        recordV.FlagRavvImu3 = r3.Ravvedimento ? 1 : 0;
                        recordV.FlagImmobiliImu3 = r3.ImmobiliVariati ? 1 : 0;
                        recordV.FlagAccontoImu3 = r3.Acconto ? 1 : 0;
                        recordV.FlagSaldoImu3 = r3.Saldo ? 1 : 0;
                        recordV.NumeroImmobiliImu3 = r3.NumeroFabbricati;
                        recordV.DetrazioneAbitazioneImu3 = r3.DetrazioneIci;
                        recordV.CodiceTributoImu3 = r3.CodiceTributo;
                        recordV.RateazioneImu3 = r3.MeseRiferimento; //??????????
                        recordV.AnnoRifImu3 = r3.AnnoRiferimento;
                        recordV.ImportoDebitoImu3 = r3.ImportoDebito;
                        recordV.ImportoCreditoImu3 = r3.ImportoCredito;
                    }

                    if (m.RigheIci.Count > 3)
                    {
                        var r4 = m.RigheIci[3];
                        recordV.CodiceEnteImu4 = r4.CodiceEnte;
                        recordV.FlagRavvImu4 = r4.Ravvedimento ? 1 : 0;
                        recordV.FlagImmobiliImu4 = r4.ImmobiliVariati ? 1 : 0;
                        recordV.FlagAccontoImu4 = r4.Acconto ? 1 : 0;
                        recordV.FlagSaldoImu4 = r4.Saldo ? 1 : 0;
                        recordV.NumeroImmobiliImu4 = r4.NumeroFabbricati;
                        recordV.DetrazioneAbitazioneImu4 = r4.DetrazioneIci;
                        recordV.CodiceTributoImu4 = r4.CodiceTributo;
                        recordV.RateazioneImu4 = r4.MeseRiferimento; //??????????
                        recordV.AnnoRifImu4 = r4.AnnoRiferimento;
                        recordV.ImportoDebitoImu4 = r4.ImportoDebito;
                        recordV.ImportoCreditoImu4 = r4.ImportoCredito;
                    }

                    if (m.RigheIci.Count > 0)
                    {
                        recordV.TotaleDebitoImu = m.RigheIci.Sum(x => x.ImportoDebito);
                        recordV.TotaleCreditoImu = m.RigheIci.Sum(x => x.ImportoCredito);
                        recordV.SegnoSaldoImu = recordV.TotaleDebitoImu - recordV.TotaleCreditoImu < 0 ? "N" : "P";
                        recordV.SaldoImu = Math.Abs(recordV.TotaleDebitoImu - recordV.TotaleCreditoImu);
                    }
                    //INAIL
                    if (m.RigheInail.Count > 0)
                    {
                        var r1 = m.RigheInail[0];
                        recordV.CodiceSedeInail1 = r1.CodiceSede;
                        recordV.CodiceDittaInail1 = r1.PosizioneAssicurativa;
                        recordV.CodiceControlloDittaInail1 = r1.CodiceControllo;
                        recordV.NumeroRifInail1 = r1.NumeroRiferimento;
                        recordV.CausaleInail1 = r1.Causale;
                        recordV.ImportoDebitoInail1 = r1.ImportoDebito;
                        recordV.ImportoCreditoInail1 = r1.ImportoCredito;
                    }

                    if (m.RigheInail.Count > 1)
                    {
                        var r2 = m.RigheInail[1];
                        recordV.CodiceSedeInail2 = r2.CodiceSede;
                        recordV.CodiceDittaInail2 = r2.PosizioneAssicurativa;
                        recordV.CodiceControlloDittaInail2 = r2.CodiceControllo;
                        recordV.NumeroRifInail2 = r2.NumeroRiferimento;
                        recordV.CausaleInail2 = r2.Causale;
                        recordV.ImportoDebitoInail2 = r2.ImportoDebito;
                        recordV.ImportoCreditoInail2 = r2.ImportoCredito;
                    }

                    if (m.RigheInail.Count > 2)
                    {
                        var r3 = m.RigheInail[2];
                        recordV.CodiceSedeInail3 = r3.CodiceSede;
                        recordV.CodiceDittaInail3 = r3.PosizioneAssicurativa;
                        recordV.CodiceControlloDittaInail3 = r3.CodiceControllo;
                        recordV.NumeroRifInail3 = r3.NumeroRiferimento;
                        recordV.CausaleInail3 = r3.Causale;
                        recordV.ImportoDebitoInail3 = r3.ImportoDebito;
                        recordV.ImportoCreditoInail3 = r3.ImportoCredito;
                    }
                    if (m.RigheInail.Count > 0)
                    {
                        recordV.TotaleDebitoInail = m.RigheInail.Sum(x => x.ImportoDebito);
                        recordV.TotaleCreditoInail = m.RigheInail.Sum(x => x.ImportoCredito);
                        recordV.SegnoSaldoInail = recordV.TotaleDebitoInail - recordV.TotaleCreditoInail < 0 ? "N" : "P";
                        recordV.SaldoInail = Math.Abs(recordV.TotaleDebitoInail - recordV.TotaleCreditoInail);
                    }


                    //Altri

                    if (m.RigheAltriEnti.Count > 0)
                    {
                        recordV.CodiceEnteAltri = m.RigheAltriEnti[0].CodiceEnte;

                        var r1 = m.RigheAltriEnti[0];
                        recordV.CodiceSedeAltri1 = r1.CodiceSede;
                        recordV.CausaleContributoAltri1 = r1.CausaleTributo;
                        recordV.CodicePosizioneAltri1 = r1.CodicePosizione;
                        recordV.PeriodoRifDaAltri1 = string.Format("{0}{1}", r1.MeseInizio, r1.AnnoInizio);
                        recordV.PeriodoRifAAltri1 = string.Format("{0}{1}", r1.MeseFine, r1.AnnoFine);
                        recordV.ImportoDebitoInail1 = r1.ImportoDebito;
                        recordV.ImportoCreditoInail1 = r1.ImportoCredito;
                    }

                    if (m.RigheAltriEnti.Count > 1)
                    {
                        var r2 = m.RigheAltriEnti[1];
                        recordV.CodiceSedeAltri2 = r2.CodiceSede;
                        recordV.CausaleContributoAltri2 = r2.CausaleTributo;
                        recordV.CodicePosizioneAltri2 = r2.CodicePosizione;
                        recordV.PeriodoRifDaAltri2 = string.Format("{0}{1}", r2.MeseInizio, r2.AnnoInizio);
                        recordV.PeriodoRifAAltri2 = string.Format("{0}{1}", r2.MeseFine, r2.AnnoFine);
                        recordV.ImportoDebitoInail2 = r2.ImportoDebito;
                        recordV.ImportoCreditoInail2 = r2.ImportoCredito;
                    }

                    if (m.RigheAltriEnti.Count > 0)
                    {
                        recordV.TotaleDebitoAltri = m.RigheAltriEnti.Sum(x => x.ImportoDebito);
                        recordV.TotaleCreditoAltri = m.RigheAltriEnti.Sum(x => x.ImportoCredito);
                        recordV.SegnoSaldoAltri = recordV.TotaleDebitoAltri - recordV.TotaleCreditoAltri < 0 ? "N" : "P";
                        recordV.SaldoAltri = Math.Abs(recordV.TotaleDebitoAltri - recordV.TotaleCreditoAltri);
                    }

                    if (m.ImportoTotale > 0)
                    {
                        if (m.RigheErario.Count > 6)
                        {

                            recordV.SaldoFinaleF24 = (recordV.TotaleDebitoAltri + recordV.TotaleDebitoErario + recordV.TotaleDebitoImu + recordV.TotaleDebitoInail + recordV.TotaleDebitoInps + recordV.TotaleDebitoRegioni) -
                            (recordV.TotaleCreditoAltri + recordV.TotaleCreditoErario + recordV.TotaleCreditoImu + recordV.TotaleCreditoInail + recordV.TotaleCreditoInps + recordV.TotaleCreditoRegioni);

                        }
                        else
                        {
                            recordV.SaldoFinaleF24 = m.ImportoTotale;
                        }
                    }
                    else
                    {
                        recordV.SaldoFinaleF24 = 0;
                    }
                    recordV.DataVersamento = m.DataVersamento;
                    RecordVCum.Add(recordV);
                    i = i + 6;
                    h = m.RigheErario.Count - i;

                } while (i < m.RigheErario.Count);


                //RecordZ
                RecordZ.NumeroRecordV = RecordVCum.Count();
            }
            else
            {


                RecordV.CodiceFiscale = CbiUtils.RimuoviCaratteriNonConsigliati(m.Condominio.CodiceFiscale).SafeUpper();
                RecordV.Progressivo = 1; ////?????????
                                         //RecordV.CodiceUfficio
                                         //RecordV.CodiceAtto

                //Erario

                if (m.RigheErario.Count > 0)
                {
                    var r1 = m.RigheErario[0];
                    RecordV.CodiceTributo1 = r1.CodiceTributo;
                    //RecordV.NumeroCertificazione1 ?????
                    RecordV.RateRegioneProv1 = r1.Rateazione;
                    RecordV.AnnoRif1 = r1.AnnoRiferimento;
                    RecordV.ImportoDebito1 = r1.ImportoDebito;
                    RecordV.ImportoCredito1 = r1.ImportoCredito;
                }

                if (m.RigheErario.Count > 1)
                {
                    var r2 = m.RigheErario[1];
                    RecordV.CodiceTributo2 = r2.CodiceTributo;
                    //RecordV.NumeroCertificazione1 ?????
                    RecordV.RateRegioneProv2 = r2.Rateazione;
                    RecordV.AnnoRif2 = r2.AnnoRiferimento;
                    RecordV.ImportoDebito2 = r2.ImportoDebito;
                    RecordV.ImportoCredito2 = r2.ImportoCredito;
                }

                if (m.RigheErario.Count > 2)
                {
                    var r3 = m.RigheErario[2];
                    RecordV.CodiceTributo3 = r3.CodiceTributo;
                    //RecordV.NumeroCertificazione1 ?????
                    RecordV.RateRegioneProv3 = r3.Rateazione;
                    RecordV.AnnoRif3 = r3.AnnoRiferimento;
                    RecordV.ImportoDebito3 = r3.ImportoDebito;
                    RecordV.ImportoCredito3 = r3.ImportoCredito;
                }

                if (m.RigheErario.Count > 3)
                {
                    var r4 = m.RigheErario[3];
                    RecordV.CodiceTributo4 = r4.CodiceTributo;
                    //RecordV.NumeroCertificazione1 ?????
                    RecordV.RateRegioneProv4 = r4.Rateazione;
                    RecordV.AnnoRif4 = r4.AnnoRiferimento;
                    RecordV.ImportoDebito4 = r4.ImportoDebito;
                    RecordV.ImportoCredito4 = r4.ImportoCredito;
                }

                if (m.RigheErario.Count > 4)
                {
                    var r5 = m.RigheErario[4];
                    RecordV.CodiceTributo5 = r5.CodiceTributo;
                    //RecordV.NumeroCertificazione1 ?????
                    RecordV.RateRegioneProv5 = r5.Rateazione;
                    RecordV.AnnoRif5 = r5.AnnoRiferimento;
                    RecordV.ImportoDebito5 = r5.ImportoDebito;
                    RecordV.ImportoCredito5 = r5.ImportoCredito;
                }

                if (m.RigheErario.Count > 5)
                {
                    var r6 = m.RigheErario[5];
                    RecordV.CodiceTributo6 = r6.CodiceTributo;
                    //RecordV.NumeroCertificazione1 ?????
                    RecordV.RateRegioneProv6 = r6.Rateazione;
                    RecordV.AnnoRif6 = r6.AnnoRiferimento;
                    RecordV.ImportoDebito6 = r6.ImportoDebito;
                    RecordV.ImportoCredito6 = r6.ImportoCredito;
                }

                if (m.RigheErario.Count > 0)
                {
                    RecordV.TotaleDebitoErario = m.RigheErario.Sum(x => x.ImportoDebito);
                    RecordV.TotaleCreditoErario = m.RigheErario.Sum(x => x.ImportoCredito);
                    RecordV.SegnoSaldoErario = RecordV.TotaleDebitoErario - RecordV.TotaleCreditoErario < 0 ? "N" : "P";
                    RecordV.SaldoErario = Math.Abs(RecordV.TotaleDebitoErario - RecordV.TotaleCreditoErario);
                }

                //INPS
                if (m.RigheInps.Count > 0)
                {
                    var r1 = m.RigheInps[0];
                    RecordV.CodiceSedeInps1 = r1.CodiceSede;
                    RecordV.CausaleContributoInps1 = r1.CausaleTributo;
                    RecordV.MatricolaInps1 = r1.MatricolaInps;
                    RecordV.PeriodoDaInps1 = string.Format("{0}{1}", r1.MeseInizio, r1.AnnoInizio);
                    RecordV.PeriodoAInps1 = string.Format("{0}{1}", r1.MeseFine, r1.AnnoFine);
                    RecordV.ImportoDebitoInps1 = r1.ImportoDebito;
                    RecordV.ImportoCreditoInps1 = r1.ImportoCredito;
                }

                if (m.RigheInps.Count > 1)
                {
                    var r2 = m.RigheInps[1];
                    RecordV.CodiceSedeInps2 = r2.CodiceSede;
                    RecordV.CausaleContributoInps2 = r2.CausaleTributo;
                    RecordV.MatricolaInps2 = r2.MatricolaInps;
                    RecordV.PeriodoDaInps2 = string.Format("{0}{1}", r2.MeseInizio, r2.AnnoInizio);
                    RecordV.PeriodoAInps2 = string.Format("{0}{1}", r2.MeseFine, r2.AnnoFine);
                    RecordV.ImportoDebitoInps2 = r2.ImportoDebito;
                    RecordV.ImportoCreditoInps2 = r2.ImportoCredito;
                }

                if (m.RigheInps.Count > 2)
                {
                    var r3 = m.RigheInps[2];
                    RecordV.CodiceSedeInps3 = r3.CodiceSede;
                    RecordV.CausaleContributoInps3 = r3.CausaleTributo;
                    RecordV.MatricolaInps3 = r3.MatricolaInps;
                    RecordV.PeriodoDaInps3 = string.Format("{0}{1}", r3.MeseInizio, r3.AnnoInizio);
                    RecordV.PeriodoAInps3 = string.Format("{0}{1}", r3.MeseFine, r3.AnnoFine);
                    RecordV.ImportoDebitoInps3 = r3.ImportoDebito;
                    RecordV.ImportoCreditoInps3 = r3.ImportoCredito;
                }

                if (m.RigheInps.Count > 3)
                {
                    var r4 = m.RigheInps[3];
                    RecordV.CodiceSedeInps4 = r4.CodiceSede;
                    RecordV.CausaleContributoInps4 = r4.CausaleTributo;
                    RecordV.MatricolaInps4 = r4.MatricolaInps;
                    RecordV.PeriodoDaInps4 = string.Format("{0}{1}", r4.MeseInizio, r4.AnnoInizio);
                    RecordV.PeriodoAInps4 = string.Format("{0}{1}", r4.MeseFine, r4.AnnoFine);
                    RecordV.ImportoDebitoInps4 = r4.ImportoDebito;
                    RecordV.ImportoCreditoInps4 = r4.ImportoCredito;
                }


                if (m.RigheInps.Count > 0)
                {
                    RecordV.TotaleDebitoInps = m.RigheInps.Sum(x => x.ImportoDebito);
                    RecordV.TotaleCreditoInps = m.RigheInps.Sum(x => x.ImportoCredito);
                    RecordV.SegnoSaldoInps = RecordV.TotaleDebitoInps - RecordV.TotaleCreditoInps < 0 ? "N" : "P";
                    RecordV.SaldoInps = Math.Abs(RecordV.TotaleDebitoInps - RecordV.TotaleCreditoInps);
                }
                //Regioni
                if (m.RigheRegione.Count > 0)
                {
                    var r1 = m.RigheRegione[0];
                    RecordV.CodiceRegione1 = r1.CodiceRegione;
                    RecordV.CodiceTributoRegione1 = r1.CodiceTributo;
                    RecordV.RateazioneRegione1 = r1.MeseRiferimento;
                    RecordV.AnnoRifRegione1 = r1.AnnoRiferimento;
                    RecordV.ImportoDebitoRegione1 = r1.ImportoDebito;
                    RecordV.ImportoCreditoRegione1 = r1.ImportoCredito;
                }

                if (m.RigheRegione.Count > 1)
                {
                    var r2 = m.RigheRegione[1];
                    RecordV.CodiceRegione2 = r2.CodiceRegione;
                    RecordV.CodiceTributoRegione2 = r2.CodiceTributo;
                    RecordV.RateazioneRegione2 = r2.MeseRiferimento;
                    RecordV.AnnoRifRegione2 = r2.AnnoRiferimento;
                    RecordV.ImportoDebitoRegione2 = r2.ImportoDebito;
                    RecordV.ImportoCreditoRegione2 = r2.ImportoCredito;
                }

                if (m.RigheRegione.Count > 2)
                {
                    var r3 = m.RigheRegione[2];
                    RecordV.CodiceRegione3 = r3.CodiceRegione;
                    RecordV.CodiceTributoRegione3 = r3.CodiceTributo;
                    RecordV.RateazioneRegione3 = r3.MeseRiferimento;
                    RecordV.AnnoRifRegione3 = r3.AnnoRiferimento;
                    RecordV.ImportoDebitoRegione3 = r3.ImportoDebito;
                    RecordV.ImportoCreditoRegione3 = r3.ImportoCredito;
                }

                if (m.RigheRegione.Count > 3)
                {
                    var r4 = m.RigheRegione[3];
                    RecordV.CodiceRegione4 = r4.CodiceRegione;
                    RecordV.CodiceTributoRegione4 = r4.CodiceTributo;
                    RecordV.RateazioneRegione4 = r4.MeseRiferimento;
                    RecordV.AnnoRifRegione4 = r4.AnnoRiferimento;
                    RecordV.ImportoDebitoRegione4 = r4.ImportoDebito;
                    RecordV.ImportoCreditoRegione4 = r4.ImportoCredito;
                }


                if (m.RigheRegione.Count > 0)
                {
                    RecordV.TotaleDebitoRegioni = m.RigheRegione.Sum(x => x.ImportoDebito);
                    RecordV.TotaleCreditoRegioni = m.RigheRegione.Sum(x => x.ImportoCredito);
                    RecordV.SegnoSaldoRegioni = RecordV.TotaleDebitoRegioni - RecordV.TotaleCreditoRegioni < 0 ? "N" : "P";
                    RecordV.SaldoRegioni = Math.Abs(RecordV.TotaleDebitoRegioni - RecordV.TotaleCreditoRegioni);
                }

                //IMU
                //RecordV.IdentificativoImu = ????????
                if (m.RigheIci.Count > 0)
                {
                    var r1 = m.RigheIci[0];
                    RecordV.CodiceEnteImu1 = r1.CodiceEnte;
                    RecordV.FlagRavvImu1 = r1.Ravvedimento ? 1 : 0;
                    RecordV.FlagImmobiliImu1 = r1.ImmobiliVariati ? 1 : 0;
                    RecordV.FlagAccontoImu1 = r1.Acconto ? 1 : 0;
                    RecordV.FlagSaldoImu1 = r1.Saldo ? 1 : 0;
                    RecordV.NumeroImmobiliImu1 = r1.NumeroFabbricati;
                    RecordV.DetrazioneAbitazioneImu1 = r1.DetrazioneIci;
                    RecordV.CodiceTributoImu1 = r1.CodiceTributo;
                    RecordV.RateazioneImu1 = r1.MeseRiferimento; //??????????
                    RecordV.AnnoRifImu1 = r1.AnnoRiferimento;
                    RecordV.ImportoDebitoImu1 = r1.ImportoDebito;
                    RecordV.ImportoCreditoImu1 = r1.ImportoCredito;
                }

                if (m.RigheIci.Count > 1)
                {
                    var r2 = m.RigheIci[1];
                    RecordV.CodiceEnteImu2 = r2.CodiceEnte;
                    RecordV.FlagRavvImu2 = r2.Ravvedimento ? 1 : 0;
                    RecordV.FlagImmobiliImu2 = r2.ImmobiliVariati ? 1 : 0;
                    RecordV.FlagAccontoImu2 = r2.Acconto ? 1 : 0;
                    RecordV.FlagSaldoImu2 = r2.Saldo ? 1 : 0;
                    RecordV.NumeroImmobiliImu2 = r2.NumeroFabbricati;
                    RecordV.DetrazioneAbitazioneImu2 = r2.DetrazioneIci;
                    RecordV.CodiceTributoImu2 = r2.CodiceTributo;
                    RecordV.RateazioneImu2 = r2.MeseRiferimento; //??????????
                    RecordV.AnnoRifImu2 = r2.AnnoRiferimento;
                    RecordV.ImportoDebitoImu2 = r2.ImportoDebito;
                    RecordV.ImportoCreditoImu2 = r2.ImportoCredito;
                }

                if (m.RigheIci.Count > 2)
                {
                    var r3 = m.RigheIci[2];
                    RecordV.CodiceEnteImu3 = r3.CodiceEnte;
                    RecordV.FlagRavvImu3 = r3.Ravvedimento ? 1 : 0;
                    RecordV.FlagImmobiliImu3 = r3.ImmobiliVariati ? 1 : 0;
                    RecordV.FlagAccontoImu3 = r3.Acconto ? 1 : 0;
                    RecordV.FlagSaldoImu3 = r3.Saldo ? 1 : 0;
                    RecordV.NumeroImmobiliImu3 = r3.NumeroFabbricati;
                    RecordV.DetrazioneAbitazioneImu3 = r3.DetrazioneIci;
                    RecordV.CodiceTributoImu3 = r3.CodiceTributo;
                    RecordV.RateazioneImu3 = r3.MeseRiferimento; //??????????
                    RecordV.AnnoRifImu3 = r3.AnnoRiferimento;
                    RecordV.ImportoDebitoImu3 = r3.ImportoDebito;
                    RecordV.ImportoCreditoImu3 = r3.ImportoCredito;
                }

                if (m.RigheIci.Count > 3)
                {
                    var r4 = m.RigheIci[3];
                    RecordV.CodiceEnteImu4 = r4.CodiceEnte;
                    RecordV.FlagRavvImu4 = r4.Ravvedimento ? 1 : 0;
                    RecordV.FlagImmobiliImu4 = r4.ImmobiliVariati ? 1 : 0;
                    RecordV.FlagAccontoImu4 = r4.Acconto ? 1 : 0;
                    RecordV.FlagSaldoImu4 = r4.Saldo ? 1 : 0;
                    RecordV.NumeroImmobiliImu4 = r4.NumeroFabbricati;
                    RecordV.DetrazioneAbitazioneImu4 = r4.DetrazioneIci;
                    RecordV.CodiceTributoImu4 = r4.CodiceTributo;
                    RecordV.RateazioneImu4 = r4.MeseRiferimento; //??????????
                    RecordV.AnnoRifImu4 = r4.AnnoRiferimento;
                    RecordV.ImportoDebitoImu4 = r4.ImportoDebito;
                    RecordV.ImportoCreditoImu4 = r4.ImportoCredito;
                }

                if (m.RigheIci.Count > 0)
                {
                    RecordV.TotaleDebitoImu = m.RigheIci.Sum(x => x.ImportoDebito);
                    RecordV.TotaleCreditoImu = m.RigheIci.Sum(x => x.ImportoCredito);
                    RecordV.SegnoSaldoImu = RecordV.TotaleDebitoImu - RecordV.TotaleCreditoImu < 0 ? "N" : "P";
                    RecordV.SaldoImu = Math.Abs(RecordV.TotaleDebitoImu - RecordV.TotaleCreditoImu);
                }
                //INAIL
                if (m.RigheInail.Count > 0)
                {
                    var r1 = m.RigheInail[0];
                    RecordV.CodiceSedeInail1 = r1.CodiceSede;
                    RecordV.CodiceDittaInail1 = r1.PosizioneAssicurativa;
                    RecordV.CodiceControlloDittaInail1 = r1.CodiceControllo;
                    RecordV.NumeroRifInail1 = r1.NumeroRiferimento;
                    RecordV.CausaleInail1 = r1.Causale;
                    RecordV.ImportoDebitoInail1 = r1.ImportoDebito;
                    RecordV.ImportoCreditoInail1 = r1.ImportoCredito;
                }

                if (m.RigheInail.Count > 1)
                {
                    var r2 = m.RigheInail[1];
                    RecordV.CodiceSedeInail2 = r2.CodiceSede;
                    RecordV.CodiceDittaInail2 = r2.PosizioneAssicurativa;
                    RecordV.CodiceControlloDittaInail2 = r2.CodiceControllo;
                    RecordV.NumeroRifInail2 = r2.NumeroRiferimento;
                    RecordV.CausaleInail2 = r2.Causale;
                    RecordV.ImportoDebitoInail2 = r2.ImportoDebito;
                    RecordV.ImportoCreditoInail2 = r2.ImportoCredito;
                }

                if (m.RigheInail.Count > 2)
                {
                    var r3 = m.RigheInail[2];
                    RecordV.CodiceSedeInail3 = r3.CodiceSede;
                    RecordV.CodiceDittaInail3 = r3.PosizioneAssicurativa;
                    RecordV.CodiceControlloDittaInail3 = r3.CodiceControllo;
                    RecordV.NumeroRifInail3 = r3.NumeroRiferimento;
                    RecordV.CausaleInail3 = r3.Causale;
                    RecordV.ImportoDebitoInail3 = r3.ImportoDebito;
                    RecordV.ImportoCreditoInail3 = r3.ImportoCredito;
                }
                if (m.RigheInail.Count > 0)
                {
                    RecordV.TotaleDebitoInail = m.RigheInail.Sum(x => x.ImportoDebito);
                    RecordV.TotaleCreditoInail = m.RigheInail.Sum(x => x.ImportoCredito);
                    RecordV.SegnoSaldoInail = RecordV.TotaleDebitoInail - RecordV.TotaleCreditoInail < 0 ? "N" : "P";
                    RecordV.SaldoInail = Math.Abs(RecordV.TotaleDebitoInail - RecordV.TotaleCreditoInail);
                }


                //Altri

                if (m.RigheAltriEnti.Count > 0)
                {
                    RecordV.CodiceEnteAltri = m.RigheAltriEnti[0].CodiceEnte;

                    var r1 = m.RigheAltriEnti[0];
                    RecordV.CodiceSedeAltri1 = r1.CodiceSede;
                    RecordV.CausaleContributoAltri1 = r1.CausaleTributo;
                    RecordV.CodicePosizioneAltri1 = r1.CodicePosizione;
                    RecordV.PeriodoRifDaAltri1 = string.Format("{0}{1}", r1.MeseInizio, r1.AnnoInizio);
                    RecordV.PeriodoRifAAltri1 = string.Format("{0}{1}", r1.MeseFine, r1.AnnoFine);
                    RecordV.ImportoDebitoInail1 = r1.ImportoDebito;
                    RecordV.ImportoCreditoInail1 = r1.ImportoCredito;
                }

                if (m.RigheAltriEnti.Count > 1)
                {
                    var r2 = m.RigheAltriEnti[1];
                    RecordV.CodiceSedeAltri2 = r2.CodiceSede;
                    RecordV.CausaleContributoAltri2 = r2.CausaleTributo;
                    RecordV.CodicePosizioneAltri2 = r2.CodicePosizione;
                    RecordV.PeriodoRifDaAltri2 = string.Format("{0}{1}", r2.MeseInizio, r2.AnnoInizio);
                    RecordV.PeriodoRifAAltri2 = string.Format("{0}{1}", r2.MeseFine, r2.AnnoFine);
                    RecordV.ImportoDebitoInail2 = r2.ImportoDebito;
                    RecordV.ImportoCreditoInail2 = r2.ImportoCredito;
                }

                if (m.RigheAltriEnti.Count > 0)
                {
                    RecordV.TotaleDebitoAltri = m.RigheAltriEnti.Sum(x => x.ImportoDebito);
                    RecordV.TotaleCreditoAltri = m.RigheAltriEnti.Sum(x => x.ImportoCredito);
                    RecordV.SegnoSaldoAltri = RecordV.TotaleDebitoAltri - RecordV.TotaleCreditoAltri < 0 ? "N" : "P";
                    RecordV.SaldoAltri = Math.Abs(RecordV.TotaleDebitoAltri - RecordV.TotaleCreditoAltri);
                }

                if (m.ImportoTotale > 0)
                {
                    RecordV.SaldoFinaleF24 = m.ImportoTotale;
                }
                else
                {
                    RecordV.SaldoFinaleF24 = 0;
                }
                RecordV.DataVersamento = m.DataVersamento;

                //RecordZ
                RecordZ.NumeroRecordV = 1;
            }
        }

        public void CreaF24Cumulativo(List<ModelloF24> modelli, char tipoIban)
        {
            //RecordA
            if (modelli[0].Condominio.Studio.PartitaIvaIntermediario.Length == 16)
            {
                RecordA.TipoFornitore = "04";
                RecordA.CognomeFisica = CbiUtils.RimuoviCaratteriNonConsigliati(modelli[0].Condominio.Studio.CognomeIntermediario).SafeUpper();
                RecordA.NomeFisica = CbiUtils.RimuoviCaratteriNonConsigliati(modelli[0].Condominio.Studio.NomeIntermediario).SafeUpper();
                RecordA.SessoFisica = CbiUtils.RimuoviCaratteriNonConsigliati(modelli[0].Condominio.Studio.SessoIntermediario).SafeUpper();
                RecordA.ProvinciaNascitaFisica = CbiUtils.RimuoviCaratteriNonConsigliati(modelli[0].Condominio.Studio.ProvinciaNascitaIntermediario).SafeUpper();
                var data = Regex.Replace(modelli[0].Condominio.Studio.DataDiNascitaIntermediario, "/", "");
                RecordA.DataNascitaFisica = CbiUtils.RimuoviCaratteriNonConsigliati(data).SafeUpper();
                RecordA.ComuneNascitaFisica = CbiUtils.RimuoviCaratteriNonConsigliati(modelli[0].Condominio.Studio.ComuneNascitaIntermediario).SafeUpper();


            }
            else
            {
                RecordA.DenominazioneNonFisica = CbiUtils.RimuoviCaratteriNonConsigliati(modelli[0].Condominio.Studio.DenominazioneIntermediario).SafeUpper();
                RecordA.ComuneNonFisica = CbiUtils.RimuoviCaratteriNonConsigliati(modelli[0].Condominio.Studio.ComuneNascitaIntermediario).SafeUpper();
                RecordA.ProvinciaNonFisica = CbiUtils.RimuoviCaratteriNonConsigliati(modelli[0].Condominio.Studio.ProvinciaNascitaIntermediario).SafeUpper();
                RecordA.IndirizzoNonFisica = CbiUtils.RimuoviCaratteriNonConsigliati(modelli[0].Condominio.Studio.IndirizzoIntermediario).SafeUpper();
                RecordA.CapNonFisica = CbiUtils.RimuoviCaratteriNonConsigliati(modelli[0].Condominio.Studio.CapIntermediario).SafeUpper();
            }
            RecordA.CodiceFiscale = CbiUtils.RimuoviCaratteriNonConsigliati(modelli[0].Condominio.Studio.PartitaIvaIntermediario).SafeUpper();
            if (modelli[0].Condominio.Studio.FlussoIntermediario == "0")
            {
                RecordA.FlagOrigine = CbiUtils.RimuoviCaratteriNonConsigliati("E").SafeUpper();
                RecordA.FlagAccettazione = CbiUtils.RimuoviCaratteriNonConsigliati(" ").SafeUpper();
            }
            else if (modelli[0].Condominio.Studio.FlussoIntermediario == "1")
            {
                RecordA.FlagOrigine = CbiUtils.RimuoviCaratteriNonConsigliati("Y").SafeUpper();
                RecordA.FlagAccettazione = CbiUtils.RimuoviCaratteriNonConsigliati("1").SafeUpper();
            }
            var i = 0;
            foreach (var m in modelli)
            {
                i++;
                RecordM recordM = new RecordM();
                //RecordM
                recordM.Progressivo = (0000000 + i).ToString("00000000");
                recordM.CodiceFiscale = CbiUtils.RimuoviCaratteriNonConsigliati(m.Condominio.CodiceFiscale).SafeUpper();
                recordM.EsercizioCavallo = m.PeriodoImpostaCoincide ? 0 : 1; //?????
                recordM.FlagVersante = 1; //?????????
                recordM.CodiceFiscaleVersante = CbiUtils.RimuoviCaratteriNonConsigliati(m.Amministratore.CodiceFiscale).SafeUpper();
                recordM.TipoVersante = 1;
                recordM.CognomeVersante = CbiUtils.RimuoviCaratteriNonConsigliati(m.Amministratore.Cognome).SafeUpper();
                recordM.NomeVersante = CbiUtils.RimuoviCaratteriNonConsigliati(m.Amministratore.Nome).SafeUpper();
                recordM.SessoVersante = m.Amministratore.Sesso.GetValueOrDefault(Model.Anagrafiche.Sesso.Maschio) == Model.Anagrafiche.Sesso.Maschio ? "M" : "F";
                recordM.DataNascitaVersante = m.Amministratore.DataNascita.HasValue ? $"{m.Amministratore.DataNascita:ddMMyyyy}" : "";
                recordM.ComuneNascitaVersante = CbiUtils.RimuoviCaratteriNonConsigliati(m.Amministratore.ComuneNascita).SafeUpper();
                recordM.ProvinciaNascitaVersante = CbiUtils.RimuoviCaratteriNonConsigliati(m.Amministratore.ProvinciaNascita).SafeUpper();

                recordM.DenominazioneNonFisica = CbiUtils.RimuoviCaratteriNonConsigliati(m.Condominio.DescrizioneEstesa).SafeUpper();

                if (m.ImportoTotale > 0)
                {
                    recordM.Iban = tipoIban == 'C' ? m.ContoCorrente.IbanCbi : m.Condominio.Studio.IBANIntermediario; //solo se importo a debito
                    if(recordM.Iban==null)
                    {
                        MessageBox.Show("Impossibile proseguire mancano i dati dell'intermediario (IBAN)");
                        return;
                    }
                    recordM.SaldoDebito = m.ImportoTotale.ToString("0.00", System.Globalization.CultureInfo.InvariantCulture).Replace(".", ",");
                }
                else
                {
                    recordM.SaldoDebito = "0,00";
                }
                recordM.DataVersamento = m.DataVersamento;
                if (RecordA.FlagOrigine == "Y" && recordM.Iban != null)
                {
                    recordM.CodiceFiscaleTitolare = RecordA.CodiceFiscale;
                }
                else if (RecordA.FlagOrigine == "E" && recordM.Iban != null)
                {
                    recordM.CodiceFiscaleTitolare = recordM.CodiceFiscale;
                }
                else if (recordM.TipoVersante == 2 || recordM.TipoVersante == 3 || recordM.TipoVersante == 7)
                {
                    recordM.CodiceFiscaleTitolare = recordM.CodiceFiscaleVersante;
                }
                else if (recordM.TipoVersante == 50 || recordM.TipoVersante == 51 || recordM.TipoVersante == 60 || recordM.TipoVersante == 72)
                {
                    recordM.CodiceFiscaleTitolare = recordM.CodiceFiscaleCoobbligato;
                }
                if (recordM.CodiceFiscaleTitolare.Length == 16)
                {
                    recordM.TipoTitolareConto = "04";
                }
                else if (recordM.CodiceFiscaleTitolare.Length == 11)
                {
                    recordM.TipoTitolareConto = "14";
                }
                RecordMCum.Add(recordM);
                //RecordV
                if (m.RigheErario.Count > 6)
                {
                    var i1 = 0;
                    var h = m.RigheErario.Count;
                    do
                    {
                        RecordV recordV = new RecordV();

                        recordV.CodiceFiscale = CbiUtils.RimuoviCaratteriNonConsigliati(m.Condominio.CodiceFiscale).SafeUpper();
                        recordV.Progressivo = i; ////?????????
                                                 //RecordV.CodiceUfficio
                                                 //RecordV.CodiceAtto
                        //recordV.Progressivo = Convert.ToInt32( recordM.Progressivo);

                        //Erario
                        if (h > 0 )
                        {
                            var r1 = m.RigheErario[i1+ 0];
                            recordV.CodiceTributo1 = r1.CodiceTributo;
                            //recordV.NumeroCertificazione1 ?????
                            recordV.RateRegioneProv1 = r1.Rateazione;
                            recordV.AnnoRif1 = r1.AnnoRiferimento;
                            recordV.ImportoDebito1 = r1.ImportoDebito;
                            recordV.ImportoCredito1 = r1.ImportoCredito;
                        }

                        if (h > 1 )
                        {
                            var r2 = m.RigheErario[i1 + 1];
                            recordV.CodiceTributo2 = r2.CodiceTributo;
                            //recordV.NumeroCertificazione1 ?????
                            recordV.RateRegioneProv2 = r2.Rateazione;
                            recordV.AnnoRif2 = r2.AnnoRiferimento;
                            recordV.ImportoDebito2 = r2.ImportoDebito;
                            recordV.ImportoCredito2 = r2.ImportoCredito;
                        }

                        if (h > 2 )
                        {
                            var r3 = m.RigheErario[i1 + 2];
                            recordV.CodiceTributo3 = r3.CodiceTributo;
                            //recordV.NumeroCertificazione1 ?????
                            recordV.RateRegioneProv3 = r3.Rateazione;
                            recordV.AnnoRif3 = r3.AnnoRiferimento;
                            recordV.ImportoDebito3 = r3.ImportoDebito;
                            recordV.ImportoCredito3 = r3.ImportoCredito;
                        }

                        if (h > 3 )
                        {
                            var r4 = m.RigheErario[i1 + 3];
                            recordV.CodiceTributo4 = r4.CodiceTributo;
                            //recordV.NumeroCertificazione1 ?????
                            recordV.RateRegioneProv4 = r4.Rateazione;
                            recordV.AnnoRif4 = r4.AnnoRiferimento;
                            recordV.ImportoDebito4 = r4.ImportoDebito;
                            recordV.ImportoCredito4 = r4.ImportoCredito;
                        }

                        if (h > 4 )
                        {
                            var r5 = m.RigheErario[i1 + 4];
                            recordV.CodiceTributo5 = r5.CodiceTributo;
                            //recordV.NumeroCertificazione1 ?????
                            recordV.RateRegioneProv5 = r5.Rateazione;
                            recordV.AnnoRif5 = r5.AnnoRiferimento;
                            recordV.ImportoDebito5 = r5.ImportoDebito;
                            recordV.ImportoCredito5 = r5.ImportoCredito;
                        }

                        if (h > 5 )
                        {
                            var r6 = m.RigheErario[i1+5];
                            recordV.CodiceTributo6 = r6.CodiceTributo;
                            //recordV.NumeroCertificazione1 ?????
                            recordV.RateRegioneProv6 = r6.Rateazione;
                            recordV.AnnoRif6 = r6.AnnoRiferimento;
                            recordV.ImportoDebito6 = r6.ImportoDebito;
                            recordV.ImportoCredito6 = r6.ImportoCredito;
                        }

                        if (h > 0)
                        {
                            //recordV.TotaleDebitoErario = m.RigheErario.Sum(x => x.ImportoDebito);
                            //recordV.TotaleCreditoErario = m.RigheErario.Sum(x => x.ImportoCredito);
                            //recordV.SegnoSaldoErario = recordV.TotaleDebitoErario - recordV.TotaleCreditoErario < 0 ? "N" : "P";
                            //recordV.SaldoErario = Math.Abs(recordV.TotaleDebitoErario - recordV.TotaleCreditoErario);
                            if (m.RigheErario.Count > 6)
                            {
                                decimal TotaleCreditoErario = 0;
                                decimal TotaleDebitoErario = 0;
                                for (int j = i1; j < i1 + 6; j++)
                                {
                                    if (j < m.RigheErario.Count)
                                    {
                                        TotaleCreditoErario = TotaleCreditoErario + m.RigheErario[j].ImportoCredito;
                                        TotaleDebitoErario = TotaleDebitoErario + m.RigheErario[j].ImportoDebito;

                                    }

                                }
                                recordV.TotaleDebitoErario = TotaleDebitoErario;
                                recordV.TotaleCreditoErario = TotaleCreditoErario;
                                recordV.SegnoSaldoErario = recordV.TotaleDebitoErario - recordV.TotaleCreditoErario < 0 ? "N" : "P";
                                recordV.SaldoErario = Math.Abs(recordV.TotaleDebitoErario - recordV.TotaleCreditoErario);

                            }
                            else
                            {
                                recordV.TotaleDebitoErario = m.RigheErario.Sum(x => x.ImportoDebito);
                                recordV.TotaleCreditoErario = m.RigheErario.Sum(x => x.ImportoCredito);
                                recordV.SegnoSaldoErario = recordV.TotaleDebitoErario - recordV.TotaleCreditoErario < 0 ? "N" : "P";
                                recordV.SaldoErario = Math.Abs(recordV.TotaleDebitoErario - recordV.TotaleCreditoErario);

                            }
                        }

                        //INPS
                        if (m.RigheInps.Count > 0)
                        {
                            var r1 = m.RigheInps[0];
                            recordV.CodiceSedeInps1 = r1.CodiceSede;
                            recordV.CausaleContributoInps1 = r1.CausaleTributo;
                            recordV.MatricolaInps1 = r1.MatricolaInps;
                            recordV.PeriodoDaInps1 = string.Format("{0}{1}", r1.MeseInizio, r1.AnnoInizio);
                            recordV.PeriodoAInps1 = string.Format("{0}{1}", r1.MeseFine, r1.AnnoFine);
                            recordV.ImportoDebitoInps1 = r1.ImportoDebito;
                            recordV.ImportoCreditoInps1 = r1.ImportoCredito;
                        }

                        if (m.RigheInps.Count > 1)
                        {
                            var r2 = m.RigheInps[1];
                            recordV.CodiceSedeInps2 = r2.CodiceSede;
                            recordV.CausaleContributoInps2 = r2.CausaleTributo;
                            recordV.MatricolaInps2 = r2.MatricolaInps;
                            recordV.PeriodoDaInps2 = string.Format("{0}{1}", r2.MeseInizio, r2.AnnoInizio);
                            recordV.PeriodoAInps2 = string.Format("{0}{1}", r2.MeseFine, r2.AnnoFine);
                            recordV.ImportoDebitoInps2 = r2.ImportoDebito;
                            recordV.ImportoCreditoInps2 = r2.ImportoCredito;
                        }

                        if (m.RigheInps.Count > 2)
                        {
                            var r3 = m.RigheInps[2];
                            recordV.CodiceSedeInps3 = r3.CodiceSede;
                            recordV.CausaleContributoInps3 = r3.CausaleTributo;
                            recordV.MatricolaInps3 = r3.MatricolaInps;
                            recordV.PeriodoDaInps3 = string.Format("{0}{1}", r3.MeseInizio, r3.AnnoInizio);
                            recordV.PeriodoAInps3 = string.Format("{0}{1}", r3.MeseFine, r3.AnnoFine);
                            recordV.ImportoDebitoInps3 = r3.ImportoDebito;
                            recordV.ImportoCreditoInps3 = r3.ImportoCredito;
                        }

                        if (m.RigheInps.Count > 3)
                        {
                            var r4 = m.RigheInps[3];
                            recordV.CodiceSedeInps4 = r4.CodiceSede;
                            recordV.CausaleContributoInps4 = r4.CausaleTributo;
                            recordV.MatricolaInps4 = r4.MatricolaInps;
                            recordV.PeriodoDaInps4 = string.Format("{0}{1}", r4.MeseInizio, r4.AnnoInizio);
                            recordV.PeriodoAInps4 = string.Format("{0}{1}", r4.MeseFine, r4.AnnoFine);
                            recordV.ImportoDebitoInps4 = r4.ImportoDebito;
                            recordV.ImportoCreditoInps4 = r4.ImportoCredito;
                        }


                        if (m.RigheInps.Count > 0)
                        {
                            recordV.TotaleDebitoInps = m.RigheInps.Sum(x => x.ImportoDebito);
                            recordV.TotaleCreditoInps = m.RigheInps.Sum(x => x.ImportoCredito);
                            recordV.SegnoSaldoInps = recordV.TotaleDebitoInps - recordV.TotaleCreditoInps < 0 ? "N" : "P";
                            recordV.SaldoInps = Math.Abs(recordV.TotaleDebitoInps - recordV.TotaleCreditoInps);
                        }
                        //Regioni
                        if (m.RigheRegione.Count > 0)
                        {
                            var r1 = m.RigheRegione[0];
                            recordV.CodiceRegione1 = r1.CodiceRegione;
                            recordV.CodiceTributoRegione1 = r1.CodiceTributo;
                            recordV.RateazioneRegione1 = r1.MeseRiferimento;
                            recordV.AnnoRifRegione1 = r1.AnnoRiferimento;
                            recordV.ImportoDebitoRegione1 = r1.ImportoDebito;
                            recordV.ImportoCreditoRegione1 = r1.ImportoCredito;
                        }

                        if (m.RigheRegione.Count > 1)
                        {
                            var r2 = m.RigheRegione[1];
                            recordV.CodiceRegione2 = r2.CodiceRegione;
                            recordV.CodiceTributoRegione2 = r2.CodiceTributo;
                            recordV.RateazioneRegione2 = r2.MeseRiferimento;
                            recordV.AnnoRifRegione2 = r2.AnnoRiferimento;
                            recordV.ImportoDebitoRegione2 = r2.ImportoDebito;
                            recordV.ImportoCreditoRegione2 = r2.ImportoCredito;
                        }

                        if (m.RigheRegione.Count > 2)
                        {
                            var r3 = m.RigheRegione[2];
                            recordV.CodiceRegione3 = r3.CodiceRegione;
                            recordV.CodiceTributoRegione3 = r3.CodiceTributo;
                            recordV.RateazioneRegione3 = r3.MeseRiferimento;
                            recordV.AnnoRifRegione3 = r3.AnnoRiferimento;
                            recordV.ImportoDebitoRegione3 = r3.ImportoDebito;
                            recordV.ImportoCreditoRegione3 = r3.ImportoCredito;
                        }

                        if (m.RigheRegione.Count > 3)
                        {
                            var r4 = m.RigheRegione[3];
                            recordV.CodiceRegione4 = r4.CodiceRegione;
                            recordV.CodiceTributoRegione4 = r4.CodiceTributo;
                            recordV.RateazioneRegione4 = r4.MeseRiferimento;
                            recordV.AnnoRifRegione4 = r4.AnnoRiferimento;
                            recordV.ImportoDebitoRegione4 = r4.ImportoDebito;
                            recordV.ImportoCreditoRegione4 = r4.ImportoCredito;
                        }


                        if (m.RigheRegione.Count > 0)
                        {
                            recordV.TotaleDebitoRegioni = m.RigheRegione.Sum(x => x.ImportoDebito);
                            recordV.TotaleCreditoRegioni = m.RigheRegione.Sum(x => x.ImportoCredito);
                            recordV.SegnoSaldoRegioni = recordV.TotaleDebitoRegioni - recordV.TotaleCreditoRegioni < 0 ? "N" : "P";
                            recordV.SaldoRegioni = Math.Abs(recordV.TotaleDebitoRegioni - recordV.TotaleCreditoRegioni);
                        }

                        //IMU
                        //recordV.IdentificativoImu = ????????
                        if (m.RigheIci.Count > 0)
                        {
                            var r1 = m.RigheIci[0];
                            recordV.CodiceEnteImu1 = r1.CodiceEnte;
                            recordV.FlagRavvImu1 = r1.Ravvedimento ? 1 : 0;
                            recordV.FlagImmobiliImu1 = r1.ImmobiliVariati ? 1 : 0;
                            recordV.FlagAccontoImu1 = r1.Acconto ? 1 : 0;
                            recordV.FlagSaldoImu1 = r1.Saldo ? 1 : 0;
                            recordV.NumeroImmobiliImu1 = r1.NumeroFabbricati;
                            recordV.DetrazioneAbitazioneImu1 = r1.DetrazioneIci;
                            recordV.CodiceTributoImu1 = r1.CodiceTributo;
                            recordV.RateazioneImu1 = r1.MeseRiferimento; //??????????
                            recordV.AnnoRifImu1 = r1.AnnoRiferimento;
                            recordV.ImportoDebitoImu1 = r1.ImportoDebito;
                            recordV.ImportoCreditoImu1 = r1.ImportoCredito;
                        }

                        if (m.RigheIci.Count > 1)
                        {
                            var r2 = m.RigheIci[1];
                            recordV.CodiceEnteImu2 = r2.CodiceEnte;
                            recordV.FlagRavvImu2 = r2.Ravvedimento ? 1 : 0;
                            recordV.FlagImmobiliImu2 = r2.ImmobiliVariati ? 1 : 0;
                            recordV.FlagAccontoImu2 = r2.Acconto ? 1 : 0;
                            recordV.FlagSaldoImu2 = r2.Saldo ? 1 : 0;
                            recordV.NumeroImmobiliImu2 = r2.NumeroFabbricati;
                            recordV.DetrazioneAbitazioneImu2 = r2.DetrazioneIci;
                            recordV.CodiceTributoImu2 = r2.CodiceTributo;
                            recordV.RateazioneImu2 = r2.MeseRiferimento; //??????????
                            recordV.AnnoRifImu2 = r2.AnnoRiferimento;
                            recordV.ImportoDebitoImu2 = r2.ImportoDebito;
                            recordV.ImportoCreditoImu2 = r2.ImportoCredito;
                        }

                        if (m.RigheIci.Count > 2)
                        {
                            var r3 = m.RigheIci[2];
                            recordV.CodiceEnteImu3 = r3.CodiceEnte;
                            recordV.FlagRavvImu3 = r3.Ravvedimento ? 1 : 0;
                            recordV.FlagImmobiliImu3 = r3.ImmobiliVariati ? 1 : 0;
                            recordV.FlagAccontoImu3 = r3.Acconto ? 1 : 0;
                            recordV.FlagSaldoImu3 = r3.Saldo ? 1 : 0;
                            recordV.NumeroImmobiliImu3 = r3.NumeroFabbricati;
                            recordV.DetrazioneAbitazioneImu3 = r3.DetrazioneIci;
                            recordV.CodiceTributoImu3 = r3.CodiceTributo;
                            recordV.RateazioneImu3 = r3.MeseRiferimento; //??????????
                            recordV.AnnoRifImu3 = r3.AnnoRiferimento;
                            recordV.ImportoDebitoImu3 = r3.ImportoDebito;
                            recordV.ImportoCreditoImu3 = r3.ImportoCredito;
                        }

                        if (m.RigheIci.Count > 3)
                        {
                            var r4 = m.RigheIci[3];
                            recordV.CodiceEnteImu4 = r4.CodiceEnte;
                            recordV.FlagRavvImu4 = r4.Ravvedimento ? 1 : 0;
                            recordV.FlagImmobiliImu4 = r4.ImmobiliVariati ? 1 : 0;
                            recordV.FlagAccontoImu4 = r4.Acconto ? 1 : 0;
                            recordV.FlagSaldoImu4 = r4.Saldo ? 1 : 0;
                            recordV.NumeroImmobiliImu4 = r4.NumeroFabbricati;
                            recordV.DetrazioneAbitazioneImu4 = r4.DetrazioneIci;
                            recordV.CodiceTributoImu4 = r4.CodiceTributo;
                            recordV.RateazioneImu4 = r4.MeseRiferimento; //??????????
                            recordV.AnnoRifImu4 = r4.AnnoRiferimento;
                            recordV.ImportoDebitoImu4 = r4.ImportoDebito;
                            recordV.ImportoCreditoImu4 = r4.ImportoCredito;
                        }

                        if (m.RigheIci.Count > 0)
                        {
                            recordV.TotaleDebitoImu = m.RigheIci.Sum(x => x.ImportoDebito);
                            recordV.TotaleCreditoImu = m.RigheIci.Sum(x => x.ImportoCredito);
                            recordV.SegnoSaldoImu = recordV.TotaleDebitoImu - recordV.TotaleCreditoImu < 0 ? "N" : "P";
                            recordV.SaldoImu = Math.Abs(recordV.TotaleDebitoImu - recordV.TotaleCreditoImu);
                        }
                        //INAIL
                        if (m.RigheInail.Count > 0)
                        {
                            var r1 = m.RigheInail[0];
                            recordV.CodiceSedeInail1 = r1.CodiceSede;
                            recordV.CodiceDittaInail1 = r1.PosizioneAssicurativa;
                            recordV.CodiceControlloDittaInail1 = r1.CodiceControllo;
                            recordV.NumeroRifInail1 = r1.NumeroRiferimento;
                            recordV.CausaleInail1 = r1.Causale;
                            recordV.ImportoDebitoInail1 = r1.ImportoDebito;
                            recordV.ImportoCreditoInail1 = r1.ImportoCredito;
                        }

                        if (m.RigheInail.Count > 1)
                        {
                            var r2 = m.RigheInail[1];
                            recordV.CodiceSedeInail2 = r2.CodiceSede;
                            recordV.CodiceDittaInail2 = r2.PosizioneAssicurativa;
                            recordV.CodiceControlloDittaInail2 = r2.CodiceControllo;
                            recordV.NumeroRifInail2 = r2.NumeroRiferimento;
                            recordV.CausaleInail2 = r2.Causale;
                            recordV.ImportoDebitoInail2 = r2.ImportoDebito;
                            recordV.ImportoCreditoInail2 = r2.ImportoCredito;
                        }

                        if (m.RigheInail.Count > 2)
                        {
                            var r3 = m.RigheInail[2];
                            recordV.CodiceSedeInail3 = r3.CodiceSede;
                            recordV.CodiceDittaInail3 = r3.PosizioneAssicurativa;
                            recordV.CodiceControlloDittaInail3 = r3.CodiceControllo;
                            recordV.NumeroRifInail3 = r3.NumeroRiferimento;
                            recordV.CausaleInail3 = r3.Causale;
                            recordV.ImportoDebitoInail3 = r3.ImportoDebito;
                            recordV.ImportoCreditoInail3 = r3.ImportoCredito;
                        }
                        if (m.RigheInail.Count > 0)
                        {
                            recordV.TotaleDebitoInail = m.RigheInail.Sum(x => x.ImportoDebito);
                            recordV.TotaleCreditoInail = m.RigheInail.Sum(x => x.ImportoCredito);
                            recordV.SegnoSaldoInail = recordV.TotaleDebitoInail - recordV.TotaleCreditoInail < 0 ? "N" : "P";
                            recordV.SaldoInail = Math.Abs(recordV.TotaleDebitoInail - recordV.TotaleCreditoInail);
                        }


                        //Altri

                        if (m.RigheAltriEnti.Count > 0)
                        {
                            recordV.CodiceEnteAltri = m.RigheAltriEnti[0].CodiceEnte;

                            var r1 = m.RigheAltriEnti[0];
                            recordV.CodiceSedeAltri1 = r1.CodiceSede;
                            recordV.CausaleContributoAltri1 = r1.CausaleTributo;
                            recordV.CodicePosizioneAltri1 = r1.CodicePosizione;
                            recordV.PeriodoRifDaAltri1 = string.Format("{0}{1}", r1.MeseInizio, r1.AnnoInizio);
                            recordV.PeriodoRifAAltri1 = string.Format("{0}{1}", r1.MeseFine, r1.AnnoFine);
                            recordV.ImportoDebitoInail1 = r1.ImportoDebito;
                            recordV.ImportoCreditoInail1 = r1.ImportoCredito;
                        }

                        if (m.RigheAltriEnti.Count > 1)
                        {
                            var r2 = m.RigheAltriEnti[1];
                            recordV.CodiceSedeAltri2 = r2.CodiceSede;
                            recordV.CausaleContributoAltri2 = r2.CausaleTributo;
                            recordV.CodicePosizioneAltri2 = r2.CodicePosizione;
                            recordV.PeriodoRifDaAltri2 = string.Format("{0}{1}", r2.MeseInizio, r2.AnnoInizio);
                            recordV.PeriodoRifAAltri2 = string.Format("{0}{1}", r2.MeseFine, r2.AnnoFine);
                            recordV.ImportoDebitoInail2 = r2.ImportoDebito;
                            recordV.ImportoCreditoInail2 = r2.ImportoCredito;
                        }

                        if (m.RigheAltriEnti.Count > 0)
                        {
                            recordV.TotaleDebitoAltri = m.RigheAltriEnti.Sum(x => x.ImportoDebito);
                            recordV.TotaleCreditoAltri = m.RigheAltriEnti.Sum(x => x.ImportoCredito);
                            recordV.SegnoSaldoAltri = recordV.TotaleDebitoAltri - recordV.TotaleCreditoAltri < 0 ? "N" : "P";
                            recordV.SaldoAltri = Math.Abs(recordV.TotaleDebitoAltri - recordV.TotaleCreditoAltri);
                        }

                        if (m.ImportoTotale > 0)
                        {
                            //recordV.SaldoFinaleF24 = m.ImportoTotale;
                            if (m.RigheErario.Count > 6)
                            {

                                recordV.SaldoFinaleF24 = (recordV.TotaleDebitoAltri + recordV.TotaleDebitoErario + recordV.TotaleDebitoImu + recordV.TotaleDebitoInail + recordV.TotaleDebitoInps + recordV.TotaleDebitoRegioni) -
                                (recordV.TotaleCreditoAltri + recordV.TotaleCreditoErario + recordV.TotaleCreditoImu + recordV.TotaleCreditoInail + recordV.TotaleCreditoInps + recordV.TotaleCreditoRegioni);

                            }
                            else
                            {
                                recordV.SaldoFinaleF24 = m.ImportoTotale;
                            }
                        }
                        else
                        {
                            recordV.SaldoFinaleF24 = 0;
                        }
                        recordV.DataVersamento = m.DataVersamento;
                        RecordVCum.Add(recordV);
                        i1 = i1 + 6;
                        h = m.RigheErario.Count - i1;
                    } while (i1 < m.RigheErario.Count);
                }
                else
                {
                    RecordV recordV = new RecordV();

                    recordV.CodiceFiscale = CbiUtils.RimuoviCaratteriNonConsigliati(m.Condominio.CodiceFiscale).SafeUpper();
                    recordV.Progressivo = i; ////?????????
                                             //RecordV.CodiceUfficio
                                             //RecordV.CodiceAtto

                    //Erario
                    if (m.RigheErario.Count > 0)
                    {
                        var r1 = m.RigheErario[0];
                        recordV.CodiceTributo1 = r1.CodiceTributo;
                        //recordV.NumeroCertificazione1 ?????
                        recordV.RateRegioneProv1 = r1.Rateazione;
                        recordV.AnnoRif1 = r1.AnnoRiferimento;
                        recordV.ImportoDebito1 = r1.ImportoDebito;
                        recordV.ImportoCredito1 = r1.ImportoCredito;
                    }

                    if (m.RigheErario.Count > 1)
                    {
                        var r2 = m.RigheErario[1];
                        recordV.CodiceTributo2 = r2.CodiceTributo;
                        //recordV.NumeroCertificazione1 ?????
                        recordV.RateRegioneProv2 = r2.Rateazione;
                        recordV.AnnoRif2 = r2.AnnoRiferimento;
                        recordV.ImportoDebito2 = r2.ImportoDebito;
                        recordV.ImportoCredito2 = r2.ImportoCredito;
                    }

                    if (m.RigheErario.Count > 2)
                    {
                        var r3 = m.RigheErario[2];
                        recordV.CodiceTributo3 = r3.CodiceTributo;
                        //recordV.NumeroCertificazione1 ?????
                        recordV.RateRegioneProv3 = r3.Rateazione;
                        recordV.AnnoRif3 = r3.AnnoRiferimento;
                        recordV.ImportoDebito3 = r3.ImportoDebito;
                        recordV.ImportoCredito3 = r3.ImportoCredito;
                    }

                    if (m.RigheErario.Count > 3)
                    {
                        var r4 = m.RigheErario[3];
                        recordV.CodiceTributo4 = r4.CodiceTributo;
                        //recordV.NumeroCertificazione1 ?????
                        recordV.RateRegioneProv4 = r4.Rateazione;
                        recordV.AnnoRif4 = r4.AnnoRiferimento;
                        recordV.ImportoDebito4 = r4.ImportoDebito;
                        recordV.ImportoCredito4 = r4.ImportoCredito;
                    }

                    if (m.RigheErario.Count > 4)
                    {
                        var r5 = m.RigheErario[4];
                        recordV.CodiceTributo5 = r5.CodiceTributo;
                        //recordV.NumeroCertificazione1 ?????
                        recordV.RateRegioneProv5 = r5.Rateazione;
                        recordV.AnnoRif5 = r5.AnnoRiferimento;
                        recordV.ImportoDebito5 = r5.ImportoDebito;
                        recordV.ImportoCredito5 = r5.ImportoCredito;
                    }

                    if (m.RigheErario.Count > 5)
                    {
                        var r6 = m.RigheErario[5];
                        recordV.CodiceTributo6 = r6.CodiceTributo;
                        //recordV.NumeroCertificazione1 ?????
                        recordV.RateRegioneProv6 = r6.Rateazione;
                        recordV.AnnoRif6 = r6.AnnoRiferimento;
                        recordV.ImportoDebito6 = r6.ImportoDebito;
                        recordV.ImportoCredito6 = r6.ImportoCredito;
                    }

                    if (m.RigheErario.Count > 0)
                    {
                        recordV.TotaleDebitoErario = m.RigheErario.Sum(x => x.ImportoDebito);
                        recordV.TotaleCreditoErario = m.RigheErario.Sum(x => x.ImportoCredito);
                        recordV.SegnoSaldoErario = recordV.TotaleDebitoErario - recordV.TotaleCreditoErario < 0 ? "N" : "P";
                        recordV.SaldoErario = Math.Abs(recordV.TotaleDebitoErario - recordV.TotaleCreditoErario);
                    }

                    //INPS
                    if (m.RigheInps.Count > 0)
                    {
                        var r1 = m.RigheInps[0];
                        recordV.CodiceSedeInps1 = r1.CodiceSede;
                        recordV.CausaleContributoInps1 = r1.CausaleTributo;
                        recordV.MatricolaInps1 = r1.MatricolaInps;
                        recordV.PeriodoDaInps1 = string.Format("{0}{1}", r1.MeseInizio, r1.AnnoInizio);
                        recordV.PeriodoAInps1 = string.Format("{0}{1}", r1.MeseFine, r1.AnnoFine);
                        recordV.ImportoDebitoInps1 = r1.ImportoDebito;
                        recordV.ImportoCreditoInps1 = r1.ImportoCredito;
                    }

                    if (m.RigheInps.Count > 1)
                    {
                        var r2 = m.RigheInps[1];
                        recordV.CodiceSedeInps2 = r2.CodiceSede;
                        recordV.CausaleContributoInps2 = r2.CausaleTributo;
                        recordV.MatricolaInps2 = r2.MatricolaInps;
                        recordV.PeriodoDaInps2 = string.Format("{0}{1}", r2.MeseInizio, r2.AnnoInizio);
                        recordV.PeriodoAInps2 = string.Format("{0}{1}", r2.MeseFine, r2.AnnoFine);
                        recordV.ImportoDebitoInps2 = r2.ImportoDebito;
                        recordV.ImportoCreditoInps2 = r2.ImportoCredito;
                    }

                    if (m.RigheInps.Count > 2)
                    {
                        var r3 = m.RigheInps[2];
                        recordV.CodiceSedeInps3 = r3.CodiceSede;
                        recordV.CausaleContributoInps3 = r3.CausaleTributo;
                        recordV.MatricolaInps3 = r3.MatricolaInps;
                        recordV.PeriodoDaInps3 = string.Format("{0}{1}", r3.MeseInizio, r3.AnnoInizio);
                        recordV.PeriodoAInps3 = string.Format("{0}{1}", r3.MeseFine, r3.AnnoFine);
                        recordV.ImportoDebitoInps3 = r3.ImportoDebito;
                        recordV.ImportoCreditoInps3 = r3.ImportoCredito;
                    }

                    if (m.RigheInps.Count > 3)
                    {
                        var r4 = m.RigheInps[3];
                        recordV.CodiceSedeInps4 = r4.CodiceSede;
                        recordV.CausaleContributoInps4 = r4.CausaleTributo;
                        recordV.MatricolaInps4 = r4.MatricolaInps;
                        recordV.PeriodoDaInps4 = string.Format("{0}{1}", r4.MeseInizio, r4.AnnoInizio);
                        recordV.PeriodoAInps4 = string.Format("{0}{1}", r4.MeseFine, r4.AnnoFine);
                        recordV.ImportoDebitoInps4 = r4.ImportoDebito;
                        recordV.ImportoCreditoInps4 = r4.ImportoCredito;
                    }


                    if (m.RigheInps.Count > 0)
                    {
                        recordV.TotaleDebitoInps = m.RigheInps.Sum(x => x.ImportoDebito);
                        recordV.TotaleCreditoInps = m.RigheInps.Sum(x => x.ImportoCredito);
                        recordV.SegnoSaldoInps = recordV.TotaleDebitoInps - recordV.TotaleCreditoInps < 0 ? "N" : "P";
                        recordV.SaldoInps = Math.Abs(recordV.TotaleDebitoInps - recordV.TotaleCreditoInps);
                    }
                    //Regioni
                    if (m.RigheRegione.Count > 0)
                    {
                        var r1 = m.RigheRegione[0];
                        recordV.CodiceRegione1 = r1.CodiceRegione;
                        recordV.CodiceTributoRegione1 = r1.CodiceTributo;
                        recordV.RateazioneRegione1 = r1.MeseRiferimento;
                        recordV.AnnoRifRegione1 = r1.AnnoRiferimento;
                        recordV.ImportoDebitoRegione1 = r1.ImportoDebito;
                        recordV.ImportoCreditoRegione1 = r1.ImportoCredito;
                    }

                    if (m.RigheRegione.Count > 1)
                    {
                        var r2 = m.RigheRegione[1];
                        recordV.CodiceRegione2 = r2.CodiceRegione;
                        recordV.CodiceTributoRegione2 = r2.CodiceTributo;
                        recordV.RateazioneRegione2 = r2.MeseRiferimento;
                        recordV.AnnoRifRegione2 = r2.AnnoRiferimento;
                        recordV.ImportoDebitoRegione2 = r2.ImportoDebito;
                        recordV.ImportoCreditoRegione2 = r2.ImportoCredito;
                    }

                    if (m.RigheRegione.Count > 2)
                    {
                        var r3 = m.RigheRegione[2];
                        recordV.CodiceRegione3 = r3.CodiceRegione;
                        recordV.CodiceTributoRegione3 = r3.CodiceTributo;
                        recordV.RateazioneRegione3 = r3.MeseRiferimento;
                        recordV.AnnoRifRegione3 = r3.AnnoRiferimento;
                        recordV.ImportoDebitoRegione3 = r3.ImportoDebito;
                        recordV.ImportoCreditoRegione3 = r3.ImportoCredito;
                    }

                    if (m.RigheRegione.Count > 3)
                    {
                        var r4 = m.RigheRegione[3];
                        recordV.CodiceRegione4 = r4.CodiceRegione;
                        recordV.CodiceTributoRegione4 = r4.CodiceTributo;
                        recordV.RateazioneRegione4 = r4.MeseRiferimento;
                        recordV.AnnoRifRegione4 = r4.AnnoRiferimento;
                        recordV.ImportoDebitoRegione4 = r4.ImportoDebito;
                        recordV.ImportoCreditoRegione4 = r4.ImportoCredito;
                    }


                    if (m.RigheRegione.Count > 0)
                    {
                        recordV.TotaleDebitoRegioni = m.RigheRegione.Sum(x => x.ImportoDebito);
                        recordV.TotaleCreditoRegioni = m.RigheRegione.Sum(x => x.ImportoCredito);
                        recordV.SegnoSaldoRegioni = recordV.TotaleDebitoRegioni - recordV.TotaleCreditoRegioni < 0 ? "N" : "P";
                        recordV.SaldoRegioni = Math.Abs(recordV.TotaleDebitoRegioni - recordV.TotaleCreditoRegioni);
                    }

                    //IMU
                    //recordV.IdentificativoImu = ????????
                    if (m.RigheIci.Count > 0)
                    {
                        var r1 = m.RigheIci[0];
                        recordV.CodiceEnteImu1 = r1.CodiceEnte;
                        recordV.FlagRavvImu1 = r1.Ravvedimento ? 1 : 0;
                        recordV.FlagImmobiliImu1 = r1.ImmobiliVariati ? 1 : 0;
                        recordV.FlagAccontoImu1 = r1.Acconto ? 1 : 0;
                        recordV.FlagSaldoImu1 = r1.Saldo ? 1 : 0;
                        recordV.NumeroImmobiliImu1 = r1.NumeroFabbricati;
                        recordV.DetrazioneAbitazioneImu1 = r1.DetrazioneIci;
                        recordV.CodiceTributoImu1 = r1.CodiceTributo;
                        recordV.RateazioneImu1 = r1.MeseRiferimento; //??????????
                        recordV.AnnoRifImu1 = r1.AnnoRiferimento;
                        recordV.ImportoDebitoImu1 = r1.ImportoDebito;
                        recordV.ImportoCreditoImu1 = r1.ImportoCredito;
                    }

                    if (m.RigheIci.Count > 1)
                    {
                        var r2 = m.RigheIci[1];
                        recordV.CodiceEnteImu2 = r2.CodiceEnte;
                        recordV.FlagRavvImu2 = r2.Ravvedimento ? 1 : 0;
                        recordV.FlagImmobiliImu2 = r2.ImmobiliVariati ? 1 : 0;
                        recordV.FlagAccontoImu2 = r2.Acconto ? 1 : 0;
                        recordV.FlagSaldoImu2 = r2.Saldo ? 1 : 0;
                        recordV.NumeroImmobiliImu2 = r2.NumeroFabbricati;
                        recordV.DetrazioneAbitazioneImu2 = r2.DetrazioneIci;
                        recordV.CodiceTributoImu2 = r2.CodiceTributo;
                        recordV.RateazioneImu2 = r2.MeseRiferimento; //??????????
                        recordV.AnnoRifImu2 = r2.AnnoRiferimento;
                        recordV.ImportoDebitoImu2 = r2.ImportoDebito;
                        recordV.ImportoCreditoImu2 = r2.ImportoCredito;
                    }

                    if (m.RigheIci.Count > 2)
                    {
                        var r3 = m.RigheIci[2];
                        recordV.CodiceEnteImu3 = r3.CodiceEnte;
                        recordV.FlagRavvImu3 = r3.Ravvedimento ? 1 : 0;
                        recordV.FlagImmobiliImu3 = r3.ImmobiliVariati ? 1 : 0;
                        recordV.FlagAccontoImu3 = r3.Acconto ? 1 : 0;
                        recordV.FlagSaldoImu3 = r3.Saldo ? 1 : 0;
                        recordV.NumeroImmobiliImu3 = r3.NumeroFabbricati;
                        recordV.DetrazioneAbitazioneImu3 = r3.DetrazioneIci;
                        recordV.CodiceTributoImu3 = r3.CodiceTributo;
                        recordV.RateazioneImu3 = r3.MeseRiferimento; //??????????
                        recordV.AnnoRifImu3 = r3.AnnoRiferimento;
                        recordV.ImportoDebitoImu3 = r3.ImportoDebito;
                        recordV.ImportoCreditoImu3 = r3.ImportoCredito;
                    }

                    if (m.RigheIci.Count > 3)
                    {
                        var r4 = m.RigheIci[3];
                        recordV.CodiceEnteImu4 = r4.CodiceEnte;
                        recordV.FlagRavvImu4 = r4.Ravvedimento ? 1 : 0;
                        recordV.FlagImmobiliImu4 = r4.ImmobiliVariati ? 1 : 0;
                        recordV.FlagAccontoImu4 = r4.Acconto ? 1 : 0;
                        recordV.FlagSaldoImu4 = r4.Saldo ? 1 : 0;
                        recordV.NumeroImmobiliImu4 = r4.NumeroFabbricati;
                        recordV.DetrazioneAbitazioneImu4 = r4.DetrazioneIci;
                        recordV.CodiceTributoImu4 = r4.CodiceTributo;
                        recordV.RateazioneImu4 = r4.MeseRiferimento; //??????????
                        recordV.AnnoRifImu4 = r4.AnnoRiferimento;
                        recordV.ImportoDebitoImu4 = r4.ImportoDebito;
                        recordV.ImportoCreditoImu4 = r4.ImportoCredito;
                    }

                    if (m.RigheIci.Count > 0)
                    {
                        recordV.TotaleDebitoImu = m.RigheIci.Sum(x => x.ImportoDebito);
                        recordV.TotaleCreditoImu = m.RigheIci.Sum(x => x.ImportoCredito);
                        recordV.SegnoSaldoImu = recordV.TotaleDebitoImu - recordV.TotaleCreditoImu < 0 ? "N" : "P";
                        recordV.SaldoImu = Math.Abs(recordV.TotaleDebitoImu - recordV.TotaleCreditoImu);
                    }
                    //INAIL
                    if (m.RigheInail.Count > 0)
                    {
                        var r1 = m.RigheInail[0];
                        recordV.CodiceSedeInail1 = r1.CodiceSede;
                        recordV.CodiceDittaInail1 = r1.PosizioneAssicurativa;
                        recordV.CodiceControlloDittaInail1 = r1.CodiceControllo;
                        recordV.NumeroRifInail1 = r1.NumeroRiferimento;
                        recordV.CausaleInail1 = r1.Causale;
                        recordV.ImportoDebitoInail1 = r1.ImportoDebito;
                        recordV.ImportoCreditoInail1 = r1.ImportoCredito;
                    }

                    if (m.RigheInail.Count > 1)
                    {
                        var r2 = m.RigheInail[1];
                        recordV.CodiceSedeInail2 = r2.CodiceSede;
                        recordV.CodiceDittaInail2 = r2.PosizioneAssicurativa;
                        recordV.CodiceControlloDittaInail2 = r2.CodiceControllo;
                        recordV.NumeroRifInail2 = r2.NumeroRiferimento;
                        recordV.CausaleInail2 = r2.Causale;
                        recordV.ImportoDebitoInail2 = r2.ImportoDebito;
                        recordV.ImportoCreditoInail2 = r2.ImportoCredito;
                    }

                    if (m.RigheInail.Count > 2)
                    {
                        var r3 = m.RigheInail[2];
                        recordV.CodiceSedeInail3 = r3.CodiceSede;
                        recordV.CodiceDittaInail3 = r3.PosizioneAssicurativa;
                        recordV.CodiceControlloDittaInail3 = r3.CodiceControllo;
                        recordV.NumeroRifInail3 = r3.NumeroRiferimento;
                        recordV.CausaleInail3 = r3.Causale;
                        recordV.ImportoDebitoInail3 = r3.ImportoDebito;
                        recordV.ImportoCreditoInail3 = r3.ImportoCredito;
                    }
                    if (m.RigheInail.Count > 0)
                    {
                        recordV.TotaleDebitoInail = m.RigheInail.Sum(x => x.ImportoDebito);
                        recordV.TotaleCreditoInail = m.RigheInail.Sum(x => x.ImportoCredito);
                        recordV.SegnoSaldoInail = recordV.TotaleDebitoInail - recordV.TotaleCreditoInail < 0 ? "N" : "P";
                        recordV.SaldoInail = Math.Abs(recordV.TotaleDebitoInail - recordV.TotaleCreditoInail);
                    }


                    //Altri

                    if (m.RigheAltriEnti.Count > 0)
                    {
                        recordV.CodiceEnteAltri = m.RigheAltriEnti[0].CodiceEnte;

                        var r1 = m.RigheAltriEnti[0];
                        recordV.CodiceSedeAltri1 = r1.CodiceSede;
                        recordV.CausaleContributoAltri1 = r1.CausaleTributo;
                        recordV.CodicePosizioneAltri1 = r1.CodicePosizione;
                        recordV.PeriodoRifDaAltri1 = string.Format("{0}{1}", r1.MeseInizio, r1.AnnoInizio);
                        recordV.PeriodoRifAAltri1 = string.Format("{0}{1}", r1.MeseFine, r1.AnnoFine);
                        recordV.ImportoDebitoInail1 = r1.ImportoDebito;
                        recordV.ImportoCreditoInail1 = r1.ImportoCredito;
                    }

                    if (m.RigheAltriEnti.Count > 1)
                    {
                        var r2 = m.RigheAltriEnti[1];
                        recordV.CodiceSedeAltri2 = r2.CodiceSede;
                        recordV.CausaleContributoAltri2 = r2.CausaleTributo;
                        recordV.CodicePosizioneAltri2 = r2.CodicePosizione;
                        recordV.PeriodoRifDaAltri2 = string.Format("{0}{1}", r2.MeseInizio, r2.AnnoInizio);
                        recordV.PeriodoRifAAltri2 = string.Format("{0}{1}", r2.MeseFine, r2.AnnoFine);
                        recordV.ImportoDebitoInail2 = r2.ImportoDebito;
                        recordV.ImportoCreditoInail2 = r2.ImportoCredito;
                    }

                    if (m.RigheAltriEnti.Count > 0)
                    {
                        recordV.TotaleDebitoAltri = m.RigheAltriEnti.Sum(x => x.ImportoDebito);
                        recordV.TotaleCreditoAltri = m.RigheAltriEnti.Sum(x => x.ImportoCredito);
                        recordV.SegnoSaldoAltri = recordV.TotaleDebitoAltri - recordV.TotaleCreditoAltri < 0 ? "N" : "P";
                        recordV.SaldoAltri = Math.Abs(recordV.TotaleDebitoAltri - recordV.TotaleCreditoAltri);
                    }

                    if (m.ImportoTotale > 0)
                    {
                        recordV.SaldoFinaleF24 = m.ImportoTotale;
                    }
                    else
                    {
                        recordV.SaldoFinaleF24 = 0;
                    }
                    recordV.DataVersamento = m.DataVersamento;
                    RecordVCum.Add(recordV);
                }

            }
            //RecordZ
            RecordZ.NumeroRecordV = RecordVCum.Count();
            RecordZ.NumeroRecordM = RecordMCum.Count().ToString();
            RecordA.Invii = RecordMCum.Count.ToString("000");
        }
        public void GeneraFile(string nomeFile)
        {
            FixedFileEngine engine = null;

            engine = new FixedFileEngine(typeof(RecordA));
            engine.WriteFile(nomeFile, new[] { RecordA });

            engine = new FixedFileEngine(typeof(RecordM));
            engine.AppendToFile(nomeFile, new[] { RecordM });
            if (RecordVCum.Count > 0)
            {
                for (int i = 0; i < RecordVCum.Count; i++)
                {
                    engine = new FixedFileEngine(typeof(RecordV));
                    engine.AppendToFile(nomeFile, new[] { RecordVCum[i] });
                }
            }
            else
            {
                engine = new FixedFileEngine(typeof(RecordV));
                engine.AppendToFile(nomeFile, new[] { RecordV });

            }
            engine = new FixedFileEngine(typeof(RecordZ));
            engine.AppendToFile(nomeFile, new[] { RecordZ });
        }
        public void GeneraFileIntermediario(string nomeFile)
        {
            FixedFileEngine engine = null;

            engine = new FixedFileEngine(typeof(RecordA));
            engine.WriteFile(nomeFile, new[] { RecordA });

            for (int i = 0; i < RecordMCum.Count; i++)
            {
                engine = new FixedFileEngine(typeof(RecordM));
                engine.AppendToFile(nomeFile, new[] { RecordMCum[i] });

                //engine = new FixedFileEngine(typeof(RecordV));
                //engine.AppendToFile(nomeFile, new[] { RecordVCum[i] });
                if (RecordVCum.Count > 0)
                {
                    for (int x = 0; x < RecordVCum.Count; x++)
                    {
                        if (RecordMCum[i].CodiceFiscale == RecordVCum[x].CodiceFiscale && 
                           Convert.ToInt32( RecordMCum[i].Progressivo) == Convert.ToInt32(RecordVCum[x].Progressivo))
                        {
                            //RecordVCum[x].Progressivo = RecordMCum[i].Progressivo;
                            engine = new FixedFileEngine(typeof(RecordV));
                            engine.AppendToFile(nomeFile, new[] { RecordVCum[x] });
                        }
                    }
                }
                else
                {
                    engine = new FixedFileEngine(typeof(RecordV));
                    engine.AppendToFile(nomeFile, new[] { RecordV });

                }
            }

            engine = new FixedFileEngine(typeof(RecordZ));
            engine.AppendToFile(nomeFile, new[] { RecordZ });
        }

    }
}
