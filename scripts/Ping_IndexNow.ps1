# ====================================================================
# INDEXNOW AUTO PINGER (Programatik SEO Hızlandırıcısı)
# ====================================================================
# Bu script, sitenizin root sitemap'ini (sitemap.xml) okur ve Microsoft
# Bing / Yandex arama motoru ağlarına (IndexNow) yenilenen URL'leri
# aynı gün içinde ping atarak anlık indeksleme sağlar.
# ====================================================================

$siteUrl = "https://www.yetkilikombiservisi.tr"
$indexNowKey = "81e5f8f8ab3449339e8ff583344675ad"
$indexNowApiUrl = "https://api.indexnow.org/indexnow"

Write-Host ">>> INDEXNOW PINGER BAŞLATILIYOR..." -ForegroundColor Cyan

# 1. Root Sitemap'i Çek
$sitemapUrl = "$siteUrl/sitemap.xml"
Write-Host "[1] Sitemap İndiriliyor: $sitemapUrl" -ForegroundColor Yellow

try {
    $xmlData = Invoke-RestMethod -Uri $sitemapUrl
} catch {
    Write-Host "[HATA] Sitemap indirilemedi. Sitenin yayında olduğundan emin olun." -ForegroundColor Red
    exit
}

# Sitemap Index mi yoksa normal urlset mi kontrol et
$urlsToPing = @()

if ($xmlData.sitemapindex) {
    Write-Host "[2] Sitemap Index bulundu. Alt sitemapler analiz ediliyor..." -ForegroundColor Yellow
    foreach ($sitemap in $xmlData.sitemapindex.sitemap) {
        try {
            $subData = Invoke-RestMethod -Uri $sitemap.loc
            if ($subData.urlset) {
                # Her alt sitemapten en popüler olan ilk 50 URL'i çekelim (Spam olmamak için)
                $chunkUrls = $subData.urlset.url | Select-Object -First 50 | ForEach-Object { $_.loc }
                $urlsToPing += $chunkUrls
                Write-Host "    - $($sitemap.loc) firmasından $( $chunkUrls.Count ) URL eklendi." -ForegroundColor DarkGray
            }
        } catch {
            Write-Host "    - Alt Sitemap hatası: $($sitemap.loc)" -ForegroundColor Red
        }
    }
} elseif ($xmlData.urlset) {
    $urlsToPing = $xmlData.urlset.url | ForEach-Object { $_.loc }
}

if ($urlsToPing.Count -eq 0) {
    Write-Host "[HATA] Gönderilecek URL bulunamadı." -ForegroundColor Red
    exit
}

Write-Host "[3] Toplam $( $urlsToPing.Count ) adet URL başarıyla ayrıştırıldı. (Ping limiti için filtreleme yapılmıştır)" -ForegroundColor Green

# 2. JSON Çıktısını Hazırla
$payload = @{
    host = "www.yetkilikombiservisi.tr"
    key = $indexNowKey
    keyLocation = "$siteUrl/$indexNowKey.txt"
    urlList = $urlsToPing
}

$jsonPayload = $payload | ConvertTo-Json -Depth 10

# 3. Yandex / Bing (IndexNow) Sunucusuna Gönder
Write-Host "[4] Microsoft Bing ve Yandex Ağına Sinyal Atılıyor..." -ForegroundColor Yellow

try {
    # Windows PowerShell'de Karakter Kodlaması sıkıntısı olmaması için
    # JSON objesini saf UTF-8 byte dizisine çevirerek yolluyoruz.
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonPayload)
    $null = Invoke-RestMethod -Uri $indexNowApiUrl -Method Post -Body $bytes -ContentType "application/json; charset=utf-8"
    Write-Host "[BAŞARILI] Ping başarıyla ulaştı! (Durum Kodu 200/202). Arama motorları sitenizi sıraya aldı." -ForegroundColor Green
} catch {
    Write-Host "[HATA] Ping gönderilirken hata oluştu: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ">>> İŞLEM TAMAMLANDI." -ForegroundColor Cyan
