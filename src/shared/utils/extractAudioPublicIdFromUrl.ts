export default function extractAudioCloudinaryPublicId(url: string) {
  const matches = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)\./);
  return matches ? matches[1] : null;
}
