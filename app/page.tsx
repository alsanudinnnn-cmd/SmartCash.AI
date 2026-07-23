import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SmartCash AI | Perakaunan pintar untuk PKS",
  description:
    "Imbas resit, rekod transaksi dan jana laporan kewangan secara automatik dengan SmartCash AI.",
};

const workflow = [
  {
    number: "01",
    title: "Daftar akaun",
    copy: "Sediakan profil perniagaan anda dalam beberapa minit.",
    tone: "primary",
    label: "Profil perniagaan",
  },
  {
    number: "02",
    title: "Log masuk",
    copy: "Akses ruang kerja kewangan anda dengan selamat.",
    tone: "secondary",
    label: "Akses selamat",
  },
  {
    number: "03",
    title: "Lihat dashboard",
    copy: "Pantau jualan, perbelanjaan, untung dan tunai sepintas lalu.",
    tone: "primary",
    label: "Ringkasan masa nyata",
  },
  {
    number: "04",
    title: "Imbas resit",
    copy: "Ambil gambar atau muat naik resit untuk direkodkan.",
    tone: "tertiary",
    label: "Kamera pintar",
  },
  {
    number: "05",
    title: "AI kategorikan",
    copy: "Butiran transaksi dan cukai dikenal pasti secara automatik.",
    tone: "secondary",
    label: "Semakan pantas",
  },
  {
    number: "06",
    title: "Jurnal automatik",
    copy: "Catatan debit dan kredit dijana berdasarkan transaksi.",
    tone: "primary",
    label: "Rekod tepat",
  },
  {
    number: "07",
    title: "Penyata kewangan",
    copy: "Jana penyata utama anda hanya dengan satu klik.",
    tone: "tertiary",
    label: "Sedia untuk semak",
  },
  {
    number: "08",
    title: "Analisis AI",
    copy: "Dapatkan insight, amaran dan cadangan untuk perniagaan.",
    tone: "primary",
    label: "Keputusan lebih yakin",
  },
  {
    number: "09",
    title: "Muat turun laporan",
    copy: "Eksport laporan dalam format PDF, Excel atau CSV.",
    tone: "secondary",
    label: "Format fleksibel",
  },
  {
    number: "10",
    title: "Simpan di cloud",
    copy: "Data disimpan dengan selamat dan boleh dicapai di mana-mana.",
    tone: "primary",
    label: "Sentiasa tersedia",
  },
];

const benefits = [
  {
    title: "Jimat masa",
    copy: "Proses automatik yang memendekkan kerja rekod harian.",
    metric: "10×",
    note: "lebih pantas",
  },
  {
    title: "Kurang kesilapan",
    copy: "Maklumat resit disusun konsisten sebelum anda sahkan.",
    metric: "1",
    note: "aliran kerja",
  },
  {
    title: "Analisis pintar",
    copy: "Fahami prestasi dan aliran tunai tanpa membaca hamparan panjang.",
    metric: "24/7",
    note: "insight tersedia",
  },
];

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#kandungan">
        Langkau ke kandungan utama
      </a>

      <header className="site-header">
        <div className="container nav-wrap">
          <a className="brand" href="#" aria-label="SmartCash AI, halaman utama">
            <span className="brand-mark" aria-hidden="true">
              S
            </span>
            <span>
              SmartCash <strong>AI</strong>
            </span>
          </a>

          <nav className="desktop-nav" aria-label="Navigasi utama">
            <a href="#cara-kerja">Cara ia berfungsi</a>
            <a href="#kelebihan">Kelebihan</a>
            <a href="#laporan">Laporan</a>
          </nav>

          <a className="button button-small" href="#mula">
            Mula sekarang
          </a>

          <details className="mobile-menu">
            <summary aria-label="Buka menu navigasi">
              <span />
              <span />
              <span />
            </summary>
            <nav aria-label="Navigasi mudah alih">
              <a href="#cara-kerja">Cara ia berfungsi</a>
              <a href="#kelebihan">Kelebihan</a>
              <a href="#laporan">Laporan</a>
              <a href="#mula">Mula sekarang</a>
            </nav>
          </details>
        </div>
      </header>

      <main id="kandungan">
        <section className="hero">
          <div className="hero-orb hero-orb-one" aria-hidden="true" />
          <div className="hero-orb hero-orb-two" aria-hidden="true" />
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">
                <span aria-hidden="true">AI</span>
                Dibina untuk PKS Malaysia
              </div>
              <h1>
                Akaun lebih kemas.
                <span>Keputusan lebih pantas.</span>
              </h1>
              <p>
                SmartCash AI menukar resit kepada rekod, jurnal dan laporan
                kewangan—supaya anda boleh fokus mengembangkan perniagaan.
              </p>
              <div className="hero-actions">
                <a className="button" href="#cara-kerja">
                  Lihat cara ia berfungsi
                  <span aria-hidden="true">→</span>
                </a>
                <a className="button button-inverted" href="#laporan">
                  Terokai laporan
                </a>
              </div>
              <ul className="trust-list" aria-label="Kelebihan utama">
                <li><span aria-hidden="true">✓</span> Mudah digunakan</li>
                <li><span aria-hidden="true">✓</span> Rekod automatik</li>
                <li><span aria-hidden="true">✓</span> Data tersusun</li>
              </ul>
            </div>

            <div className="dashboard-card" aria-label="Pratonton dashboard SmartCash AI">
              <div className="dashboard-top">
                <div>
                  <span className="dash-label">Dashboard</span>
                  <strong>Selamat pagi, Nur</strong>
                </div>
                <span className="avatar" aria-hidden="true">NS</span>
              </div>
              <div className="metric-grid">
                <div className="metric metric-primary">
                  <span>Jumlah jualan</span>
                  <strong>RM 48,250</strong>
                  <small>↑ 12.4% bulan ini</small>
                </div>
                <div className="metric metric-secondary">
                  <span>Untung bersih</span>
                  <strong>RM 19,500</strong>
                  <small>↑ 8.2% bulan ini</small>
                </div>
              </div>
              <div className="chart-card">
                <div className="chart-heading">
                  <div>
                    <span>Aliran tunai</span>
                    <strong>6 bulan</strong>
                  </div>
                  <span className="chart-badge">Stabil</span>
                </div>
                <div
                  className="chart"
                  role="img"
                  aria-label="Carta aliran tunai menunjukkan trend menaik sepanjang enam bulan"
                >
                  <span style={{ height: "35%" }} />
                  <span style={{ height: "51%" }} />
                  <span style={{ height: "46%" }} />
                  <span style={{ height: "68%" }} />
                  <span style={{ height: "61%" }} />
                  <span style={{ height: "84%" }} />
                </div>
                <div className="chart-months" aria-hidden="true">
                  <span>Jan</span><span>Feb</span><span>Mac</span>
                  <span>Apr</span><span>Mei</span><span>Jun</span>
                </div>
              </div>
              <div className="receipt-toast">
                <span className="receipt-icon" aria-hidden="true">R</span>
                <span>
                  <strong>Resit berjaya direkod</strong>
                  Kedai Maju · RM 38.27
                </span>
                <span className="toast-check" aria-hidden="true">✓</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section process" id="cara-kerja">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="kicker">Daripada resit kepada laporan</span>
                <h2>Sepuluh langkah. Satu aliran kerja yang lancar.</h2>
              </div>
              <p>
                Setiap tugas disambungkan supaya rekod kewangan anda bergerak
                daripada tangkapan data kepada insight tanpa kerja berulang.
              </p>
            </div>

            <ol className="workflow-grid">
              {workflow.map((step) => (
                <li className={`workflow-card tone-${step.tone}`} key={step.number}>
                  <div className="step-top">
                    <span className="step-number">{step.number}</span>
                    <span className="step-line" aria-hidden="true" />
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                  <span className="step-label">{step.label}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section benefits" id="kelebihan">
          <div className="container benefits-grid">
            <div className="benefits-copy">
              <span className="kicker">Perakaunan yang bekerja untuk anda</span>
              <h2>Kurangkan kerja manual. Tingkatkan keyakinan.</h2>
              <p>
                SmartCash AI menyatukan rekod harian, laporan kewangan dan
                analisis perniagaan dalam pengalaman yang ringkas.
              </p>
              <a className="text-link" href="#mula">
                Bina aliran kerja anda <span aria-hidden="true">→</span>
              </a>
            </div>
            <div className="benefit-cards">
              {benefits.map((benefit) => (
                <article className="benefit-card" key={benefit.title}>
                  <div className="benefit-metric">
                    <strong>{benefit.metric}</strong>
                    <span>{benefit.note}</span>
                  </div>
                  <div>
                    <h3>{benefit.title}</h3>
                    <p>{benefit.copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section reports" id="laporan">
          <div className="container reports-grid">
            <div className="report-window">
              <div className="window-bar">
                <span />
                <span />
                <span />
                <strong>Penyata Kewangan</strong>
              </div>
              <div className="report-content">
                <div className="report-title">
                  <div>
                    <span>Mei 2024</span>
                    <h3>Penyata Pendapatan</h3>
                  </div>
                  <span className="status-pill">Sedia</span>
                </div>
                <div className="report-row report-head">
                  <span>Butiran</span><span>Jumlah</span>
                </div>
                <div className="report-row">
                  <span>Jumlah pendapatan</span><strong>RM 48,250</strong>
                </div>
                <div className="report-row">
                  <span>Jumlah perbelanjaan</span><strong>RM 28,750</strong>
                </div>
                <div className="report-row report-total">
                  <span>Untung bersih</span><strong>RM 19,500</strong>
                </div>
                <div className="format-row" aria-label="Format laporan tersedia">
                  <span>PDF</span><span>Excel</span><span>CSV</span>
                </div>
              </div>
            </div>

            <div className="reports-copy">
              <span className="kicker">Laporan apabila anda memerlukannya</span>
              <h2>Daripada nombor kepada tindakan.</h2>
              <p>
                Hasilkan penyata utama, semak trend dan eksport data dalam
                format yang sesuai untuk pasukan atau akauntan anda.
              </p>
              <ul className="feature-list">
                <li><span aria-hidden="true">01</span> Penyata pendapatan dan kedudukan kewangan</li>
                <li><span aria-hidden="true">02</span> Aliran tunai dan imbangan duga</li>
                <li><span aria-hidden="true">03</span> Analisis AI dengan cadangan yang jelas</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="cta-section" id="mula">
          <div className="container cta-card">
            <div>
              <span className="kicker kicker-light">Mudah · Pantas · Automatik · Pintar</span>
              <h2>Urus kewangan dengan lebih bijak.</h2>
              <p>
                Mulakan pengalaman perakaunan yang dibina untuk perniagaan
                seperti anda.
              </p>
            </div>
            <a className="button button-light" href="mailto:hello@smartcash.ai">
              Hubungi SmartCash AI
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>
      </main>

      <footer>
        <div className="container footer-grid">
          <a className="brand brand-footer" href="#" aria-label="SmartCash AI, kembali ke atas">
            <span className="brand-mark" aria-hidden="true">S</span>
            <span>SmartCash <strong>AI</strong></span>
          </a>
          <p>Sistem perakaunan kewangan pintar berasaskan AI untuk PKS.</p>
          <span>© 2026 SmartCash AI</span>
        </div>
      </footer>
    </>
  );
}
