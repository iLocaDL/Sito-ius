import { Mail, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#766648] text-[#bfa13f] py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <Mail size={20} />
              <span className="font-semibold">Contatti:</span>
            </div>
            <a href="mailto:info@iusasd.it" className="hover:text-white transition-colors">
              info@iusasd.it
            </a>
          </div>

          <div className="text-center">
            <p className="font-semibold mb-3">Sponsor</p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white text-[#766648] px-4 py-2 rounded font-bold text-sm">
                Sponsor 1
              </div>
              <div className="bg-white text-[#766648] px-4 py-2 rounded font-bold text-sm">
                Sponsor 2
              </div>
              <div className="bg-white text-[#766648] px-4 py-2 rounded font-bold text-sm">
                Sponsor 3
              </div>
            </div>
          </div>

          <div className="text-center md:text-right">
            <p className="font-semibold mb-3">Seguici</p>
            <div className="flex justify-center md:justify-end gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                <Facebook size={24} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                <Instagram size={24} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                <Twitter size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#bfa13f] text-center text-sm">
          <p>&copy; {new Date().getFullYear()} IUS ASD. Tutti i diritti riservati.</p>
        </div>
      </div>
    </footer>
  );
}
