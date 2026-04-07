This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## WooCommerce + Razorpay Checkout Env

To create WooCommerce orders from Next.js and initialize Razorpay checkout (`POST /api/checkout`), set:

```bash
WOOCOMMERCE_SITE_URL=https://www.artacestudio.com
WOOCOMMERCE_CONSUMER_KEY=ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WOOCOMMERCE_PAYMENT_METHOD=razorpay
WOOCOMMERCE_PAYMENT_METHOD_TITLE=Razorpay
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxx
```

Notes:
- `WOOCOMMERCE_CONSUMER_KEY` and `WOOCOMMERCE_CONSUMER_SECRET` must be server-side only.
- `WOOCOMMERCE_PAYMENT_METHOD` should match the gateway ID stored on Woo orders. For this flow it should stay aligned to `razorpay`.
- If `https://YOUR_DOMAIN/wp-json/wc/v3/*` returns `404`, set `WOOCOMMERCE_REST_URL` to the origin that actually serves WordPress/Woo REST (for example `https://api.yourdomain.com`).
- If WordPress is installed under a subpath, set `WOOCOMMERCE_WP_JSON_PREFIX` accordingly (for example `/wordpress/wp-json`).
- `RAZORPAY_KEY_ID` is returned by the checkout API and used by the browser to open Razorpay Checkout.
- `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` must remain server-side only.
- Point your Razorpay webhook at `POST /api/razorpay/webhook`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
