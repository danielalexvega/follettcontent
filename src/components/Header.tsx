"use client";
import { useEffect, useState } from "react";


import Navigation from "./Navigation";
import Container from "./Container";


export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  return (
    <header className="bg-[#04559e]">
      <Container>
        <div className="max-w-[1450px] mx-auto px-4 py-6">
          <div className="flex justify-center items-center">
            <img
              src="/homepagead.jpeg"
              alt="AS LOW AS $10.99! PREORDER BEFORE OCTOBER 20. Diary of a Wimpy Kid Party Pooper and Dog Man Big Jim Believes"
              className="max-w-[970px] w-full h-auto"
            />
          </div>
        </div>
      </Container>

      {/* Bottom section - Navigation bar */}
      <div className="bg-transparent">
        <Container className={`max-w-[1420px] fixed z-50 transition-all duration-300 left-0 right-0 
          ${scrolled ? "top-[43px]" : "top-[195px]"}`}>
          <div className="py-3">
            <Navigation />
          </div>
        </Container>
      </div>
    </header>
  );
};
