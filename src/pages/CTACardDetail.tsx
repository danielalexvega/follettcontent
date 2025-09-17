import { DeliveryError } from "@kontent-ai/delivery-sdk";

import "../index.css";
import { LanguageCodenames } from "../model";
import { CTACardType } from "../../types/cta-card-type.generated";
import { createClient } from "../utils/client";
import { FC, useCallback, useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { Replace } from "../utils/types";
import { useParams, useSearchParams } from "react-router-dom";
import { useCustomRefresh, useLivePreview } from "../context/SmartLinkContext";
import { IRefreshMessageData, IRefreshMessageMetadata, IUpdateMessageData, applyUpdateOnItemAndLoadLinkedItems } from "@kontent-ai/smart-link";
import { useSuspenseQueries } from "@tanstack/react-query";
import CTACardComponent from "../components/CTACard";
import PageSection from "../components/PageSection";

const useCTACard = (isPreview: boolean, lang: string | null, slug: string | null) => {
  const { environmentId, apiKey } = useAppContext();
  const [ctaCard, setCTACard] = useState<Replace<CTACardType, { elements: Partial<CTACardType["elements"]> }> | null>(null);

  const handleLiveUpdate = useCallback((data: IUpdateMessageData) => {
    if (ctaCard) {
      // Use applyUpdateOnItemAndLoadLinkedItems to ensure all linked content is updated
      applyUpdateOnItemAndLoadLinkedItems(
        ctaCard,
        data,
        (codenamesToFetch) => createClient(environmentId, apiKey, isPreview)
          .items()
          .inFilter("system.codename", [...codenamesToFetch])
          .toPromise()
          .then(res => res.data.items)
      ).then((updatedItem) => {
        if (updatedItem) {
          setCTACard(updatedItem as Replace<CTACardType, { elements: Partial<CTACardType["elements"]> }>);
        }
      });
    }
  }, [ctaCard, environmentId, apiKey, isPreview]);

  useEffect(() => {
    createClient(environmentId, apiKey, isPreview)
      .item<CTACardType>(slug ?? "")
      .languageParameter((lang ?? "default") as LanguageCodenames)
      .toPromise()
      .then(res => {
        const item = res.data.item as Replace<CTACardType, { elements: Partial<CTACardType["elements"]> }> | undefined;
        if (item) {
          setCTACard(item);
        } else {
          setCTACard(null);
        }
      })
      .catch((err) => {
        if (err instanceof DeliveryError) {
          setCTACard(null);
        } else {
          throw err;
        }
      });
  }, [environmentId, apiKey, isPreview, lang]);

  useLivePreview(handleLiveUpdate);

  return ctaCard;
};

const CTACardDetail: FC = () => {
  const { environmentId, apiKey } = useAppContext();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const { slug } = useParams();
  const lang = searchParams.get("lang");

  const ctaCard = useCTACard(isPreview, lang, slug ?? null);

  const [ctaCardData] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["cta_card"],
        queryFn: () =>
          createClient(environmentId, apiKey, isPreview)
            .item<CTACardType>(slug ?? "")
            .languageParameter((lang ?? "default") as LanguageCodenames)
            .toPromise()
            .then(res =>
              res.data.item as Replace<CTACardType, { elements: Partial<CTACardType["elements"]> }> ?? null
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
        ctaCardData.refetch();
      }
    },
    [ctaCard],
  );

  useCustomRefresh(onRefresh);

  if (!ctaCard || !Object.entries(ctaCard.elements).length) {
    return <div className="flex-grow">Empty page</div>;
  }

  return (
    <div className="flex-grow">
      <PageSection color="bg-white">
        <CTACardComponent
          data={{
            title: ctaCard.elements.title,
            body: ctaCard.elements.body,
            link_text: ctaCard.elements.link_text,
            button_link: ctaCard.elements.page_link,
            image: ctaCard.elements.background_image,
            itemId: ctaCard.system.id
          }}
        />
      </PageSection>
    </div>
  );
};

export default CTACardDetail;
