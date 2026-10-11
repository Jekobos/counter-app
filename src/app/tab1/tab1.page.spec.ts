import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastController } from '@ionic/angular';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SavedCounter } from '../models/saved-counter';
import { CounterService } from '../services/counter.service';
import { Tab1Page } from './tab1.page';

describe('Tab1Page', () => {
  let component: Tab1Page;
  let fixture: ComponentFixture<Tab1Page>;
  let addSpy: ReturnType<typeof vi.fn>;
  let toastCreateSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    addSpy = vi.fn().mockResolvedValue(undefined);

    const presentSpy = vi.fn().mockResolvedValue(undefined);
    toastCreateSpy = vi.fn().mockResolvedValue({ present: presentSpy });

    TestBed.configureTestingModule({
      providers: [
        { provide: CounterService, useValue: { add: addSpy } },
        { provide: ToastController, useValue: { create: toastCreateSpy } },
      ],
    });

    fixture = TestBed.createComponent(Tab1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should delegate to CounterService.add and show a toast', async () => {
    const counter: SavedCounter = {
      id: 'first',
      name: 'First',
      value: 1,
      createdAt: '2026-10-10T08:00:00.000Z',
    };

    await component.onSaved(counter);

    expect(addSpy).toHaveBeenCalledWith(counter);
    expect(toastCreateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ color: 'success' }),
    );
  });
});