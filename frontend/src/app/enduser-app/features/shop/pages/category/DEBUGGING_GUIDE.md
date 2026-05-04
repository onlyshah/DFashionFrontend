# Debugging Guide - Category Page Data Loading

## Issue: Data Not Displaying

### Root Causes Fixed

1. **Wrong Query Parameters**
   - ❌ Was sending: `category`, `sort`, `maxPrice`, `minRating`, `sizes`
   - ✅ Backend expects: `category_id`, `sort_by`, `max_price`, `page`, `limit`

2. **Wrong Response Format Handling**
   - ❌ Was checking: `response?.data`, `response?.rows`, direct array
   - ✅ Backend returns: `{ success: true, data: [...], pagination: { total, totalPages, page, limit } }`

### How to Debug

#### Step 1: Check Browser Console
Open DevTools (F12) and look for console logs:

```
✅ Category loaded: {...}          // Category API success
✅ Products loaded: {...}          // Products API success
✅ Loaded X products, total: Y     // Final count
```

#### Step 2: Check Network Tab
In DevTools Network tab, verify API calls:

1. **Category Request**
   ```
   GET http://localhost:3000/api/categories/a86c9505-9954-43c3-b5e1-17ee76eb82e6
   ```
   Expected Response:
   ```json
   {
     "success": true,
     "data": {
       "id": "a86c9505-9954-43c3-b5e1-17ee76eb82e6",
       "name": "Fashion Category Name",
       ...
     }
   }
   ```

2. **Products Request**
   ```
   GET http://localhost:3000/api/products?category_id=a86c9505-9954-43c3-b5e1-17ee76eb82e6&sort_by=popularity&max_price=5000&page=1&limit=12
   ```
   Expected Response:
   ```json
   {
     "success": true,
     "data": [
       {
         "id": "...",
         "name": "Product Name",
         "price": 999,
         "images": [
           { "url": "..." }
         ],
         ...
       }
     ],
     "pagination": {
       "page": 1,
       "limit": 12,
       "total": 45,
       "totalPages": 4
     }
   }
   ```

#### Step 3: Verify Backend is Running
```bash
curl http://localhost:3000/api/products?category_id=a86c9505-9954-43c3-b5e1-17ee76eb82e6&limit=5
```

Should return JSON with products (not HTML error).

#### Step 4: Check Category ID is Valid
Verify the category ID exists:
```bash
curl http://localhost:3000/api/categories/a86c9505-9954-43c3-b5e1-17ee76eb82e6
```

If 404 or no products, the category ID may not exist in the database.

### Common Issues & Solutions

#### Issue: "Category load failed" in console
**Cause**: Category ID doesn't exist  
**Fix**: 
1. Verify category ID is correct
2. Check backend has categories table with data
3. Category will show as "Products" as fallback

#### Issue: "Products load failed" in console
**Cause**: API endpoint not responding, network error, or auth issue  
**Fix**:
1. Verify backend is running: `npm start` in `DFashionbackend/backend`
2. Check environment.apiUrl is `http://localhost:3000`
3. Check CORS is enabled in backend
4. Verify query parameters match backend expectations

#### Issue: Products load but show as empty grid
**Cause**: Category has no products, or products don't have images  
**Fix**:
1. Check totalCount in console - if 0, category is empty
2. Verify products have `images` array with data
3. Check image URLs are accessible
4. Fallback images should show if missing

#### Issue: Images not loading
**Cause**: Image paths incomplete or wrong image format  
**Fix**:
1. Check product response includes `images` array
2. Verify image URLs are absolute (with `http://`) or relative to `environment.apiUrl`
3. Check placeholder asset exists at `/assets/placeholder.jpg`
4. Open image URL directly in browser to test

### API Parameter Mapping

Frontend property → Backend query parameter:

| Frontend | Backend | Example |
|----------|---------|---------|
| categoryId | category_id | a86c9505-... |
| sortBy | sort_by | createdAt, popularity, price |
| maxPrice | max_price | 5000 |
| currentPage | page | 1 |
| pageSize | limit | 12 |
| selectedRating | (not used currently) | - |
| selectedSizes | (not used currently) | - |

### Response Format Extraction

The component handles these response formats:

```typescript
// Backend returns one of these:
{
  success: true,
  data: [...],
  pagination: { total, totalPages }
}

// Extraction:
const data = response?.data || response?.rows || response;
const pagination = response?.pagination || {};
const totalCount = pagination?.total || data.length;
```

### Testing Steps

1. **Start Backend**
   ```bash
   cd D:\Fashion\DFashionbackend\backend
   npm start
   ```

2. **Start Frontend**
   ```bash
   cd D:\Fashion\DFashionFrontend\frontend
   npm start
   ```

3. **Navigate to Category**
   ```
   http://localhost:4200/shop/category/a86c9505-9954-43c3-b5e1-17ee76eb82e6
   ```

4. **Open DevTools** (F12)
   - Console tab: Check for ✅ logs
   - Network tab: Verify API calls return JSON
   - Elements tab: Check if product-grid has items

5. **Verify Console Output**
   ```
   ✅ Category loaded: { id: '...', name: '...' }
   ✅ Products loaded: { data: [...], pagination: {...} }
   ✅ Loaded 12 products, total: 45
   ```

### If Products Still Don't Show

1. Check loading state not stuck:
   ```typescript
   console.log('isLoading:', component.isLoading);
   console.log('products.length:', component.products.length);
   ```

2. Verify products in template:
   ```html
   <!-- Check in DevTools console -->
   ng.getComponent(document.querySelector('app-shop-category')).products
   ```

3. Check template variable bindings:
   - `{{ products.length }}` - should show count
   - `*ngFor="let product of products"` - should iterate
   - `*ngIf="!isLoading && products.length > 0"` - verify conditions

4. Check for JavaScript errors in console

### Reset & Retry

If stuck, do a hard refresh:
```
Ctrl+Shift+R  (Windows/Linux)
Cmd+Shift+R   (Mac)
```

This clears cache and reloads from server.

### Next Steps if Still Not Working

1. Check backend products endpoint directly:
   ```bash
   curl http://localhost:3000/api/products?category_id=YOUR_CATEGORY_ID&limit=5
   ```

2. Verify product table has data and correct structure

3. Check if category ID is correct format (UUID or MongoDB ObjectId)

4. Enable backend request logging to see what queries are being executed
