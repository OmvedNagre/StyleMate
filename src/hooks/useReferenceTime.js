import { useEffect, useState } from 'react';
/** Refresh the explicit scoring clock after history changes and once per minute.
 * @param {unknown} history */
export function useReferenceTime(history) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const refresh = () => setNow(Date.now());
    const immediate = setTimeout(refresh, 0);
    const interval = setInterval(refresh, 60000);
    return () => { clearTimeout(immediate); clearInterval(interval); };
  }, [history]);
  return now;
}
