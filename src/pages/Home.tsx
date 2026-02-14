import { News } from '../types';

const mockNews: News[] = [
  {
    id: '1',
    title: 'Vittoria straordinaria contro TorreBoldoneE',
    date: '2025-11-22',
    content: 'La squadra IUS A ha conquistato una vittoria straordinaria con un punteggio di 4-2. Sono stati massacrati + gol di Arigo alla mctomonay in girata spettacolo',
    image: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: '2',
    title: 'Nuovo allenatore per la squadra Juniores',
    date: '2025-11-28',
    content: 'Siamo lieti di annunciare l\'arrivo di Coach Addo ELE che guiderà la nostra squadra di bambini. Con oltre 15 anni di esperienza, si è proposto per farli finalmente vincere',
    image: 'https://images.pexels.com/photos/260024/pexels-photo-260024.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: '3',
    title: 'Batosta IUS B',
    date: '2025-11-30',
    content: 'Non cè più competizione oramai, la ius B crolla e la IUS A si trova sotto solo di 6 punti. Attenzione al Mister che potrebbe essere mandato via.',
    image: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=800'
  }
];

interface HomeProps {
  searchQuery?: string;
}

export default function Home({ searchQuery }: HomeProps) {
  const filteredNews = searchQuery
    ? mockNews.filter(
        (news) =>
          news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          news.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockNews;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-[#766648] mb-8 text-center">Notizie IUS ASD</h1>

      {searchQuery && (
        <p className="text-[#766648] mb-6 text-center">
          Risultati per: <span className="font-bold">"{searchQuery}"</span>
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredNews.map((news) => (
          <article
            key={news.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-[#bfa13f] hover:shadow-xl transition-shadow"
          >
            {news.image && (
              <img
                src={news.image}
                alt={news.title}
                className="w-full h-64 object-cover"
              />
            )}
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[#bfa13f] font-semibold">
                  {new Date(news.date).toLocaleDateString('it-IT', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-[#766648] mb-3">{news.title}</h2>
              <p className="text-gray-700 leading-relaxed">{news.content}</p>
            </div>
          </article>
        ))}
      </div>

      {filteredNews.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">Nessuna notizia trovata.</p>
        </div>
      )}
    </div>
  );
}
