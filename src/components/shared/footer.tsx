import { Facebook, Instagram, Twitter, Phone, Mail, MapPin, Heart } from 'lucide-react';

interface FooterProps {
  setCurrentPage: (page: string) => void;
}

export default function Footer({ setCurrentPage }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">MomCare Store</h3>
            <p className="text-sm text-gray-400 mb-4">
              Premium nutrition and care products for mothers and babies.
            </p>
            <div className="flex gap-3">
              <button className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <Facebook className="h-4 w-4" />
              </button>
              <button className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <Instagram className="h-4 w-4" />
              </button>
              <button className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <Twitter className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <button onClick={() => setCurrentPage("products")} className="hover:text-white">
                  Products
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage("blogs")} className="hover:text-white">
                  Blogs
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage("preorder")} className="hover:text-white">
                  Pre-Orders
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage("loyalty")} className="hover:text-white">
                  Rewards Program
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <button className="hover:text-white">FAQ</button>
              </li>
              <li>
                <button className="hover:text-white">Shipping Info</button>
              </li>
              <li>
                <button className="hover:text-white">Returns & Refunds</button>
              </li>
              <li>
                <button className="hover:text-white">Terms & Conditions</button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>+ 86231706 (24/7)</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>momcare@gmail.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>FPT University, District 9, Ho Chi Minh City</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © 2026 MomCare Store. All rights reserved. Made with{" "}
            <Heart className="inline h-4 w-4 text-pink-500 fill-pink-500" /> for mothers and babies.
          </p>
        </div>
      </div>
    </footer>
  );
}
