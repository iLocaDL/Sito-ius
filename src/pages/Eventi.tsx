import { Calendar, MapPin } from 'lucide-react';
import { Event } from '../types';

const events: Event[] = [
  {
    id: '1',
    title: 'Torneo di Beneficenza Natale 2025',
    date: '2025-12-15',
    description:
      'Grande torneo di beneficenza per raccogliere fondi per le famiglie bisognose del quartiere. Tutte le squadre sono invitate a partecipare. Sarà una giornata di sport, solidarietà e divertimento per tutta la famiglia.',
  },
  {
    id: '2',
    title: 'Festa di Fine Stagione',
    date: '2026-06-20',
    description:
      'Celebrazione della fine della stagione sportiva con premiazioni, cena sociale e intrattenimento. Un momento per festeggiare insieme tutti i successi raggiunti durante l\'anno.',
  },
  {
    id: '3',
    title: 'Open Day - Iscrizioni Nuova Stagione',
    date: '2026-09-01',
    description:
      'Giornata porte aperte per conoscere le nostre squadre e iscriversi alla nuova stagione sportiva. Prova gratuita per tutti i nuovi tesserati. Venite a scoprire la grande famiglia IUS ASD!',
  },
  {
    id: '4',
    title: 'Torneo Amichevole Intersquadre',
    date: '2025-12-28',
    description:
      'Torneo amichevole tra le nostre squadre e le squadre amiche della zona. Una bella occasione per confrontarsi in un clima di sana competizione e amicizia sportiva.',
  },
  {
    id: '5',
    title: 'Clinic di Formazione per Allenatori',
    date: '2026-01-10',
    description:
      'Sessione formativa dedicata agli allenatori e agli aspiranti tecnici. Verranno trattate nuove metodologie di allenamento e tattiche di gioco moderne. Relatori esperti del settore.',
  },
];

interface EventiProps {
  searchQuery?: string;
}

export default function Eventi({ searchQuery }: EventiProps) {
  const filteredEvents = searchQuery
    ? events.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : events;

  const sortedEvents = [...filteredEvents].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-[#766648] mb-8 text-center">Eventi IUS ASD</h1>

      {searchQuery && (
        <p className="text-[#766648] mb-6 text-center">
          Risultati per: <span className="font-bold">"{searchQuery}"</span>
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedEvents.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-lg shadow-lg border-2 border-[#bfa13f] overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className="bg-[#bfa13f] p-4">
              <h2 className="text-xl font-bold text-[#766648] mb-2">{event.title}</h2>
              <div className="flex items-center gap-2 text-[#766648]">
                <Calendar size={18} />
                <span className="font-semibold">
                  {new Date(event.date).toLocaleDateString('it-IT', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
            <div className="p-4">
              <p className="text-gray-700 leading-relaxed">{event.description}</p>
            </div>
          </div>
        ))}
      </div>

      {sortedEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">Nessun evento trovato.</p>
        </div>
      )}
    </div>
  );
}
