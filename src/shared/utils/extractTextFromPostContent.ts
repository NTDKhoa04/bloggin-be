export default function extractTextFromPostContent(doc: any): string {
  let result = '';

  function traverse(node: any) {
    if (!node) return;

    if (node.type === 'text' && node.text) {
      result += node.text;
    }

    if (Array.isArray(node.content)) {
      node.content.forEach(traverse);
    }
  }

  traverse(doc);
  return result;
}
