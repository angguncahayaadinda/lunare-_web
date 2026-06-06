/*
UTIL: reportFormatter
FILE: utils/reportFormatter.js
FUNGSI:
- Fungsi util untuk format tanggal, kalkulasi BMI, mood/symptom summaries, dan data report
- Digunakan oleh ReportPreview dan HealthReport
=================================
*/
import dayjs from "dayjs";

export const formatReportDate = (date) => {
  return dayjs(date).format("DD MMM YYYY");
};

export const formatReportDateTime = (date) => {
  return dayjs(date).format("DD MMMM YYYY, HH:mm");
};

export const SYMPTOM_LABELS = {
  cramps: "Kram Perut 😫",
  headache: "Sakit Kepala 🤕",
  bloating: "Kembung 🎈",
  fatigue: "Kelelahan 😴",
  acne: "Jerawat 🔴",
  breast_tenderness: "Nyeri Payudara 🍈",
  insomnia: "Insomnia 👁️",
  mood_swings: "Perubahan Mood 📈",
  anxiety: "Cemas 😰",
  depressed: "Sedih / Depresi 😢",
};

export const MOOD_LABELS = {
  happy: { label: "Happy", emoji: "😊" },
  sad: { label: "Sad", emoji: "😢" },
  angry: { label: "Angry", emoji: "😤" },
  anxious: { label: "Anxious", emoji: "😰" },
  tired: { label: "Tired", emoji: "😴" },
  neutral: { label: "Neutral", emoji: "😐" },
};

export const calculateSymptomDistribution = (symptoms) => {
  const symptomCounts = {};
  let totalLogs = 0;

  symptoms.forEach((s) => {
    Object.keys(SYMPTOM_LABELS).forEach((key) => {
      if (s[key] && s[key] !== "") {
        symptomCounts[key] = (symptomCounts[key] || 0) + 1;
        totalLogs++;
      }
    });
  });

  return { symptomCounts, totalLogs };
};

export const getRecentNotes = (symptoms, limit = 3) => {
  return symptoms
    .filter((s) => s.note && s.note.trim() !== "")
    .slice(0, limit);
};

export const getHealthTips = (prediction) => {
  if (prediction?.has_data) {
    return prediction.avg_cycle_length < 21 || prediction.avg_cycle_length > 35
      ? "Siklus menstruasi Anda terdeteksi di luar rentang rata-rata umum (21-35 hari). Hal ini normal bagi beberapa individu, namun kami menyarankan untuk tetap berkonsultasi dengan penyedia layanan kesehatan jika pola ini terus berlanjut."
      : "Siklus menstruasi Anda terpantau berada di rentang normal (21-35 hari). Pertahankan gaya hidup sehat, konsumsi air putih yang cukup, dan kelola stres dengan baik untuk menjaga kestabilan hormon Anda.";
  }
  return "Catat terus data menstruasi Anda untuk mendapatkan analisis siklus dan prediksi masa subur yang akurat dari Lunare.";
};

export const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  return dayjs().diff(dayjs(birthDate), "year");
};

export const calculateBMI = (heightCm, weightKg) => {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
    return { bmi: null, category: null, note: null };
  }

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const bmiRounded = Math.round(bmi * 10) / 10;

  let category;
  let note;

  if (bmi < 18.5) {
    category = "Underweight";
    note =
      "Berat badan berada di bawah rentang ideal. Pertimbangkan pola makan yang lebih seimbang dan konsultasi dengan tenaga kesehatan jika diperlukan.";
  } else if (bmi < 25) {
    category = "Normal";
    note =
      "Berat badan berada pada rentang ideal. Pertahankan pola hidup sehat dan aktivitas fisik secara rutin.";
  } else if (bmi < 30) {
    category = "Overweight";
    note =
      "Berat badan berada di atas rentang ideal. Perhatikan pola makan dan aktivitas fisik secara teratur.";
  } else {
    category = "Obese";
    note =
      "Berat badan berada jauh di atas rentang ideal. Disarankan berkonsultasi dengan tenaga kesehatan untuk mendapatkan saran yang sesuai.";
  }

  return { bmi: bmiRounded, category, note };
};

export const getBmiBadgeClass = (category) => {
  if (!category) return "";
  const map = {
    Underweight: "pdf-bmi-badge-underweight",
    Normal: "pdf-bmi-badge-normal",
    Overweight: "pdf-bmi-badge-overweight",
    Obese: "pdf-bmi-badge-obese",
  };
  return map[category] || "";
};

/**
 * Extract mood log entries from period records that have a mood value.
 */
export const extractMoodEntries = (periods) => {
  if (!periods || periods.length === 0) return [];
  return periods.filter((entry) => entry.mood && entry.mood.trim() !== "");
};

/**
 * Analyze mood log entries (objects with a `mood` field).
 */
export const getMoodSummary = (moods) => {
  if (!moods || moods.length === 0) {
    return { totalMoodLogs: 0, mostFrequentMood: null, moodCounts: {} };
  }

  const moodCounts = {};
  let totalMoodLogs = 0;

  moods.forEach((entry) => {
    const mood = entry.mood;
    if (mood && mood.trim() !== "") {
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      totalMoodLogs++;
    }
  });

  let mostFrequentMood = null;
  let maxCount = 0;
  Object.entries(moodCounts).forEach(([mood, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostFrequentMood = mood;
    }
  });

  return { totalMoodLogs, mostFrequentMood, moodCounts };
};

export const getCurrentPhaseLabel = (prediction) => {
  if (!prediction?.has_data || !prediction.current_phase) {
    return "Tidak tersedia";
  }

  const phaseMap = {
    menstrual: "Fase Menstruasi",
    follicular: "Fase Folikular",
    ovulation: "Fase Ovulasi",
    luteal: "Fase Luteal",
  };

  return phaseMap[prediction.current_phase] || prediction.current_phase;
};

export const getProfileImageUrl = (profile, apiBaseUrl) => {
  if (!profile?.profile_picture) return null;

  if (
    profile.profile_picture.startsWith("http") ||
    profile.profile_picture.startsWith("data:image/")
  ) {
    return profile.profile_picture;
  }

  return `${apiBaseUrl}${profile.profile_picture}`;
};
