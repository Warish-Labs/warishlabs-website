// Internal analytics event names for tracking site interactions

export const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',
  CLICK_CTA: 'click_cta',
  SEARCH: 'search',
  CONTACT_SUBMIT: 'contact_submit',
  NEWSLETTER_SUBSCRIBE: 'newsletter_subscribe',
  NEWSLETTER_UNSUBSCRIBE: 'newsletter_unsubscribe',
  PRODUCT_VIEW: 'product_view',
  PRODUCT_CLICK: 'product_click',
  BLOG_VIEW: 'blog_view',
  LAB_VIEW: 'lab_view',
  OPEN_SOURCE_CLICK: 'open_source_click',
} as const;

export type AnalyticsEventName = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];
