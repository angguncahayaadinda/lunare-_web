/*
HOOK: useSymptoms
FILE: hooks/useSymptoms.js
FUNGSI:
- Mengambil dan menyimpan data gejala pengguna dari backend
- Menyediakan fungsi `saveSymptom` untuk menyimpan dan merefresh list
DIGUNAKAN OLEH:
pages/Dashboard.jsx dan SymptomJournal
=================================
*/
import { useEffect, useState, useCallback } from "react";
import * as symptomService from "../services/symptomService";

function useSymptoms() {
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSymptoms = useCallback(async () => {
    try {
      const data = await symptomService.getSymptoms();
      setSymptoms(data);
    } catch (error) {
      console.log("Error fetching symptoms:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSymptom = async (data) => {
    try {
      await symptomService.saveSymptom(data);
      await fetchSymptoms();
      return true;
    } catch (error) {
      console.log("Error saving symptom:", error);
      return false;
    }
  };

  useEffect(() => {
    fetchSymptoms();
  }, [fetchSymptoms]);

  return {
    symptoms,
    loading,
    saveSymptom,
    fetchSymptoms,
  };
}

export default useSymptoms;
