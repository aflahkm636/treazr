import React from "react";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-6 px-4 sm:py-8 sm:px-6 md:px-12">
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                {/* Logo and Description */}
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-emerald-400">Treazr</h2>
                    <p className="mt-2 text-gray-400 text-xs sm:text-sm">
                        Your trusted hub for premium collectibles, toys, comics & more.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2">Quick Links</h3>
                    <ul className="space-y-1 text-xs sm:text-sm text-gray-400">
                        <li>
                            <Link to="/" className="hover:text-white">
                                Home
                            </Link>
                        </li>
                        <a href="#categories" className="hover:text-white">
                            Categories
                        </a>
                        <li>
                            <Link to="/top-rated" className="hover:text-white">
                                Top Rated
                            </Link>
                        </li>
                        <li>
                            <Link to="/footer" className="hover:text-white">
                                Contact
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Social Links */}
                <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2">Follow Us</h3>
                    <div className="flex space-x-3 sm:space-x-4 mt-2">
                        <a href="#" className="hover:text-emerald-400">
                            <Facebook size={18} />
                        </a>
                        <a href="#" className="hover:text-emerald-400">
                            <Instagram size={18} />
                        </a>
                        <a href="#" className="hover:text-emerald-400">
                            <Twitter size={18} />
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom Note */}
            <div className="text-center mt-8 text-xs sm:text-sm text-gray-500 border-t border-gray-700 pt-4">
                © {new Date().getFullYear()} Treazr. All rights reserved.
            </div>
        </footer>
    );
}

export default Footer;
