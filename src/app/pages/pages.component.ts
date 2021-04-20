import {
  Component,
  DoCheck,
  AfterViewInit,
  OnDestroy,
  ViewChild,
} from '@angular/core';

import { MENU_ITEMS, SOCIAL_ITEMS } from './pages-menu';
import { Router } from '@angular/router';
import {
  NbIconLibraries,
  NbSidebarService,
  NbMenuService,
} from '@nebular/theme';
import { LayoutService } from '../@core/utils';
import { takeUntil, take } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { OneColumnLayoutComponent } from '../@theme/layouts';
import { NbAccessChecker } from '@nebular/security';

@Component({
  selector: 'ngx-pages',
  styleUrls: ['pages.component.scss'],
  template: `
    <ngx-one-column-layout>
      <nb-menu [items]="menu" tag="main" slot="main"></nb-menu>
      <nb-menu
        [items]="social"
        tag="social"
        slot="social"
        style="position: absolute; bottom: 0;width: 100%;"
      ></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})
export class PagesComponent implements OnDestroy, DoCheck, AfterViewInit {
  private destroy$ = new Subject<void>();
  @ViewChild(OneColumnLayoutComponent, { static: false })
  private layout: OneColumnLayoutComponent;
  menu = MENU_ITEMS;
  social = SOCIAL_ITEMS;

  constructor(
    private router: Router,
    private iconsLibrary: NbIconLibraries,
    private layoutService: LayoutService,
    private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private accessChecker: NbAccessChecker
  ) {
    this.accessChecker
      .isGranted('elo-principal', 'view-users')
      .pipe(take(1))
      .subscribe((isGranted) => {
        if (isGranted)
          this.menu.push({
            title: 'Associados',
            icon: {
              icon: 'users',
              pack: 'fac',
            },
            link: '/pages/users',
            pathMatch: 'full',
          });
      });
    iconsLibrary.registerFontPack('ion', {
      packClass: 'ion',
      iconClassPrefix: 'ion',
    });
    iconsLibrary.registerFontPack('fa', {
      packClass: 'fa',
      iconClassPrefix: 'fa',
    });
    iconsLibrary.registerFontPack('far', {
      packClass: 'far',
      iconClassPrefix: 'fa',
    });
    iconsLibrary.registerSvgPack('fac', {
      backspace:
        '<svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" style="top: 2px; position: relative"><path fill="currentColor" d="M469.66 181.65l-11.31-11.31c-3.12-3.12-8.19-3.12-11.31 0L384 233.37l-63.03-63.03c-3.12-3.12-8.19-3.12-11.31 0l-11.31 11.31c-3.12 3.12-3.12 8.19 0 11.31L361.38 256l-63.03 63.03c-3.12 3.12-3.12 8.19 0 11.31l11.31 11.31c3.12 3.12 8.19 3.12 11.31 0L384 278.63l63.03 63.03c3.12 3.12 8.19 3.12 11.31 0l11.31-11.31c3.12-3.12 3.12-8.19 0-11.31L406.63 256l63.03-63.03a8.015 8.015 0 0 0 0-11.32zM576 64H205.26C188.28 64 172 70.74 160 82.74L9.37 233.37c-12.5 12.5-12.5 32.76 0 45.25L160 429.25c12 12 28.28 18.75 45.25 18.75H576c35.35 0 64-28.65 64-64V128c0-35.35-28.65-64-64-64zm32 320c0 17.64-14.36 32-32 32H205.26c-8.55 0-16.58-3.33-22.63-9.37L32 256l150.63-150.63c6.04-6.04 14.08-9.37 22.63-9.37H576c17.64 0 32 14.36 32 32v256z" class=""></path></svg>',
      users:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" height="22px" style="margin-left: -7px"><path fill="currentColor" d="m 544,224 c 44.2,0 80,-35.8 80,-80 0,-44.2 -35.8,-80 -80,-80 -44.2,0 -80,35.8 -80,80 0,44.2 35.8,80 80,80 z m 0,-128 c 26.5,0 48,21.5 48,48 0,26.5 -21.5,48 -48,48 -26.5,0 -48,-21.5 -48,-48 0,-26.5 21.5,-48 48,-48 z M 320,256 C 381.9,256 432,205.9 432,144 432,82.1 381.9,32 320,32 258.1,32 208,82.1 208,144 c 0,61.9 50.1,112 112,112 z m 0,-192 c 44.1,0 80,35.9 80,80 0,44.1 -35.9,80 -80,80 -44.1,0 -80,-35.9 -80,-80 0,-44.1 35.9,-80 80,-80 z m 244,192 h -40 c -15.2,0 -29.3,4.8 -41.1,12.9 9.4,6.4 17.9,13.9 25.4,22.4 4.9,-2.1 10.2,-3.3 15.7,-3.3 h 40 c 24.2,0 44,21.5 44,48 0,8.8 7.2,16 16,16 8.8,0 16,-7.2 16,-16 0,-44.1 -34.1,-80 -76,-80 z M 96,224 c 44.2,0 80,-35.8 80,-80 0,-44.2 -35.8,-80 -80,-80 -44.2,0 -80,35.8 -80,80 0,44.2 35.8,80 80,80 z M 96,96 c 26.5,0 48,21.5 48,48 0,26.5 -21.5,48 -48,48 -26.5,0 -48,-21.5 -48,-48 0,-26.5 21.5,-48 48,-48 z m 304.1,180 c -33.4,0 -41.7,12 -80.1,12 -38.4,0 -46.7,-12 -80.1,-12 -36.3,0 -71.6,16.2 -92.3,46.9 -12.4,18.4 -19.6,32.54545 -19.6,56.34545 v 1.61818 c 0,26.5 21.5,48 48,48 h 273.22727 c 26.5,0 48,-21.5 48,-48 v -1.61818 c 0,-23.8 -7.2,-37.94545 -19.6,-56.34545 C 456.92727,292.2 436.4,276 400.1,276 Z m 65.12727,104.86363 c 0,8.8 -7.2,16 -16,16 H 176 c -8.8,0 -16,-7.2 -16,-16 v -1.61818 c 0,-16.6 4.9,-24.74545 14.1,-38.44545 13.8,-20.5 38.4,-32.8 65.7,-32.8 27.4,0 37.2,12 80.2,12 43,0 52.8,-12 80.1,-12 27.3,0 37.12727,12.3 50.92727,32.8 9.2,13.7 14.1,21.84545 14.1,38.44545 v 1.61818 z M 157.1,268.9 C 145.2,260.8 131.1,256 116,256 H 76 c -41.9,0 -76,35.9 -76,80 0,8.8 7.2,16 16,16 8.8,0 16,-7.2 16,-16 0,-26.5 19.8,-48 44,-48 h 40 c 5.5,0 10.8,1.2 15.7,3.3 7.5,-8.5 16.1,-16 25.4,-22.4 z"</path></svg>',
      glassfrog:
        '<svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 167.28 141.56" width="20" height="20"><defs></defs><path  fill="currentColor" d="M130.91 109.08a12 12 0 0 0 4.95-6.61 9.94 9.94 0 0 1 1.69-3.22c2.18-2.44 1.48-4.86.09-7.21a109.13 109.13 0 0 0-7.52-10.89 12.21 12.21 0 0 1-2.26-5.4 1.82 1.82 0 0 1 .66-1.85c2.47-2.19 7.06-1 7.61 2.23.63 3.7 2.7 6.64 4.31 9.83.5 1 1.29 2.4 2.43 2.14s1.42-1.82 1.47-3.08c.11-3.36.83-6.68.72-10.07-.06-1.69-.18-3.36-.32-5-.19-2.22.83-3.55 2.83-3.89a4.14 4.14 0 0 1 4.3 2.58 7.25 7.25 0 0 1-.45 6.23 6.47 6.47 0 0 0-.85 3.33c0 2.9.26 5.81-.24 8.7a1.57 1.57 0 0 0 .6 1.71c.59.39 1.14.06 1.62-.26 2.64-1.79 5.39-3.46 7.55-5.86a3.64 3.64 0 0 1 4.2-1.28 4.51 4.51 0 0 1 3 3.77c.29 1.6-1.89 4.34-3.86 4.55-3.37.36-5.85 2.42-8.53 4.1-6.34 4-10.63 9.71-14.36 16-1.3 2.21-3.25 4-4.6 6.3-2.18 3.63-4.51 7.17-6.8 10.73-1.66 2.58-3.49 5-6.85 5.43-2.12.29-2.84-.14-3.49-2.17-1.45-4.51-1-9.07-.45-13.64.35-3.11.61-6.23.88-9.35.05-.63.13-1.39-.58-1.7s-1.14.34-1.52.84c-3 3.92-6.53 7.51-7.73 12.48-.68 2.84-2.09 5.38-2.95 8.14-1.32 4.26-4.34 5.44-8.26 3.29-3.18-1.74-5.68-4.39-8.49-6.63-2.31-1.84-4.52-3.82-6.73-5.77s-5.09-2.46-7.77-3.36c-.43-.15-1-.26-1.22.29s.32.67.62.92a43.44 43.44 0 0 1 6.85 7.82 45.15 45.15 0 0 1 6.16 10.85c.13.32.3.63.43 1 1.49 3.77-.16 6.33-4.24 6.5a22.41 22.41 0 0 1-11.2-2.78c-4.39-2.24-8.6-4.84-13.35-6.36a10.8 10.8 0 0 1-2.92-1.53c-2.85-2-6.07-3.39-9.07-5.15-2-1.15-4.37-1.13-6.62-1.24-4.35-.21-8.7-.25-13.05-.34a18.08 18.08 0 0 0-3 .15 5.47 5.47 0 0 1-6.47-5.45c-.08-3.53 1.37-4.77 4.83-4.14a11.28 11.28 0 0 1 4.52 1.68 6 6 0 0 0 5.09 1.19c1.4-.37 1.65-1.1 1-2.3a19.74 19.74 0 0 0-5-5.26c-3.23-2.65-6.1-5.58-5.93-10.26a3 3 0 0 1 1.54-2.9 2.81 2.81 0 0 1 3.07.55 9.72 9.72 0 0 1 3.69 4.74 11.55 11.55 0 0 0 4.59 5.74c1.28.9 2.44 2 3.71 2.88s2.4.56 2.58-1.19c.24-2.31-.54-4.48-1.07-6.67-.2-.85-.53-1.66-.73-2.51a4.81 4.81 0 0 1 4.49-6.19 3.35 3.35 0 0 1 4 3 10 10 0 0 1 .08 4.14c-.41 1.7.34 3.32.53 5 .33 2.88.54 5.77.76 8.66a2.71 2.71 0 0 0 1.54 2.55c3.33 1.36 6.33 3.44 9.75 4.61.52.18 1.14.62 1.61 0s0-1.22-.33-1.74c-2.69-3.86-5.71-7.47-8.36-11.36-1.81-2.66-3.7-5.31-4.52-8.39-1-3.65-.69-6.17 4.11-6.13 6.38.06 12.21 2.5 18.11 4.8a4.3 4.3 0 0 0-1-3c-2.32-3.27-4.71-6.49-6.91-9.84-1.79-2.56-2.05-5.63-2.46-8.56-.58-4.14-1-8.29-1.47-12.44-.08-.74-.28-1.45-1.11-1.56a2.49 2.49 0 0 0-2.49 1.29c-1 1.68-1.93 3.45-3 5.1-1.9 2.92-3 6.27-5 9.14-1.36 1.92-2.94 2.72-5.17 2.33a8 8 0 0 1-3.71-1.42c-3.68-2.94-8-5-11.45-8.21-2.52-2.3-5.63-3.52-8.66-4.75-5.21-2.11-10.4-4.34-16-5.4A4.15 4.15 0 0 1 0 57.27c.21-1.67 3.07-3 5-2.22a12.69 12.69 0 0 1 3.7 2.32 11.62 11.62 0 0 0 6.78 3.25 2.3 2.3 0 0 0 2.23-.62c.62-.83 0-1.59-.45-2.21a58.21 58.21 0 0 0-3.93-5.11c-2-2.22-3.38-4.86-5.07-7.28a3.15 3.15 0 0 1 1-4.68 7.27 7.27 0 0 1 .89-.55c3.49-1.73 6.13-.27 6.13 3.62a18.86 18.86 0 0 0 2.09 8.53 7.39 7.39 0 0 0 3.53 3.47c1.79.85 3-.06 2.77-2.05a5.46 5.46 0 0 0-.44-1.86c-1.49-2.92-1.55-6.18-2.32-9.26-.39-1.59.31-2.38 1.74-2.87 2.77-.94 4.92-.51 6.31 1.32.56.74.94 1.62.36 2.41-1.52 2.09-1.14 4.46-1 6.74A52 52 0 0 0 31.48 62c.72 2.57 2.66 4.33 4.42 6.16A25.36 25.36 0 0 0 39.59 71c1.61 1.14 2.65.86 3.4-1a50.1 50.1 0 0 0 1.58-4.61c1.68-5.56 4.76-10.44 7.69-15.37a52.68 52.68 0 0 0 2.93-6.69c.58-1.37-.33-2.83-.46-4.27a41.54 41.54 0 0 0-1.1-6.69 10.21 10.21 0 0 0-2.72-5.14c-2.29-2.18-2.12-8-.22-10.24 3.05-3.58 4.58-7.95 6.2-12.31 1.89-5 4.11-5.78 8.49-3.36a37.92 37.92 0 0 1 5.93 4c2 1.64 4.37 2.09 6.81 2.35 4.46.48 8.76 5 7.12 9.94-1.24 3.68-.13 6.39 2.26 9.1s3.8 6 6.57 8.32A24.17 24.17 0 0 0 99 38.56c6.65 3.24 12.63 7.59 18.87 11.49 2.56 1.6 4 1.1 4.71-1.88.83-3.5.5-7 .33-10.58a4.29 4.29 0 0 0-.61-2c-3-4.83-5-10.23-8.5-14.79a7.59 7.59 0 0 1-1.5-3.8 2.41 2.41 0 0 1 2.53-3c2.58-.18 4.13.84 5.09 3.32.76 2 .88 4.08 1.74 6a18.53 18.53 0 0 0 2.62 4.5c.41.49.85 1.07 1.59.77a1.56 1.56 0 0 0 1-1.54c0-1.27-.22-2.54-.27-3.81-.14-4 .27-8-.65-12-.37-1.58-.39-3.32 1.17-4.64 2.23-1.9 5.05-1.57 6.5 1a13.84 13.84 0 0 1 1.19 2.89 2.22 2.22 0 0 1-.61 2.51c-1.75 1.29-2.08 3.1-2.08 5.07a38.06 38.06 0 0 1-.33 5.56 6.84 6.84 0 0 0 .07 2.26c.23 1.17.17 2.67 1.52 3.12s1.9-.92 2.6-1.67c2.28-2.47 4.48-5 6.68-7.56 1.23-1.43 2.4-1.64 4.34-.68 2.1 1 3.66 3.13 3.08 4.54a6.25 6.25 0 0 1-3.47 3.26c-1.22.53-2.45 1.08-3.71 1.5a10.84 10.84 0 0 0-4.63 3.27 85.28 85.28 0 0 0-6.81 8.59 13.46 13.46 0 0 0-2.17 6.54 37.26 37.26 0 0 1-3.94 14.2c-1.35 2.53-2.82 3.21-5.44 2a183.36 183.36 0 0 1-15-7.44 9.2 9.2 0 0 0-2.91-1.47 1.49 1.49 0 0 0-1.47.3c-.44.51-.06 1 .2 1.43 1 1.52 2.05 3 2.93 4.53 1.7 3 3.28 6.15 4.91 9.22 2 3.84 2.07 7.91 1.38 12a54.38 54.38 0 0 0-.52 9.9c0 .51-.09 1.15.53 1.35a1.35 1.35 0 0 0 1.5-.66c.77-1.16 1.42-2.4 2.16-3.58 2.11-3.39 3.88-7 7-9.68 2.36-2 4.76-1.69 6.3 1.09s2.27 6.08 3.07 9.23c1.67 6.56 1.51 13.15.92 19.86z"></path></svg>',
      gtown:
        '<svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="20" height="20"><g transform="translate(0,-197)" id="layer1"><path fill="currentColor" d="m 69.031105,293.0125 c -2.258239,-1.16771 -3.714142,-2.6259 -4.937634,-4.94538 -0.886829,-1.68124 -1.056695,-2.51854 -1.056695,-5.20852 0,-2.68998 0.169866,-3.52727 1.056695,-5.20851 2.12535,-4.02923 5.325989,-5.95343 9.945819,-5.97937 4.572104,-0.0257 7.802764,1.91658 9.945819,5.97937 1.463403,2.7743 1.519102,7.52865 0.119699,10.2167 -1.274503,2.44814 -2.695397,3.89826 -4.943852,5.04555 -2.555664,1.30404 -7.703225,1.35494 -10.129851,0.10016 z m 7.449727,-5.76614 c 2.538753,-1.31284 3.448416,-4.4672 1.981879,-6.8724 -2.026003,-3.32275 -6.820839,-3.32275 -8.846842,0 -2.613872,4.28689 2.317752,9.22385 6.864963,6.8724 z M 45.793126,277.70689 C 38.5881,274.3368 37.01492,264.66888 42.763731,259.08985 c 2.035739,-1.97562 4.547424,-2.87479 8.030285,-2.87479 4.386937,0 7.515194,1.9805 9.73539,6.16349 1.223452,2.30505 1.239722,7.28647 0.03221,9.8627 -2.576555,5.49711 -9.345486,8.0022 -14.768493,5.46564 z m 6.341889,-5.61149 c 0.719384,-0.30057 1.795358,-1.12573 2.39106,-1.83368 1.987284,-2.36175 1.085722,-5.98183 -1.834903,-7.36776 -1.757552,-0.83401 -2.706435,-0.84164 -4.380359,-0.0352 -2.855527,1.37566 -3.876876,4.55238 -2.243691,6.97859 0.894005,1.32811 3.126943,2.80261 4.24624,2.80396 0.282526,3.4e-4 1.102273,-0.2453 1.821653,-0.54588 z m 18.098054,-7.01278 c -2.263551,-1.03185 -4.046449,-2.64256 -5.316533,-4.80308 -0.972613,-1.65448 -1.093944,-2.26082 -1.093944,-5.46677 0,-4.20387 0.630876,-5.85478 3.233068,-8.46046 2.183693,-2.18662 4.974446,-3.12363 8.542874,-2.86831 6.146429,0.43978 10.051916,4.76353 10.051916,11.12844 0,4.88708 -2.225421,8.49688 -6.402648,10.38556 -2.372373,1.07264 -6.757043,1.11379 -9.014733,0.0846 z m 7.052374,-6.16843 c 1.757869,-1.17084 2.918418,-3.48641 2.561599,-5.11099 -0.395867,-1.80238 -2.04572,-3.52503 -3.838374,-4.00774 -1.324035,-0.35653 -1.86996,-0.29577 -3.391935,0.37747 -4.0675,1.79924 -4.121107,6.99615 -0.09265,8.9817 1.812514,0.89335 3.16139,0.82524 4.761357,-0.24044 z m -54.608812,1.56741 c -4.925921,-1.37675 -8.32571,-5.82598 -8.332672,-10.90479 -0.0063,-4.60543 2.972045,-9.03856 7.126336,-10.60719 9.490799,-3.58364 18.352343,5.97096 14.201556,15.31225 -1.128896,2.54057 -2.66932,4.16709 -5.021835,5.30252 -2.600546,1.25514 -5.518105,1.58344 -7.973385,0.89721 z m 5.120327,-6.51279 c 4.909778,-2.32985 3.183898,-9.37274 -2.296814,-9.37274 -1.651415,0 -2.178178,0.20441 -3.391011,1.31589 -4.340645,3.97791 0.332852,10.59795 5.687825,8.05685 z m 18.919998,-6.32726 c -1.976514,-0.5321 -2.486195,-0.83975 -4.678951,-2.82425 -4.369655,-3.95465 -4.375356,-11.86702 -0.01166,-16.19768 4.190088,-4.15837 11.476913,-4.13223 15.665343,0.0562 2.252232,2.25224 3.126638,4.47417 3.12209,7.93349 -0.0049,3.71414 -1.097025,6.26822 -3.703549,8.66109 -2.864477,2.62967 -6.419944,3.44083 -10.393262,2.37115 z m 5.733831,-6.54246 c 0.64467,-0.38081 1.543723,-1.46 1.997893,-2.39819 0.694419,-1.43448 0.754822,-1.91382 0.379749,-3.01366 -0.856692,-2.51211 -2.630247,-3.91212 -4.95592,-3.91212 -2.121186,0 -3.738009,1.05826 -4.721841,3.09058 -0.694987,1.43566 -0.755622,1.91832 -0.382881,3.04775 0.442948,1.34214 2.096915,3.18418 3.228941,3.59609 1.238688,0.45073 3.321052,0.25884 4.454059,-0.41045 z m 17.736347,-6.366 c -2.28515,-0.81044 -4.809905,-3.08462 -5.97331,-5.3805 -3.880743,-7.65827 1.353852,-16.55113 9.753821,-16.57042 7.96801,-0.0183 13.005679,7.0603 10.655883,14.97293 -0.881765,2.96921 -4.022602,6.11005 -6.991819,6.99181 -2.598387,0.77164 -5.243682,0.76673 -7.444575,-0.0138 z m 7.288328,-7.06492 c 4.388147,-4.02144 -0.564471,-10.84116 -5.877714,-8.09357 -4.790345,2.47718 -2.768429,9.3896 2.747919,9.39444 1.370399,0.001 1.990004,-0.25633 3.129795,-1.30087 z m -47.387327,2.70416 c -1.61901,-1.134 -1.494519,-2.38877 1.03546,-10.43661 l 2.386789,-7.59236 -2.172216,-4.12886 c -3.167043,-6.01978 -2.931167,-8.25497 0.845967,-8.01645 l 1.990002,0.12567 2.313484,4.44146 2.313484,4.44146 7.50256,2.33727 c 4.59987,1.43299 7.773825,2.63824 8.203703,3.1152 0.8689,0.96406 0.90679,3.02185 0.07745,4.20591 -0.918421,1.31122 -2.370266,1.14903 -9.511553,-1.06261 -3.468501,-1.07418 -6.361096,-1.84044 -6.427986,-1.70278 -0.06689,0.13765 -0.993502,3.13499 -2.059136,6.66075 -2.02122,6.68742 -2.903583,8.21343 -4.749125,8.21343 -0.489581,0 -1.276577,-0.27067 -1.74888,-0.60148 z" class=""></path></g></svg>',
      scale:
        '<svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" style="top: 2px; position: relative"><path fill="currentColor" d="M634.4 279.09L525.35 103.12C522.18 98.38 517.09 96 512 96s-10.18 2.38-13.35 7.12L389.6 279.09c-3.87 5.78-6.09 12.72-5.51 19.64C389.56 364.4 444.74 416 512 416s122.44-51.6 127.91-117.27c.58-6.92-1.64-13.86-5.51-19.64zM512 384c-41.58 0-77.55-27.13-90.78-64h181.2C589 357.23 553.28 384 512 384zm-90.27-96l90.31-145.76L602.98 288H421.73zM536 480H336V125.74c27.56-7.14 48-31.95 48-61.74h152c4.42 0 8-3.58 8-8V40c0-4.42-3.58-8-8-8H374.89c-.15-.26-4.37-11.11-19.11-21.07C345.57 4.03 333.25 0 320 0s-25.57 4.03-35.78 10.93c-14.74 9.96-18.96 20.81-19.11 21.07H104c-4.42 0-8 3.58-8 8v16c0 4.42 3.58 8 8 8h152c0 29.79 20.44 54.6 48 61.74V480H104c-4.42 0-8 3.58-8 8v16c0 4.42 3.58 8 8 8h432c4.42 0 8-3.58 8-8v-16c0-4.42-3.58-8-8-8zM288 64c0-17.67 14.33-32 32-32s32 14.33 32 32-14.33 32-32 32-32-14.33-32-32zm-32.09 234.73c.58-6.92-1.64-13.86-5.51-19.64L141.35 103.12C138.18 98.38 133.09 96 128 96s-10.18 2.38-13.35 7.12L5.6 279.09c-3.87 5.78-6.09 12.72-5.51 19.64C5.56 364.4 60.74 416 128 416s122.44-51.6 127.91-117.27zM128.04 142.24L218.98 288H37.73l90.31-145.76zM37.22 320h181.2C205 357.23 169.28 384 128 384c-41.58 0-77.55-27.13-90.78-64z" class=""></path></svg>',
      onedrive:
        '<svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" style="top: 2px; position: relative"><path fill="currentColor" d="M571.7 238.8c2.8-9.9 4.3-20.2 4.3-30.8 0-61.9-50.1-112-112-112-16.7 0-32.9 3.6-48 10.8-31.6-45-84.3-74.8-144-74.8-94.4 0-171.7 74.5-175.8 168.2C39.2 220.2 0 274.3 0 336c0 79.6 64.4 144 144 144h368c70.7 0 128-57.2 128-128 0-47-25.8-90.8-68.3-113.2zM512 448H144c-61.9 0-112-50.1-112-112 0-56.8 42.2-103.7 97-111-.7-5.6-1-11.3-1-17 0-79.5 64.5-144 144-144 60.3 0 111.9 37 133.4 89.6C420 137.9 440.8 128 464 128c44.2 0 80 35.8 80 80 0 18.5-6.3 35.6-16.9 49.2C573 264.4 608 304.1 608 352c0 53-43 96-96 96z" class=""></path></svg>',
      'onedrive-add':
        '<svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" style="top: 2px; position: relative"><path fill="currentColor" d="M571.7 238.8c2.8-9.9 4.3-20.2 4.3-30.8 0-61.9-50.1-112-112-112-16.7 0-32.9 3.6-48 10.8-31.6-45-84.3-74.8-144-74.8-94.4 0-171.7 74.5-175.8 168.2C39.2 220.2 0 274.3 0 336c0 79.6 64.4 144 144 144h368c70.7 0 128-57.2 128-128 0-47-25.8-90.8-68.3-113.2zM512 448H144c-61.9 0-112-50.1-112-112 0-56.8 42.2-103.7 97-111-.7-5.6-1-11.3-1-17 0-79.5 64.5-144 144-144 60.3 0 111.9 37 133.4 89.6C420 137.9 440.8 128 464 128c44.2 0 80 35.8 80 80 0 18.5-6.3 35.6-16.9 49.2C573 264.4 608 304.1 608 352c0 53-43 96-96 96z"/> <g transform="matrix(11.57239,0,0,11.57239,181.13131,163.13131)"><rect transform="rotate(180,12,12)" height="24" width="24" x="0" y="0" style="opacity:0" /><path fill="currentColor" d="M 19,11 H 13 V 5 a 1,1 0 0 0 -2,0 v 6 H 5 a 1,1 0 0 0 0,2 h 6 v 6 a 1,1 0 0 0 2,0 v -6 h 6 a 1,1 0 0 0 0,-2 z" /></g></svg>',
      receipt:
        '<svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style="top: -2px; position: relative"><path fill="currentColor" d="M344 240H104c-4.4 0-8 3.6-8 8v16c0 4.4 3.6 8 8 8h240c4.4 0 8-3.6 8-8v-16c0-4.4-3.6-8-8-8zm0 96H104c-4.4 0-8 3.6-8 8v16c0 4.4 3.6 8 8 8h240c4.4 0 8-3.6 8-8v-16c0-4.4-3.6-8-8-8zM418.1 0c-5.8 0-11.8 1.8-17.3 5.7L357.3 37 318.7 9.2c-8.4-6-18.2-9.1-28.1-9.1-9.8 0-19.6 3-28 9.1L224 37 185.4 9.2C177 3.2 167.1.1 157.3.1s-19.6 3-28 9.1L90.7 37 47.2 5.7C41.8 1.8 35.8 0 29.9 0 14.4.1 0 12.3 0 29.9v452.3C0 499.5 14.3 512 29.9 512c5.8 0 11.8-1.8 17.3-5.7L90.7 475l38.6 27.8c8.4 6 18.2 9.1 28.1 9.1 9.8 0 19.6-3 28-9.1L224 475l38.6 27.8c8.4 6 18.3 9.1 28.1 9.1s19.6-3 28-9.1l38.6-27.8 43.5 31.3c5.4 3.9 11.4 5.7 17.3 5.7 15.5 0 29.8-12.2 29.8-29.8V29.9C448 12.5 433.7 0 418.1 0zM416 477.8L376 449l-18.7-13.5-18.7 13.5-38.6 27.8c-2.8 2-6 3-9.3 3-3.4 0-6.6-1.1-9.4-3.1L242.7 449 224 435.5 205.3 449l-38.6 27.8c-2.8 2-6 3-9.4 3-3.4 0-6.6-1.1-9.4-3.1L109.3 449l-18.7-13.5L72 449l-40 29.4V34.2L72 63l18.7 13.5L109.4 63 148 35.2c2.8-2 6-3 9.3-3 3.4 0 6.6 1.1 9.4 3.1L205.3 63 224 76.5 242.7 63l38.6-27.8c2.8-2 6-3 9.4-3 3.4 0 6.6 1.1 9.4 3.1L338.7 63l18.7 13.5L376 63l40-28.8v443.6zM344 144H104c-4.4 0-8 3.6-8 8v16c0 4.4 3.6 8 8 8h240c4.4 0 8-3.6 8-8v-16c0-4.4-3.6-8-8-8z" class=""></path></svg>',
      minus:
        '<svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M140 274c-6.6 0-12-5.4-12-12v-12c0-6.6 5.4-12 12-12h232c6.6 0 12 5.4 12 12v12c0 6.6-5.4 12-12 12H140zm364-18c0 137-111 248-248 248S8 393 8 256 119 8 256 8s248 111 248 248zm-32 0c0-119.9-97.3-216-216-216-119.9 0-216 97.3-216 216 0 119.9 97.3 216 216 216 119.9 0 216-97.3 216-216z" class=""></path></svg>',
      'file-invoice':
        '<svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M296 400h-80c-4.42 0-8 3.58-8 8v16c0 4.42 3.58 8 8 8h80c4.42 0 8-3.58 8-8v-16c0-4.42-3.58-8-8-8zM80 240v96c0 8.84 7.16 16 16 16h192c8.84 0 16-7.16 16-16v-96c0-8.84-7.16-16-16-16H96c-8.84 0-16 7.16-16 16zm32 16h160v64H112v-64zM369.83 97.98L285.94 14.1c-9-9-21.2-14.1-33.89-14.1H47.99C21.5.1 0 21.6 0 48.09v415.92C0 490.5 21.5 512 47.99 512h287.94c26.5 0 48.07-21.5 48.07-47.99V131.97c0-12.69-5.17-24.99-14.17-33.99zM255.95 51.99l76.09 76.08h-76.09V51.99zM336 464.01H47.99V48.09h159.97v103.98c0 13.3 10.7 23.99 24 23.99H336v287.95zM88 112h80c4.42 0 8-3.58 8-8V88c0-4.42-3.58-8-8-8H88c-4.42 0-8 3.58-8 8v16c0 4.42 3.58 8 8 8zm0 64h80c4.42 0 8-3.58 8-8v-16c0-4.42-3.58-8-8-8H88c-4.42 0-8 3.58-8 8v16c0 4.42 3.58 8 8 8z" class=""></path></svg>',
      'file-invoice-dollar':
        '<svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M369.83 97.98L285.94 14.1c-9-9-21.2-14.1-33.89-14.1H47.99C21.5.1 0 21.6 0 48.09v415.92C0 490.5 21.5 512 47.99 512h287.94c26.5 0 48.07-21.5 48.07-47.99V131.97c0-12.69-5.17-24.99-14.17-33.99zM255.95 51.99l76.09 76.08h-76.09V51.99zM336 464.01H47.99V48.09h159.97v103.98c0 13.3 10.7 23.99 24 23.99H336v287.95zM208 216c0-4.42-3.58-8-8-8h-16c-4.42 0-8 3.58-8 8v24.12c-23.62.63-42.67 20.55-42.67 45.07 0 19.97 12.98 37.81 31.58 43.39l45 13.5c5.16 1.55 8.77 6.78 8.77 12.73 0 7.27-5.3 13.19-11.8 13.19h-28.11c-4.56 0-8.96-1.29-12.82-3.72-3.24-2.03-7.36-1.91-10.13.73l-11.75 11.21c-3.53 3.37-3.33 9.21.57 12.14 9.1 6.83 20.08 10.77 31.37 11.35V424c0 4.42 3.58 8 8 8h16c4.42 0 8-3.58 8-8v-24.12c23.62-.63 42.67-20.54 42.67-45.07 0-19.97-12.98-37.81-31.58-43.39l-45-13.5c-5.16-1.55-8.77-6.78-8.77-12.73 0-7.27 5.3-13.19 11.8-13.19h28.11c4.56 0 8.96 1.29 12.82 3.72 3.24 2.03 7.36 1.91 10.13-.73l11.75-11.21c3.53-3.37 3.33-9.21-.57-12.14-9.1-6.83-20.08-10.77-31.37-11.35V216zM88 112h80c4.42 0 8-3.58 8-8V88c0-4.42-3.58-8-8-8H88c-4.42 0-8 3.58-8 8v16c0 4.42 3.58 8 8 8zm88 56v-16c0-4.42-3.58-8-8-8H88c-4.42 0-8 3.58-8 8v16c0 4.42 3.58 8 8 8h80c4.42 0 8-3.58 8-8z" class=""></path></svg>',
      client:
        '<svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" height="20" style="margin-left: -2px"><path fill="currentColor" d="M224 288c79.5 0 144-64.5 144-144S303.5 0 224 0 80 64.5 80 144s64.5 144 144 144zm0-240c52.9 0 96 43.1 96 96s-43.1 96-96 96-96-43.1-96-96 43.1-96 96-96zm91.9 256.2l-56.5 154.5L240 376l32-56h-96l32 56-19.5 82.7L132 304.2C58.9 305.5 0 365 0 438.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-25.6c0-73.4-58.9-132.9-132.1-134.2zM96 464H48v-25.6c0-35.4 21.9-66.2 53-79.4l38.4 105H96zm304 0h-91.3L347 359c31 13.2 53 44 53 79.4V464z" class=""></path></svg>',
      clients:
        '<svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" height="22px" style="margin-left: -7px"> <path fill="currentColor" d="m 544,224 c 44.2,0 80,-35.8 80,-80 0,-44.2 -35.8,-80 -80,-80 -44.2,0 -80,35.8 -80,80 0,44.2 35.8,80 80,80 z m 0,-128 c 26.5,0 48,21.5 48,48 0,26.5 -21.5,48 -48,48 -26.5,0 -48,-21.5 -48,-48 0,-26.5 21.5,-48 48,-48 z m 20,160 h -40 c -15.2,0 -29.3,4.8 -41.1,12.9 9.4,6.4 17.9,13.9 25.4,22.4 4.9,-2.1 10.2,-3.3 15.7,-3.3 h 40 c 24.2,0 44,21.5 44,48 0,8.8 7.2,16 16,16 8.8,0 16,-7.2 16,-16 0,-44.1 -34.1,-80 -76,-80 z M 96,224 c 44.2,0 80,-35.8 80,-80 0,-44.2 -35.8,-80 -80,-80 -44.2,0 -80,35.8 -80,80 0,44.2 35.8,80 80,80 z M 96,96 c 26.5,0 48,21.5 48,48 0,26.5 -21.5,48 -48,48 -26.5,0 -48,-21.5 -48,-48 0,-26.5 21.5,-48 48,-48 z m 61.1,172.9 C 145.2,260.8 131.1,256 116,256 H 76 c -41.9,0 -76,35.9 -76,80 0,8.8 7.2,16 16,16 8.8,0 16,-7.2 16,-16 0,-26.5 19.8,-48 44,-48 h 40 c 5.5,0 10.8,1.2 15.7,3.3 7.5,-8.5 16.1,-16 25.4,-22.4 z"/><path fill="currentColor" d="m 320,256 c 61.79052,0 111.92277,-50.13205 111.92277,-111.92278 0,-61.79074 -50.13225,-111.92279 -111.92277,-111.92279 -61.79074,0 -111.92279,50.13205 -111.92279,111.92279 C 208.07721,205.86795 258.20926,256 320,256 Z m 0,-186.53798 c 41.11594,0 74.61519,33.49924 74.61519,74.6152 0,41.11615 -33.49925,74.61519 -74.61519,74.61519 -41.11616,0 -74.6152,-33.49904 -74.6152,-74.61519 0,-41.11596 33.49904,-74.6152 74.6152,-74.6152 z m 71.42842,199.12925 -43.91413,120.0839 -15.07843,-64.27791 24.87173,-43.52553 h -74.6152 l 24.87174,43.52553 -15.15624,64.27791 -43.91412,-120.0839 c -56.81639,1.01079 -102.59589,47.25629 -102.59589,104.30587 v 19.89739 c 0,20.59698 16.71061,37.30759 37.30759,37.30759 h 273.58901 c 20.59681,0 37.30766,-16.71061 37.30766,-37.30759 v -19.89739 c 0,-57.04958 -45.77969,-103.29529 -102.67372,-104.30587 z M 220.51307,392.79453 h -37.3076 v -19.89739 c 0,-27.51431 17.02142,-51.45344 41.19376,-61.71293 l 29.84608,81.61032 z m 236.28141,0 h -70.9622 l 29.7683,-81.61032 c 24.09448,10.25949 41.1939,34.19862 41.1939,61.71293 z"/> </svg>',
      home:
        '<svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" preserveAspectRatio="none" width="20" height="20" style="margin-left: -2px"><path fill="currentColor" d="M573.48 219.91L310.6 8a35.85 35.85 0 0 0-45.19 0L2.53 219.91a6.71 6.71 0 0 0-1 9.5l14.2 17.5a6.82 6.82 0 0 0 9.6 1L64 216.72V496a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V216.82l38.8 31.29a6.83 6.83 0 0 0 9.6-1l14.19-17.5a7.14 7.14 0 0 0-1.11-9.7zM240 480V320h96v160zm240 0H368V304a16 16 0 0 0-16-16H224a16 16 0 0 0-16 16v176H96V190.92l187.71-151.4a6.63 6.63 0 0 1 8.4 0L480 191z" class></path></svg>',
      logo:
        '<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" viewBox="0 0 184.44788 221.33725" version="1.1" id="svg8"> <defs id="defs2"> <clipPath id="clipPath4534" clipPathUnits="userSpaceOnUse"> <path inkscape:connector-curvature="0" id="path4532" d="M 0,1000 H 1000 V 0 H 0 Z" /> </clipPath> <clipPath id="clipPath4785" clipPathUnits="userSpaceOnUse"> <path inkscape:connector-curvature="0" id="path4783" d="M 0,1000 H 1000 V 0 H 0 Z" /> </clipPath> </defs> <sodipodi:namedview id="base" pagecolor="#ffffff" bordercolor="#666666" borderopacity="1.0" inkscape:pageopacity="0.0" inkscape:pageshadow="2" inkscape:zoom="0.35" inkscape:cx="-110.0085" inkscape:cy="383.98944" inkscape:document-units="mm" inkscape:current-layer="layer1" showgrid="false" fit-margin-top="0" fit-margin-left="0" fit-margin-right="0" fit-margin-bottom="0" inkscape:window-width="1920" inkscape:window-height="1012" inkscape:window-x="-8" inkscape:window-y="37" inkscape:window-maximized="1" /> <metadata id="metadata5"> <rdf:RDF> <cc:Work rdf:about=""> <dc:format>image/svg+xml</dc:format> <dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" /> <dc:title></dc:title> </cc:Work> </rdf:RDF> </metadata> <g inkscape:label="Layer 1" inkscape:groupmode="layer" id="layer1" transform="translate(-12.097486,-29.093287)"> <g transform="matrix(0.35277777,0,0,-0.35277777,-72.067564,316.15071)" inkscape:label="NORTAN - LOGO" id="g4777"> <g id="g4779"> <g clip-path="url(#clipPath4785)" id="g4781"> <g transform="translate(574.0458,624.2111)" id="g4787"> <path inkscape:connector-curvature="0" id="path4789" style="fill:#065b5d;fill-opacity:1;fill-rule:nonzero;stroke:none" d="m 0,0 -126.33,189.495 -122.808,-368.432 c 1.757,-5.628 3.777,-11.186 6.09,-16.657 9.237,-21.837 22.465,-41.453 39.317,-58.306 7.743,-7.743 16.077,-14.711 24.935,-20.889 l 78.088,234.335 58.19,-87.267 z" /> </g> <g transform="translate(669.0074,571.3824)" id="g4791"> <path inkscape:connector-curvature="0" id="path4793" style="fill:#7abb9e;fill-opacity:1;fill-rule:nonzero;stroke:none" d="m 0,0 c -9.236,21.837 -22.464,41.454 -39.316,58.306 -7.759,7.759 -16.11,14.739 -24.987,20.925 l -78.027,-234.299 -58.189,87.277 -42.644,-127.638 126.44,-189.66 L 6.068,-16.54 C 4.317,-10.951 2.298,-5.434 0,0" /> </g> <g transform="translate(390.1671,322.0059)" id="g4795"> <path inkscape:connector-curvature="0" id="path4797" style="fill:#002f41;fill-opacity:1;fill-rule:nonzero;stroke:none" d="m 0,0 -42.115,-34.722 18.966,51.296 c -46.508,38.358 -76.156,96.427 -76.156,161.42 0,40.218 11.363,77.778 31.038,109.664 l -34.668,42.229 51.266,-19.012 c 11.531,13.999 24.85,26.47 39.603,37.071 l 24.198,72.597 c -95.981,-38.699 -163.721,-132.711 -163.721,-242.549 0,-141.91 113.075,-257.408 254.04,-261.317 l -38.1,57.151 C 41.229,-21.04 19.545,-12.086 0,0" /> </g> <g transform="translate(507.3815,761.3167)" id="g4799"> <path inkscape:connector-curvature="0" id="path4801" style="fill:#002f41;fill-opacity:1;fill-rule:nonzero;stroke:none" d="m 0,0 38.1,-57.151 c 23.115,-5.13 44.793,-14.08 64.333,-26.16 l 42.11,34.718 -18.891,-51.267 -0.799,0.565 c 46.935,-38.351 76.903,-96.684 76.903,-162.022 0,-40.218 -11.362,-77.778 -31.038,-109.663 l 34.668,-42.229 -51.265,19.012 v 0 c -11.54,-14.009 -24.868,-26.487 -39.632,-37.092 l -24.183,-72.582 c 95.988,38.696 163.735,132.712 163.735,242.554 C 254.041,-119.406 140.966,-3.909 0,0" /> </g> </g> </g> </g> </g></svg>',
      logoWhite:
        '<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" viewBox="0 0 184.44788 221.33725" version="1.1" id="svg8"> <defs id="defs2"> <clipPath id="clipPath4534" clipPathUnits="userSpaceOnUse"> <path inkscape:connector-curvature="0" id="path4532" d="M 0,1000 H 1000 V 0 H 0 Z" /> </clipPath> <clipPath id="clipPath4785" clipPathUnits="userSpaceOnUse"> <path inkscape:connector-curvature="0" id="path4783" d="M 0,1000 H 1000 V 0 H 0 Z" /> </clipPath> <clipPath id="clipPath903" clipPathUnits="userSpaceOnUse"> <path inkscape:connector-curvature="0" id="path901" d="M 0,1080 H 1920 V 0 H 0 Z" /> </clipPath> </defs> <sodipodi:namedview id="base" pagecolor="#ffffff" bordercolor="#666666" borderopacity="1.0" inkscape:pageopacity="0.0" inkscape:pageshadow="2" inkscape:zoom="0.35" inkscape:cx="-574.29421" inkscape:cy="570.85498" inkscape:document-units="mm" inkscape:current-layer="layer1" showgrid="false" fit-margin-top="0" fit-margin-left="0" fit-margin-right="0" fit-margin-bottom="0" inkscape:window-width="1920" inkscape:window-height="1012" inkscape:window-x="-8" inkscape:window-y="37" inkscape:window-maximized="1" /> <metadata id="metadata5"> <rdf:RDF> <cc:Work rdf:about=""> <dc:format>image/svg+xml</dc:format> <dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" /> <dc:title></dc:title> </cc:Work> </rdf:RDF> </metadata> <g inkscape:label="Layer 1" inkscape:groupmode="layer" id="layer1" transform="translate(-12.097486,-29.093287)"> <g transform="matrix(0.35277777,0,0,-0.35277777,-72.067564,316.15071)" inkscape:label="NORTAN - LOGO" id="g4777" style="fill:#ffffff;fill-opacity:1"> <g id="g4779" style="fill:#ffffff;fill-opacity:1"> <g clip-path="url(#clipPath4785)" id="g4781" style="fill:#ffffff;fill-opacity:1"> <g transform="translate(574.0458,624.2111)" id="g4787" style="fill:#ffffff;fill-opacity:1"> <path inkscape:connector-curvature="0" id="path4789" style="fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:none" d="m 0,0 -126.33,189.495 -122.808,-368.432 c 1.757,-5.628 3.777,-11.186 6.09,-16.657 9.237,-21.837 22.465,-41.453 39.317,-58.306 7.743,-7.743 16.077,-14.711 24.935,-20.889 l 78.088,234.335 58.19,-87.267 z" /> </g> <g transform="translate(669.0074,571.3824)" id="g4791" style="fill:#ffffff;fill-opacity:1"> <path inkscape:connector-curvature="0" id="path4793" style="fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:none" d="m 0,0 c -9.236,21.837 -22.464,41.454 -39.316,58.306 -7.759,7.759 -16.11,14.739 -24.987,20.925 l -78.027,-234.299 -58.189,87.277 -42.644,-127.638 126.44,-189.66 L 6.068,-16.54 C 4.317,-10.951 2.298,-5.434 0,0" /> </g> <g transform="translate(390.1671,322.0059)" id="g4795" style="fill:#ffffff;fill-opacity:1"> <path inkscape:connector-curvature="0" id="path4797" style="fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:none" d="m 0,0 -42.115,-34.722 18.966,51.296 c -46.508,38.358 -76.156,96.427 -76.156,161.42 0,40.218 11.363,77.778 31.038,109.664 l -34.668,42.229 51.266,-19.012 c 11.531,13.999 24.85,26.47 39.603,37.071 l 24.198,72.597 c -95.981,-38.699 -163.721,-132.711 -163.721,-242.549 0,-141.91 113.075,-257.408 254.04,-261.317 l -38.1,57.151 C 41.229,-21.04 19.545,-12.086 0,0" /> </g> <g transform="translate(507.3815,761.3167)" id="g4799" style="fill:#ffffff;fill-opacity:1"> <path inkscape:connector-curvature="0" id="path4801" style="fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:none" d="m 0,0 38.1,-57.151 c 23.115,-5.13 44.793,-14.08 64.333,-26.16 l 42.11,34.718 -18.891,-51.267 -0.799,0.565 c 46.935,-38.351 76.903,-96.684 76.903,-162.022 0,-40.218 -11.362,-77.778 -31.038,-109.663 l 34.668,-42.229 -51.265,19.012 v 0 c -11.54,-14.009 -24.868,-26.487 -39.632,-37.092 l -24.183,-72.582 c 95.988,38.696 163.735,132.712 163.735,242.554 C 254.041,-119.406 140.966,-3.909 0,0" /> </g> </g> </g> </g> </g> </svg>',
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.menuService
      .onItemSelect()
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: { tag: string; item: any }) => {
        if (this.layout.sidebarRef.nativeElement.classList.contains('expanded'))
          this.toggleSidebar();
      });
  }

  ngDoCheck(): void {
    for (const menu of this.menu.concat(this.social)) {
      if (menu['selected'] && menu['link'] !== this.router.url) {
        menu['selected'] = false;
      }
    }
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();

    return false;
  }
}
