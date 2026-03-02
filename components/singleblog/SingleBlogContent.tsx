import React from "react";

type SingleBlogContentProps = {
  slug: string;
};

const SingleBlogContent = ({ slug }: SingleBlogContentProps) => {
  return (
    <section>
      <p>TODO: Add article body/content blocks for: {slug}</p>
    </section>
  );
};

export default SingleBlogContent;
