// Format currency in Naira
export function formatPrice(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount)
}

// Format date
export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Platform display names, domains, and icons
export const PLATFORMS = [
  // === Social Media ===
  { value: 'instagram', label: 'Instagram', domain: 'instagram.com' },
  { value: 'facebook', label: 'Facebook', domain: 'facebook.com' },
  { value: 'twitter', label: 'Twitter / X', domain: 'x.com' },
  { value: 'tiktok', label: 'TikTok', domain: 'tiktok.com' },
  { value: 'youtube', label: 'YouTube', domain: 'youtube.com' },
  { value: 'telegram', label: 'Telegram', domain: 'telegram.org' },
  { value: 'whatsapp', label: 'WhatsApp', domain: 'web.whatsapp.com' },
  { value: 'snapchat', label: 'Snapchat', domain: 'snapchat.com' },
  { value: 'linkedin', label: 'LinkedIn', domain: 'linkedin.com' },
  { value: 'discord', label: 'Discord', domain: 'discord.com' },
  { value: 'reddit', label: 'Reddit', domain: 'reddit.com' },
  { value: 'pinterest', label: 'Pinterest', domain: 'pinterest.com' },
  { value: 'twitch', label: 'Twitch', domain: 'twitch.tv' },

  // === Streaming & Entertainment ===
  { value: 'netflix', label: 'Netflix', domain: 'netflix.com' },
  { value: 'disney_plus', label: 'Disney+', domain: 'disneyplus.com' },
  { value: 'hulu', label: 'Hulu', domain: 'hulu.com' },
  { value: 'amazon_prime', label: 'Amazon Prime Video', domain: 'primevideo.com' },
  { value: 'hbo_max', label: 'HBO Max', domain: 'max.com' },
  { value: 'apple_tv', label: 'Apple TV+', domain: 'tv.apple.com' },
  { value: 'paramount_plus', label: 'Paramount+', domain: 'paramountplus.com' },
  { value: 'peacock', label: 'Peacock', domain: 'peacocktv.com' },
  { value: 'showmax', label: 'Showmax', domain: 'showmax.com' },
  { value: 'spotify', label: 'Spotify', domain: 'spotify.com' },
  { value: 'soundcloud', label: 'SoundCloud', domain: 'soundcloud.com' },
  { value: 'youtube_premium', label: 'YouTube Premium', domain: 'youtube.com' },

  // === VPN Services ===
  { value: 'nordvpn', label: 'NordVPN', domain: 'nordvpn.com' },
  { value: 'expressvpn', label: 'ExpressVPN', domain: 'expressvpn.com' },
  { value: 'surfshark', label: 'Surfshark', domain: 'surfshark.com' },
  { value: 'cyberghost', label: 'CyberGhost', domain: 'cyberghost.com' },
  { value: 'protonvpn', label: 'ProtonVPN', domain: 'protonvpn.com' },
  { value: 'private_internet_access', label: 'Private Internet Access', domain: 'privateinternetaccess.com' },
  { value: 'windscribe', label: 'Windscribe', domain: 'windscribe.com' },
  { value: 'hotspot_shield', label: 'Hotspot Shield', domain: 'hotspotshield.com' },
  { value: 'tunnelbear', label: 'TunnelBear', domain: 'tunnelbear.com' },
  { value: 'vpn_generic', label: 'Other VPN Service', domain: null },

  // === Email Mailboxes ===
  { value: 'gmail', label: 'Gmail', domain: 'gmail.com' },
  { value: 'outlook', label: 'Outlook / Hotmail', domain: 'outlook.com' },
  { value: 'yahoo_mail', label: 'Yahoo Mail', domain: 'mail.yahoo.com' },
  { value: 'protonmail', label: 'ProtonMail', domain: 'proton.me' },
  { value: 'icloud_mail', label: 'iCloud Mail', domain: 'icloud.com' },
  { value: 'aol', label: 'AOL Mail', domain: 'aol.com' },
  { value: 'zoho_mail', label: 'Zoho Mail', domain: 'zoho.com' },
  { value: 'yandex', label: 'Yandex Mail', domain: 'yandex.com' },
  { value: 'mail_ru', label: 'Mail.ru', domain: 'mail.ru' },

  // === Dating Sites ===
  { value: 'tinder', label: 'Tinder', domain: 'tinder.com' },
  { value: 'bumble', label: 'Bumble', domain: 'bumble.com' },
  { value: 'hinge', label: 'Hinge', domain: 'hinge.co' },
  { value: 'okcupid', label: 'OkCupid', domain: 'okcupid.com' },
  { value: 'grindr', label: 'Grindr', domain: 'grindr.com' },
  { value: 'match', label: 'Match.com', domain: 'match.com' },
  { value: 'eharmony', label: 'eHarmony', domain: 'eharmony.com' },
  { value: 'plenty_of_fish', label: 'Plenty of Fish', domain: 'pof.com' },
  { value: 'badoo', label: 'Badoo', domain: 'badoo.com' },
  { value: 'ashley_madison', label: 'Ashley Madison', domain: 'ashleymadison.com' },

  // === Gaming Platforms ===
  { value: 'steam', label: 'Steam', domain: 'store.steampowered.com' },
  { value: 'epic_games', label: 'Epic Games', domain: 'epicgames.com' },
  { value: 'xbox_live', label: 'Xbox Live', domain: 'xbox.com' },
  { value: 'playstation_network', label: 'PlayStation Network', domain: 'playstation.com' },
  { value: 'nintendo_account', label: 'Nintendo Account', domain: 'nintendo.com' },
  { value: 'roblox', label: 'Roblox', domain: 'roblox.com' },
  { value: 'fortnite', label: 'Fortnite', domain: 'fortnite.com' },
  { value: 'minecraft', label: 'Minecraft', domain: 'minecraft.net' },

  // === Nigerian Banks ===
  { value: 'access_bank', label: 'Access Bank', domain: 'accessbankplc.com' },
  { value: 'first_bank', label: 'First Bank', domain: 'firstbanknigeria.com' },
  { value: 'gtbank', label: 'GTBank', domain: 'gtbank.com' },
  { value: 'uba', label: 'UBA', domain: 'ubagroup.com' },
  { value: 'zenith_bank', label: 'Zenith Bank', domain: 'zenithbank.com' },
  { value: 'kuda', label: 'Kuda Bank', domain: 'kuda.com' },
  { value: 'opay', label: 'OPay', domain: 'opay.io' },
  { value: 'palmpay', label: 'PalmPay', domain: 'palmpay.com' },
  { value: 'moniepoint', label: 'Moniepoint', domain: 'moniepoint.com' },
  { value: 'sterling_bank', label: 'Sterling Bank', domain: 'sterling.ng' },
  { value: 'fidelity_bank', label: 'Fidelity Bank', domain: 'fidelitybank.ng' },
  { value: 'polaris_bank', label: 'Polaris Bank', domain: 'polarisbanklimited.com' },
  { value: 'wema_bank', label: 'Wema Bank', domain: 'wemabank.com' },
  { value: 'stanbic_ibtc', label: 'Stanbic IBTC', domain: 'stanbicibtc.com' },
  { value: 'fcmb', label: 'FCMB', domain: 'fcmb.com' },

  // === US Banks ===
  { value: 'chase', label: 'Chase Bank (US)', domain: 'chase.com' },
  { value: 'bank_of_america', label: 'Bank of America (US)', domain: 'bankofamerica.com' },
  { value: 'wells_fargo', label: 'Wells Fargo (US)', domain: 'wellsfargo.com' },
  { value: 'citi', label: 'Citibank (US)', domain: 'citi.com' },
  { value: 'capital_one', label: 'Capital One (US)', domain: 'capitalone.com' },
  { value: 'us_bank', label: 'U.S. Bank (US)', domain: 'usbank.com' },
  { value: 'pnc', label: 'PNC Bank (US)', domain: 'pnc.com' },
  { value: 'goldman_sachs', label: 'Goldman Sachs (US)', domain: 'goldmansachs.com' },
  { value: 'truist', label: 'Truist Bank (US)', domain: 'truist.com' },
  { value: 'td_bank_us', label: 'TD Bank (US)', domain: 'tdbank.com' },
  { value: 'ally_bank', label: 'Ally Bank (US)', domain: 'ally.com' },

  // === UK Banks ===
  { value: 'barclays_uk', label: 'Barclays (UK)', domain: 'barclays.co.uk' },
  { value: 'hsbc_uk', label: 'HSBC UK', domain: 'hsbc.co.uk' },
  { value: 'lloyds', label: 'Lloyds Bank (UK)', domain: 'lloydsbank.com' },
  { value: 'natwest', label: 'NatWest (UK)', domain: 'natwest.com' },
  { value: 'santander_uk', label: 'Santander UK', domain: 'santander.co.uk' },
  { value: 'halifax', label: 'Halifax (UK)', domain: 'halifax.co.uk' },
  { value: 'nationwide', label: 'Nationwide (UK)', domain: 'nationwide.co.uk' },
  { value: 'tsb', label: 'TSB Bank (UK)', domain: 'tsb.co.uk' },
  { value: 'metro_bank', label: 'Metro Bank (UK)', domain: 'metrobankonline.co.uk' },
  { value: 'starling', label: 'Starling Bank (UK)', domain: 'starlingbank.com' },
  { value: 'monzo', label: 'Monzo (UK)', domain: 'monzo.com' },
  { value: 'revolut_uk', label: 'Revolut (UK)', domain: 'revolut.com' },

  // === Phone Numbers by Country ===
  { value: 'phone_nigeria', label: 'Nigeria Phone Number', domain: null },
  { value: 'phone_usa', label: 'USA Phone Number', domain: null },
  { value: 'phone_uk', label: 'UK Phone Number', domain: null },
  { value: 'phone_canada', label: 'Canada Phone Number', domain: null },
  { value: 'phone_ghana', label: 'Ghana Phone Number', domain: null },
  { value: 'phone_south_africa', label: 'South Africa Phone Number', domain: null },
  { value: 'phone_india', label: 'India Phone Number', domain: null },
  { value: 'phone_australia', label: 'Australia Phone Number', domain: null },
  { value: 'phone_germany', label: 'Germany Phone Number', domain: null },
  { value: 'phone_france', label: 'France Phone Number', domain: null },
  { value: 'phone_china', label: 'China Phone Number', domain: null },
  { value: 'phone_brazil', label: 'Brazil Phone Number', domain: null },
  { value: 'phone_mexico', label: 'Mexico Phone Number', domain: null },
  { value: 'phone_uae', label: 'UAE Phone Number', domain: null },

  // === Generic / Other ===
  { value: 'bank_account', label: 'Bank Account (Generic)', domain: null },
  { value: 'phone_number', label: 'Phone Number (Generic)', domain: null },
  { value: 'api_service', label: 'API Service', domain: null },
  { value: 'software_license', label: 'Software License', domain: null },
  { value: 'domain_name', label: 'Domain Name', domain: null },
  { value: 'hosting_account', label: 'Web Hosting Account', domain: null },
  { value: 'other', label: 'Other', domain: null },
]

// Product types - expanded to support new categories
export const PRODUCT_TYPES = [
  { value: 'account', label: 'Social Media Account' },
  { value: 'streaming', label: 'Streaming Subscription' },
  { value: 'vpn', label: 'VPN Account' },
  { value: 'email', label: 'Email Account' },
  { value: 'dating', label: 'Dating Profile' },
  { value: 'gaming', label: 'Gaming Account' },
  { value: 'bank', label: 'Bank Account' },
  { value: 'phone', label: 'Phone Number' },
  { value: 'service', label: 'API / Web Service' },
  { value: 'software', label: 'Software License' },
  { value: 'other', label: 'Other Digital Product' },
]

// Get platform by value
export function getPlatform(val) {
  return PLATFORMS.find(p => p.value === val)
}

export function getPlatformLabel(val) {
  return getPlatform(val)?.label || val
}

export function getTypeLabel(val) {
  return PRODUCT_TYPES.find(t => t.value === val)?.label || val
}

// 🎯 Get platform logo URL using free favicon API (favicon.im)
// Alternative: logos.apistemic.com for higher quality (requires attribution)
export function getPlatformLogoUrl(platformValue, { size = 'default', api = 'favicon-im' } = {}) {
  const platform = getPlatform(platformValue)
  
  // If no domain, return null for fallback handling
  if (!platform?.domain) return null
  
  const domain = platform.domain
  
  if (api === 'apistemic') {
    // Higher quality logos, requires attribution: "Logos by apistemic logos"
    // https://logos.apistemic.com/
    return `https://logos-api.apistemic.com/domain:${domain}`
  }
  
  // Default: favicon.im - simple, reliable, no attribution needed [[1]]
  // Use larger=true for better visibility on product cards
  const sizeParam = size === 'large' ? '?larger=true' : ''
  return `https://favicon.im/${domain}${sizeParam}`
}

// Get first letter for fallback badge
export function getPlatformInitial(platformValue) {
  const platform = getPlatform(platformValue)
  return platform?.label?.charAt(0)?.toUpperCase() || '?'
}

// Calculate order breakdown
export function calcOrderBreakdown(productPrice) {
  const subtotal = Number(productPrice)
  const platformFee = 500
  const commission = Math.round(subtotal * 0.15)
  const supplierShare = subtotal - commission
  const totalPrice = subtotal + platformFee
  return { subtotal, platformFee, commission, supplierShare, totalPrice }
}

// Truncate text
export function truncate(str, len = 80) {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '...' : str
}