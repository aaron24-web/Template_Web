import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { from, Observable, map } from 'rxjs';

export interface Subject {
    id: number;
    name: string;
    icon: string;
    color: string;
    description: string;
    selected?: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class SubjectService {
    constructor(private supabase: SupabaseService) { }

    getSubjects(): Observable<Subject[]> {
        return from(
            this.supabase.client
                .from('subjects')
                .select('*')
                .order('name')
        ).pipe(
            map((response: any) => {
                console.log('SubjectService Raw Response:', response);
                if (response.error) {
                    console.error('SubjectService Error:', response.error);
                    throw response.error;
                }
                console.log('SubjectService Data:', response.data);
                return response.data.map((s: any) => ({
                    ...s,
                    selected: false // Initialize selection state
                }));
            })
        );
    }
}
