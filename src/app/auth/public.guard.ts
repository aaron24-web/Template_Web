import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../core/services/supabase.service';

export const publicGuard: CanActivateFn = async (route, state) => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  if (await supabaseService.isAuthenticated()) {
    return router.parseUrl('/pages/dashboard');
  }

  return true;
};
