import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Advisor } from '../academic.models';
import { from, Observable, map } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AdvisorService {
    constructor(private supabase: SupabaseService) { }

    getAdvisorsBySubject(subjectName: string): Observable<Advisor[]> {
        return from(
            this.supabase.client
                .from('users')
                .select(`
                  id,
                  full_name,
                  email,
                  rating,
                  availability,
                  advisor_specializations (
                    subjects (
                      name
                    )
                  )
                `)
                .eq('role', 'advisor')
        ).pipe(
            map((response: any) => {
                if (response.error) {
                    console.error('Supabase Error:', response.error);
                    throw response.error;
                }

                console.log('Raw Users Data:', response.data); // Debug log

                // Filter in memory to avoid complex nested filtering issues
                const filtered = response.data
                    .filter((user: any) =>
                        user.advisor_specializations &&
                        user.advisor_specializations.some((s: any) => s.subjects && s.subjects.name === subjectName)
                    );

                console.log(`Advisors for ${subjectName}:`, filtered); // Debug log

                return filtered.map((item: any) => ({
                    id: item.id,
                    name: item.full_name,
                    email: item.email,
                    rating: item.rating,
                    availability: item.availability,
                    specializations: item.advisor_specializations.map((s: any) => s.subjects?.name || ''),
                }));
            })
        );
    }
}
