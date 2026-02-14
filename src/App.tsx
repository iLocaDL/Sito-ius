import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import SquadreIUS from './pages/SquadreIUS';
import Eventi from './pages/Eventi';
import Safeguarding from './pages/Safeguarding';
import ChiSiamo from './pages/ChiSiamo';
import Tornei from './pages/tornei';

function App() {
  const [currentPage, setCurrentPage] = useState('Home');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const renderPage = () => {
    const props = { searchQuery };

    switch (currentPage) {
      case 'Home':
        return <Home {...props} />;
      case 'Squadre IUS':
        return <SquadreIUS {...props} />;
      case 'Eventi':
        return <Eventi {...props} />;
      case 'Safeguarding':
        return <Safeguarding />;
      case 'Chi siamo?':
        return <ChiSiamo />;
      case 'Tornei':
        return <Tornei />;
      default:
        return <Home {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header currentPage={currentPage} onPageChange={setCurrentPage} onSearch={handleSearch} />
      <main className="flex-grow">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
}

export default App;
