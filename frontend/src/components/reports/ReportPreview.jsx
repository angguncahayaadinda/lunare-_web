/*
COMPONENT: ReportPreview
FILE: components/reports/ReportPreview.jsx
FUNGSI:
- Menyusun tampilan laporan (PDF preview) yang akan diekspor
- Menggunakan util reportFormatter untuk kalkulasi dan format data
DIGUNAKAN OLEH:
components/reports/HealthReport.jsx
=================================
*/
import dayjs from "dayjs";
import {
  formatReportDateTime,
  getHealthTips,
  calculateAge,
  calculateBMI,
  getMoodSummary,
  getCurrentPhaseLabel,
  getBmiBadgeClass,
  getProfileImageUrl,
  calculateSymptomDistribution,
  getRecentNotes,
  MOOD_LABELS,
  SYMPTOM_LABELS,
} from "../../utils/reportFormatter";
import { API_BASE_URL } from "../../services/api";

function ReportPreview({ profile, periods, prediction, avgCycleLength, moods, symptoms }) {
  const healthTips = getHealthTips(prediction);
  const age = calculateAge(profile?.birth_date);
  const bmiData = calculateBMI(profile?.height, profile?.weight);
  const moodSummary = getMoodSummary(moods);
  const symptomData = calculateSymptomDistribution(symptoms);
  const topSymptoms = Object.entries(symptomData.symptomCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([key, count]) => ({
      key,
      label: SYMPTOM_LABELS[key] || key,
      count,
    }));
  const recentNotes = getRecentNotes(symptoms, 3);
  const phaseLabel = getCurrentPhaseLabel(prediction);
  const profileImageUrl = getProfileImageUrl(profile, API_BASE_URL);
  const predictionDates = (prediction?.future_predictions || []).slice(0, 12);
  const maxSymptomCount = Math.max(1, ...topSymptoms.map((item) => item.count));

  const formatMoodLabel = (mood) => {
    const moodInfo = MOOD_LABELS[mood];
    if (!moodInfo) return mood;
    return `${moodInfo.emoji} ${moodInfo.label}`;
  };

  const tipItems = healthTips
    .split(/(?<=\.)\s+/)
    .map((tip) => tip.trim())
    .filter(Boolean);

  return (
    <div className="pdf-report-wrapper">
      <div id="pdf-report-content" className="pdf-container">
        <header className="pdf-doc-header">
          <p className="pdf-doc-brand">LUNARE</p>
          <h1 className="pdf-doc-title">Laporan Kesehatan Wanita</h1>
          <p className="pdf-doc-date">Tanggal Laporan: {formatReportDateTime(new Date())}</p>
          <div className="pdf-doc-separator" />
        </header>

        <section className="pdf-section pdf-report-section">
          <div className="pdf-profile-card">
            <div className="pdf-profile-left">
              <div className="pdf-avatar">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Profile" crossOrigin="anonymous" />
                ) : (
                  <div className="pdf-avatar-initial">{(profile.username || "U").charAt(0).toUpperCase()}</div>
                )}
              </div>
            </div>
            <div className="pdf-profile-right">
              <div className="pdf-profile-identity">
                <h2 className="pdf-profile-name">{profile.full_name || profile.username}</h2>
                <p className="pdf-profile-username">@{profile.username}</p>
                <p className="pdf-profile-email">{profile.email}</p>
              </div>
              <dl className="pdf-profile-details">
                <div className="pdf-profile-detail-row">
                  <dt>Umur</dt>
                  <dd>{age !== null ? `${age} Tahun` : "-"}</dd>
                </div>
                <div className="pdf-profile-detail-row">
                  <dt>Tinggi</dt>
                  <dd>{profile.height ? `${profile.height} cm` : "-"}</dd>
                </div>
                <div className="pdf-profile-detail-row">
                  <dt>Berat</dt>
                  <dd>{profile.weight ? `${profile.weight} kg` : "-"}</dd>
                </div>
                <div className="pdf-profile-detail-row">
                  <dt>BMI & Kategori</dt>
                  <dd>{bmiData.bmi !== null ? `${bmiData.bmi} · ${bmiData.category}` : "-"}</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section className="pdf-section pdf-report-section">
          <h2 className="pdf-section-heading">Ringkasan Siklus</h2>
          <div className="pdf-card-grid">
            <div className="pdf-data-card">
              <p className="pdf-data-label">Total Siklus Tercatat</p>
              <p className="pdf-data-value">{periods.length} Siklus</p>
            </div>
            <div className="pdf-data-card">
              <p className="pdf-data-label">Rata-rata Siklus</p>
              <p className="pdf-data-value">{avgCycleLength} Hari</p>
            </div>
            <div className="pdf-data-card">
              <p className="pdf-data-label">Prediksi Berikutnya</p>
              <p className="pdf-data-value">
                {prediction?.has_data
                  ? dayjs(prediction.next_period_date).format("DD MMM YYYY")
                  : "-"}
              </p>
            </div>
          </div>
        </section>

        <section className="pdf-section pdf-report-section">
          <h2 className="pdf-section-heading">Riwayat Siklus</h2>
          <div className="pdf-table-wrapper pdf-report-card">
            <table className="pdf-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Tanggal Mulai</th>
                  <th>Tanggal Selesai</th>
                  <th>Durasi</th>
                  <th>Suasana Hati</th>
                </tr>
              </thead>
              <tbody>
                {periods.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>{index + 1}</td>
                    <td>{dayjs(item.start_date).format("DD MMM YYYY")}</td>
                    <td>{dayjs(item.end_date).format("DD MMM YYYY")}</td>
                    <td>{dayjs(item.end_date).diff(dayjs(item.start_date), "day") + 1} hari</td>
                    <td>{item.mood || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="pdf-section pdf-report-section">
          <h2 className="pdf-section-heading">Analisis Suasana Hati</h2>
          <div className="pdf-card-grid pdf-card-grid-2">
            <div className="pdf-data-card pdf-card-accent">
              <p className="pdf-data-label">Total Catatan Mood</p>
              <p className="pdf-data-value">{moodSummary.totalMoodLogs} Entri</p>
            </div>
            <div className="pdf-data-card pdf-card-accent">
              <p className="pdf-data-label">Mood Tersering</p>
              <p className="pdf-data-value">
                {moodSummary.mostFrequentMood ? formatMoodLabel(moodSummary.mostFrequentMood) : "-"}
              </p>
            </div>
          </div>
          <div className="pdf-analysis-bars">
            {Object.entries(moodSummary.moodCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([mood, count]) => {
                const percent = moodSummary.totalMoodLogs
                  ? Math.round((count / moodSummary.totalMoodLogs) * 100)
                  : 0;
                return (
                  <div key={mood} className="pdf-analysis-row">
                    <span className="pdf-analysis-label">{formatMoodLabel(mood)}</span>
                    <div className="pdf-analysis-track">
                      <div
                        className="pdf-analysis-fill"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="pdf-analysis-count">{percent}%</span>
                  </div>
                );
              })}
          </div>
        </section>

        <section className="pdf-section pdf-report-section">
          <h2 className="pdf-section-heading">Analisis Gejala Fisik & Mental</h2>
          <div className="pdf-symptom-summary pdf-report-card">
            <p className="pdf-symptom-intro">Frekuensi Gejala Mental & Emosional:</p>
            {topSymptoms.length > 0 ? (
              <div className="pdf-symptom-bar-group">
                {topSymptoms.map((item) => (
                  <div key={item.key} className="pdf-symptom-bar-row">
                    <span className="pdf-symptom-bar-label">{item.label}</span>
                    <div className="pdf-symptom-bar-track">
                      <div
                        className="pdf-symptom-bar-fill"
                        style={{ width: `${Math.round((item.count / maxSymptomCount) * 100)}%` }}
                      />
                    </div>
                    <span className="pdf-symptom-bar-count">{item.count}x</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="pdf-no-data">Belum ada catatan gejala yang tersedia.</p>
            )}
            <div className="pdf-symptom-summary-text">
              <p className="pdf-symptom-summary-label">KESIMPULAN ANALISIS GEJALA</p>
              <p className="pdf-symptom-summary-note">
                {topSymptoms.length > 0
                  ? `Gejala mental tersering: ${topSymptoms[0].label} (${topSymptoms[0].count}x).`
                  : "Gejala mental tersering belum tersedia."}
              </p>
            </div>
          </div>
        </section>

        <section className="pdf-section pdf-report-section">
          <h2 className="pdf-section-heading">Prediksi 1 Tahun (12 Siklus)</h2>
          <div className="pdf-prediction-table pdf-report-card">
            <div className="pdf-prediction-grid">
              {Array.from({ length: 3 }).map((_, columnIndex) => (
                <div key={columnIndex} className="pdf-prediction-column">
                  <p className="pdf-prediction-column-title">
                    Siklus {columnIndex * 4 + 1} - {columnIndex * 4 + 4}
                  </p>
                  {Array.from({ length: 4 }).map((__, rowIndex) => {
                    const idx = columnIndex * 4 + rowIndex;
                    const date = predictionDates[idx];
                    return (
                      <div key={idx} className="pdf-prediction-row">
                        <span className="pdf-prediction-index">{idx + 1}.</span>
                        <span className="pdf-prediction-date">
                          {date ? dayjs(date).format("DD MMM YYYY") : "-"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pdf-section pdf-section-last pdf-report-section">
          <h2 className="pdf-section-heading">Ringkasan Kesehatan & BMI</h2>
          <div className="pdf-health-summary pdf-report-card">
            <div className="pdf-health-summary-main">
              <div>
                <p className="pdf-stat-label">Skor BMI</p>
                <p className="pdf-health-bmi-large">{bmiData.bmi !== null ? bmiData.bmi : "-"}</p>
              </div>
              <div>
                <p className="pdf-stat-label">Kategori BMI</p>
                <span className={`pdf-bmi-badge pdf-bmi-badge-lg ${getBmiBadgeClass(bmiData.category)}`}>
                  {bmiData.category || "-"}
                </span>
              </div>
            </div>
            <div className="pdf-health-note-block">
              <p className="pdf-health-note">
                {bmiData.bmi !== null
                  ? bmiData.note
                  : "Silakan lengkapi data tinggi dan berat badan Anda di menu Profil untuk melihat analisis BMI dan catatan kesehatan personal."}
              </p>
            </div>
          </div>
        </section>

        <section className="pdf-section pdf-report-section">
          <h2 className="pdf-section-heading">Tips Kesehatan Lunare</h2>
          <div className="pdf-tips-card pdf-report-card">
            <ul className="pdf-tips-list">
              {tipItems.map((tip, index) => (
                <li key={index} className="pdf-tips-list-item">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <footer className="pdf-footer">
          <p className="pdf-footer-text">
            Lunare — Wellness &amp; Cycle Companion · Laporan dibuat secara otomatis pada {formatReportDateTime(new Date())}
          </p>
        </footer>
      </div>
    </div>
  );
}

export default ReportPreview;
