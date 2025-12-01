import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { TutoringRequest, RequestStatus } from '@pages/academic/academic.models';
import { from, Observable, map, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class RequestService {
    private selectedRequestSource = new BehaviorSubject<TutoringRequest | null>(null);
    public selectedRequest$ = this.selectedRequestSource.asObservable();

    constructor(private supabase: SupabaseService) { }

    selectRequest(request: TutoringRequest): void {
        this.selectedRequestSource.next(request);
    }

    clearSelection(): void {
        this.selectedRequestSource.next(null);
    }

    getRequests(): Observable<TutoringRequest[]> {
        // Fetch requests with nested student and client data
        const query = this.supabase.client
            .from('tutoring_requests')
            .select(`
                id,
                client_id,
                student_id,
                need_description,
                status,
                created_at,
                client:clients (
                    id,
                    full_name,
                    email,
                    phone
                ),
                student:students (
                    id,
                    full_name,
                    grade
                )
            `)
            .order('created_at', { ascending: false });

        return from(query).pipe(
            map(response => {
                if (response.error) {
                    console.error('Error fetching requests:', response.error);
                    throw response.error;
                }
                // The data is cast to TutoringRequest[] and returned.
                // Supabase's postgrest-js client automatically handles the nesting
                // based on the `select` query, so direct casting is safe here.
                return response.data as TutoringRequest[];
            })
        );
    }

    updateStatus(id: string, status: RequestStatus): Observable<void> {
        return from(
            this.supabase.client
                .from('tutoring_requests')
                .update({ status })
                .eq('id', id)
        ).pipe(
            map((response: any) => {
                if (response.error) throw response.error;
            })
        );
    }
}
