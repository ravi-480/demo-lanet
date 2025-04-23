const Footer = () => {
  return (
    <footer className="w-full min-h-[80px] bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center md:text-left mb-8">
          <h3 className="text-2xl font-semibold mb-2">EventWise</h3>
          <p className="text-gray-400 max-w-md mx-auto md:mx-0">
            Your complete event planning solution. Create, organize, and manage
            events with ease.
          </p>
        </div>

        <div className="border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} EventWise. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
