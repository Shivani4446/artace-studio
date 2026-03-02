import React from "react";

type SingleBlogRelatedProps = {
  slug: string;
};

const SingleBlogRelated = ({ slug }: SingleBlogRelatedProps) => {
  return (
    <section>
      <p>TODO: Add related blogs section for: {slug}</p>
    </section>
  );
};

export default SingleBlogRelated;
