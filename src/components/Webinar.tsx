import { FC } from "react";
import { Elements } from "@kontent-ai/delivery-sdk";
import { createElementSmartLink, createItemSmartLink } from "../utils/smartlink";

type WebinarProps = {
  data: {
    date?: Elements.DateTimeElement;
    title?: Elements.TextElement;
    description?: Elements.TextElement;
    itemId?: string;
  };
};

const Webinar: FC<WebinarProps> = ({ data }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).toUpperCase();
  };

  return (
    <div 
      className="border-2 border-blue-600 bg-white p-4 rounded-lg"
      {...createItemSmartLink(data.itemId)}
      {...createElementSmartLink("webinar")}
    >
      <div 
        className="text-sm font-semibold text-blue-600 mb-2"
        {...createItemSmartLink(data.itemId)}
        {...createElementSmartLink("date")}
      >
        {data.date?.value ? formatDate(data.date.value) : ""}
      </div>
      
      <h3 
        className="text-lg font-bold text-gray-900 mb-2"
        {...createItemSmartLink(data.itemId)}
        {...createElementSmartLink("title")}
      >
        {data.title?.value || ""}
      </h3>
      
      <p 
        className="text-gray-700 text-sm leading-relaxed"
        {...createItemSmartLink(data.itemId)}
        {...createElementSmartLink("description")}
      >
        {data.description?.value || ""}
      </p>
    </div>
  );
};

export default Webinar;
