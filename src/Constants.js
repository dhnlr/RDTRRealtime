const prod = {
  url: {
    API_URL: "https://rdtr.onemap.id/backend",
  },
};
const dev = {
  url: {
    API_URL: "https://rdtr.onemap.id/backend",
    // API_URL: 'https://f8a97c6e-0b6f-427a-be5e-e6a968b89d0e.mock.pstmn.io'
  },
};
export const config = process.env.NODE_ENV === "development" ? dev : prod;
