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
  MOOD_LABELS,
} from "../../utils/reportFormatter";
import { API_BASE_URL } from "../../services/api";

function ReportPreview({ profile, periods, prediction, avgCycleLength, moods }) {
  const healthTips = getHealthTips(prediction);
  const age = calculateAge(profile?.birth_date);
  const bmiData = calculateBMI(profile?.height, profile?.weight);
  const moodSummary = getMoodSummary(moods);
  const phaseLabel = getCurrentPhaseLabel(prediction);
  const profileImageUrl = getProfileImageUrl(profile, API_BASE_URL);

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
        {/* Header */}
        <header className="pdf-doc-header">
          <p className="pdf-doc-brand">LUNARE</p>
          <h1 className="pdf-doc-title">Laporan Kesehatan Wanita</h1>
          <p className="pdf-doc-date">
            Tanggal Laporan: {formatReportDateTime(new Date())}
          </p>
          <div className="pdf-doc-separator" />
        </header>

        {/* Profile Summary */}
        {profile && (
          <section className="pdf-section">
            <h2 className="pdf-section-heading">Profil Pengguna</h2>
            <div className="pdf-profile-card">
              <div className="pdf-profile-left">
                {profileImageUrl ? (
                  <div className="pdf-avatar">
                    <img src={profileImageUrl} alt="Profile" crossOrigin="anonymous" />
                  </div>
                ) : (
                  <div className="pdf-avatar-initial">
                    {(profile.username || "U").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="pdf-profile-right">
                <div className="pdf-profile-identity">
                  <h3 className="pdf-profile-name">{profile.full_name || profile.username}</h3>
                  <p className="pdf-profile-username">@{profile.username}</p>
                  <p className="pdf-profile-email">{profile.email}</p>
                </div>

                <dl className="pdf-profile-details">
                  {age !== null && (
                    <div className="pdf-profile-detail-row">
                      <dt>Umur</dt>
                      <dd>{age} Tahun</dd>
                    </div>
                  )}
                  {profile.height && (
                    <div className="pdf-profile-detail-row">
                      <dt>Tinggi Badan</dt>
                      <dd>{profile.height} cm</dd>
                    </div>
                  )}
                  {profile.weight && (
                    <div className="pdf-profile-detail-row">
                      <dt>Berat Badan</dt>
                      <dd>{profile.weight} kg</dd>
                    </div>
                  )}
                  {bmiData.bmi !== null && (
                    <>
                      <div className="pdf-profile-detail-row">
                        <dt>BMI</dt>
                        <dd>{bmiData.bmi}</dd>
                      </div>
                      <div className="pdf-profile-detail-row">
                        <dt>Status BMI</dt>
                        <dd>
                          <span className={`pdf-bmi-badge ${getBmiBadgeClass(bmiData.category)}`}>
                            {bmiData.category}
                          </span>
                        </dd>
                      </div>
                    </>
                  )}
                </dl>
              </div>
            </div>
          </section>
        )}

        {/* Menstrual Statistics */}
        <section className="pdf-section">
          <h2 className="pdf-section-heading">Statistik Menstruasi</h2>
          <div className="pdf-stat-grid pdf-stat-grid-4">
            <div className="pdf-stat-card">
              <p className="pdf-stat-label">Total Siklus</p>
              <p className="pdf-stat-value">{periods.length}</p>
            </div>
            <div className="pdf-stat-card">
              <p className="pdf-stat-label">Rata-rata Siklus</p>
              <p className="pdf-stat-value">
                {avgCycleLength}
                <span className="pdf-stat-unit"> Hari</span>
              </p>
            </div>
            <div className="pdf-stat-card">
              <p className="pdf-stat-label">Prediksi Berikutnya</p>
              <p className="pdf-stat-value-sm">
                {prediction?.has_data
                  ? dayjs(prediction.next_period_date).format("DD MMM YYYY")
                  : "Belum Ada Data"}
              </p>
            </div>
            <div className="pdf-stat-card">
              <p className="pdf-stat-label">Fase Saat Ini</p>
              <p className="pdf-stat-value-sm">{phaseLabel}</p>
            </div>
          </div>
        </section>

        {/* Mood Statistics */}
        <section className="pdf-section">
          <h2 className="pdf-section-heading">Statistik Mood</h2>
          <div className="pdf-stat-grid pdf-stat-grid-mood">
            <div className="pdf-stat-card pdf-stat-card-accent">
              <p className="pdf-stat-label">Total Catatan Mood</p>
              <p className="pdf-stat-value">{moodSummary.totalMoodLogs}</p>
            </div>
            <div className="pdf-stat-card pdf-stat-card-accent">
              <p className="pdf-stat-label">Mood Dominan</p>
              <p className="pdf-stat-value-sm">
                {moodSummary.mostFrequentMood
                  ? formatMoodLabel(moodSummary.mostFrequentMood)
                  : "Belum Ada Data"}
              </p>
            </div>
          </div>

          <div className="pdf-mood-distribution">
            <p className="pdf-mood-distribution-title">Distribusi Mood</p>
            {moodSummary.totalMoodLogs > 0 ? (
              <div className="pdf-mood-distribution-list">
                {Object.entries(moodSummary.moodCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([mood, count]) => {
                    const percentage = Math.round(
                      (count / moodSummary.totalMoodLogs) * 100
                    );
                    const moodInfo = MOOD_LABELS[mood];
                    return (
                      <div key={mood} className="pdf-mood-item">
                        <div className="pdf-mood-item-header">
                          <span className="pdf-mood-item-label">
                            {moodInfo ? (
                              <>
                                <span className="pdf-mood-emoji">{moodInfo.emoji}</span>
                                {moodInfo.label}
                              </>
                            ) : (
                              mood
                            )}
                          </span>
                          <span className="pdf-mood-item-count">
                            {count}x · {percentage}%
                          </span>
                        </div>
                        <div className="pdf-mood-bar-track">
                          <div
                            className="pdf-mood-bar-fill"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="pdf-no-data">Belum ada catatan mood yang tercatat.</p>
            )}
          </div>
        </section>

        {/* Health Summary */}
        <section className="pdf-section">
          <h2 className="pdf-section-heading">Ringkasan Kesehatan</h2>
          {bmiData.bmi !== null ? (
            <div className="pdf-health-summary">
              <div className="pdf-health-summary-main">
                <div className="pdf-health-bmi-block">
                  <p className="pdf-stat-label">Body Mass Index</p>
                  <p className="pdf-health-bmi-large">{bmiData.bmi}</p>
                </div>
                <div className="pdf-health-category-block">
                  <p className="pdf-stat-label">Kategori BMI</p>
                  <span className={`pdf-bmi-badge pdf-bmi-badge-lg ${getBmiBadgeClass(bmiData.category)}`}>
                    {bmiData.category}
                  </span>
                </div>
              </div>
              <div className="pdf-health-note-block">
                <p className="pdf-health-note-label">Catatan Kesehatan</p>
                <p className="pdf-health-note">{bmiData.note}</p>
              </div>
            </div>
          ) : (
            <div className="pdf-stat-card">
              <p className="pdf-no-data">
                Data tinggi dan berat badan belum tersedia. Lengkapi profil Anda untuk
                melihat analisis BMI.
              </p>
            </div>
          )}
        </section>

        {/* Health Tips */}
        <section className="pdf-section pdf-section-last">
          <h2 className="pdf-section-heading">Tips Kesehatan</h2>
          <div className="pdf-tips-card">
            <ul className="pdf-tips-list">
              {tipItems.map((tip, index) => (
                <li key={index} className="pdf-tips-list-item">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Footer */}
        <footer className="pdf-footer">
          <p className="pdf-footer-text">
            Lunare — Wellness &amp; Cycle Companion · Laporan dibuat secara otomatis pada{" "}
            {formatReportDateTime(new Date())}
          </p>
        </footer>
      </div>
    </div>
  );
}

export default ReportPreview;
