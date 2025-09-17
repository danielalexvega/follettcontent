import { FC } from "react";
import { transformToPortableText } from "@kontent-ai/rich-text-resolver";
import { PortableText } from "@kontent-ai/rich-text-resolver/utils/react";
import { createElementSmartLink, createFixedAddSmartLink, createItemSmartLink } from "../utils/smartlink";
import { Elements } from "@kontent-ai/delivery-sdk";
import { createPortableTextComponents } from "./PortableTextComponents";

type PageContentProps = {
  body: Elements.RichTextElement;
  itemId: string;
  elementName: string;
};

const PageContent: FC<PageContentProps> = ({ body, itemId, elementName }) => {
  const value = !body || !body.value ? "<p><br/></p>" : body.value;
  const portableText = transformToPortableText(value);
  return (
    <div className="pt-10 pb-20 flex flex-col"
      {...createItemSmartLink(itemId)}
      {...createElementSmartLink(
        elementName
      )}
      {...createFixedAddSmartLink("end", "bottom")}
    >
      <PortableText value={portableText} components={createPortableTextComponents(body)} />
    </div>
  );
};


export default PageContent;
