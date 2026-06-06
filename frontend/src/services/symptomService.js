/*
SERVICE: symptomService
FILE: services/symptomService.js
FUNGSI:
- API wrapper untuk mengelola catatan gejala: list, get by date, save
=================================
*/
import API from "./api";

export const getSymptoms = async () => {
  const response = await API.get("/symptoms");
  return response.data;
};

export const getSymptomByDate = async (date) => {
  const response = await API.get(`/symptoms/date/${date}`);
  return response.data;
};

export const saveSymptom = async (symptomData) => {
  const response = await API.post("/symptoms", symptomData);
  return response.data;
};
