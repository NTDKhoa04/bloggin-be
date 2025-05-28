export default function generateSafeSSML(text: string): string {
  const words = text.match(/\S+/g) || [];
  return (
    '<speak>' +
    words
      .map((word, i) => {
        const safeWord = word
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        return `<mark name="w${i + 1}"/>${safeWord}`;
      })
      .join(' ') +
    '</speak>'
  );
}
