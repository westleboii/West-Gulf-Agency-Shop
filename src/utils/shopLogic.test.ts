import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  calculateLoyaltyTier,
  calculateUaeOrderSummary,
  extractProductsFromUrlAndHtml,
  filterAndSortProducts,
  generateReferralCode,
  isValidUaeEmirate,
  lookupOrderByReference,
  sanitizeId,
  SHOP_CATEGORY_SUBMENUS,
  type CatalogProduct,
} from './shopLogic';

test('UAE Emirate validator accepts only the 7 UAE Emirates', () => {
  assert.equal(isValidUaeEmirate('Dubai'), true);
  assert.equal(isValidUaeEmirate('Abu Dhabi'), true);
  assert.equal(isValidUaeEmirate('Ras Al Khaimah'), true);
  assert.equal(isValidUaeEmirate('London'), false);
  assert.equal(isValidUaeEmirate('Riyadh'), false);
});

test('Loyalty tier calculation transitions cleanly from Pearl to Gold to Royal Emirate', () => {
  const pearl = calculateLoyaltyTier(250);
  assert.equal(pearl.tier, 'Pearl');
  assert.equal(pearl.nextTier, 'Gold');
  assert.equal(pearl.pointsToNext, 750);

  const gold = calculateLoyaltyTier(1400);
  assert.equal(gold.tier, 'Gold');
  assert.equal(gold.nextTier, 'Royal Emirate');
  assert.equal(gold.pointsToNext, 3600);

  const royal = calculateLoyaltyTier(6200);
  assert.equal(royal.tier, 'Royal Emirate');
  assert.equal(royal.nextTier, null);
  assert.equal(royal.pointsToNext, 0);
});

test('UAE Order Summary calculates free delivery threshold, 5% VAT, and loyalty redemption', () => {
  const smallOrder = calculateUaeOrderSummary([{ priceAed: 200, quantity: 1 }], 'Dubai', 0);
  assert.equal(smallOrder.subtotalAed, 200);
  assert.equal(smallOrder.shippingAed, 25);
  assert.equal(smallOrder.vatAed, 10);
  assert.equal(smallOrder.totalAed, 235);

  const luxuryOrder = calculateUaeOrderSummary(
    [{ priceAed: 2000, quantity: 1 }],
    'Abu Dhabi',
    1000 // 1000 points = 100 AED discount
  );
  assert.equal(luxuryOrder.subtotalAed, 2000);
  assert.equal(luxuryOrder.shippingAed, 0);
  assert.equal(luxuryOrder.loyaltyDiscountAed, 100);
  assert.equal(luxuryOrder.vatAed, 95); // 5% of 1900
  assert.equal(luxuryOrder.totalAed, 1995);
  assert.equal(luxuryOrder.pointsEarned >= 300, true);
});

test('Multi-category link scraper extracts all 4 required store categories from any URL', () => {
  const scraped = extractProductsFromUrlAndHtml('https://waliqsa.com/collections/all', 'Waliqsa UAE');
  assert.equal(scraped.length, 4);
  const categories = scraped.map((p) => p.category).sort();
  assert.deepEqual(categories, ['electronics', 'fashion', 'kitchen', 'wellness']);
  assert.equal(scraped.every((p) => p.priceAed > 0 && p.inStock), true);
});

test('Product filter and sort handles bilingual Arabic/English search and category filtering', () => {
  const sample: CatalogProduct[] = extractProductsFromUrlAndHtml('https://coddropshipping.com');
  const onlyElec = filterAndSortProducts(sample, {
    query: '',
    category: 'electronics',
    subCategory: 'all',
    maxPriceAed: 50000,
    minRating: 0,
    sortBy: 'featured',
  });
  assert.equal(onlyElec.length, 1);
  assert.equal(onlyElec[0].category, 'electronics');

  const arabicSearch = filterAndSortProducts(sample, {
    query: 'ساونا',
    category: 'all',
    subCategory: 'all',
    maxPriceAed: 50000,
    minRating: 0,
    sortBy: 'price-asc',
  });
  assert.equal(arabicSearch.length, 1);
  assert.equal(arabicSearch[0].category, 'wellness');
});

test('Firestore security rules enforce Dirty Dozen invariants and zero-lookup list rules', () => {
  const rulesText = fs.readFileSync('firestore.rules', 'utf8');
  assert.equal(rulesText.includes("rules_version = '2';"), true);
  assert.equal(rulesText.includes('allow read, write: if false;'), true);
  assert.equal(rulesText.includes('request.auth.token.email_verified == true'), true);
  assert.equal(rulesText.includes('isValidUserProfile(incoming())'), true);
  assert.equal(rulesText.includes('isValidOrder(incoming())'), true);
  assert.equal(rulesText.includes('isValidProduct(incoming())'), true);
  assert.equal(rulesText.includes('isValidReview(incoming())'), true);
  assert.equal(rulesText.includes('isValidShippingAddress(incoming())'), true);

  assert.equal( sanitizeId('bad$id/with spaces'), 'bad-id-with-spaces');
  assert.equal(generateReferralCode('Tariq Al-Mansoor', 'uid12345').startsWith('WGA-TARIQ-'), true);
});

test('Shop category sub-menus cover all 4 core product divisions and lookupOrderByReference resolves IDs and tracking codes', () => {
  assert.equal(SHOP_CATEGORY_SUBMENUS.length, 5); // 'all' + 4 divisions
  const divisions = SHOP_CATEGORY_SUBMENUS.filter((c) => c.id !== 'all');
  assert.equal(divisions.every((d) => d.subCategories.length >= 2), true);

  const sampleOrders = [
    { id: 'ORD-UAE-9041', trackingCode: 'EMX-DXB-882910' },
    { id: 'ORD-UAE-9038', trackingCode: 'EMX-SHJ-661904' },
  ];
  assert.equal(lookupOrderByReference(sampleOrders, '#ORD-UAE-9041')?.trackingCode, 'EMX-DXB-882910');
  assert.equal(lookupOrderByReference(sampleOrders, 'emx-shj-661904')?.id, 'ORD-UAE-9038');
  assert.equal(lookupOrderByReference(sampleOrders, 'NON-EXISTENT'), null);
});

