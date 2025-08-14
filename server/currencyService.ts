import { storage } from './storage';

// Exchange rate API service (using exchangerate-api.com as example)
const EXCHANGE_RATE_API_BASE = 'https://v6.exchangerate-api.com/v6';

export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  rate: string;
  isActive: boolean;
  lastUpdated: Date | null;
  createdAt: Date | null;
}

export interface ExchangeRateResponse {
  result: string;
  documentation: string;
  terms_of_use: string;
  time_last_update_unix: number;
  time_last_update_utc: string;
  time_next_update_unix: number;
  time_next_update_utc: string;
  base_code: string;
  conversion_rates: Record<string, number>;
}

// Default currencies available in the system
const DEFAULT_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.85 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.73 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.25 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.35 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 110 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 6.45 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 75 },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', rate: 5.2 },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', rate: 18.5 },
  { code: 'XCD', name: 'Eastern Caribbean Dollar', symbol: 'EC$', rate: 2.70 }
];

// World currencies database (subset for demonstration)
export const WORLD_CURRENCIES = {
  'AED': { name: 'UAE Dirham', symbol: 'د.إ' },
  'AFN': { name: 'Afghan Afghani', symbol: '؋' },
  'ALL': { name: 'Albanian Lek', symbol: 'L' },
  'AMD': { name: 'Armenian Dram', symbol: '֏' },
  'ANG': { name: 'Netherlands Antillean Guilder', symbol: 'ƒ' },
  'AOA': { name: 'Angolan Kwanza', symbol: 'Kz' },
  'ARS': { name: 'Argentine Peso', symbol: '$' },
  'AWG': { name: 'Aruban Florin', symbol: 'ƒ' },
  'AZN': { name: 'Azerbaijani Manat', symbol: '₼' },
  'BAM': { name: 'Bosnia and Herzegovina Convertible Mark', symbol: 'КМ' },
  'BBD': { name: 'Barbadian Dollar', symbol: '$' },
  'BDT': { name: 'Bangladeshi Taka', symbol: '৳' },
  'BGN': { name: 'Bulgarian Lev', symbol: 'лв' },
  'BHD': { name: 'Bahraini Dinar', symbol: '.د.ب' },
  'BIF': { name: 'Burundian Franc', symbol: 'Fr' },
  'BMD': { name: 'Bermudian Dollar', symbol: '$' },
  'BND': { name: 'Brunei Dollar', symbol: '$' },
  'BOB': { name: 'Bolivian Boliviano', symbol: 'Bs.' },
  'BSD': { name: 'Bahamian Dollar', symbol: '$' },
  'BTN': { name: 'Bhutanese Ngultrum', symbol: 'Nu.' },
  'BWP': { name: 'Botswanan Pula', symbol: 'P' },
  'BYN': { name: 'Belarusian Ruble', symbol: 'Br' },
  'BZD': { name: 'Belize Dollar', symbol: '$' },
  'CDF': { name: 'Congolese Franc', symbol: 'Fr' },
  'CHF': { name: 'Swiss Franc', symbol: 'Fr' },
  'CLP': { name: 'Chilean Peso', symbol: '$' },
  'COP': { name: 'Colombian Peso', symbol: '$' },
  'CRC': { name: 'Costa Rican Colón', symbol: '₡' },
  'CUP': { name: 'Cuban Peso', symbol: '$' },
  'CVE': { name: 'Cape Verdean Escudo', symbol: '$' },
  'CZK': { name: 'Czech Koruna', symbol: 'Kč' },
  'DJF': { name: 'Djiboutian Franc', symbol: 'Fr' },
  'DKK': { name: 'Danish Krone', symbol: 'kr' },
  'DOP': { name: 'Dominican Peso', symbol: '$' },
  'DZD': { name: 'Algerian Dinar', symbol: 'د.ج' },
  'EGP': { name: 'Egyptian Pound', symbol: 'ج.م' },
  'ERN': { name: 'Eritrean Nakfa', symbol: 'Nfk' },
  'ETB': { name: 'Ethiopian Birr', symbol: 'Br' },
  'FJD': { name: 'Fijian Dollar', symbol: '$' },
  'FKP': { name: 'Falkland Islands Pound', symbol: '£' },
  'GEL': { name: 'Georgian Lari', symbol: 'ლ' },
  'GGP': { name: 'Guernsey Pound', symbol: '£' },
  'GHS': { name: 'Ghanaian Cedi', symbol: '₵' },
  'GIP': { name: 'Gibraltar Pound', symbol: '£' },
  'GMD': { name: 'Gambian Dalasi', symbol: 'D' },
  'GNF': { name: 'Guinean Franc', symbol: 'Fr' },
  'GTQ': { name: 'Guatemalan Quetzal', symbol: 'Q' },
  'GYD': { name: 'Guyanese Dollar', symbol: '$' },
  'HKD': { name: 'Hong Kong Dollar', symbol: '$' },
  'HNL': { name: 'Honduran Lempira', symbol: 'L' },
  'HRK': { name: 'Croatian Kuna', symbol: 'kn' },
  'HTG': { name: 'Haitian Gourde', symbol: 'G' },
  'HUF': { name: 'Hungarian Forint', symbol: 'Ft' },
  'IDR': { name: 'Indonesian Rupiah', symbol: 'Rp' },
  'ILS': { name: 'Israeli Shekel', symbol: '₪' },
  'IMP': { name: 'Isle of Man Pound', symbol: '£' },
  'IQD': { name: 'Iraqi Dinar', symbol: 'ع.د' },
  'IRR': { name: 'Iranian Rial', symbol: '﷼' },
  'ISK': { name: 'Icelandic Króna', symbol: 'kr' },
  'JEP': { name: 'Jersey Pound', symbol: '£' },
  'JMD': { name: 'Jamaican Dollar', symbol: '$' },
  'JOD': { name: 'Jordanian Dinar', symbol: 'د.ا' },
  'KES': { name: 'Kenyan Shilling', symbol: 'Sh' },
  'KGS': { name: 'Kyrgystani Som', symbol: 'с' },
  'KHR': { name: 'Cambodian Riel', symbol: '៛' },
  'KMF': { name: 'Comorian Franc', symbol: 'Fr' },
  'KPW': { name: 'North Korean Won', symbol: '₩' },
  'KRW': { name: 'South Korean Won', symbol: '₩' },
  'KWD': { name: 'Kuwaiti Dinar', symbol: 'د.ك' },
  'KYD': { name: 'Cayman Islands Dollar', symbol: '$' },
  'KZT': { name: 'Kazakhstani Tenge', symbol: '₸' },
  'LAK': { name: 'Lao Kip', symbol: '₭' },
  'LBP': { name: 'Lebanese Pound', symbol: 'ل.ل' },
  'LKR': { name: 'Sri Lankan Rupee', symbol: 'Rs' },
  'LRD': { name: 'Liberian Dollar', symbol: '$' },
  'LSL': { name: 'Lesotho Loti', symbol: 'L' },
  'LYD': { name: 'Libyan Dinar', symbol: 'ل.د' },
  'MAD': { name: 'Moroccan Dirham', symbol: 'د.م.' },
  'MDL': { name: 'Moldovan Leu', symbol: 'L' },
  'MGA': { name: 'Malagasy Ariary', symbol: 'Ar' },
  'MKD': { name: 'Macedonian Denar', symbol: 'ден' },
  'MMK': { name: 'Myanmar Kyat', symbol: 'Ks' },
  'MNT': { name: 'Mongolian Tugrik', symbol: '₮' },
  'MOP': { name: 'Macanese Pataca', symbol: 'P' },
  'MRU': { name: 'Mauritanian Ouguiya', symbol: 'UM' },
  'MUR': { name: 'Mauritian Rupee', symbol: '₨' },
  'MVR': { name: 'Maldivian Rufiyaa', symbol: '.ރ' },
  'MWK': { name: 'Malawian Kwacha', symbol: 'MK' },
  'MYR': { name: 'Malaysian Ringgit', symbol: 'RM' },
  'MZN': { name: 'Mozambican Metical', symbol: 'MT' },
  'NAD': { name: 'Namibian Dollar', symbol: '$' },
  'NGN': { name: 'Nigerian Naira', symbol: '₦' },
  'NIO': { name: 'Nicaraguan Córdoba', symbol: 'C$' },
  'NOK': { name: 'Norwegian Krone', symbol: 'kr' },
  'NPR': { name: 'Nepalese Rupee', symbol: '₨' },
  'NZD': { name: 'New Zealand Dollar', symbol: '$' },
  'OMR': { name: 'Omani Rial', symbol: 'ر.ع.' },
  'PAB': { name: 'Panamanian Balboa', symbol: 'B/.' },
  'PEN': { name: 'Peruvian Sol', symbol: 'S/' },
  'PGK': { name: 'Papua New Guinean Kina', symbol: 'K' },
  'PHP': { name: 'Philippine Peso', symbol: '₱' },
  'PKR': { name: 'Pakistani Rupee', symbol: '₨' },
  'PLN': { name: 'Polish Złoty', symbol: 'zł' },
  'PYG': { name: 'Paraguayan Guaraní', symbol: '₲' },
  'QAR': { name: 'Qatari Riyal', symbol: 'ر.ق' },
  'RON': { name: 'Romanian Leu', symbol: 'lei' },
  'RSD': { name: 'Serbian Dinar', symbol: 'дин.' },
  'RUB': { name: 'Russian Ruble', symbol: '₽' },
  'RWF': { name: 'Rwandan Franc', symbol: 'Fr' },
  'SAR': { name: 'Saudi Riyal', symbol: 'ر.س' },
  'SBD': { name: 'Solomon Islands Dollar', symbol: '$' },
  'SCR': { name: 'Seychellois Rupee', symbol: '₨' },
  'SDG': { name: 'Sudanese Pound', symbol: 'ج.س.' },
  'SEK': { name: 'Swedish Krona', symbol: 'kr' },
  'SGD': { name: 'Singapore Dollar', symbol: '$' },
  'SHP': { name: 'Saint Helena Pound', symbol: '£' },
  'SLE': { name: 'Sierra Leonean Leone', symbol: 'Le' },
  'SOS': { name: 'Somali Shilling', symbol: 'Sh' },
  'SRD': { name: 'Surinamese Dollar', symbol: '$' },
  'STN': { name: 'São Tomé and Príncipe Dobra', symbol: 'Db' },
  'SYP': { name: 'Syrian Pound', symbol: 'ل.س' },
  'SZL': { name: 'Swazi Lilangeni', symbol: 'L' },
  'THB': { name: 'Thai Baht', symbol: '฿' },
  'TJS': { name: 'Tajikistani Somoni', symbol: 'ЅМ' },
  'TMT': { name: 'Turkmenistani Manat', symbol: 'm' },
  'TND': { name: 'Tunisian Dinar', symbol: 'د.ت' },
  'TOP': { name: 'Tongan Paʻanga', symbol: 'T$' },
  'TRY': { name: 'Turkish Lira', symbol: '₺' },
  'TTD': { name: 'Trinidad and Tobago Dollar', symbol: '$' },
  'TWD': { name: 'New Taiwan Dollar', symbol: '$' },
  'TZS': { name: 'Tanzanian Shilling', symbol: 'Sh' },
  'UAH': { name: 'Ukrainian Hryvnia', symbol: '₴' },
  'UGX': { name: 'Ugandan Shilling', symbol: 'Sh' },
  'UYU': { name: 'Uruguayan Peso', symbol: '$' },
  'UZS': { name: 'Uzbekistani Soʻm', symbol: "so'm" },
  'VED': { name: 'Venezuelan Digital Bolívar', symbol: 'Bs.D' },
  'VES': { name: 'Venezuelan Sovereign Bolívar', symbol: 'Bs.S' },
  'VND': { name: 'Vietnamese Đồng', symbol: '₫' },
  'VUV': { name: 'Vanuatu Vatu', symbol: 'Vt' },
  'WST': { name: 'Samoan Tālā', symbol: 'T' },
  'XAF': { name: 'Central African CFA Franc', symbol: 'Fr' },
  'XOF': { name: 'West African CFA Franc', symbol: 'Fr' },
  'XPF': { name: 'CFP Franc', symbol: 'Fr' },
  'YER': { name: 'Yemeni Rial', symbol: '﷼' },
  'ZAR': { name: 'South African Rand', symbol: 'R' },
  'ZMW': { name: 'Zambian Kwacha', symbol: 'ZK' },
  'ZWL': { name: 'Zimbabwean Dollar', symbol: '$' }
};

export class CurrencyService {
  // Fetch latest exchange rates from API
  static async fetchExchangeRates(apiKey?: string): Promise<ExchangeRateResponse | null> {
    if (!apiKey) {
      console.warn('No exchange rate API key provided, using fallback rates');
      return null;
    }

    try {
      const response = await fetch(`${EXCHANGE_RATE_API_BASE}/${apiKey}/latest/USD`);
      if (!response.ok) {
        throw new Error(`Exchange rate API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      return null;
    }
  }

  // Initialize default currencies in storage
  static async initializeDefaultCurrencies(): Promise<void> {
    try {
      const existingCurrencies = await storage.getCurrencies();
      
      if (existingCurrencies.length === 0) {
        for (const currency of DEFAULT_CURRENCIES) {
          await storage.createCurrency({
            code: currency.code,
            name: currency.name,
            symbol: currency.symbol,
            rate: currency.rate.toString(),
            isActive: true
          });
        }
        console.log('Default currencies initialized');
      }
    } catch (error) {
      console.error('Failed to initialize default currencies:', error);
    }
  }

  // Update exchange rates for all active currencies
  static async updateExchangeRates(apiKey?: string): Promise<boolean> {
    try {
      const ratesData = await this.fetchExchangeRates(apiKey);
      
      if (!ratesData) {
        console.log('Using cached exchange rates');
        return false;
      }

      const currencies = await storage.getCurrencies();
      
      for (const currency of currencies) {
        if (currency.code === 'USD') continue; // Base currency
        
        const newRate = ratesData.conversion_rates[currency.code];
        if (newRate) {
          await storage.updateCurrency(currency.code, {
            rate: newRate.toString(),
            lastUpdated: new Date()
          });
        }
      }
      
      console.log('Exchange rates updated successfully');
      return true;
    } catch (error) {
      console.error('Failed to update exchange rates:', error);
      return false;
    }
  }

  // Add a new currency from world currencies
  static async addCurrency(currencyCode: string, apiKey?: string): Promise<Currency | null> {
    const currencyInfo = WORLD_CURRENCIES[currencyCode as keyof typeof WORLD_CURRENCIES];
    
    if (!currencyInfo) {
      throw new Error(`Currency ${currencyCode} not found in world currencies database`);
    }

    // Fetch current rate
    let rate = 1;
    const ratesData = await this.fetchExchangeRates(apiKey);
    
    if (ratesData && ratesData.conversion_rates[currencyCode]) {
      rate = ratesData.conversion_rates[currencyCode];
    }

    const newCurrency = await storage.createCurrency({
      code: currencyCode,
      name: currencyInfo.name,
      symbol: currencyInfo.symbol,
      rate: rate.toString(),
      isActive: true
    });

    return newCurrency;
  }

  // Get active currencies for frontend
  static async getActiveCurrencies(): Promise<Currency[]> {
    const currencies = await storage.getCurrencies();
    return currencies.filter(currency => currency.isActive);
  }

  // Convert amount from USD to target currency
  static async convertFromUSD(amountUSD: number, targetCurrency: string): Promise<number> {
    if (targetCurrency === 'USD') return amountUSD;
    
    const currencies = await storage.getCurrencies();
    const currency = currencies.find(c => c.code === targetCurrency);
    
    if (!currency) {
      throw new Error(`Currency ${targetCurrency} not found`);
    }
    
    return Math.round(amountUSD * parseFloat(currency.rate) * 100) / 100;
  }
}