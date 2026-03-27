import React from "react";
import { Metadata } from "next";
import CustomOrderForm from "@/components/custom-order/CustomOrderForm";

export const metadata: Metadata = {
  title: "Custom Order - Artace Studio",
  description:
    "Create your dream hand-painted canvas artwork. Share your vision with our master artists and receive a custom masterpiece tailored to your space.",
};

const CustomOrderPage = () => {
  return <CustomOrderForm />;
};

export default CustomOrderPage;
