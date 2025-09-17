import { FC } from "react";
import { Elements } from "@kontent-ai/delivery-sdk";
import { createElementSmartLink, createItemSmartLink } from "../utils/smartlink";

type BlogCardProps = {
  data: {
    title?: Elements.TextElement;
    description?: Elements.TextElement;
    image?: Elements.AssetsElement;
    url?: Elements.TextElement;
    itemId?: string;
  };
};

const BlogCard: FC<BlogCardProps> = ({ data }) => {
  const imageUrl = data.image?.value?.[0]?.url;
  const imageAlt = data.image?.value?.[0]?.description || "Blog post image";

  return (
    <div 
      className="flex gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
      {...createItemSmartLink(data.itemId)}
      {...createElementSmartLink("blog_post")}
    >
      {/* Image */}
      <div className="flex-shrink-0">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={imageAlt}
            className="w-20 h-20 object-cover rounded-lg"
            {...createItemSmartLink(data.itemId)}
            {...createElementSmartLink("image")}
          />
        ) : (
          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-400 text-xs">No Image</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 
          className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors"
          {...createItemSmartLink(data.itemId)}
          {...createElementSmartLink("title")}
        >
          {data.title?.value || ""}
        </h3>
        
        <p 
          className="text-gray-700 text-sm mb-3 line-clamp-2"
          {...createItemSmartLink(data.itemId)}
          {...createElementSmartLink("description")}
        >
          {data.description?.value || ""}
        </p>
        
        <a 
          href={data.url?.value || "#"}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          {...createItemSmartLink(data.itemId)}
          {...createElementSmartLink("url")}
        >
          Read more
        </a>
      </div>
    </div>
  );
};

export default BlogCard;
