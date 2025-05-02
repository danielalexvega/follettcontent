import { FC } from "react";
import { NavLink, useSearchParams } from "react-router";
import { createClient } from "../utils/client";
import { LandingPage, LanguageCodenames } from "../model";
import { DeliveryError } from "@kontent-ai/delivery-sdk";
import { useSuspenseQueries } from "@tanstack/react-query";
import { useAppContext } from "../context/AppContext";

const Navigation: FC = () => {
  const { environmentId, apiKey } = useAppContext();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";

  const lang = searchParams.get("lang");

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
      <NavLink to={link} className="text-xl leading-5 text-gray w-fit block hover:text-burgundy">{name}</NavLink>
    </li>
  );

  return (
    <nav>
      <menu className="flex flex-col lg:flex-row gap-5 lg:gap-[60px] items-center list-none">
        {/* {createMenuLink("Home", createPreviewLink(envId ? `/envid/${envId}` : "/", isPreview))}
        {createMenuLink("Services", createPreviewLink(envId ? `/envid/${envId}/services` : "/services", isPreview))}
        {createMenuLink("Our Team", createPreviewLink(envId ? `/envid/${envId}/our-team` : "/our-team", isPreview))}
        {createMenuLink("Research", createPreviewLink(envId ? `/envid/${envId}/research` : "/research", isPreview))}
        {createMenuLink("Blog", createPreviewLink(envId ? `/envid/${envId}/blog` : "/blog", isPreview))}
         */}
        {
          navigation.data?.map(({ name, link }) => createMenuLink(name, link))
        }
      </menu>
    </nav>
  );
};

export default Navigation;
