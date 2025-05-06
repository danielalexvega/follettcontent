import React, { useCallback, useState } from "react";
import PageSection from "../components/PageSection";
import { useAppContext } from "../context/AppContext";
import { createClient } from "../utils/client";
import { DeliveryError, ITaxonomyTerms } from "@kontent-ai/delivery-sdk";
import ArticleList from "../components/articles/ArticleList";
import { Page, Article, isArticleType, isGeneralHealthcareTopics, LanguageCodenames } from "../model";
import { useSearchParams } from "react-router-dom";
import { defaultPortableRichTextResolvers, isEmptyRichText } from "../utils/richtext";
import { PortableText } from "@portabletext/react";
import { transformToPortableText } from "@kontent-ai/rich-text-resolver";
import { IUpdateMessageData, IRefreshMessageData, IRefreshMessageMetadata, applyUpdateOnItemAndLoadLinkedItems } from "@kontent-ai/smart-link";
import { useLivePreview, useCustomRefresh } from "../context/SmartLinkContext";
import { createElementSmartLink, createItemSmartLink } from "../utils/smartlink";
import Selector, { SelectorOption } from "../components/Selector";
import ImageWithTag from "../components/ImageWithTag";
import Tags from "../components/Tags";
import ButtonLink from "../components/ButtonLink";
import { useQuery } from "@tanstack/react-query";

type FeaturedArticleProps = Readonly<{
  image: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  title: string;
  published: string;
  tags: ReadonlyArray<string>;
  description: string;
  urlSlug: string;
}>;
const FeaturedArticle: React.FC<FeaturedArticleProps> = ({ image, title, published, tags, description, urlSlug }) => {
  return (
    <div className="flex flex-col lg:flex-row items-center pt-[104px] pb-[120px] gap-12">
      <ImageWithTag
        image={{
          url: image.url,
          alt: image.alt,
          width: image.width,
          height: image.height,
        }}
        tagText="Featured Article"
        className="lg:basis-1/2 xl:basis-2/5"
      />

      <div className="lg:basis-1/2 xl:basis-3/5">
        <h2 className="text-heading-2 text-heading-2-color">{title}</h2>
        <p className="text-body-md text-body-color pt-4">{published}</p>
        <Tags tags={tags} className="mt-4" />
        <p className="text-body-lg text-body-color pt-3">
          {description}
        </p>
        <ButtonLink href={urlSlug} className="mt-6">Read More</ButtonLink>
      </div>
    </div>
  );
};

const useArticlesListingPage = (isPreview: boolean, lang: string | null) => {
  const { environmentId, apiKey } = useAppContext();
  const { data: page, refetch } = useQuery({
    queryKey: ['articles-listing-page', lang, isPreview],
    queryFn: async () => {
      const client = createClient(environmentId, apiKey, isPreview);
      const response = await client
        .item<Page>("research")
        .languageParameter((lang ?? "default") as LanguageCodenames)
        .toPromise();
      return response.data.item;
    },
  });

  const handleLiveUpdate = useCallback((data: IUpdateMessageData) => {
    if (page && data.item.codename === page.system.codename) {
      applyUpdateOnItemAndLoadLinkedItems(
        page,
        data,
        (codenamesToFetch) => createClient(environmentId, apiKey, isPreview)
          .items()
          .inFilter("system.codename", [...codenamesToFetch])
          .toPromise()
          .then(res => res.data.items)
      ).then((updatedItem) => {
        if (updatedItem) {
          refetch();
        }
      });
    }
  }, [page, environmentId, apiKey, isPreview, refetch]);

  useLivePreview(handleLiveUpdate);

  const onRefresh = useCallback(
    (_: IRefreshMessageData, metadata: IRefreshMessageMetadata, originalRefresh: () => void) => {
      if (metadata.manualRefresh) {
        originalRefresh();
      } else {
        refetch();
      }
    },
    [refetch],
  );
  
  useCustomRefresh(onRefresh);

  return page;
};

const useArticles = (isPreview: boolean, lang: string | null) => {
  const { environmentId, apiKey } = useAppContext();
  const { data: articles, refetch } = useQuery({
    queryKey: ['articles', lang, isPreview],
    queryFn: async () => {
      const client = createClient(environmentId, apiKey, isPreview);
      const response = await client
        .items<Article>()
        .type("article")
        .languageParameter((lang ?? "default") as LanguageCodenames)
        .toPromise();
      return response.data.items;
    },
  });

  const handleLiveUpdate = useCallback((data: IUpdateMessageData) => {
    if (articles) {
      const updatedArticles = articles.map(article => {
        if (article.system.codename === data.item.codename) {
          applyUpdateOnItemAndLoadLinkedItems(
            article,
            data,
            (codenamesToFetch) => createClient(environmentId, apiKey, isPreview)
              .items()
              .inFilter("system.codename", [...codenamesToFetch])
              .toPromise()
              .then(res => res.data.items)
          ).then((updatedItem) => {
            if (updatedItem) {
              refetch();
            }
          });
        }
        return article;
      });
    }
  }, [articles, environmentId, apiKey, isPreview, refetch]);

  useLivePreview(handleLiveUpdate);

  const onRefresh = useCallback(
    (_: IRefreshMessageData, metadata: IRefreshMessageMetadata, originalRefresh: () => void) => {
      if (metadata.manualRefresh) {
        originalRefresh();
      } else {
        refetch();
      }
    },
    [refetch],
  );
  useCustomRefresh(onRefresh);

  return articles ?? [];
};

const useArticleTypes = (isPreview: boolean) => {
  const { environmentId, apiKey } = useAppContext();
  const { data: types, refetch } = useQuery({
    queryKey: ['article-types', isPreview],
    queryFn: async () => {
      const client = createClient(environmentId, apiKey, isPreview);
      const response = await client
        .taxonomy("article_type")
        .toPromise();
      return response.data.taxonomy;
    },
  });

  const onRefresh = useCallback(
    (_: IRefreshMessageData, metadata: IRefreshMessageMetadata, originalRefresh: () => void) => {
      if (metadata.manualRefresh) {
        originalRefresh();
      } else {
        refetch();
      }
    },
    [refetch],
  );
  useCustomRefresh(onRefresh);

  return types ?? { terms: [] };
};

const useArticleTopics = (isPreview: boolean) => {
  const { environmentId, apiKey } = useAppContext();
  const { data: topics, refetch } = useQuery({
    queryKey: ['article-topics', isPreview],
    queryFn: async () => {
      const client = createClient(environmentId, apiKey, isPreview);
      const response = await client
        .taxonomy("general_healthcare_topics")
        .toPromise();
      return response.data.taxonomy;
    },
  });

  const onRefresh = useCallback(
    (_: IRefreshMessageData, metadata: IRefreshMessageMetadata, originalRefresh: () => void) => {
      if (metadata.manualRefresh) {
        originalRefresh();
      } else {
        refetch();
      }
    },
    [refetch],
  );
  useCustomRefresh(onRefresh);

  return topics ?? { terms: [] };
};

const ArticlesListingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const lang = searchParams.get("lang");

  const articlesListingPage = useArticlesListingPage(isPreview, lang);
  const articles = useArticles(isPreview, lang);
  const articleTypes = useArticleTypes(isPreview);
  const articleTopics = useArticleTopics(isPreview);

  const [articleType, setArticleType] = useState<string>("All");
  const [articleTopic, setArticleTopic] = useState<string>("All");

  const articleTypeCodename = searchParams.get("type");
  const articleTopicCodename = searchParams.get("topic");

  const handleArticleTypeChange = (option: SelectorOption) => {
    setArticleType(option.label);
    if (option.label === "All") {
      searchParams.delete("type");
    } else {
      searchParams.set("type", option.codename);
    }
  };

  const handleArticleTopicChange = (option: SelectorOption) => {
    setArticleTopic(option.label);
    if (option.label === "All") {
      searchParams.delete("topic");
    } else {
      searchParams.set("topic", option.codename);
    }
  };

  if (!articlesListingPage || !articles) {
    return <div className="flex-grow" />;
  }

  const featuredArticle = articles[0];

  return (
    <div className="flex flex-col">
      <PageSection color="bg-creme">
        <div className="flex flex-col-reverse gap-16 lg:gap-0 lg:flex-row items-center py-16 lg:py-0 lg:pt-[104px] lg:pb-[160px]">
          <div className="flex flex-col flex-1 gap-6">
            <h1 className="text-heading-1 text-heading-1-color"
              {...createItemSmartLink(articlesListingPage.system.id)}
              {...createElementSmartLink("headline")}
            >
              {articlesListingPage.elements.headline.value}
            </h1>
            <p className="text-body-lg text-body-color"
              {...createItemSmartLink(articlesListingPage.system.id)}
              {...createElementSmartLink("subheadline")}
            >
              {articlesListingPage.elements.subheadline.value}
            </p>
          </div>
          <div className="flex flex-col flex-1">
            <img
              width={670}
              height={440}
              src={articlesListingPage.elements.hero_image?.value[0]?.url}
              alt={articlesListingPage.elements.hero_image?.value[0]?.description ?? ""}
              className="rounded-lg"
            />
          </div>
        </div>
      </PageSection>

      {!isEmptyRichText(articlesListingPage.elements.body.value) && (
        <PageSection color="bg-white">
          <div className="flex flex-col pt-10 mx-auto gap-6"
            {...createItemSmartLink(articlesListingPage.system.id)}
            {...createElementSmartLink("body")}
          >
            <PortableText
              value={transformToPortableText(articlesListingPage.elements.body.value)}
              components={defaultPortableRichTextResolvers}
            />
          </div>
        </PageSection>
      )}

      {featuredArticle && (
        <PageSection color="bg-white">
          <FeaturedArticle
            image={{
              url: featuredArticle.elements.image.value[0]?.url ?? "",
              alt: featuredArticle.elements.image.value[0]?.description ?? featuredArticle.elements.title.value,
              width: 670,
              height: 440,
            }}
            title={featuredArticle.elements.title.value}
            published={featuredArticle.elements.publish_date.value ?? ""}
            tags={featuredArticle.elements.topics.value.map(t => t.name)}
            description={featuredArticle.elements.introduction.value}
            urlSlug={featuredArticle.elements.url_slug.value}
          />
        </PageSection>
      )}

      <PageSection color="bg-white">
        <div className="flex flex-col gap-8 pt-[104px] pb-[160px]">
          <div className="flex flex-col lg:flex-row gap-8">
            <Selector
              label="Article Type"
              options={[
                { label: "All", codename: "" },
                ...articleTypes.terms.map((t: ITaxonomyTerms) => ({
                  label: t.name,
                  codename: t.codename,
                })),
              ]}
              selectedOption={articleType}
              onChange={handleArticleTypeChange}
            />
            <Selector
              label="Topic"
              options={[
                { label: "All", codename: "" },
                ...articleTopics.terms.map((t: ITaxonomyTerms) => ({
                  label: t.name,
                  codename: t.codename,
                })),
              ]}
              selectedOption={articleTopic}
              onChange={handleArticleTopicChange}
            />
          </div>
          <ArticleList
            articles={articles.filter(a =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              isArticleType(articleTypeCodename)
                ? a.elements.article_type.value[0]?.codename === articleTypeCodename
                : true
            )
              .filter(a =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                isGeneralHealthcareTopics(articleTopicCodename)
                  ? a.elements.topics.value.find(t => t.codename === articleTopicCodename)
                  : true
              )
              .map(article => ({
                image: {
                  url: article.elements.image.value[0]?.url ?? "",
                  alt: article.elements.image.value[0]?.description ?? article.elements.title.value,
                },
                title: article.elements.title.value,
                introduction: article.elements.introduction.value,
                publishDate: article.elements.publish_date.value ?? "",
                topics: article.elements.topics.value.map(term => term.name),
                urlSlug: article.elements.url_slug.value,
              }))}
          />
        </div>
      </PageSection>
    </div>
  );
};

export default ArticlesListingPage;
