import { FC } from "react";
import { Link } from "react-router-dom";

const Logo: FC = () => (
  <Link to="/">
    <div className="flex gap-4 items-center">
      <img 
        src="/Follett-Content-white.png" 
        alt="Follett Content Logo" 
        className="h-8 w-auto object-contain"
      />
    </div>
  </Link>
);

export default Logo;