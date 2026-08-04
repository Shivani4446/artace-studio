"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type MakeAnOfferFormProps = {
  productId: number;
  productSlug: string;
  productName: string;
  productImage: string;
  currencySymbol: string;
  listedPrice: number | null;
};

type OfferFormData = {
  offerAmount: string;
  name: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
};

type SubmissionState = {
  status: "idle" | "submitting" | "success" | "error";
  offerId?: string;
  errorMessage?: string;
};

const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

const MakeAnOfferForm = ({
  productId,
  productSlug,
  productName,
  productImage,
  currencySymbol,
  listedPrice,
}: MakeAnOfferFormProps) => {
  const [formData, setFormData] = useState<OfferFormData>({
    offerAmount: "",
    name: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postcode: "",
    country: "IN",
  });

  const [submission, setSubmission] = useState<SubmissionState>({ status: "idle" });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidEmail(formData.email)) {
      setSubmission({ status: "error", errorMessage: "Please provide a valid email address." });
      return;
    }

    const offerAmountNumber = Number(formData.offerAmount);
    if (!Number.isFinite(offerAmountNumber) || offerAmountNumber <= 0) {
      setSubmission({ status: "error", errorMessage: "Please enter a valid offer amount." });
      return;
    }

    setSubmission({ status: "submitting" });

    try {
      const response = await fetch("/api/photography-offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          productName,
          productSlug,
          offerAmount: formData.offerAmount,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address1: formData.address1,
          address2: formData.address2,
          city: formData.city,
          state: formData.state,
          postcode: formData.postcode,
          country: formData.country,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to submit your offer.");
      }

      const data = await response.json();
      setSubmission({ status: "success", offerId: data.offerId });
    } catch (error) {
      setSubmission({
        status: "error",
        errorMessage: error instanceof Error ? error.message : "An unexpected error occurred.",
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
              Offer Submitted!
            </h1>
            <p className="mt-4 text-lg text-[#595959]">
              We&apos;ve sent your offer of {currencySymbol}
              {Number(formData.offerAmount).toLocaleString("en-IN")} on {productName} to our
              team. You&apos;ll hear back within 48 hours.
            </p>
            <div className="mt-10 rounded-lg border border-gray-200 bg-[#f9f9f9] p-6 text-left">
              <h2 className="mb-4 text-xl font-semibold">Your Offer Details</h2>
              <dl className="space-y-3">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <dt className="text-[#595959]">Offer ID:</dt>
                  <dd className="font-medium">{submission.offerId}</dd>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <dt className="text-[#595959]">Offer Amount:</dt>
                  <dd className="font-medium">
                    {currencySymbol}
                    {Number(formData.offerAmount).toLocaleString("en-IN")}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#595959]">Email:</dt>
                  <dd className="font-medium">{formData.email}</dd>
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
                href={`/shop/${productSlug}`}
                className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#292929] px-8 py-3 font-medium text-[#292929] transition-colors hover:bg-gray-50"
              >
                Back to This Piece
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
        <section className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-start">
          <div>
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[16px] bg-[#f3f0ea]">
              <Image
                src={productImage}
                alt={productName}
                fill
                className="object-cover"
                sizes="(max-width: 1023px) 100vw, 40vw"
              />
            </div>
            <h1 className="mt-6 font-display text-2xl font-semibold text-[#1f1f1f] md:text-3xl">
              {productName}
            </h1>
            {listedPrice !== null && (
              <p className="mt-2 text-lg text-[#595959]">
                Listed at {currencySymbol}
                {listedPrice.toLocaleString("en-IN")}
              </p>
            )}
          </div>

          <div>
            <h2 className="font-display text-3xl font-semibold md:text-4xl">Make an Offer</h2>
            <div className="mt-6 space-y-5 text-[16px] leading-relaxed text-[#3a3a3a]">
              <p>
                Found your perfect piece but need some price flexibility? Make an offer, and if
                the artist says yes, it becomes yours instantly! Submit your offer. Tell us what
                you can pay, and we&apos;ll present it to the artist on your behalf.
              </p>
              <p>
                Get a response within 48 hours. We&apos;ll quickly share the artist&apos;s
                decision with you.
              </p>
              <p>
                If accepted, the artwork is immediately yours! We&apos;ll process your purchase
                and start confirming the shipping arrangements.
              </p>
              <p className="text-[14px] text-[#666]">
                Keep in mind: The artwork remains available to other collectors until your offer
                is accepted. Promotional codes apply only to full-price purchases. To see a total
                estimated price, including all applicable customs duties and taxes, proceed to
                complete the following steps and enter your shipping address.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-10 space-y-10">
              <div>
                <h3 className="mb-6 text-xl font-semibold">Your Offer</h3>
                <div className="border-b border-gray-200 pb-3">
                  <label className="mb-2 block text-sm font-medium text-[#1a1a1a]">
                    Your Offer Amount ({currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    name="offerAmount"
                    value={formData.offerAmount}
                    onChange={handleChange}
                    min="1"
                    required
                    placeholder="Enter your offer"
                    className="w-full outline-none text-lg placeholder:text-[#595959]"
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-6 text-xl font-semibold">Your Information</h3>
                <div className="grid gap-8 sm:grid-cols-2">
                  <div className="border-b border-gray-200 pb-3">
                    <label className="mb-2 block text-sm font-medium text-[#1a1a1a]">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your full name"
                      className="w-full outline-none text-lg placeholder:text-[#595959]"
                    />
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <label className="mb-2 block text-sm font-medium text-[#1a1a1a]">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="you@example.com"
                      className="w-full outline-none text-lg placeholder:text-[#595959]"
                    />
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <label className="mb-2 block text-sm font-medium text-[#1a1a1a]">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="Your phone number"
                      className="w-full outline-none text-lg placeholder:text-[#595959]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-6 text-xl font-semibold">Shipping Address</h3>
                <div className="grid gap-8 sm:grid-cols-2">
                  <div className="border-b border-gray-200 pb-3 sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-[#1a1a1a]">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      name="address1"
                      value={formData.address1}
                      onChange={handleChange}
                      required
                      placeholder="Street address"
                      className="w-full outline-none text-lg placeholder:text-[#595959]"
                    />
                  </div>
                  <div className="border-b border-gray-200 pb-3 sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-[#1a1a1a]">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      name="address2"
                      value={formData.address2}
                      onChange={handleChange}
                      placeholder="Apartment, suite, etc. (optional)"
                      className="w-full outline-none text-lg placeholder:text-[#595959]"
                    />
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <label className="mb-2 block text-sm font-medium text-[#1a1a1a]">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      placeholder="City"
                      className="w-full outline-none text-lg placeholder:text-[#595959]"
                    />
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <label className="mb-2 block text-sm font-medium text-[#1a1a1a]">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      placeholder="State"
                      className="w-full outline-none text-lg placeholder:text-[#595959]"
                    />
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <label className="mb-2 block text-sm font-medium text-[#1a1a1a]">
                      Postcode *
                    </label>
                    <input
                      type="text"
                      name="postcode"
                      value={formData.postcode}
                      onChange={handleChange}
                      required
                      placeholder="PIN / ZIP code"
                      className="w-full outline-none text-lg placeholder:text-[#595959]"
                    />
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <label className="mb-2 block text-sm font-medium text-[#1a1a1a]">
                      Country *
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      placeholder="Country"
                      className="w-full outline-none text-lg placeholder:text-[#595959]"
                    />
                  </div>
                </div>
              </div>

              {submission.status === "error" && (
                <p className="text-sm text-red-600">
                  {submission.errorMessage || "Something went wrong. Please try again."}
                </p>
              )}

              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[#595959]">
                  By submitting this offer, you agree to our{" "}
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
                  {submission.status === "submitting" ? "Submitting..." : "Submit Offer"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MakeAnOfferForm;
