import { useEffect, useState } from 'react';

import type { Filter } from './types';

const parseHash = (hash: string): Filter => {
    switch (hash.split('/')[1]) {
        case 'active':
            return 'active';
        case 'completed':
            return 'completed';
        default:
            return 'all';
    }
};

export const useHashFilter = (): Filter => {
    const [filter, setFilter] = useState<Filter>(() => parseHash(document.location.hash));

    useEffect(() => {
        const onHashChange = () => setFilter(parseHash(document.location.hash));

        window.addEventListener('hashchange', onHashChange);

        return () => window.removeEventListener('hashchange', onHashChange);
    }, []);

    return filter;
};
