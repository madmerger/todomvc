import { useEffect, useState } from 'react';

import type { Filter } from '../types';

const filterFromHash = (hash: string): Filter => {
    switch (hash.replace(/^#\/?/, '')) {
        case 'active':
            return 'active';
        case 'completed':
            return 'completed';
        default:
            return 'all';
    }
};

export function useHashFilter(): Filter {
    const [filter, setFilter] = useState<Filter>(() => filterFromHash(window.location.hash));

    useEffect(() => {
        const onHashChange = () => setFilter(filterFromHash(window.location.hash));

        window.addEventListener('hashchange', onHashChange);
        return () => window.removeEventListener('hashchange', onHashChange);
    }, []);

    return filter;
}
