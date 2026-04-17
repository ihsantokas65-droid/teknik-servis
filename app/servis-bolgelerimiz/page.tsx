import Link from "next/link";
import { getCities } from "@/lib/geo";
import { MapPin, ArrowRight, ShieldCheck } from "lucide-react";
import { site } from "@/lib/site";

export const metadata = {
  title: "Tüm Hizmet Bölgelerimiz | 81 İl Teknik Servis Ağı",
  description: "Türkiye geneli 81 ilde hizmet veren profesyonel teknik servis ağımızın tüm kapsama alanlarını inceleyin. İl ve ilçe bazlı uzman servis ekiplerimiz.",
};

export default function ServiceRegionsPage() {
  const cities = getCities();

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-brand-900 text-white py-16">
        <div className="container">
          <div className="flex items-center gap-4 mb-6">
            <span className="badge">Kapsama Alanı</span>
            <div className="flex items-center gap-1 text-brand">
               <ShieldCheck size={16} />
               <span className="text-sm font-bold">Resmi Onaylı</span>
            </div>
          </div>
          <h1 className="h1 text-white mb-6">
             Hizmet <span className="text-brand">Bölgelerimiz</span>
          </h1>
          <p className="text-xl opacity-80 max-w-2xl">
             Türkiye&apos;nin 81 ilinde, binlerce uzman teknisyenimizle 30 dakikada kapınızdayız. 
             Aşağıdan bulunduğunuz ili seçerek bölgenize özel servis sayfasını ziyaret edebilirsiniz.
          </p>
        </div>
      </section>

      {/* Cities Grid */}
      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {cities.map((city) => (
              <Link 
                key={city.slug} 
                href={`/${city.slug}`}
                className="card hover flex items-center justify-between p-6 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-soft flex items-center justify-center text-brand">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 className="h3 group-hover:text-brand transition-colors">
                      {city.name}
                    </h3>
                    <p className="text-xs text-muted">Hemen Servis Al</p>
                  </div>
                </div>
                <ArrowRight size={18} className="text-muted group-hover:text-brand transform group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Factors */}
      <section className="section bg-slate-50">
        <div className="container text-center">
          <h2 className="h2 mb-12">Neden Bizim <span className="text-brand">Servis Ağımız?</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-8">
              <h3 className="h3 mb-4">Geniş Kapsama Alanı</h3>
              <p className="text-muted">Türkiye&apos;nin en ücra noktasına kadar ulaşan mobil ekiplerimizle her yerdeyiz.</p>
            </div>
            <div className="card p-8">
              <h3 className="h3 mb-4">Hızlı Müdahale</h3>
              <p className="text-muted">Bulunduğunuz ildeki en yakın ekibi yönlendirerek zaman kaybını önlüyoruz.</p>
            </div>
            <div className="card p-8">
              <h3 className="h3 mb-4">Garanti Desteği</h3>
              <p className="text-muted">Tüm hizmet bölgelerimizde yapılan işlemler 1 yıl parça ve işçilik garantilidir.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
