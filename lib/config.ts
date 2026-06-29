import prisma from './prisma';

export interface BusinessConfig {
  companyName: string;
  siteUrl: string;
  contactEmail: string;
  supportEmail: string;
  canonicalUrl: string;
  phone: string;
  address: string;
  githubUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
}

export async function getBusinessConfig(): Promise<BusinessConfig> {
  // 1. Fetch all settings from the database SiteSetting model
  const dbSettings = await prisma.siteSetting.findMany().catch(() => []);
  const settingsMap = dbSettings.reduce((acc, curr) => {
    acc[curr.id] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  // 2. Fetch social links from the social/homepage sections
  const [socialSection, contactSection] = await Promise.all([
    prisma.homepageSection.findUnique({ where: { sectionType: 'social' } }).catch(() => null),
    prisma.homepageSection.findUnique({ where: { sectionType: 'contact' } }).catch(() => null),
  ]);

  const socialConfig = (socialSection?.config as Record<string, string>) || {};
  const contactConfig = (contactSection?.config as Record<string, string>) || {};

  // 3. Resolve configs (Env variable -> DB SiteSetting override -> defaults)
  const companyName = 
    process.env.NEXT_PUBLIC_COMPANY_NAME || 
    settingsMap['site_name'] || 
    'WarishLabs';

  const siteUrl = 
    process.env.NEXT_PUBLIC_APP_URL || 
    process.env.NEXT_PUBLIC_SITE_URL || 
    settingsMap['site_url'] || 
    'https://warishlabs.in';

  const contactEmail = 
    process.env.NEXT_PUBLIC_CONTACT_EMAIL || 
    contactConfig.email || 
    settingsMap['contact_email'] || 
    'contact@warishlabs.in';

  const supportEmail = 
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 
    contactEmail;

  const canonicalUrl = 
    process.env.NEXT_PUBLIC_CANONICAL_URL || 
    settingsMap['canonical_url'] || 
    'warishlabs.in';

  return {
    companyName,
    siteUrl,
    contactEmail,
    supportEmail,
    canonicalUrl,
    phone: contactConfig.phone || '',
    address: contactConfig.address || 'New Delhi, India',
    githubUrl: socialConfig.githubUrl || 'https://github.com/warishlabs',
    twitterUrl: socialConfig.twitterUrl || '',
    linkedinUrl: socialConfig.linkedinUrl || '',
    youtubeUrl: socialConfig.youtubeUrl || '',
  };
}
