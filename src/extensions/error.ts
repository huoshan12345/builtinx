import { definePropertyIfAbsent } from '@/utils/object';

declare global {
  interface ErrorConstructor {

    /**     
     * Throws an error with the specified message.
     * @param message The error message to throw.
     * @returns This method never returns as it always throws an error.
     */
    throw(message: string): never;
  }
}

// throw is a reserved keyword in JavaScript, 
// so just call it throwError.
function throwError(message: string): never {
  throw new Error(message);
};

definePropertyIfAbsent(Error, 'throw', throwError);