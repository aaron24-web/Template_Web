import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SupabaseService {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    }

    get client(): SupabaseClient {
        return this.supabase;
    }

    async isAuthenticated(): Promise<boolean> {
        const { data } = await this.supabase.auth.getSession();
        return !!data.session;
    }

    async getClientId(): Promise<string | null> {
        const { data: { session } } = await this.supabase.auth.getSession();
        if (!session) {
          return null;
        }
        const { data: client, error } = await this.supabase
          .from('clients')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (error) {
          return null;
        }

        return client.id;
    }

    getDashboardStats() {
        return this.supabase.rpc('get_dashboard_stats');
    }
}
