# 📚 Portfolio API – Frontend Uchun To'liq Dokumentatsiya

## 📌 Umumiy Ma'lumot

| Parametr | Qiymat |
|----------|--------|
| **Base URL** | `http://localhost:5000/api/v1` |
| **Format** | JSON (`Content-Type: application/json`) |
| **Fayl yuklash** | `multipart/form-data` |
| **Autentifikatsiya** | Bearer Token (JWT) |
| **Rate Limit** | 100 so'rov / 15 daqiqa |
| **Auth Rate Limit** | 10 so'rov / 15 daqiqa |

---

## 🔐 1. AUTENTIFIKATSIYA (Auth)

### 1.1 Login
```
POST /api/v1/auth/login
```
**Body (JSON):**
```json
{
  "email": "admin@portfolio.com",
  "password": "admin123456"
}
```
**Javob (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "name": "Admin",
      "email": "admin@portfolio.com",
      "role": "admin",
      "avatar": ""
    }
  }
}
```

> ⚠️ **Muhim:** `accessToken`ni har bir PRIVATE so'rovda `Authorization` headeriga qo'shish kerak!

### 1.2 Tokenni Yangilash (Refresh)
```
POST /api/v1/auth/refresh-token
```
**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 1.3 Logout 🔒
```
POST /api/v1/auth/logout
```

### 1.4 Mening Profilim 🔒
```
GET /api/v1/auth/me
```

### 1.5 Ma'lumotlarni Yangilash 🔒
```
PUT /api/v1/auth/update-details
```
**Body:**
```json
{
  "name": "Yangi Ism",
  "email": "yangi@email.com"
}
```

### 1.6 Parolni Yangilash 🔒
```
PUT /api/v1/auth/update-password
```
**Body:**
```json
{
  "currentPassword": "eski_parol",
  "newPassword": "yangi_parol123"
}
```

---

## 🔑 Autentifikatsiya Qanday Ishlaydi

Har bir **🔒 (PRIVATE)** so'rovga token yuborish kerak:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**JavaScript (Axios) misol:**
```javascript
// 1. Login qilish
const login = async (email, password) => {
  const { data } = await axios.post('/api/v1/auth/login', { email, password });
  
  // Tokenni localStorage yoki state'ga saqlash
  localStorage.setItem('accessToken', data.data.accessToken);
  localStorage.setItem('refreshToken', data.data.refreshToken);
  
  return data.data.user;
};

// 2. Axios instance yaratish (har bir so'rovga token qo'shish)
const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor – har bir so'rovga token qo'shadi
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Token muddati tugasa, refresh qilish
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      const { data } = await axios.post('/api/v1/auth/refresh-token', { refreshToken });
      
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      
      // Qayta yuborish
      error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
      return axios(error.config);
    }
    return Promise.reject(error);
  }
);
```

**React (Fetch) misol:**
```javascript
const fetchData = async (url) => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(`http://localhost:5000/api/v1${url}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};
```

---

## 📄 2. ABOUT (Men Haqimda) – Singleton

| Endpoint | Method | Auth | Tavsif |
|----------|--------|------|--------|
| `/about` | GET | ❌ | Public – About ma'lumotini olish |
| `/about/admin` | GET | 🔒 | Admin – To'liq About olish |
| `/about` | POST | 🔒 | Yaratish yoki Yangilash |
| `/about` | DELETE | 🔒 | O'chirish |
| `/about/avatar` | PUT | 🔒 | Avatar yuklash (file) |
| `/about/cover` | PUT | 🔒 | Cover rasm yuklash (file) |
| `/about/resume` | PUT | 🔒 | Resume yuklash (file) |
| `/about/avatar` | DELETE | 🔒 | Avatar o'chirish |
| `/about/cover` | DELETE | 🔒 | Cover rasm o'chirish |
| `/about/resume` | DELETE | 🔒 | Resume o'chirish |
| `/about/:section` | PATCH | 🔒 | Bo'limni yangilash |

### POST `/about` – Yaratish/Yangilash body:
```json
{
  "fullName": "Abdulaziz Karimov",
  "title": "Advokat",
  "subtitle": "Yuridik xizmatlar bo'yicha mutaxassis",
  "typingTexts": ["Advokat", "Yurist", "Konsultant"],
  "bio": "Men 10 yillik tajribaga ega advokatman...",
  "shortBio": "Qisqa bio",
  "phone": "+998901234567",
  "email": "info@example.com",
  "address": "Toshkent, Chilonzor tumani",
  "birthday": "1990-05-15",
  "nationality": "O'zbek",
  "freelanceStatus": "available",
  "location": { "city": "Toshkent", "country": "Uzbekistan", "mapUrl": "" },
  "languages": [
    { "name": "O'zbek", "level": "Native" },
    { "name": "Ingliz", "level": "B2" }
  ],
  "socialLinks": {
    "telegram": "https://t.me/example",
    "instagram": "https://instagram.com/example",
    "linkedin": "https://linkedin.com/in/example"
  },
  "stats": {
    "projectsCompleted": 150,
    "happyClients": 300,
    "yearsExperience": 10,
    "awardsWon": 5
  },
  "interests": ["Kitob o'qish", "Sayohat"],
  "whatIDo": [
    { "title": "Fuqarolik ishlari", "description": "...", "icon": "⚖️" }
  ],
  "seo": {
    "metaTitle": "Advokat – Abdulaziz Karimov",
    "metaDescription": "Professional advokat xizmatlari",
    "metaKeywords": ["advokat", "yurist"],
    "ogImage": ""
  }
}
```

### Avatar yuklash misoli:
```javascript
const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file); // 'avatar' nomi muhim!
  
  const { data } = await api.put('/about/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};
```

### PATCH bo'lim yangilash:
```javascript
// Faqat socialLinks bo'limini yangilash
await api.patch('/about/socialLinks', {
  telegram: "https://t.me/yangi",
  instagram: "https://instagram.com/yangi"
});

// Faqat stats bo'limini yangilash
await api.patch('/about/stats', {
  projectsCompleted: 200,
  happyClients: 400
});
```

---

## 📂 3. CATEGORIES (Kategoriyalar)

| Endpoint | Method | Auth | Tavsif |
|----------|--------|------|--------|
| `/categories` | GET | ❌ | Barcha kategoriyalar |
| `/categories/:id` | GET | ❌ | Bitta kategoriya |
| `/categories` | POST | 🔒 | Yaratish |
| `/categories/:id` | PUT | 🔒 | Yangilash |
| `/categories/:id` | DELETE | 🔒 | O'chirish |
| `/categories/:id/image` | PUT | 🔒 | Rasm yuklash |
| `/categories/:id/image` | DELETE | 🔒 | Rasm o'chirish |

### Body:
```json
{
  "name": "Fuqarolik huquqi",
  "type": "service",
  "description": "Fuqarolik ishlari bo'yicha...",
  "icon": "⚖️",
  "color": "#3B82F6"
}
```

> **`type` qiymatlari:** `project`, `blog`, `service`, `skill`, `news`

### Rasm yuklash:
```javascript
const formData = new FormData();
formData.append('image', file); // 'image' nomi
await api.put(`/categories/${id}/image`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

---

## 💼 4. SERVICES (Xizmatlar)

| Endpoint | Method | Auth | Tavsif |
|----------|--------|------|--------|
| `/services` | GET | ❌ | Barcha xizmatlar |
| `/services/:id` | GET | ❌ | Bitta xizmat (details bilan) |
| `/services` | POST | 🔒 | Yaratish |
| `/services/:id` | PUT | 🔒 | Yangilash |
| `/services/:id` | DELETE | 🔒 | O'chirish |
| `/services/:id/image` | PUT | 🔒 | Rasm yuklash |
| `/services/:id/image` | DELETE | 🔒 | Rasm o'chirish |

### Body:
```json
{
  "title": "Fuqarolik ishlari",
  "description": "Fuqarolik ishlari bo'yicha to'liq yuridik xizmat...",
  "icon": "⚖️",
  "categoryId": "uuid-kategoriya-id",
  "price": "500 000 so'm",
  "order": 1,
  "isActive": true
}
```

---

## 📋 5. SERVICE DETAILS (Xizmat Tafsilotlari)

| Endpoint | Method | Auth | Tavsif |
|----------|--------|------|--------|
| `/service-details` | GET | ❌ | Barcha tafsilotlar |
| `/service-details/:id` | GET | ❌ | Bitta tafsilot |
| `/service-details` | POST | 🔒 | Yaratish |
| `/service-details/:id` | PUT | 🔒 | Yangilash |
| `/service-details/:id` | DELETE | 🔒 | O'chirish |

### Body:
```json
{
  "serviceId": "uuid-service-id",
  "title": "Shartnoma tuzish",
  "description": "Har xil turdagi shartnomalar...",
  "icon": "📝",
  "order": 1
}
```

---

## 🏗️ 6. PROJECTS (Loyihalar/Ishlar)

| Endpoint | Method | Auth | Tavsif |
|----------|--------|------|--------|
| `/projects` | GET | ❌ | Barcha loyihalar |
| `/projects/:id` | GET | ❌ | Bitta loyiha (views +1) |
| `/projects` | POST | 🔒 | Yaratish |
| `/projects/:id` | PUT | 🔒 | Yangilash |
| `/projects/:id` | DELETE | 🔒 | O'chirish |
| `/projects/:id/image` | PUT | 🔒 | Asosiy rasm yuklash |
| `/projects/:id/image` | DELETE | 🔒 | Asosiy rasmni o'chirish |
| `/projects/:id/gallery` | PUT | 🔒 | Galereya rasm qo'shish |
| `/projects/:id/gallery/:index` | DELETE | 🔒 | Galereya rasmini o'chirish |

### Body:
```json
{
  "title": "Karimov vs Toshkent hokimligi",
  "shortDescription": "Sud ishining qisqacha tavsifi",
  "description": "Batafsil tavsif...",
  "clientUrl": "https://client-site.com",
  "categoryId": "uuid-kategoriya-id",
  "status": "published",
  "isFeatured": true,
  "order": 1,
  "completedAt": "2024-06-15"
}
```

> **`status` qiymatlari:** `published`, `draft`, `archived`

### Galereya rasm yuklash:
```javascript
// Galereya rasm qo'shish
const formData = new FormData();
formData.append('image', file);
await api.put(`/projects/${id}/gallery`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// Galereya rasmini o'chirish (index bo'yicha, 0 dan boshlanadi)
await api.delete(`/projects/${id}/gallery/0`);
```

---

## 🎯 7. SKILLS (Ko'nikmalar/Sohalar)

| Endpoint | Method | Auth | Tavsif |
|----------|--------|------|--------|
| `/skills` | GET | ❌ | Barcha ko'nikmalar |
| `/skills/:id` | GET | ❌ | Bitta ko'nikma |
| `/skills` | POST | 🔒 | Yaratish |
| `/skills/:id` | PUT | 🔒 | Yangilash |
| `/skills/:id` | DELETE | 🔒 | O'chirish |
| `/skills/:id/image` | PUT | 🔒 | Rasm yuklash |
| `/skills/:id/image` | DELETE | 🔒 | Rasm o'chirish |

### Body:
```json
{
  "name": "Jinoyat huquqi",
  "level": "expert",
  "percentage": 95,
  "icon": "⚖️",
  "categoryId": "uuid-kategoriya-id",
  "order": 1,
  "isActive": true
}
```

> **`level` qiymatlari:** `beginner`, `intermediate`, `advanced`, `expert`

---

## 📝 8. BLOG POSTS (Blog Maqolalari)

| Endpoint | Method | Auth | Tavsif |
|----------|--------|------|--------|
| `/blog-posts` | GET | ❌ | Barcha maqolalar |
| `/blog-posts/:id` | GET | ❌ | Bitta maqola (ID bo'yicha) |
| `/blog-posts/slug/:slug` | GET | ❌ | Bitta maqola (slug bo'yicha) |
| `/blog-posts` | POST | 🔒 | Yaratish |
| `/blog-posts/:id` | PUT | 🔒 | Yangilash |
| `/blog-posts/:id` | DELETE | 🔒 | O'chirish |
| `/blog-posts/:id/image` | PUT | 🔒 | Rasm yuklash |
| `/blog-posts/:id/image` | DELETE | 🔒 | Rasm o'chirish |

### Body:
```json
{
  "title": "Yangi fuqarolik kodeksi haqida",
  "content": "<p>Maqola matni HTML formatida...</p>",
  "excerpt": "Qisqa matn...",
  "categoryId": "uuid-kategoriya-id",
  "status": "published",
  "isFeatured": false,
  "allowComments": true,
  "metaTitle": "SEO sarlavha",
  "metaDescription": "SEO tavsif",
  "tags": ["uuid-tag-1", "uuid-tag-2"]
}
```

> **Avtomatik:** `slug` sarlavhadan, `readTime` contentdan, `publishedAt` status=published bo'lganda avtomatik yaratiladi.

---

## 💬 9. BLOG COMMENTS (Blog Izohlari)

| Endpoint | Method | Auth | Tavsif |
|----------|--------|------|--------|
| `/blog-comments` | GET | ❌ | Barcha izohlar |
| `/blog-comments/post/:postId` | GET | ❌ | Maqola izohlari |
| `/blog-comments/:id` | GET | ❌ | Bitta izoh |
| `/blog-comments` | POST | ❌ | Izoh qoldirish (public) |
| `/blog-comments/:id/status` | PUT | 🔒 | Status o'zgartirish |
| `/blog-comments/:id` | DELETE | 🔒 | O'chirish |

### Izoh qoldirish (Public):
```json
{
  "blogPostId": "uuid-post-id",
  "guestName": "Ali Valiyev",
  "guestEmail": "ali@example.com",
  "content": "Juda foydali maqola!"
}
```

### Javob (Reply) qoldirish:
```json
{
  "blogPostId": "uuid-post-id",
  "parentCommentId": "uuid-comment-id",
  "guestName": "Sardor",
  "content": "Men ham shunday o'ylayman!"
}
```

### Status o'zgartirish 🔒:
```json
{
  "status": "approved"
}
```

> **`status` qiymatlari:** `pending`, `approved`, `rejected`

---

## ⭐ 10. BLOG RATINGS (Blog Baholash)

| Endpoint | Method | Auth | Tavsif |
|----------|--------|------|--------|
| `/blog-ratings/:postId` | GET | ❌ | Maqola reytingi |
| `/blog-ratings` | POST | ❌ | Baho qo'yish (public) |
| `/blog-ratings/:postId` | DELETE | 🔒 | Baholarni o'chirish |

### Baho qo'yish:
```json
{
  "blogPostId": "uuid-post-id",
  "rating": 5
}
```

> **`rating`:** 1 dan 5 gacha. Har bir IP faqat 1 marta baho berishi mumkin.

---

## 📰 11. NEWS (Yangiliklar)

| Endpoint | Method | Auth | Tavsif |
|----------|--------|------|--------|
| `/news` | GET | ❌ | Barcha yangiliklar |
| `/news/:id` | GET | ❌ | Bitta yangilik |
| `/news/slug/:slug` | GET | ❌ | Slug bo'yicha |
| `/news` | POST | 🔒 | Yaratish |
| `/news/:id` | PUT | 🔒 | Yangilash |
| `/news/:id` | DELETE | 🔒 | O'chirish |
| `/news/:id/image` | PUT | 🔒 | Rasm yuklash |
| `/news/:id/image` | DELETE | 🔒 | Rasm o'chirish |

### Body:
```json
{
  "title": "Yangi qonun qabul qilindi",
  "content": "<p>Batafsil matn...</p>",
  "excerpt": "Qisqacha...",
  "categoryId": "uuid-kategoriya-id",
  "source": "Lex.uz",
  "sourceUrl": "https://lex.uz/docs/123",
  "status": "published",
  "isFeatured": false,
  "tags": ["uuid-tag-1"]
}
```

---

## 🏷️ 12. TAGS (Teglar)

| Endpoint | Method | Auth | Tavsif |
|----------|--------|------|--------|
| `/tags` | GET | ❌ | Barcha teglar |
| `/tags/:id` | GET | ❌ | Bitta teg |
| `/tags` | POST | 🔒 | Yaratish |
| `/tags/:id` | PUT | 🔒 | Yangilash |
| `/tags/:id` | DELETE | 🔒 | O'chirish |

### Body:
```json
{
  "name": "Jinoyat huquqi",
  "color": "#6366F1"
}
```

---

## 💼 13. EXPERIENCES (Ish tajribasi)

| Endpoint | Method | Auth | Tavsif |
|----------|--------|------|--------|
| `/experiences` | GET | ❌ | Barcha tajribalar |
| `/experiences/:id` | GET | ❌ | Bitta tajriba |
| `/experiences` | POST | 🔒 | Yaratish |
| `/experiences/:id` | PUT | 🔒 | Yangilash |
| `/experiences/:id` | DELETE | 🔒 | O'chirish |
| `/experiences/:id/logo` | PUT | 🔒 | Logo yuklash |
| `/experiences/:id/logo` | DELETE | 🔒 | Logo o'chirish |

### Body:
```json
{
  "company": "Advokat byurosi 'Huquq'",
  "position": "Bosh advokat",
  "description": "Fuqarolik va jinoyat ishlari...",
  "specializations": ["Fuqarolik huquqi", "Jinoyat huquqi"],
  "location": "Toshkent",
  "companyUrl": "https://huquq.uz",
  "startDate": "2018-01-15",
  "endDate": "2023-12-31",
  "current": false,
  "order": 1
}
```

> **Eslatma:** `current: true` bo'lsa, `endDate` avtomatik `null` bo'ladi.

### Logo yuklash:
```javascript
const formData = new FormData();
formData.append('logo', file); // 'logo' nomi!
await api.put(`/experiences/${id}/logo`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

---

## 🎓 14. EDUCATION (Ta'lim)

| Endpoint | Method | Auth | Tavsif |
|----------|--------|------|--------|
| `/education` | GET | ❌ | Barcha ta'lim |
| `/education/:id` | GET | ❌ | Bitta ta'lim |
| `/education` | POST | 🔒 | Yaratish |
| `/education/:id` | PUT | 🔒 | Yangilash |
| `/education/:id` | DELETE | 🔒 | O'chirish |
| `/education/:id/logo` | PUT | 🔒 | Logo yuklash |
| `/education/:id/logo` | DELETE | 🔒 | Logo o'chirish |

### Body:
```json
{
  "school": "Toshkent Davlat Yuridik Universiteti",
  "degree": "Magistr",
  "fieldOfStudy": "Fuqarolik huquqi",
  "description": "Batafsil...",
  "gpa": 4.5,
  "achievements": ["Oliy darajali diplom", "Ilmiy maqola muallifi"],
  "schoolUrl": "https://tsul.uz",
  "startDate": "2012-09-01",
  "endDate": "2016-06-30",
  "current": false,
  "order": 1
}
```

---

## 📧 15. CONTACTS (Aloqa xabarlari)

| Endpoint | Method | Auth | Tavsif |
|----------|--------|------|--------|
| `/contacts` | POST | ❌ | Xabar yuborish (public) |
| `/contacts` | GET | 🔒 | Barcha xabarlar |
| `/contacts/:id` | GET | 🔒 | Bitta xabar |
| `/contacts/:id/read` | PUT | 🔒 | O'qildi deb belgilash |
| `/contacts/:id/reply` | PUT | 🔒 | Javob berildi deb belgilash |
| `/contacts/:id` | DELETE | 🔒 | O'chirish |

### Xabar yuborish (Public):
```json
{
  "name": "Ali Valiyev",
  "email": "ali@example.com",
  "phone": "+998901234567",
  "subject": "Huquqiy maslahat kerak",
  "message": "Assalomu alaykum, fuqarolik ishi bo'yicha maslahat olmoqchiman..."
}
```

---

## 🌟 16. TESTIMONIALS (Mijoz Fikrlari)

| Endpoint | Method | Auth | Tavsif |
|----------|--------|------|--------|
| `/testimonials` | GET | ❌ | Barcha fikrlar |
| `/testimonials/:id` | GET | ❌ | Bitta fikr |
| `/testimonials` | POST | 🔒 | Yaratish |
| `/testimonials/:id` | PUT | 🔒 | Yangilash |
| `/testimonials/:id` | DELETE | 🔒 | O'chirish |
| `/testimonials/:id/image` | PUT | 🔒 | Mijoz rasmi yuklash |
| `/testimonials/:id/image` | DELETE | 🔒 | Mijoz rasmi o'chirish |

### Body:
```json
{
  "clientName": "Sardor Rahimov",
  "clientPosition": "Direktor, 'Mega Group' MCHJ",
  "content": "Juda professional va tez xizmat ko'rsatdi...",
  "rating": 5,
  "caseType": "Fuqarolik ishi",
  "order": 1,
  "isActive": true
}
```

### Mijoz rasmi yuklash:
```javascript
const formData = new FormData();
formData.append('image', file); // 'image' nomi!
await api.put(`/testimonials/${id}/image`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

---

## ❓ 17. FAQs (Ko'p Beriladigan Savollar)

| Endpoint | Method | Auth | Tavsif |
|----------|--------|------|--------|
| `/faqs` | GET | ❌ | Barcha savollar |
| `/faqs/:id` | GET | ❌ | Bitta savol |
| `/faqs` | POST | 🔒 | Yaratish |
| `/faqs/:id` | PUT | 🔒 | Yangilash |
| `/faqs/:id` | DELETE | 🔒 | O'chirish |

### Body:
```json
{
  "question": "Maslahat narxi qancha?",
  "answer": "Birinchi maslahat bepul...",
  "categoryId": "uuid-kategoriya-id",
  "order": 1,
  "isActive": true
}
```

---

## 🤝 18. PARTNERS (Hamkorlar)

| Endpoint | Method | Auth | Tavsif |
|----------|--------|------|--------|
| `/partners` | GET | ❌ | Barcha hamkorlar |
| `/partners/:id` | GET | ❌ | Bitta hamkor |
| `/partners` | POST | 🔒 | Yaratish |
| `/partners/:id` | PUT | 🔒 | Yangilash |
| `/partners/:id` | DELETE | 🔒 | O'chirish |
| `/partners/:id/logo` | PUT | 🔒 | Logo yuklash |
| `/partners/:id/logo` | DELETE | 🔒 | Logo o'chirish |

### Body:
```json
{
  "name": "Advokat Byurosi 'Huquq'",
  "url": "https://huquq.uz",
  "description": "Hamkor tashkilot",
  "order": 1,
  "isActive": true
}
```

### Logo yuklash:
```javascript
const formData = new FormData();
formData.append('logo', file); // 'logo' nomi!
await api.put(`/partners/${id}/logo`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

---

## 📅 19. CONSULTATIONS (Maslahat So'rovlari)

| Endpoint | Method | Auth | Tavsif |
|----------|--------|------|--------|
| `/consultations` | POST | ❌ | Maslahat so'rovi (public) |
| `/consultations` | GET | 🔒 | Barcha so'rovlar |
| `/consultations/:id` | GET | 🔒 | Bitta so'rov |
| `/consultations/:id` | PUT | 🔒 | Status yangilash |
| `/consultations/:id` | DELETE | 🔒 | O'chirish |

### Maslahat so'rovi (Public):
```json
{
  "fullName": "Jasur Toshmatov",
  "phone": "+998901234567",
  "email": "jasur@example.com",
  "serviceId": "uuid-service-id",
  "preferredDate": "2024-03-20",
  "preferredTime": "14:00",
  "message": "Fuqarolik ishi bo'yicha maslahat kerak..."
}
```

### Status yangilash 🔒:
```json
{
  "status": "confirmed",
  "adminNotes": "Ertaga soat 14:00 da uchrashish"
}
```

> **`status` qiymatlari:** `pending`, `confirmed`, `completed`, `cancelled`

---

## 🏆 20. ACHIEVEMENTS (Yutuqlar/Sertifikatlar)

| Endpoint | Method | Auth | Tavsif |
|----------|--------|------|--------|
| `/achievements` | GET | ❌ | Barcha yutuqlar |
| `/achievements/:id` | GET | ❌ | Bitta yutuq |
| `/achievements` | POST | 🔒 | Yaratish |
| `/achievements/:id` | PUT | 🔒 | Yangilash |
| `/achievements/:id` | DELETE | 🔒 | O'chirish |
| `/achievements/:id/image` | PUT | 🔒 | Rasm yuklash |
| `/achievements/:id/image` | DELETE | 🔒 | Rasm o'chirish |

### Body:
```json
{
  "title": "Advokatura litsenziyasi",
  "issuer": "O'zbekiston Respublikasi Adliya vazirligi",
  "date": "2020-05-15",
  "description": "Batafsil...",
  "type": "license",
  "order": 1,
  "isActive": true
}
```

> **`type` qiymatlari:** `license`, `certificate`, `award`, `membership`

---

## 📊 21. DASHBOARD (Admin panel statistikasi) 🔒

```
GET /api/v1/dashboard
```

Barcha modellar bo'yicha umumiy statistikani qaytaradi.

---

## 🔍 QUERY PARAMETRLARI (Filterlash, Qidirish, Sahifalash)

Barcha **GET list** so'rovlarda quyidagi query parametrlarni ishlatish mumkin:

### Sahifalash (Pagination)
```
GET /api/v1/projects?page=1&limit=10
```

### Qidirish (Search)
```
GET /api/v1/projects?search=fuqarolik
```

### Filtrlash (Filter)
```
GET /api/v1/projects?status=published
GET /api/v1/projects?isFeatured=true
GET /api/v1/categories?type=service
GET /api/v1/projects?status=published&isFeatured=true
```

### Saralash (Sort)
```
GET /api/v1/projects?sort=-createdAt        # Eng yangi birinchi
GET /api/v1/projects?sort=order             # Tartib bo'yicha
GET /api/v1/projects?sort=-views            # Ko'p ko'rilgan birinchi
GET /api/v1/projects?sort=title,-createdAt  # Nomi bo'yicha, keyin sana
```
> **Minus (`-`)** – kamayish tartibi (DESC), **Minus yo'q** – o'sish tartibi (ASC)

### Maydon tanlash (Fields)
```
GET /api/v1/projects?fields=title,slug,status,image
```

### To'liq misol
```
GET /api/v1/blog-posts?status=published&search=huquq&sort=-publishedAt&page=1&limit=5&fields=title,slug,excerpt,image
```

### Javob formati (Pagination bilan):
```json
{
  "success": true,
  "count": 5,
  "pagination": {
    "total": 23,
    "page": 1,
    "limit": 5,
    "totalPages": 5,
    "next": 2
  },
  "data": [...]
}
```

---

## 📸 RASM YUKLASH – UMUMIY QOIDALAR

Barcha rasm yuklash endpointlari `multipart/form-data` formatida ishlaydi.

### Field nomlari:

| Resource | Endpoint | Field nomi |
|----------|----------|------------|
| About avatar | PUT `/about/avatar` | `avatar` |
| About cover | PUT `/about/cover` | `cover` |
| About resume | PUT `/about/resume` | `resume` |
| Category | PUT `/categories/:id/image` | `image` |
| Project | PUT `/projects/:id/image` | `image` |
| Project gallery | PUT `/projects/:id/gallery` | `image` |
| Service | PUT `/services/:id/image` | `image` |
| Skill | PUT `/skills/:id/image` | `image` |
| Blog Post | PUT `/blog-posts/:id/image` | `image` |
| News | PUT `/news/:id/image` | `image` |
| Achievement | PUT `/achievements/:id/image` | `image` |
| Testimonial | PUT `/testimonials/:id/image` | `image` |
| Experience logo | PUT `/experiences/:id/logo` | `logo` |
| Education logo | PUT `/education/:id/logo` | `logo` |
| Partner logo | PUT `/partners/:id/logo` | `logo` |

### Rasm javob formati:
```json
{
  "url": "https://res.cloudinary.com/.../image.jpg",
  "publicId": "portfolio/projects/abc123"
}
```

### Umumiy rasm yuklash funksiyasi (React uchun):
```javascript
// Universal rasm yuklash
const uploadImage = async (endpoint, file, fieldName = 'image') => {
  const formData = new FormData();
  formData.append(fieldName, file);
  
  const token = localStorage.getItem('accessToken');
  const { data } = await axios.put(
    `http://localhost:5000/api/v1${endpoint}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return data;
};

// Ishlatish misollari:
uploadImage(`/projects/${id}/image`, file);
uploadImage(`/about/avatar`, file, 'avatar');
uploadImage(`/partners/${id}/logo`, file, 'logo');
```

---

## ❌ XATOLIK JAVOBLARI

### Standart xatolik formati:
```json
{
  "success": false,
  "message": "Xatolik matni"
}
```

### HTTP Status kodlari:

| Kod | Ma'no |
|-----|-------|
| `200` | Muvaffaqiyatli |
| `201` | Yaratildi |
| `400` | Noto'g'ri so'rov (validatsiya xatosi) |
| `401` | Autentifikatsiya kerak / Token yaroqsiz |
| `403` | Ruxsat yo'q |
| `404` | Topilmadi |
| `423` | Account bloklangan (ko'p login urinishi) |
| `429` | Ko'p so'rov yuborildi (rate limit) |
| `500` | Server xatosi |

### Validatsiya xatolik misoli:
```json
{
  "success": false,
  "message": "Sarlavha kiritish majburiy"
}
```

---

## 🚀 REACT UCHUN TO'LIQ ISHLATISH MISOLI

### 1. API Service (api.js)
```javascript
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Token qo'shish
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Token yangilash
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(`${BASE_URL}/auth/refresh-token`, { refreshToken });
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 2. Login page
```javascript
import api from './api';

const handleLogin = async (email, password) => {
  try {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    // Redirect to dashboard
  } catch (error) {
    console.error(error.response?.data?.message);
  }
};
```

### 3. Loyihalar ro'yxatini olish (Public)
```javascript
// Pagination + filter + search
const getProjects = async (page = 1, search = '', status = 'published') => {
  const { data } = await api.get('/projects', {
    params: { page, limit: 10, search, status, sort: '-createdAt' }
  });
  
  console.log(data.data);        // Loyihalar massivi
  console.log(data.pagination);  // { total, page, limit, totalPages, next }
  return data;
};
```

### 4. Yangi loyiha yaratish + rasm yuklash (Admin)
```javascript
const createProjectWithImage = async (projectData, imageFile) => {
  // 1. Loyihani yaratish
  const { data } = await api.post('/projects', projectData);
  const projectId = data.data.id;
  
  // 2. Rasmni yuklash
  if (imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    await api.put(`/projects/${projectId}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
  
  return data.data;
};
```

### 5. Aloqa formasi (Public – token kerak emas)
```javascript
const sendContactForm = async (formValues) => {
  try {
    const { data } = await axios.post('http://localhost:5000/api/v1/contacts', {
      name: formValues.name,
      email: formValues.email,
      phone: formValues.phone,
      subject: formValues.subject,
      message: formValues.message
    });
    alert('Xabaringiz yuborildi!');
  } catch (error) {
    alert(error.response?.data?.message || 'Xatolik yuz berdi');
  }
};
```

### 6. Maslahat so'rovi yuborish (Public – token kerak emas)
```javascript
const requestConsultation = async (formValues) => {
  const { data } = await axios.post('http://localhost:5000/api/v1/consultations', {
    fullName: formValues.fullName,
    phone: formValues.phone,
    email: formValues.email,
    serviceId: formValues.serviceId,
    preferredDate: formValues.date,
    preferredTime: formValues.time,
    message: formValues.message
  });
  return data;
};
```

---

## 📋 MODELLAR ORASIDAGI BOG'LANISHLAR

```
Category ──┬── hasMany ──> Project
            ├── hasMany ──> Skill
            ├── hasMany ──> Service ──┬── hasMany ──> ServiceDetail
            │                         └── hasMany ──> Consultation
            ├── hasMany ──> BlogPost ──┬── hasMany ──> BlogComment (nested replies)
            │                          ├── hasMany ──> BlogRating
            │                          └── manyToMany ──> Tag
            ├── hasMany ──> News ──── manyToMany ──> Tag
            └── hasMany ──> Faq
```

---

## ✅ TEZKOR ESLATMALAR

1. **Public endpointlar** – Token kerak emas (landing sahifasi uchun)
2. **Private endpointlar (🔒)** – `Authorization: Bearer <token>` headerida token kerak
3. **Rasm yuklash** – Har doim `multipart/form-data` formatida, to'g'ri field nomi bilan
4. **Pagination** – Default: `page=1`, `limit=10`
5. **Sort** – Default: `-createdAt` (eng yangi birinchi)
6. **JSONB fieldlar** – `image`, `avatar`, `coverImage`, `gallery`, `socialLinks`, `stats`, `location`, `languages` – JSON ob'ekt sifatida qaytadi
7. **UUID** – Barcha ID'lar UUID formatida: `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"`
8. **Slug** – `title`dan avtomatik yaratiladi, URL uchun ishlatiladi
9. **isActive** – Ko'p modellarda bor, frontendda `isActive=true` bilan filter qilish tavsiya etiladi
