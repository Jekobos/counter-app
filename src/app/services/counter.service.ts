import { computed, Injectable, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { SavedCounter } from '../models/saved-counter';

@Injectable({
  providedIn: 'root',
})
export class CounterService {
  private readonly storageKey = 'saved-counters';
  private readonly countersState = signal<SavedCounter[]>([]);
  private readonly initializedState = signal(false);
  private initializationPromise: Promise<void> | null = null;

  readonly counters = this.countersState.asReadonly();
  readonly initialized = this.initializedState.asReadonly();

  readonly total = computed(() =>
    this.countersState().reduce((sum, counter) => sum + counter.value, 0),
  );

  readonly average = computed(() => {
    const counters = this.countersState();

    if (counters.length === 0) {
      return 0;
    }

    const sum = counters.reduce(
      (accumulator, counter) => accumulator + counter.value,
      0,
    );

    return sum / counters.length;
  });

  initialize(): Promise<void> {
    this.initializationPromise ??= this.load();
    return this.initializationPromise;
  }

  async add(counter: SavedCounter): Promise<void> {
    await this.initialize();
    this.countersState.update((counters) => [counter, ...counters]);
    await this.persist();
  }

  async remove(id: string): Promise<void> {
    await this.initialize();
    this.countersState.update((counters) =>
      counters.filter((counter) => counter.id !== id),
    );
    await this.persist();
  }

  async clear(): Promise<void> {
    await this.initialize();
    this.countersState.set([]);
    await Preferences.remove({ key: this.storageKey });
  }

  private async load(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: this.storageKey });

      if (value === null) {
        this.countersState.set([]);
        return;
      }

      const parsed: unknown = JSON.parse(value);

      if (!Array.isArray(parsed)) {
        throw new Error(
          'Stored history has an unexpected format; expected an array.',
        );
      }

      this.countersState.set(parsed as SavedCounter[]);
    } catch (error) {
      console.error('Failed to load counter history.', error);
      this.countersState.set([]);
    } finally {
      this.initializedState.set(true);
    }
  }

  private async persist(): Promise<void> {
    await Preferences.set({
      key: this.storageKey,
      value: JSON.stringify(this.countersState()),
    });
  }
}