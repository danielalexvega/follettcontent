import { Elements } from "@kontent-ai/delivery-sdk";
import { FC } from "react";
import ButtonLink from "./ButtonLink";
import { createElementSmartLink, createItemSmartLink } from "../utils/smartlink";

type HeroImageProps = Readonly<{
  data: {
    headline?: Elements.TextElement;
    subheadline?: Elements.TextElement;
    heroImage?: Elements.AssetsElement;
    button_label?: Elements.TextElement;
    button_link?: any; // Using any for now until model is updated
    itemId?: string;
  };
}>;

const HeroImage: FC<HeroImageProps> = ({ data }) => {
  // Get button link from the linked page
  console.log(data.button_link);
  const buttonLink = data.button_link?.value?.[0]|| "";
  const buttonText = data.button_label?.value || "";
  console.log(buttonLink);
  

  return (
    <div className="bg-[#0066cc] flex flex-col lg:flex-row items-center py-16 px-8 lg:px-16 gap-8 lg:gap-12">
      {/* Hero Image - Left Side */}
      <div className="lg:basis-1/2 flex justify-center"
        {...createItemSmartLink(data.itemId)}
        {...createElementSmartLink("hero_image")}
      >
        {data.heroImage?.value[0]
          ? (
            data.heroImage.value[0].type?.startsWith('image') ? (
              <div className="w-80 h-auto lg:w-96">
                <img
                  className="w-full h-auto"
                  src={`${data.heroImage.value[0].url}?auto=format&w=400`}
                  alt={data.heroImage.value[0].description ?? "Hero image"}
                />
              </div>
            ) : (
              <div className="w-80 h-auto lg:w-96">
                <video
                  src={data.heroImage.value[0].url}
                  autoPlay={true}
                  loop={true}
                  muted={true}
                  className="w-full h-auto"
                />
              </div>
            )
          ) : (
            <div className="w-80 h-80 lg:w-96 lg:h-96 bg-gray-300 flex items-center justify-center">
              <span className="text-gray-500 text-lg">No image</span>
            </div>
          )}
      </div>

      {/* Content - Right Side */}
      <div className="lg:basis-1/2 flex flex-col items-center lg:items-start gap-6 text-center lg:text-left">
        <h1 className="text-white font-sans text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight"
          {...createItemSmartLink(data.itemId)}
          {...createElementSmartLink("headline")}
        >
          {data.headline?.value}
        </h1>
        
        {data.subheadline?.value && (
          <p className="text-white font-sans text-xl lg:text-2xl leading-relaxed"
            {...createItemSmartLink(data.itemId)}
            {...createElementSmartLink("subheadline")}
          >
            {data.subheadline.value}
          </p>
        )}
        
        {buttonLink && buttonText && (
          <div className="mt-4">
            <ButtonLink href={buttonLink} style="transparent">
              <span className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg transition-colors duration-200">
                {buttonText}
              </span>
            </ButtonLink>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroImage;