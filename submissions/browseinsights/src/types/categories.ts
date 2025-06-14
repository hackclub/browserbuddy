
export type CategoryName =
    | 'productivity'
    | 'work'
    | 'education'
    | 'shopping'
    | 'social'
    | 'news'
    | 'entertainment'
    | 'video'
    | 'games'
    | 'technology'
    | 'finance'
    | 'travel'
    | 'health'
    | 'reference'
    | 'uncategorized';


export interface DomainCategory {
    domain: string;
    categories: string[];
}
export interface CategoryDefinition {
    patterns: string[];
    keywords: string[];
}

export interface CategoryMap {
    [key: string]: CategoryDefinition;
}