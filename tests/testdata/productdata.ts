import type { ProductData, ProductType } from '../pages/createproductpage';

//============= random helpers ============
function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPrice(min: number, max: number): number {
    return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomItem<T>(items: T[]): T {
    return items[randomInt(0, items.length - 1)];
}

function randomCode(length: number): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars[randomInt(0, chars.length - 1)];
    }
    return code;
}

//============= data pools ================
const brands = ['Spotify', 'Netflix', 'PlayStation', 'Xbox', 'Steam', 'iTunes', 'Google Play', 'Amazon', 'PUBG', 'Free Fire'];
const plans = ['Premium', 'Gift Card', 'Plus', 'Gold', 'Standard', 'Ultimate'];
const durations = ['1 Month', '3 Months', '6 Months', '12 Months'];

//============= builder ===================
export function buildRandomProduct(type: ProductType): ProductData {
    const brand = randomItem(brands);
    const plan = randomItem(plans);
    const duration = randomItem(durations);
    const code = randomCode(6);

    const sellingPrice = randomPrice(5, 200);
    const costPrice = Math.round(sellingPrice * randomPrice(0.6, 0.9) * 100) / 100;
    const discountedPrice = Math.round(sellingPrice * randomPrice(0.8, 0.95) * 100) / 100;

    const isRange = type === 'Range';
    const priceOn1 = randomPrice(1, 2);

    return {
        type,
        name: `Auto ${type} ${brand} ${plan} ${duration} ${code}`,
        sku: `${type.replace('-', '').toUpperCase()}-${brand.replace(/\s/g, '').slice(0, 4).toUpperCase()}-${code}`,
        description: `Automation ${type} product for ${brand} ${plan} - ${duration}`,
        sellingPrice: sellingPrice.toFixed(2),
        costPrice: costPrice.toFixed(2),
        discountedPrice: discountedPrice.toFixed(2),
        platformFees: randomPrice(0.5, 5).toFixed(1),
        ...(isRange && {
            minAmount: '10.00',
            maxAmount: '500.00',
            priceOn1: priceOn1.toFixed(2),
            rangeCostPriceOn1: (priceOn1 * 0.9).toFixed(2),
        }),
    };
}
