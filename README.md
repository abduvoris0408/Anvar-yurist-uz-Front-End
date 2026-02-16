# 📦 Portfolio API – Frontend Payload Documentation

Ushbu hujjat frontend dasturchilar uchun **POST** (yaratish) va **PUT** (yangilash) so'rovlarida yuborilishi kerak bo'lgan aniq JSON ma'lumotlarni o'z ichiga oladi.

> 💡 **Eslatma:** Barcha `id` maydonlari (masalan `categoryId`, `serviceId`) **UUID** formatida bo'lishi shart.

---

## 🔐 1. Auth (Autentifikatsiya)

### Login (POST `/auth/login`)
```json
{
  "email": "admin@portfolio.com",
  "password": "sizning_parolingiz"
}
```

### Refresh Token (POST `/auth/refresh-token`)
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Update Details (PUT `/auth/update-details`)
```json
{
  "name": "Yangi Ism",
  "email": "yangi@email.com"
}
```

### Update Password (PUT `/auth/update-password`)
```json
{
  "currentPassword": "eski_parol",
  "newPassword": "yangi_parol"
}
```

---

## 📄 2. About (Men Haqimda)

### Update Info (POST/PUT `/about`)
> **Muhim:** Bu endpoint Singleton (yagona ma'lumot).
```json
{
  "fullName": "Abdulaziz Karimov",
  "title": "Advokat",
  "subtitle": "Yuridik xizmatlar",
  "typingTexts": ["Advokat", "Yurist", "Konsultant"],
  "bio": "Men haqimda to'liq ma'lumot...",
  "shortBio": "Qisqa bio",
  "phone": "+998901234567",
  "email": "info@example.com",
  "address": "Toshkent sh.",
  "birthday": "1995-05-15",
  "nationality": "O'zbek",
  "freelanceStatus": "available",
  "location": {
    "city": "Toshkent",
    "country": "Uzbekistan",
    "mapUrl": "https://maps.google.com/..."
  },
  "languages": [
    { "name": "O'zbek", "level": "Native" },
    { "name": "Ingliz", "level": "B2" }
  ],
  "socialLinks": {
    "telegram": "https://t.me/...",
    "instagram": "https://instagram.com/...",
    "linkedin": "https://linkedin.com/..."
  },
  "stats": {
    "projectsCompleted": 100,
    "happyClients": 200,
    "yearsExperience": 5,
    "awardsWon": 2
  },
  "interests": ["Sayohat", "Kitob"],
  "whatIDo": [
    { "title": "Fuqarolik ishlari", "description": "...", "icon": "⚖️" }
  ],
  "seo": {
    "metaTitle": "SEO Sarlavha",
    "metaDescription": "SEO Tavsif",
    "metaKeywords": ["advokat", "yurist"],
    "ogImage": ""
  }
}
```

---

## 📂 3. Categories (Kategoriyalar)

### Create/Update (POST/PUT `/categories`)
```json
{
  "name": "Fuqarolik huquqi",
  "type": "service", 
  "description": "Tavsif...",
  "icon": "⚖️",
  "color": "#3B82F6"
}
```
> **`type`:** `project`, `blog`, `service`, `skill`, `news`

---

## 💼 4. Services (Xizmatlar)

### Create/Update (POST/PUT `/services`)
```json
{
  "title": "Maslahat xizmati",
  "description": "To'liq tavsif...",
  "shortDescription": "Qisqa tavsif",
  "icon": "🗣️",
  "categoryId": "uuid-category-id", 
  "price": "500 000 so'm",
  "order": 1,
  "isActive": true
}
```

---

## 📋 5. Service Details (Xizmat Tafsilotlari)

### Create/Update (POST/PUT `/service-details`)
```json
{
  "serviceId": "uuid-service-id",
  "title": "Onlayn konsultatsiya",
  "description": "Zoom orqali",
  "icon": "💻",
  "order": 1
}
```

---

## 🏗️ 6. Projects (Loyihalar)

### Create/Update (POST/PUT `/projects`)
```json
{
  "title": "Katta sud ishi",
  "description": "Batafsil...",
  "shortDescription": "Qisqa...",
  "clientUrl": "https://client.com",
  "categoryId": "uuid-category-id",
  "status": "published",
  "isFeatured": true,
  "order": 1,
  "completedAt": "2024-02-10",
  "gallery": [] 
}
```
> **`status`:** `draft`, `published`, `archived`

---

## 🎯 7. Skills (Ko'nikmalar)

### Create/Update (POST/PUT `/skills`)
```json
{
  "name": "Muzokaralar",
  "level": "expert",
  "percentage": 90,
  "icon": "🤝",
  "categoryId": "uuid-category-id",
  "order": 1,
  "isActive": true
}
```
> **`level`:** `beginner`, `intermediate`, `advanced`, `expert`

---

## 📝 8. Blog Posts (Maqolalar)

### Create/Update (POST/PUT `/blog-posts`)
```json
{
  "title": "Meros huquqi haqida",
  "content": "<p>HTML content...</p>",
  "excerpt": "Qisqa...",
  "categoryId": "uuid-category-id",
  "status": "published",
  "isFeatured": false,
  "allowComments": true,
  "metaTitle": "SEO Title",
  "metaDescription": "SEO Desc",
  "tags": ["uuid-tag-1", "uuid-tag-2"]
}
```

---

## 💬 9. Blog Comments (Izohlar)

### Create (POST `/blog-comments`) - Public
```json
{
  "blogPostId": "uuid-post-id",
  "guestName": "Ali",
  "guestEmail": "ali@mail.com",
  "content": "Zo'r maqola!",
  "parentCommentId": null 
}
```

### Update Status (PUT `/blog-comments/:id/status`) - Admin
```json
{
  "status": "approved"
}
```
> **`status`:** `pending`, `approved`, `rejected`

---

## ⭐ 10. Blog Ratings (Baholar)

### Create (POST `/blog-ratings`) - Public
```json
{
  "blogPostId": "uuid-post-id",
  "rating": 5
}
```

---

## 📰 11. News (Yangiliklar)

### Create/Update (POST/PUT `/news`)
```json
{
  "title": "Qonunchilikdagi o'zgarishlar",
  "content": "<p>HTML...</p>",
  "excerpt": "Qisqa...",
  "categoryId": "uuid-category-id",
  "tags": ["uuid-tag-1"],
  "source": "Kun.uz",
  "sourceUrl": "https://kun.uz/...",
  "status": "published",
  "isFeatured": false
}
```

---

## 🏷️ 12. Tags (Teglar)

### Create/Update (POST/PUT `/tags`)
```json
{
  "name": "Sud",
  "color": "#EF4444"
}
```

---

## 💼 13. Experiences (Tajriba)

### Create/Update (POST/PUT `/experiences`)
```json
{
  "company": "Firma Nomi",
  "position": "Bosh Yurist",
  "description": "Vazifalar...",
  "specializations": ["Korporativ", "Mehnat"],
  "location": "Toshkent",
  "companyUrl": "https://firma.u",
  "startDate": "2020-01-01",
  "endDate": "2023-01-01", 
  "current": false,
  "order": 1
}
```
> Agar `current: true` bo'lsa, `endDate`ni `null` qilib yuboring yoki yubormang.

---

## 🎓 14. Education (Ta'lim)

### Create/Update (POST/PUT `/education`)
```json
{
  "school": "Universitet Nomi",
  "degree": "Bakalavr",
  "fieldOfStudy": "Huquqshunoslik",
  "description": "...",
  "gpa": 4.8,
  "achievements": ["Stipendiat"],
  "schoolUrl": "https://uni.uz",
  "startDate": "2016-09-01",
  "endDate": "2020-06-30",
  "current": false,
  "order": 1
}
```

---

## 📧 15. Contacts (Xabarlar)

### Send Message (POST `/contacts`) - Public
```json
{
  "name": "Vali",
  "email": "vali@mail.com",
  "phone": "+99890...",
  "subject": "Ish bo'yicha",
  "message": "Salom..."
}
```

---

## 🌟 16. Testimonials (Mijoz Fikrlari)

### Create/Update (POST/PUT `/testimonials`)
```json
{
  "clientName": "Mijoz Ismi",
  "clientPosition": "Direktor",
  "content": "Rahmat kattakon...",
  "rating": 5,
  "caseType": "Ajrim ishi",
  "order": 1,
  "isActive": true
}
```

---

## ❓ 17. FAQs (Savol-Javob)

### Create/Update (POST/PUT `/faqs`)
```json
{
  "question": "Xizmat narxi qancha?",
  "answer": "Kelishilgan holda...",
  "categoryId": "uuid-category-id",
  "order": 1,
  "isActive": true
}
```

---

## 🤝 18. Partners (Hamkorlar)

### Create/Update (POST/PUT `/partners`)
```json
{
  "name": "Hamkor Firma",
  "url": "https://hamkor.uz",
  "description": "...",
  "order": 1,
  "isActive": true
}
```

---

## 📅 19. Consultations (Maslahat)

### Request (POST `/consultations`) - Public
```json
{
  "fullName": "Ism Familiya",
  "phone": "+99890...",
  "email": "email@mail.com",
  "serviceId": "uuid-service-id",
  "preferredDate": "2024-05-20",
  "preferredTime": "10:00",
  "message": "Qisqa izoh..."
}
```

### Update Status (PUT `/consultations/:id`) - Admin
```json
{
  "status": "confirmed",
  "adminNotes": "Mijoz bilan gaplashildi"
}
```
> **`status`:** `pending`, `confirmed`, `completed`, `cancelled`

---

## 🏆 20. Achievements (Yutuqlar)

### Create/Update (POST/PUT `/achievements`)
```json
{
  "title": "Yil advokati",
  "issuer": "Advokatlar palatasi",
  "date": "2023-12-01",
  "description": "...",
  "type": "award",
  "order": 1,
  "isActive": true
}
```
> **`type`:** `license`, `certificate`, `award`, `membership`

