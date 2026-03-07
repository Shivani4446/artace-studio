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

## WooCommerce Checkout Env

To create WooCommerce orders from Next.js (`POST /api/checkout`), set:

```bash
WOOCOMMERCE_SITE_URL=https://artacestudio.com
WOOCOMMERCE_CONSUMER_KEY=ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WOOCOMMERCE_PAYMENT_METHOD=bacs
WOOCOMMERCE_PAYMENT_METHOD_TITLE=Direct Bank Transfer
```

Notes:
- `WOOCOMMERCE_CONSUMER_KEY` and `WOOCOMMERCE_CONSUMER_SECRET` must be server-side only.
- `WOOCOMMERCE_PAYMENT_METHOD` should match an enabled WooCommerce gateway ID (`cod`, `bacs`, etc.).

## Customer Login + Order History

To allow users to login in Next.js with their WordPress account and view order history at `/dashboard/orders`, set:

```bash
WORDPRESS_JWT_AUTH_URL=https://artacestudio.com/wp-json/jwt-auth/v1/token
```

Notes:
- This requires a WordPress JWT auth plugin endpoint at `/wp-json/jwt-auth/v1/token`.
- Orders shown in Next.js are fetched from WooCommerce for the logged-in WordPress customer.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
