import { Search, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onSearch: (query: string) => void;
}

export default function Header({ currentPage, onPageChange, onSearch }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const pages = ['Home', 'Squadre IUS', 'Eventi', 'Safeguarding', 'Chi siamo?', 'Tornei'];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center">
          <img
            src="https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop"
            alt="IUS ASD Logo"
            className="h-32 w-32 object-contain mb-4"
          />

          <nav className="w-full relative">
            <div className="hidden md:flex bg-[#bfa13f] border-4 border-[#766648] rounded-lg overflow-hidden">
              {pages.map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`flex-1 py-4 px-6 text-[#766648] font-bold text-lg transition-colors border-r-2 border-[#766648] last:border-r-0 ${
                    currentPage === page ? 'bg-[#766648] text-[#bfa13f]' : 'hover:bg-[#d4b961]'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden w-full bg-[#bfa13f] border-4 border-[#766648] rounded-lg py-4 px-6 flex items-center justify-between"
            >
              <span className="text-[#766648] font-bold text-lg">{currentPage}</span>
              {isMenuOpen ? <X className="text-[#766648]" /> : <Menu className="text-[#766648]" />}
            </button>

            {isMenuOpen && (
              <div className="md:hidden absolute top-full left-0 right-0 mt-2 bg-[#bfa13f] border-4 border-[#766648] rounded-lg overflow-hidden z-50">
                {pages.map((page) => (
                  <button
                    key={page}
                    onClick={() => {
                      onPageChange(page);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full py-4 px-6 text-[#766648] font-bold text-lg transition-colors border-b-2 border-[#766648] last:border-b-0 ${
                      currentPage === page ? 'bg-[#766648] text-[#bfa13f]' : 'hover:bg-[#d4b961]'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}

            <div className="absolute top-0 right-0 -translate-y-full mb-2">
              {showSearch ? (
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cerca..."
                    className="px-4 py-2 border-2 border-[#766648] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bfa13f]"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowSearch(false)}
                    className="p-2 bg-[#766648] text-[#bfa13f] rounded-lg hover:bg-[#5a4e36] transition-colors"
                  >
                    <X size={20} />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="p-2 bg-[#bfa13f] border-2 border-[#766648] text-[#766648] rounded-lg hover:bg-[#d4b961] transition-colors"
                >
                  <Search size={20} />
                </button>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
