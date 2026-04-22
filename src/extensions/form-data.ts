import type { Nullishable } from '@/types/lib';
import { definePropertyIfAbsent } from '@/utils/object';

declare global {
  interface FormData {
    /**
     * Appends a field and returns the FormData instance.  
     * Null or undefined becomes an empty string.
     */
    add(key: string, value: Nullishable<string> | Blob): FormData;

    /**
     * Converts all string fields to URLSearchParams.  
     * Blob entries are ignored.
     */
    toParams(): URLSearchParams;
  }
}

function add(this: FormData, key: string, value: Nullishable<string> | Blob): FormData {
  this.append(key, value ?? '');
  return this;
};

function toParams(this: FormData): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of this.entries()) {
    if (typeof value === 'string') {
      params.append(key, value);
    }
  }
  return params;
};

definePropertyIfAbsent(FormData.prototype, 'add', add);
definePropertyIfAbsent(FormData.prototype, 'toParams', toParams);