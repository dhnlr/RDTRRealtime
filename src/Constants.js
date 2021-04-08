const prod = {
  url: {
    API_URL: "https://rdtr.onemap.id/backend",
    ARCGIS_URL: "https://rdtr.onemap.id/server/rest/services"
  },
};
const dev = {
  url: {
    API_URL: "https://rdtr.onemap.id/backend",
    // API_URL: 'https://f8a97c6e-0b6f-427a-be5e-e6a968b89d0e.mock.pstmn.io',
    ARCGIS_URL: "https://rdtr.onemap.id/server/rest/services"
  },
};
export const config = process.env.NODE_ENV === "development" ? dev : prod;
