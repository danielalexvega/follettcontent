import { FC } from "react";
import CTACardComponent from "./CTACard";
import BlogCard from "./BlogCard";
import Webinar from "./Webinar";

type FeaturedContentProps = {
  data: {
    featured_blog_posts?: any[];
    homepage_cta_cards?: any[];
    webinars?: any[];
  };
};

const FeaturedContent: FC<FeaturedContentProps> = ({ data }) => {
  console.log(data);
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column - 3/4 width */}
        <div className="lg:col-span-3 space-y-8">
          {/* CTA Cards - Side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.homepage_cta_cards?.slice(0, 2).map((ctaCard) => (
              <CTACardComponent 
                key={ctaCard.system.id}
                data={{
                  title: ctaCard.elements.title,
                  body: ctaCard.elements.body,
                  link_text: ctaCard.elements.link_text,
                  button_link: ctaCard.elements.page_link,
                  image: ctaCard.elements.background_image,
                  itemId: ctaCard.system.id
                }} 
              />
            ))}
          </div>

          {/* Blog Posts Section */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Latest Ideas & Trends</h2>
            <div className="space-y-6">
              {data.featured_blog_posts?.map((blogPost) => (
                <BlogCard 
                  key={blogPost.system.id}
                  data={{
                    title: blogPost.elements.title,
                    description: blogPost.elements.description,
                    image: blogPost.elements.image,
                    url: blogPost.elements.url,
                    itemId: blogPost.system.id
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - 1/4 width */}
        <div className="lg:col-span-1">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Webinars</h2>
          <div className="space-y-4">
            {data.webinars?.map((webinar) => (
              <Webinar 
                key={webinar.system.id}
                data={{
                  date: webinar.elements.date,
                  title: webinar.elements.title,
                  description: webinar.elements.description,
                  itemId: webinar.system.id
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedContent;
