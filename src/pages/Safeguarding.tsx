export default function Safeguarding() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-[#766648] mb-8 text-center">Safeguarding</h1>

      <div className="bg-white rounded-lg shadow-lg border-2 border-[#bfa13f] p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#766648] mb-4">
            Politica di Tutela dei Minori
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            IUS ASD è impegnata a garantire la sicurezza e il benessere di tutti i bambini e giovani
            che partecipano alle nostre attività sportive. La nostra politica di safeguarding
            stabilisce le linee guida e le procedure per proteggere i minori da qualsiasi forma di
            abuso o negligenza.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 border-2 border-[#bfa13f] mb-6">
          <h3 className="text-xl font-bold text-[#766648] mb-4">Principi Fondamentali</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-[#bfa13f] font-bold">•</span>
              <span>
                Il benessere del bambino è sempre la nostra priorità assoluta
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#bfa13f] font-bold">•</span>
              <span>
                Tutti i bambini hanno il diritto di essere protetti da abusi e maltrattamenti
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#bfa13f] font-bold">•</span>
              <span>
                Ogni membro dello staff e volontario deve seguire il nostro codice di condotta
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#bfa13f] font-bold">•</span>
              <span>
                Promuoviamo un ambiente inclusivo e rispettoso per tutti
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#bfa13f] font-bold">•</span>
              <span>
                Forniamo formazione regolare a tutto il personale sulla tutela dei minori
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 border-2 border-[#bfa13f] mb-6">
          <h3 className="text-xl font-bold text-[#766648] mb-4">Procedure di Segnalazione</h3>
          <p className="text-gray-700 mb-3">
            Se hai preoccupazioni riguardo alla sicurezza di un bambino o giovane:
          </p>
          <ol className="space-y-2 text-gray-700 ml-4">
            <li>1. Contatta immediatamente il Responsabile Safeguarding</li>
            <li>2. Documenta i dettagli della tua preoccupazione</li>
            <li>3. Non affrontare direttamente la persona coinvolta</li>
            <li>4. Mantieni la confidenzialità</li>
          </ol>
        </div>

        <div className="bg-[#bfa13f] rounded-lg p-6 text-center">
          <h3 className="text-xl font-bold text-[#766648] mb-3">
            Contatto Responsabile Safeguarding
          </h3>
          <p className="text-[#766648] font-semibold">Email: safeguarding@iusasd.it</p>
          <p className="text-[#766648] font-semibold">Tel: +39 123 456 7890</p>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 italic">
            Documento completo disponibile su richiesta presso la segreteria
          </p>
        </div>
      </div>
    </div>
  );
}
