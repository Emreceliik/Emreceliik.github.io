# 📧 EmailJS Kurulum Kılavuzu

Bu kılavuz EmailJS ile web sitenize gerçek email gönderme özelliği eklemeniz için gerekli adımları içerir.

## 🚀 Adım 1: EmailJS Hesabı Oluşturun

1. **EmailJS web sitesine gidin**: https://www.emailjs.com/
2. **"Sign Up"** butonuna tıklayın
3. Hesabınızı oluşturun (Google ile giriş yapabilirsiniz)
4. Email adresinizi doğrulayın

## 📧 Adım 2: Email Servisini Bağlayın

1. **Dashboard**'a girin
2. **"Email Services"** sekmesine tıklayın
3. **"Add New Service"** butonuna tıklayın
4. Email servisinizi seçin:
   - **Gmail** (en kolay)
   - **Outlook/Hotmail**
   - **Yahoo**
   - **Custom SMTP**

### Gmail İçin:
1. **Gmail**'i seçin
2. **"Connect Account"** tıklayın
3. Google hesabınızla giriş yapın
4. **Service ID**'yi not edin (örnek: `service_gmail123`)

## 📝 Adım 3: Email Template Oluşturun

1. **"Email Templates"** sekmesine gidin
2. **"Create New Template"** tıklayın
3. **Template Name**: `rigid_logic_contact`
4. Aşağıdaki template'i kopyalayın:

### Email Template:
```
Subject: Yeni İletişim Formu Mesajı - {{subject}}

Merhaba Rigid Logic Ekibi,

Web sitenizden yeni bir mesaj aldınız:

👤 İsim: {{from_name}}
📧 Email: {{from_email}}
🏢 Şirket: {{company}}
📋 Konu: {{subject}}

💬 Mesaj:
{{message}}

---
Bu mesaj {{from_email}} adresinden gönderilmiştir.
Cevap vermek için bu email adresini kullanabilirsiniz.

Rigid Logic Web Sitesi
```

5. **"Save"** butonuna tıklayın
6. **Template ID**'yi not edin (örnek: `template_abc123`)

## 🔑 Adım 4: Public Key'i Alın

1. **"Account"** menüsüne gidin
2. **"General"** sekmesinde **Public Key**'i bulun
3. Public Key'i kopyalayın (örnek: `user_abc123xyz`)

## ⚙️ Adım 5: Script.js Dosyasını Güncelleyin

`script.js` dosyasını açın ve **7-11. satırlar arasındaki** **EMAILJS_CONFIG** bölümünü güncelleyin:

**ÖNCE (değiştirmeden önce):**
```javascript
const EMAILJS_CONFIG = {
    serviceID: 'YOUR_SERVICE_ID',        // ⚠️ EmailJS'te oluşturacağınız Service ID
    templateID: 'YOUR_TEMPLATE_ID',      // ⚠️ EmailJS'te oluşturacağınız Template ID
    publicKey: 'YOUR_PUBLIC_KEY'         // ⚠️ EmailJS'ten alacağınız Public Key
};
```

**SONRA (değiştirdikten sonra):**
```javascript
const EMAILJS_CONFIG = {
    serviceID: 'service_gmail123',      // ← Gmail servis ID'nizi buraya
    templateID: 'template_abc123',      // ← Template ID'nizi buraya  
    publicKey: 'user_abc123xyz'         // ← Public Key'inizi buraya
};
```

**⚠️ DİKKAT**: Tırnak işaretlerini (quotes) silmeyin, sadece içindeki metni değiştirin!

## 🎯 Adım 6: Test Edin

1. Web sitenizi açın
2. İletişim formunu doldurun
3. Captcha'yı girin
4. **"Send Message"** butonuna tıklayın
5. EmailJS'e bağladığınız email adresini kontrol edin

## 📊 EmailJS Dashboard'da Kontrol

1. EmailJS Dashboard'a gidin
2. **"Logs"** sekmesinde gönderilen emailları görebilirsiniz
3. Başarılı gönderimler **yeşil**, hatalar **kırmızı** olarak görünür

## 🚨 Yaygın Hatalar ve Çözümleri

### ❌ "Invalid public key"
**Çözüm**: Public Key'i kontrol edin, doğru kopyaladığınızdan emin olun

### ❌ "Template not found"
**Çözüm**: Template ID'yi kontrol edin ve template'in aktif olduğundan emin olun

### ❌ "Service not found"  
**Çözüm**: Service ID'yi kontrol edin ve email servisinin bağlı olduğundan emin olun

### ❌ "Rate limit exceeded"
**Çözüm**: EmailJS ücretsiz planda ayda 200 email limitiniz var. Limit aşıldıysa bekleyin veya ücretli plana geçin

## 💡 Önemli Notlar

1. **Ücretsiz Plan**: Ayda 200 email
2. **Güvenlik**: Public Key frontend'te görünür, bu normal
3. **Spam Koruması**: Captcha sistemi zaten mevcut
4. **Email Adresi**: Form doldurulduğunda belirlediğiniz email adresine mesaj gelir

## 🎉 Başarılı Kurulum

Eğer her şey doğru yapıldıysa:
- ✅ Form gönderildiğinde "Mesajınız için teşekkürler!" mesajı çıkar
- ✅ EmailJS Dashboard'da log görünür  
- ✅ Email adresinize mesaj gelir
- ✅ Konsol'da "Email gönderildi!" mesajı görünür

## 🆘 Yardım

Herhangi bir sorun yaşarsanız:
1. Browser konsol'unu açın (F12)
2. Hata mesajlarını kontrol edin
3. EmailJS Dashboard'da logs'u kontrol edin
4. Bu dosyadaki çözümleri deneyin

---
**Email sistemi artık tamamen çalışır durumda! 🎯** 