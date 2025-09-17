import { FC } from "react";
import { Elements } from "@kontent-ai/delivery-sdk";
import { createElementSmartLink, createItemSmartLink } from "../utils/smartlink";
import { createPreviewLink } from "../utils/link";
import { createPortableTextComponents } from "./PortableTextComponents";
import { transformToPortableText } from "@kontent-ai/rich-text-resolver";
import { PortableText } from "@kontent-ai/rich-text-resolver/utils/react";

type CTACardProps = Readonly<{
  data: {
    title?: Elements.TextElement;
    body?: Elements.RichTextElement;
    image?: Elements.AssetsElement;
    link_text?: Elements.TextElement;
    button_link?: any; // Using any for now until model is updated
    itemId?: string;
  };
}>;

const CTACard: FC<CTACardProps> = ({ data }) => {
  // Get button link and text
  const buttonLink = data.button_link?.value?.[0] || "";
  const buttonText = data.link_text?.value || "";
  const title = data.title?.value || "";
  // const body = data.body?.value || "";

  const value = !data.body || !data.body.value ? "<p><br/></p>" : data.body.value;
  const portableText = transformToPortableText(value);

  
  // Get background image
  const backgroundImage = data.image?.value?.[0];
  const imageUrl = backgroundImage?.url || "";
  
  // Determine if it's an external link
  const isExternalLink = buttonLink && (buttonLink.startsWith('http') || buttonLink.startsWith('www'));
  
  // Create the button element
  const ButtonElement = isExternalLink ? 'a' : 'a';
  const buttonProps = isExternalLink 
    ? { href: buttonLink, target: "_blank", rel: "noopener noreferrer" }
    : { href: createPreviewLink(buttonLink, false) };

  return (
    <div className="max-w-md mx-auto bg-white rounded-3xl shadow-lg overflow-hidden">
      {/* Top Section with Background Image */}
      <div 
        className="relative h-64 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: imageUrl ? `url(${imageUrl})` : 'linear-gradient(135deg, #218868 0%, #1a6b52 100%)',
        }}
        {...createItemSmartLink(data.itemId)}
        {...createElementSmartLink("image")}
      >
        {/* Overlay for better text readability if needed */}
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        

      </div>

      {/* Bottom Section with Content */}
      <div className="p-6">
        <h3 
          className="text-xl font-bold text-gray-900 mb-3"
          {...createItemSmartLink(data.itemId)}
          {...createElementSmartLink("headline")}
        >
          {title}
        </h3>
        
        <p 
          className="text-gray-700 mb-6 leading-relaxed"
          {...createItemSmartLink(data.itemId)}
          {...createElementSmartLink("subheadline")}
        >
        <PortableText value={portableText} components={createPortableTextComponents(data.body!)} />

        </p>
        
        {buttonText && (
          <ButtonElement
            {...buttonProps}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {buttonText}
          </ButtonElement>
        )}
      </div>
    </div>
  );
};

export default CTACard;
