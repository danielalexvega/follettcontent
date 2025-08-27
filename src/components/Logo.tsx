import { FC } from "react";
import { Link } from "react-router-dom";

const Logo: FC = () => (
  <Link to="/">
    <div className="flex gap-4 items-center">
      <img 
        src="/bcbsa.svg" 
        alt="BCBSA Logo" 
        className="w-16 h-auto sm:w-24 md:w-32 lg:w-48 xl:w-[300px] object-contain"
      />
    </div>
  </Link>
);

export default Logo;