import React from "react";
import { NavLink, useSearchParams } from "react-router";
import { createPreviewLink } from "../utils/link";

interface ButtonLinkProps {
  href: string;
  children: React.ReactNode;
  style?: "azure" | "transparent";
  className?: string;
}

const ButtonLink: React.FC<ButtonLinkProps> = ({ href, children, style = "transparent", className = "" }) => {
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";

  return (
    <NavLink
      to={createPreviewLink(href, isPreview)}
      className={`${
        style === "azure" ? "button-azure" : ""
      } inline-block w-fit px-16 py-3 text-body-lg font-semibold text-button-text-color ${className}`}
    >
      {children}
    </NavLink>
  );
};

export default ButtonLink;
