const { createApp, VERSION } = require('./src/app');

const PORT = process.env.PORT || 3000;

createApp().listen(PORT, () => {
  console.log(`jenkins-web-app v${VERSION} listening on port ${PORT}`);
});
