using System;
using CedHouseSuite.Common;
using CedHouseSuite.Core.Logging;
using FileHelpers;

namespace CedHouseSuite.Tracciati.TD896.Ricezione
{
    public sealed class Tracciato896
    {
        private static ILog Log = LogProvider.GetCurrentClassLogger();

        public object[] LeggiFile(string nomeFile)
        {
            try
            {
                MultiRecordEngine engine;
                engine = new MultiRecordEngine(typeof(Record896), typeof(Record999));
                engine.RecordSelector = new RecordTypeSelector(CustomSelector);
                object[] res = engine.ReadFile(nomeFile);
                return res;
            } catch(Exception ex)
            {
                Log.InfoFormat("ERRORE: {0}", ex.Message);
                return null;
            }
        }

        private static Type CustomSelector(MultiRecordEngine engine, string record)
        {
            Log.InfoFormat("Riga = {0}", engine.LineNumber);

            if (record.Length < 33)
            {
                throw new Exception("File non conforme!");
            }

            switch(record.Substring(33,3))
            {
                case "896":
                case "247":
                case "674":
                case "451":
                case "123":
                    return typeof(Record896);
                case "999":
                    return typeof(Record999);
                default:
                    throw new Exception("File non conforme!");
            }
        }
    }
}
