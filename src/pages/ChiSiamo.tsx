import { Target, Users, Heart, Trophy } from 'lucide-react';

export default function ChiSiamo() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-[#766648] mb-8 text-center">Chi Siamo</h1>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg border-2 border-[#bfa13f] overflow-hidden mb-8">
          <div className="flex flex-col items-center p-8">
            <img
              src="https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop"
              alt="Logo IUS ASD"
              className="h-48 w-48 object-contain mb-6"
            />
            <h2 className="text-3xl font-bold text-[#766648] mb-4 text-center">IUS ASD</h2>
            <p className="text-gray-700 leading-relaxed text-lg text-center max-w-2xl">
              IUS ASD è un'associazione sportiva dilettantistica fondata con la passione per il
              calcio e l'impegno nel formare giovani atleti. La nostra missione è promuovere i
              valori dello sport, della lealtà e del rispetto attraverso il gioco del calcio.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg border-2 border-[#bfa13f] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#bfa13f] p-3 rounded-full">
                <Target className="text-[#766648]" size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#766648]">La Nostra Missione</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Promuovere lo sport come strumento di crescita personale e sociale, creando
              opportunità per tutti di praticare il calcio in un ambiente sano e inclusivo.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg border-2 border-[#bfa13f] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#bfa13f] p-3 rounded-full">
                <Users className="text-[#766648]" size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#766648]">La Nostra Comunità</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Siamo una grande famiglia composta da tre squadre: due di calcio a 7 e una giovanile.
              Ogni squadra è parte integrante della nostra comunità sportiva.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg border-2 border-[#bfa13f] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#bfa13f] p-3 rounded-full">
                <Heart className="text-[#766648]" size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#766648]">I Nostri Valori</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Rispetto, lealtà, spirito di squadra e dedizione sono i pilastri su cui costruiamo
              ogni giorno la nostra identità sportiva e sociale.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg border-2 border-[#bfa13f] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#bfa13f] p-3 rounded-full">
                <Trophy className="text-[#766648]" size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#766648]">I Nostri Obiettivi</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Formare atleti completi, non solo dal punto di vista tecnico ma anche umano,
              promuovendo lo sport come veicolo di educazione e crescita.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg border-2 border-[#bfa13f] p-8">
          <h3 className="text-2xl font-bold text-[#766648] mb-4 text-center">La Nostra Storia</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Fondata da un gruppo di appassionati di calcio, IUS ASD è cresciuta negli anni
            diventando un punto di riferimento per la comunità locale. Dalle prime partite amatoriali
            ai campionati organizzati, la nostra associazione ha sempre mantenuto viva la passione
            per lo sport e l'attenzione verso i valori fondamentali del calcio.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Oggi contiamo tre squadre attive che partecipano a diversi campionati e tornei,
            rappresentando con orgoglio i colori oro e nero di IUS ASD. Il nostro impegno è rivolto
            non solo alla competizione sportiva, ma soprattutto alla formazione di giovani atleti che
            possano crescere come persone prima ancora che come giocatori.
          </p>
        </div>
      </div>
    </div>
  );
}
