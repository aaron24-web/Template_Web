import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { from, Observable, map, switchMap, of } from 'rxjs';
import { Enrollment, TutoringRequest, EnrollmentSubject, EnrollmentStatus } from '../academic.models';

@Injectable({
    providedIn: 'root',
})
export class EnrollmentService {
    constructor(private supabase: SupabaseService) { }

    /**
     * Creates a new 'draft' enrollment from a tutoring request.
     */
    createEnrollmentFromRequest(request: TutoringRequest): Observable<Enrollment> {
        console.log('[ENROLLMENT_SERVICE] Creating enrollment from request:', request);
        
        return from(this.supabase.client.auth.getUser()).pipe(
            switchMap(userResponse => {
                const userId = userResponse.data.user?.id || 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
                if (!userResponse.data.user) {
                    console.warn('[ENROLLMENT_SERVICE] User not authenticated. Using fallback user ID for development.');
                }
                console.log('[ENROLLMENT_SERVICE] Using user ID:', userId);

                const newEnrollment = {
                    request_id: request.id,
                    student_id: request.student_id,
                    status: 'draft' as const,
                    created_by: userId,
                };
                
                console.log('[ENROLLMENT_SERVICE] Inserting enrollment:', newEnrollment);

                const query = this.supabase.client
                    .from('enrollments')
                    .insert(newEnrollment)
                    .select()
                    .single();

                return from(query).pipe(
                    map(response => {
                        console.log('[ENROLLMENT_SERVICE] Insert response:', response);
                        if (response.error) {
                            console.error('[ENROLLMENT_SERVICE] Database error:', response.error);
                            throw response.error;
                        }
                        console.log('[ENROLLMENT_SERVICE] Enrollment created successfully:', response.data);
                        return response.data as Enrollment;
                    })
                );
            })
        );
    }

    /**
     * Retrieves a single enrollment by its ID, with related data.
     */
    getEnrollmentById(id: string): Observable<Enrollment> {
        const query = this.supabase.client
            .from('enrollments')
            .select(`
                *,
                student:students (*, client:clients(*)),
                subjects:enrollment_subjects (*, subject:subjects(*), advisor:users(*))
            `)
            .eq('id', id)
            .single();

        return from(query).pipe(
            map(response => {
                if (response.error) {
                    console.error('Error fetching enrollment:', response.error);
                    throw response.error;
                }
                return response.data as Enrollment;
            })
        );
    }

    /**
     * Adds a new subject to an existing enrollment.
     */
    addSubjectToEnrollment(enrollmentId: string, subjectId: number, advisorId: string): Observable<EnrollmentSubject> {
        const newEnrollmentSubject = {
            enrollment_id: enrollmentId,
            subject_id: subjectId,
            advisor_id: advisorId,
            status: 'pending' as const,
        };

        const query = this.supabase.client
            .from('enrollment_subjects')
            .insert(newEnrollmentSubject)
            .select('*, subject:subjects(*), advisor:users(*)')
            .single();

        return from(query).pipe(
            map(response => {
                if (response.error) throw response.error;
                return response.data as EnrollmentSubject;
            })
        );
    }

    /**
     * Removes a subject from an enrollment.
     */
    removeSubjectFromEnrollment(enrollmentSubjectId: string): Observable<void> {
        const query = this.supabase.client
            .from('enrollment_subjects')
            .delete()
            .eq('id', enrollmentSubjectId);

        return from(query).pipe(
            map(response => {
                if (response.error) throw response.error;
            })
        );
    }

    /**
     * Updates the status of an enrollment.
     */
    updateEnrollmentStatus(enrollmentId: string, status: EnrollmentStatus): Observable<void> {
        const query = this.supabase.client
            .from('enrollments')
            .update({ status })
            .eq('id', enrollmentId);

        return from(query).pipe(
            map(response => {
                if (response.error) throw response.error;
            })
        );
    }
}
