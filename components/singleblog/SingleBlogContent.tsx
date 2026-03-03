import React from "react";

type Props = {
  content: string;
};

const SingleBlogContent = ({ content }: Props) => {
  // Extract only H2 headings
  const h2Regex = /<h2[^>]*>(.*?)<\/h2>/g;

  const h2Headings: string[] = [];
  let match;

  while ((match = h2Regex.exec(content)) !== null) {
    const cleanText = match[1].replace(/<[^>]+>/g, "");
    h2Headings.push(cleanText);
  }

  return (
    <div className="grid md:grid-cols-4 gap-10">
      {/* LEFT SIDE - H2 List */}
      {h2Headings.length > 0 && (
        <aside className="md:col-span-1 sticky top-24 h-fit">
          <h3 className="font-semibold mb-4">Table of Contents</h3>
          <ul className="space-y-2 text-sm">
            {h2Headings.map((heading, index) => (
              <li key={index} className="text-gray-600">
                {heading}
              </li>
            ))}
          </ul>
        </aside>
      )}

      {/* RIGHT SIDE - Content */}
      <div
        className="md:col-span-3 prose max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};

export default SingleBlogContent;
