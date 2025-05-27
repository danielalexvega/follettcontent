import { DeliveryError } from "@kontent-ai/delivery-sdk";
import { Elements, ElementType } from "@kontent-ai/delivery-sdk";

import HeroImage from "../components/HeroImage";
import PageContent from "../components/PageContent";
import PageSection from "../components/PageSection";
import "../index.css";
import { LanguageCodenames, type LandingPage, type Article, type Event, type CallToAction } from "../model";
import { createClient } from "../utils/client";
import { FC, useCallback, useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { Replace } from "../utils/types";
import FeaturedContent from "../components/landingPage/FeaturedContent";
import { useSearchParams } from "react-router-dom";
import { useCustomRefresh, useLivePreview } from "../context/SmartLinkContext";
import { IRefreshMessageData, IRefreshMessageMetadata, IUpdateMessageData, applyUpdateOnItemAndLoadLinkedItems } from "@kontent-ai/smart-link";
import { useSuspenseQueries } from "@tanstack/react-query";

const useLandingPage = (isPreview: boolean, lang: string | null) => {
  const { environmentId, apiKey } = useAppContext();
  const [landingPage, setLandingPage] = useState<Replace<LandingPage, { elements: Partial<LandingPage["elements"]> }> | null>(null);

  const handleLiveUpdate = useCallback((data: IUpdateMessageData) => {
    // Check if the update is for the landing page itself
    if (landingPage && data.item.codename === landingPage.system.codename) {
      applyUpdateOnItemAndLoadLinkedItems(
        landingPage,
        data,
        async (codenamesToFetch) => {
          if (codenamesToFetch.length === 0) return [];
          
          const response = await createClient(environmentId, apiKey, isPreview)
            .items()
            .inFilter("system.codename", [...codenamesToFetch])
            .languageParameter((lang ?? "default") as LanguageCodenames)
            .toAllPromise();
            
          return response.data.items;
        }
      ).then((updatedItem) => {
        if (updatedItem) {
          setLandingPage(updatedItem as Replace<LandingPage, { elements: Partial<LandingPage["elements"]> }>);
        }
      });
    }
    // Check if the update is for any of the linked items in featured content
    else if (landingPage?.elements.featured_content?.linkedItems) {
      const linkedItem = landingPage.elements.featured_content.linkedItems.find(
        item => item.system.codename === data.item.codename
      );
      
      if (linkedItem) {
        // Fetch the updated item to ensure we have the correct type
        createClient(environmentId, apiKey, isPreview)
          .item(data.item.codename)
          .languageParameter((lang ?? "default") as LanguageCodenames)
          .toPromise()
          .then(response => {
            const updatedItem = response.data.item as Event | Article | CallToAction;
            if (updatedItem) {
              // Update the linked item in the featured content
              const updatedLinkedItems = landingPage.elements.featured_content?.linkedItems.map(item => {
                if (item.system.codename === data.item.codename) {
                  return updatedItem;
                }
                return item;
              });

              // Create a new featured content element with the required properties
              const updatedFeaturedContent: Elements.LinkedItemsElement<Event | Article | CallToAction> = {
                name: "featured_content",
                type: "modular_content" as ElementType,
                value: updatedLinkedItems?.map(item => item.system.codename) ?? [],
                linkedItems: updatedLinkedItems ?? []
              };

              setLandingPage({
                ...landingPage,
                elements: {
                  ...landingPage.elements,
                  featured_content: updatedFeaturedContent
                }
              });
            }
          });
      }
    }
  }, [landingPage, environmentId, apiKey, isPreview, lang]);

  useEffect(() => {
    createClient(environmentId, apiKey, isPreview)
      .items()
      .type("landing_page")
      .limitParameter(1)
      .languageParameter((lang ?? "default") as LanguageCodenames)
      .toPromise()
      .then(res => {
        const item = res.data.items[0] as Replace<LandingPage, { elements: Partial<LandingPage["elements"]> }> | undefined;
        if (item) {
          setLandingPage(item);
        } else {
          setLandingPage(null);
        }
      })
      .catch((err) => {
        if (err instanceof DeliveryError) {
          setLandingPage(null);
        } else {
          throw err;
        }
      });
  }, [environmentId, apiKey, isPreview, lang]);

  useLivePreview(handleLiveUpdate);

  return landingPage;
};

const LandingPage: FC = () => {
  const { environmentId, apiKey } = useAppContext();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const lang = searchParams.get("lang");

  const landingPage = useLandingPage(isPreview, lang);

  const [landingPageData] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["landing_page"],
        queryFn: () =>
          createClient(environmentId, apiKey, isPreview)
            .items()
            .type("landing_page")
            .limitParameter(1)
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
      },
    ],
  });

  const onRefresh = useCallback(
    (_: IRefreshMessageData, metadata: IRefreshMessageMetadata, originalRefresh: () => void) => {
      if (metadata.manualRefresh) {
        originalRefresh();
      } else {
        landingPageData.refetch();
      }
    },
    [landingPage],
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
        <PageContent body={landingPage.elements.body_copy!} itemId={landingPage.system.id} elementName="body_copy" />
      </PageSection>
      <FeaturedContent featuredContent={landingPage.elements.featured_content!} parentId={landingPage.system.id}></FeaturedContent>
    </div>
  );
};

export default LandingPage;
