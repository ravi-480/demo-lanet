const Footer = () => {
  
  return (
    <footer className="w-full min-h-[80px] bg-gray-800 text-white">
       

        <div className="border-t border-gray-700 pt-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} EventWise. All rights reserved.
        </div>
    </footer>
  );
};

export default Footer;
