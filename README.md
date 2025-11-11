# AI Borsa Analiz Platformu

Bu depo, AI destekli Borsa İstanbul analiz panelini çalıştırmak için gereken tüm kaynak kodu içerir. Proje, [Vite](https://vitejs.dev) tabanlı React uygulaması ve Tailwind CSS ile yapılandırılmıştır; bu sayede Vercel gibi statik barındırma platformlarına kolayca dağıtılabilir.

## Özellikler

- Portföy optimizasyonu, teknik/temel analiz panelleri ve AI sohbet modülü
- Firebase (Firestore) ile isteğe bağlı gerçek zamanlı portföy senkronizasyonu
- Monte Carlo tabanlı getiri simülasyonları ve görselleştirmeleri
- Vitest ile kapsamlı yardımcı fonksiyon testleri

## Başlarken

### Gereksinimler
- Node.js 18 veya üzeri
- npm 9 veya üzeri

### Kurulum
```bash
npm install
```

### Geliştirme Sunucusu
```bash
npm run dev
```
Komut sonrasında belirtilen yerel adresi (varsayılan olarak `http://localhost:5173`) ziyaret ederek uygulamayı tarayıcıda görüntüleyebilirsiniz.

### Testleri Çalıştırma
```bash
npm test
```
Vitest, portföy optimizasyonu ve simülasyon yardımcılarını doğrular.

### Üretim İçin Derleme
```bash
npm run build
```
Komut `dist/` klasöründe dağıtıma hazır statik dosyaları üretir. Lokalde doğrulamak için:
```bash
npm run preview
```

## Firebase Yapılandırması (Opsiyonel)
Uygulama, global değişkenler aracılığıyla Firebase ayarlarını bekler. Vercel üzerinde bu değişkenleri tanımlamak için `Project Settings → Environment Variables` alanından aşağıdakileri ekleyebilirsiniz:

- `__firebase_config`: Firebase yapılandırmanızı JSON formatında bir string olarak girin (ör. `{ "apiKey": "..." }`).
- `__initial_auth_token`: Özel kimlik doğrulama token’ı kullanıyorsanız isteğe bağlıdır.
- `__app_id`: Firestore koleksiyonlarını isimlendirmek için kullanılır (varsayılan `default-app-id`).

Bu değişkenler tanımlanmadığında uygulama, yerel durumla çalışmaya devam eder.

## Vercel’e Dağıtım
1. Depoyu GitHub’a push’ladıktan sonra Vercel’de yeni bir proje oluşturun ve bu depoyu bağlayın.
2. Build komutu olarak `npm run build`, output klasörü olarak `dist` ayarlıdır.
3. Gerekliyse yukarıdaki Firebase ortam değişkenlerini ekleyin.
4. Deploy’u başlattığınızda Vercel otomatik olarak `npm install` ardından `npm run build` çalıştıracak ve uygulamayı yayınlayacaktır.

## Lisans
Bu proje için ayrı bir lisans belirtilmemiştir; kullanım koşulları için depo sahibine danışın.
