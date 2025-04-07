import React, { JSX } from "react";

import { socialLinks } from "@/StaticData/Static";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

const iconsMap: Record<string, JSX.Element> = {
  TwitterOutlined: <Twitter className="text-xl" />,
  InstagramOutlined: <Instagram className="text-xl" />,
  LinkedinOutlined: <Linkedin className="text-xl" />,
};

const SocialLinks: React.FC = () => {
  return (
    <div className="flex space-x-4">
      {socialLinks.map(({ href, icon }) => (
        <a
          key={icon}
          href={href}
          className="hover:text-blue-400 transition-colors duration-300"
        >
          {iconsMap[icon]}
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;
