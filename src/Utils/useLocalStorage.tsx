import {useState} from 'react';

export const useLocalStorage = <T,>(
  /** Key of local storage */
  key: string,
  /** Initial value */
  initialValue: T,
) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);

      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // eslint-disable-next-line
      console.log(`error in useLocalStorage: ${error}`);
      return initialValue;
    }
  });
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // eslint-disable-next-line
      console.log(error);
    }
  };
  return [
    /** Value of local storage */
    storedValue,
    /** Set value of local storage */
    setValue,
  ] as const;
};
