# Playwright Run Commands

## تشغيل كل التستات
```
npx playwright test
```

## تشغيل بالمتصفح ظاهر (headed)
```
npx playwright test --headed
```

## تشغيل بالـ UI Mode
```
npx playwright test --ui
```

## تشغيل بالـ Debug
```
npx playwright test --debug
```

## فتح التقرير
```
npx playwright show-report
```

---

## Login
```
npx playwright test tests/login.spec.ts
npx playwright test tests/login.spec.ts --headed
```

## Categories
```
npx playwright test tests/categories/categories.spec.ts
npx playwright test tests/categories/categories.spec.ts --headed
```

## Main Categories
```
npx playwright test tests/categories/maincategories.spec.ts
npx playwright test tests/categories/maincategories.spec.ts --headed
```

## Sub Categories
```
npx playwright test tests/categories/subcategories.spec.ts
npx playwright test tests/categories/subcategories.spec.ts --headed
```

## Voucher Product
```
npx playwright test tests/products/voucherproduct.spec.ts
npx playwright test tests/products/voucherproduct.spec.ts --headed
```

## Range Product
```
npx playwright test tests/products/rangeproduct.spec.ts
npx playwright test tests/products/rangeproduct.spec.ts --headed
```

## Topup Product
```
npx playwright test tests/products/topupproduct.spec.ts
npx playwright test tests/products/topupproduct.spec.ts --headed
```

## Product Filters (كل فلتر في ملف لوحده)
كل ملف بيطلب OTP مرة، فشغّل واحد واحد أو استخدم `--workers=1`.
```
# كل الفلاتر
npx playwright test tests/products/filters --headed --workers=1

# Search
npx playwright test tests/products/filters/search.spec.ts --headed

# Price
npx playwright test tests/products/filters/price.spec.ts --headed

# Product Type
npx playwright test tests/products/filters/producttype.spec.ts --headed

# Status
npx playwright test tests/products/filters/status.spec.ts --headed

# Stock
npx playwright test tests/products/filters/stock.spec.ts --headed

# Category
npx playwright test tests/products/filters/category.spec.ts --headed

# Country
npx playwright test tests/products/filters/country.spec.ts --headed

# Combined (type + status + price)
npx playwright test tests/products/filters/combined.spec.ts --headed
```

---

## تشغيل فولدر كامل
```
npx playwright test tests/categories
npx playwright test tests/products
```

## تشغيل تست واحد بالاسم
```
npx playwright test -g "اسم التست"
```

## تشغيل تست في سطر معين
```
npx playwright test tests/products/rangeproduct.spec.ts:25
```

## تشغيل بدون slowMo / بعدد workers معين
```
npx playwright test --workers=1
```
