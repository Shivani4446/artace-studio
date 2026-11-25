// Shared constants for the evergreen site-wide offer (PromotionBar +
// PromotionModal). The code must exist in WooCommerce as a 15% percentage
// coupon with no usage limit, or checkout will reject it.
export const EVERGREEN_COUPON_CODE = "ARTACE15";
export const EVERGREEN_DISCOUNT_PERCENT = 15;

// Fired by the bar's "Get your code" button; the modal listens for it.
export const OPEN_PROMOTION_EVENT = "artace:open-promotion";

// Session flag: the visitor has seen/closed the popup, so it won't auto-open
// again this session (the bar button can still open it).
export const PROMOTION_SEEN_STORAGE_KEY = "hasSeenArtaceOfferModal";
