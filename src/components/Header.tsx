import { useLocation, useSearchParams } from "react-router-dom";
import IconSpain from "../icons/IconSpain";
import IconUnitedStates from "../icons/IconUnitedStates";
import Container from "./Container";
import Logo from "./Logo";
import Navigation from "./Navigation";
import { IconButton } from "../icons/IconButton";

const Header: React.FC = () => {
  const location = useLocation();
  const isResearchPage = location.pathname.match(/^\/research\/[\w-]+$/);
  const [searchParams, setSearchParams] = useSearchParams();
  const lang = searchParams.get("lang");

  return (
    <header className="bg-white">
      {/* Top section - Logo area */}
      <Container>
        <div className="py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Logo />
          </div>
          {isResearchPage && (
            <div className="flex gap-2 items-center">
              <IconButton
                icon={
                  <IconUnitedStates
                    className={`hover:cursor-pointer hover:scale-110`}
                  />
                }
                isSelected={lang === "en-US" || lang === null}
                onClick={() =>
                  setSearchParams(prev => {
                    prev.delete("lang");
                    return prev;
                  })}
              />
              <IconButton
                icon={
                  <IconSpain
                    className={`hover:cursor-pointer hover:scale-110`}
                  />
                }
                isSelected={lang === "es-ES"}
                onClick={() => {
                  setSearchParams(prev => {
                    prev.set("lang", "es-ES");
                    return prev;
                  });
                }}
              />
            </div>
          )}
        </div>
      </Container>
      
      {/* Bottom section - Navigation bar */}
      <div className="bg-[#004f87]">
        <Container>
          <div className="py-3">
            <Navigation />
          </div>
        </Container>
      </div>
    </header>
  );
};

export default Header;
