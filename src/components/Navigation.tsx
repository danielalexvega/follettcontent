import { FC } from "react";
import { NavLink, useSearchParams } from "react-router";
import { createClient } from "../utils/client";
import { CollectionCodenames, LandingPage, LanguageCodenames } from "../model";
import { DeliveryError } from "@kontent-ai/delivery-sdk";
import { useSuspenseQueries } from "@tanstack/react-query";
import { useAppContext } from "../context/AppContext";
import { createPreviewLink } from "../utils/link";

const Navigation: FC = () => {
  const { environmentId, apiKey, collection } = useAppContext();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";

  const lang = searchParams.get("lang");
  const collectionParam = searchParams.get("collection")
  const collectionFilter = collectionParam ?? collection ?? "patient_resources";

  const [navigation] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["navigation"],
        queryFn: () =>
          createClient(environmentId, apiKey, isPreview)
            .items<LandingPage>()
            .type("landing_page")
            .limitParameter(1)
            .languageParameter((lang ?? "default") as LanguageCodenames)
            .collections([collectionFilter as CollectionCodenames])
            .toPromise()
            .then(res => res.data.items[0]?.elements.subpages.linkedItems.map(subpage => ({
              name: subpage.elements.headline.value,
              link: subpage.elements.url.value,
            })))
            .catch((err) => {
              if (err instanceof DeliveryError) {
                return null;
              }
              throw err;
            }),
      },
    ],
  });

  const createMenuLink = (name: string, link: string) => (
    <li key={name}>
      <NavLink 
        to={createPreviewLink(link, isPreview)} 
        className="text-black text-base hover:text-follettblue transition-colors duration-200"
      >
        {name}
      </NavLink>
    </li>
  );

  // Fallback navigation items if CMS data is not available
  const fallbackNavItems = [
    { name: "Titlewave Bookstore", link: "/titlewave" },
    { name: "Book eFairs", link: "/book-fairs" },
    { name: "School Libraries", link: "/school-libraries" },
    { name: "Classroom & Curriculum", link: "/classroom" },
    { name: "K12 Resources", link: "/k12-resources" },
    { name: "Contact Us", link: "/contact" },
  ];

  const navItems = navigation.data && navigation.data.length > 0 ? navigation.data : fallbackNavItems;

  return (
    <nav className="bg-[rgba(85,85,85,0.25)] rounded-[50px] px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center">
        <img 
          src="/Follett-Content-white.png" 
          alt="Follett Content"
          className="h-8 w-auto"
        />
      </div>

      {/* Navigation Items Container */}
      <div>
        <menu className="flex flex-wrap gap-8 items-center list-none bg-white p-4 rounded-[50px] text-black">
          {
            navItems.map(({ name, link }) => createMenuLink(name, link))
          }
        </menu>
      </div>
    </nav>
  );
};

export default Navigation;
