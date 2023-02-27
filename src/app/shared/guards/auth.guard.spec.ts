import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { IPublicClientApplication } from '@azure/msal-browser';
import { NbAuthService } from '@nebular/auth';
import { NbAccessChecker, NbAclService } from '@nebular/security';
import { CommonTestingModule } from 'app/../common-testing.module';
import { cloneDeep } from 'lodash';
import { Observable, of, take } from 'rxjs';

import { externalMockedConfigs } from '../mocked-data/mocked-config';
import { externalMockedUsers } from '../mocked-data/mocked-users';
import { ConfigService } from '../services/config.service';
import { AuthGuard } from './auth.guard';

import { PlatformConfig } from '@models/platformConfig';
import { User } from '@models/user';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let router: jasmine.SpyObj<Router>;
  let httpMock: HttpTestingController;
  let configService: ConfigService;
  let mockedUsers: User[];
  let mockedConfigs: PlatformConfig[];
  const next = new ActivatedRouteSnapshot();
  const childRoute = new ActivatedRouteSnapshot();
  const nbAuthServiceSpy = jasmine.createSpyObj<NbAuthService>('NbAuthService', ['isAuthenticated']);
  const nbAclServiceSpy = jasmine.createSpyObj<NbAclService>('NbAclService', ['setAccessControl']);
  const nbAccessCheckerSpy = jasmine.createSpyObj<NbAccessChecker>('NbAccessChecker', ['isGranted']);
  const instanceSpy = jasmine.createSpyObj<IPublicClientApplication>('IPublicClientApplication', [
    'getAllAccounts',
    'getActiveAccount',
    'setActiveAccount',
    'loginPopup',
  ]);
  const msAuthServiceSpy = jasmine.createSpyObj<MsalService>('MsalService', [], {
    instance: instanceSpy,
  });

  const stateSpy = jasmine.createSpyObj('RouterStateSnapshot', ['toString']);

  CommonTestingModule.setUpTestBed();

  beforeEach(() => {
    TestBed.overrideProvider(NbAuthService, { useValue: nbAuthServiceSpy });
    TestBed.overrideProvider(NbAclService, { useValue: nbAclServiceSpy });
    TestBed.overrideProvider(MsalService, { useValue: msAuthServiceSpy });
    TestBed.overrideProvider(NbAccessChecker, { useValue: nbAccessCheckerSpy });
    nbAclServiceSpy.setAccessControl.and.returnValue();
    guard = TestBed.inject(AuthGuard);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    httpMock = TestBed.inject(HttpTestingController);
    configService = TestBed.inject(ConfigService);
    mockedConfigs = cloneDeep(externalMockedConfigs) as any;
    mockedUsers = cloneDeep(externalMockedUsers);
    configService.getConfig().pipe(take(1)).subscribe();
    const req = httpMock.expectOne('/api/config/all');
    expect(req.request.method).toBe('POST');
    req.flush(mockedConfigs);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should be not authenticated and redirected to auth/login', (done: DoneFn) => {
    nbAuthServiceSpy.isAuthenticated.and.returnValue(of(false));
    instanceSpy.getAllAccounts.and.returnValue([]);
    spyOn(router, 'navigate');
    (guard.canActivate(next, stateSpy) as Observable<boolean>).subscribe((result) => {
      expect(result).toBe(false, 'user is not authenticated');
      expect(router.navigate).toHaveBeenCalledWith(['auth/login']);
      done();
    });
  });

  it('should be authenticated and not redirected to auth/login', (done: DoneFn) => {
    nbAuthServiceSpy.isAuthenticated.and.returnValue(of(true));
    instanceSpy.getAllAccounts.and.returnValue([
      {
        homeAccountId: mockedUsers[0]._id,
        environment: '',
        tenantId: mockedUsers[0]._id,
        name: mockedUsers[0].fullName,
        username: mockedUsers[0].email,
        localAccountId: mockedUsers[0]._id,
      },
    ]);
    instanceSpy.getActiveAccount.and.returnValue({
      homeAccountId: mockedUsers[0]._id,
      environment: '',
      tenantId: mockedUsers[0]._id,
      name: mockedUsers[0].fullName,
      username: mockedUsers[0].email,
      localAccountId: mockedUsers[0]._id,
    });
    spyOn(router, 'navigate');
    (guard.canActivate(next, stateSpy) as Observable<boolean>).subscribe((result) => {
      expect(result).toBe(true, 'user is authenticated');
      expect(router.navigate).not.toHaveBeenCalled();
      done();
    });
    const req = httpMock.expectOne('/api/auth/id');
    expect(req.request.method).toBe('POST');
    setTimeout(() => {
      req.flush(mockedUsers[0].company ? mockedUsers[0].company : '');
    }, 50);
  });

  it('should allow navigate to childRoute', (done: DoneFn) => {
    nbAccessCheckerSpy.isGranted.and.returnValue(of(true));
    childRoute.data = { permission: 'elo-principal', resource: 'test' };
    spyOn(router, 'navigate');
    (guard.canActivateChild(childRoute, stateSpy) as Observable<boolean>).subscribe((result) => {
      expect(result).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
      done();
    });
  });

  it('should deny navigate to childRoute', (done: DoneFn) => {
    nbAccessCheckerSpy.isGranted.and.returnValue(of(false));
    childRoute.data = { permission: 'test', resource: 'test' };
    spyOn(router, 'navigate');
    (guard.canActivateChild(childRoute, stateSpy) as Observable<boolean>).subscribe((result) => {
      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/']);
      done();
    });
  });

  it('loadList should work', (done: DoneFn) => {
    const accessControl = {
      Administrador: { parent: 'Diretor de T.I' },
      Membro: { parent: 'Associado' },
      Financeiro: { parent: 'Diretor Financeiro' },
    };
    guard
      .loadList()
      .pipe(take(1))
      .subscribe((obj) => {
        expect(obj).toEqual(accessControl);
        done();
      });
  });
});
