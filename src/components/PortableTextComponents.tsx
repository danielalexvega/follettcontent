import { Elements, IContentItem } from "@kontent-ai/delivery-sdk";
import { PortableTextReactResolvers } from "@kontent-ai/rich-text-resolver/utils/react";
import { defaultPortableRichTextResolvers } from "../utils/richtext";
import { CallToAction, Disclaimer, Video } from "../model";
import { CTACardType } from "../../types/cta-card-type.generated";
import PromotionalDisclaimer from "./disclaimer/PromotionalDisclaimer";
import InformationalDisclaimer from "./disclaimer/InformationalDisclaimer";
import CallToActionComponent from "./CallToAction";
import CTACardComponent from "./CTACard";
import VideoComponent from "./Video";

export const createPortableTextComponents = (
  element: Elements.RichTextElement,
): PortableTextReactResolvers => ({
  ...defaultPortableRichTextResolvers,
  types: {
    componentOrItem: ({ value }) => {
      const item = element.linkedItems.find(item => item.system.codename === value.componentOrItem._ref) as IContentItem;
      if (!item) {
        return <div>Did not find any item with codename {value.component._ref}</div>;
      }

      switch (item.system.type) {
        case "video":
          return <VideoComponent video={item as Video} componentId={item.system.id} componentName={item.system.name} />;
        case "disclaimer": {
          const disclaimerItem = item as Disclaimer;
          return disclaimerItem.elements.type.value[0]?.codename === "promotional"
            ? <PromotionalDisclaimer title={disclaimerItem.elements.headline.value} text={disclaimerItem.elements.subheadline.value} componentId={item.system.id} componentName={item.system.name} />
            : <InformationalDisclaimer title={disclaimerItem.elements.headline.value} text={disclaimerItem.elements.subheadline.value} componentId={item.system.id} componentName={item.system.name} />;
        }
        case "call_to_action": {
          const cta = item as CallToAction;
          return (
            <CallToActionComponent
              title={cta.elements.headline.value}
              description={cta.elements.subheadline.value}
              buttonText={cta.elements.button_label.value}
              buttonHref={cta.elements.button_link.linkedItems[0]?.elements.url.value ?? ""}
              imageSrc={cta.elements.image.value[0]?.url}
              imageAlt={cta.elements.image.value[0]?.description ?? "alt"}
              imagePosition={cta.elements.image_position.value[0]?.codename ?? "left"}
              componentId={cta.system.id}
              componentName={cta.system.name}
            />
          );
        }
        case "cta_card": {
          const cta = item as CTACardType;
          return <CTACardComponent data={{
            title: cta.elements.title,
            body: cta.elements.body,
            link_text: cta.elements.link_text,
            button_link: cta.elements.page_link,
            image: cta.elements.background_image,
            itemId: cta.system.id
          }} />;
        }
        default:
          return (
            <div className="bg-red-500 text-white">
              Unsupported content type &quot;{item.system.type}&quot;
            </div>
          );
      }
    },
  },
});
