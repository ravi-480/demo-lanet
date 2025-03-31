import React, { JSX } from "react";
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  LinkedinOutlined,
} from "@ant-design/icons";
import { socialLinks } from "@/StaticData/Static";


const iconsMap: Record<string, JSX.Element> = {
  FacebookOutlined: <FacebookOutlined className="text-xl" />,
  TwitterOutlined: <TwitterOutlined className="text-xl" />,
  InstagramOutlined: <InstagramOutlined className="text-xl" />,
  LinkedinOutlined: <LinkedinOutlined className="text-xl" />,
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
