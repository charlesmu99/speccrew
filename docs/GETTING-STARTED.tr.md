# SpecCrew Hızlı Başlangıç Kılavuzu

<p align="center">
  <a href="./GETTING-STARTED.md">简体中文</a> |
  <a href="./GETTING-STARTED.zh-TW.md">繁體中文</a> |
  <a href="./GETTING-STARTED.en.md">English</a> |
  <a href="./GETTING-STARTED.ko.md">한국어</a> |
  <a href="./GETTING-STARTED.de.md">Deutsch</a> |
  <a href="./GETTING-STARTED.es.md">Español</a> |
  <a href="./GETTING-STARTED.fr.md">Français</a> |
  <a href="./GETTING-STARTED.it.md">Italiano</a> |
  <a href="./GETTING-STARTED.da.md">Dansk</a> |
  <a href="./GETTING-STARTED.ja.md">日本語</a> |
  <a href="./GETTING-STARTED.ar.md">العربية</a>
</p>

Bu belge, SpecCrew'ın Agent ekibini kullanarak standart mühendislik süreçlerine göre gereksinimlerden teslimata kadar tam geliştirmeyi nasıl tamamlayacağınızı hızlıca anlamanıza yardımcı olur.

---

## 1. Ön Koşullar

### SpecCrew'ı Yükle

```bash
npm install -g speccrew
```

### Projeyi Başlat

```bash
speccrew init --ide qoder
```

Desteklenen IDE'ler: `qoder`, `cursor`, `claude`, `codex`

### Başlatma Sonrası Dizin Yapısı

```
.
├── .qoder/
│   ├── agents/          # Agent tanım dosyaları
│   └── skills/          # Skill tanım dosyaları
├── speccrew-workspace/  # Workspace
│   ├── docs/            # Yapılandırmalar, kurallar, şablonlar, çözümler
│   ├── iterations/      # Devam eden iterasyonlar
│   ├── iteration-archives/  # Arşivlenmiş iterasyonlar
│   └── knowledges/      # Bilgi tabanı
│       ├── base/        # Temel bilgiler (teşhis raporları, teknik borçlar)
│       ├── bizs/        # İş bilgi tabanı
│       └── techs/       # Teknik bilgi tabanı
```

### CLI Komut Hızlı Başvurusu

| Komut | Açıklama |
|------|------|
| `speccrew list` | Tüm mevcut Agent'ları ve Skill'leri listele |
| `speccrew doctor` | Yükleme bütünlüğünü kontrol et |
| `speccrew update` | Proje yapılandırmasını en son sürüme güncelle |
| `speccrew uninstall` | SpecCrew'ı kaldır |

---

## 2. Kurulumdan Sonra 5 Dakikada Hızlı Başlangıç

`speccrew init` çalıştırdıktan sonra, hızlıca çalışma durumuna girmek için şu adımları izleyin:

### Adım 1: IDE'nizi Seçin

| IDE | Başlatma Komutu | Uygulama Senaryosu |
|-----|-----------|----------|
| **Qoder** (Önerilen) | `speccrew init --ide qoder` | Tam agent orkestrasyonu, paralel worker'lar |
| **Cursor** | `speccrew init --ide cursor` | Composer tabanlı iş akışları |
| **Claude Code** | `speccrew init --ide claude` | CLI-first geliştirme |
| **Codex** | `speccrew init --ide codex` | OpenAI ekosistem entegrasyonu |

### Adım 2: Bilgi Tabanını Başlat (Önerilen)

Mevcut kaynak kodu olan projeler için, agent'ların kod tabanınızı anlaması için önce bilgi tabanını başlatmanız önerilir:

```
@speccrew-team-leader teknik bilgi tabanını başlat
```

Sonra:

```
@speccrew-team-leader iş bilgi tabanını başlat
```

### Adım 3: İlk Görevinizi Başlatın

```
@speccrew-product-manager Yeni bir gereksinimim var: [işlevsel gereksiniminizi açıklayın]
```

> **İpucu**: Ne yapacağınızdan emin değilseniz, sadece `@speccrew-team-leader başlamama yardım et` deyin — Team Leader proje durumunuzu otomatik olarak algılayacak ve size rehberlik edecektir.

---

## 3. Hızlı Karar Ağacı

Ne yapacağınızdan emin değil misiniz? Senaryonuzu aşağıda bulun:

- **Yeni bir işlevsel gereksinimim var**
  → `@speccrew-product-manager Yeni bir gereksinimim var: [işlevsel gereksiniminizi açıklayın]`

- **Mevcut proje bilgisini taramak istiyorum**
  → `@speccrew-team-leader teknik bilgi tabanını başlat`
  → Sonra: `@speccrew-team-leader iş bilgi tabanını başlat`

- **Önceki çalışmaya devam etmek istiyorum**
  → `@speccrew-team-leader mevcut ilerleme nedir?`

- **Sistem sağlık durumunu kontrol etmek istiyorum**
  → Terminalde çalıştır: `speccrew doctor`

- **Ne yapacağımdan emin değilim**
  → `@speccrew-team-leader başlamama yardım et`
  → Team Leader proje durumunuzu otomatik olarak algılayacak ve size rehberlik edecektir

---

## 4. Agent Hızlı Başvurusu

| Rol | Agent | Sorumluluklar | Komut Örneği |
|------|-------|-----------------|-----------------|
| Takım Lideri | `@speccrew-team-leader` | Proje navigasyonu, bilgi tabanı başlatma, durum kontrolü | "Başlamama yardım et" |
| Ürün Yöneticisi | `@speccrew-product-manager` | Gereksinim analizi, PRD oluşturma | "Yeni bir gereksinimim var: ..." |
| İşlev Tasarımcısı | `@speccrew-feature-designer` | İşlev analizi, spesifikasyon tasarımı, API sözleşmeleri | "X iterasyonu için işlev tasarımını başlat" |
| Sistem Tasarımcısı | `@speccrew-system-designer` | Mimari tasarımım, platform detaylı tasarım | "X iterasyonu için sistem tasarımını başlat" |
| Sistem Geliştirici | `@speccrew-system-developer` | Geliştirme koordinasyonu, kod oluşturma | "X iterasyonu için geliştirmeyi başlat" |
| Test Yöneticisi | `@speccrew-test-manager` | Test planlaması, vaka tasarımı, yürütme | "X iterasyonu için testleri başlat" |

> **Not**: Tüm agent'ları hatırlamanıza gerek yok. Sadece `@speccrew-team-leader` ile konuşun, isteğinizi doğru agent'a yönlendirecektir.

---

## 5. İş Akışı Genel Bakış

### Tam Akış Diyagramı

```mermaid
flowchart LR
    PRD[Aşama 1<br/>Gereksinim Analizi<br/>Product Manager] --> FD[Aşama 2<br/>İşlev Tasarımı<br/>Feature Designer]
    FD --> SD[Aşama 3<br/>Sistem Tasarımı<br/>System Designer]
    SD --> DEV[Aşama 4<br/>Geliştirme<br/>System Developer]
    DEV --> TEST[Aşama 5<br/>Sistem Testi<br/>Test Manager]
    TEST --> ARCHIVE[Aşama 6<br/>Arşivleme]
    
    KB[(Bilgi Tabanı<br/>Tüm Süreç Boyunca)] -.-> PRD
    KB -.-> FD
    KB -.-> SD
    KB -.-> DEV
    KB -.-> TEST
```

### Temel İlkeler

1. **Aşama Bağımlılıkları**: Her aşamanın çıktısı bir sonraki aşamanın girdisidir
2. **Checkpoint Onayı**: Her aşamanın, bir sonraki aşamaya geçmeden önce kullanıcı onayı gerektiren bir onay noktası vardır
3. **Bilgi Tabanı Destekli**: Bilgi tabanı tüm süreç boyunca çalışır, tüm aşamalar için bağlam sağlar

---

## 6. Adım Sıfır: Bilgi Tabanı Başlatma

Resmi mühendislik sürecini başlatmadan önce, proje bilgi tabanını başlatmanız gerekir.

### 6.1 Teknik Bilgi Tabanı Başlatma

**Konuşma Örneği**:
```
@speccrew-team-leader teknik bilgi tabanını başlat
```

**Üç Aşamalı Süreç**:
1. Platform Algılama — Projedeki teknik platformları tanımla
2. Teknik Doküman Oluşturma — Her platform için teknik spesifikasyon belgeleri oluştur
3. İndeks Oluşturma — Bilgi tabanı indeksini oluştur

**Çıktı**:
```
speccrew-workspace/knowledges/techs/{platform-id}/
├── tech-stack.md          # Teknoloji yığını tanımı
├── architecture.md        # Mimari kurallar
├── dev-spec.md            # Geliştirme spesifikasyonları
├── test-spec.md           # Test spesifikasyonları
└── INDEX.md               # İndeks dosyası
```

### 6.2 İş Bilgi Tabanı Başlatma

**Konuşma Örneği**:
```
@speccrew-team-leader iş bilgi tabanını başlat
```

**Dört Aşamalı Süreç**:
1. İşlev Envanteri — Tüm işlevleri tanımlamak için kodu tara
2. İşlev Analizi — Her işlev için iş mantığını analiz et
3. Modül Özeti — İşlevleri modüle göre özetle
4. Sistem Özeti — Sistem seviyesi iş genel görünümü oluştur

**Çıktı**:
```
speccrew-workspace/knowledges/bizs/
├── {platform-type}/
│   └── {module-name}/
│       └── feature-spec.md
└── system-overview.md
```

---

## 7. Aşama Aşama Konuşma Kılavuzu

### 7.1 Aşama 1: Gereksinim Analizi (Product Manager)

**Nasıl Başlatılır**:
```
@speccrew-product-manager Yeni bir gereksinimim var: [gereksiniminizi açıklayın]
```

**Agent İş Akışı**:
1. Mevcut modülleri anlamak için sistem genel görünümünü oku
2. Kullanıcı gereksinimlerini analiz et
3. Yapılandırılmış PRD belgesi oluştur

**Çıktı**:
```
iterations/{numara}-{tip}-{isim}/01.product-requirement/
├── [feature-name]-prd.md           # Ürün Gereksinimleri Belgesi
└── [feature-name]-bizs-modeling.md # İş modellemesi (karmaşık gereksinimler için)
```

**Onay Kontrol Listesi**:
- [ ] Gereksinim açıklaması kullanıcı niyetini doğru şekilde yansıtıyor mu?
- [ ] İş kuralları eksiksiz mi?
- [ ] Mevcut sistemlerle entegrasyon noktaları net mi?
- [ ] Kabul kriterleri ölçülebilir mi?

---

### 7.2 Aşama 2: İşlev Tasarımı (Feature Designer)

**Nasıl Başlatılır**:
```
@speccrew-feature-designer işlev tasarımını başlat
```

**Agent İş Akışı**:
1. Onaylanmış PRD belgesini otomatik olarak bul
2. İş bilgi tabanını yükle
3. İşlev tasarımı oluştur (UI wireframe'leri, etkileşim akışları, veri tanımları, API sözleşmeleri dahil)
4. Birden fazla PRD için paralel tasarım için Task Worker kullan

**Çıktı**:
```
iterations/{iter}/02.feature-design/
└── [feature-name]-feature-spec.md  # İşlev tasarım belgesi
```

**Onay Kontrol Listesi**:
- [ ] Tüm kullanıcı senaryoları kapsanıyor mu?
- [ ] Etkileşim akışları net mi?
- [ ] Veri alanı tanımları eksiksiz mi?
- [ ] İstisna yönetimi kapsamlı mı?

---

### 7.3 Aşama 3: Sistem Tasarımı (System Designer)

**Nasıl Başlatılır**:
```
@speccrew-system-designer sistem tasarımını başlat
```

**Agent İş Akışı**:
1. Feature Spec ve API Contract'ı bul
2. Teknik bilgi tabanını yükle (her platform için teknoloji yığını, mimari, spesifikasyonlar)
3. **Checkpoint A**: Framework Değerlendirmesi — Teknik boşlukları analiz et, yeni framework'ler öner (gerekirse), kullanıcı onayını bekle
4. DESIGN-OVERVIEW.md oluştur
5. Her platform için tasarımı paralel olarak dağıtmak için Task Worker kullan (frontend/backend/mobile/desktop)
6. **Checkpoint B**: Ortak Onay — Tüm platform tasarımlarının özetini göster, kullanıcı onayını bekle

**Çıktı**:
```
iterations/{iter}/03.system-design/
├── DESIGN-OVERVIEW.md              # Tasarım genel görünümü
├── {platform-id}/
│   ├── INDEX.md                    # Platform tasarım indeksi
│   └── {module}-design.md          # Sözde kod seviyesi modül tasarımı
```

**Onay Kontrol Listesi**:
- [ ] Sözde kod gerçek framework sözdizimini kullanıyor mu?
- [ ] Platformlar arası API sözleşmeleri tutarlı mı?
- [ ] Hata yönetimi stratejisi birleşik mi?

---

### 7.4 Aşama 4: Geliştirme (System Developer)

**Nasıl Başlatılır**:
```
@speccrew-system-developer geliştirmeyi başlat
```

**Agent İş Akışı**:
1. Sistem tasarım belgelerini oku
2. Her platform için teknik bilgiyi yükle
3. **Checkpoint A**: Ortam Ön Kontrolü — Runtime sürümlerini, bağımlılıkları, hizmet kullanılabilirliğini kontrol et; başarısız olursa kullanıcı çözümünü bekle
4. Her platform için geliştirmeyi paralel olarak dağıtmak için Task Worker kullan
5. Entegrasyon kontrolü: API sözleşme hizalaması, veri tutarlılığı
6. Teslim raporu oluştur

**Çıktı**:
```
# Kaynak kod proje gerçek kaynak dizinine yazılır
iterations/{iter}/04.development/
├── {platform-id}/
│   └── tasks/                      # Geliştirme görev kayıtları
└── delivery-report.md
```

**Onay Kontrol Listesi**:
- [ ] Ortam hazır mı?
- [ ] Entegrasyon sorunları kabul edilebilir aralıkta mı?
- [ ] Kod geliştirme spesifikasyonlarına uygun mu?

---

### 7.5 Aşama 5: Sistem Testi (Test Manager)

**Nasıl Başlatılır**:
```
@speccrew-test-manager testleri başlat
```

**Üç Aşamalı Test Süreci**:

| Aşama | Açıklama | Checkpoint |
|-------|-------------|------------|
| Test Vaka Tasarımı | PRD ve Feature Spec'e dayalı test vakaları oluştur | A: Vaka kapsam istatistiklerini ve izlenebilirlik matrisini göster, yeterli kapsam kullanıcı onayını bekle |
| Test Kodu Oluşturma | Yürütülebilir test kodu oluştur | B: Oluşturulan test dosyalarını ve vaka eşlemesini göster, kullanıcı onayını bekle |
| Test Yürütme ve Hata Raporlama | Testleri otomatik olarak yürüt ve raporlar oluştur | Yok (otomatik yürütme) |

**Çıktı**:
```
iterations/{iter}/05.system-test/
├── cases/
│   └── {platform-id}/              # Test vaka belgeleri
├── code/
│   └── {platform-id}/              # Test kodu planı
├── reports/
│   └── test-report-{date}.md       # Test raporu
└── bugs/
    └── BUG-{id}-{title}.md         # Hata raporları (hata başına bir dosya)
```

**Onay Kontrol Listesi**:
- [ ] Vaka kapsamı eksiksiz mi?
- [ ] Test kodu yürütülebilir mi?
- [ ] Hata önem derecelendirmesi doğru mu?

---

### 7.6 Aşama 6: Arşivleme

İterasyonlar tamamlandıktan sonra otomatik olarak arşivlenir:

```
speccrew-workspace/iteration-archives/
└── {numara}-{tip}-{isim}-{tarih}/
    ├── 01.product-requirement/
    ├── 02.feature-design/
    ├── 03.system-design/
    ├── 04.development/
    └── 05.system-test/
```

---

## 8. Bilgi Tabanı Genel Bakış

### 8.1 İş Bilgi Tabanı (bizs)

**Amaç**: Proje iş işlevi açıklamalarını, modül bölümlerini, API özelliklerini sakla

**Dizin Yapısı**:
```
knowledges/bizs/
├── {platform-type}/
│   └── {module-name}/
│       └── feature-spec.md
└── system-overview.md
```

**Kullanım Senaryoları**: Product Manager, Feature Designer

### 8.2 Teknik Bilgi Tabanı (techs)

**Amaç**: Proje teknoloji yığınını, mimari kurallarını, geliştirme spesifikasyonlarını, test spesifikasyonlarını sakla

**Dizin Yapısı**:
```
knowledges/techs/{platform-id}/
├── tech-stack.md
├── architecture.md
├── dev-spec.md
├── test-spec.md
└── INDEX.md
```

**Kullanım Senaryoları**: System Designer, System Developer, Test Manager

---

## 9. İş Akışı İlerleme Yönetimi

SpecCrew sanal takımı, her aşamanın bir sonrakine geçmeden önce kullanıcı tarafından onaylanması gereken sıkı bir aşama gate mekanizması izler. Ayrıca yeniden başlatılabilir yürütmeyi de destekler — kesinti sonrası yeniden başlatıldığında, kaldığı yerden otomatik olarak devam eder.

### 9.1 Üç Katmanlı İlerleme Dosyaları

İş akışı, iterasyon dizininde bulunan üç tür JSON ilerleme dosyasını otomatik olarak sürdürür:

| Dosya | Konum | Amaç |
|------|----------|---------|
| `WORKFLOW-PROGRESS.json` | `iterations/{iter}/` | Her pipeline aşamasının durumunu kaydeder |
| `.checkpoints.json` | Her aşama dizini altında | Kullanıcı checkpoint onay durumunu kaydeder |
| `DISPATCH-PROGRESS.json` | Her aşama dizini altında | Paralel görevler için öğe öğe ilerlemeyi kaydeder (çoklu platform/çoklu modül) |

### 9.2 Aşama Durum Akışı

Her aşama bu durum akışını izler:

```
pending → in_progress → completed → confirmed
```

- **pending**: Henüz başlatılmadı
- **in_progress**: Yürütülüyor
- **completed**: Agent yürütmesi tamamlandı, kullanıcı onayı bekleniyor
- **confirmed**: Kullanıcı son checkpoint üzerinden onayladı, sonraki aşama başlayabilir

### 9.3 Yeniden Başlatılabilir Yürütme

Bir aşama için Agent'ı yeniden başlatırken:

1. **Otomatik upstream kontrolü**: Önceki aşamanın onaylanıp onaylanmadığını doğrular, onaylanmadıysa engeller ve ister
2. **Checkpoint kurtarma**: `.checkpoints.json` okur, geçen checkpoint'leri atlar, son kesinti noktasından devam eder
3. **Paralel görev kurtarma**: `DISPATCH-PROGRESS.json` okur, sadece `pending` veya `failed` durumundaki görevleri yeniden yürütür, `completed` görevleri atlar

### 9.4 Mevcut İlerlemeyi Görüntüle

Team Leader Agent üzerinden pipeline panorama durumunu görüntüle:

```
@speccrew-team-leader mevcut iterasyon ilerlemesini görüntüle
```

Team Leader ilerleme dosyalarını okuyacak ve şuna benzer bir durum genel görünümü gösterecek:

```
Pipeline Status: i001-user-management
  01 PRD:            ✅ Confirmed
  02 Feature Design: 🔄 In Progress (Checkpoint A passed)
  03 System Design:  ⏳ Pending
  04 Development:    ⏳ Pending
  05 System Test:    ⏳ Pending
```

### 9.5 Geriye Dönük Uyumluluk

İlerleme dosyası mekanizması tamamen geriye dönük uyumludur — ilerleme dosyaları yoksa (örn. eski projelerde veya yeni iterasyonlarda), tüm Agent'lar orijinal mantığa göre normal şekilde yürütülecektir.

---

## 10. Sıkça Sorulan Sorular (SSS)

### S1: Agent beklenildiği gibi çalışmazsa ne yapmalıyım?

1. Yükleme bütünlüğünü kontrol etmek için `speccrew doctor` çalıştır
2. Bilgi tabanının başlatıldığını onayla
3. Önceki aşamanın çıktısının mevcut iterasyon dizininde olduğunu onayla

### S2: Bir aşamayı nasıl atlarım?

**Önerilmez** — Her aşamanın çıktısı bir sonraki aşamanın girdisidir.

Atlamanız gerekirse, ilgili aşamanın giriş belgesini manuel olarak hazırlayın ve format spesifikasyonlarına uygun olduğundan emin olun.

### S3: Birden fazla paralel gereksinimi nasıl yönetirim?

Her gereksinim için bağımsız iterasyon dizinleri oluşturun:
```
iterations/
├── 001-feature-xxx/
├── 002-feature-yyy/
└── 003-feature-zzz/
```

Her iterasyon tamamen izole edilmiştir ve diğerlerini etkilemez.

### S4: SpecCrew sürümünü nasıl güncellerim?

Güncelleme iki adım gerektirir:

```bash
# Adım 1: Global CLI aracını güncelle
npm install -g speccrew@latest

# Adım 2: Proje dizininde Agent'ları ve Skill'leri senkronize et
cd /path/to/your-project
speccrew update
```

- `npm install -g speccrew@latest`: CLI aracının kendisini günceller (yeni sürümler yeni Agent/Skill tanımları, hata düzeltmeleri vb. içerebilir)
- `speccrew update`: Projenizdeki Agent ve Skill tanım dosyalarını en son sürüme senkronize eder
- `speccrew update --ide cursor`: Sadece belirli IDE için yapılandırmayı günceller

> **Not**: Her iki adım da gereklidir. Sadece `speccrew update` çalıştırmak CLI aracının kendisini güncellemez; sadece `npm install` çalıştırmak proje dosyalarını güncellemez.

### S5: `speccrew update` yeni sürüm mevcut olduğunu gösteriyor ama `npm install -g speccrew@latest` hala eski sürümü yüklüyor?

Bu genellikle npm önbelleğinden kaynaklanır. Çözüm:

```bash
# npm önbelleğini temizle ve yeniden yükle
npm cache clean --force
npm install -g speccrew@latest

# Sürümü doğrula
npm list -g speccrew
```

Hala çalışmıyorsa, belirli bir sürüm numarası ile yüklemeyi deneyin:
```bash
npm install -g speccrew@0.5.6
```

### S6: Geçmiş iterasyonları nasıl görüntülerim?

Arşivlemeden sonra, `speccrew-workspace/iteration-archives/` içinde görüntüleyin, `{numara}-{tip}-{isim}-{tarih}/` formatına göre düzenlenmiş.

### S7: Bilgi tabanının düzenli olarak güncellenmesi gerekir mi?

Aşağıdaki durumlarda yeniden başlatma gereklidir:
- Proje yapısında büyük değişiklikler
- Teknoloji yığını yükseltmesi veya değişimi
- İş modüllerinin eklenmesi/kaldırılması

---

## 11. Hızlı Başvuru

### Agent Başlatma Hızlı Başvurusu

| Aşama | Agent | Başlatma Konuşması |
|-------|-------|-------------------|
| Başlatma | Team Leader | `@speccrew-team-leader teknik bilgi tabanını başlat` |
| Gereksinim Analizi | Product Manager | `@speccrew-product-manager Yeni bir gereksinimim var: [açıklama]` |
| İşlev Tasarımı | Feature Designer | `@speccrew-feature-designer işlev tasarımını başlat` |
| Sistem Tasarımı | System Designer | `@speccrew-system-designer sistem tasarımını başlat` |
| Geliştirme | System Developer | `@speccrew-system-developer geliştirmeyi başlat` |
| Sistem Testi | Test Manager | `@speccrew-test-manager testleri başlat` |

### Checkpoint Kontrol Listesi

| Aşama | Checkpoint Sayısı | Ana Kontrol Öğeleri |
|-------|----------------------|-----------------|
| Gereksinim Analizi | 1 | Gereksinim doğruluğu, iş kuralı bütünlüğü, kabul kriteri ölçülebilirliği |
| İşlev Tasarımı | 1 | Senaryo kapsamı, etkileşim netliği, veri bütünlüğü, istisna yönetimi |
| Sistem Tasarımı | 2 | A: Framework değerlendirmesi; B: Sözde kod sözdizimi, platformlar arası tutarlılık, hata yönetimi |
| Geliştirme | 1 | A: Ortam hazır olması, entegrasyon sorunları, kod spesifikasyonları |
| Sistem Testi | 2 | A: Vaka kapsamı; B: Test kodu yürütülebilirliği |

### Çıktı Yolu Hızlı Başvurusu

| Aşama | Çıktı Dizini | Dosya Formatı |
|-------|-----------------|-------------|
| Gereksinim Analizi | `iterations/{iter}/01.product-requirement/` | `[name]-prd.md`, `[name]-bizs-modeling.md` |
| İşlev Tasarımı | `iterations/{iter}/02.feature-design/` | `[name]-feature-spec.md` |
| Sistem Tasarımı | `iterations/{iter}/03.system-design/` | `DESIGN-OVERVIEW.md`, `{platform}/INDEX.md`, `{platform}/{module}-design.md` |
| Geliştirme | `iterations/{iter}/04.development/` | Kaynak kod + `delivery-report.md` |
| Sistem Testi | `iterations/{iter}/05.system-test/` | `cases/`, `code/`, `reports/`, `bugs/` |
| Arşivleme | `iteration-archives/{iter}-{date}/` | Tam iterasyon kopyası |

---

## Sonraki Adımlar

1. Projenizi başlatmak için `speccrew init --ide qoder` çalıştırın
2. Adım Sıfır'ı yürütün: Bilgi Tabanı Başlatma
3. İş akışına göre aşama aşama ilerleyin, spesifikasyon destekli geliştirme deneyiminin keyfini çıkarın!
