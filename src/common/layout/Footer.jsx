import React from "react";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="bg-gray-900 text-white pt-10 pb-6 px-4 sm:px-6 md:px-12">
            <div className="max-w-7xl mx-auto rounded-2xl shadow-md border border-gray-800 bg-gray-950 p-6 sm:p-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {/* Logo and Description */}
                <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-emerald-400">Treazr</h2>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Your trusted hub for premium collectibles, toys, comics & more.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                                Home
                            </Link>
                        </li>
                        <li>
                            <a href="#categories" className="text-gray-400 hover:text-white transition-colors">
                                Categories
                            </a>
                        </li>
                        <li>
                            <Link to="/top-rated" className="text-gray-400 hover:text-white transition-colors">
                                Top Rated
                            </Link>
                        </li>
                        <li>
                            <Link to="/footer" className="text-gray-400 hover:text-white transition-colors">
                                Contact
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Social Links */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
                    <div className="flex space-x-4">
                        <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-emerald-400 transition-colors">
                            <Facebook size={20} />
                        </a>
                        <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-emerald-400 transition-colors">
                            <Instagram size={20} />
                        </a>
                        <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-emerald-400 transition-colors">
                            <Twitter size={20} />
                        </a>
                    </div>
                </div>
            </div>

            {/* Divider and Bottom Note */}
            <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-gray-800 text-center text-xs text-gray-500">
                © {new Date().getFullYear()} Treazr. All rights reserved.
            </div>
        </footer>
    );
}

export default Footer;
