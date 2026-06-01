import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, shareReplay, catchError } from 'rxjs';

export interface EiaLookupItem {
  
  text: string;
  
  plantCode: string;
  
  generatorId: string;
  
  thirdValue?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EiaLookupService {

  private allItems$: Observable<EiaLookupItem[]> | null = null;
  private cachedItems: EiaLookupItem[] = [];
  private loaded = false;

  constructor(private http: HttpClient) {}

  
  loadAll(): Observable<EiaLookupItem[]> {
    if (this.loaded && this.cachedItems.length > 0) {
      return of(this.cachedItems);
    }

    if (!this.allItems$) {
      this.allItems$ = this.http.get<string[][]>('assets/eia-data.json').pipe(
        map(data => data.map(row => ({
          plantCode: row[0],
          generatorId: row[1],
          thirdValue: row[2],
          text: row[3]
        }))),
        catchError(err => {
          console.error('[EiaLookupService] Failed to load eia-data.json:', err);
          return of([]);
        }),
        shareReplay(1)
      );

      this.allItems$.subscribe(items => {
        this.cachedItems = items;
        this.loaded = true;
        console.log(`[EiaLookupService] Loaded ${items.length} EIA items`);
      });
    }

    return this.allItems$;
  }

  
  search(term: string, maxResults = 100): EiaLookupItem[] {
    if (!term || term.trim().length < 1) return [];
    const lower = term.toLowerCase().trim();
    const results: EiaLookupItem[] = [];

    for (const item of this.cachedItems) {
      if (item.text.toLowerCase().includes(lower) || item.plantCode.includes(lower) || item.generatorId.toLowerCase().includes(lower)) {
        results.push(item);
        if (results.length >= maxResults) break;
      }
    }

    return results;
  }

  
  searchByPlantCode(plantCode: string, maxResults = 100): EiaLookupItem[] {
    if (!plantCode) return [];
    const results: EiaLookupItem[] = [];
    for (const item of this.cachedItems) {
      if (item.plantCode === plantCode) {
        results.push(item);
        if (results.length >= maxResults) break;
      }
    }
    return results;
  }

  
  findByText(text: string): EiaLookupItem | undefined {
    return this.cachedItems.find(item => item.text === text);
  }
}
