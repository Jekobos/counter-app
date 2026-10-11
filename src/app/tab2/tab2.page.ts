import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  AlertController,
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';
import { SavedCounter } from '../models/saved-counter';
import { CounterService } from '../services/counter.service';

type SortMode = 'newest' | 'name' | 'value';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    DatePipe,
    DecimalPipe,
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab2Page implements OnInit {
  readonly counterService = inject(CounterService);

  private readonly alertController = inject(AlertController);
  private readonly toastController = inject(ToastController);

  readonly sortMode = signal<SortMode>('newest');
  readonly searchTerm = signal('');

  readonly visibleCounters = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const mode = this.sortMode();
    const all = this.counterService.counters();

    const filtered = term
      ? all.filter((counter) => counter.name.toLowerCase().includes(term))
      : all;

    return [...filtered].sort((a, b) => this.compare(a, b, mode));
  });

  async ngOnInit(): Promise<void> {
    await this.counterService.initialize();
  }

  onSearchInput(event: CustomEvent): void {
    const detail = event.detail as { value?: string | null };
    this.searchTerm.set(detail.value ?? '');
  }

  onSortChange(event: CustomEvent): void {
    const detail = event.detail as { value?: string | null };

    if (
      detail.value === 'newest' ||
      detail.value === 'name' ||
      detail.value === 'value'
    ) {
      this.sortMode.set(detail.value);
    }
  }

  async remove(counter: SavedCounter): Promise<void> {
    await this.counterService.remove(counter.id);

    const toast = await this.toastController.create({
      message: `Removed "${counter.name}".`,
      duration: 1500,
      position: 'bottom',
      color: 'danger',
    });

    await toast.present();
  }

  async clear(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Clear history',
      message: 'This will permanently delete all saved counters. Continue?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Clear',
          role: 'destructive',
          handler: () => {
            void this.performClear();
          },
        },
      ],
    });

    await alert.present();
  }

  private async performClear(): Promise<void> {
    await this.counterService.clear();

    const toast = await this.toastController.create({
      message: 'History cleared.',
      duration: 1500,
      position: 'bottom',
      color: 'medium',
    });

    await toast.present();
  }

  private compare(a: SavedCounter, b: SavedCounter, mode: SortMode): number {
    switch (mode) {
      case 'newest':
        return b.createdAt.localeCompare(a.createdAt);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'value':
        return a.value - b.value;
    }
  }
}