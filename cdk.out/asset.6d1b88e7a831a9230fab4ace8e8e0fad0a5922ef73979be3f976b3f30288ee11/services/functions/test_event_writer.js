import { createRequire as topLevelCreateRequire } from 'module'
const require = topLevelCreateRequire(import.meta.url)
// services/functions/test_event_writer.ts
var handler = async (detailType, detail) => {
  const result = { id: "hej" };
  console.log(detail, detailType);
  return result;
};
export {
  handler
};
