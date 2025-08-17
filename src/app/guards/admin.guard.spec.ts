import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { AdminGuard } from './admin.guard';


describe('adminGuard', () => {
  let adminGuard: AdminGuard;
  const executeGuard = () =>
    TestBed.runInInjectionContext(() => adminGuard.canActivate());
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminGuard]
    });
    adminGuard = TestBed.inject(AdminGuard);
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
