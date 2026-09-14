import { useEffect, useState } from "react";
import type { Filter } from "../types";

export const parseFilter = (hash: string): Filter => {
    if (hash === "#/active")
        return "active";

    if (hash === "#/completed")
        return "completed";

    return "all";
};

export const useHashFilter = (): Filter => {
    const [filter, setFilter] = useState<Filter>(() => parseFilter(window.location.hash));

    useEffect(() => {
        const onHashChange = () => setFilter(parseFilter(window.location.hash));

        window.addEventListener("hashchange", onHashChange);

        return () => window.removeEventListener("hashchange", onHashChange);
    }, []);

    return filter;
};
