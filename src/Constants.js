const prod = {
  url: {
    API_URL: "https://rdtr.onemap.id/backend",
    ARCGIS_URL: "https://rdtr.onemap.id/server/rest/services"
  },
  editorConfiguration: {
    toolbar: [
      'heading', '|',
      'alignment', '|',
      'bold', 'italic', 'strikethrough', 'underline', 'subscript', 'superscript', '|',
      'link', '|',
      'outdent', 'indent', '|',
      'bulletedList', 'numberedList', '|',
      'insertTable', '|',
      'insertImage', 'mediaEmbed', 'blockQuote', '|',
      'undo', 'redo'
    ]
  }
};
const dev = {
  url: {
    API_URL: "https://rdtr.onemap.id/backend",
    // API_URL: 'https://f8a97c6e-0b6f-427a-be5e-e6a968b89d0e.mock.pstmn.io',
    ARCGIS_URL: "https://rdtr.onemap.id/server/rest/services"
  },
  editorConfiguration: {
    toolbar: [
      'heading', '|',
      'alignment', '|',
      'bold', 'italic', 'strikethrough', 'underline', 'subscript', 'superscript', '|',
      'link', '|',
      'outdent', 'indent', '|',
      'bulletedList', 'numberedList', '|',
      'insertTable', '|',
      'insertImage', 'mediaEmbed', 'blockQuote', '|',
      'undo', 'redo'
    ]
  }
};
export const config = process.env.NODE_ENV === "development" ? dev : prod;
