"use client";

import React, { useState } from "react";
import Link from "next/link";
import ImageUpload from "./ImageUpload";
import CustomDropdown from "@/components/ui/CustomDropdown";

const ROOM_OPTIONS = [
  "Living Room",
  "Bedroom",
  "Dining Room",
  "Office",
  "Hallway",
  "Kitchen",
  "Bathroom",
  "Outdoor",
  "Other",
];

const COLOR_OPTIONS = [
  "Warm Tones (Red, Orange, Yellow)",
  "Cool Tones (Blue, Green, Purple)",
  "Neutral (Black, White, Gray)",
  "Pastel",
  "Vibrant",
  "Earthy",
  "Monochrome",
  "Other",
];

const BUDGET_OPTIONS = [
  "Under ₹5,000",
  "₹5,000 - ₹10,000",
  "₹10,000 - ₹25,000",
  "₹25,000 - ₹50,000",
  "₹50,000 - ₹1,00,000",
  "Over ₹1,00,000",
];

const CATEGORY_OPTIONS = [
  "Abstract",
  "Portrait",
  "Landscape",
  "Modern",
  "Traditional",
  "Religious / Spiritual",
  "Animals / Wildlife",
  "Still Life",
  "Other",
];

type FormData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  concept: string;
  size: string;
  colors: string;
  referenceUrls: string;
  rooms: string;
  numberOfPaintings: string;
  budgetRange: string;
  categories: string;
  additionalNotes: string;
};

type UploadedImage = {
  url: string;
  name: string;
};

type SubmissionState = {
  status: "idle" | "submitting" | "success" | "error";
  orderId?: string;
  errorMessage?: string;
};

export default function CustomOrderForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    concept: "",
    size: "",
    colors: "",
    referenceUrls: "",
    rooms: "",
    numberOfPaintings: "1",
    budgetRange: "",
    categories: "",
    additionalNotes: "",
  });

  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const [submission, setSubmission] = useState<SubmissionState>({
    status: "idle",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmission({ status: "submitting" });

    // Combine uploaded image URLs and manual URLs
    const uploadedUrls = uploadedImages.map(img => img.url);
    const manualUrls = formData.referenceUrls.split(',').map(url => url.trim()).filter(Boolean);
    const allReferenceImages = [...uploadedUrls, ...manualUrls].join(',');

    const payload = {
      ...formData,
      referenceImages: allReferenceImages,
    };

    try {
      const response = await fetch("/api/custom-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to submit custom order request.");
      }

      const data = await response.json();
      setSubmission({
        status: "success",
        orderId: data.orderId,
      });
    } catch (error) {
      setSubmission({
        status: "error",
        errorMessage:
          error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    }
  };

  if (submission.status === "success") {
    return (
      <div className="min-h-screen bg-white text-[#121212]">
        <main className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-center px-6 py-20 md:px-12">
          <div className="w-full max-w-2xl text-center">
            <div className="mb-8 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-10 w-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h1 className="font-display text-3xl font-semibold md:text-4xl">
              Custom Order Request Received!
            </h1>
            <p className="mt-4 text-lg text-[#595959]">
              Thank you for your interest in a custom painting. We&apos;ve received your
              requirements and will get back to you within 24 hours.
            </p>
            <div className="mt-10 rounded-lg border border-gray-200 bg-[#f9f9f9] p-6 text-left">
              <h2 className="mb-4 text-xl font-semibold">Your Order Details</h2>
              <dl className="space-y-3">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <dt className="text-[#595959]">Order ID:</dt>
                  <dd className="font-medium">{submission.orderId}</dd>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <dt className="text-[#595959]">Name:</dt>
                  <dd className="font-medium">{formData.name}</dd>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <dt className="text-[#595959]">Email:</dt>
                  <dd className="font-medium">{formData.email}</dd>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <dt className="text-[#595959]">Phone:</dt>
                  <dd className="font-medium">{formData.phone}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#595959]">Address:</dt>
                  <dd className="max-w-xs text-right font-medium">
                    {formData.address || "Not provided"}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/"
                className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-[#292929] px-8 py-3 font-medium text-white transition-colors hover:bg-black"
              >
                Return to Home
              </Link>
              <Link
                href="/shop"
                className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#292929] px-8 py-3 font-medium text-[#292929] transition-colors hover:bg-gray-50"
              >
                Browse Our Collection
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#121212]">
      <main className="mx-auto w-full max-w-[1440px] px-6 py-20 md:px-12">
        {/* Hero Section */}
        <section className="mb-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <h1 className="font-display text-4xl font-semibold md:text-5xl">
                Create Your Dream Painting
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-[#595959]">
                Share your vision with us, and our master artists will bring it to life.
                Fill out the details below to start your custom artwork journey.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link
                href="https://cal.com/artace-studio"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border border-[#292929] px-6 py-3 font-medium text-[#292929] transition-colors hover:bg-gray-50"
              >
                Schedule a Consultation
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="grid gap-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
          <div>
            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Personal Information */}
              <div>
                <h2 className="mb-8 text-2xl font-semibold">Your Information</h2>
                <div className="grid gap-8 sm:grid-cols-2">
                  <div className="border-b border-gray-200 pb-3">
                    <input
                      type="text"
                      placeholder="Full Name *"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full outline-none text-lg placeholder:text-[#595959]"
                      autoComplete="name"
                    />
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <input
                      type="email"
                      placeholder="Email Address *"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full outline-none text-lg placeholder:text-[#595959]"
                      autoComplete="email"
                    />
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <input
                      type="tel"
                      placeholder="Phone Number *"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full outline-none text-lg placeholder:text-[#595959]"
                      autoComplete="tel"
                    />
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <input
                      type="text"
                      placeholder="Address (City, Country)"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full outline-none text-lg placeholder:text-[#595959]"
                      autoComplete="street-address"
                    />
                  </div>
                </div>
              </div>

              {/* Painting Requirements */}
              <div>
                <h2 className="mb-8 text-2xl font-semibold">Painting Requirements</h2>
                <div className="grid gap-8 sm:grid-cols-2">
                  <div className="sm:col-span-2 border-b border-gray-200 pb-3">
                    <textarea
                      placeholder="Describe your concept, theme, or idea *"
                      name="concept"
                      value={formData.concept}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full outline-none text-lg placeholder:text-[#595959] resize-none"
                    />
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <input
                      type="text"
                      placeholder="Size (e.g., 24x36 inches, A2)"
                      name="size"
                      value={formData.size}
                      onChange={handleChange}
                      className="w-full outline-none text-lg placeholder:text-[#595959]"
                    />
                  </div>
                  <CustomDropdown
                    label="Color Preferences"
                    options={COLOR_OPTIONS}
                    value={formData.colors}
                    onChange={(value) => setFormData((prev) => ({ ...prev, colors: value }))}
                    placeholder="Select color preference"
                    className="border-b border-gray-200 pb-3"
                  />
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-[#1a1a1a]">
                      Reference Images (Optional)
                    </label>
                    <ImageUpload
                      onUpload={(urls) => {
                        setUploadedImages((prev) => {
                          const newImages = urls.map((url) => ({
                            url,
                            name: url.split("/").pop() || "image",
                          }));
                          return [...prev, ...newImages];
                        });
                      }}
                      maxFiles={5}
                    />
                    {uploadedImages.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium text-[#1a1a1a]">
                          Uploaded Images ({uploadedImages.length})
                        </p>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                          {uploadedImages.map((image, index) => (
                            <div
                              key={index}
                              className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100"
                            >
                              <img
                                src={image.url}
                                alt={image.name}
                                className="h-full w-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setUploadedImages((prev) =>
                                    prev.filter((_, i) => i !== index)
                                  );
                                }}
                                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                aria-label="Remove image"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-medium text-[#1a1a1a]">
                        Or add image URLs (comma separated)
                      </label>
                      <textarea
                        placeholder="https://example.com/image1.jpg, https://example.com/image2.png"
                        name="referenceUrls"
                        value={formData.referenceUrls}
                        onChange={handleChange}
                        rows={2}
                        className="w-full border-b border-gray-200 pb-3 outline-none text-lg placeholder:text-[#595959] resize-none"
                      />
                    </div>
                  </div>
                  <CustomDropdown
                    label="Room Type"
                    options={ROOM_OPTIONS}
                    value={formData.rooms}
                    onChange={(value) => setFormData((prev) => ({ ...prev, rooms: value }))}
                    placeholder="Select room type"
                    className="border-b border-gray-200 pb-3"
                  />
                  <div className="border-b border-gray-200 pb-3">
                    <input
                      type="number"
                      placeholder="Number of paintings"
                      name="numberOfPaintings"
                      value={formData.numberOfPaintings}
                      onChange={handleChange}
                      min="1"
                      max="100"
                      className="w-full outline-none text-lg placeholder:text-[#595959]"
                    />
                  </div>
                  <CustomDropdown
                    label="Budget Range"
                    options={BUDGET_OPTIONS}
                    value={formData.budgetRange}
                    onChange={(value) => setFormData((prev) => ({ ...prev, budgetRange: value }))}
                    placeholder="Select budget range"
                    className="border-b border-gray-200 pb-3"
                  />
                  <CustomDropdown
                    label="Painting Category"
                    options={CATEGORY_OPTIONS}
                    value={formData.categories}
                    onChange={(value) => setFormData((prev) => ({ ...prev, categories: value }))}
                    placeholder="Select category"
                    className="border-b border-gray-200 pb-3"
                  />
                </div>
                <div className="mt-8 border-b border-gray-200 pb-3">
                  <textarea
                    placeholder="Additional notes or special requests"
                    name="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full outline-none text-lg placeholder:text-[#595959] resize-none"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[#595959]">
                  By submitting this form, you agree to our{" "}
                  <Link href="/privacy-policy" className="underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
                <button
                  type="submit"
                  disabled={submission.status === "submitting"}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-md bg-[#292929] px-10 py-3 text-lg font-medium text-white transition-colors hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submission.status === "submitting"
                    ? "Submitting..."
                    : "Submit Custom Order Request"}
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>

              {submission.status === "error" && (
                <div className="rounded-md bg-red-50 p-4 text-red-700">
                  {submission.errorMessage ||
                    "Failed to submit. Please try again."}
                </div>
              )}
            </form>
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-[120px]">
            <div className="rounded-xl bg-[#f5f1ec] p-8">
              <h3 className="mb-6 text-2xl font-semibold">What Happens Next?</h3>
              <ol className="space-y-6">
                <li className="flex gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#292929] text-white font-medium">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold">Review</h4>
                    <p className="mt-1 text-[#595959]">
                      Our art consultants will review your requirements within 24
                      hours.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#292929] text-white font-medium">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold">Consultation</h4>
                    <p className="mt-1 text-[#595959]">
                      We&apos;ll contact you to discuss details, answer questions, and
                      provide a quote.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#292929] text-white font-medium">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold">Creation</h4>
                    <p className="mt-1 text-[#595959]">
                      Our master artists will start creating your custom painting
                      with regular updates.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#292929] text-white font-medium">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold">Delivery</h4>
                    <p className="mt-1 text-[#595959]">
                      Your finished artwork will be carefully packaged and shipped
                      to your address.
                    </p>
                  </div>
                </li>
              </ol>
              <div className="mt-10 border-t border-[#B2ABA1] pt-8">
                <h4 className="mb-4 font-semibold">Need Immediate Help?</h4>
                <p className="mb-4 text-[#595959]">
                  Call or WhatsApp our dedicated custom order team:
                </p>
                <a
                  href="tel:+919657609102"
                  className="inline-flex items-center gap-2 font-medium text-[#292929] hover:underline"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  +91 9657609102
                </a>
              </div>
            </div>

            <div className="mt-8 rounded-xl bg-[#f9f9f9] p-8">
              <h3 className="mb-4 text-xl font-semibold">Why Choose Artace Studio?</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>100% hand-painted originals</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Unlimited revisions until satisfied</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Worldwide insured shipping</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Certificate of authenticity included</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
