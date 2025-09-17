import { Elements } from "@kontent-ai/delivery-sdk";
import { FC, useState, useEffect } from "react";
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get button link from the linked page
  const buttonLink = data.button_link?.value?.[0] || "";
  const buttonText = data.button_label?.value || "";

  // Get array of images from heroImage
  const images = data.heroImage?.value || [];

  // Cycle through images every 20 seconds
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 20000); // 20 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  // Get current image URL
  const currentImageUrl = images[currentImageIndex]?.url || "";

  return (
    <div id="cpage-hero-container">
      <div
        id="cpage-hero"
        style={{
          backgroundImage: currentImageUrl ? `url(${currentImageUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          height: '65vh',
          minHeight: '820px',
          position: 'relative'
        }}
        {...createItemSmartLink(data.itemId)}
        {...createElementSmartLink("hero_image")}
      >
        <div
          id="cpage-hero-title-container"
          className="bottom-330"
          style={{
            backgroundColor: 'transparent',
            display: 'block',
            position: 'absolute',
            textAlign: 'left',
            padding: '15px 30px 5px 30px',
            bottom: '330px',

          }}
        >
          <h1 className="text-white font-sans text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight uppercase"
            {...createItemSmartLink(data.itemId)}
            {...createElementSmartLink("headline")}
          >
            {data.headline?.value}
          </h1>




        </div>
      </div>
    </div>
  );
};

export default HeroImage;