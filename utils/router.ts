type Route = {
    link: string;
    name: string;
}

export const router: Route[] = [
    {
        link: '/arenas',
        name: 'Arenas'
    },
    {
        link: '/matches',
        name: 'Matches'
    },
    {
        link: '/challenges',
        name: 'Challenges'
    },
    {
        link: '/stats',
        name: 'Stats'
    }
]