
const collectFieldNamesFromSchema = (schema, fieldNames = [], prefix = '') => {
  const fields = schema ? schema.fields : [];
  fields.forEach(field => {
    const safeFieldName = field.name.replace(/\W+/g, '_');
    fieldNames.push(`[${prefix}${safeFieldName}]`);
    if (field.schema) {
      collectFieldNamesFromSchema(field.schema, fieldNames, `${prefix}${safeFieldName}.`);
    }
  });
  return fieldNames;
};

// TODO This is a placeholder; we don't have a class for it yet
const Text = {
  getTextSuggestions: (schema) => {
    return collectFieldNamesFromSchema(schema);
  }
};

export default Text;