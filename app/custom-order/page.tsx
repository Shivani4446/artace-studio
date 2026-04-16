import React from "react";
import { Metadata } from "next";
import CustomOrderForm from "@/components/custom-order/CustomOrderForm";

export const metadata: Metadata = {
  title: "Custom Paintings | Commissioned Artwork | Artace Studio",
  description: "Order custom paintings commissioned specifically for you. Work with our artists to create unique bespoke artwork for your space.",
  keywords: "custom paintings, commissioned artwork, bespoke art, custom canvas art, made to order paintings",
  openGraph: {
    title: "Custom Paintings | Commissioned Artwork | Artace Studio",
    description: "Order bespoke commissioned paintings for your space.",
    url: "https://artacestudio.com/custom-order",
  },
  twitter: {
    card: "summary_large_image",
    title: "Custom Paintings | Commissioned Artwork",
    description: "Get bespoke artwork created for you.",
  },
};

const CustomOrderPage = () => {
  return <CustomOrderForm />;
};

export default CustomOrderPage;
