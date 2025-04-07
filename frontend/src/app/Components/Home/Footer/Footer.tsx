import React from "react";

import {
  Facebook,
  Home,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  Twitter,
} from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-gray-800 text-white">
      <div className="container mx-auto py-10 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="flex flex-col">
            <h3 className="text-xl font-bold mb-4">EventWise</h3>
            <p className="mb-4">
              Your complete event planning solution. Create, organize, and
              manage events with ease.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="hover:text-blue-400 transition-colors duration-300"
              >
                <Facebook className="text-xl" />
              </a>
              <a
                href="#"
                className="hover:text-blue-400 transition-colors duration-300"
              >
                <Twitter className="text-xl" />
              </a>
              <a
                href="#"
                className="hover:text-blue-400 transition-colors duration-300"
              >
                <Instagram className="text-xl" />
              </a>
              <a
                href="#"
                className="hover:text-blue-400 transition-colors duration-300"
              >
                <Linkedin className="text-xl" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col">
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="hover:text-blue-400 transition-colors duration-300"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-blue-400 transition-colors duration-300"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-blue-400 transition-colors duration-300"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-blue-400 transition-colors duration-300"
                >
                  Testimonials
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-blue-400 transition-colors duration-300"
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="flex flex-col">
            <h3 className="text-xl font-bold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="hover:text-blue-400 transition-colors duration-300"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-blue-400 transition-colors duration-300"
                >
                  Community
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-blue-400 transition-colors duration-300"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-blue-400 transition-colors duration-300"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-blue-400 transition-colors duration-300"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col">
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Mail className="mr-2" />
                <a
                  href="mailto:info@eventwise.com"
                  className="hover:text-blue-400 transition-colors duration-300"
                >
                  info@eventwise.com
                </a>
              </li>
              <li className="flex items-center">
                <Phone className="mr-2" />
                <a
                  href="tel:+18001234567"
                  className="hover:text-blue-400 transition-colors duration-300"
                >
                  +1 (800) 123-4567
                </a>
              </li>
              <li className="flex items-center">
                <Home className="mr-2" />
                <span>
                  123 Event Street, Suite 200
                  <br />
                  San Francisco, CA 94107
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-10 border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h4 className="text-lg font-bold mb-2">
                Subscribe to our Newsletter
              </h4>
              <p className="text-gray-400">
                Stay updated with the latest features and releases
              </p>
            </div>
            <div className="flex w-full md:w-1/3">
              <input
                type="email"
                placeholder="Your email address"
                className="p-2 rounded-l w-full text-gray-800 focus:outline-none"
              />
              <button className="bg-blue-600 hover:bg-blue-700 transition-colors duration-300 px-4 py-2 rounded-r">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center text-gray-400">
          <p>© {new Date().getFullYear()} EventWise. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
