import React from "react";

type SingleBlogAuthorProps = {
  slug: string;
};

const SingleBlogAuthor = ({ slug }: SingleBlogAuthorProps) => {
  return (
    <section>
      <p>TODO: Add author details section for: {slug}</p>
    </section>
  );
};

export default SingleBlogAuthor;
