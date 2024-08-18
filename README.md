## Yemek Siparişi Uygulaması için NestJS Projesi - README

### Giriş
Bu proje, NestJS framework'ü üzerine kurulmuş, GraphQL API'si ile çalışan ve Prisma ORM aracılığıyla PostgreSQL veritabanına bağlanan bir yemek siparişi uygulamasıdır. Proje, restoranların menülerini yönetmelerine, müşterilerin sipariş vermelerine ve siparişlerin takibi yapılmasına olanak tanır.

### Teknolojiler
* **NestJS:** TypeScript tabanlı, ölçeklenebilir ve güçlü bir Node.js framework'ü.
* **GraphQL:** Esnek ve güçlü bir API sorgulama dili.
* **Prisma:** PostgreSQL için modern bir ORM (Object-Relational Mapper).
* **PostgreSQL:** Güvenilir ve yüksek performanslı bir ilişkisel veritabanı yönetim sistemi.

### Kurulum
1. **Node.js ve npm (veya yarn veya pnpm) yükleme:** Sisteminize uygun Node.js sürümünü yükleyin.
2. **Projenin klonlanması:**
   ```bash
   git clone https://github.com/mavzerbay/Food-Delivery.git
   ```
3. **Bağımlılıkların yüklenmesi:** Proje dizinine geçip aşağıdaki komutu çalıştırın:
   ```bash
   pnpm install
   ```
4. **.env dosyasının oluşturulması:** `.env.example` dosyasını `.env` olarak kopyalayın ve veritabanı bağlantı bilgilerinizi ve diğer ayarlarınızı bu dosyada belirtin.

### Çalıştırma
```bash
cd servers && npm run start:dev users
```
Uygulama varsayılan olarak `http://localhost:4000` adresinde çalışacaktır.

### GraphQL Şeması
GraphQL şeması, `servers/prisma` dosyasında tanımlanmıştır. Bu dosyada tüm queryler, mutasyonlar ve nesne tipleri belirtilmiştir.

### Veritabanı
Veritabanı göçleri için `prisma` komutlarını kullanabilirsiniz. Örneğin:
* **Göç oluşturma:** `npx prisma migrate dev`
* **Göç uygulama:** `npx prisma migrate deploy`

### Proje Yapısı
* **src:** Proje kaynak kodlarının bulunduğu ana dizin.
* **graphql:** GraphQL şeması ve resolverların bulunduğu dizin.
* **prisma:** Prisma ORM için gerekli dosyaların bulunduğu dizin.

### Katkıda Bulunma
Projeye katkıda bulunmak isterseniz, lütfen GitHub üzerinde bir pull request oluşturun.
