const prod = {
    url: {
        API_URL: 'https://rdtr.onemap.id/backend',
    }
};
const dev = {
    url: {
        API_URL: 'https://rdtr.onemap.id/backend'
    }
}; 
export const config = process.env.NODE_ENV === 'development' ? dev : prod;
