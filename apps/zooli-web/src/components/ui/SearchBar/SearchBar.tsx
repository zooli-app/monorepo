'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { SearchIcon, MicIcon } from '@/components/icons/UtilityIcons';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  placeholder?: string;
  /** Called instead of routing, useful when the page wants to own the result list. */
  onSearch?: (query: string) => void;
}

export function SearchBar({ placeholder = 'Search food, grocery, rides, services…', onSearch }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    if (onSearch) {
      onSearch(trimmed);
      return;
    }
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form className={styles.form} role="search" onSubmit={handleSubmit}>
      <SearchIcon className={styles.searchIcon} />
      <input
        className={styles.input}
        type="search"
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        aria-label="Search food, grocery, rides and services"
      />
      <button type="button" className={styles.micButton} aria-label="Search by voice">
        <MicIcon className={styles.micIcon} />
      </button>
    </form>
  );
}
