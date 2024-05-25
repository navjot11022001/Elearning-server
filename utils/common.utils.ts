import _ from "lodash";

const sanitizeEntity = (payload: any): any => {
  const keysToOmit = ["password"];

  function shouldRemove(_value: string, key: string) {
    return keysToOmit.includes(key);
  }
  function removeKeys(obj: any): any {
    if (_.isArray(obj)) {
      return obj.map((item) => removeKeys(item));
    } else if (_.isObject(obj)) {
      const omitiedKeys = _.omitBy(obj, shouldRemove);
      return _.mapValues(omitiedKeys, (value) => removeKeys(value));
    }
    return obj;
  }

  const sanitizePayload = removeKeys(payload);
  sanitizePayload.timestamps = new Date().toISOString();
  return sanitizePayload;
};

export { sanitizeEntity };
