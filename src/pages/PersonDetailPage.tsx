import React, { useCallback, useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { createClient } from "../utils/client";
import { useAppContext } from "../context/AppContext";
import { LanguageCodenames, Person } from "../model";
import { DeliveryError } from "@kontent-ai/delivery-sdk";
import { PortableText } from "@portabletext/react";
import { transformToPortableText } from "@kontent-ai/rich-text-resolver";
import { defaultPortableRichTextResolvers } from "../utils/richtext";
import PageSection from "../components/PageSection";
import { IUpdateMessageData, applyUpdateOnItemAndLoadLinkedItems } from "@kontent-ai/smart-link";
import { useLivePreview } from "../context/SmartLinkContext";
import { createElementSmartLink, createItemSmartLink } from "../utils/smartlink";

const usePerson = (slug: string | undefined, isPreview: boolean, lang: string | null) => {
  const { environmentId, apiKey } = useAppContext();
  const [person, setPerson] = useState<Person | null>(null);
  const [personCodename, setPersonCodename] = useState<string | null>(null);

  const handleLiveUpdate = useCallback((data: IUpdateMessageData) => {
    if (person && data.item.codename === person.system.codename) {
      // Use applyUpdateOnItemAndLoadLinkedItems to ensure all linked content is updated
      applyUpdateOnItemAndLoadLinkedItems(
        person,
        data,
        (codenamesToFetch) => createClient(environmentId, apiKey, isPreview)
          .items()
          .inFilter("system.codename", [...codenamesToFetch])
          .toPromise()
          .then(res => res.data.items)
      ).then((updatedItem) => {
        if (updatedItem) {
          setPerson(updatedItem as Person);
        }
      });
    }
  }, [person, environmentId, apiKey, isPreview]);

  // First fetch to get the person codename
  useEffect(() => {
    if (slug) {
      createClient(environmentId, apiKey, isPreview)
        .items<Person>()
        .type("person")
        .equalsFilter("elements.url_slug", slug)
        .toPromise()
        .then((res) => {
          const item = res.data.items[0];
          if (item) {
            setPersonCodename(item.system.codename);
          } else {
            setPersonCodename(null);
          }
        })
        .catch((err) => {
          if (err instanceof DeliveryError) {
            setPersonCodename(null);
          } else {
            throw err;
          }
        });
    }
  }, [slug, environmentId, apiKey, isPreview]);

  // Second fetch to get the full person data with language
  useEffect(() => {
    if (personCodename) {
      createClient(environmentId, apiKey, isPreview)
        .items<Person>()
        .type("person")
        .equalsFilter("system.codename", personCodename)
        .languageParameter((lang ?? "default") as LanguageCodenames)
        .depthParameter(1)
        .toPromise()
        .then((res) => {
          const item = res.data.items[0];
          if (item) {
            setPerson(item);
          } else {
            setPerson(null);
          }
        })
        .catch((err) => {
          if (err instanceof DeliveryError) {
            setPerson(null);
          } else {
            throw err;
          }
        });
    }
  }, [personCodename, environmentId, apiKey, isPreview, lang]);

  useLivePreview(handleLiveUpdate);

  return person;
};

const PersonDetailPage: React.FC = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const lang = searchParams.get("lang");

  const person = usePerson(slug, isPreview, lang);

  if (!person) {
    return <div className="flex-grow" />;
  }

  const fullName = `${person.elements.first_name?.value || ""} ${person.elements.last_name?.value || ""}`.trim();

  return (
    <div className="flex flex-col">
      <PageSection color="bg-azure">
        <div className="azure-theme flex flex-col lg:flex-row justify-between items-start gap-16 pt-[104px] pb-[160px] items-center">
          <div className="flex flex-col gap-6 max-w-[728px]">
            <div className="w-fit text-body-xs text-white border border-white px-4 py-2 rounded-lg uppercase tracking-wider font-bold">
              Person
            </div>
            <h1 className="text-heading-1 text-heading-1-color"
            {...createItemSmartLink(person.system.id)}
            {...createElementSmartLink("first_name")}
            >
              {person.elements.prefix?.value && <span>{person.elements.prefix.value}</span>}
              &nbsp;
              {person.elements.first_name?.value} {person.elements.last_name?.value}
              {person.elements.suffixes?.value && <span>, {person.elements.suffixes.value}</span>}
            </h1>
            <p className="text-[32px] leading-[130%] text-body-color"
            {...createItemSmartLink(person.system.id)}
            {...createElementSmartLink("job_title")}
            >
              {person.elements.job_title?.value}
            </p>
          </div>

          <div className="flex-1 flex justify-end">
            <img
              src={person.elements.image?.value[0]?.url}
              alt={person.elements.image?.value[0]?.description ?? `Photo of ${fullName}`}
              width={550}
              height={440}
              className="rounded-lg w-[550px] h-[440px] object-cover"
            />
          </div>
        </div>
      </PageSection>

      <PageSection color="bg-white">
        <div className="flex flex-col gap-12 mx-auto items-center max-w-fit">
          <div className="rich-text-body flex mx-auto flex-col gap-5 items-center max-w-[728px]"
          {...createItemSmartLink(person.system.id)}
          {...createElementSmartLink("biography")}
          >
            <PortableText
              value={transformToPortableText(person.elements.biography?.value)}
              components={defaultPortableRichTextResolvers}
            />
          </div>
        </div>
      </PageSection>
    </div>
  );
};

export default PersonDetailPage;
