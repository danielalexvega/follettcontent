import { DeliveryError } from "@kontent-ai/delivery-sdk";
import HeroImage from "../components/HeroImage";
import PageContent from "../components/PageContent";
import PageSection from "../components/PageSection";
import "../index.css";
import { LanguageCodenames, type LandingPage } from "../model";
import { createClient } from "../utils/client";
import { FC, useCallback } from "react";
import { useAppContext } from "../context/AppContext";
import { Replace } from "../utils/types";
import FeaturedContent from "../components/landingPage/FeaturedContent";
import { useSearchParams } from "react-router-dom";
import { useCustomRefresh, useLivePreview } from "../context/SmartLinkContext";
import { IRefreshMessageData, IRefreshMessageMetadata, IUpdateMessageData, applyUpdateOnItemAndLoadLinkedItems } from "@kontent-ai/smart-link";
import { useQuery } from "@tanstack/react-query";

const LandingPage: FC = () => {
  const { environmentId, apiKey } = useAppContext();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const lang = searchParams.get("lang");

  const { data: landingPage, refetch } = useQuery({
    queryKey: ["landing_page", environmentId, apiKey, isPreview, lang],
    queryFn: () =>
      createClient(environmentId, apiKey, isPreview)
        .items()
        .type("landing_page")
        .limitParameter(1)
        .languageParameter((lang ?? "default") as LanguageCodenames)
        .toPromise()
        .then(res =>
          res.data.items[0] as Replace<LandingPage, { elements: Partial<LandingPage["elements"]> }> ?? null
        )
        .catch((err) => {
          if (err instanceof DeliveryError) {
            return null;
          }
          throw err;
        }),
  });

  const handleLiveUpdate = useCallback((data: IUpdateMessageData) => {
    if (landingPage && data.item.codename === landingPage.system.codename) {
      applyUpdateOnItemAndLoadLinkedItems(
        landingPage,
        data,
        (codenamesToFetch) => createClient(environmentId, apiKey, isPreview)
          .items()
          .inFilter("system.codename", [...codenamesToFetch])
          .toPromise()
          .then(res => res.data.items)
      ).then((updatedItem) => {
        if (updatedItem) {
          refetch();
        }
      });
    }
  }, [landingPage, environmentId, apiKey, isPreview, refetch]);

  useLivePreview(handleLiveUpdate);

  const onRefresh = useCallback(
    (_: IRefreshMessageData, metadata: IRefreshMessageMetadata, originalRefresh: () => void) => {
      if (metadata.manualRefresh) {
        originalRefresh();
      } else {
        refetch();
      }
    },
    [refetch],
  );

  useCustomRefresh(onRefresh);

  if (!landingPage || !Object.entries(landingPage.elements).length) {
    return <div className="flex-grow" />;
  }

  return (
    <div className="flex-grow">
      <PageSection color="bg-burgundy">
        <HeroImage
          data={{
            headline: landingPage.elements.headline,
            subheadline: landingPage.elements.subheadline,
            heroImage: landingPage.elements.hero_image,
            itemId: landingPage.system.id
          }}
        />
      </PageSection>
      <PageSection color="bg-white">
        <PageContent body={landingPage.elements.body_copy!} itemId={landingPage.system.id}/>
      </PageSection>
      <FeaturedContent featuredContent={landingPage.elements.featured_content!} parentId={landingPage.system.id}></FeaturedContent>
    </div>
  );
};

export default LandingPage;
