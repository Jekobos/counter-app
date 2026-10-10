import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SavedCounter } from '../models/saved-counter';
import { CounterService } from '../services/counter.service';
import { Tab1Page } from './tab1.page';

describe('Tab1Page', () => {
  let component: Tab1Page;
  let fixture: ComponentFixture<Tab1Page>;
  let addSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    addSpy = vi.fn().mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      providers: [{ provide: CounterService, useValue: { add: addSpy } }],
    });

    fixture = TestBed.createComponent(Tab1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should delegate saved counters to CounterService.add', async () => {
    const counter: SavedCounter = {
      id: 'first',
      name: 'First',
      value: 1,
      createdAt: '2026-10-10T08:00:00.000Z',
    };

    await component.onSaved(counter);

    expect(addSpy).toHaveBeenCalledWith(counter);
  });
});