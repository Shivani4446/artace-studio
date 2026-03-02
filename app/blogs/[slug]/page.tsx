import type { Metadata } from "next";
import React from "react";
import SingleBlogAuthor from "@/components/singleblog/SingleBlogAuthor";
import SingleBlogContent from "@/components/singleblog/SingleBlogContent";
import SingleBlogHero from "@/components/singleblog/SingleBlogHero";
import SingleBlogRelated from "@/components/singleblog/SingleBlogRelated";

type SingleBlogPageProps = {
  params: {
    slug: string;
  };
};

export const generateMetadata = ({ params }: SingleBlogPageProps): Metadata => {
  const titleFromSlug = decodeURIComponent(params.slug)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return {
    title: `${titleFromSlug} | Artace Studio`,
  };
};

const SingleBlogPage = ({ params }: SingleBlogPageProps) => {
  const slug = decodeURIComponent(params.slug);

  return (
    <main className="px-6 py-16 md:px-12 lg:px-24">
      <SingleBlogHero slug={slug} />
      <SingleBlogContent slug={slug} />
      <SingleBlogAuthor slug={slug} />
      <SingleBlogRelated slug={slug} />
    </main>
  );
};

export default SingleBlogPage;
