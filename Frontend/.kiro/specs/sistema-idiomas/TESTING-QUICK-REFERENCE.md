# 🧪 Testing Quick Reference Card
## Sistema de Idiomas - Task 11

---

## 🚀 Quick Start

### 1️⃣ Start Server
```bash
npm run dev
```

### 2️⃣ Open Browser
Navigate to: `http://localhost:5173`

### 3️⃣ Open DevTools
Press `F12` or `Ctrl+Shift+I`

---

## ⚡ 30-Second Test

### Copy-Paste into Console:
```javascript
// Quick test
const lang = localStorage.getItem('moodflix-language');
console.log('Current Language:', lang);
console.log('Auth Token:', localStorage.getItem('moodflix-token') ? '✅' : '❌');
console.log('Carrito:', localStorage.getItem('moodflix-carrito') ? '✅' : '❌');
```

### Expected Output:
```
Current Language: es (or en)
Auth Token: ✅ (if logged in)
Carrito: ✅ (if items in cart)
```

---

## 🔍 Full Automated Test

### Run in Console:
1. Copy entire contents of `automated-persistence-check.js`
2. Paste into console
3. Press Enter
4. Review results

### Interactive Test:
```javascript
testLanguageChange()
```

---

## ✅ Manual Test Checklist

### Core Tests (5 min)
- [ ] Change language ES → EN
- [ ] Reload page (F5)
- [ ] Language still EN? ✅
- [ ] Change back to ES
- [ ] Logout and login
- [ ] Language still ES? ✅

### Cart Test (2 min)
- [ ] Add 2 items to cart
- [ ] Change language
- [ ] Cart still has 2 items? ✅

### Role Test (3 min)
- [ ] Test as Cliente
- [ ] Test as Admin
- [ ] Test as Webmaster
- [ ] Test not logged in

---

## 📦 LocalStorage Keys

### Check in DevTools → Application → Local Storage

| Key | Expected Value | Purpose |
|-----|----------------|---------|
| `moodflix-language` | `'es'` or `'en'` | Language preference |
| `moodflix-token` | JWT string | Auth token |
| `moodflix-carrito` | JSON array | Shopping cart |

---

## 🎯 Success Criteria

### ✅ Must Pass
- Language persists after reload
- Language persists after logout/login
- Auth token unchanged after language change
- Cart unchanged after language change
- No console errors
- Active language visually indicated

### ❌ Must Not Happen
- Language resets to default
- User gets logged out
- Cart gets cleared
- Page redirects unexpectedly
- Console shows errors

---

## 🐛 Common Issues

### Issue: Language resets after reload
**Check:** LocalStorage key `moodflix-language` exists
**Fix:** Verify LanguageContext initialization

### Issue: Language doesn't change
**Check:** Click event on language buttons
**Fix:** Verify LanguageSelector component

### Issue: Console errors
**Check:** Browser console for error messages
**Fix:** Review error stack trace

---

## 📁 Testing Files

| File | Purpose | When to Use |
|------|---------|-------------|
| `quick-console-test.js` | 30-second verification | During development |
| `automated-persistence-check.js` | Full automated test | Before commits |
| `persistence-test-guide.md` | Manual test guide | Comprehensive testing |
| `task-11-validation-report.md` | Test report | Formal validation |

---

## 🎨 Visual Checks

### Language Selector
- [ ] Visible in Navbar (when logged in)
- [ ] Visible in Header (when not logged in)
- [ ] Shows flags: 🇪🇸 | 🇺🇸
- [ ] Active language has white background
- [ ] Hover effect works
- [ ] Cursor changes to pointer

### Responsive
- [ ] Desktop: Shows "ES" and "EN" text
- [ ] Mobile: Shows only flags 🇪🇸 🇺🇸

---

## 🔄 Test Workflow

```
1. Automated Test (1 min)
   ↓
2. Quick Manual Test (5 min)
   ↓
3. Role-Based Test (5 min)
   ↓
4. Edge Cases (3 min)
   ↓
5. Document Results
```

**Total Time:** ~15 minutes

---

## 📊 Pass/Fail Criteria

### PASS ✅
- All automated tests pass
- Language persists correctly
- No side effects on other systems
- Works in all user roles
- No console errors

### FAIL ❌
- Any automated test fails
- Language doesn't persist
- Auth or cart affected
- Console shows errors
- Doesn't work in some roles

---

## 💡 Pro Tips

1. **Test in Incognito** for clean state
2. **Check DevTools Application tab** for LocalStorage
3. **Use testSwitch()** for quick verification
4. **Test with real data** (add items to cart)
5. **Try rapid switching** (ES→EN→ES→EN→ES)

---

## 🆘 Need Help?

### Documentation
- Full guide: `persistence-test-guide.md`
- Completion doc: `TASK-11-COMPLETION.md`
- Summary: `task-11-summary.md`

### Scripts
- Quick test: `quick-console-test.js`
- Full test: `automated-persistence-check.js`

### Report
- Template: `task-11-validation-report.md`

---

## ✨ One-Liner Tests

### Test 1: Persistence
```javascript
localStorage.setItem('moodflix-language', 'en'); location.reload();
// After reload, check if still 'en'
```

### Test 2: No Side Effects
```javascript
const before = {token: localStorage.getItem('moodflix-token'), cart: localStorage.getItem('moodflix-carrito')};
// Change language
const after = {token: localStorage.getItem('moodflix-token'), cart: localStorage.getItem('moodflix-carrito')};
console.log('Unchanged:', before.token === after.token && before.cart === after.cart);
```

### Test 3: Visual Check
```javascript
document.querySelectorAll('[aria-label*="Cambiar"], [aria-label*="Change"]').length >= 2
// Should return true
```

---

**Last Updated:** November 15, 2025  
**Task:** 11 - Verificar persistencia y experiencia de usuario  
**Status:** ✅ COMPLETED
